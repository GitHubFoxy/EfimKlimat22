# OpenSpec Change Proposal: Add Cart Toast Notifications

## Overview
Add toast notifications when users add items to cart on both the Main page and the Catalog page, providing immediate feedback consistent with the floating checkout button pattern.

## Scope
- Pages: Main page (`app/page.tsx`) and Catalog page (`app/catalog/page.tsx`)
- Interaction points: Item add-to-cart actions rendered via `components/ItemCard.tsx` (used by BestDeals and Catalog)

## Problem Statement
Currently, when users add items to cart on the main page (via BestDeals section), there's no immediate visual feedback confirming the action was successful. Users may be unsure if the item was actually added to their cart, leading to potential confusion or repeated clicks.

## Proposed Solution

### 1. Add Toast UI Component (Sonner via shadcn)
Use the Sonner toast system integrated via shadcn for minimal setup and consistent design.

**Files to create:**
- `components/ui/sonner.tsx` - Exposes `Toaster` and Sonner configuration

### 2. Integrate Toast Provider
Add the Sonner `Toaster` component to the root layout to enable toast notifications across the application.

**Files to modify:**
- `app/layout.tsx` - Add `<Toaster />` and Sonner configuration

### 3. Update ItemCard Component
Enhance the cart interaction in ItemCard to show toast notifications. Because both the Main page (BestDeals section) and the Catalog page render items via `ItemCard`, this change will cover both pages without duplicating logic.

**Files to modify:**
- `components/ItemCard.tsx` - Add toast notification on successful cart addition and error handling

### 4. Optional: Add Floating Cart Button to Main Page
Similar to catalog page, show floating checkout button when cart has items.

**Files to modify:**
- `app/page.tsx` - Add floating cart button (optional enhancement)

## Technical Implementation

### Toast Provider Usage
```tsx
// app/layout.tsx (snippet)
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        {/* existing providers/components */}
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
```

### ItemCard Integration
```tsx
// components/ItemCard.tsx (snippet)
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const router = useRouter();

const onAdd = async (event: React.MouseEvent) => {
  event.preventDefault();
  event.stopPropagation();
  if (!sessionId) return;
  try {
    await addItem({ sessionId, itemId: e._id, quantity: 1 });

    toast.success("Товар добавлен в корзину", {
      description: `${e.brand ?? ""} "${e.name}" ${e.variant ?? ""}`,
      action: {
        label: "Перейти в корзину",
        onClick: () => router.push("/checkout"),
      },
      duration: 4000,
    });
  } catch (err) {
    toast.error("Ошибка", {
      description: "Не удалось добавить товар в корзину",
      duration: 6000,
    });
  }
};
```

## User Experience Flow

1. **User clicks "В корзину" button** on any item in BestDeals section (Main page) or on the Catalog page
2. **Toast appears** in bottom-right corner with:
   - Success message: "Товар добавлен в корзину"
   - Item details: Brand, name, variant
   - Action button: "Перейти в корзину" (optional)
3. **Toast auto-dismisses** after 4-5 seconds
4. **Error handling**: If addition fails, show error toast

## Design Specifications

### Toast Appearance
- **Position**: Bottom-right corner (consistent with floating button)
- **Animation**: Slide in from right, fade out
- **Duration**: 4 seconds for success, 6 seconds for error
- **Colors**: 
  - Success: Green accent with white text
  - Error: Red accent with white text
- **Size**: Compact, non-intrusive

### Responsive Behavior
- **Desktop**: Bottom-right corner
- **Mobile**: Bottom center, full width with margins

## Dependencies

### New Dependencies (Sonner via shadcn)
```json
{
  "sonner": "^1.x"
}
```

### Installation Command
```bash
pnpm dlx shadcn@latest add sonner
```

## Files Changed

### New Files
- `components/ui/toast.tsx`
- `components/ui/use-toast.ts` 
- `hooks/useToast.ts` (if custom wrapper needed)

### Modified Files
- `app/layout.tsx` - Add `<Toaster />` provider
- `components/ItemCard.tsx` - Add toast notifications (affects both Main and Catalog pages)
- `app/page.tsx` - Optional floating cart button

## Testing Checklist

- [ ] Toast appears when adding item to cart from Main page
- [ ] Toast appears when adding item to cart from Catalog page
- [ ] Toast shows correct item details (brand, name, variant)
- [ ] Toast auto-dismisses after specified duration
- [ ] Error toast appears when cart addition fails
- [ ] Toast is responsive on mobile devices
- [ ] Multiple toasts stack properly
- [ ] Toast doesn't interfere with floating checkout button
- [ ] Action button in toast navigates to checkout correctly

## Rollback Plan

If issues arise:
1. Remove ToastProvider from layout.tsx
2. Revert ItemCard.tsx changes
3. Remove toast UI components
4. System returns to previous state without notifications

## Future Enhancements

1. **Toast for other actions**: Remove from cart, quantity updates
2. **Persistent cart indicator**: Update header cart count with animation
3. **Toast customization**: User preferences for notification style
4. **Analytics**: Track toast interaction rates

## Acceptance Criteria

- ✅ Users see immediate feedback when adding items to cart
- ✅ Toast notifications are visually consistent with app design
- ✅ Error states are handled gracefully
- ✅ Performance impact is minimal
- ✅ Mobile experience is optimized
- ✅ Integration doesn't break existing functionality

## Priority: High
This enhancement significantly improves user experience by providing immediate feedback for cart interactions, reducing user uncertainty and improving conversion rates.

## Estimated Development Time: 2-3 hours
- Toast component setup: 1 hour
- ItemCard integration: 1 hour  
- Testing and refinement: 1 hour