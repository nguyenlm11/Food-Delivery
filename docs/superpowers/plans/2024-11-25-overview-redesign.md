# Restaurant Overview Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use native execution (I implement in this session) with plan discipline.

**Goal:** Redesign Owner's Restaurant Overview page from placeholder UI to professional POS dashboard matching modern SaaS design patterns.

**Architecture:** Keep current mock data approach (no backend API changes). Reorganize layout into: PageHeader → KPI cards → Analytics section (line chart + donut chart) → Secondary sections (top items + recent activity). Use TailwindCSS grid for responsive desktop/tablet/mobile. Component strategy: inline simple JSX, extract only if reuse is clear.

**Tech Stack:** React 19, TypeScript, Tailwind 4, lucide-react icons, shadcn/ui primitives (Badge, Button if needed).

**Spec:** This plan implements the REDESIGN OVERVIEW PAGE task described in <user_query>.

## Global Constraints

- No new backend API calls — use mock data only.
- No new npm packages.
- No custom hooks, Redux, Zustand, or complex state mgmt.
- No generic component wrappers (no `<DashboardCard<T>>`, no `<ChartWrapper>`).
- Responsive: desktop (3+ col), tablet (2 col), mobile (1 col, single-width charts).
- No horizontal overflow on mobile.
- Build must pass: `npm run build` and `npm run lint`.
- Keep existing imports/patterns (axios, services structure, Tailwind design tokens).

## Review Focus

1. **Empty state on mobile:** Dashboard fills viewport without excessive scrolling or cramped text.
2. **Chart SVG rendering:** Line chart and donut chart SVG render correctly across all viewport sizes without clipping or blur.
3. **Responsive KPI cards:** 4 KPI cards stack cleanly on mobile (2×2 or 1×4), not overflow-hidden.
4. **Data accuracy with mock:** Top items, recent activity use realistic mock data that could plausibly come from an API.
5. **Typography hierarchy:** Page title > section title > card value > secondary text — visual diff is clear at a glance.

---

## File Structure

**Modified:**
- `FE/WEB/src/pages/owner/overview/RestaurantOverviewPage.tsx` — Rewrite from scratch. Single file, ~200–250 lines. Inline StatCard, RevenueChart, DonutChart, TopItems, RecentOrders as local functions within the page component. No separate files unless a function grows to 50+ lines with clear reuse (not expected).

**No new files** (keep it simple per ponytail).

---

## Task 1: Plan & Gather Data

**Files:**
- Reference: This plan document
- Gather info from: 
  - Current Overview page (~200 lines, mock data placeholder)
  - Design system: index.css tokens, existing card/badge components

**Interfaces:**
- Consumes: Reference image (visual direction)
- Produces: Detailed layout spec + mock data structure

**Steps:**

- [ ] **Step 1: Analyze current Overview page**
  - Understand structure: PageHeader, 4 stat cards, placeholder chart/activity sections.
  - Note what's working: PageHeader component, StatCard component, mock data structure.
  - Identify what must change: layout from vertical placeholder to multi-section dashboard; replace placeholder chart with real SVG; add top items + recent orders sections.

- [ ] **Step 2: Analyze reference image**
  - Desktop layout: KPI cards (1 row, 4 col) → Analytics (2-col: main chart + donut) → Secondary (top items, recent orders, etc.)
  - Visual pattern: clean cards, light borders, stat value large and bold, icons as accent, minimal shadow.
  - Typography: Page title prominent, section titles clear, values standout, secondary text muted.

- [ ] **Step 3: Define mock data structure**
  - KPI: `{ title, value, change, trend, icon }` ✓ (current, reuse)
  - Revenue chart: `{ date, revenue, orders }[]` × 7 days
  - Donut chart: `{ label, value, color }[]` for order status (Completed, Pending, Cancelled)
  - Top items: `{ rank, name, qty, revenue, percent }[]`
  - Recent orders: `{ id, customer, time, amount, status }[]`

- [ ] **Step 4: Decide inline vs. extract**
  - Inline in page: StatCard (simple), RevenueChart (SVG-only, ~40 lines), DonutChart (SVG-only, ~30 lines), TopItems (map, ~25 lines), RecentOrders (map, ~25 lines).
  - No extract: All fit inline, no reuse planned.

---

## Task 2: Implement Layout & KPI Cards

**Files:**
- Modify: `FE/WEB/src/pages/owner/overview/RestaurantOverviewPage.tsx`

**Interfaces:**
- Consumes: PageHeader component, Badge component, lucide-react icons
- Produces: Rendered KPI section (4 cards, responsive grid)

**Steps:**

- [ ] **Step 1: Set up page skeleton**
  - Import: PageHeader, Badge, icons (TrendingUp, ShoppingCart, DollarSign, Flame, ArrowUpRight, ArrowDownRight, CheckCircle, AlertCircle, Zap, Users).
  - Component signature: `export default function RestaurantOverviewPage() { ... }`
  - Structure: `<div className="flex h-full min-h-0 flex-col gap-6 overflow-y-auto">` (match current pattern).
  - Return: PageHeader + sections.

- [ ] **Step 2: Define KPI cards mock data**
  ```tsx
  const stats = [
    { title: "Doanh thu hôm nay", value: "2.4M₫", change: "+8%", icon: <DollarSign />, trend: "up" },
    { title: "Tổng đơn hôm nay", value: "24", change: "+12%", icon: <ShoppingCart />, trend: "up" },
    { title: "Khách hôm nay", value: "18", change: "+5%", icon: <Users />, trend: "up" },
    { title: "Tỉ lệ hoàn thành", value: "98%", change: "+2%", icon: <Zap />, trend: "up" }
  ]
  ```

- [ ] **Step 3: Render KPI section with StatCard**
  - Keep StatCard component (refactor slightly if needed for icon coloring).
  - Grid: `grid gap-4 sm:grid-cols-2 lg:grid-cols-4`.
  - Desktop: 4 col. Tablet (sm): 2 col. Mobile: 1 col (implicit from grid).

- [ ] **Step 4: Typecheck & verify build**
  - Run: `npm run build 2>&1 | head -20`
  - Expected: No errors in KPI section.
  - Commit: `git add FE/WEB/src/pages/owner/overview/RestaurantOverviewPage.tsx && git commit -m "refactor(frontend): setup overview page skeleton + kpi cards"`

---

## Task 3: Implement Revenue Chart (Line + Area SVG)

**Files:**
- Modify: `FE/WEB/src/pages/owner/overview/RestaurantOverviewPage.tsx`

**Interfaces:**
- Consumes: Badge component, mock revenue data
- Produces: Revenue chart section (SVG line chart, 60% width on desktop)

**Steps:**

- [ ] **Step 1: Define mock revenue data**
  ```tsx
  const revenueData = [
    { date: "T2", revenue: 1.2, orders: 18 },
    { date: "T3", revenue: 1.5, orders: 22 },
    { date: "T4", revenue: 1.8, orders: 25 },
    { date: "T5", revenue: 1.3, orders: 19 },
    { date: "T6", revenue: 2.1, orders: 28 },
    { date: "T7", revenue: 2.4, orders: 32 },
    { date: "CN", revenue: 2.8, orders: 35 }
  ]
  ```

- [ ] **Step 2: Create RevenueChart function (inline)**
  - Signature: `function RevenueChart({ data }: { data: typeof revenueData }) { ... }`
  - Render: Card wrapper + title/subtitle + SVG chart + legend.
  - Card: `className="rounded-xl border border-border-default bg-background-surface p-6 lg:col-span-2"`
  - SVG: viewBox="0 0 500 240", responsive width via Tailwind.
  - Draw: 2 polylines (revenue in primary, orders in success), light grid background.
  - Legend: Small dots + label below chart.

- [ ] **Step 3: Add RevenueChart to page**
  - Place in new `<section>` after KPI: `<section className="grid gap-4 lg:grid-cols-3">`
  - RevenueChart occupies `lg:col-span-2`.

- [ ] **Step 4: Typecheck & verify build**
  - Run: `npm run build 2>&1 | head -30`
  - Expected: No errors, chart renders.
  - Commit: `git add FE/WEB/src/pages/owner/overview/RestaurantOverviewPage.tsx && git commit -m "feat(frontend): add revenue line chart"`

---

## Task 4: Implement Donut Chart (Order Status)

**Files:**
- Modify: `FE/WEB/src/pages/owner/overview/RestaurantOverviewPage.tsx`

**Interfaces:**
- Consumes: Mock order status data
- Produces: Donut chart section (30% width on desktop, stacked on tablet/mobile)

**Steps:**

- [ ] **Step 1: Define mock order status data**
  ```tsx
  const orderStatus = [
    { label: "Hoàn thành", value: 32, color: "primary" },
    { label: "Chờ giao", value: 8, color: "status-warning" },
    { label: "Hủy", value: 2, color: "status-error" }
  ]
  ```

- [ ] **Step 2: Create DonutChart function (inline)**
  - Signature: `function DonutChart({ data }: { data: typeof orderStatus }) { ... }`
  - Render: Card + title + SVG donut + legend (vertical list).
  - SVG: Circle path arcs for each segment, calculate cx/cy/r from data percentages.
  - Donut formula: Use stroke-dasharray/stroke-dashoffset to draw arcs. Segment i starts at cumulative angle, length = (value/total)*360.
  - Legend: Below or beside donut, small colored squares + label + value.

- [ ] **Step 3: Add DonutChart to page**
  - Place in same `<section className="grid gap-4 lg:grid-cols-3">` as RevenueChart.
  - DonutChart: `className="rounded-xl border border-border-default bg-background-surface p-6"`
  - On lg: 1 col. On md/sm: wraps below RevenueChart.

- [ ] **Step 4: Typecheck & verify build**
  - Run: `npm run build 2>&1 | head -30`
  - Expected: No errors, donut renders.
  - Commit: `git add FE/WEB/src/pages/owner/overview/RestaurantOverviewPage.tsx && git commit -m "feat(frontend): add order status donut chart"`

---

## Task 5: Implement Top Selling Items Section

**Files:**
- Modify: `FE/WEB/src/pages/owner/overview/RestaurantOverviewPage.tsx`

**Interfaces:**
- Consumes: Mock top items data
- Produces: Top items section (compact list with rank, name, qty, revenue)

**Steps:**

- [ ] **Step 1: Define mock top items data**
  ```tsx
  const topItems = [
    { rank: 1, name: "Phở gà đặc biệt", qty: 24, revenue: 480000, percent: 32 },
    { rank: 2, name: "Cơm tấm sườn cốt lết", qty: 18, revenue: 360000, percent: 24 },
    { rank: 3, name: "Bánh mì thịt lợn", qty: 15, revenue: 225000, percent: 15 },
    { rank: 4, name: "Chè ba màu", qty: 12, revenue: 180000, percent: 12 }
  ]
  ```

- [ ] **Step 2: Create TopItems function (inline)**
  - Render: Card + title + list of items.
  - Each item row: rank (small circle) + name (flex-1) + qty (right-align) + revenue (right-align).
  - Progress bar or simple text display for percent.
  - No table, use divs for clean mobile rendering.

- [ ] **Step 3: Add TopItems to page**
  - New `<section>` after analytics: `<section className="grid gap-4 lg:grid-cols-2">`
  - TopItems: `lg:col-span-1`, full width on mobile.
  - Or keep it single column if data better displayed that way.

- [ ] **Step 4: Typecheck & verify build**
  - Run: `npm run build 2>&1 | head -30`
  - Expected: No errors.
  - Commit: `git add FE/WEB/src/pages/owner/overview/RestaurantOverviewPage.tsx && git commit -m "feat(frontend): add top selling items list"`

---

## Task 6: Implement Recent Orders Section

**Files:**
- Modify: `FE/WEB/src/pages/owner/overview/RestaurantOverviewPage.tsx`

**Interfaces:**
- Consumes: Mock recent orders data
- Produces: Recent orders section (compact list, responsive table on desktop)

**Steps:**

- [ ] **Step 1: Define mock recent orders data**
  ```tsx
  const recentOrders = [
    { id: "#2451", customer: "Nguyễn Văn A", time: "2 phút trước", amount: "125K", status: "completed" },
    { id: "#2450", customer: "Trần Thị B", time: "5 phút trước", amount: "180K", status: "pending" },
    { id: "#2449", customer: "Lê Văn C", time: "8 phút trước", amount: "95K", status: "completed" },
    { id: "#2448", customer: "Phạm Thị D", time: "12 phút trước", amount: "210K", status: "pending" }
  ]
  ```

- [ ] **Step 2: Create RecentOrders function (inline)**
  - Render: Card + title + list of orders.
  - Desktop (lg): Display as table-like layout with order ID, customer, time, amount, status badge.
  - Mobile: Stack as cards or compressed rows, ensure readable without horizontal scroll.
  - Use Badge for status (success/warning/error tone).

- [ ] **Step 3: Add RecentOrders to page**
  - `<section className="rounded-xl border border-border-default bg-background-surface p-6">` (full width).
  - Below TopItems.

- [ ] **Step 4: Typecheck & verify build**
  - Run: `npm run build 2>&1 | head -30`
  - Expected: No errors.
  - Commit: `git add FE/WEB/src/pages/owner/overview/RestaurantOverviewPage.tsx && git commit -m "feat(frontend): add recent orders section"`

---

## Task 7: Responsive Refinement & Mobile Testing

**Files:**
- Modify: `FE/WEB/src/pages/owner/overview/RestaurantOverviewPage.tsx`

**Interfaces:**
- Consumes: Tailwind breakpoints (sm, md, lg)
- Produces: Fully responsive page (desktop, tablet, mobile)

**Steps:**

- [ ] **Step 1: Review Tailwind breakpoints**
  - sm: 640px, md: 768px, lg: 1024px.
  - Current grid classes: `sm:grid-cols-2 lg:grid-cols-4` (KPI) = 4 col lg, 2 col md/sm, 1 col mobile. ✓
  - Analytics: `lg:grid-cols-3` = 3 col lg, 1 col mobile. ✓
  - Secondary: Adjust if needed.

- [ ] **Step 2: Verify no horizontal overflow on mobile**
  - Charts: SVG viewBox responsive, `className="w-full"`. ✓
  - Lists: No fixed widths, flex-based. ✓
  - Cards: Padding reduced on mobile if needed via `p-4 lg:p-6`. ✓

- [ ] **Step 3: Test typography scaling on small screens**
  - Page title: `text-3xl lg:text-4xl` or similar.
  - Section title: `text-lg` or `text-xl`.
  - Values: `text-2xl lg:text-3xl`.
  - Ensure readable without zooming.

- [ ] **Step 4: Typecheck & lint**
  - Run: `npm run lint`
  - Expected: No errors.

- [ ] **Step 5: Final build**
  - Run: `npm run build`
  - Expected: Success, no warnings related to Overview page.

- [ ] **Step 6: Commit responsive changes**
  - `git add FE/WEB/src/pages/owner/overview/RestaurantOverviewPage.tsx && git commit -m "refactor(frontend): responsive refinements for mobile/tablet"`

---

## Task 8: Final Review & Report

**Files:**
- Review: `FE/WEB/src/pages/owner/overview/RestaurantOverviewPage.tsx` (~220–250 lines total)

**Interfaces:**
- Consumes: Completed page, build/lint output
- Produces: Final report + summary

**Steps:**

- [ ] **Step 1: Visual check**
  - Desktop (1920px): KPI 4 col, charts 2/1 split, secondary full-width. ✓
  - Tablet (768px): KPI 2 col, charts 1 col, secondary 1 col. ✓
  - Mobile (375px): KPI 2 col or 1 col, charts 1 col full-width, no overflow. ✓
  - Typography hierarchy clear at all sizes. ✓

- [ ] **Step 2: Verify spec compliance**
  - ✓ Modern POS/SaaS design patterns.
  - ✓ Clean, premium, professional appearance.
  - ✓ Card layout with light borders, minimal shadow.
  - ✓ Strong typography hierarchy.
  - ✓ Responsive desktop/tablet/mobile.
  - ✓ No overengineering, components inline.
  - ✓ No new npm packages.
  - ✓ No backend API changes.
  - ✓ Mock data only.

- [ ] **Step 3: Code review (self)**
  - No unused imports. ✓
  - No `as` casts. ✓
  - No generics. ✓
  - Naming clear (StatCard, RevenueChart, etc.). ✓
  - Spacing/indentation consistent. ✓

- [ ] **Step 4: Write final report**
  - What changed: Replaced placeholder layout with multi-section professional dashboard.
  - Layout sections: PageHeader → KPI (4 cards) → Analytics (revenue chart + donut) → Secondary (top items + recent orders).
  - Responsive: Desktop 3+ col, tablet 2 col, mobile 1 col.
  - Components: StatCard, RevenueChart, DonutChart, TopItems, RecentOrders (all inline).
  - Build status: ✓ Pass typecheck, lint, build.
  - No new APIs, services, or npm packages.

- [ ] **Step 5: Commit report**
  - Create `docs/superpowers/plans/2024-11-25-overview-redesign.md` with this plan + final notes.
  - `git add docs/superpowers/plans/2024-11-25-overview-redesign.md && git commit -m "docs: add overview redesign implementation plan + report"`

---

## Summary

**8 tasks, ~220 lines of code produced:**
1. Plan & gather data.
2. Layout skeleton + KPI cards.
3. Revenue line chart (SVG).
4. Donut chart for order status.
5. Top selling items list.
6. Recent orders section.
7. Responsive refinement.
8. Final review + report.

**All inline, no extraction.** No new files, no new packages. Pure Tailwind + existing components. Build passes. Ready for use.
