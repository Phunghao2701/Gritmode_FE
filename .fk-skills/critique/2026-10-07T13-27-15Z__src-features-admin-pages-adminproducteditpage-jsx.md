---
target: AdminProductEditPage.jsx
total_score: 26
p0_count: 0
p1_count: 2
timestamp: 2026-10-07T13-27-15Z
slug: src-features-admin-pages-adminproducteditpage-jsx
---
# Review: Admin product creation flow

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of System Status | 3/4 | Upload progress and save loading exist, but validation is toast-only. |
| 2 | Match System / Real World | 3/4 | The order is understandable; “Collections” remains mixed into Vietnamese copy. |
| 3 | User Control and Freedom | 3/4 | Back, cancel, draft save, and sticky actions are present; no unsaved-change recovery. |
| 4 | Consistency and Standards | 3/4 | Visual language is consistent, but the form has duplicated action bars and custom controls. |
| 5 | Error Prevention | 2/4 | Required checks exist, but publish readiness is discovered only after submit. |
| 6 | Recognition Rather Than Recall | 3/4 | Labels and examples help; comma-separated inputs and eye states need more guidance. |
| 7 | Flexibility and Efficiency of Use | 2/4 | Shared price/stock defaults are efficient, but there is no section jump or autosave. |
| 8 | Aesthetic and Minimalist Design | 3/4 | Clean monochrome admin style, though many rounded cards and repeated actions add weight. |
| 9 | Error Recovery | 2/4 | Toasts identify errors but do not focus the invalid field or preserve a clear correction path. |
| 10 | Help and Documentation | 2/4 | Placeholders and one inline hint exist, but publish requirements are not visible in context. |
| **Total** |  | **26/40** | **Acceptable: solid foundation, significant workflow improvements recommended.** |

## Anti-Patterns Verdict

### LLM assessment

The page does not read as generic AI-generated UI. It preserves Gritmode’s restrained monochrome admin language and keeps the primary action obvious. The main weakness is not visual taste; it is workflow density: a long form, two action bars, a workspace tab row, and a two-column layout all compete for attention.

### Deterministic scan

The detector returned no findings for `AdminProductEditPage.jsx`, `AdminSidebar.jsx`, or `AdminHeader.jsx`. No detector false positives were recorded.

## Overall Impression

The structure is credible for an internal catalog tool, but it currently asks the operator to understand too much at once. The single biggest opportunity is to make “ready to publish” a visible, progressive state instead of a server error discovered at the end.

## What’s Working

1. The top-left back link and the two save states make the exit and commit actions easy to find.
2. Basic information, variants/pricing, category/collection, and images are grouped in a logical content model.
3. Shared price and stock defaults prevent repetitive variant entry, while image uploads expose individual progress.

## Priority Issues

### [P1] Publish readiness is hidden behind submit

**Why it matters:** An operator can complete the visible form and press “Đăng bán ngay” only to receive a toast listing missing server requirements such as images or valid inventory. This makes the primary action feel unreliable.

**Fix:** Add a compact “Sẵn sàng đăng bán” checklist near the action area with states for name, category, variants, image, and inventory. Keep “Lưu bản nháp” always available; disable or downgrade publish until the checklist passes.

**Suggested command:** `$fk prod AdminProductEditPage`

### [P1] Long form has no progress model or section navigation

**Why it matters:** The operator must scan and scroll through a large page, then remember where a missing field lives. This is especially costly when correcting a failed publish.

**Fix:** Use a three-step structure—Thông tin, Biến thể & giá, Hoàn thiện—or add a sticky compact section index with completion counts. Keep the current single-page data model if implementation risk matters.

**Suggested command:** `$fk trim AdminProductEditPage`

### [P2] Validation is global-toast-first, not field-first

**Why it matters:** `handleSave` validates name, category, variants, and price in sequence, but the page does not mark the field or scroll to the source. The user has to translate a toast into a location.

**Fix:** Add inline error text and invalid styling, focus the first invalid control, and make the validation summary clickable. Preserve the current toast as a brief confirmation, not the only diagnosis.

**Suggested command:** `$fk prod AdminProductEditPage`

### [P2] Color and size entry is fragile for catalog operators

**Why it matters:** Comma-separated text encourages whitespace, duplicate, and punctuation mistakes. The resulting chips are useful, but the input model is still manual.

**Fix:** Replace color input with token entry on Enter/comma, normalize duplicates, and show the generated variant count (`4 biến thể`). Keep custom sizes as tokens with the same interaction model.

**Suggested command:** `$fk check AdminProductEditPage`

### [P2] Category selector is visually clear but semantically weak

**Why it matters:** The custom dropdown relies on div rows and hover-only edit affordances. Keyboard and screen-reader users may not get expanded state, option roles, or a reliable edit action.

**Fix:** Add `aria-expanded`, `aria-controls`, keyboard navigation, option semantics, and visible focus states. Make the pencil action reachable without hover.

**Suggested command:** `$fk check AdminProductEditPage`

## Persona Red Flags

### Alex — Power User

- Must scroll between the top action bar, variant section, and bottom sticky actions.
- No section jump, autosave, or keyboard shortcut for saving a draft.
- Shared defaults help, but there is no visible generated-variant count to validate a large option set quickly.

### Sam — Accessibility-Dependent User

- The custom category tree does not expose standard combobox/listbox semantics in the current source.
- Category edit pencils are opacity-hidden until hover, so the action is not reliably discoverable without a pointer.
- Validation feedback is delivered through toast, not associated with the invalid input.

### Casey — Distracted Mobile User

- Sticky bottom actions are a good thumb-zone decision.
- The form still requires a long uninterrupted session and does not preserve progress on refresh or interruption.
- The top workspace tabs and duplicated action buttons consume vertical space before the core fields.

## Minor Observations

- Replace `Bộ sưu tập (Collections)` with one language consistently.
- Consider a short helper under “Đăng bán ngay”: “Cần đủ ảnh, danh mục, biến thể và tồn kho hợp lệ”.
- The existing catalog entry was reduced to “Sản phẩm” in the sidebar so removing “Sản phẩm & Kho” does not orphan the product creation flow; the workspace tabs remain the internal catalog navigation.

## Questions to Consider

1. Should product creation remain a single page with a sticky section index, or become a 3-step flow?
2. Should “Đăng bán ngay” be disabled until the readiness checklist passes, or remain clickable to show the missing requirements?
3. Is local draft recovery after refresh required for operators, or is explicit “Lưu bản nháp” enough?
