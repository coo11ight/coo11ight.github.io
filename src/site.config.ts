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
      { name: 'Link', val: 'https://coo11ight.github.io/' },
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
