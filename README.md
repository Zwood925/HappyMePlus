# BarBook – Digital Lyric Notebook

BarBook is a lightweight creative sketchpad for rappers, poets, and lyricists. It lets artists jot down bars, experiment with AI‑generated beats, and receive smart writing assistance such as rhyme suggestions and cadence breakdowns.

## 🚀 Features

- **Notebook Pages**: Capture lyrical ideas in simple text pages.
- **AI Beat Generator**: Produce instrumental loops with services like MusicGen or Riffusion.
- **Writing Assistant**: Get rhymes, cadence help, and next‑line ideas tailored to a selected genre.
- **Export**: Paid users can export notebooks as PDF/Doc along with accompanying beats.

## 🛠 Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS, DaisyUI
- **Backend**: Firebase (Auth, Firestore, Storage) with optional Node.js/Express APIs
- **AI Integration**: OpenAI for writing help, MusicGen or Riffusion for beats
- **Payments**: Stripe

## 📁 Project Structure

```
BarBook/
├── components/          # Reusable UI components
├── lib/                # Utility functions and configurations
├── pages/              # Next.js pages and API routes
│   ├── api/           # API endpoints
│   └── barbook.tsx    # Sample writing assistant page
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
   cd BarBook
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
