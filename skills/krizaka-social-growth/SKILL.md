---
name: krizaka-social-growth
description: Write and schedule honest technical posts across X, LinkedIn, Instagram, TikTok and YouTube — a format per channel, hooks built on proof, official APIs only, the platforms' documented rate limits, credentials from a secret store and a log of what was published. Use when drafting a post, a thread or a content calendar for a software product, or when automating publication through a social platform's API.
license: Apache-2.0
metadata:
  author: krizaka
---

# Social growth — proof, not hype

A post earns attention by showing something real: a working feature, a measured result, code. Never invent a figure,
a customer or a quote.

## 1. One format per channel

| Channel            | Format                                       | Audience        | Tone                                  |
| :----------------- | :------------------------------------------- | :-------------- | :------------------------------------ |
| X                  | short thread, a 20–40 s demo clip, a diagram | developers      | concise, technical, one idea per post |
| LinkedIn           | a case study or a founder's note, one image  | business buyers | concrete, value first, no buzzwords   |
| Instagram / TikTok | 9:16 clip of the product in use              | end users       | fast, visual, one benefit             |
| YouTube            | a structured walkthrough with chapters       | evaluators      | calm, complete, timestamped           |

## 2. Hooks that rest on proof

**Contrast** — the usual pain, then what the product does differently, one verifiable fact, one link:

```text
Booking a haircut still means a phone call.
<Product> lets the shop take bookings from its own page, in two taps.
Here is the 20-second demo → <link>
```

**Technical thread** — 1. the problem; 2. the measurement (latency, cost, steps saved — measured, with how); 3. the code or the schema; 4. the open-source link or the docs.

Every number must come from a run you can show. Compare with « the usual way », never by naming and shaming a competitor.

## 3. Publishing through official APIs

| Platform             | API                                                           |
| :------------------- | :------------------------------------------------------------ |
| X                    | X API v2, `POST /2/tweets`, OAuth 2.0 user context            |
| LinkedIn             | Community Management API (posts on an organisation page)      |
| Instagram / Facebook | Meta Graph API (`/{ig-user-id}/media`, then `/media_publish`) |
| YouTube              | YouTube Data API v3, `videos.insert`                          |

- **Rate limits**: read each platform's current documented limits and stay well under them; back off with jitter on
  `429`. Post rarely and well rather than often.
- **Credentials**: OAuth tokens live in a secret store or the CI's encrypted secrets, injected at run time; never in
  the repository, never printed in logs.
- **Log every publication** (time, platform, post id, link) in a private store, to measure reach and to delete on
  request.
- Respect each platform's automation and disclosure rules (label AI-generated media where required).

## 4. Media

- Images: 1200 × 630 for link cards, 1080 × 1350 for portrait feeds; text readable on a phone.
- Clips: recorded from real runs (an end-to-end test recording is ideal), starting on the first meaningful frame,
  idle time cut, captions burnt in.
- One product, one bird, one colour per visual — the product's own brand.
