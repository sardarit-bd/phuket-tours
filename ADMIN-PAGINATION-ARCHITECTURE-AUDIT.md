# Admin Pagination & Select Architecture Audit

**Project:** PhuketTours (Next.js Frontend)  
**Document:** `ADMIN-PAGINATION-ARCHITECTURE-AUDIT.md`  
**Date:** November 1, 2026  
**Auditor:** Senior Full-Stack Security & Application Architect  

---

## 1. Executive Summary

This architecture audit examines the pagination and dropdown/select implementations across the PhuketTours frontend repository (`src/`). The goal is to evaluate existing patterns, avoid redundant component duplication, and formulate a technical design for a centralized, reusable **Pagination** component and **Custom Select** component.

---

## 2. Audit Findings by Area

### A. Pagination Components Discovered
Our repository search identified three distinct, isolated pagination implementations:

1. **`src/features/admin/components/media/admin-media-view.tsx` (Inline Pagination):**
   * **Implementation:** Pagination controls are rendered inline (lines 167–250).
   * **Controls:**
     * Left: Showing range text (`Showing X–Y of Z assets`) and an unstyled native HTML `<select>` for page size (`12, 24, 48`).
     * Right: `First` (ChevronsLeft), `Prev` (ChevronLeft), page counter (`Page X of Y`), `Next` (ChevronRight), and `Last` (ChevronsRight).
   * **Issues:** Pushes navigation controls to the far right edge; relies on raw native HTML `<select>`; duplicated pagination calculations; lacks visual centering.

2. **`src/features/admin/components/tours/tours-pagination.tsx` (Feature Component):**
   * **Implementation:** Isolated component inside `src/features/admin/components/tours/`.
   * **Controls:**
     * Left: Range text (`Showing X–Y of Z tours`) and a native HTML `<select>` for rows (`10, 25, 50, 100`).
     * Right: First, Prev, numbered page sequence with ellipsis (`getPageNumbers()`), Next, Last.
   * **Issues:** Scoped only to tours; also uses a native `<select>` for rows per page.

3. **`src/features/tours/components/tour-pagination.tsx` (Public Consumer Component):**
   * **Implementation:** Customer-facing pagination bar for the `/tours` public catalog.
   * **Controls:** Centered Previous button, numbered page sequence (up to 7 items with dual ellipsis), and Next button.
   * **Characteristics:** Specially tailored for public consumers (includes smooth-scrolling to `#tours-results-section`; does not include page size selector or administrative first/last buttons).

---

### B. Dropdown & Select Components Discovered

1. **`src/components/ui/custom-dropdown.tsx`:**
   * **Implementation:** Highly accessible, custom-styled dropdown component implementing WAI-ARIA `combobox` / `listbox` patterns.
   * **Features:**
     * Keyboard navigation (`ArrowDown`, `ArrowUp`, `Enter`, `Space`, `Escape`, `Tab`, `Home`, `End`).
     * Viewport-aware direction detection (automatically opens upwards if insufficient space below).
     * Click-outside listener (mouse and touch).
     * Active state checkmark, generic TypeScript value support `<T extends string>`.
   * **Adoption:** Currently used in `tour-results-header.tsx` (sort select) and `tours-toolbar.tsx` (category, duration, and sort filters).
   * **Suitability:** Extremely solid foundation. However, pagination requires a compact, inline sizing variant (`sm`) with concise trigger padding and customizable options (supporting numbers or strings).

2. **No shadcn/ui or Base-UI Select Primitive in Use:**
   * While `@radix-ui/react-slot` is present, no `@radix-ui/react-select` or Base-UI select is installed. The repository's design system standard is `src/components/ui/custom-dropdown.tsx`.

---

### C. Existing Admin Listing Pages State

| Admin Page | Path | Current Pagination State | Ready for Centralized Adoption? |
| :--- | :--- | :--- | :---: |
| **Media Library** | `/dashboard/admin/media` | Inline pagination with native `<select>` | **YES (Immediate)** |
| **Tours Management** | `/dashboard/admin/tours` | `ToursPagination` with native `<select>` | **YES (Immediate)** |
| **Bookings** | `/dashboard/admin/bookings` | Static placeholder; no table/API yet | No (Requires backend API in future phase) |
| **Users** | `/dashboard/admin/users` | Static placeholder; no table/API yet | No (Requires backend API in future phase) |
| **Categories** | `/dashboard/admin/categories` | Static placeholder; no table/API yet | No (Requires backend API in future phase) |
| **Settings** | `/dashboard/admin/settings` | Static form; non-paginated | N/A |

---

### D. Pagination API & State Conventions

1. **Shared Types (`src/types/common.ts`):**
   ```typescript
   export interface PaginationMeta {
     page: number;
     limit: number;
     total: number;
     totalPages: number;
     hasNextPage: boolean;
     hasPrevPage: boolean;
   }
   ```
2. **API Conventions:**
   * All backend APIs utilize 1-indexed `page` and integer `limit`.
   * Query responses provide `pagination: { page, limit, total, totalPages }`.
   * State in parent views is controlled via standard React hooks:
     `const [page, setPage] = useState(1);`
     `const [limit, setLimit] = useState(defaultLimit);`

---

## 3. Answers to Mandatory Audit Questions

### 1. Does a centralized Pagination component already exist?
**No.** The frontend has fragmented implementations: an inline JSX block in `AdminMediaView`, a feature-specific `ToursPagination` component in `src/features/admin/components/tours/`, and a public-facing `TourPagination` in `src/features/tours/components/`. There is no shared pagination component in `src/components/shared/` or `src/components/ui/`.

### 2. Is it currently used by multiple pages?
**No.** No pagination component is shared across multiple pages.

### 3. Is there an existing reusable Custom Select component?
**Yes.** `CustomDropdown` in `src/components/ui/custom-dropdown.tsx` provides full keyboard accessibility and custom styling. We will leverage and extend this foundation by creating a dedicated `CustomSelect` component (or compact variant) in `src/components/ui/custom-select.tsx` that supports number/string values, compact sizes (`sm`), and seamless integration for page-size and form dropdowns without native HTML `<select>`.

### 4. Are different pages implementing pagination independently?
**Yes.** Media Library and Tours Management implement pagination independently, each duplicating calculation logic and both using raw native `<select>` tags for page size.

### 5. What pagination state and API conventions are currently used?
Standard 1-indexed pagination:
* Parameters: `page` (1-indexed), `limit` (items per page).
* Metadata returned: `page`, `limit`, `total`, `totalPages`.
* Visible range calculation: `start = (page - 1) * limit + 1`, `end = Math.min(page * limit, total)`.

### 6. Which pages can reuse a shared Pagination component without changing their existing API behavior?
* **Media Library (`/dashboard/admin/media`):** Fully compatible; immediate adoption target.
* **Tours Management (`/dashboard/admin/tours`):** Fully compatible; immediate adoption target.
* **Bookings & Users:** Ready to adopt the shared component as soon as their backend table APIs are built.

---

## 4. Architectural Strategy & Next Phases

1. **Phase 2 — Centralized Custom Select (`src/components/ui/custom-select.tsx`):**
   * Build a versatile, accessible `CustomSelect` component built on the established styling and keyboard handling of `CustomDropdown`.
   * Support generic values `<T extends string | number>`, size variants (`sm`, `md`), disabled states, ARIA compliance, and customizable styling.

2. **Phase 3 & 4 — Centralized Pagination Component (`src/components/shared/pagination/pagination.tsx`):**
   * Create a presentation-only, fully controlled component accepting:
     `currentPage`, `pageSize`, `totalItems`, `totalPages`, `onPageChange`, `onPageSizeChange`, `pageSizeOptions`, `itemLabel`.
   * Layout:
     * **Left:** Result count (`Showing X–Y of Z [label]`) and `CustomSelect` for page size.
     * **Center:** Visually centered navigation controls (`First`, `Prev`, numbered sequence with ellipsis, `Next`, `Last`).
     * **Responsive:** Stacks cleanly on mobile without horizontal overflow; hides non-essential labels on small screens.

3. **Phase 5 & 6 — Integration:**
   * Media Library: Replace inline pagination with `<Pagination />`.
   * Tours Management: Replace `ToursPagination` with `<Pagination />` while preserving test IDs and handlers.
