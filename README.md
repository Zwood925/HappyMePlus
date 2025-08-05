# HappyMePlus - Mental Wellness App

A Next.js-based mental wellness application that helps users track happy moments, receive encouragement, and connect with support groups.

## 🚀 Features

- **Happy Moments Tracking**: Users can log and view their positive experiences
- **Encouragement System**: Send and receive encouraging messages
- **Group Support**: Join and participate in support groups
- **Journal with Calendar**: Track mood and experiences over time
- **Stripe Integration**: Subscription and payment processing
- **Real-time Updates**: Live notifications and updates

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, DaisyUI
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Payments**: Stripe
- **Animations**: Framer Motion
- **State Management**: React Query (TanStack Query)

## 📁 Project Structure

```
HappyMePlus/
├── components/          # Reusable UI components
├── lib/                # Utility functions and configurations
├── pages/              # Next.js pages and API routes
│   ├── api/           # API endpoints
│   ├── groups/        # Group-related pages
│   └── journal/       # Journal and calendar pages
├── public/            # Static assets
├── styles/            # Global styles and Tailwind config
└── cache/             # Application cache
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase account
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HappyMePlus
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your actual values in `.env.local`:
   - Firebase credentials
   - Stripe API keys
   - Other configuration values

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

### Required
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Your Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Your Firebase app ID
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret

### Optional
- `NEXT_PUBLIC_APP_URL` - Your application URL
- `NODE_ENV` - Environment (development/production)

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔥 Firebase Integration

This project uses Firebase for:
- Authentication (Firebase Auth)
- Database (Firestore)
- Real-time features
- Storage (Firebase Storage)

Firebase provides a comprehensive backend solution with real-time capabilities and excellent developer experience.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.
