# Proposal: VTB Payment Flow Integration

## Summary
Integrate VTB payment gateway into the checkout flow to provide secure online payment processing. Currently, orders are created immediately upon checkout form submission. This change will redirect users to a dedicated payment page where they can complete payment via VTB before the order is finalized.

## User Flow
1. User fills out checkout form (name, phone, email, address, comment)
2. User clicks "Оформить заказ" button
3. **NEW**: Order is created in database with status "pending_payment"
4. User is redirected to `/payment` page
5. User enters payment details via VTB payment form
6. After payment, VTB redirects user back to checkout page
7. Checkout page shows success message "Your order is all good" (or similar in Russian)
8. Order status is updated to "paid" or appropriate status

## Why This Change
- **Security**: Payment processing handled by VTB ( PCI DSS compliant gateway)
- **User Experience**: Clear separation between checkout information and payment
- **Reliability**: Professional payment flow with transaction tracking
- **Business Requirements**: Enable online payments for customers

## Technical Approach
- Create new `/payment` page to handle VTB integration
- Update checkout flow to create order before payment
- Implement VTB payment form and callback handling
- Update order status based on VTB response

## Risks & Considerations
- VTB API integration complexity
- Need to handle payment failures/cancellations
- Session/cart state management during payment flow
- Potential timeout handling

## Validation Steps
1. Order creation works before payment
2. Payment page displays with correct amount
3. VTB payment form processes transactions
4. Success/failure messages display correctly
5. Order status updates in database
6. Cart is cleared after successful payment

## Dependencies
- VTB merchant account and API credentials
- Next.js routing (existing)
- Convex backend (existing)
- Cart session management (existing)

## Success Criteria
- User can complete full payment flow
- Orders are properly recorded before and after payment
- Payment status accurately reflects in database
- Users receive clear feedback at each step
- Failed payments are handled gracefully

## Open Questions
- Need VTB API documentation and test credentials
- Need to confirm payment confirmation message text (Russian)
- Need to decide on handling incomplete/failed payments
- Need to confirm currency (RUB assumed)