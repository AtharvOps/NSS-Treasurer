# NSS Treasurer • Financial Management & Audit Portal

<div align="center">

![NSS Logo](https://img.shields.io/badge/NSS%20Unit-PVG's%20COET%20Pune-1e3a8a?style=for-the-badge&logo=googleearth&logoColor=white)
[![Next.js](https://img.shields.io/badge/Next.js-16.3.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.0-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.9.1-2d3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Google Gemini](https://img.shields.io/badge/Gemini_AI-Multimodal_OCR-4285f4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Official Financial Governance, AI Receipt OCR, Grant Tracking & University Audit System for the NSS Unit of PVG's COET, Pune (Affiliated to Savitribai Phule Pune University — SPPU).**

[Features](#-key-features) • [Architecture](#-system-architecture) • [Tech Stack](#-tech-stack) • [Database Schema](#-database-schema) • [Getting Started](#-getting-started) • [Deployment](#-deployment) • [License](#-license)

</div>

---

## 📌 Overview

**NSS Treasurer** is a purpose-built enterprise financial management system designed specifically for the National Service Scheme (NSS) cell at PVG's COET, Pune. It streamlines the lifecycle of college camp budgets, university grant distributions, reimbursement approvals, and physical/digital receipt auditing.

The system replaces manual paper logs and spreadsheets with **Gemini AI Receipt OCR**, real-time **SPPU Audit Statement Generation**, and automated **Budget Alert Notifications**.

---

## ✨ Key Features

### 🔍 1. Gemini AI Receipt OCR
- **Multimodal Receipt Extraction**: Automatically extracts amount, transaction date, merchant/store name, description, and suggested NSS category directly from receipt photos or invoices.
- **Resilient Fallback Engine**: Seamless failover across active Google Gemini models (`gemini-3.5-flash`, `gemini-3.6-flash`, `gemini-3.7-flash`, `gemini-3.1-flash-lite`, `gemini-flash-latest`) to eliminate rate-limit or downtime disruptions.
- **Single-Click Autofill**: Automatically populates the transaction voucher form with 1 clean toast notification.

### 🧾 2. Receipt Proof & Audit Vault
- **Digital Proof Persistence**: Scanned receipts are converted to secure Base64 data URLs and stored directly in the PostgreSQL database alongside transaction records.
- **Audit Proof Modal**: Click on any transaction's receipt badge in the ledger table to inspect the high-resolution receipt proof, verify voucher details, or download the original image.

### 🏛️ 3. Official SPPU Audit Statement Generator
- **University Compliant PDF Statements**: Formatted with the official NSS seal, college header, and designated signature blocks for the **NSS Treasurer**, **Programme Officer (PO)**, and **Principal**.
- **Categorized Headings**: Groups expenses into official SPPU categories: *7-Day Annual Special Camp, Blood Donation, Tree Plantation, Youth Festival, Regular Activities, and Awareness Drives*.
- **CSV & Excel Export**: Instant export of raw ledger statements with complete metadata tags.

### 📊 4. Grant Utilization & Budget Tracking
- **Dynamic Utilization Visualizer**: Live progress bar tracking monthly spend against the university grant allocation.
- **Color-Coded Thresholds**: Safe (Green) for `<80%` spend and Critical (Red) for `≥80%` and budget cap exceedance.
- **Real-Time Email Alerts**: Automatically dispatches rich HTML budget warning emails via **Resend** when an expense crosses 80% or 100% of the allocated funds. Includes an instant test button.

### 🤖 5. NSS AI Financial Assistant
- **Context-Aware Intelligence**: Integrated chatbot connected to live account balances, historical vouchers, and NSS guidelines.
- **Automated Drafting**: Generates formal *Expense Justification Notes* and *Letters to the Programme Officer*.
- **Pre-Audit Compliance Checks**: Detects missing receipt vouchers or unclassified expenses prior to final submission.

### 🔐 6. Security & Infrastructure
- **Clerk Authentication**: Secure role-ready user authentication and session management.
- **ArcJet Defense**: Token-bucket rate limiting and bot detection on sensitive server actions.
- **Inngest Automated Workflows**: Background cron triggers for monthly statements and recurring transactions.

---

## 🏗 System Architecture

```
                                  ┌────────────────────────┐
                                  │      Client Layer      │
                                  │ Next.js 16 App Router  │
                                  │   (React 19 + Tailwind)│
                                  └───────────┬────────────┘
                                              │
                                              │ Server Actions
                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Application Backend                                     │
├────────────────────────┬──────────────────────────┬───────────────────────────────────────┤
│     Authentication     │       AI Services        │               Workflows               │
│      (Clerk Auth)      │  (Google Gemini 3.x OCR) │           (Inngest Background)        │
├────────────────────────┼──────────────────────────┼───────────────────────────────────────┤
│    Security Shield     │       Email Engine       │           Database Adapter            │
│       (ArcJet)         │      (Resend API)        │        (Prisma 7 + pg Adapter)        │
└────────────────────────┴────────────┬─────────────┴───────────────────────────────────────┘
                                      │
                                      ▼
                         ┌──────────────────────────┐
                         │   PostgreSQL Database    │
                         │ (Users, Accounts, Budgets│
                         │  Transactions & Proofs)  │
                         └──────────────────────────┘
```

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **UI & Components** | [React 19](https://react.dev/), [Shadcn UI](https://ui.shadcn.com/), [Radix UI](https://www.radix-ui.com/) |
| **Styling & Animations** | [Tailwind CSS v4](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/) |
| **AI / Machine Learning** | [Google Generative AI SDK](https://ai.google.dev/) (`gemini-3.5-flash`, `gemini-3.6-flash`, etc.) |
| **ORM & Database** | [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-pg` & [PostgreSQL](https://www.postgresql.org/) |
| **Authentication** | [Clerk](https://clerk.com/) |
| **Email Delivery** | [Resend](https://resend.com/) & [React Email](https://react.email/) |
| **Background Jobs** | [Inngest](https://www.inngest.com/) (Cron & Event Batching) |
| **Security & Rate Limiting** | [ArcJet](https://arcjet.com/) |
| **PDF & Document Export** | [jsPDF](https://github.com/parallax/jsPDF) & [jsPDF-AutoTable](https://github.com/simonbengtsson/jsPDF-AutoTable) |
| **Forms & Validation** | [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) |

---

## 🗄 Database Schema

```prisma
datasource db {
  provider = "postgresql"
}

model User {
  id           String        @id @default(uuid())
  clerkUserId  String        @unique
  email        String        @unique
  name         String?
  imageUrl     String?
  transactions Transaction[]
  accounts     Account[]
  budgets      Budget[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@map("users")
}

model Account {
  id           String        @id @default(uuid())
  name         String
  type         AccountType   // CURRENT | SAVINGS
  balance      Decimal       @default(0)
  isDefault    Boolean       @default(false)
  userId       String
  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@index([userId])
  @@map("accounts")
}

model Transaction {
  id                String             @id @default(uuid())
  type              TransactionType    // INCOME | EXPENSE
  amount            Decimal
  description       String?
  date              DateTime
  category          String
  receiptUrl        String?            // Base64 Scanned Proof
  isRecurring       Boolean            @default(false)
  recurringInterval RecurringInterval? // DAILY | WEEKLY | MONTHLY | YEARLY
  nextRecurringDate DateTime?
  lastProcessed     DateTime?
  status            TransactionStatus  @default(COMPLETED)
  userId            String
  user              User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  accountId         String
  account           Account            @relation(fields: [accountId], references: [id], onDelete: Cascade)
  createdAt         DateTime           @default(now())
  updatedAt         DateTime           @updatedAt

  @@index([userId])
  @@index([accountId])
  @@map("transactions")
}

model Budget {
  id            String    @id @default(uuid())
  amount        Decimal
  lastAlertSent DateTime?
  userId        String    @unique
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([userId])
  @@map("budgets")
}
```

---

## 📁 Project Structure

```
nss_treasurer/
├── actions/                  # Next.js Server Actions
│   ├── accounts.js           # Account creation & ledger queries
│   ├── ai-assistant.js       # NSS AI Assistant handler with Gemini fallback
│   ├── budget.js             # Budget updates & real-time alert emails
│   ├── dashboard.js          # Aggregated KPI and overview metrics
│   ├── send-email.js         # Resend email client & error handling
│   └── transaction.js        # Transaction creation & Gemini AI OCR scanning
├── app/                      # Next.js App Router Pages & Components
│   ├── (auth)/               # Clerk authentication routes (Sign In / Sign Up)
│   ├── (main)/
│   │   ├── account/          # Account details and transaction table
│   │   ├── dashboard/        # KPI dashboard, budget card & overview
│   │   └── transaction/      # Add voucher form & AI receipt scanner
│   ├── api/                  # API endpoints (Inngest, seed)
│   ├── globals.css           # Tailwind CSS v4 design system
│   └── layout.js             # Root layout with ThemeProvider & Sonner Toaster
├── components/               # Reusable UI & Business Components
│   ├── audit-report-modal.jsx # SPPU PDF & CSV Statement generator
│   ├── nss-ai-drawer.jsx     # AI Assistant slide-out interface
│   ├── header.jsx            # Official navigation header
│   ├── footer.jsx            # PVG's COET NSS footer
│   └── ui/                   # Styled Shadcn / Radix UI primitives
├── data/                     # NSS constants, events & category colors
│   ├── categories.js         # Financial category color mapping
│   ├── landing.js            # Landing page features & statistics
│   └── nss-events.js         # SPPU NSS event definitions & regex parsers
├── emails/                   # React Email templates
│   └── template.jsx          # Monthly report & budget alert templates
├── lib/                      # Core libraries & utilities
│   ├── arcjet.js             # Rate limiting & bot protection
│   ├── inngest/              # Inngest client & scheduled functions
│   ├── prisma.js             # PostgreSQL connection pool & Prisma client
│   └── utils.js              # Class merger utilities
└── prisma/
    ├── schema.prisma         # Database models & relations
    └── migrations/           # PostgreSQL migration history
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **PostgreSQL Database**: Local or cloud (e.g., Supabase, Neon, Railway, or Prisma Postgres)
- **API Keys**:
  - [Clerk Account](https://clerk.com/) (Authentication)
  - [Google AI Studio](https://aistudio.google.com/) (Gemini API Key)
  - [Resend Account](https://resend.com/) (Transactional Emails)
  - [ArcJet Account](https://arcjet.com/) (Security & Rate Limiting)

### 2. Clone and Install Dependencies

```bash
git clone https://github.com/AtharvOps/NSS-Treasurer.git
cd nss_treasurer
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nss_treasurer?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Google Gemini AI
GEMINI_API_KEY=AIzaSy...

# Resend Email Delivery
RESEND_API_KEY=re_...

# ArcJet Security
ARCJET_KEY=ajkey_...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup & Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Push migrations to your database
npx prisma db push
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing & Code Quality

```bash
# Run ESLint check (0 errors, 0 warnings)
npm run lint

# Run Next.js Production Build verification
npm run build
```

---

## 🌐 Deployment

The project is optimized for deployment on [Vercel](https://vercel.com/):

1. Push your code to a GitHub repository.
2. Import the repository in Vercel.
3. Configure the environment variables in Vercel Project Settings.
4. Set the Build Command to: `npm run build`
5. Deploy! 🚀

---

## 📜 License

This project is open-source and licensed under the [MIT License](LICENSE).

---

<div align="center">

**National Service Scheme (NSS Unit)**  
*Pune Vidyarthi Griha's College of Engineering and Technology, Pune*  
Affiliated to Savitribai Phule Pune University (SPPU)

*"NOT ME BUT YOU"*

</div>
