# HardscapeAI: 24-Hour MVP Design

**Date**: 2026-04-25  
**Status**: Design approved, ready for implementation  
**Timeline**: Ship in 24 hours (solo execution)

---

## Executive Summary

Build a lightweight SaaS wrapper around the open-source Postiz social media scheduler, positioned specifically for hardscape contractors (patios, walkways, pool decks, fences). 

**Core value prop**: Contractors submit beautiful project photos. AI writes captions. They approve in one tap. Posts go to Instagram, TikTok, Facebook automatically.

**Business model**: $50–100/month per team member. Target: 3–5 customers by end of week 1.

---

## Problem & Opportunity

**Target customer**: Hardscape contractors (2–8 person teams)

**Their pain**:
- Stunning work that customers never see
- Too busy installing to manage social media
- Inconsistent posting (when they remember, tone is all over the place)
- Losing leads to competitors with better social presence
- Currently paying freelancers $1,500–2,000/mo for sporadic content

**Market**: ~50k hardscape contractors in North America. Even 0.1% penetration = $300k ARR at $50/mo per seat.

---

## Solution: Three-Layer Architecture

### Layer 1: Landing Page (Vercel)
- URL: `hardscape-ai.vercel.app`
- Single-page site, mobile-first
- Copy speaks directly to contractors ("Stop losing leads," "Post without the grind")
- CTA: "Book free 15-min call" → Calendly

**Sections**:
1. Hero: "AI Social Media for Hardscape Contractors"
2. Problem: "Your work is beautiful. Nobody sees it."
3. Solution: You submit photo → AI captions → Post everywhere
4. Pricing: "$50/month per team member"
5. CTA: Book call

**Design philosophy**: Fast, simple, no animations. Hardscape work speaks for itself—let the photos do the talking.

### Layer 2: Customer Submission Portal (Vercel)
- Private URL per customer: `hardscape-ai.vercel.app/submit/[unique-token]`
- Form: Photo upload (drag/drop) + optional text field for details
- Submit triggers email notification to you with photo + notes

**Customer experience**:
1. You give them submission URL during onboarding call
2. They upload photo whenever they finish a project
3. You handle the rest (caption + schedule)

### Layer 3: Postiz Backend (Railway)
- Self-hosted instance deployed on Railway
- Your Instagram, TikTok, Facebook accounts connected
- You log in, create posts, schedule times
- Customers never see this—it's your internal tool

---

## Data Flow: Day 1 (Manual Approval)

```
Customer submits photo
    ↓
Email notification to you (includes photo + notes)
    ↓
You open Postiz, create post with AI caption
    ↓
Select schedule date/time (e.g., Tuesday 9am)
    ↓
You text/email customer: "Scheduled for Tuesday. Here's preview: [link]"
    ↓
Post publishes automatically at scheduled time
```

**Why manual day 1?**
- Fastest to validate
- You learn exactly what customers need
- Automating too early risks over-engineering the wrong thing
- Week 2: Move approvals to n8n/Make (customer approves via link, auto-publishes)

---

## Tech Stack

### Frontend (Landing Page + Portal)
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **File storage**: Vercel Blob
- **Emails**: Resend (free tier: 100/day)
- **Database**: Vercel KV (Redis)
- **Hosting**: Vercel

**Why this stack?**
- Zero-config deployment (Vercel knows Next.js)
- Minimal dependencies (fast builds, fewer bugs)
- Free tier covers MVP traffic
- Integrations built-in (Blob, KV, Resend all first-party)

### Backend (Postiz Scheduler)
- **Hosting**: Railway (one-click Postiz deploy)
- **Database**: PostgreSQL + Redis (included in Railway free tier)
- **Deployment**: Copy/paste connection string from Railway → Postiz env

**Why Railway?**
- One-click Postiz deployment (no manual Docker setup)
- Free tier sufficient for MVP
- Easy to upgrade as traffic grows
- Postiz has official Railway template

### Booking
- **Calendly**: Embed on landing page, free tier

---

## Data Model

**Minimal for MVP** (day 1):

```
submissions
├── id (uuid)
├── customer_token (string, indexed)
├── photo_url (string, stored in Vercel Blob)
├── notes (text, optional)
├── created_at (timestamp)
└── status (pending | approved | posted)

customers
├── id (uuid)
├── name (string)
├── email (string)
├── submission_token (string, unique)
├── phone (string)
└── created_at (timestamp)
```

**Why so simple?**
- No auth day 1 (tokens are hard to guess)
- No payments (manual Stripe invoices)
- No complex workflow state (just submitted or approved)
- Can add complexity in week 2 once you understand customer behavior

---

## Implementation Sequence (24 hours)

**Hour 1–2: Landing page**
- Scaffold Next.js app on Vercel
- Add landing page sections (hero, problem, solution, pricing, CTA)
- Embed Calendly widget

**Hour 3–4: Submission portal**
- Add `/submit/[token]` page
- Photo upload form (Vercel Blob backend)
- Email on submit (Resend)
- Test locally

**Hour 5–6: Postiz setup**
- Railway account
- One-click Postiz deploy
- Connect your Instagram/TikTok/Facebook accounts
- Test creating a post

**Hour 7: Polish & launch**
- Check for typos, broken links
- Test submission-to-email flow end-to-end
- Deploy landing page, portal, Postiz
- Set up Calendly
- Share landing page link

**Hour 8+: Buffer for debugging**
- Fix any issues that come up
- Write first customer email
- Post on Twitter/X: "Just launched AI social media for hardscape contractors"

---

## Success Metrics (24h)

- [ ] Landing page live and indexed
- [ ] Postiz instance running, accounts connected
- [ ] Submission form works (test photo upload)
- [ ] Email notifications working
- [ ] First customer books call via Calendly
- [ ] First photo processed (uploaded → scheduled post)

---

## Week 1 Goals (Post-launch)

- 3–5 customers onboarded
- Manual approval flow refined (learn what customers ask for)
- 1–2 posts live on customer accounts (proof of concept)
- Plan week 2 automation (n8n/Make integration)

---

## Week 2+ Roadmap

- Automate approval: Customer approves via link, post goes live automatically
- Dashboard: See all submissions, approvals, scheduled posts at a glance
- Analytics: Show customers their Instagram/TikTok metrics
- Expand: Add pricing tiers, payment integration

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Postiz deployment fails | Use official Railway template; have backup (Render) |
| Email doesn't send | Test Resend API key before launch; fallback to Slack notification |
| Customer submission not working | Keep it simple (one photo field); test locally first |
| First customer expects automation | Set expectations: "Week 1 is manual approval. Week 2 we automate." |
| You run out of time | Prioritize: landing page → Postiz → submission form. Skip polish. |

---

## Success Definition

**Day 1**: Landing page live, Postiz running, first Calendly booking.  
**Day 2**: First customer onboarding call, first photo submitted and scheduled.  
**Day 7**: 3–5 customers paying, 5–10 posts live on customer accounts.

This is a validation mission, not a product launch. Prove the model works, *then* scale.

---

## Files to Create

- `/app/page.tsx` — Landing page
- `/app/submit/[token]/page.tsx` — Submission portal
- `/app/api/submit/route.ts` — Form submission handler
- `/app/api/email/route.ts` — Email notification
- `.env.local` — Vercel Blob, KV, Resend keys
- `/docs/ONBOARDING.md` — Script for customer calls

---

## Open Questions (Deferred)

- Payment processing: Manual Stripe link day 1, automate week 2
- Customer success: What does onboarding call look like? (Rough script in week 1)
- Content pillars: What captions should hardscape AI focus on? (Learn from first 5 customers)

These will be answered through customer conversations, not upfront design.
