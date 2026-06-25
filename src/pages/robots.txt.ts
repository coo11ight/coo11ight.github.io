export function GET(context: { site: URL }) {
  const sitemap = new URL('/sitemap-index.xml', context.site)
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${sitemap}\n`, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    }
  })
}
