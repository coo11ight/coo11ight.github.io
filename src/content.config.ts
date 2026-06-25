import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

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
