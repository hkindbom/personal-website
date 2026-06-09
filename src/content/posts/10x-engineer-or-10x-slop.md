---
title: "10x Engineer or 10x Slop?"
date: 2026-06-09
excerpt: "Claude code will implement your bad ideas too"
---

My team at 9fin just launched an [AI chat agent](https://9fin.com/ai) that we've worked on for the last few months. Some of the initial customer feedback kind of blew my mind. Users repeatedly say it’s really impressive and usage metrics are strong.

I've built machine learning powered products for 8 years and expectations on AI are sky-high, causing most products to fall short of them. It’s not because I’m a bad engineer, but because the bar has moved faster than the tech. So when feedback like this lands, it’s worth paying attention and sharing some learnings.

During the build process of this chat agent, I've formed beliefs and opinions on how to use AI coding assistants responsibly and effectively. Let's dive in.

## Claude code will implement your bad ideas too

I've learnt that coding assistants will build exactly what you ask for, even if the approach is wrong. As an example, I tried asking Claude to add an in-memory cache for all retrieval results with no expiration, keyed by query string. It implemented it cleanly. Tests passed. Code looked fine. But it would serve stale financial data to paying customers, grow unbounded in memory, and break across replicas. Tests validate that your implementation works as designed. They don't validate that your design is good.

Equally, you wouldn't one-shot a blog post like this and publish in your name without proofreading because you care about your personal brand. You should care about your production systems too.

I asked myself why Claude does this and came up with some hypotheses:

1. While it has improved with MCPs, coding assistants are often lacking critical context. A huge amount of context still lives in our heads and fragmented systems, not in the codebase or MCP servers.
2. LLMs are trained to be helpful and although frontier labs are working to extend their eyesight, they are currently short-sighted. Naturally they will adhere to your prompt and won't consider problems bound to happen 3 months down the line.
3. The product-engineering loop is not fully closed (yet), meaning that humans are still very much involved throughout the cycle: problem discovery -> planning -> build and deploy -> monitor, debug and collect feedback. The AI remains an "assistant" for now.

I’m actively working to close these gaps to unlock the next level of productivity gains with automated monitoring and feedback processing that loops back into development, but that's for a future blog post;)

So how can we avoid the bad ideas reaching prod and let coding assistants turn us into "10x engineers"?

## Good engineering discipline

Create a culture where bugs and issues primarily come back to the human PR author. Most engineers don't want to spend their time debugging and dealing with incidents and the human reviewer shares that responsibility.

This will also push the author to self-review and ensure the code is functional before asking for human review, a key point outlined in Simon Willison's blog post [Anti-patterns: things to avoid](https://simonwillison.net/guides/agentic-engineering-patterns/anti-patterns/).

To facilitate the code review process, I've found it incredibly helpful to agree on review guidelines as a team and add [Claude code review](https://github.com/anthropics/claude-code-action) to your CI pipeline. The author can then iterate with the AI review until "verdict: approve" is reached before bothering their peers.

But before we even reach the PR stage for more complex problems and high-stakes initiatives, it's best to agree on the problem and solution in natural language. A human can't effectively review 20k lines of AI-generated code with a one-sentence PR description but we can read a one-pager essentially agreeing on the prompt that we then feed to our coding assistant. Agent skills like [superpowers](https://github.com/obra/superpowers) can then help you plan it further with e.g. Claude code or codex.

## All code is not created equal

Not everything you build carries the same stakes. A quick script to parse json files, a local logs viewer app, a POC to test a hypothesis, vibe code away and move on.

But production systems serving paying customers in financial markets? That's a different game. The cost of a bug isn't a retry, it's stale data influencing billion dollar investment decisions or a compliance violation.

I think about it as a spectrum. On one end, you have Karpathy's vision of fully [automated AI research](https://github.com/karpathy/autoresearch) and it can work when you have a clear north star metric, well-defined boundary conditions, and a feedback loop you can close programmatically. On the other end, you have product engineering where requirements shift weekly, edge cases emerge from user behaviour you didn't anticipate, and the feedback loop runs through support tickets in a legacy system and during a lunch with the sales guy.

Most of the code we write lives somewhere in the middle. The skill is knowing where on that spectrum you are right now and adjusting accordingly. A POC can be a big AI-generated PR with minimal review. A change to how we handle restricted financial data gets a spec, a design review, manual testing evidence, and a careful rollout with small PRs and feature flags.

If you don't understand the code you're shipping, you're leaving your fate to AI. And right now, the AI doesn't monitor your system at 3am, doesn't handle the incident call, and doesn't explain to your customers what went wrong.

10x Engineer or 10x Slop? It's up to you.

And btw, we are [hiring](https://app.notion.com/p/Careers-at-9fin-7816c57be574418daea2b9f55355034c?pvs=21).

Cheers,
Hannes Kindbom
