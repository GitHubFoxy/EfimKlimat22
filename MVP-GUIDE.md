# MVP Development Guide - EfimKlimat22

## 🚀 Quick Start (30 seconds)
```bash
npm run mvp
```
This starts both frontend (Next.js) and backend (Convex) in parallel.

## 📦 MVP Core Features Ready
- ✅ **Homepage**: Hero, brands, best deals
- ✅ **Catalog**: Browse products with search/filters  
- ✅ **Cart**: Add/remove items, session persistence
- ✅ **Checkout**: Order creation flow
- ✅ **Manager Panel**: Order management, consultant requests
- ✅ **Dashboard**: Add/edit products, categories

## 🛠 MVP Development Commands
```bash
npm run mvp          # Start development (same as npm run dev)
npm run quick-build  # Build without linting (faster)
npm run reset-db     # Clear Convex database for fresh start
npm run deploy       # Build and deploy to production
```

## 🎯 MVP Focus Areas
1. **Core E-commerce Flow**: Homepage → Catalog → Cart → Checkout
2. **Manager Tools**: Basic order management
3. **Product Management**: Add/edit items via dashboard

## 🚫 Skip for MVP
- Complex authentication (use simple phone-based for managers)
- Advanced search/filtering (basic search works)
- Extensive testing (manual testing for MVP)
- Complex deployment (Vercel + Convex Cloud is simple)

## 📱 MVP Testing Checklist
- [ ] Homepage loads with products
- [ ] Can browse catalog and search
- [ ] Can add items to cart
- [ ] Can complete checkout (creates order)
- [ ] Manager can view/update orders
- [ ] Dashboard can add new products

## 🚀 MVP Deployment
1. Deploy Convex: `npx convex deploy`
2. Deploy Next.js: Push to Vercel (auto-deploys)
3. Set `NEXT_PUBLIC_CONVEX_URL` in Vercel environment

## 🔄 Post-MVP Additions
- User authentication
- Payment integration  
- Advanced search/filters
- Automated testing
- Performance optimization