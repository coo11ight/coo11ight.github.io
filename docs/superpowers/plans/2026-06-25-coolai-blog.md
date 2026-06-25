# COOLAI Blog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the COOLAI v1 personal blog with Astro, astro-pure styling, sample posts, search, RSS/sitemap, Waline comments, and hidden pageview recording.

**Architecture:** Use a small Astro static site and the `astro-pure` integration for MDX, UnoCSS, Pagefind, theme utilities, and the ready-made Header/Search components. Keep local code focused: site config, content schema, shared post helpers, one base layout, one blog post layout, page routes, and two Waline components. Do not import Joye's terminal mode, mascot, talks, links, projects, analytics, or personal assets.

**Tech Stack:** Astro 6, TypeScript, astro-pure 1.4.6, UnoCSS through astro-pure, Pagefind through astro-pure, Waline client, npm scripts.

---

## File Structure

- Create `package.json`: npm scripts and dependencies.
- Create `tsconfig.json`: Astro strict TypeScript config and `@/*` alias.
- Create `astro.config.ts`: static Astro config with `astro-pure`.
- Create `src/site.config.ts`: COOLAI site identity, navigation, Pagefind, Waline config.
- Create `src/content.config.ts`: `blog` collection schema.
- Create `src/lib/posts.ts`: post sorting, draft filtering, and tag helpers.
- Create `src/components/BaseHead.astro`: SEO, RSS, favicon, and social metadata.
- Create `src/components/comment/Comment.astro`: visible Waline comments with graceful fallback.
- Create `src/components/comment/ViewCounter.astro`: invisible Waline pageview recorder.
- Create `src/layouts/BaseLayout.astro`: shared shell using astro-pure Header and ThemeProvider.
- Create `src/layouts/BlogPost.astro`: article layout, table of contents, previous/next links, comments.
- Create `src/assets/styles/app.css`: design tokens and global polish.
- Create `src/pages/index.astro`: COOLAI homepage.
- Create `src/pages/blog/[...page].astro`: paginated blog index.
- Create `src/pages/blog/[...id].astro`: article detail route.
- Create `src/pages/tags/index.astro`: tag overview.
- Create `src/pages/tags/[tag]/[...page].astro`: tag-filtered post list.
- Create `src/pages/about/index.astro`: starter about page.
- Create `src/pages/contact/index.astro`: starter contact page.
- Create `src/pages/search/index.astro`: Pagefind UI.
- Create `src/pages/rss.xml.ts`: RSS feed.
- Create `src/pages/robots.txt.ts`: robots.txt with sitemap.
- Create `src/content/blog/*.md`: three sample posts.
- Create `public/favicon.svg`: simple COOLAI favicon.
- Create `scripts/verify-dist.mjs`: post-build smoke checks.

---

### Task 1: Project Shell And Theme Config

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `astro.config.ts`
- Create: `src/site.config.ts`
- Create: `src/content.config.ts`
- Create: `src/lib/posts.ts`
- Create: `src/env.d.ts`
- Create: `public/favicon.svg`

- [ ] **Step 1: Create package metadata**

Create `package.json` with:

```json
{
  "name": "coolai-blog",
  "version": "0.1.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build && node scripts/verify-dist.mjs",
    "check": "astro-pure check && astro check",
    "preview": "astro preview",
    "astro": "astro",
    "pure": "astro-pure"
  },
  "dependencies": {
    "@astrojs/check": "^0.9.4",
    "@astrojs/rss": "^4.0.12",
    "@waline/client": "^3.5.7",
    "astro": "^6.1.8",
    "astro-pure": "1.4.6",
    "typescript": "^5.8.3"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```powershell
npm install
```

Expected: `node_modules/` and `package-lock.json` are created without npm errors.

- [ ] **Step 3: Add TypeScript config**

Create `tsconfig.json` with:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

- [ ] **Step 4: Add Astro env reference**

Create `src/env.d.ts` with:

```ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
```

- [ ] **Step 5: Add astro-pure config**

Create `src/site.config.ts` with:

```ts
import type { Config, IntegrationUserConfig, ThemeUserConfig } from 'astro-pure/types'

export const theme: ThemeUserConfig = {
  title: 'COOLAI',
  author: 'COOLAI',
  description: '写作、技术与 AI 学习记录',
  favicon: '/favicon.svg',
  logo: {
    src: '/favicon.svg',
    alt: 'COOLAI'
  },
  locale: {
    lang: 'zh-CN',
    attrs: 'zh_CN',
    dateLocale: 'zh-CN',
    dateOptions: {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  },
  titleDelimiter: '•',
  prerender: true,
  npmCDN: 'https://cdn.jsdelivr.net/npm',
  head: [],
  customCss: [],
  header: {
    menu: [
      { title: 'Blog', link: '/blog' },
      { title: 'About', link: '/about' },
      { title: 'Contact', link: '/contact' }
    ]
  },
  footer: {
    year: `© ${new Date().getFullYear()} `,
    links: [],
    credits: true,
    social: []
  },
  content: {
    externalLinks: {
      content: ' ↗'
    },
    blogPageSize: 8,
    share: [],
    imageCaption: true
  }
}

export const integ: IntegrationUserConfig = {
  pagefind: true,
  links: {
    logbook: [],
    applyTip: [
      { name: 'Name', val: 'COOLAI' },
      { name: 'Desc', val: '写作、技术与 AI 学习记录' },
      { name: 'Link', val: 'https://coolai.example.com/' },
      { name: 'Avatar', val: '/favicon.svg' }
    ]
  },
  quote: {
    server: '',
    target: '() => ""'
  },
  typography: {
    class: 'prose text-base text-muted-foreground',
    blockquoteStyle: 'italic',
    inlineCodeBlockStyle: 'modern'
  },
  mediumZoom: {
    enable: true,
    selector: '.prose .zoomable',
    options: { className: 'zoomable' }
  },
  waline: {
    enable: Boolean(import.meta.env.PUBLIC_WALINE_SERVER),
    server: import.meta.env.PUBLIC_WALINE_SERVER,
    additionalConfigs: {
      pageview: true,
      comment: true
    }
  }
}

const config = { ...theme, integ } as Config
export default config
```

- [ ] **Step 6: Add Astro config**

Create `astro.config.ts` with:

```ts
import AstroPureIntegration from 'astro-pure'
import { defineConfig } from 'astro/config'

import config from './src/site.config'

export default defineConfig({
  site: process.env.PUBLIC_SITE_URL ?? 'https://coolai.example.com',
  trailingSlash: 'never',
  integrations: [AstroPureIntegration(config)],
  prefetch: true,
  server: {
    host: true
  }
})
```

- [ ] **Step 7: Add content collection schema**

Create `src/content.config.ts` with:

```ts
import { defineCollection, z } from 'astro:content'
import { glob } from 'astro/loaders'

function normalizeTags(tags: string[]) {
  return Array.from(new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean)))
}

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string().max(80),
    description: z.string().max(180),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]).transform(normalizeTags),
    draft: z.boolean().default(false),
    comment: z.boolean().default(true)
  })
})

export const collections = { blog }
```

- [ ] **Step 8: Add shared post helpers**

Create `src/lib/posts.ts` with:

```ts
import type { CollectionEntry } from 'astro:content'
import { getCollection } from 'astro:content'

export type BlogPost = CollectionEntry<'blog'>

export async function getPosts() {
  const posts = await getCollection('blog', ({ data }) => {
    return import.meta.env.PROD ? !data.draft : true
  })
  return sortPostsByDate(posts)
}

export function sortPostsByDate(posts: BlogPost[]) {
  return posts.sort((a, b) => {
    const aDate = a.data.updatedDate ?? a.data.publishDate
    const bDate = b.data.updatedDate ?? b.data.publishDate
    return bDate.getTime() - aDate.getTime()
  })
}

export function getUniqueTags(posts: BlogPost[]) {
  return Array.from(new Set(posts.flatMap((post) => post.data.tags))).sort((a, b) =>
    a.localeCompare(b)
  )
}

export function getPostsByTag(posts: BlogPost[], tag: string) {
  return posts.filter((post) => post.data.tags.includes(tag))
}
```

- [ ] **Step 9: Add favicon**

Create `public/favicon.svg` with:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="COOLAI">
  <rect width="64" height="64" rx="14" fill="#0b0b10"/>
  <path d="M18 40c-3-3-5-7-5-12 0-10 8-18 19-18 6 0 11 2 15 6l-5 6c-3-3-6-4-10-4-6 0-10 4-10 10s4 10 10 10c4 0 7-1 10-4l5 6c-4 4-9 6-15 6-6 0-11-2-14-6Z" fill="#fcfcfd"/>
  <path d="M42 46h8L36 18h-8L14 46h8l2-5h16l2 5Zm-15-12 5-12 5 12H27Z" fill="#9bdcf8"/>
</svg>
```

- [ ] **Step 10: Commit project shell**

Run:

```powershell
git add package.json package-lock.json tsconfig.json astro.config.ts src/site.config.ts src/content.config.ts src/lib/posts.ts src/env.d.ts public/favicon.svg
git commit -m "chore: scaffold COOLAI Astro shell"
```

Expected: commit succeeds.

---

### Task 2: Shared Layout, Head, And Global Styles

**Files:**
- Create: `src/components/BaseHead.astro`
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/assets/styles/app.css`

- [ ] **Step 1: Add base head**

Create `src/components/BaseHead.astro` with:

```astro
---
import config from '@/site.config'

interface Props {
  title: string
  description?: string
  articleDate?: string
  noindex?: boolean
}

const {
  title,
  description = config.description,
  articleDate,
  noindex = false
} = Astro.props

const fullTitle = title === config.title ? config.title : `${title} ${config.titleDelimiter} ${config.title}`
const canonicalURL = new URL(Astro.url.pathname, Astro.site)
---

<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<title>{fullTitle}</title>
<link rel="icon" href="/favicon.svg" type="image/svg+xml" />
<link rel="canonical" href={canonicalURL} />
<meta name="title" content={fullTitle} />
<meta name="description" content={description} />
<meta name="author" content={config.author} />
<meta name="robots" content={noindex ? 'noindex, follow' : 'index, follow'} />
<meta name="theme-color" media="(prefers-color-scheme: light)" content="#fcfcfd" />
<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0b0b10" />
<meta property="og:type" content={articleDate ? 'article' : 'website'} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:url" content={canonicalURL} />
<meta property="og:site_name" content={config.title} />
<meta property="og:locale" content={config.locale.attrs} />
{articleDate && <meta property="article:published_time" content={articleDate} />}
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content={title} />
<meta name="twitter:description" content={description} />
<link rel="alternate" type="application/rss+xml" title={config.title} href={new URL('/rss.xml', Astro.site)} />
<link rel="sitemap" type="application/xml" href="/sitemap-index.xml" />
```

- [ ] **Step 2: Add global styles**

Create `src/assets/styles/app.css` with:

```css
:root {
  --background: 210 33% 99%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 240 10% 3.9%;
  --primary: 198 54% 45%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95%;
  --muted-foreground: 240 3.8% 36%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 72% 50%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 88%;
  --input: 240 5.9% 90%;
  --ring: 198 54% 45%;
  --radius: 0.5rem;
  --un-default-border-color: hsl(var(--border) / 1);
}

.dark {
  --background: 240 20% 5%;
  --foreground: 0 0% 98%;
  --card: 240 10% 4%;
  --card-foreground: 0 0% 98%;
  --popover: 240 10% 4%;
  --popover-foreground: 0 0% 98%;
  --primary: 195 95% 85%;
  --primary-foreground: 240 4% 16%;
  --secondary: 240 4% 16%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 6% 12%;
  --muted-foreground: 240 5% 75%;
  --accent: 240 4% 16%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 63% 31%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 4% 20%;
  --input: 240 4% 16%;
  --ring: 195 95% 85%;
}

html {
  color-scheme: light;
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

html.dark {
  color-scheme: dark;
}

body {
  min-height: 100vh;
  margin: 0;
}

a {
  transition: color 0.2s ease;
}

a:hover {
  color: hsl(var(--primary) / 1);
}

.prose :where(a) {
  color: hsl(var(--foreground) / 1);
  font-weight: 600;
}

.prose :where(pre) {
  border: 1px solid hsl(var(--border) / 1);
}
```

- [ ] **Step 3: Add base layout**

Create `src/layouts/BaseLayout.astro` with:

```astro
---
import { Header, ThemeProvider } from 'astro-pure/components/basic'

import BaseHead from '@/components/BaseHead.astro'
import ViewCounter from '@/components/comment/ViewCounter.astro'
import config from '@/site.config'

import '@/assets/styles/app.css'

interface Props {
  meta: {
    title: string
    description?: string
    articleDate?: string
    noindex?: boolean
  }
}

const { meta } = Astro.props
---

<html lang={config.locale.lang}>
  <head>
    <BaseHead {...meta} />
    <ThemeProvider />
  </head>
  <body class="flex justify-center bg-background text-foreground">
    <div class="w-full max-w-[70rem] px-4 sm:px-7 lg:px-10">
      <Header />
      <slot />
      <footer class="mx-auto mb-5 mt-16 border-t pt-5 text-sm text-muted-foreground">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} COOLAI</p>
          <p>
            Built with <a href="https://astro.build/" target="_blank" rel="noreferrer">Astro</a>
            and
            <a href="https://astro-pure.js.org/" target="_blank" rel="noreferrer">Pure</a>.
          </p>
        </div>
      </footer>
    </div>
    <ViewCounter />
  </body>
</html>
```

- [ ] **Step 4: Run check**

Run:

```powershell
npm run check
```

Expected: It may fail because pages and comment components are not created yet. The expected failure mentions missing imports for `@/components/comment/ViewCounter.astro`, not package installation.

- [ ] **Step 5: Commit layout shell**

Run:

```powershell
git add src/components/BaseHead.astro src/layouts/BaseLayout.astro src/assets/styles/app.css
git commit -m "feat: add COOLAI base layout"
```

Expected: commit succeeds.

---

### Task 3: Sample Content And Blog Routes

**Files:**
- Create: `src/content/blog/coolai-start.md`
- Create: `src/content/blog/ai-learning-loop.md`
- Create: `src/content/blog/frontend-notes.md`
- Create: `src/layouts/BlogPost.astro`
- Create: `src/pages/index.astro`
- Create: `src/pages/blog/[...page].astro`
- Create: `src/pages/blog/[...id].astro`
- Create: `src/pages/tags/index.astro`
- Create: `src/pages/tags/[tag]/[...page].astro`

- [ ] **Step 1: Add sample posts**

Create `src/content/blog/coolai-start.md` with:

````md
---
title: COOLAI 博客从这里开始
description: 第一篇占位文章，用来验证文章列表、详情页、标签、RSS 和搜索流程。
publishDate: 2026-06-25
tags: [ai, learning]
---

这是 COOLAI 的第一篇示例文章。它不是最终内容，只负责帮助我们确认博客的阅读体验。

## 写作方向

COOLAI 会优先记录 AI、编程、产品理解和学习过程中的关键问题。

## 示例代码

```ts
const site = 'COOLAI'
console.log(`${site} is ready to write.`)
```
````

Create `src/content/blog/ai-learning-loop.md` with:

````md
---
title: 一个轻量的 AI 学习循环
description: 用输入、实验、复盘三步，让 AI 学习记录更容易持续。
publishDate: 2026-06-24
tags: [ai, learning]
---

学习 AI 时，最容易卡住的地方不是资料不够，而是没有稳定的循环。

## 输入

先选一个足够小的问题，例如一次只理解 RAG、function calling 或 prompt caching 中的一个概念。

## 实验

用最小代码或最小案例验证它，不急着做完整项目。

## 复盘

把错误、意外结果和下一步问题写下来，下一篇文章就从这里继续。
````

Create `src/content/blog/frontend-notes.md` with:

````md
---
title: 前端页面先追求清晰
description: 对个人博客来说，清晰的信息结构比复杂动效更重要。
publishDate: 2026-06-23
tags: [frontend]
---

个人博客的第一版不需要把所有功能都堆上去。

## 首页

首页应该告诉读者这是谁、写什么、最近有什么文章。

## 文章页

文章页应该优先保证阅读体验：标题、日期、标签、目录、代码块和评论区。

## 下一步

等文章数量变多，再考虑项目页、友链页或专题页。
````

- [ ] **Step 2: Add blog post layout**

Create `src/layouts/BlogPost.astro` with:

```astro
---
import type { MarkdownHeading } from 'astro'
import type { CollectionEntry } from 'astro:content'
import { ArticleBottom, TOC } from 'astro-pure/components/pages'
import { FormattedDate } from 'astro-pure/user'

import Comment from '@/components/comment/Comment.astro'
import BaseLayout from '@/layouts/BaseLayout.astro'

interface Props {
  post: CollectionEntry<'blog'>
  posts: CollectionEntry<'blog'>[]
  headings: MarkdownHeading[]
}

const { post, posts, headings } = Astro.props
const articleDate = (post.data.updatedDate ?? post.data.publishDate).toISOString()
---

<BaseLayout
  meta={{
    title: post.data.title,
    description: post.data.description,
    articleDate
  }}
>
  <main class="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
    <article id="content" class="min-w-0">
      <a href="/blog" class="mb-8 inline-flex text-sm text-muted-foreground hover:text-primary">
        ← Back to Blog
      </a>
      <header class="mb-8 border-b pb-8">
        <p class="mb-3 text-sm text-muted-foreground">
          <FormattedDate date={post.data.publishDate} />
        </p>
        <h1 class="mb-4 text-3xl font-semibold leading-tight sm:text-4xl">{post.data.title}</h1>
        <p class="text-lg text-muted-foreground">{post.data.description}</p>
        {post.data.tags.length > 0 && (
          <ul class="mt-5 flex flex-wrap gap-2">
            {post.data.tags.map((tag) => (
              <li>
                <a class="rounded-full border px-3 py-1 text-sm text-muted-foreground hover:bg-muted" href={`/tags/${tag}`}>
                  #{tag}
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>
      <div class="prose max-w-none">
        <slot />
      </div>
      <ArticleBottom id={post.id} collections={posts} class="mt-10" />
      {post.data.comment && <Comment class="mt-10" path={`/blog/${post.id}`} />}
    </article>
    {headings.length > 0 && (
      <aside class="hidden lg:block">
        <div class="sticky top-28 text-sm">
          <TOC {headings} />
        </div>
      </aside>
    )}
  </main>
</BaseLayout>
```

- [ ] **Step 3: Add homepage**

Create `src/pages/index.astro` with:

```astro
---
import { FormattedDate } from 'astro-pure/user'

import BaseLayout from '@/layouts/BaseLayout.astro'
import { getPosts } from '@/lib/posts'

const posts = (await getPosts()).slice(0, 5)
---

<BaseLayout meta={{ title: 'COOLAI', description: '写作、技术与 AI 学习记录' }}>
  <main class="mx-auto max-w-3xl">
    <section class="mb-12 flex flex-col gap-6">
      <div class="flex size-16 items-center justify-center rounded-2xl border bg-muted text-xl font-semibold">
        CA
      </div>
      <div>
        <h1 class="text-4xl font-semibold tracking-normal">COOLAI</h1>
        <p class="mt-4 text-lg leading-8 text-muted-foreground">
          写作、技术与 AI 学习记录。这里先从小文章开始，把问题、实验和复盘稳定沉淀下来。
        </p>
      </div>
      <ul class="flex flex-wrap gap-2 text-sm">
        {['AI', 'Frontend', 'Learning Notes'].map((item) => (
          <li class="rounded-full border px-3 py-1 text-muted-foreground">{item}</li>
        ))}
      </ul>
    </section>

    <section>
      <div class="mb-5 flex items-center justify-between">
        <h2 class="text-2xl font-semibold">Latest Posts</h2>
        <a href="/blog" class="text-sm text-muted-foreground hover:text-primary">View all →</a>
      </div>
      <ul class="flex flex-col gap-3">
        {posts.map((post) => (
          <li class="rounded-xl border bg-background p-5 transition-colors hover:bg-muted">
            <a href={`/blog/${post.id}`} class="block">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 class="font-medium">{post.data.title}</h3>
                <span class="text-sm text-muted-foreground">
                  <FormattedDate date={post.data.publishDate} />
                </span>
              </div>
              <p class="mt-2 text-sm leading-6 text-muted-foreground">{post.data.description}</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  </main>
</BaseLayout>
```

- [ ] **Step 4: Add paginated blog page**

Create `src/pages/blog/[...page].astro` with:

```astro
---
import type { GetStaticPaths, Page } from 'astro'
import type { CollectionEntry } from 'astro:content'
import { Paginator } from 'astro-pure/components/pages'
import { FormattedDate } from 'astro-pure/user'

import BaseLayout from '@/layouts/BaseLayout.astro'
import config from '@/site.config'
import { getPosts, getUniqueTags } from '@/lib/posts'

export const getStaticPaths = (async ({ paginate }) => {
  const posts = await getPosts()
  const tags = getUniqueTags(posts)
  return paginate(posts, {
    pageSize: config.content.blogPageSize,
    props: { tags, total: posts.length }
  })
}) satisfies GetStaticPaths

interface Props {
  page: Page<CollectionEntry<'blog'>>
  tags: string[]
  total: number
}

const { page, tags, total } = Astro.props
const paginationProps = {
  ...(page.url.prev && { prevUrl: { text: '← Previous', url: page.url.prev } }),
  ...(page.url.next && { nextUrl: { text: 'Next →', url: page.url.next } })
}
---

<BaseLayout meta={{ title: 'Blog', description: 'COOLAI 的文章列表' }}>
  <main class="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
    <section>
      <h1 class="mb-3 text-3xl font-semibold">Blog</h1>
      <p class="mb-8 text-muted-foreground">
        Page {page.currentPage} · Showing {page.data.length} of {total} posts
      </p>
      <ul class="flex flex-col gap-4">
        {page.data.map((post) => (
          <li class="rounded-xl border bg-background p-5 transition-colors hover:bg-muted">
            <a href={`/blog/${post.id}`} class="block">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <h2 class="text-lg font-medium">{post.data.title}</h2>
                <span class="text-sm text-muted-foreground">
                  <FormattedDate date={post.data.publishDate} />
                </span>
              </div>
              <p class="mt-2 text-muted-foreground">{post.data.description}</p>
              <div class="mt-4 flex flex-wrap gap-2 text-sm text-muted-foreground">
                {post.data.tags.map((tag) => <span>#{tag}</span>)}
              </div>
            </a>
          </li>
        ))}
      </ul>
      <Paginator {...paginationProps} />
    </section>
    <aside>
      <h2 class="mb-4 text-lg font-semibold">Tags</h2>
      <ul class="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <li>
            <a class="rounded-full border px-3 py-1 text-sm text-muted-foreground hover:bg-muted" href={`/tags/${tag}`}>
              #{tag}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  </main>
</BaseLayout>
```

- [ ] **Step 5: Add article route**

Create `src/pages/blog/[...id].astro` with:

```astro
---
import { render, type CollectionEntry } from 'astro:content'

import BlogPost from '@/layouts/BlogPost.astro'
import { getPosts } from '@/lib/posts'

export async function getStaticPaths() {
  const posts = await getPosts()
  return posts.map((post) => ({
    params: { id: post.id },
    props: { post, posts }
  }))
}

interface Props {
  post: CollectionEntry<'blog'>
  posts: CollectionEntry<'blog'>[]
}

const { post, posts } = Astro.props
const { Content, headings } = await render(post)
---

<BlogPost {post} {posts} {headings}>
  <Content />
</BlogPost>
```

- [ ] **Step 6: Add tag pages**

Create `src/pages/tags/index.astro` with:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro'
import { getPosts, getUniqueTags } from '@/lib/posts'

const posts = await getPosts()
const tags = getUniqueTags(posts)
---

<BaseLayout meta={{ title: 'Tags', description: 'COOLAI 的文章标签' }}>
  <main class="mx-auto max-w-3xl">
    <h1 class="mb-6 text-3xl font-semibold">Tags</h1>
    <ul class="flex flex-wrap gap-3">
      {tags.map((tag) => (
        <li>
          <a class="rounded-full border px-4 py-2 text-muted-foreground hover:bg-muted" href={`/tags/${tag}`}>
            #{tag}
          </a>
        </li>
      ))}
    </ul>
  </main>
</BaseLayout>
```

Create `src/pages/tags/[tag]/[...page].astro` with:

```astro
---
import type { GetStaticPaths, Page } from 'astro'
import type { CollectionEntry } from 'astro:content'
import { Paginator } from 'astro-pure/components/pages'
import { FormattedDate } from 'astro-pure/user'

import BaseLayout from '@/layouts/BaseLayout.astro'
import config from '@/site.config'
import { getPosts, getPostsByTag, getUniqueTags } from '@/lib/posts'

export const getStaticPaths = (async ({ paginate }) => {
  const posts = await getPosts()
  return getUniqueTags(posts).flatMap((tag) => {
    return paginate(getPostsByTag(posts, tag), {
      params: { tag },
      pageSize: config.content.blogPageSize,
      props: { tag }
    })
  })
}) satisfies GetStaticPaths

interface Props {
  page: Page<CollectionEntry<'blog'>>
  tag: string
}

const { page, tag } = Astro.props
const paginationProps = {
  ...(page.url.prev && { prevUrl: { text: '← Previous', url: page.url.prev } }),
  ...(page.url.next && { nextUrl: { text: 'Next →', url: page.url.next } })
}
---

<BaseLayout meta={{ title: `#${tag}`, description: `COOLAI 标签 ${tag} 下的文章` }}>
  <main class="mx-auto max-w-3xl">
    <a href="/tags" class="mb-8 inline-flex text-sm text-muted-foreground hover:text-primary">← All tags</a>
    <h1 class="mb-6 text-3xl font-semibold">#{tag}</h1>
    <ul class="flex flex-col gap-4">
      {page.data.map((post) => (
        <li class="rounded-xl border bg-background p-5 transition-colors hover:bg-muted">
          <a href={`/blog/${post.id}`} class="block">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <h2 class="text-lg font-medium">{post.data.title}</h2>
              <span class="text-sm text-muted-foreground">
                <FormattedDate date={post.data.publishDate} />
              </span>
            </div>
            <p class="mt-2 text-muted-foreground">{post.data.description}</p>
          </a>
        </li>
      ))}
    </ul>
    <Paginator {...paginationProps} />
  </main>
</BaseLayout>
```

- [ ] **Step 7: Run route sync and check**

Run:

```powershell
npm run astro -- sync
npm run check
```

Expected: It may fail only because `Comment.astro` and `ViewCounter.astro` are still missing.

- [ ] **Step 8: Commit blog routes**

Run:

```powershell
git add src/content/blog src/layouts/BlogPost.astro src/pages/index.astro src/pages/blog src/pages/tags
git commit -m "feat: add COOLAI blog content and routes"
```

Expected: commit succeeds.

---

### Task 4: Static Pages, Search, RSS, And Robots

**Files:**
- Create: `src/pages/about/index.astro`
- Create: `src/pages/contact/index.astro`
- Create: `src/pages/search/index.astro`
- Create: `src/pages/rss.xml.ts`
- Create: `src/pages/robots.txt.ts`

- [ ] **Step 1: Add About page**

Create `src/pages/about/index.astro` with:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro'
---

<BaseLayout meta={{ title: 'About', description: '关于 COOLAI' }}>
  <main class="mx-auto max-w-3xl">
    <h1 class="mb-6 text-3xl font-semibold">About COOLAI</h1>
    <div class="prose max-w-none">
      <p>
        COOLAI 是一个个人博客，用来记录 AI、编程、产品理解和学习过程中的问题与复盘。
      </p>
      <p>
        第一版先保持简单：认真写文章，保持页面清爽，让内容比装饰更靠前。
      </p>
    </div>
  </main>
</BaseLayout>
```

- [ ] **Step 2: Add Contact page**

Create `src/pages/contact/index.astro` with:

```astro
---
import BaseLayout from '@/layouts/BaseLayout.astro'
---

<BaseLayout meta={{ title: 'Contact', description: '联系 COOLAI' }}>
  <main class="mx-auto max-w-3xl">
    <h1 class="mb-6 text-3xl font-semibold">Contact</h1>
    <div class="grid gap-3">
      <div class="rounded-xl border p-5">
        <h2 class="font-medium">Email</h2>
        <p class="mt-2 text-muted-foreground">暂未配置公开邮箱。</p>
      </div>
      <div class="rounded-xl border p-5">
        <h2 class="font-medium">GitHub</h2>
        <p class="mt-2 text-muted-foreground">暂未配置公开 GitHub 链接。</p>
      </div>
    </div>
  </main>
</BaseLayout>
```

- [ ] **Step 3: Add Search page**

Create `src/pages/search/index.astro` with:

```astro
---
import { PFSearch } from 'astro-pure/components/pages'

import BaseLayout from '@/layouts/BaseLayout.astro'
import { integ } from '@/site.config'
---

<BaseLayout meta={{ title: 'Search', description: '搜索 COOLAI', noindex: true }}>
  <main class="mx-auto max-w-3xl">
    <h1 class="mb-4 text-3xl font-semibold">Search</h1>
    {integ.pagefind ? (
      <>
        <p class="mb-4 text-muted-foreground">搜索文章、标签和静态页面。</p>
        <PFSearch />
      </>
    ) : (
      <p class="text-muted-foreground">Search is disabled.</p>
    )}
  </main>
</BaseLayout>
```

- [ ] **Step 4: Add RSS feed**

Create `src/pages/rss.xml.ts` with:

```ts
import rss from '@astrojs/rss'

import config from '@/site.config'
import { getPosts } from '@/lib/posts'

export async function GET(context: { site: URL }) {
  const posts = await getPosts()

  return rss({
    title: config.title,
    description: config.description,
    site: context.site,
    trailingSlash: false,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishDate,
      link: `/blog/${post.id}`
    }))
  })
}
```

- [ ] **Step 5: Add robots.txt**

Create `src/pages/robots.txt.ts` with:

```ts
export function GET(context: { site: URL }) {
  const sitemap = new URL('/sitemap-index.xml', context.site)
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${sitemap}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  })
}
```

- [ ] **Step 6: Run check**

Run:

```powershell
npm run check
```

Expected: It may fail only because `Comment.astro` and `ViewCounter.astro` are still missing.

- [ ] **Step 7: Commit static pages**

Run:

```powershell
git add src/pages/about src/pages/contact src/pages/search src/pages/rss.xml.ts src/pages/robots.txt.ts
git commit -m "feat: add COOLAI static pages and feeds"
```

Expected: commit succeeds.

---

### Task 5: Waline Comments And Hidden Pageview Recording

**Files:**
- Create: `src/components/comment/Comment.astro`
- Create: `src/components/comment/ViewCounter.astro`

- [ ] **Step 1: Add comment component**

Create `src/components/comment/Comment.astro` with:

```astro
---
import '@waline/client/style'

interface Props {
  class?: string
  path?: string
}

const { class: className = '', path = Astro.url.pathname } = Astro.props
const serverURL = import.meta.env.PUBLIC_WALINE_SERVER
---

{
  serverURL ? (
    <coolai-comment data-server={serverURL} data-path={path}>
      <div id="waline" class:list={['not-prose', className]}>
        评论加载中...
      </div>
    </coolai-comment>
  ) : (
    <section class:list={['rounded-xl border bg-muted p-5 text-sm text-muted-foreground', className]}>
      评论区将在配置 Waline 服务后启用。
    </section>
  )
}

<script>
  import { init as walineInit } from '@waline/client'

  class CoolaiComment extends HTMLElement {
    connectedCallback() {
      const serverURL = this.dataset.server || ''
      if (!serverURL) return

      ;(globalThis as unknown as { __VUE_OPTIONS_API__: boolean }).__VUE_OPTIONS_API__ = true
      ;(globalThis as unknown as { __VUE_PROD_DEVTOOLS__: boolean }).__VUE_PROD_DEVTOOLS__ = false

      walineInit({
        el: '#waline',
        serverURL,
        path: this.dataset.path || window.location.pathname,
        pageview: true,
        comment: true
      })
    }
  }

  if (!customElements.get('coolai-comment')) {
    customElements.define('coolai-comment', CoolaiComment)
  }
</script>

<style>
  #waline {
    --waline-font-size: 16px;
    --waline-theme-color: hsl(var(--foreground) / 1);
    --waline-active-color: hsl(var(--primary) / 1);
    --waline-color: hsl(var(--muted-foreground) / 1);
    --waline-bg-color: hsl(var(--muted) / 1);
    --waline-bg-color-light: hsl(var(--background) / 1);
    --waline-border-color: hsl(var(--border) / 1);
    --waline-avatar-radius: 50%;
    --waline-box-shadow: none;
  }
</style>
```

- [ ] **Step 2: Add hidden view counter**

Create `src/components/comment/ViewCounter.astro` with:

```astro
---
const serverURL = import.meta.env.PUBLIC_WALINE_SERVER
const path = Astro.url.pathname
---

{
  serverURL && (
    <coolai-view-counter data-server={serverURL}>
      <span class="coolai-hidden-view waline-pageview-count" data-path={path} aria-hidden="true"></span>
    </coolai-view-counter>
  )
}

<script>
  import { pageviewCount } from '@waline/client'

  class CoolaiViewCounter extends HTMLElement {
    connectedCallback() {
      if (document.querySelector('coolai-comment')) return
      const serverURL = this.dataset.server || ''
      if (!serverURL) return
      pageviewCount({ serverURL, selector: '.waline-pageview-count' })
    }
  }

  if (!customElements.get('coolai-view-counter')) {
    customElements.define('coolai-view-counter', CoolaiViewCounter)
  }
</script>

<style>
  .coolai-hidden-view {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
```

- [ ] **Step 3: Run check**

Run:

```powershell
npm run check
```

Expected: PASS.

- [ ] **Step 4: Commit Waline components**

Run:

```powershell
git add src/components/comment
git commit -m "feat: add Waline comments and hidden pageviews"
```

Expected: commit succeeds.

---

### Task 6: Build Verification

**Files:**
- Create: `scripts/verify-dist.mjs`

- [ ] **Step 1: Add dist verification script**

Create `scripts/verify-dist.mjs` with:

```js
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const requiredFiles = [
  'dist/index.html',
  'dist/blog/index.html',
  'dist/about/index.html',
  'dist/contact/index.html',
  'dist/search/index.html',
  'dist/rss.xml',
  'dist/robots.txt'
]

const forbiddenFragments = [
  '/links',
  '/talks',
  '/projects',
  'DevMode',
  'joye:toggle-dev',
  'Joye Personal Blog'
]

const missing = requiredFiles.filter((file) => !existsSync(file))
if (missing.length > 0) {
  console.error(`Missing build files:\n${missing.join('\n')}`)
  process.exit(1)
}

const htmlFiles = requiredFiles.filter((file) => file.endsWith('.html'))
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8')
  for (const fragment of forbiddenFragments) {
    if (html.includes(fragment)) {
      console.error(`Forbidden fragment "${fragment}" found in ${file}`)
      process.exit(1)
    }
  }
}

const home = readFileSync(join('dist', 'index.html'), 'utf8')
if (!home.includes('COOLAI')) {
  console.error('Home page does not contain COOLAI')
  process.exit(1)
}

console.log('dist verification passed')
```

- [ ] **Step 2: Run full production build**

Run:

```powershell
npm run build
```

Expected: `astro check` passes, `astro build` passes, Pagefind is generated, and the script prints `dist verification passed`.

- [ ] **Step 3: Start dev server**

Run:

```powershell
npm run dev -- --host 127.0.0.1
```

Expected: Astro prints a localhost URL.

- [ ] **Step 4: Browser smoke test**

Open the local URL and verify:

- `/` shows COOLAI, latest posts, topic tags, and no Links/Talks/Projects navigation.
- `/blog` shows the three sample posts.
- `/blog/coolai-start` renders an article, TOC if headings are present, and the comment fallback when `PUBLIC_WALINE_SERVER` is not set.
- `/about`, `/contact`, and `/search` load.
- Dark mode toggle changes the theme.

- [ ] **Step 5: Commit verification script**

Run:

```powershell
git add scripts/verify-dist.mjs package.json package-lock.json
git commit -m "test: add COOLAI build verification"
```

Expected: commit succeeds.

---

## Self-Review Notes

- Spec coverage: Home, Blog, Article, About, Contact, Search, Tags, RSS, sitemap through astro-pure, Waline comments, hidden pageviews, sample posts, dark mode, and forbidden v1 pages are covered.
- Out-of-scope guard: build verification checks for links/talks/projects/dev-mode fragments.
- Package reality check: `astro-pure` exists on npm at `1.4.6`; `astro-theme-pure` is not an npm package.
- Tooling reality check: npm is available locally; Bun is not required.
