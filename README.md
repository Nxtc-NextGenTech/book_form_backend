# Backend (Express + TypeScript)

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

API base URL: `http://localhost:4000/api`

## Architecture

- `src/modules/*`: Repository/Service/Controller per domain
- `src/middleware/*`: auth, role guards, validation, error handling
- `src/config/*`: env, JWT, Supabase client
- `src/routes/index.ts`: route composition

## Key Capabilities

- Multi-tenant isolation through `institution_id`
- JWT auth with role-based access (ADMIN / INSTITUTION / PARENT)
- Zod request validation
- Ledger-based institution payment tracking
- Parent mobile + security-answer login flow
- Institution dashboard analytics and order export
- Institution slug and public form slug are auto-generated on registration
- Admin login is validated from `admins` table (seeded admin: `nphashir44@gmail.com`)
- New institutions auto-seed classes `1A` to `12A` and inherit active master catalog items
