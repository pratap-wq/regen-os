# RegenOS UI Design System

This sprint adds a reusable frontend-only design layer while preserving the familiar RegenOS workflow, routes, sidebar, and business logic.

## Standard transaction layout

Every operational screen should move toward this layout:

1. Header
2. Snapshot cards
3. Header information
4. Editable grid
5. Summary
6. History

## Reusable components

- `PageLayout` — consistent page header, title, subtitle, actions, spacing.
- `SectionCard` — clean white content card with soft border and optional header.
- `KpiCard` — compact snapshot card for production, stores, dispatch, finance, and CEO metrics.
- `EditableGrid` — keyboard-friendly transaction grid with tab/enter navigation, Excel paste, add/delete row, sticky header, and totals.
- `FactoryTable` — simple display table with sticky header.
- `SummaryPanel` — consistent summary totals panel.
- `HistoryPanel` — section wrapper around `FactoryTable`.
- `Toolbar` — common filter/search/action bar.
- `FactoryButton` — primary, secondary, and danger action buttons.
- `FactoryInput` — labelled input/select/textarea wrapper.
- `FactoryDropdown` — existing smart master dropdown, re-exported for design-system use.

## Styling rules

- Clean white cards.
- Soft shadows.
- Consistent spacing.
- Rounded corners.
- Minimal Regen green accent.
- No gradients for app-wide shell or futuristic styling.
- No backend or calculation dependencies.

## Rollout rule

Future screens should use these components without changing route names, backend routes, or business calculations.
