# RegenOS Factory Masters Framework

## Purpose

Factory Masters provide controlled self-service master data through one shared master-management screen. Transaction dropdowns should send users to the same Factory Masters screen with the relevant master already selected.

## Reusable frontend pieces

- `src/services/FactoryMasterService.js`
- `src/components/FactoryDropdown.jsx`
- `src/components/FactoryMasterModal.jsx`
- `src/pages/FactoryMasters.jsx`

Every future transaction dropdown should use `FactoryDropdown` unless the value is a fixed system enum such as status, yes/no, or shift.

## Backend routes

- `factoryMaster.list`
- `factoryMaster.add`
- `factoryMaster.update`
- `factoryMaster.disable`
- `factoryMaster.merge`

Supported `masterType` values:

- `material`
- `supplier`
- `customer`
- `machine`
- `recipe`
- `storeItem`
- `qualityTest`
- `expenseCategory`
- `productGrade`
- `storageLocation`

## Master storage map

| Dropdown / master | `masterType` | Google Sheet source of truth |
| --- | --- | --- |
| Material | `material` | `Material_Master` |
| Machine | `machine` | `Machine_Master` |
| Supplier | `supplier` | `Suppliers` |
| Customer | `customer` | `Customers` |
| Store Item | `storeItem` | `Stores_Master` |
| Expense Category | `expenseCategory` | `Expense_Category_Master` |
| Quality Test | `qualityTest` | `Quality_Test_Master` |
| Production Recipe | `recipe` | `Production_Recipes` |
| Product Grade | `productGrade` | `Production_Grades` |
| Storage Location | `storageLocation` | `Storage_Locations` |

## Master management screen

All maintainable masters are managed through one page:

- Route: `/factory-masters`
- Legacy alias: `/production-materials`

The page uses a master selector at the top. Changing the selected master reloads the same reusable table with columns appropriate for that master. Do not create separate master-maintenance pages for new masters.

Transaction dropdown `+` buttons navigate to `/factory-masters?master=<masterType>&new=1`, so the relevant master is already selected and the add modal opens from the shared page.

Production material dropdowns must use `Material_Master` as the primary source:

- Input material filters: `RM`, `WIP`, `REWORK`, `ADDITIVE`
- Output material filters: `FG`, `WIP`, `WASTE`, `REWORK`

If `Material_Master` is empty or missing input/output categories during transition, `FactoryMasterService` may temporarily merge categorized fallback rows from legacy material/category/ledger routes. This fallback must remain secondary and must not replace `Material_Master` as the source of truth.

## Required dropdown behavior

`FactoryDropdown` supports:

- Search
- Add New
- Edit
- Disable
- Pending Approval status
- Merge Duplicate
- Audit Trail display
- No separate master page per dropdown

Created, updated, disabled, and merged audit fields are stored in Google Sheets.

## Audit fields

Factory master sheets should include:

- `createdBy`
- `createdAt`
- `updatedBy`
- `updatedAt`
- `disabledBy`
- `disabledAt`
- `mergedIntoId`
- `mergedBy`
- `mergedAt`
- `status`

## Converted screens in this sprint

Only these screens were converted:

1. Material Receiving / RM Inward
   - Supplier
   - Material
2. Production
   - Wash machine
   - Wash material
   - Sorting machine
   - Sorting material
   - Extrusion machine
   - Production grade/material
   - Feed material rows
3. Dispatch
   - Customer
   - Material

## Future rollout rule

For every future dropdown:

```jsx
<FactoryDropdown
  masterType="material"
  name="material"
  value={form.material}
  onChange={onChange}
  placeholder="Select Material"
/>
```

Use `filter` to limit the list by category or process:

```jsx
filter={(item) => item.category === "FG"}
```

Do not hardcode business master values in transaction screens.
