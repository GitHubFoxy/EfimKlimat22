# Design: VTB Payment Flow Integration

## Architecture Overview

```
[Checkout Page] → [Create Order] → [Payment Page] → [VTB Gateway] → [Return URL] → [Update Order] → [Show Success]
     ↓                    ↓                ↓              ↓               ↓              ↓              ↓
  Form Data          DB: pending        VTB Form    Payment Form    Callback      DB: paid      Success State
```

## Component Design

### 1. Checkout Flow Updates

**File**: `app/checkout/page.tsx`

**Changes**:
- Modify `handleSubmit` to create order and redirect to `/payment` instead of immediately showing success
- Pass order ID and session to payment page via URL params or session state
- Move success state logic to show after payment return

**State Flow**:
```
formData + sessionId → createOrder() → orderId
→ redirect /payment?orderId=...&sessionId=...
```

### 2. Payment Page

**File**: `app/payment/page.tsx`

**Responsibilities**:
- Display order summary (items, total)
- Render VTB payment form or iframe
- Handle VTB callback/webhook
- Redirect back to checkout on completion

**VTB Integration Options**:
1. **Embedded Form**: VTB provides HTML form to embed
2. **Redirect Flow**: User is redirected to VTB, then back
3. **Widget/SDK**: VTB provides JavaScript widget

**Decision**: Use redirect flow for simplicity (easiest to implement and debug)

### 3. Database Updates

**Schema**: `convex/schema.ts`

**Changes**:
- Add `paymentProvider` field to orders table
- Add `paymentStatus` enum: 'pending', 'processing', 'paid', 'failed', 'cancelled'
- Add `paymentId` field to store VTB transaction ID
- Add `paymentMethod` field

**Convex Functions**:
- `orders/createOrderWithPayment()` - creates order with pending_payment status
- `orders/updatePaymentStatus()` - updates order after VTB callback
- `orders/getPaymentStatus()` - query for payment page

### 4. VTB Integration Layer

**File**: `lib/vtb/client.ts`

**Responsibilities**:
- Initialize payment with VTB API
- Generate payment form URL
- Handle payment confirmation
- Parse VTB webhooks/callbacks
- Sign requests with VTB credentials

**VTB API Methods** (placeholder - need actual VTB API):
```typescript
interface VTBClient {
  createPayment(order: Order, amount: number): Promise<PaymentInit>
  verifyCallback(params: any): boolean
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>
}
```

### 5. Callback Handling

**File**: `app/api/vtb/callback/route.ts` (Next.js API route)

**Process**:
1. VTB sends payment result to callback URL
2. Verify VTB signature
3. Extract order ID and payment status
4. Update order in Convex database
5. Redirect user to checkout with success state

**URL Pattern**: `/api/vtb/callback?orderId=...&status=...&paymentId=...`

### 6. Session Management

**Challenge**: User may navigate away during payment

**Solution**:
- Store orderId in URL params
- Store sessionId in URL params
- Convex cart session is already handled via localStorage
- Order status will be checked on return

## Error Handling

### Payment Failed
- Show error message on payment page
- Option to retry or cancel
- Order remains with 'failed' status
- User can return to checkout

### Network Timeout
- Implement timeout (e.g., 15 minutes)
- Mark order as 'cancelled' if no response
- Clear cart if timeout
- Show timeout message

### Duplicate Payment
- Check if order already processed
- Return existing order status
- Prevent double charges

## Security Considerations

1. **VTB Credentials**: Store in environment variables
   - `VTB_MERCHANT_ID`
   - `VTB_API_KEY`
   - `VTB_SECRET_KEY`

2. **Callback Verification**: Verify all callbacks from VTB
   - Check signature
   - Check merchant ID
   - Log all callbacks

3. **Data Validation**: Sanitize all inputs
   - Order ID format
   - Payment amounts
   - User data

## Russian Localization

All messages in Russian:
- "Перенаправляем на страницу оплаты..." (Redirecting to payment page...)
- "Оплата заказа" (Order Payment)
- "Заказ успешно оплачен!" (Order paid successfully!)
- "Ошибка оплаты. Попробуйте снова." (Payment error. Try again.)

## Testing Strategy

1. **Unit Tests**:
   - VTB client verification
   - Order status updates
   - Callback handling

2. **Integration Tests**:
   - End-to-end payment flow (test mode)
   - Failed payment handling
   - Timeout scenarios

3. **Manual Testing**:
   - Full payment flow with VTB test credentials
   - Browser back/forward navigation
   - Page refresh during payment

## Environment Variables Required

```bash
VTB_MERCHANT_ID=your_merchant_id
VTB_API_KEY=your_api_key
VTB_SECRET_KEY=your_secret_key
VTB_PAYMENT_URL=https://payments.vtb.ru/pay  # Or VTB test URL
VTB_CALLBACK_URL=https://your-domain.com/api/vtb/callback
```

## Timeline Estimation

- **Day 1**: Create payment page and update checkout flow
- **Day 2**: Integrate VTB client and API calls
- **Day 3**: Implement callback handling and order updates
- **Day 4**: Testing, error handling, and refinement

## Open Decisions

1. **Payment Method**: Card only, or multiple methods (Sberbank, Yandex.Money, etc.)?
2. **Currency**: RUB only or multi-currency?
3. **Success Page**: Stay on checkout page or separate success page?
4. **Cart Clearing**: When to clear cart (after payment success or before redirect)?
5. **Receipt**: Need to display receipt/transaction details to user?
