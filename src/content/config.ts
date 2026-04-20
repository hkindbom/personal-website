import { defineCollection, z } from 'astro:content';

const posts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    excerpt: z.string(),
    /** Path from site root (e.g. `/og/my-post.png`) or absolute `https://…` */
    image: z.string().optional(),
    demo: z.string().optional(),
  }),
});

export const collections = { posts };
