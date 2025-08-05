# HappyMePlus Project Structure

This document outlines the organized structure of the HappyMePlus application.

## 📁 Directory Structure

```
HappyMePlus/
├── components/              # Reusable UI components
│   ├── index.ts            # Component exports
│   ├── layout.tsx          # Main layout component
│   ├── Sidebar.tsx         # Navigation sidebar
│   ├── SendEncouragement.tsx
│   ├── SendEncouragementModal.tsx
│   └── LogoutButton.tsx
├── hooks/                  # Custom React hooks
│   ├── index.ts            # Hook exports
│   └── useEncouragements.ts
├── lib/                    # Utilities, configs, and shared code
│   ├── index.ts            # Main exports
│   ├── config.ts           # Environment configuration
│   ├── constants.ts        # Application constants
│   ├── types.ts            # TypeScript type definitions
│   ├── utils.ts            # Utility functions
│   ├── firebase.ts         # Firebase client setup
│   ├── firebaseAuth.ts     # Firebase authentication utilities
│   └── getRandomEncouragement.tsx
├── pages/                  # Next.js pages and API routes
│   ├── _app.tsx            # App wrapper
│   ├── index.tsx           # Home page
│   ├── login.tsx           # Login page
│   ├── signup.tsx          # Signup page
│   ├── settings.tsx        # User settings
│   ├── encouragements.tsx  # Encouragements page
│   ├── success.tsx         # Payment success
│   ├── cancel.tsx          # Payment cancellation
│   ├── api/                # API endpoints
│   │   ├── create-checkout-session.ts
│   │   └── stripe-webhook.ts
│   ├── groups/             # Group-related pages
│   │   ├── index.tsx       # Groups list
│   │   ├── create.tsx      # Create group
│   │   ├── join.tsx        # Join group
│   │   └── [id].tsx        # Group details
│   └── journal/            # Journal pages
│       ├── index.tsx       # Journal main
│       └── calendar.tsx    # Calendar view
├── public/                 # Static assets
├── styles/                 # Global styles
│   ├── globals.css         # Global CSS
│   ├── Home.module.css     # Home page styles
│   ├── tailwind.config.js  # Tailwind configuration
│   └── postcss.config.js   # PostCSS configuration
├── cache/                  # Application cache
├── env.example             # Environment variables template
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── next.config.ts          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── README.md               # Project documentation
└── PROJECT_STRUCTURE.md    # This file
```

## 🔧 Configuration Files

### Environment Variables (`env.example`)
- **Firebase**: Database, authentication, and storage configuration
- **Stripe**: Payment processing configuration
- **App**: General application settings

### Centralized Configuration (`lib/config.ts`)
- Validates required environment variables
- Provides type-safe access to configuration
- Centralizes all app settings

## 📦 Dependencies

### Core Dependencies
- **Next.js 15**: React framework
- **React 18**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **DaisyUI**: Component library

### Authentication & Database
- **Firebase**: Auth, Firestore database, and storage
- **Firebase SDK**: Official Firebase JavaScript SDK

### Payments
- **Stripe**: Payment processing
- **@stripe/stripe-js**: Stripe client library

### UI & Animation
- **Framer Motion**: Animations
- **React Calendar**: Calendar component
- **Classnames**: CSS class utilities
- **Tailwind Merge**: Tailwind class merging

### Utilities
- **Date-fns**: Date manipulation
- **UUID**: Unique ID generation
- **React Query**: Data fetching and caching

## 🎯 Key Features

### Current Features
1. **User Authentication**: Firebase Auth with email/password
2. **Happy Moments**: Users can log positive experiences
3. **Encouragement System**: Send/receive encouraging messages
4. **Group Support**: Join and participate in support groups
5. **Journal**: Personal journal with calendar view
6. **Stripe Integration**: Subscription and payment processing

### Planned Features (Future Enhancements)
1. **Enhanced Authentication**: Social providers (Google, Facebook, etc.)
2. **Real-time Database**: Firestore for real-time updates
3. **Push Notifications**: Firebase Cloud Messaging
4. **Analytics**: Firebase Analytics integration

## 🔄 Migration Plan

### Phase 1: Organization ✅
- [x] Centralized configuration
- [x] Organized file structure
- [x] Type definitions
- [x] Utility functions
- [x] Constants management

### Phase 2: Firebase Integration ✅
- [x] Firebase project setup
- [x] Authentication migration
- [x] Basic Firebase configuration
- [x] Auth utilities and hooks

### Phase 3: Enhancement (Future)
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Performance optimization
- [ ] Mobile app development

## 🚀 Development Workflow

1. **Environment Setup**: Copy `env.example` to `.env.local`
2. **Install Dependencies**: `npm install`
3. **Start Development**: `npm run dev`
4. **Build for Production**: `npm run build`

## 📝 Code Standards

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and formatting
- **Component Structure**: Functional components with hooks
- **File Naming**: kebab-case for files, PascalCase for components
- **Import Organization**: Grouped by type (React, third-party, local)

## 🔍 File Naming Conventions

- **Components**: PascalCase (e.g., `SendEncouragement.tsx`)
- **Pages**: kebab-case (e.g., `create-checkout-session.ts`)
- **Utilities**: camelCase (e.g., `supabaseClient.ts`)
- **Types**: camelCase (e.g., `types.ts`)
- **Constants**: camelCase (e.g., `constants.ts`) 