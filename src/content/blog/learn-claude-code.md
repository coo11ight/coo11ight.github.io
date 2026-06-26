---
title: "从一个循环看懂 AI Agent：learn-claude-code s20 综合篇总结"
description: "一句话总结：Agent 的聪明不在于“多了一个大脑”，而在于一个循环 + 一整套 harness（ harness 即围绕模型运行的支撑系统） 把感知、记忆、工具、权限、计划、协作、错误恢复全部串了起来。"
publishDate: 2026-06-26
tags: [ai, agent, claude-code]
comment: true
---

> **一句话总结**：Agent 的聪明不在于“多了一个大脑”，而在于**一个循环 + 一整套 harness（ harness 即围绕模型运行的支撑系统）** 把感知、记忆、工具、权限、计划、协作、错误恢复全部串了起来。

---

## 一、Agent 是什么？用“人”来理解最直观

把 Agent 想象成一个**接到任务的人**，或者一个**小型组织**。它要完成一件事，核心流程和人类很像：

1. **接收信息**（耳朵/眼睛）：用户输入、定时提醒、后台任务通知……
2. **大脑处理**（LLM）：把信息拼成 prompt，调用模型做判断和决策。
3. **动手执行**（手脚）：读文件、写代码、运行命令、调用外部 API、派子 agent……
4. **反馈循环**：把执行结果再喂给大脑，决定下一步做什么，直到任务完成。

和人一样，Agent 的大脑（LLM）**上下文有限、会疲劳、会犯错**。所以真正好用的 Agent，不是裸调模型，而是给模型配了一个**完整的操作系统**——这就是 Claude Code / s20 想讲的 harness。

---

## 二、核心：机制很多，循环一个

s20 最关键的结论就是封面那句话：

> **“机制很多，循环一个。”**

所有花哨的功能，最终都挂在这一个极简骨架上：

```python
while True:
    response = LLM(messages, tools)
    if not has_tool_use(response.content):
        return
    results = execute_tools(response.content)
    messages.append(tool_results)
```

模型只负责两件事：

- **判断**：现在该停还是该继续？
- **选择**：如果继续，该调用哪个工具、传什么参数？

剩下的脏活累活——工具怎么找、权限怎么审、上下文怎么压、错了怎么恢复、任务怎么调度、队友怎么协作——全部由 harness 负责。

---

## 三、一个完整回合里发生了什么？

把上面的循环展开，一个典型回合如下：

> 架构图图片暂未随文章一起提交，下面先用文字流程图保留完整结构。

```text
用户输入
  → UserPromptSubmit hooks（记录/审计）
  → cron/background 通知注入
  → context compact（上下文压缩）
  → memory + skills + MCP 状态 组装 system prompt
  → LLM 调用
  → 有没有 tool_use block？
      没有 → Stop hooks → 结束，返回结果
      有   → PreToolUse hooks + 权限检查
          → 分发到内置工具 / MCP 工具 / 后台任务
          → PostToolUse hooks
          → tool_result / task_notification 回到 messages
          → 进入下一轮
```

下面按阶段拆开讲。

---

## 四、LLM 之前：把“原材料”准备好

### 1. 输入与 Hooks：UserPromptSubmit

用户输入不直接进模型，而是先经过 `UserPromptSubmit` hooks。可以在这里做：

- 日志审计
- 注入全局上下文
- 敏感词/越界检查

### 2. Cron 与 Background 通知注入

Agent 不是“你说一句我动一句”，它还可以：

- **cron 定时任务**：到点了自动把 `[Scheduled] ...` 注入 messages，让模型执行。
- **后台任务通知**：慢操作（比如 `npm install`）被丢到后台线程，做完后以 `<task_notification>` 形式通知主循环。

这样主循环永远不会被卡住。

### 3. Context Compact：给大脑“减负”

LLM 的上下文窗口是有限的，而且 token 越多吃得越多。真实任务里，tool 输出可能上万行，历史对话可能几十轮。所以进模型前要先跑**压缩管线**：

```text
tool_result_budget → snip_compact → micro_compact → compact_history
```

本质就是：**保留最近、最相关、最核心，丢弃或摘要旧的**。人也一样——你不会把三年前所有邮件都记在脑子里，而是只记结论。

### 4. Prompt 组装：把“已知”告诉大脑

每轮都会重新组装 `system prompt`，包含：

- 身份与行为准则（identity）
- 可用工具列表
- 当前工作目录
- 当前时间
- **Skills 目录**（按需 `load_skill` 展开）
- **Memory**（长期记忆）
- **已连接的 MCP 服务器**

也就是说，模型每轮看到的都不是“裸用户问题”，而是**已经组织好的完整上下文**。

---

## 五、LLM 调用：模型也会出错，要有容错

调用模型不是一锤子买卖。s20 包了四层恢复：

| 错误类型 | 处理方式 |
|---------|---------|
| 429 Too Many Requests | 指数退避重试 |
| 529 Overloaded | 指数退避，连续失败可切 fallback model |
| max_tokens 不够 | 先提高 `max_tokens`，再请求 continuation |
| prompt too long | 触发 reactive compact，压缩后再试 |

这就像人脑累了、听不懂、信息太多时，会**换个思路、分步骤、提炼重点**。

---

## 六、工具执行前：安全与权限

模型决定调用工具后，不会立即执行，而是先过 `PreToolUse` hooks + 权限检查：

```python
blocked = trigger_hooks("PreToolUse", block)
if blocked:
    results.append(tool_result(block.id, blocked))
    continue
```

s20 里实现了这些权限：

- **黑名单命令**：`rm -rf /`、`sudo`、`shutdown` 等直接拒绝。
- **破坏性操作**：`rm`、`> /etc/`、`chmod 777` 等需要用户/lead 确认。
- **越界写文件**：`write_file` / `edit_file` 会检查路径是否逃出工作目录。
- **危险 MCP 工具**：名字里带 `deploy` 的 MCP 工具需要审批。

权限不写死在每个工具里，而是挂在 hook 上。以后想加审计、加白名单、加日志，都只需加一个 hook，**不用改工具代码**。

---

## 七、工具分发：内置工具 + MCP + 后台

### 1. 工具池是动态组装的

每轮调用前，`assemble_tool_pool()` 会把：

```text
BUILTIN_TOOLS        + 已连接的 MCP tools
BUILTIN_HANDLERS     + mcp__server__tool handlers
```

合并成一个可用工具池。比如执行 `connect_mcp("docs")` 后，下一轮就会出现 `mcp__docs__search` 这类工具。

s20 内置了 27 个工具，覆盖文件、任务、计划、协作、worktree、cron、MCP：

```text
bash, read_file, write_file, edit_file, glob
todo_write, task, load_skill, compact
create_task, list_tasks, get_task, claim_task, complete_task
schedule_cron, list_crons, cancel_cron
spawn_teammate, send_message, check_inbox
request_shutdown, request_plan, review_plan
create_worktree, remove_worktree, keep_worktree
connect_mcp
```

### 2. 后台执行不阻塞主循环

像 `npm install` 这种慢命令，会被判定为后台任务：

```text
should_run_background → start_background_task → 返回 placeholder tool_result
后台完成 → task_notification → 下一轮注入 messages
```

### 3. 执行后还有 PostToolUse hooks

比如大输出告警：

```python
def large_output_hook(block, output):
    if len(str(output)) > 100000:
        print(f"[HOOK] large output from {block.name}")
```

---

## 八、计划层：短期 todo + 长期 task graph

s20 同时保留两层计划，对应不同的使用场景：

| 层级 | 代表 | 特点 | 用途 |
|-----|------|------|------|
| 短期 | `todo_write` | 内存中，会话级 | 防止单个 Agent 漂移 |
| 长期 | task graph | `.tasks/task_*.json` 文件，持久化 | 跨会话、可依赖、可认领，支撑团队协作 |

task graph 的关键能力：

- `blockedBy`：任务之间有依赖关系。
- `claim_task`：Agent/队友可以认领任务。
- `worktree`：任务可以绑定到独立目录，实现隔离。

---

## 九、协作：子 Agent 与队友

s20 提供了两种“分工”方式：

### 1. `task`：一次性子 Agent

- 独立 `messages[]`
- 中间过程丢弃，只返回最终摘要
- 解决**上下文隔离**问题

### 2. `spawn_teammate`：持久队友线程

- 通过 `MessageBus` 收发消息
- idle 时轮询任务板，自动认领可执行任务
- 提交 plan 后需要 lead 审批（`request_plan` / `review_plan`）
- 可以绑定 worktree，自动在对应目录下执行文件/命令

这就像一个项目经理（lead）带几个工程师（teammate）：经理派活、审计划，工程师认领任务、各自在独立分支上干活、完成后汇报。

---

## 十、隔离：worktree

worktree 是 Git 原生的目录隔离机制，s20 把它变成了工具：

- `create_worktree(name, task_id)`：创建独立目录和分支 `wt/name`。
- 任务字段 `worktree` 绑定目录。
- 队友认领带 worktree 的任务后，`bash` / `read_file` / `write_file` 自动在该目录下执行。

这样多人协作时不会互相踩代码，完成任务后也可以 `remove_worktree` 或 `keep_worktree`。

---

## 十一、外部能力：MCP

MCP（Model Context Protocol）是 Agent 接入外部世界的标准化接口。

s20 里：

- `connect_mcp(name)` 连接 mock server。
- `assemble_tool_pool()` 把 MCP 提供的工具动态组装进来。
- 工具名统一为 `mcp__{server}__{tool}`。

也就是说，Agent 的能力不是写死的，**可以通过 MCP 随时扩展**。

---

## 十二、结束时：Stop hooks

当本轮没有 `tool_use`、或者用户要求停止时，会触发 `Stop` hooks：

- 统计本轮调用了多少个工具
- 清理临时状态
- 持久化日志/记忆
- 审计收尾

---

## 十三、纠正几个容易误解的点

1. **Agent 不是“一个小脑”+“一堆工具”这么简单**
   真正的复杂性在于**harness**：怎么组织信息、怎么调度工具、怎么保证安全、怎么处理错误、怎么支持协作。

2. **LLM 不直接“知道” skills / memory / MCP**
   它们是通过每轮组装的 system prompt 告诉模型的。只有真正相关时，才会通过 `load_skill` 把完整内容展开。

3. **tool 不是越多越好**
   工具池是动态组装的，按需连接 MCP；太多无关工具会分散模型注意力。

4. **权限不是工具自己的事**
   权限检查统一挂在 `PreToolUse` hook 上，这样可以集中管理、灵活扩展。

5. **后台/cron 不是“另一个系统”**
   它们最终都是把通知注入 messages，让主循环继续走。本质还是**一个循环**。

---

## 十四、结语：从 s01 到 s20，终点也是起点

learn-claude-code 从 s01 到 s20，每一章加一个机制。到了 s20，所有机制被塞回同一个可运行系统里。

回头看，核心始终没变：

```python
while True:
    response = LLM(messages, tools)
    if not has_tool_use(response.content):
        return
    results = execute_tools(response.content)
    messages.append(tool_results)
```

变的是围绕这个循环的 harness：工具、权限、hooks、todo、task graph、skills、memory、compact、error recovery、background、cron、team、worktree、MCP……

**Claude Code 的聪明，不是模型本身更聪明，而是它把模型放进了一个足够成熟的工作环境里。**

---

## 参考

- 本文件所在目录：`learn-claude-code/s20_comprehensive/`
- 核心代码：`code.py`
- 官方说明：`README.md` / `README.en.md`
- 架构图：`images/system-architecture.svg`

---

*如果你也在学习 Claude Code 或者想理解现代 AI Agent 的骨架，希望这篇总结对你有帮助。欢迎在评论区交流：你觉得 Agent 最难做的部分是什么？*
