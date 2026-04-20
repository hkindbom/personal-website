import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const posts = (await getCollection('posts'))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

  const base = import.meta.env.BASE_URL;

  return rss({
    title: 'hannes',
    description: 'Writing about travel and building AI systems.',
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt,
      link: `${base}posts/${post.slug}/`,
    })),
  });
}
