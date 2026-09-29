# VeggiePos — Point-of-Sale for a Vegetable Business

A point-of-sale web application for a vegetable business. Cashiers process
transactions at the counter; the owner manages products and stock from an admin
area.

## Features

- **Cashier interface** (`kasir`) — fast transaction entry for daily sales
- **Admin area** — product and stock management
- **Authentication** — session-based login with hashed passwords (bcrypt) and
  signed tokens (JOSE)
- **Server-side validation** — every input validated with Zod
- **Relational data** — PostgreSQL via Prisma

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | bcryptjs + JOSE |
| Validation | Zod |
| Styling | Tailwind CSS |

## Project structure

```
src/
├── app/
│   ├── kasir/         # cashier / point-of-sale screen
│   ├── admin/         # admin management
│   ├── login/         # authentication
│   └── actions/       # server actions
├── components/        # UI components
├── lib/               # Prisma client, auth, helpers
└── proxy.ts

prisma/                # schema and migrations
docs/                  # design docs
  ├── rancangan-struktur-website.md
  └── wireframe-veggiepos.md
```

## Setup

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Copy `.env.example` to `.env.local` and set `DATABASE_URL`.
3. Run Prisma migrations:
   ```bash
   pnpm prisma migrate dev
   ```
4. Start the dev server:
   ```bash
   pnpm dev
   ```

## Notes

Vocational competency (ujikom) project — designed from wireframes and a written
structural plan before implementation (see `docs/`).
