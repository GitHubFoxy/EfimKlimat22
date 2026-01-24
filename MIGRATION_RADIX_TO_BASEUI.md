# Migration Plan: Radix UI → Base UI (basecn)

## Problem
Radix UI generates random classes on server vs client, causing Next.js hydration mismatches.

## Solution
Migrate shadcn/ui components from Radix UI to Base UI using [basecn](https://basecn.dev).

---

## Progress Tracker

- [x] Phase 1: Install @base-ui/react
- [x] button.tsx ✅
- [x] label.tsx ✅
- [x] separator.tsx ✅
- [x] checkbox.tsx ✅
- [x] switch.tsx ✅
- [x] tabs.tsx ✅
- [x] tooltip.tsx ✅
- [x] dialog.tsx ✅
- [x] sheet.tsx ✅
- [x] select.tsx ✅
- [x] dropdown-menu.tsx ✅
- [x] sidebar.tsx ✅
- [x] Remove Radix packages ✅
- [x] Final verification ✅

## ✅ MIGRATION COMPLETE

---

## Discovered Migration Patterns

### Pattern 1: Import Changes

| Radix UI | Base UI |
|----------|---------|
| `import * as X from '@radix-ui/react-X'` | `import { X } from '@base-ui/react/X'` |
| `import { Slot } from '@radix-ui/react-slot'` | `import { useRender } from '@base-ui/react/use-render'` |

### Pattern 2: `asChild` → `render` Prop

**Before (Radix):**
```tsx
<Button asChild>
  <a href="/contact">Contact</a>
</Button>
```

**After (Base UI):**
```tsx
<Button render={<a href="/contact" />}>
  Contact
</Button>
```

**Component implementation:**
```tsx
// Before
import { Slot } from '@radix-ui/react-slot'
function Button({ asChild, ...props }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp {...props} />
}

// After
import { useRender } from '@base-ui/react/use-render'
function Button({ render = <button />, ...props }) {
  return useRender({ render, props })
}
```

### Pattern 3: Data Attribute Changes

| Radix UI | Base UI |
|----------|---------|
| `data-[state=checked]` | `data-checked` |
| `data-[state=unchecked]` | `data-unchecked` |
| `data-[state=open]` | `data-open` |
| `data-[state=closed]` | `data-closed` |
| `data-[state=active]` | `data-active` |
| `disabled:` | `data-disabled:` |

**Example CSS class migration:**
```tsx
// Before
'data-[state=checked]:bg-primary disabled:opacity-50'

// After  
'data-checked:bg-primary data-disabled:opacity-50'
```

### Pattern 4: Component Naming Changes

| Radix UI | Base UI |
|----------|---------|
| `TabsPrimitive.Trigger` | `TabsPrimitive.Tab` |
| `TabsPrimitive.Content` | `TabsPrimitive.Panel` |
| `DialogPrimitive.Overlay` | `DialogPrimitive.Backdrop` |
| `DialogPrimitive.Content` | `DialogPrimitive.Popup` |
| `TooltipPrimitive.Content` | `TooltipPrimitive.Popup` |

### Pattern 5: Provider Prop Changes

| Radix UI | Base UI |
|----------|---------|
| `<TooltipProvider delayDuration={0}>` | `<TooltipProvider delay={0}>` |

### Pattern 6: Popup Positioning (Tooltip)

**Before (Radix):**
```tsx
<TooltipPrimitive.Portal>
  <TooltipPrimitive.Content sideOffset={4} side="top">
    {children}
  </TooltipPrimitive.Content>
</TooltipPrimitive.Portal>
```

**After (Base UI):**
```tsx
<TooltipPrimitive.Portal>
  <TooltipPrimitive.Positioner sideOffset={4} side="top">
    <TooltipPrimitive.Popup>
      {children}
    </TooltipPrimitive.Popup>
  </TooltipPrimitive.Positioner>
</TooltipPrimitive.Portal>
```

### Pattern 7: CSS Variable Changes

| Radix UI | Base UI |
|----------|---------|
| `--radix-tooltip-content-transform-origin` | `--transform-origin` |
| `--radix-select-content-available-height` | `--available-height` |

### Pattern 8: Removed Props

Some Radix props don't exist in Base UI:

| Radix Prop | Base UI Alternative |
|------------|---------------------|
| `onPointerDownOutside` | Use `dismissible={false}` on Root |
| `onEscapeKeyDown` | Use `dismissible={false}` on Root |
| `decorative` (Separator) | Not needed, use `data-orientation` |

### Pattern 9: 'use client' Directive

Base UI components don't require `'use client'` directive at the top of the file - can be removed.

---

## Files Updated During Migration

### Component Files Migrated
- `components/ui/button.tsx`
- `components/ui/label.tsx`
- `components/ui/separator.tsx`
- `components/ui/checkbox.tsx`
- `components/ui/switch.tsx`
- `components/ui/tabs.tsx`
- `components/ui/tooltip.tsx`
- `components/ui/dialog.tsx`
- `components/ui/sheet.tsx`

### Usage Files Updated (asChild → render)
- `components/BugReportBanner.tsx`
- `components/Header/HeaderSearch.tsx`
- `components/Header/MobileHeader.tsx`
- `components/Main/Hero.tsx`
- `components/Cart/HeaderCart.tsx`
- `components/Footer.tsx` (3 instances)
- `components/FormaObratnoySvyzi.tsx`
- `components/Auth/ForceChangePasswordDialog.tsx`
- `components/ui/sidebar.tsx`
- `app/checkout/page.tsx` (2 instances)
- `app/catalog/[slug]/ItemClient.tsx`

---

## Additional Patterns Discovered

### Select Component Changes
| Radix UI | Base UI |
|----------|---------|
| `Select.Content` | `Select.Positioner` + `Select.Popup` |
| `Select.Viewport` | Not needed (implicit in Popup) |
| `Select.ScrollUpButton` | `Select.ScrollUpArrow` |
| `Select.ScrollDownButton` | `Select.ScrollDownArrow` |
| `Select.Label` | `Select.GroupLabel` |
| `onValueChange={(v) => ...}` | `onValueChange={(v) => ...(v as string)}` (needs cast) |

### Menu (Dropdown) Component Changes
| Radix UI | Base UI |
|----------|---------|
| `DropdownMenu.*` | `Menu.*` |
| `DropdownMenu.Content` | `Menu.Positioner` + `Menu.Popup` |
| `DropdownMenu.Sub` | `Menu.SubmenuRoot` |
| `DropdownMenu.SubTrigger` | `Menu.SubmenuTrigger` |
| `DropdownMenu.Label` | `Menu.GroupLabel` |
| `ItemIndicator` | `CheckboxItemIndicator` / `RadioItemIndicator` |
| `focus:bg-accent` | `data-highlighted:bg-accent` |

---

## Resources

- [basecn Migration Guide](https://basecn.dev/docs/get-started/migrating-from-radix-ui)
- [Base UI Components](https://base-ui.com/react/components)
- [Base UI Handbook](https://base-ui.com/react/handbook)
