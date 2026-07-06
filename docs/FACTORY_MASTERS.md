# RegenOS Factory Masters Framework

## Purpose

Factory Masters provide controlled self-service master data inside transaction screens. Operators should not leave a transaction to create a missing material, supplier, customer, machine, recipe, store item, quality test, or expense category.

## Reusable frontend pieces

- `src/services/FactoryMasterService.js`
- `src/components/FactoryDropdown.jsx`
- `src/components/FactoryMasterModal.jsx`

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

## Required dropdown behavior

`FactoryDropdown` supports:

- Search
- Favorites
- Recently Used
- Add New
- Edit
- Disable
- Pending Approval status
- Merge Duplicate
- Audit Trail display
- Auto-select after creation
- No page reload
- No navigation away from transaction

Favorites and recently used are stored per browser/device for fast operator access. Created, updated, disabled, and merged audit fields are stored in Google Sheets.

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
   - Recipe
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
