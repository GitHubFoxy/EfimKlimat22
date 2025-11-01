# Checkout Flow Specification

## ADDED Requirements

### Requirement: Checkout form creates order and redirects to payment
When a user fills out the checkout form with valid data and clicks "Оформить заказ", the system SHALL create an order in the database with status "pending_payment" and redirect the user to the payment page.

#### Scenario: First-time checkout
- **GIVEN** user has items in cart and is on checkout page
- **WHEN** user fills all required fields (name, phone, address) and clicks "Оформить заказ"
- **THEN** an order is created with status "pending_payment"
- **AND** user is redirected to /payment page with orderId and sessionId in URL
- **AND** cart items remain in database until payment completes

#### Scenario: Checkout with optional fields
- **GIVEN** user is on checkout page with cart items
- **WHEN** user fills required fields and optionally email and comment, then submits
- **THEN** order is created with all provided information
- **AND** email and comment are stored in order record
- **AND** redirect to /payment occurs

### Requirement: Checkout page shows success after payment return
When a user returns to the checkout page after successful payment, the page SHALL display a success message instead of the checkout form.

#### Scenario: Successful payment return
- **GIVEN** user completed payment via VTB
- **WHEN** user is redirected back to /checkout
- **THEN** checkout page shows success message "Заказ успешно оплачен!"
- **AND** displays order confirmation details
- **AND** does not show checkout form

#### Scenario: Failed payment return
- **GIVEN** user payment failed or was cancelled
- **WHEN** user is redirected back to /checkout
- **THEN** checkout page shows error message "Ошибка оплаты. Попробуйте снова."
- **AND** displays checkout form again
- **AND** preserves previously entered form data

### Requirement: Checkout form validates required fields
The checkout form SHALL validate that name, phone, and address fields are provided before submission.

#### Scenario: Missing required field
- **GIVEN** user is on checkout page
- **WHEN** user leaves name field empty and clicks submit
- **THEN** browser shows validation error
- **AND** form is not submitted
- **AND** page remains on checkout

#### Scenario: All required fields filled
- **GIVEN** user fills name, phone, and address fields
- **WHEN** user clicks submit
- **THEN** form validation passes
- **AND** order creation process begins

## MODIFIED Requirements

### Requirement: Checkout form submission behavior
The checkout form submission behavior is modified so that it SHALL create a pending payment order and redirect to payment page instead of immediately creating a completed order.

#### Before: Order created and success shown immediately
- Order created with final status
- Success message displayed
- Cart cleared immediately

#### After: Order pending, redirect to payment
- Order created with "pending_payment" status
- User redirected to payment page
- Success/failure handled after payment

### Requirement: Cart clearing timing
Cart clearing is modified so that it SHALL occur after successful payment rather than during checkout form submission.

#### Before: Cart cleared on form submit
- Cart items deleted immediately
- User sees empty cart state if navigates back

#### After: Cart cleared after payment
- Cart remains intact during payment
- Cart cleared only after successful VTB payment
- Cart persists if payment fails
