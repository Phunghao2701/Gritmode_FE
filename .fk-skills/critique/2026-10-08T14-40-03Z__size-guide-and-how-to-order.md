---
target: Size Guide & How To Order
total_score: 31
p0_count: 0
p1_count: 0
timestamp: 2026-10-08T14-40-03Z
slug: size-guide-and-how-to-order
---
# FK Review — Size Guide & How to Order

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3/4 | Breadcrumb, current size tab and primary CTA are visible; tab state could be announced more explicitly to assistive technology. |
| 2 | Match System / Real World | 4/4 | Vietnamese labels and ordering flow are familiar and easy to follow. |
| 3 | User Control and Freedom | 3/4 | Users can switch size categories and navigate back through breadcrumbs; no local reset or persistent selection is needed for these informational pages. |
| 4 | Consistency and Standards | 3/4 | Layout, typography, flat dividers and breadcrumb visuals now match Contact/About; breadcrumb semantics are still not shared as a reusable component. |
| 5 | Error Prevention | 3/4 | Informational flows avoid risky actions; the size chart tabs constrain choices to valid categories. |
| 6 | Recognition Rather Than Recall | 4/4 | Four numbered order steps, two payment options and three size categories are immediately scannable. |
| 7 | Flexibility and Efficiency of Use | 2/4 | The pages are intentionally linear; there are no shortcuts such as deep links to a size category or payment section. |
| 8 | Aesthetic and Minimalist Design | 3/4 | The flat layout and concise copy are strong; some uppercase tracking and hover treatments still add a little visual noise. |
| 9 | Error Recovery | 3/4 | There are no high-risk actions; the CTA routes users to Contact when they need help choosing a size. |
| 10 | Help and Documentation | 3/4 | The pages answer the core questions clearly, with measurement guidance and payment explanations; jargon could be explained more directly. |
| **Total** | | **31/40** | **Good — solid foundation, with accessibility and mobile table polish remaining.** |

## Anti-Patterns Verdict

The pages do not read as obviously AI-generated. The monochrome streetwear system, flat dividers and restrained hierarchy feel coherent with Gritmode. The remaining generic patterns are limited to familiar ecommerce elements such as pill tabs and icon-led step blocks.

Deterministic FK scan: clean (`[]`) for `SizeGuidePage.jsx` and `HowToOrderPage.jsx`; no detector findings or false positives.

## Overall Impression

Both pages now feel like part of the same storefront rather than separate templates. How To Order is clearer after the copy trim; Size Guide is the stronger page structurally because the table, measuring guidance and contact CTA form a direct decision path. The biggest opportunity is making the interactive size table and tab state more robust on mobile and for assistive technology.

## What's Working

1. The shared hero and breadcrumb treatment creates a clear location and consistent entry point.
2. Removing grey rounded cards and using light dividers gives both pages the same editorial/storefront rhythm as Contact and About.
3. The How To Order content is now concise: four steps, two payment methods and one CTA without a wall of explanatory text.

## Priority Issues

### [P2] Breadcrumb is visually consistent but not semantically reusable

**Why it matters:** The current visual pattern matches Contact, but the breadcrumb is rendered as a plain `div`; assistive technology does not get a breadcrumb landmark or a current-page relationship.

**Fix:** Create one shared breadcrumb component using `<nav aria-label="Breadcrumb">`, while keeping the exact Contact class styling.

**Suggested command:** `$fk check`

### [P2] Size table needs a stronger mobile reading strategy

**Why it matters:** A wide table can require horizontal scrolling and users may lose the row/measurement context while viewing later columns.

**Fix:** Keep the flat table, but make the first column sticky on mobile and add a compact mobile hint or stacked row labels when the table overflows.

**Suggested command:** `$fk responsive`

### [P2] Size tabs need explicit selected-state semantics

**Why it matters:** The active tab is visually clear, but screen readers do not receive a selected state from visual classes alone.

**Fix:** Add `role="tablist"`, `role="tab"`, `aria-selected`, and an associated tab panel, or use `aria-pressed` if keeping the button group model.

**Suggested command:** `$fk check`

### [P3] Uppercase tracking is slightly heavy in long Vietnamese headings

**Why it matters:** The style is on-brand, but long headings such as the payment title can become visually wide and wrap awkwardly at smaller widths.

**Fix:** Keep uppercase but use `tracking-wide` for long h1/h2 strings, reserving `tracking-widest` for short labels and breadcrumbs.

**Suggested command:** `$fk type`

## Persona Red Flags

**Jordan (First-Timer):** The four order steps are reassuring, but terms such as `payOS`, `Voucher` and `Boxy Fit` may require one short plain-language clarification.

**Casey (Distracted Mobile User):** The size table is the main risk: horizontal scrolling can make size comparison difficult one-handed. The CTA is clear but appears only after the full guide.

**Sam (Accessibility-Dependent User):** Breadcrumbs need semantic navigation, and the size tab selection needs an announced state rather than relying on black/white visual styling.

## Minor Observations

- The page-level CTA copy is concise and appropriately routes size uncertainty to Contact.
- The step numbers are useful as sequence markers and should remain because this content is genuinely ordered.
- Hover backgrounds on non-interactive step/measurement items may imply clickability; remove them or make the items interactive.
