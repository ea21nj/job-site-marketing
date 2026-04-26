# HardscapeAI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a lightweight SaaS wrapper around Postiz, positioned for hardscape contractors, with a landing page, submission portal, and self-hosted Postiz backend—all live in 24 hours.

**Architecture:** Next.js app on Vercel (landing page + submission portal) connected to a self-hosted Postiz instance on Railway. Manual approval workflow: customers submit photos via form → you receive email → you schedule in Postiz → customer receives confirmation.

**Tech Stack:** Next.js 15 (App Router), Tailwind CSS, React Hook Form, Vercel Blob (file storage), Vercel KV (Redis), Resend (emails), Railway (Postiz hosting), Calendly (booking).

**Timeline:** 24 hours solo. Hour 1–2 landing page, 3–4 submission portal, 5–6 Postiz setup, 7+ polish/launch.

---

## File Structure

**New files to create:**
```
hardscape-ai/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   ├── submit/
│   │   └── [token]/
│   │       └── page.tsx           # Submission portal page
│   ├── api/
│   │   ├── submit/
│   │   │   └── route.ts           # Form submission handler
│   │   └── health/
│   │       └── route.ts           # Health check for monitoring
│   └── robots.ts                  # SEO
├── lib/
│   ├── kv.ts                      # Vercel KV client setup
│   ├── resend.ts                  # Resend email client
│   ├── blob.ts                    # Vercel Blob client
│   └── types.ts                   # TypeScript types
├── public/
│   └── og.jpg                     # Open Graph image
├── .env.local.example             # Environment template
├── vercel.json                    # Vercel configuration
├── next.config.ts                 # Next.js config
├── tsconfig.json                  # TypeScript config
├── tailwind.config.ts             # Tailwind config
├── postcss.config.mjs             # PostCSS config
└── README.md                       # Deployment instructions
```

---

## Task 1: Project Setup & Environment Configuration

**Files:**
- Create: `hardscape-ai/` (new Next.js project)
- Create: `.env.local`
- Create: `.env.local.example`
- Create: `vercel.json`
- Create: `next.config.ts`

### Step 1: Create Next.js project with Vercel CLI

```bash
cd /Users/erikandersson
npx create-next-app@latest hardscape-ai --typescript --tailwind --app --no-git --no-eslint
cd hardscape-ai
```

Expected: New Next.js 15 project scaffolded with App Router and Tailwind.

### Step 2: Install dependencies

```bash
npm install @vercel/blob @vercel/kv react-hook-form resend axios
```

### Step 3: Create `.env.local.example`

```bash
cat > .env.local.example << 'EOF'
# Vercel Blob (file storage)
BLOB_READ_WRITE_TOKEN=your_token_here

# Vercel KV (Redis database)
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=your_token_here

# Resend (emails)
RESEND_API_KEY=your_key_here
RESEND_FROM_EMAIL=noreply@hardscape-ai.vercel.app

# Admin email (where submissions go)
ADMIN_EMAIL=your-email@example.com

# Calendly
CALENDLY_LINK=https://calendly.com/your-link

# Public URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000
EOF
```

### Step 4: Copy to `.env.local` and fill in placeholders

```bash
cp .env.local.example .env.local
# Edit .env.local with your actual tokens (fill in after Vercel setup)
```

### Step 5: Create `vercel.json` for deployment config

```json
{
  "buildCommand": "next build",
  "devCommand": "next dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "BLOB_READ_WRITE_TOKEN": "@blob_token",
    "KV_URL": "@kv_url",
    "KV_REST_API_URL": "@kv_api_url",
    "KV_REST_API_TOKEN": "@kv_token",
    "RESEND_API_KEY": "@resend_key",
    "ADMIN_EMAIL": "@admin_email",
    "CALENDLY_LINK": "@calendly_link",
    "NEXT_PUBLIC_BASE_URL": "@base_url"
  }
}
```

### Step 6: Update `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
```

### Step 7: Create `lib/types.ts`

```typescript
export interface Submission {
  id: string;
  customerToken: string;
  photoUrl: string;
  notes?: string;
  createdAt: number;
  status: "pending" | "approved" | "posted";
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  submissionToken: string;
  phone?: string;
  createdAt: number;
}

export interface SubmissionRequest {
  token: string;
  notes?: string;
  // photo comes via FormData as file
}
```

### Step 8: Commit

```bash
git init
git add .
git commit -m "chore: scaffold Next.js project with Vercel Blob, KV, Resend"
```

---

## Task 2: Vercel & External Services Setup

**Files:**
- Modify: `.env.local`

### Step 1: Create Vercel project and link Vercel Blob

Go to `https://vercel.com/new` and create a project from this repo.

After deploy:
```bash
vercel env pull
```

This downloads Vercel secrets into `.env.local`.

### Step 2: Add Vercel KV (Redis)

1. Go to Vercel Dashboard → Storage → Create Database → KV
2. Copy the connection strings
3. Add to `.env.local`:
```
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
```

### Step 3: Create Resend account and API key

1. Sign up at `https://resend.com`
2. Create an API key
3. Verify domain (use Resend's default, or add `hardscape-ai.vercel.app`)
4. Add to `.env.local`:
```
RESEND_API_KEY=re_xxxx
RESEND_FROM_EMAIL=noreply@hardscape-ai.vercel.app
```

### Step 4: Create Calendly account

1. Go to `https://calendly.com`
2. Create a free account
3. Create a 15-minute "Onboarding Call" meeting
4. Get your scheduling link
5. Add to `.env.local`:
```
CALENDLY_LINK=https://calendly.com/your-name/onboarding
```

### Step 5: Create admin email account (or use existing)

Add your email to `.env.local`:
```
ADMIN_EMAIL=your-email@example.com
```

### Step 6: Update `.env.local` with all secrets

Verify all variables are set:
```bash
cat .env.local | grep -E "^[A-Z_]" | wc -l
```

Expected: 8 environment variables set.

---

## Task 3: Create Library Files (Clients & Utilities)

**Files:**
- Create: `lib/kv.ts`
- Create: `lib/resend.ts`
- Create: `lib/blob.ts`

### Step 1: Create `lib/kv.ts` (Redis client)

```typescript
import { kv } from "@vercel/kv";

export async function saveSubmission(
  customerToken: string,
  submission: {
    photoUrl: string;
    notes?: string;
    createdAt: number;
  }
) {
  const id = crypto.randomUUID();
  const key = `submission:${id}`;
  
  await kv.hset(key, {
    id,
    customerToken,
    photoUrl: submission.photoUrl,
    notes: submission.notes || "",
    createdAt: submission.createdAt,
    status: "pending",
  });
  
  // Add to customer's submission list
  await kv.lpush(`customer:${customerToken}:submissions`, id);
  
  return id;
}

export async function getSubmission(id: string) {
  return kv.hgetall(`submission:${id}`);
}

export async function getCustomerSubmissions(token: string) {
  const submissionIds = await kv.lrange(`customer:${token}:submissions`, 0, -1);
  const submissions = await Promise.all(
    submissionIds.map((id) => kv.hgetall(`submission:${id}`))
  );
  return submissions;
}

export async function createCustomer(customer: {
  name: string;
  email: string;
  phone?: string;
}) {
  const customerId = crypto.randomUUID();
  const submissionToken = crypto.randomUUID();
  
  await kv.hset(`customer:${customerId}`, {
    id: customerId,
    name: customer.name,
    email: customer.email,
    submissionToken,
    phone: customer.phone || "",
    createdAt: Date.now(),
  });
  
  return { customerId, submissionToken };
}

export async function getCustomerByToken(token: string) {
  const keys = await kv.keys("customer:*");
  for (const key of keys) {
    const customer = await kv.hgetall(key);
    if (customer && customer.submissionToken === token) {
      return customer;
    }
  }
  return null;
}
```

### Step 2: Create `lib/resend.ts` (Email client)

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || "noreply@hardscape-ai.vercel.app";
const adminEmail = process.env.ADMIN_EMAIL || "erik.andersson@eligeo.com";

export async function sendSubmissionNotification(
  customerEmail: string,
  customerName: string,
  photoUrl: string,
  notes?: string
) {
  return resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    subject: `New Submission from ${customerName}`,
    html: `
      <h2>New Photo Submission</h2>
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Email:</strong> ${customerEmail}</p>
      <p><strong>Notes:</strong> ${notes || "No notes"}</p>
      <p><strong>Photo:</strong></p>
      <img src="${photoUrl}" alt="Submitted photo" style="max-width: 500px;" />
      <hr />
      <p>Log into Postiz to create and schedule this post.</p>
    `,
  });
}

export async function sendScheduleConfirmation(
  customerEmail: string,
  customerName: string,
  scheduledDate: string
) {
  return resend.emails.send({
    from: fromEmail,
    to: customerEmail,
    subject: "Your post is scheduled!",
    html: `
      <h2>Your Post is Scheduled</h2>
      <p>Hi ${customerName},</p>
      <p>Your photo has been approved and scheduled to post on <strong>${scheduledDate}</strong>.</p>
      <p>It will be automatically posted to all your social media accounts at the scheduled time.</p>
      <p>Questions? Reply to this email or call us.</p>
      <p>HardscapeAI</p>
    `,
  });
}
```

### Step 3: Create `lib/blob.ts` (File storage client)

```typescript
import { put, del } from "@vercel/blob";

export async function uploadPhoto(
  file: File,
  customerToken: string
): Promise<string> {
  const filename = `${customerToken}/${Date.now()}-${file.name}`;
  
  const blob = await put(filename, file, {
    access: "public",
  });
  
  return blob.url;
}

export async function deletePhoto(photoUrl: string) {
  try {
    await del(photoUrl);
  } catch (error) {
    console.error("Failed to delete photo:", error);
  }
}
```

### Step 4: Commit

```bash
git add lib/
git commit -m "feat: add Vercel KV, Resend, and Blob client libraries"
```

---

## Task 4: Create Landing Page

**Files:**
- Create: `app/page.tsx`
- Create: `app/layout.tsx` (update)
- Create: `public/og.jpg` (placeholder image)
- Create: `app/robots.ts`

### Step 1: Update `app/layout.tsx`

```typescript
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Social Media for Hardscape Contractors | HardscapeAI",
  description:
    "Post stunning hardscape photos. AI writes captions. You approve. It posts everywhere. Get leads without the grind.",
  keywords: [
    "social media",
    "hardscape contractors",
    "patio",
    "landscape",
    "marketing",
    "AI",
  ],
  openGraph: {
    title: "AI Social Media for Hardscape Contractors",
    description: "Post stunning hardscape photos. AI writes captions. You approve. It posts everywhere.",
    type: "website",
    url: process.env.NEXT_PUBLIC_BASE_URL,
    images: [{ url: `${process.env.NEXT_PUBLIC_BASE_URL}/og.jpg` }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

### Step 2: Create `app/page.tsx` (Landing Page)

```typescript
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  const calendlyLink = process.env.CALENDLY_LINK || "#";

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900">HardscapeAI</div>
          <a
            href={calendlyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Contact
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          AI Social Media for Hardscape Contractors
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Your work is beautiful. Get leads without the grind.
        </p>
        <a
          href={calendlyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition"
        >
          Book Free 15-Min Call
        </a>
      </section>

      {/* Problem Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            The Problem
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-4">📸</div>
              <p className="text-gray-700">
                Your hardscape work is stunning. But nobody sees it.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-4">😩</div>
              <p className="text-gray-700">
                You're too busy installing to manage Instagram, TikTok, Facebook.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-4">💸</div>
              <p className="text-gray-700">
                Hiring a freelancer costs $1,500–2,000/month. Inconsistent results.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <div className="text-3xl mb-4">📉</div>
              <p className="text-gray-700">
                Competitors with better social media are stealing your leads.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
          The Solution
        </h2>
        <div className="space-y-6">
          <div className="flex gap-4 items-start">
            <div className="text-3xl flex-shrink-0">📸</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                You Submit a Photo
              </h3>
              <p className="text-gray-600">
                Snap a photo of your finished hardscape. Upload it. That's it.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="text-3xl flex-shrink-0">✍️</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI Writes Your Caption
              </h3>
              <p className="text-gray-600">
                Our AI generates an optimized caption that gets engagement. One tap to approve.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="text-3xl flex-shrink-0">🚀</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Posts Everywhere Automatically
              </h3>
              <p className="text-gray-600">
                Posts go to Instagram, TikTok, Facebook, LinkedIn at the time you schedule. No more manual copying.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Pricing
          </h2>
          <div className="bg-white rounded-lg p-8 max-w-sm mx-auto">
            <div className="text-5xl font-bold text-gray-900 mb-2">$50</div>
            <p className="text-gray-600 mb-6">per team member per month</p>
            <ul className="text-left space-y-3 mb-8 text-gray-700">
              <li className="flex items-center gap-2">
                <span>✓</span> Unlimited posts
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span> AI captions
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span> All platforms (Instagram, TikTok, Facebook, LinkedIn)
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span> Scheduling & analytics
              </li>
            </ul>
            <p className="text-sm text-gray-600 mb-6">
              That's 25x cheaper than hiring a freelancer. And 10x more reliable because the system runs whether you're awake or not.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Stop Losing Leads
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          You know you need to post. You just need the system to handle it.
        </p>
        <a
          href={calendlyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-gray-900 text-white px-8 py-4 rounded-lg font-medium text-lg hover:bg-gray-800 transition"
        >
          Book Free 15-Min Call
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p>© 2026 HardscapeAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
```

### Step 3: Create `public/og.jpg` placeholder

For now, create a simple placeholder. In production, add a real hardscape image.

```bash
# Using a temporary placeholder (you can upload a real image later)
# For MVP, just create an empty file to avoid 404s
touch public/og.jpg
```

### Step 4: Create `app/robots.ts` for SEO

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/submit/",
    },
    sitemap: `${process.env.NEXT_PUBLIC_BASE_URL}/sitemap.xml`,
  };
}
```

### Step 5: Test locally

```bash
npm run dev
```

Navigate to `http://localhost:3000` and verify:
- Hero section displays
- CTA buttons link to Calendly
- Mobile responsive
- No errors in console

### Step 6: Commit

```bash
git add app/page.tsx app/layout.tsx app/robots.ts public/
git commit -m "feat: add landing page with hero, problem, solution, pricing sections"
```

---

## Task 5: Create Submission Portal Backend

**Files:**
- Create: `app/api/submit/route.ts`
- Create: `app/api/health/route.ts`

### Step 1: Create `app/api/submit/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server";
import { saveSubmission } from "@/lib/kv";
import { uploadPhoto } from "@/lib/blob";
import { sendSubmissionNotification } from "@/lib/resend";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get("token") as string;
    const notes = formData.get("notes") as string | null;
    const file = formData.get("photo") as File | null;

    // Validate inputs
    if (!token) {
      return NextResponse.json(
        { error: "Missing customer token" },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "Missing photo file" },
        { status: 400 }
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 }
      );
    }

    // Upload photo to Vercel Blob
    const photoUrl = await uploadPhoto(file, token);

    // Save submission to KV
    const submissionId = await saveSubmission(token, {
      photoUrl,
      notes: notes || undefined,
      createdAt: Date.now(),
    });

    // Send email notification to admin
    await sendSubmissionNotification(
      "customer@example.com", // In real app, fetch from customer record
      "Customer Name", // In real app, fetch from customer record
      photoUrl,
      notes || undefined
    );

    return NextResponse.json(
      {
        success: true,
        submissionId,
        message: "Photo submitted successfully!",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json(
      { error: "Failed to process submission" },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
```

### Step 2: Create `app/api/health/route.ts`

```typescript
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
}
```

### Step 3: Test with curl

```bash
npm run dev
# In another terminal:
curl http://localhost:3000/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Step 4: Commit

```bash
git add app/api/
git commit -m "feat: add submission and health check API endpoints"
```

---

## Task 6: Create Submission Portal Frontend

**Files:**
- Create: `app/submit/[token]/page.tsx`
- Create: `components/ui/button.tsx` (simple Button component)

### Step 1: Create simple Button component `components/ui/button.tsx`

```typescript
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  loading?: boolean;
}

export function Button({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  ...props
}: ButtonProps) {
  const baseStyles =
    "px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const variantStyles =
    variant === "primary"
      ? "bg-gray-900 text-white hover:bg-gray-800"
      : "bg-gray-200 text-gray-900 hover:bg-gray-300";

  return (
    <button
      className={`${baseStyles} ${variantStyles}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? "Uploading..." : children}
    </button>
  );
}
```

### Step 2: Create `app/submit/[token]/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function SubmitPage() {
  const params = useParams();
  const token = params.token as string;

  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.type.startsWith("image/")) {
        setFile(f);
        setError("");
      } else {
        setError("Please select an image file");
        setFile(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) {
      setFile(f);
      setError("");
    } else {
      setError("Please drop an image file");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError("Please select a photo");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("token", token);
      formData.append("photo", file);
      if (notes) formData.append("notes", notes);

      const response = await fetch("/api/submit", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Submission failed");
      }

      setSuccess(true);
      setFile(null);
      setNotes("");

      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Submit Your Photo</h1>

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">
              ✓ Photo submitted! We'll caption and schedule it for you.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="photo-input"
              disabled={loading}
            />
            <label htmlFor="photo-input" className="cursor-pointer block">
              <div className="text-4xl mb-2">📸</div>
              <p className="font-medium text-gray-900 mb-1">
                {file ? file.name : "Drop photo here or click to select"}
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, or GIF (max 5MB)
              </p>
            </label>
          </div>

          {/* Notes Field */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-900 mb-2">
              Additional Details (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="E.g., 'This is a patio we completed last week'"
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:bg-gray-50"
              rows={3}
            />
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={!file || loading} loading={loading}>
            Submit Photo
          </Button>

          {/* Help Text */}
          <p className="text-xs text-gray-500 text-center">
            We'll caption this photo with AI and send you a preview to approve before we post it.
          </p>
        </form>
      </div>
    </div>
  );
}
```

### Step 3: Test locally

```bash
npm run dev
# Navigate to http://localhost:3000/submit/test-token-123
# Try uploading a photo
```

Expected:
- Form displays
- Drag/drop works
- File upload works
- Success message appears
- (Note: Will fail at Blob upload since no token configured, but form structure validates)

### Step 4: Commit

```bash
git add app/submit/ components/
git commit -m "feat: add submission portal with photo upload form"
```

---

## Task 7: Deploy to Vercel

**Files:**
- Modify: `.env.local` (set production secrets)

### Step 1: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/hardscape-ai.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

```bash
vercel --prod
```

Expected: Deployment completes, you get a live URL like `https://hardscape-ai.vercel.app`

### Step 3: Set production environment variables

Go to Vercel Dashboard → Settings → Environment Variables

Add:
- `BLOB_READ_WRITE_TOKEN`
- `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`
- `RESEND_API_KEY`
- `ADMIN_EMAIL`
- `CALENDLY_LINK`
- `NEXT_PUBLIC_BASE_URL=https://hardscape-ai.vercel.app`

### Step 4: Redeploy with env vars

```bash
vercel --prod
```

### Step 5: Test production deployment

```bash
curl https://hardscape-ai.vercel.app/api/health
# Expected: {"status":"ok","timestamp":"..."}

# Visit https://hardscape-ai.vercel.app in browser
# Expected: Landing page loads, CTA links to Calendly
```

### Step 6: Commit

```bash
git add vercel.json
git commit -m "deploy: production deployment to Vercel"
```

---

## Task 8: Deploy Postiz on Railway

**Files:**
- None (Railway is handled via UI)

### Step 1: Create Railway account

Go to `https://railway.app` and sign up.

### Step 2: Deploy Postiz via Railway template

1. Go to `https://railway.app/new/postiz`
2. Click "Deploy Now"
3. Railway handles the setup (PostgreSQL, Redis, environment)
4. Wait for deployment (~5–10 min)

### Step 3: Get Postiz URL

After deployment, Railway gives you a public URL like `https://postiz-random.railway.app`

Add to your notes.

### Step 4: Set up Postiz

1. Go to your Postiz URL
2. Create account
3. Connect your Instagram, TikTok, Facebook accounts (follow Postiz prompts)
4. Test creating a post manually to verify everything works

### Step 5: Document

Create `docs/POSTIZ_SETUP.md`:

```markdown
# Postiz Setup Notes

**Postiz URL:** https://postiz-random.railway.app
**Admin Email:** your-email@example.com
**Connected Accounts:**
- Instagram: @your-hardscape-account
- TikTok: @your-hardscape-account
- Facebook: Your Business Page

## First-Time Setup
1. Log in to Postiz
2. Go to Settings → Integrations
3. Connect Instagram (OAuth flow)
4. Connect TikTok (OAuth flow)
5. Connect Facebook (OAuth flow)
6. Test: Create a dummy post, schedule it for now, verify it posts

## Daily Workflow
1. Check for email notifications (photo submissions)
2. Download photo
3. Log into Postiz
4. Create new post with photo
5. Add AI-generated caption (Postiz has built-in AI)
6. Schedule for desired date/time
7. Email customer with preview + scheduled date
```

---

## Task 9: Create Customer Onboarding Guide

**Files:**
- Create: `docs/ONBOARDING.md`

```markdown
# Customer Onboarding Script

## 15-Min Call Agenda

**Intro (1 min)**
"Thanks for booking! I'm Erik. I built HardscapeAI to help contractors like you get more leads without doing all the marketing work. Is that something you're interested in?"

**Problem Discovery (3 min)**
"Tell me about your social media situation. Do you currently post on Instagram or TikTok?"
*Listen. Understand their pain.*

**Solution Demo (5 min)**
"Here's how it works. You take a photo of your finished hardscape—patios, walkways, pool decks, whatever you just installed. You upload it to a simple form. Our AI writes an optimized caption. You approve it. We post it to Instagram, TikTok, Facebook automatically at the time you want."

*Show them the submission portal.*

**Pricing & Trial (3 min)**
"It's $50/month per team member. That's 25x cheaper than hiring a freelancer, and way more reliable."

"How about this: Let's get you set up. We'll do the first month manually to make sure it's working for you. After that, if you love it, we'll automate it so you literally don't have to do anything."

"Can I get you started?"

**If Yes:**
1. Get their name, email, phone
2. Create customer record in Vercel KV
3. Generate unique submission URL
4. Send them:
   - Submission URL (in email or text)
   - This message: "Submit photos whenever you finish a job. I'll caption and schedule them. You'll get a text when they're scheduled."
5. Set calendar reminder: "Check in with [customer name] in 3 days. How many posts did they submit?"

**If No:**
"No problem! What would make it more interesting for you?"
*Listen and note for later.*

---

## Week 1 Check-Ins

After onboarding, text customer every 3 days:
"Hey [Name], how are things going with HardscapeAI? Any questions? Just remember—whenever you finish a job, snap a photo and upload it."

Monitor:
- How many photos are they submitting?
- Any feedback on captions?
- Are the posts getting engagement on their socials?

Adjust based on feedback.
```

### Commit

```bash
git add docs/ONBOARDING.md
git commit -m "docs: add customer onboarding script"
```

---

## Task 10: Create README & Launch Checklist

**Files:**
- Create: `README.md`
- Create: `docs/LAUNCH_CHECKLIST.md`

### Step 1: Create `README.md`

```markdown
# HardscapeAI

AI Social Media for Hardscape Contractors.

## What is this?

HardscapeAI is a lightweight SaaS wrapper around Postiz (open-source social media scheduler). Hardscape contractors submit photos of their work. AI writes captions. Posts go to Instagram, TikTok, Facebook automatically.

**Value prop**: $50/month per team member. 25x cheaper than hiring a freelancer.

## Architecture

- **Frontend + Portal**: Next.js on Vercel (landing page + customer submission form)
- **Backend Scheduler**: Postiz on Railway (manages post scheduling and publishing)
- **Storage**: Vercel Blob (photos), Vercel KV (submissions database), Resend (emails)

## Quick Start (Development)

```bash
git clone https://github.com/YOUR_USERNAME/hardscape-ai.git
cd hardscape-ai
npm install
npm run dev
```

Open `http://localhost:3000`

## Production Deployment

### 1. Next.js App (Vercel)

```bash
vercel --prod
```

### 2. Postiz (Railway)

Go to `https://railway.app/new/postiz` and deploy.

### 3. Environment Variables

Set in Vercel dashboard:
- `BLOB_READ_WRITE_TOKEN`
- `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`
- `RESEND_API_KEY`
- `ADMIN_EMAIL`
- `CALENDLY_LINK`
- `NEXT_PUBLIC_BASE_URL`

## Usage

1. Customer books call via Calendly on landing page
2. During call, give them their unique submission URL
3. They submit photos via form whenever they finish a job
4. You receive email notifications
5. You log into Postiz, create post with AI caption, schedule
6. Post publishes automatically

## Future Roadmap

- Week 2: Automate approvals (customer approves via link, auto-publishes)
- Week 3: Add analytics dashboard
- Week 4: Payment integration (Stripe)

## Support

Questions? Contact erik.andersson@eligeo.com

---

Built with Next.js, Vercel, Railway, and Postiz.
```

### Step 2: Create `docs/LAUNCH_CHECKLIST.md`

```markdown
# 24-Hour Launch Checklist

## Hour 1–2: Landing Page ✓
- [ ] Landing page live at hardscape-ai.vercel.app
- [ ] All sections render correctly
- [ ] Mobile responsive
- [ ] Calendly embed works
- [ ] No console errors

## Hour 3–4: Submission Portal ✓
- [ ] Form displays at /submit/[token]
- [ ] Photo upload works (drag/drop)
- [ ] Notes field works
- [ ] Form submission sends to API
- [ ] Blob storage configured and working
- [ ] No console errors

## Hour 5–6: Postiz ✓
- [ ] Postiz deployed on Railway
- [ ] Admin login works
- [ ] Instagram account connected
- [ ] TikTok account connected
- [ ] Facebook account connected
- [ ] Test post created and scheduled
- [ ] Post published at scheduled time

## Hour 7: Polish & Launch ✓
- [ ] Landing page typo check
- [ ] Links verified (Calendly, etc.)
- [ ] Email notifications tested (Resend)
- [ ] Submission-to-email flow end-to-end
- [ ] Calendly accessible and booking
- [ ] All environment variables set in production

## After Launch
- [ ] Post on Twitter/X: "Just launched HardscapeAI. AI social media for hardscape contractors. Free 15-min call if interested."
- [ ] Share landing page link with network
- [ ] Wait for first Calendly booking
- [ ] Prepare for onboarding call

## First Customer Success
- [ ] First customer books call
- [ ] Call completed, customer onboarded
- [ ] Customer submits first photo
- [ ] Email notification received
- [ ] Post created in Postiz
- [ ] Post scheduled and confirmed with customer
- [ ] Post published live on Instagram/TikTok/Facebook
- [ ] Customer confirms they see it live

## Week 1 Goals
- [ ] 3–5 customers onboarded
- [ ] 5–10 posts live on customer accounts
- [ ] Gather feedback on caption quality
- [ ] Document any feature requests
- [ ] Plan Week 2 automation

---

This is a validation mission. Prove the model works, then scale.
```

### Step 3: Commit

```bash
git add README.md docs/LAUNCH_CHECKLIST.md
git commit -m "docs: add README and launch checklist"
```

---

## Task 11: Final Testing & Production Verification

**Files:**
- None (testing only)

### Step 1: Test entire flow end-to-end

```bash
# 1. Visit landing page
open https://hardscape-ai.vercel.app

# 2. Verify sections load
#    - Hero visible
#    - Problem section visible
#    - Solution section visible
#    - Pricing visible
#    - CTA buttons work

# 3. Test Calendly embed
#    Click "Book Free 15-Min Call"
#    Verify Calendly opens

# 4. Test submission form
#    Get a test token from Vercel KV (or use "test-123")
#    Open https://hardscape-ai.vercel.app/submit/test-123
#    Upload a test photo
#    Verify success message

# 5. Test email notification
#    Check admin email for submission notification
#    Verify photo URL is accessible

# 6. Test Postiz
#    Log into Postiz instance
#    Create a test post with the submitted photo
#    Schedule for now
#    Verify it posts to Instagram (or whichever account is connected)

# 7. Test health check
curl https://hardscape-ai.vercel.app/api/health
# Expected: {"status":"ok","timestamp":"..."}
```

### Step 2: Spot-check production deployment

```bash
# Check Vercel deployment logs
vercel logs

# Check Railway logs
# (Go to Railway Dashboard → Postiz app → Logs)
```

### Step 3: Verify all environment variables are set

```bash
# In Vercel dashboard, verify all env vars are present:
vercel env list
```

Expected: All 7 variables configured.

### Step 4: Final commit

```bash
git add .
git commit -m "launch: HardscapeAI MVP ready for customers"
```

---

## Success Criteria (24h)

✅ **Landing page live**: `hardscape-ai.vercel.app` accessible, sections rendering, Calendly embed working
✅ **Postiz running**: Postiz instance deployed on Railway, accounts connected, test post successful
✅ **Submission form working**: Photos upload, email notifications sent, no errors
✅ **First Calendly booking**: Customer books onboarding call
✅ **First submission processed**: Customer submits photo → email notifies you → post created and scheduled in Postiz

---

## Week 1 Post-Launch

Once live:
1. Share landing page on Twitter/X, LinkedIn, with your network
2. Schedule first onboarding call
3. Process submissions manually (you in Postiz, you email customer confirmation)
4. Collect feedback on captions, posting frequency
5. Plan Week 2: Automate approvals (n8n/Make)

---

## Notes

- **Manual approval Day 1 is intentional.** You learn what customers actually need before automating.
- **Simple data model is intentional.** No auth, no complex state. Validate first.
- **Free tier services scale.** Vercel Blob, KV, Resend all have free tiers. Upgrade as you grow.
- **24 hours is about validation, not perfection.** First customer matters more than pixel-perfect UI.
```

### Step 5: Commit

```bash
git add docs/LAUNCH_CHECKLIST.md
git commit -m "docs: add testing and post-launch plan"
```

---

## Summary

**24 Total Hours:**
- Hours 1–2: Landing page
- Hours 3–4: Submission portal
- Hours 5–6: Postiz setup
- Hours 7+: Deploy, test, launch

**What you'll have:**
- Landing page at `hardscape-ai.vercel.app`
- Submission portal for customers
- Self-hosted Postiz on Railway
- Email notifications
- Ready to onboard first customer

**Next steps after 24h:**
1. Get first customer paying
2. Process submissions manually for 1 week
3. Gather feedback
4. Week 2: Automate approvals (n8n/Make)
5. Week 3+: Scale
