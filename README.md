# TalentFlow SAP

**Accenture Talent Intelligence Platform** - Innovative hiring platform for SAP professionals in Brazil.

## Overview

TalentFlow SAP reinvents the traditional talent hiring process by combining multi-source discovery, AI-powered hyperpersonalized outreach, gamification, and LGPD-compliant data management. Built to source SAP professionals across all experience levels (Entry, Experienced, Lead, Expert) from channels beyond LinkedIn.

## Key Features

### Multi-Source Talent Discovery
- **GitHub**: SAP ABAP repositories, BTP projects, UI5 contributions
- **SAP Community**: Blog authors, Q&A contributors, SAP Mentors
- **Meetups & Events**: SAP Inside Track, ASUG Brasil, SAP TechEd
- **Publications**: Technical articles, academic papers, YouTube creators
- **Consulting Firms**: Track talent movement across SIs and Big4
- **Universities**: SAP University Alliances, Udacity graduates
- **Conferences**: Speaker and attendee databases

### AI-Powered Hyperpersonalized Outreach
- Experience-level-specific message templates (Entry/Experienced/Lead/Expert)
- Dynamic variable substitution with talent-specific context
- Accenture content integration (whitepapers, case studies, POVs)
- Tone adjustment (formal, casual, technical, enthusiastic)
- LGPD compliance verification before sending
- Engagement score prediction

### Gamification & Engagement
- SAP skill challenges (quizzes, mini-projects, assessments)
- Difficulty-matched to experience level
- Points and badge system with rarity tiers
- Talent leaderboard
- Challenge-linked outreach (invite candidates to prove their skills)

### Hiring Pipeline (Kanban)
- Visual kanban board with drag-and-drop stage progression
- 10-stage funnel: Discovered -> Enriched -> Outreach Ready -> Contacted -> Engaged -> Responded -> Screening -> Interviewing -> Offer -> Hired
- Per-talent engagement scoring

### Campaign Management
- Multi-step outreach sequences
- Channel selection (Email, LinkedIn, WhatsApp)
- Campaign performance analytics
- A/B template testing support

### Content Hub
- Curated Accenture SAP content (RISE with SAP, BTP, myNav, Tech Vision)
- SAP partner content (certifications, learning paths)
- Udacity partnership courses
- Content recommendation engine based on talent profile

### LGPD Compliance
- Full consent management (grant, revoke, track)
- Data Subject Access Requests (DSAR)
- Right to erasure (Right to be forgotten)
- Data portability export
- Consent audit log
- Processing basis documentation

## Tech Stack

| Component  | Technology                         |
|------------|------------------------------------|
| Frontend   | React 19, TypeScript, Tailwind CSS |
| Backend    | Node.js, Express, TypeScript       |
| Database   | SQLite (via better-sqlite3)        |
| Charts     | Recharts                           |
| Icons      | Lucide React                       |
| Build      | Vite                               |

## Quick Start (Windows 11)

### Prerequisites
- [Node.js 18+](https://nodejs.org/) installed

### Option 1: One-Click Setup
```
setup.bat
start.bat
```

### Option 2: PowerShell
```powershell
.\start.ps1
```

### Option 3: Manual
```bash
npm install
npx tsx server/db/migrate.ts
npx tsx server/db/seed.ts
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## Project Structure

```
talentflow-sap/
├── server/                  # Backend
│   ├── db/                  # Database schema, migrations, seed
│   ├── routes/              # API route handlers
│   │   ├── talents.ts       # Talent CRUD + filtering
│   │   ├── campaigns.ts     # Campaign management
│   │   ├── templates.ts     # Message templates
│   │   ├── outreach.ts      # AI outreach generation + sending
│   │   ├── gamification.ts  # Challenges, badges, leaderboard
│   │   ├── content.ts       # Content hub + recommendations
│   │   ├── analytics.ts     # Dashboard metrics + funnel
│   │   ├── lgpd.ts          # LGPD compliance + DSAR
│   │   └── sourcing.ts      # Multi-source discovery
│   └── index.ts             # Server entry point
├── src/                     # Frontend (React)
│   ├── pages/               # Page components
│   │   ├── Dashboard.tsx     # Analytics dashboard
│   │   ├── TalentPool.tsx    # Talent database with filters
│   │   ├── TalentDetail.tsx  # Individual talent profile
│   │   ├── Pipeline.tsx      # Kanban hiring pipeline
│   │   ├── Campaigns.tsx     # Campaign management
│   │   ├── Outreach.tsx      # AI outreach generator
│   │   ├── Gamification.tsx  # Challenges, badges, leaderboard
│   │   ├── ContentHub.tsx    # Curated content library
│   │   ├── Sourcing.tsx      # Multi-source discovery
│   │   └── LGPDCompliance.tsx # Privacy compliance center
│   ├── api.ts               # API client
│   ├── App.tsx               # Router + sidebar layout
│   └── main.tsx              # React entry point
├── shared/                   # Shared types
├── setup.bat                 # Windows first-time setup
├── start.bat                 # Windows startup script
└── start.ps1                 # PowerShell startup script
```

## API Endpoints

| Endpoint                          | Description                           |
|-----------------------------------|---------------------------------------|
| `GET /api/talents`                | List talents with filtering           |
| `POST /api/talents`               | Create a talent                       |
| `PUT /api/talents/:id`            | Update a talent                       |
| `POST /api/talents/:id/move-stage`| Move talent through funnel            |
| `POST /api/talents/bulk-import`   | Bulk import talents                   |
| `GET /api/campaigns`              | List campaigns                        |
| `POST /api/campaigns`             | Create campaign                       |
| `POST /api/outreach/generate`     | Generate AI-personalized message      |
| `POST /api/outreach/send`         | Send outreach message                 |
| `POST /api/outreach/bulk-send`    | Bulk send messages                    |
| `GET /api/gamification/challenges`| List challenges                       |
| `POST /api/gamification/challenges/:id/submit` | Submit challenge    |
| `GET /api/gamification/leaderboard`| Talent leaderboard                   |
| `GET /api/content`                | List content pieces                   |
| `GET /api/content/recommend/:id`  | Recommend content for talent          |
| `GET /api/analytics/dashboard`    | Dashboard metrics                     |
| `GET /api/analytics/funnel`       | Funnel analysis                       |
| `GET /api/lgpd/overview`          | LGPD compliance overview              |
| `POST /api/lgpd/consent/:id/grant`| Grant consent                        |
| `GET /api/lgpd/dsar/:id`         | Data subject access request           |
| `DELETE /api/lgpd/erase/:id`     | Right to erasure                      |
| `GET /api/sourcing/overview`      | Sourcing channels overview            |

## Accenture Integration

The platform leverages Accenture's public assets:
- RISE with SAP transformation content
- S/4HANA implementation case studies
- BTP innovation articles
- Technology Vision reports
- myNav platform insights
- Udacity partnership courses
- SAP Clean Core strategy whitepapers

## Seed Data

The application comes pre-loaded with:
- 150 sample SAP talent profiles across all experience levels
- 3 active campaigns with realistic metrics
- 6 message templates (level-specific + follow-ups)
- 5 SAP challenges (quizzes, mini-projects, assessments)
- 8 badges with rarity tiers
- 10 content pieces from Accenture, SAP, and Udacity

---

Built for Accenture SAP Practice - Brazil
