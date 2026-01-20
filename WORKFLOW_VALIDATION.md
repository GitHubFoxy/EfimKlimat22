# 🎯 WORKFLOW VALIDATION CHECKLIST

**Instructions:** Go through the app and test each workflow. For each, mark:
- ✅ **Works perfectly**
- ⚠️ **Has issues** (describe what's broken)
- ❌ **Doesn't work at all**
- ❓ **Can't find this feature** (might be missing)

---

## CORE CUSTOMER JOURNEY

### 1. Homepage → Catalog → Add to Cart → Checkout → Order Confirmation
**Status:** [ ]
**Notes:** 
```
[Describe what works, what doesn't, any errors encountered]
```
The main route renders, both hero button and nav bar works, add to cart from /catalog works, FloatingButton redirects to Checkout, the form is validated a bit, can do an order, cant do payment. 

Need payment wall
Everything is kinda okay


### 2. Search Functionality
**Does the search bar in the header work in real-time?**
Status: [ ]
**Notes:** YES
```

```

**Does it show the right number of results?**
Status: [ ]
**Notes:** YES 
```

```

**Does clicking a result navigate to the product page correctly?**
Status: [ ]
**Notes:** YES 
```

```

### 3. Product Filtering & Sorting
**Do category/brand filters work?**
Status: [ ]
**Notes:** yes 
```

```

**Does price sorting (low→high, high→low) work?**
Status: [ ]
**Notes:** yes
```

```

**Do the "Хиты продаж" / "Новинки" / "Со скидкой" quick filters work?**
Status: [ ]
**Notes:** No
```

```

---

## CART & CHECKOUT

### 4. Cart Persistence
**Does adding an item to cart persist across page navigation?**
Status: [ ]
**Notes:** YES
```

```

**If you add the same item twice, does quantity increment?**
Status: [ ]
**Notes:** YES
```

```

**Does the cart icon show the correct item count?**
Status: [ ]
**Notes:** YES
```

```

### 5. Checkout Form Validation
**Are all required fields validated (name, phone, address)?**
Status: [ ]
**Notes:** NO, not needed (they are req, after that manager will call)
```

```

**Does phone number format validation work?**
Status: [ ]
**Notes:** Not needed
```

```

**Do delivery method options appear correctly (pickup, courier, transport)?**
Status: [ ]
**Notes:** YES
```

```

### 6. Order Placement
**After submitting checkout, does it create an order in the database?**
Status: [ ] YES
**Notes:**
```

```

**Does the order confirmation page load with correct details?**
Status: [ ] YES
**Notes:**
```

```

**Does the order number generate correctly?**
Status: [ ] YES
**Notes:**
```

```

---

## MANAGER/ADMIN FEATURES

### 7. Admin Authentication
**Can a manager log in with phone + password?**
Status: [ ] YES
**Notes:**
```

```

**Are non-managers blocked from accessing `/manager`?**
Status: [ ] YES
**Notes:**
```

```

### 8. Product Management
**Can a manager add a new product?**
Status: [ ]
**Notes:**
```

```

**Can existing products be edited (name, price, images, specs)?**
Status: [ ]
**Notes:**
```

```

**Can products be deleted (soft/hard delete)?**
Status: [ ]
**Notes:**
```

```

**Does the product list display correctly with all fields?**
Status: [ ]
**Notes:**
```

```

### 9. Order Management
**Can managers view all orders?**
Status: [ ]
**Notes:**
```

```

**Can order status be updated (new → confirmed → processing → etc.)?**
Status: [ ]
**Notes:**
```

```

**Can managers add notes to orders?**
Status: [ ]
**Notes:**
```

```

**Can managers claim/assign orders?**
Status: [ ]
**Notes:**
```

```

### 10. Leads/Consultation Requests
**When a user submits "Заказать консультацию", is it saved as a lead?**
Status: [ ]
**Notes:**
```

```

**Can managers view and update lead status?**
Status: [ ]
**Notes:**
```

```

**Can managers respond to leads?**
Status: [ ]
**Notes:**
```

```

---

## DATA INTEGRITY

### 11. Stock Management
**Are out-of-stock items handled correctly (hidden or marked)?**
Status: [ ]
**Notes:**
```

```

**Does adding to cart check inventory?**
Status: [ ]
**Notes:**
```

```

**Does checking out reduce stock quantity?**
Status: [ ]
**Notes:**
```

```

### 12. Pricing & Discounts
**Are prices displayed correctly (with old price if on sale)?**
Status: [ ]
**Notes:**
```

```

**Does the discount percentage calculate correctly?**
Status: [ ]
**Notes:**
```

```

**Are prices formatted with Russian locale (spaces, not commas)?**
Status: [ ]
**Notes:**
```

```

---

## EDGE CASES & MISSING FEATURES

### 13. Order History
**Can users view their own order history?**
Status: [ ]
**Notes:**
```

```

**Is there a user account/profile page?**
Status: [ ]
**Notes:**
```

```

### 14. B2B/Wholesale
**Is wholesale ordering a feature?**
Status: [ ]
**Notes:**
```

```

**Is there a B2B checkout flow?**
Status: [ ]
**Notes:**
```

```

### 15. Product Images & Media
**Do product images load correctly?**
Status: [ ]
**Notes:**
```

```

**Does the image carousel work (prev/next buttons)?**
Status: [ ]
**Notes:**
```

```

**Can images be uploaded by managers?**
Status: [ ]
**Notes:**
```

```

### 16. Reviews & Ratings
**Can users leave reviews on products?**
Status: [ ]
**Notes:**
```

```

**Are reviews displayed on product pages?**
Status: [ ]
**Notes:**
```

```

### 17. Mobile Experience
**Is the site fully responsive on mobile?**
Status: [ ]
**Notes:**
```

```

**Does the mobile header/sidebar work?**
Status: [ ]
**Notes:**
```

```

**Are filter/sort options accessible on mobile?**
Status: [ ]
**Notes:**
```

```

### 18. Footer & Site Navigation
**Are footer links functional?**
Status: [ ]
**Notes:**
```

```

**Is contact information correct?**
Status: [ ]
**Notes:**
```

```

**Are there any broken links?**
Status: [ ]
**Notes:**
```

```

---

## ADDITIONAL OBSERVATIONS

**Other issues/features found:**
```
[Add anything else you discover]
```

**Performance issues:**
```
[Any slow pages, loading issues, etc.]
```

**UI/UX issues:**
```
[Any confusing flows, broken layouts, etc.]
```
