# Migration Plan: Radix UI → Base UI (basecn)

## Problem
Radix UI generates random classes on server vs client, causing Next.js hydration mismatches.

## Solution
Migrate shadcn/ui components from Radix UI to Base UI using [basecn](https://basecn.dev).

---

## Current State

### Radix UI Packages (10 total)
```
@radix-ui/react-checkbox
@radix-ui/react-dialog
@radix-ui/react-dropdown-menu
@radix-ui/react-label
@radix-ui/react-select
@radix-ui/react-separator
@radix-ui/react-slot
@radix-ui/react-switch
@radix-ui/react-tabs
@radix-ui/react-tooltip
```

### Components to Migrate (21 in components/ui/)
- breadcrumb.tsx
- button.tsx
- card.tsx (no Radix dependency)
- carousel.tsx (no Radix dependency)
- checkbox.tsx
- dialog.tsx
- dropdown-menu.tsx
- EmptyState.tsx (no Radix dependency)
- input.tsx (no Radix dependency)
- label.tsx
- select.tsx
- separator.tsx
- sheet.tsx
- sidebar.tsx
- skeleton.tsx (no Radix dependency)
- sonner.tsx (no Radix dependency)
- switch.tsx
- table.tsx (no Radix dependency)
- tabs.tsx
- textarea.tsx (no Radix dependency)
- tooltip.tsx

---

## Phase 1: Setup

```bash
bun add @base-ui/react
```

---

## Phase 2: Component Migration Order

### Priority 1 - Low Complexity (Test First)
| Component | Radix Package | Notes |
|-----------|---------------|-------|
| button.tsx | `@radix-ui/react-slot` | `asChild` → `render` prop |
| label.tsx | `@radix-ui/react-label` | Simple wrapper |
| separator.tsx | `@radix-ui/react-separator` | Simple wrapper |

### Priority 2 - Medium Complexity
| Component | Radix Package | Notes |
|-----------|---------------|-------|
| checkbox.tsx | `@radix-ui/react-checkbox` | Indicator pattern |
| switch.tsx | `@radix-ui/react-switch` | Thumb pattern |
| tabs.tsx | `@radix-ui/react-tabs` | List/Trigger/Content |

### Priority 3 - Medium Complexity (Popups)
| Component | Radix Package | Notes |
|-----------|---------------|-------|
| tooltip.tsx | `@radix-ui/react-tooltip` | Needs Positioner wrapper |
| dialog.tsx | `@radix-ui/react-dialog` | Popup/Backdrop pattern |
| sheet.tsx | `@radix-ui/react-dialog` | Same as dialog |

### Priority 4 - High Complexity
| Component | Radix Package | Notes |
|-----------|---------------|-------|
| select.tsx | `@radix-ui/react-select` | Positioner + ScrollButtons |
| dropdown-menu.tsx | `@radix-ui/react-dropdown-menu` | Positioner + Groups + Submenus |
| sidebar.tsx | Multiple | Uses tooltip, sheet |

---

## Phase 3: Key Migration Patterns

### Pattern 1: `asChild` → `render` Prop

**Before (Radix):**
```tsx
import { Slot } from '@radix-ui/react-slot'

function Button({ asChild, ...props }) {
  const Comp = asChild ? Slot : 'button'
  return <Comp {...props} />
}

// Usage
<Button asChild>
  <a href="/contact">Contact</a>
</Button>
```

**After (Base UI):**
```tsx
import { useRender } from '@base-ui/react/use-render'

function Button({ render = <button />, ...props }) {
  return useRender({ render, props })
}

// Usage
<Button render={<a href="/contact" />}>Contact</Button>
```

### Pattern 2: Positioning Popups

**Before (Radix):**
```tsx
<DropdownMenuContent side="left" align="start">
  ...
</DropdownMenuContent>
```

**After (Base UI):**
```tsx
<DropdownMenuPositioner side="left" align="start">
  <DropdownMenuContent>
    ...
  </DropdownMenuContent>
</DropdownMenuPositioner>
```

### Pattern 3: Labels in Groups

**Before (Radix):**
```tsx
<DropdownMenuContent>
  <DropdownMenuLabel>My Account</DropdownMenuLabel>
  <DropdownMenuItem>Profile</DropdownMenuItem>
</DropdownMenuContent>
```

**After (Base UI):**
```tsx
<DropdownMenuContent>
  <DropdownMenuGroup>
    <DropdownMenuLabel>My Account</DropdownMenuLabel>
    <DropdownMenuItem>Profile</DropdownMenuItem>
  </DropdownMenuGroup>
</DropdownMenuContent>
```

---

## Phase 4: Update Component Usages

After migrating each component, search for usages:

```bash
# Find asChild usages that need updating
grep -r "asChild" app/ components/
```

Update all `asChild` patterns to `render` prop.

---

## Phase 5: Cleanup

After all components migrated:

1. Remove Radix packages:
```bash
bun remove @radix-ui/react-checkbox @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-separator @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-tooltip
```

2. Verify:
```bash
bun run lint
bun run typecheck
```

3. Test hydration in dev mode

---

## Resources

- [basecn Migration Guide](https://basecn.dev/docs/get-started/migrating-from-radix-ui)
- [Base UI Components](https://basecn.dev/docs/components)
- [Base UI Documentation](https://base-ui.com/)

---

## Progress Tracker

- [ ] Phase 1: Install @base-ui/react
- [ ] button.tsx (TEST FIRST)
- [ ] label.tsx
- [ ] separator.tsx
- [ ] checkbox.tsx
- [ ] switch.tsx
- [ ] tabs.tsx
- [ ] tooltip.tsx
- [ ] dialog.tsx
- [ ] sheet.tsx
- [ ] select.tsx
- [ ] dropdown-menu.tsx
- [ ] sidebar.tsx
- [ ] Update all usages
- [ ] Remove Radix packages
- [ ] Final verification
