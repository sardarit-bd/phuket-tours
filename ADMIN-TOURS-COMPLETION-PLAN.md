# PhuketTours — Admin Tours Management Completion Plan

**Target:** Complete Admin Tours Management  
**Frontend Path:** `/home/owakeel/Workspace/Owakeel/carlsimpson/phuket-tours`  
**Backend Path:** `/home/owakeel/Workspace/Owakeel/carlsimpson/qbictravel_backend-main`  
**Date:** November 1, 2026  
**Status:** In Progress — Milestone 1 (Audit & Plan)  

---

## 0. Non-Negotiable Constraint

> [!CAUTION]
> The existing 462 Tours in `tours-data.ts` are dummy data.
> We will **NOT** work on these records under any circumstances in this phase.
> All functionality will be built, validated, and verified using real Backend APIs and new administrative entries.

---

## 1. Implementation Roadmap & Milestones

### Milestone 1 — Architecture Audit & Planning (Complete)
- **Objective:** Deep audit of existing frontend and backend code, contracts, Prisma models, RTK Query endpoints, and shared components.
- **Deliverables:**
  - [`ADMIN-TOURS-COMPLETION-AUDIT.md`](./ADMIN-TOURS-COMPLETION-AUDIT.md)
  - [`ADMIN-TOURS-COMPLETION-PLAN.md`](./ADMIN-TOURS-COMPLETION-PLAN.md)
  - [`ADMIN-TOURS-COMPLETION-PROGRESS.md`](./ADMIN-TOURS-COMPLETION-PROGRESS.md)

### Milestone 2 — Tour Create: Basic Information
- **Objective:** Implement step/tab 1 of the Tour Editor (`TourEditorModal`).
- **Features:**
  - Tour Title with automatic slug generation (and manual slug override).
  - Subtitle, Short description, and Full description.
  - Destination selection (e.g. Phi Phi Islands, Phang Nga Bay, Similan Islands, Phuket).
  - Location details (City, Country, Departure Point / Pier).
  - Duration (text, e.g. "Full Day - 8 Hours") and Duration Category (`half-day`, `full-day`, `multi-day`).
  - Tour Type (`island-tours`, `adventure`, `cultural-sightseeing`, etc.).
  - Group size limit and supported guide languages.
  - Operator / Provider name and reference.
  - Form validation with Zod / native validation.

### Milestone 3 — Tour Create: Pricing & Packages
- **Objective:** Implement step/tab 2 for Pricing & Tiered Packages.
- **Features:**
  - Standard Pricing: Currency (`USD`, `THB`), Base Adult Price, Discounted Promotional Price, Tax Rate (%).
  - Multi-tier Pricing Matrix: Adult, Child (4-11), Infant (0-3), Private Charter.
  - Inclusions & Exclusions list builder (e.g., lunch, hotel transfer, national park fee, snorkeling gear).
  - Highlights list builder.
  - Integration with backend `PUT /admin/services/:serviceId/pricing`.

### Milestone 4 — Tour Create: Itinerary Builder
- **Objective:** Implement step/tab 3 for Day-by-Day / Hourly Itinerary.
- **Features:**
  - Add, edit, and remove itinerary stops/days.
  - Time slot / departure time (e.g., "08:00 AM").
  - Stop title (e.g., "Hotel Pickup & Pier Check-in").
  - Rich activity description (e.g., "Transfer by air-conditioned van to Royal Phuket Marina").
  - Reordering (Move Up / Move Down).
  - Clean preview timeline.

### Milestone 5 — Tour Create: Availability & Departure Schedules
- **Objective:** Implement step/tab 4 for Schedules and Availability.
- **Features:**
  - Operating schedule options: Daily vs. Specific Days of Week (Mon, Wed, Fri, etc.).
  - Date picker / multi-date selector for specific departure dates.
  - Capacity per departure / slot (e.g., 25 passengers).
  - Integration with backend `PUT /admin/services/:serviceId/availability`.
  - Blocked / blackout dates management.

### Milestone 6 — Tour Create: Image Management (Cloudinary Integration)
- **Objective:** Implement step/tab 5 for Media Gallery Management.
- **Features:**
  - Reusing existing Cloudinary Media Library (`src/features/admin/components/media/`).
  - "Select from Media Library" modal picker to pick already uploaded Cloudinary assets.
  - "Upload New Images" directly using the existing signed Cloudinary uploader.
  - Set Cover / Featured Image (`metadata.featuredImage`).
  - Gallery order sequencing and removal (`metadata.images`).
  - Associating uploaded media records with `serviceId`.

### Milestone 7 — Tour Edit: Complete Data Loading & Updating
- **Objective:** Connect Tour Edit workflow for existing tours.
- **Features:**
  - Fetch actual saved Tour via `GET /admin/services/:serviceId`.
  - Pre-populate all form fields across all 5 tabs.
  - Preserve unchanged metadata attributes without accidental clearing.
  - Execute `PATCH /admin/services/:serviceId`, `PUT /admin/services/:serviceId/pricing`, and availability updates.
  - Refetch table listing and detail views upon successful update.
  - Discard/Cancel confirmation if dirty.

### Milestone 8 — Tour Details View Enhancement
- **Objective:** Upgrade `TourDetailsDialog` into a comprehensive presentation console.
- **Features:**
  - Display Cover photo and clickable gallery thumbnails.
  - Display Basic metadata (destination, duration, languages, group size, provider).
  - Display Detailed Pricing breakdown (base, discount, tax, tiers).
  - Display Interactive Itinerary timeline.
  - Display Inclusions & Exclusions badges.
  - Display Availability schedule & upcoming dates.
  - Quick action to open Tour Editor.

### Milestone 9 — Publication Workflow
- **Objective:** Implement and verify publication transitions.
- **Features:**
  - Save as Draft (`status: "DRAFT"`).
  - Publish immediately (`status: "PUBLISHED"`).
  - Unpublish / Retire (`status: "UNPUBLISHED"`).
  - Single status change confirmation and feedback banner.
  - Bulk status change synchronization.
  - Role guard validation.

### Milestone 10 — Full Verification & Regression Testing
- **Objective:** Verify end-to-end functionality, types, tests, and build.
- **Verification:**
  - Unit & Integration tests for Tour Editor, Details, and RTK Query APIs.
  - TypeScript typecheck (`npm run typecheck`).
  - ESLint (`npm run lint`).
  - Next.js production build (`npm run build`).
  - Backend Vitest test suite (`npm test`).
  - Full report generation.

---

## 2. Shared Component Architecture

```
src/features/admin/components/tours/
├── admin-tours-view.tsx           # Main listing console (Preserved & Enhanced)
├── tours-header.tsx               # Top header with "Add New Tour" trigger
├── tours-summary-cards.tsx        # Counters for All, Published, Draft, Unpublished
├── tours-toolbar.tsx              # Search, filter, sorting, reset
├── tours-table.tsx                # Data table with multi-select & row actions
├── tours-pagination.tsx           # Centralized pagination integration
├── tour-status-badge.tsx          # Status indicator badge
├── tour-actions-menu.tsx          # Row actions: View Details, Edit Tour, Status changes
├── tour-details-dialog.tsx        # Rich read-only detail inspector (Milestone 8)
├── tour-editor-modal.tsx          # Comprehensive Multi-Tab Create/Edit Suite (Milestones 2–7)
│   ├── tabs/
│   │   ├── basic-info-tab.tsx     # Tab 1: Title, slug, destination, duration, details
│   │   ├── pricing-tab.tsx        # Tab 2: Standard pricing & multi-tier packages
│   │   ├── itinerary-tab.tsx      # Tab 3: Day-by-day & time-stamped schedule builder
│   │   ├── availability-tab.tsx   # Tab 4: Departure calendar, capacity, days of week
│   │   └── media-tab.tsx          # Tab 5: Cover photo, Cloudinary media picker & gallery
│   └── tour-media-picker-dialog.tsx # Modal to pick existing assets from Media Library
```

---

## 3. Immediate Next Step

Proceed to **Milestone 2**:
1. Inject missing tour management endpoints into `admin-api.ts`.
2. Implement `TourEditorModal` and Tab 1 (Basic Information).
3. Connect `AdminToursView` "Add New Tour" to `TourEditorModal`.
