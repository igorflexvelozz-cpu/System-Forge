# Flex Velozz | ATLAS - Design Guidelines

## Design Approach
**System Type:** Utility-Focused, Information-Dense Enterprise Dashboard
**Reference Systems:** Material Design (data-heavy applications) + Inspiration from enterprise platforms like Logmanager, Tableau, and modern SaaS dashboards
**Key Principle:** Executive-level professionalism with zero informal or playful elements

## Visual Identity

**Brand Name:** Flex Velozz | ATLAS (always visible)
**Tagline:** SLA & Performance Logística — Mercado Livre
**Tone:** Corporate, trustworthy, data-driven, modern enterprise
**Color Palette Theme:** Corporate blue (primary), grays (neutral), green (success/positive metrics)

## Layout System

**Spacing Units:** Use Tailwind units of 2, 4, 6, 8, 12, and 16 for consistent rhythm
- Cards/containers: p-6 or p-8
- Section spacing: gap-6 or gap-8
- Page margins: px-8 py-6

**Grid Structure:**
- KPI cards: 2-4 columns responsive grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Dashboard sections: max-w-full with inner constraints per component
- Tables: full-width within containers
- Charts: responsive with min-h-80 or min-h-96

**Global Layout:**
- Fixed header (h-16) with logo left, system status right
- Left sidebar navigation (w-64) with 9 menu items
- Main content area with consistent padding (p-8)
- No hero sections - this is a data application

## Typography

**Font Stack:** Inter or similar professional sans-serif via Google Fonts
- Headers (H1): text-2xl md:text-3xl font-bold
- Section titles (H2): text-xl font-semibold
- Card titles (H3): text-lg font-medium
- Body text: text-base
- Metrics/numbers: text-3xl or text-4xl font-bold (for KPIs)
- Table headers: text-sm font-semibold uppercase tracking-wide
- Small labels: text-xs or text-sm

## Component Library

### Header (Fixed)
- Logo/brand name (left): Large, bold, always visible
- Subtitle: Smaller, lighter weight
- System status indicator: Badge with icon + timestamp of last update
- Status states: "Processado" (success), "Em Processamento" (warning), "Erro" (error)

### Sidebar Navigation
- 9 menu items with icons (use Heroicons)
- Active state highlighting
- Hover states with subtle background change
- Icon + label format for all items

### KPI Cards
- Elevated card design with subtle shadow
- Large number display (text-3xl or text-4xl bold)
- Label below number (text-sm)
- Icon in top-right corner
- Responsive grid layout

### Charts (Vertical Bars Priority)
- All charts use vertical bar format unless specified
- Chart height: min-h-80 or min-h-96
- Use Chart.js or Recharts library
- Show clear axes, labels, and legends
- Target line for SLA charts (95% threshold)
- Seller names always visible on x-axis

### Tables
- Alternating row backgrounds for readability
- Fixed header when scrolling
- Sort indicators in headers
- Pagination controls at bottom
- Search and filter controls above table
- Export button prominently placed
- Responsive: scroll horizontally on mobile

### File Upload Interface
- Drag-and-drop zone with clear visual feedback
- File status cards showing: name, size, status, validation results
- Processing status panel with progress indicator
- Error alerts with actionable messages

### Top 5 Lists/Rankings
- Compact card format with ranking number
- Visual bars showing relative values
- Name + metric side by side
- Sorted by severity/volume

### Filters & Controls
- Horizontal filter bar with dropdowns
- Period selector (date range picker)
- Multi-select dropdowns for zone/seller/cost center
- Clear "Apply" and "Reset" buttons

### Loading States
- Skeleton screens for data loading
- Spinner for processing operations
- Never show empty states without explanation

### Error Handling
- Alert banners with clear error messages
- Retry buttons where applicable
- Never fail silently

## Dashboard-Specific Layouts

**Dashboard 1 - Visão Geral:** 4-card KPI row + large SLA chart + 3-column grid for Top 5 lists

**Dashboard 2 - Upload:** 2-column layout for dual upload zones + processing status panel below

**Dashboard 3 - SLA Performance:** Filter bar + period chart with target line + full-width analytical table

**Dashboard 4 - Atrasos:** 4 delay KPI cards + 2x2 chart grid (delays by day/zone/CEP/seller)

**Dashboard 5 - Vendedores:** Grid of seller cards + 3-column chart row (volume/delays/SLA)

**Dashboard 6 - Zonas & CEPs:** 2-column chart layout + full-width detailed table

**Dashboard 7 - Rankings:** 3 vertical sections for different rankings with large vertical bar charts

**Dashboard 8 - Base Consolidada:** Search/filter bar + full-width data table with all columns + pagination

**Dashboard 9 - Histórico:** Period comparison controls + evolution line charts + comparative tables

## Images
No hero images or marketing imagery. This is a pure data dashboard. Icons only (via Heroicons library for navigation and status indicators).