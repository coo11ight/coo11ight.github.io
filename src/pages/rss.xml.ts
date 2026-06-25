import rss from '@astrojs/rss'

import config from '@/site.config'
import { getPosts } from '@/lib/posts'

export async function GET(context: { site: URL }) {
  const posts = await getPosts()

  return rss({
    title: config.title,
    description: config.description ?? '',
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
