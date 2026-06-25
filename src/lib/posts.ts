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
