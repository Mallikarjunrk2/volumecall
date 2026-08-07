# VolumeCall Design System

This document serves as the source of truth for the VolumeCall visual system.

## Principles

1. **Cyber-Clean Financial Research**: Combine Vercel-like cleanliness (pure black `#000` / `#0A0A0A` dark mode surfaces, crisp white light mode surfaces, neutral gray borders) with Screener-like information density.
2. **Information First**: Focus visual layout on data. Utilize whitespace, typography, alignment, and subtle separators for hierarchy instead of excessive card wrappers and heavy boxes.
3. **Selective Accent**: Use teal `#0F766E` (light) / `#2DD4BF` (dark) selectively for branding and active status points rather than saturating the interface.
4. **Accessible Contrast & Sizing**: Strictly follow readable text colors, visible focus rings, and proper touch targets.

---

## Token Specifications

### 1. Colors

| Token Name | Light Mode (Default) | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| **Background (Primary)** | `#FFFFFF` | `#000000` | Main pages, header background |
| **Background (Secondary)**| `#FAFAFA` (Gray-50) | `#0A0A0A` (Gray-950) | Table headings, search results, hover states |
| **Primary Accent** | `#0F766E` (Teal-700) | `#2DD4BF` (Teal-400) | Brand logo, active links, chart primary lines |
| **Positive Indicator** | `#10B981` (Emerald-500) | `#34D399` (Emerald-400) | Price gains, positive returns/CAGRs |
| **Negative Indicator** | `#EF4444` (Red-500) | `#F87171` (Red-400) | Price losses, negative returns/CAGRs |
| **Text (Primary)** | `#000000` | `#FFFFFF` | Titles, stock price, key metrics values |
| **Text (Secondary)** | `#666666` (Gray-600) | `#A3A3A3` (Gray-400) | Labels, subheadings, descriptions |
| **Text (Muted)** | `#999999` (Gray-400) | `#666666` (Gray-600) | Breadcrumbs, secondary annotations |
| **Borders** | `#E5E5E5` (Gray-200) | `#1F1F1F` (Gray-900) | Divider lines, table borders, inputs |

### 2. Typography

* **Primary Font Family**: `Geist` (loaded via `next/font/local` or `Geist Sans` from npm).
* **Fallback Font Family**: `Inter`, system sans-serif.
* **Financial Numbers**: Must use tabular numbers (`font-variant-numeric: tabular-nums`) to ensure vertical digit alignment in tables.

### 3. Borders & Radius

* **Radius**: Tight, crisp corners. Maximum `6px` (`rounded-md` or `rounded` in Tailwind) for buttons, search dropdowns, and inputs.
* **Borders**: Thin `1px` high-precision borders.
* **Separators**: Use thin horizontal rules (`border-b border-neutral-200 dark:border-neutral-900`) instead of boxing content in card borders.

---

## Layout and UI Guidelines

### Financial Tables & Key Ratios
* Instead of wrapping ratios in cards, display them in an information-dense list or grid separated by clean whitespace and simple horizontal dividers.
* Headers left-aligned for labels, right-aligned for values. Columns should be compact.
* Financial tables must support horizontal scrolling on mobile.

### Interactive Charts
* Line charts must use a crisp Teal color.
* Area fill should be extremely subtle (opacity `0.02` to `0.05`) to maintain visual cleanliness.
* Volume pane should sit below the main price series and share the timeline.
* Controls (ranges, overlays) should be small, simple, and clean, with minimal borders and neutral backgrounds.
