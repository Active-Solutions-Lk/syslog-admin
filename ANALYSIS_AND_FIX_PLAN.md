# Syslog Admin – Deep Analysis & Fix Plan

## 1. Project Overview

**Syslog Admin** is a Next.js 15 admin dashboard for managing syslog collection/analysis infrastructure. It handles:
- **Projects** (activation keys, linking collectors/analyzers/ports/packages)
- **Collectors** (syslog data collectors with IP/domain/secret keys)
- **Analyzers** (log analysis servers)
- **Ports** (network ports assigned to projects)
- **Packages** (subscription tiers with quotas)
- **Resellers & End Customers** (commercial relationships)
- **Admins** (system administrators/users)
- **API Logs** (system health monitoring – CPU, RAM, log counts)
- **Internal Logs** (audit trail for system actions)
- **Sessions** (JWT-based admin authentication)

---

## 2. Schema vs Code Discrepancies (CRITICAL)

The Prisma schema (`prisma/schema.prisma`) and the application code are **severely out of sync**. The schema has only **8 models**, but the code references **at least 11 models** and uses many fields that don't exist in the schema.

### 2.1 Missing Models in Schema

| Model Used in Code | Where Used | Exists in Schema? |
|---|---|---|
| `packages` | `actions/package.js`, `actions/project.js`, `seed.js` | ❌ **MISSING** |
| `session` | `actions/auth.js`, `api/login/route.jsx`, `seed.js` | ❌ **MISSING** |
| `api_logs` | `actions/api-logs.js`, `seed.js` | ❌ **MISSING** |
| `internal_log` | `actions/project.js`, `seed.js` | ❌ **MISSING** |

### 2.2 Field Mismatches – `admins` Model

| Field in Code | Field in Schema | Issue |
|---|---|---|
| `name` | `username` | ❌ Code uses `name`, schema has `username` |
| `passwordHash` | `password` | ❌ Code uses `passwordHash`, schema has `password` |
| `status` | — | ❌ Code uses `status` field, **not in schema** |
| `createdAt` | `created_at` | ❌ Code uses camelCase, schema uses snake_case |
| `updatedAt` | — | ❌ Code uses `updatedAt`, **not in schema** |
| `email` (unique) | `email` | ⚠️ Code does `findUnique({ where: { email } })` but schema has no `@unique` on email |

### 2.3 Field Mismatches – `reseller` Model

| Field in Code | Field in Schema | Issue |
|---|---|---|
| `customer_id` (PK) | `id` | ❌ Code uses `customer_id`, schema has `id` |
| `company_name` | `company` | ❌ Code uses `company_name`, schema has `company` |
| `type` | — | ❌ **Not in schema** |
| `credit_limit` | — | ❌ **Not in schema** |
| `payment_terms` | — | ❌ **Not in schema** |
| `note` | — | ❌ **Not in schema** |
| `vat` | — | ❌ **Not in schema** |
| `city` | — | ❌ **Not in schema** |
| — | `contact_person` | ❌ Schema has it but code doesn't use it |
| — | `tel` | ❌ Schema has it but code doesn't use it |
| — | `status` | ❌ Schema has it but code doesn't use it |

### 2.4 Field Mismatches – `projects` Model

| Field in Code | Field in Schema | Issue |
|---|---|---|
| `collector_ip` | `collector_id` | ❌ Code uses `collector_ip` (Int ID), schema has `collector_id` |
| `logger_ip` | — | ❌ **Not in schema** |
| `pkg_id` | — | ❌ **Not in schema** (no `packages` model) |
| `secret_key` | — | ❌ **Not in schema** |
| `type` | `project_type_id` | ❌ Code uses `type`, schema uses `project_type_id` as FK |
| `status` | — | ❌ **Not in schema** |
| `is_active_coll` | — | ❌ **Not in schema** |
| `is_active_an` | — | ❌ **Not in schema** |
| Relation `packages` | — | ❌ **Not in schema** (no packages model/relation) |
| Relation `collector` | `collectors` | ⚠️ Code uses `collector`, schema relation name is `collectors` |
| Relation `project_type` | `project_types` | ⚠️ Code uses `project_type`, schema relation name is  `project_types` |
| — | `device_count` | Schema has it, code may not use it consistently |

### 2.5 Field Mismatches – `collectors` Model

| Field in Code | Field in Schema | Issue |
|---|---|---|
| `last_fetched_id` | — | ❌ Code uses `last_fetched_id`, **not in schema** |

### 2.6 Field Mismatches – `ports` Model

| Field in Code | Field in Schema | Issue |
|---|---|---|
| `updated_at` | — | ❌ Code uses `updated_at`, schema only has `created_at` |
| `description` | `description` | Schema has `description` but code doesn't use it |

### 2.7 Field Mismatches – `project_types` Model

| Field in Code | Field in Schema | Issue |
|---|---|---|
| `name` | `type` | ❌ Code uses `name`, schema has `type` |

### 2.8 Field Mismatches – `end_customer` Model

| Field in Code | Field in Schema | Issue |
|---|---|---|
| `tel` handling | `tel` (VarChar) | ⚠️ Code does `parseInt(tel)` and `tel.toString()` but schema defines `tel` as `VarChar(20)` |

---

## 3. Missing Frontend Pages

### 3.1 Pages Referenced in Sidebar but NOT Created

| Page | URL in Sidebar | Status |
|---|---|---|
| **Settings / General** | `/dashboard/settings` | ❌ **No page exists** |
| **Console Logs** | `/dashboard/console-logs` | ❌ **No page exists** |

### 3.2 Pages That Should Be Added for Complete System

| Page | Purpose | Priority |
|---|---|---|
| **Settings (General)** | Manage system metadata (project types, etc.) | 🔴 High |
| **Console Logs** | View internal/audit logs | 🔴 High |
| **Dashboard Home** | Real dashboard with charts & KPIs (currently just empty placeholders) | 🟡 Medium |
| **Devices Management** | CRUD for `devices` model (exists in schema but no UI) | 🟡 Medium |
| **Project Detail / View** | Detailed view of a single project with its devices, logs | 🟡 Medium |
| **Admin Profile / My Account** | Current admin's profile settings, password change | 🟢 Low |

---

## 4. Settings Page Design Recommendation

The **Settings page** should be a tabbed interface to manage all system metadata:

### 4.1 Proposed Settings Tabs

```
/dashboard/settings
├── General Settings
│   ├── System Name / Branding
│   ├── Default timezone
│   └── API validation secret
│
├── Project Types
│   ├── List all project types
│   ├── Add new project type
│   ├── Edit project type (name, description)
│   └── Delete project type
│
├── Ports Management (move here from sidebar)
│   ├── List all ports with usage status
│   ├── Add/Edit/Delete ports
│   └── Show which projects use each port
│
├── Packages (move here from sidebar)
│   ├── List all packages
│   ├── Add/Edit/Delete packages
│   └── Show package usage stats
│
├── Admin Management (keep in sidebar OR move here)
│   ├── List admins
│   ├── Add/Edit/Delete admins
│   └── Role management
│
└── System Health
    ├── Database connection status
    ├── Active sessions count
    └── Recent internal logs
```

### 4.2 Implementation Approach

1. Create `/dashboard/settings/page.tsx` with a **tabbed layout** using Radix UI Tabs
2. Each tab renders a management component (reuse existing ones where possible)
3. Project Types management is **entirely new** – create:
   - `components/dashboard/project-type-management.tsx`
   - `components/dashboard/project-type-dialog.tsx`
   - `app/actions/project-types.js`
4. For General Settings, create a simple form that stores configs (could be env-based or DB-based)

---

## 5. Fix Plan

### Phase 1: Schema Alignment (CRITICAL – Must Fix First)

**Goal:** Update `prisma/schema.prisma` to include ALL models and fields actually used by the code.

#### Step 1.1: Add Missing Models

```prisma
model packages {
  id               Int        @id @default(autoincrement())
  name             String     @db.VarChar(100)
  log_count        Int        @default(0)
  log_duration     String?    @db.VarChar(50)
  project_duration String?    @db.VarChar(50)
  device_count     Int        @default(0)
  created_at       DateTime   @default(now()) @db.Timestamp(0)
  updated_at       DateTime   @default(now()) @db.Timestamp(0)
  projects         projects[]
}

model session {
  id           String   @id
  userId       String   @db.VarChar(255)
  sessionToken String   @unique @db.VarChar(500)
  expires      DateTime @db.Timestamp(0)
  createdAt    DateTime @default(now()) @db.Timestamp(0)
  updatedAt    DateTime @default(now()) @db.Timestamp(0)
}

model api_logs {
  id              Int       @id @default(autoincrement())
  project_id      Int
  cpu_status      Float?    @default(0)
  ram_status      Float?    @default(0)
  log_count       Int?      @default(0)
  type            String?   @db.VarChar(50)
  device_count    Int?      @default(0)
  last_login_date DateTime? @db.Timestamp(0)
  description     String?   @db.Text
  created_at      DateTime  @default(now()) @db.Timestamp(0)
  updated_at      DateTime  @default(now()) @db.Timestamp(0)
  project         projects  @relation(fields: [project_id], references: [id])

  @@index([project_id])
}

model internal_log {
  id               Int      @id @default(autoincrement())
  related_table    String?  @db.VarChar(100)
  related_table_id Int?
  severity         Int?     @default(1)
  message          String?  @db.Text
  admin_id         Int?
  action           String?  @db.VarChar(100)
  status_code      Int?
  additional_data  String?  @db.Text
  created_at       DateTime @default(now()) @db.Timestamp(0)
  updated_at       DateTime @default(now()) @db.Timestamp(0)
}
```

#### Step 1.2: Fix `admins` Model

```prisma
model admins {
  id           Int        @id @default(autoincrement())
  name         String     @db.VarChar(50)        // was: username
  email        String     @unique @db.VarChar(100) // add @unique
  passwordHash String     @db.VarChar(255)        // was: password
  role         String?    @default("admin") @db.VarChar(20)
  status       Int        @default(1)             // NEW: add status
  createdAt    DateTime   @default(now()) @db.Timestamp(0) // was: created_at
  updatedAt    DateTime   @default(now()) @db.Timestamp(0) // NEW
  projects     projects[]
}
```

#### Step 1.3: Fix `reseller` Model

Either update the schema to match the code OR update the code to match the schema. **Recommendation: Update schema to match code** since the code is more feature-rich:

```prisma
model reseller {
  customer_id    Int        @id @default(autoincrement())  // was: id
  company_name   String     @unique @db.VarChar(100)       // was: company
  address        String?    @db.VarChar(255)
  type           String?    @default("Standard") @db.VarChar(50)    // NEW
  credit_limit   String?    @db.VarChar(50)                          // NEW
  payment_terms  String?    @db.VarChar(100)                         // NEW
  note           String?    @db.Text                                 // NEW
  vat            String?    @db.VarChar(50)                          // NEW
  city           Int?                                                // NEW
  created_at     DateTime   @default(now()) @db.Timestamp(0)
  updated_at     DateTime   @default(now()) @db.Timestamp(0)
  projects       projects[]
}
```

#### Step 1.4: Fix `projects` Model

Add all missing fields and fix relation names:

```prisma
model projects {
  id              Int           @id @default(autoincrement())
  activation_key  String        @unique @db.VarChar(100)
  secret_key      String?       @unique @db.VarChar(255)   // NEW
  collector_ip    Int?                                       // was: collector_id → renamed
  logger_ip       Int?                                       // NEW
  pkg_id          Int           @default(1)                  // NEW (FK to packages)
  project_type_id Int
  port_id         Int?                                       // make optional
  admin_id        Int?                                       // make optional
  reseller_id     Int?
  end_customer_id Int?
  type            Int           @default(1)                  // NEW (redundant with project_type_id?)
  status          Boolean       @default(true)               // NEW
  is_active_coll  Int?          @default(1)                  // NEW
  is_active_an    Int?          @default(1)                  // NEW
  device_count    Int           @default(5)
  created_at      DateTime      @default(now()) @db.Timestamp(0)
  updated_at      DateTime      @default(now()) @db.Timestamp(0)
  
  // Relations
  devices         devices[]
  api_logs        api_logs[]
  project_types   project_types @relation(fields: [project_type_id], references: [id])
  port            ports?        @relation(fields: [port_id], references: [id])
  admins          admins?       @relation(fields: [admin_id], references: [id])
  reseller        reseller?     @relation(fields: [reseller_id], references: [id])
  end_customer    end_customer? @relation(fields: [end_customer_id], references: [id])
  collectors      collectors?   @relation(fields: [collector_ip], references: [id])
  packages        packages      @relation(fields: [pkg_id], references: [id])
  analyzers       analyzers?    @relation(fields: [logger_ip], references: [id])
  // Note: the code also uses a 'collector' and 'project_type' relation alias
}
```

#### Step 1.5: Fix `collectors` Model

Add `last_fetched_id`:

```prisma
model collectors {
  id              Int        @id @default(autoincrement())
  name            String     @db.VarChar(100)
  ip              String?    @db.VarChar(100)
  domain          String?    @db.VarChar(255)
  secret_key      String?    @db.VarChar(255)
  last_fetched_id Int        @default(0)           // NEW
  is_active       Boolean    @default(true)
  created_at      DateTime   @default(now()) @db.Timestamp(0)
  updated_at      DateTime   @default(now()) @db.Timestamp(0)
  projects        projects[]
}
```

#### Step 1.6: Fix `ports` Model

Add `updated_at`:

```prisma
model ports {
  id          Int        @id @default(autoincrement())
  port        Int
  description String?    @db.VarChar(100)
  created_at  DateTime   @default(now()) @db.Timestamp(0)
  updated_at  DateTime   @default(now()) @db.Timestamp(0)  // NEW
  projects    projects[]
}
```

#### Step 1.7: Fix `project_types` Model

Rename `type` to `name` to match code:

```prisma
model project_types {
  id          Int        @id @default(autoincrement())
  name        String     @db.VarChar(50)        // was: type
  description String?    @db.VarChar(255)
  created_at  DateTime   @default(now()) @db.Timestamp(0)
  projects    projects[]
}
```

#### Step 1.8: Fix `end_customer` – `tel` type consistency

The schema has `tel` as `VarChar(20)` but the code does `parseInt(tel)` and `tel.toString()`. Decision needed:
- **Option A:** Keep as VarChar, remove parseInt/toString in code ✅ (Recommended)
- **Option B:** Change schema to Int

---

### Phase 2: Create Missing Pages

#### Step 2.1: Settings Page (`/dashboard/settings`)
- Create tabbed settings page
- Tab 1: **Project Types** – CRUD management
- Tab 2: **General** – System configuration
- Create supporting actions & components

#### Step 2.2: Console Logs Page (`/dashboard/console-logs`)
- Display internal_log entries
- Filter by severity, action, date range
- View detailed log entries

#### Step 2.3: Enhance Dashboard Home (`/dashboard`)
- Replace placeholder boxes with actual KPI cards:
  - Total Projects / Active Projects
  - Total Collectors / Active Collectors  
  - Total Analyzers
  - Recent API Logs summary
- Add charts (already have chart components)

#### Step 2.4: Devices Management (`/dashboard/devices`)
- CRUD for devices linked to projects
- Show device keys, package dates, log duration

---

### Phase 3: Code Quality Fixes

#### Step 3.1: Prisma Client Singleton
Every action file creates a new `PrismaClient()`. This should be a singleton:

```javascript
// lib/prisma.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;
const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
export default prisma;
```

#### Step 3.2: Remove `$disconnect()` from server actions
Server actions shouldn't disconnect the global client after each call.

#### Step 3.3: Fix unused imports in dashboard pages
Example: `admins/page.jsx` imports `bcrypt`, `useState`, `useEffect`, `DataTable`, `Avatar`, `Button`, `AuthWrapper`, `getCurrentUser`, `redirect` – but the page only renders `<AdminManagement />`.

---

## 6. Priority Summary

| Priority | Task | Estimated Effort |
|---|---|---|
| 🔴 P0 | Update schema to match code (Phase 1) | ~2–3 hours |
| 🔴 P0 | Run `prisma db push` or create migration | ~30 min |
| 🔴 P0 | Update seed.js to match corrected schema | ~1 hour |
| 🟡 P1 | Create Settings page with Project Types CRUD | ~3–4 hours |
| 🟡 P1 | Create Console Logs page | ~2–3 hours |
| 🟡 P1 | Enhance Dashboard home with KPIs | ~2–3 hours |
| 🟢 P2 | Create Devices management page | ~2–3 hours |
| 🟢 P2 | Prisma singleton + code cleanup | ~1–2 hours |
| 🟢 P3 | Admin profile / account page | ~1–2 hours |

---

## 7. Decision Points Needed From You

1. **Schema vs Code – which is source of truth?** 
   - The database (schema reflects actual DB) → update code
   - The code (schema is outdated) → update schema ← **Most likely this one**

2. **Reseller model:** Should we keep the expanded fields (`customer_id`, `company_name`, `credit_limit`, etc.) or revert to the simpler schema?

3. **Settings page scope:** Should Ports and Packages management be moved INTO the Settings page, or keep them as standalone sidebar items?

4. **`tel` field in `end_customer`:** Keep as VarChar (remove parseInt) or change to Int?
