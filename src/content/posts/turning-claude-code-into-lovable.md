---
title: "Turning Claude Code into Lovable"
date: 2026-10-04
excerpt: "Iterating on an app from my phone with Claude Code and private Cloudflare previews"
---

I recently listened to Anton Osika on [Framgångspodden](https://youtu.be/mqAECkZqdRQ) and it took me back. Some time in 2021 we went for lunch in Stockholm, back when he was CTO at Depict.

Since then he co-founded Lovable, which crossed [$100M ARR eight months after launch](https://techcrunch.com/2025/07/23/eight-months-in-swedish-unicorn-lovable-crosses-the-100m-arr-milestone), a pace the company said was faster than OpenAI, Cursor or Wiz at that milestone ([Osika's post](https://x.com/antonosika/status/1948017850809270314), [Tech.eu](https://tech.eu/2025/07/23/lovable-becomes-fastest-software-company-ever-to-reach-100m-arr/)). Whatever you think of vibe coding, Lovable has clearly democratised building web apps, and lots of people love it.

It was more than a year since I first tried Lovable, so I thought I'd give it another go and vibe away. I had a basic app idea: make it easier for students to find scholarships and automatically draft the applications.

This post is about how I found it, and the setup I ended up with instead. It keeps the part of Lovable I liked most, iterating from my phone, while reusing my Claude subscription and personal domain, and staying in control of both code and infra. Let's dive in.

## First impressions

I started in chat mode on the free plan and had a long back-and-forth about the idea and how it should work. Then I asked it to build, starting with just a frontend and a small JSON index of a few example scholarships.

The one-shot result was honestly a bit sloppy. The UI mixed Swedish and English, and it didn't feel like the long planning chat before it had made much difference.

![The one-shot app, in Lovable's phone editor](/images/turning-claude-code-into-lovable/app-on-phone.jpg)

Under the hood, the matching "engine" was a pile of hard-coded if statements and magic numbers, overfitted to KTH:

```ts
function isKTH(p: StudentProfile) {
  return /kth|kungl.*tekniska/i.test(p.university);
}

// ...
if (!s.universities.includes("any") && s.universities.includes("KTH") && !isKTH(p))
  return { excluded: "other" };
// ...
let score = 50;
if (isKTH(p) && s.universities.includes("KTH"))
  reasons.push(L("Open to KTH students", "Öppet för KTH-studenter"));
// ...
} else if (p.gpa < s.minGpa) {
  score -= 25;
} else {
  const t = Math.min(1, (p.gpa - s.minGpa) / Math.max(0.1, 5 - s.minGpa));
  score += Math.round((s.bonus.gpa ?? 10) * (0.4 + 0.6 * t));
}
```

Then half a prompt into my first follow-up, I'd used up all 5 of my free daily credits, and the build "paused", asking me to pay more.

![Lovable's "Upgrade to keep building" pop-up](/images/turning-claude-code-into-lovable/lovable-paywall.jpg)

That surprised me. The first build is the moment a new user decides whether the product is magic or not. I'd expect Lovable to put its strongest model on it to impress, even on the free tier.

## What I actually wanted

The credits stung, but they made me think about what I was actually paying for. My list was short:

1. **Iterate from my phone.** This is what Lovable does really well in its iOS app, and I didn't want to give it up.
2. **Control of code and infra.** Lovable can sync code to GitHub too, but I wanted to choose where the app runs and be free to move it later.
3. **My own domain and private previews.** Password-protected preview apps for feature branches.
4. **Cheap.** I already pay for a Claude subscription, which includes Claude Code. Paying for a second AI subscription to do the same job felt wrong.

## What I looked at first

**Claude artifacts** were my first stop. They're great for quick one-off pages, but the code doesn't sync to GitHub, and that was the one thing I wasn't willing to give up.

Then I remembered Simon Willison's [Raccoon Heist post](https://simonwillison.net/2026/Aug/5/raccoon-heist/). He builds from the Claude iPhone app and previews with GitHub Pages: point Pages at the branch Claude pushes to, and each push is live within about 30 seconds. It's simple and fast, and great for throwaway projects. But every new branch means going back to Settings, choosing "Deploy from a branch", picking the branch and hitting Save. It also doesn't give you password-protected previews, and you still probably want to pay for your own domain. If you already have one, a subdomain does the job.

## The setup

I disconnected the app from Lovable and asked Claude Code to help me move it to Cloudflare Workers. Some Cloudflare and GitHub click ops later, I had a loop that looks like this:

1. I describe a change in the Code tab of the Claude iPhone app.
2. Claude works in a cloud sandbox and pushes a branch.
3. Cloudflare builds that branch and its bot comments a preview URL on the pull request.
4. I open the preview on my phone. It sits behind a Cloudflare login, so only I can see it.
5. Not right? I prompt again, Claude pushes, a new preview builds.
6. Happy? I tell Claude to merge, and the prod domain updates.

![The Cloudflare Access login in front of a preview](/images/turning-claude-code-into-lovable/cloudflare-access-login.jpg)

Compared to Simon's trick, every branch gets its own preview URL automatically, previews are private, and production lives on my own domain. Getting there had a few snags worth knowing about:

- **Workers, not Pages.** Cloudflare Pages is the obvious choice, but my app has server routes, and Cloudflare now steers new projects to Workers anyway.
- **The empty `previews` block.** The first preview build failed until `wrangler.jsonc` had a `"previews": {}` entry.
- **"Disconnected from your Git account".** Cloudflare showed the repo as linked but never built my branch. The fix was granting the Cloudflare GitHub app access to that repo.

Once it worked, I moved this blog onto the same loop with one small pull request, and drafted this post that way.

## Limits, costs and drawbacks

An honest comparison per dollar is hard: Lovable sells credits, and Anthropic only gives rough Claude usage limits. Here are the list prices:

| | Lovable | My setup |
| --- | --- | --- |
| AI | Pro: £22/month for 100 credits ([pricing](https://lovable.dev/pricing)) | Claude Pro: £18/month, includes Claude Code, limits shared with chat ([pricing](https://claude.com/pricing)) |
| Hosting | Publishing is in the plan; Cloud usage (database, functions) uses credits | Cloudflare free plan: 100,000 requests a day, static files free ([limits](https://developers.cloudflare.com/workers/platform/pricing/)) |
| Builds | Every change uses credits | 3,000 build minutes a month, one at a time ([limits](https://developers.cloudflare.com/workers/ci-cd/builds/limits-and-pricing/)) |
| Private previews | Built into the editor | Cloudflare Access, free up to 50 users |
| Custom domain | Included on Pro | One domain you own covers every app as a subdomain, or use a free `workers.dev` URL |

One real number: the Claude Code session that moved my app off Lovable, set up Cloudflare and shipped two pull requests would have cost about £3 at API prices. I already pay for Claude, so it cost me nothing extra. The only thing I've paid Cloudflare so far is my domain, about £8 for a year.

**The backend is where Lovable earns its money.** Lovable Cloud gives every project a managed database, auth, storage and server functions, built on Supabase. It also comes with ready-made integrations, like [payments with Stripe](https://docs.lovable.dev/integrations/stripe) and LLM calls through Lovable's built-in AI gateway. My app doesn't need a database yet, and I haven't tested a backend in this loop. Cloudflare has its own database (D1), key-value store (KV) and file storage (R2), all with free tiers. You could also point Claude at Supabase, or at AWS if you want to own your infrastructure. In every case you set it up and manage the secrets yourself, including any Stripe or LLM keys.

Other drawbacks to be honest about:

- **Slower previews.** Each push takes about a minute to reach a preview. Lovable shows changes in seconds, and Simon's GitHub Pages trick in about 30.
- **No visual editor.** In Lovable you can select an element in the preview and adjust it directly. Here every change goes through a prompt and a build.
- **Setup takes dashboards.** Cloudflare settings, GitHub app permissions and a custom domain took about an hour of back-and-forth, with Claude walking me through each screen.
- **Shared usage limits.** Heavy coding days eat into the same Claude limits as my normal chats.

## So, should you leave Lovable?

Not necessarily. If you don't want to touch GitHub or a Cloudflare dashboard, or manage your own infrastructure, Lovable is still the fastest way from idea to live app, and that's exactly why so many people love it. The managed backend is a real feature, not a gimmick.

But if you already pay for Claude and want to own your infrastructure, this setup gives you the part of Lovable I cared about most, the phone-only loop, for close to nothing.

Cheers,
Hannes Kindbom
