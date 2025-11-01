# Payment Processing Specification

## ADDED Requirements

### Requirement: Payment page displays order details
The /payment page SHALL display order summary including items, quantities, and total amount for user verification before payment.

#### Scenario: User views payment page
- **GIVEN** user was redirected from checkout after form submission
- **WHEN** user visits /payment page
- **THEN** page displays:
  - Order summary with all cart items
  - Item names, quantities, prices
  - Total amount in rubles
  - User contact information from checkout form
- **AND** displays "Оплата заказа" (Order Payment) header
- **AND** shows payment form or redirect button to VTB

#### Scenario: Payment page with empty cart
- **GIVEN** user tries to access /payment without valid order
- **WHEN** user visits /payment page
- **THEN** page redirects to /checkout with error message
- **AND** displays "Корзина пуста или заказ не найден"

### Requirement: VTB payment gateway integration
The system SHALL integrate with VTB payment gateway to process credit card and other payment methods.

#### Scenario: User initiates payment
- **GIVEN** user is on payment page with valid order
- **WHEN** user clicks "Перейти к оплате" (Proceed to Payment)
- **THEN** system creates payment session with VTB API
- **AND** redirects user to VTB payment form
- **AND** passes order amount, currency (RUB), and order metadata

#### Scenario: VTB payment form displayed
- **GIVEN** user completed checkout form and clicked payment button
- **WHEN** VTB payment page loads
- **THEN** user sees:
  - VTB-branded payment form
  - Order amount in RUB
  - Fields for payment method (card, Sberbank, etc.)
  - Security indicators (PCI DSS, SSL)

### Requirement: Payment callback handling
The system SHALL handle VTB payment callback to update order status based on payment result.

#### Scenario: Successful payment callback
- **GIVEN** user completed payment on VTB
- **WHEN** VTB sends success callback to /api/vtb/callback
- **THEN** system:
  - Verifies VTB callback authenticity
  - Updates order status to "paid"
  - Stores VTB transaction ID in order
  - Clears user's cart
  - Redirects user to /checkout with success state

#### Scenario: Failed payment callback
- **GIVEN** user payment failed or was cancelled
- **WHEN** VTB sends failure callback
- **THEN** system:
  - Verifies callback authenticity
  - Updates order status to "failed"
  - Stores payment failure reason
  - Preserves cart items
  - Redirects user to /checkout with error state

### Requirement: Payment page timeout handling
If payment is not completed within timeout period, the order SHALL be cancelled.

#### Scenario: Payment timeout
- **GIVEN** user is on VTB payment page
- **WHEN** more than 15 minutes elapse without payment completion
- **THEN** system:
  - Marks order as "cancelled"
  - Clears any pending payment session
  - Cart remains as-is
  - User sees timeout message if they return

### Requirement: Payment security and verification
All VTB callbacks SHALL be verified to ensure authenticity before processing.

#### Scenario: Callback verification
- **GIVEN** VTB sends payment callback
- **WHEN** system receives callback
- **THEN** system:
  - Validates VTB signature/secret key
  - Verifies callback source IP/domain
  - Checks merchant ID matches configuration
  - Rejects callbacks that fail verification
  - Logs all callbacks for audit

## MODIFIED Requirements

### Requirement: Order status tracking
Order status tracking is extended so that it SHALL support payment flow states.

#### Before: Simple status (pending, processing, done)
- Status indicates order fulfillment progress only

#### After: Enhanced status including payment states
- Status: "pending_payment" - order created, awaiting payment
- Status: "processing" - payment received, order being fulfilled
- Status: "done" - order completed and delivered
- Status: "failed" - payment failed
- Status: "cancelled" - order cancelled (timeout or user)

### Requirement: Order database schema
Order table schema is extended so that it SHALL include payment-related fields.

#### Before: Basic order information
- name, phone, email, address, comment
- status, createdAt, updatedAt

#### After: Extended with payment fields
- **ADDED** paymentProvider: string ("vtb")
- **ADDED** paymentStatus: string ("pending", "paid", "failed", "cancelled")
- **ADDED** paymentId: string (VTB transaction ID)
- **ADDED** paymentAmount: number (amount in rubles)
- **ADDED** paymentMethod: string (card, sberbank, etc.)
- **ADDED** paymentCompletedAt: Date (when payment succeeded)

## REMOVED Requirements

### Requirement: Immediate order creation (REMOVED)
The behavior where orders were immediately marked as "processing" upon checkout form submission is removed.

#### Rationale
Payment must be completed first to ensure funds are received before order fulfillment begins.
