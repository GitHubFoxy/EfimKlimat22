# Tasks: VTB Payment Flow Integration

## Implementation Plan

### Phase 1: Database and Backend Updates

- [ ] **Task 1.1: Update Convex schema for payment fields**
  - Add paymentProvider, paymentStatus, paymentId, paymentAmount, paymentMethod fields to orders table
  - Add indexes for paymentStatus queries
  - Update schema.ts file
  - Run convex deploy

- [ ] **Task 1.2: Create order with payment status**
  - Modify createOrder mutation to accept payment status parameter
  - Create new mutation createOrderWithPayment() that sets status to "pending_payment"
  - Preserve all existing order fields
  - Update order status enum/constants

- [ ] **Task 1.3: Add payment status update mutation**
  - Create updatePaymentStatus(orderId, status, paymentData) mutation
  - Handle "paid", "failed", "cancelled" status transitions
  - Store VTB transaction ID and payment details
  - Clear cart when status becomes "paid"

### Phase 2: Checkout Flow Updates

- [ ] **Task 2.1: Modify checkout page to redirect to payment**
  - Update app/checkout/page.tsx
  - Change handleSubmit to call createOrderWithPayment()
  - Redirect to /payment with orderId in URL params instead of showing success immediately
  - Add loading state during order creation

- [ ] **Task 2.2: Update checkout success state logic**
  - Move success message display logic to handle payment return
  - Check URL params for payment status
  - Show appropriate success or error message based on payment result
  - Preserve user form data if payment fails

### Phase 3: Payment Page Creation

- [ ] **Task 3.1: Create payment page component**
  - Create app/payment/page.tsx
  - Display order summary (items, total, user info)
  - Add loading states for order data fetching
  - Add error handling for missing/invalid orders

- [ ] **Task 3.2: Create VTB client module**
  - Create lib/vtb/client.ts
  - Implement createPayment() function
  - Implement verifyCallback() function
  - Add environment variable validation
  - Add TypeScript types for VTB API

- [ ] **Task 3.3: Implement VTB payment initiation**
  - Add "Перейти к оплате" button on payment page
  - Call VTB API to create payment session
  - Redirect user to VTB payment URL
  - Pass order ID and amount to VTB

### Phase 4: VTB Integration

- [ ] **Task 4.1: Create VTB API route**
  - Create app/api/vtb/callback/route.ts (Next.js API route)
  - Verify VTB callback signatures
  - Parse callback parameters (orderId, status, paymentId)
  - Call Convex mutation to update order status

- [ ] **Task 4.2: Handle payment return URL**
  - Configure VTB to return to /checkout with orderId and status params
  - Update checkout page to read and handle these params
  - Show appropriate messages based on payment result

- [ ] **Task 4.3: Add error handling and validation**
  - Validate all payment amounts match order total
  - Handle duplicate payment attempts
  - Log all payment events for debugging
  - Add user-friendly error messages

### Phase 5: Testing and Polish

- [ ] **Task 5.1: Add environment configuration**
  - Add VTB credentials to .env.local (with comments for production)
  - Document required environment variables
  - Add validation to ensure all credentials are present

- [ ] **Task 5.2: Manual testing with VTB test mode**
  - Test complete payment flow with VTB test credentials
  - Verify order creation before payment
  - Verify payment success/failure scenarios
  - Test cart clearing after successful payment
  - Test cart preservation after failed payment

- [ ] **Task 5.3: Add payment timeout handling**
  - Implement automatic order cancellation after 15 minutes
  - Add cleanup job or cron job for expired payments
  - Show timeout message to users who return late

- [ ] **Task 5.4: Add Russian localization**
  - Translate all new UI texts to Russian
  - Verify existing Russian texts are appropriate
  - Test with Russian locale formatting for currency and dates

### Phase 6: Security and Production Readiness

- [ ] **Task 6.1: Secure VTB credentials**
  - Ensure VTB secret key is not exposed to client
  - Implement proper signature verification
  - Add rate limiting to callback endpoint
  - Log all payment events securely

- [ ] **Task 6.2: Add transaction logging**
  - Log all payment attempts (success and failure)
  - Log VTB API responses for debugging
  - Store logs with order ID for traceability
  - Consider adding audit log table for compliance

- [ ] **Task 6.3: Performance optimization**
  - Cache order data on payment page
  - Optimize database queries for payment status
  - Add indexes for paymentStatus and paymentId fields
  - Minimize redirects during payment flow

## Validation Checklist

Before marking tasks complete:
- [ ] Order is created with "pending_payment" status before payment
- [ ] Payment page displays correct order summary
- [ ] VTB payment form processes test transactions
- [ ] Order status updates to "paid" after successful payment
- [ ] Cart is cleared after successful payment
- [ ] Cart is preserved after failed payment
- [ ] Error messages are displayed in Russian
- [ ] Payment timeouts are handled gracefully
- [ ] All callbacks are verified and logged
- [ ] Environment variables are properly configured

## Dependencies and Prerequisites

Before starting implementation:
1. **VTB Merchant Account**: Need VTB test and production merchant credentials
2. **VTB API Documentation**: Access to VTB payment gateway API docs
3. **Callback URL Setup**: Configure VTB callback URL in merchant dashboard
4. **Test Environment**: VTB test mode credentials and test cards

## Notes and Assumptions

- Using RUB currency for all payments
- VTB provides redirect-based payment flow (user leaves site, pays, returns)
- Orders created before payment to reserve items in cart
- Cart persists during payment to handle failures gracefully
- Success/failure messages will be in Russian language
- Payment timeout set to 15 minutes (can be adjusted based on VTB limits)
