# Streakz

Track your daily habits and build consistency with GitHub-inspired contribution calendars.

## Prerequisites

### Node.js Environment Setup

1. Install Node.js (v18 or later) from [nodejs.org](https://nodejs.org/)
2. Verify the installation by running:
   ```bash
   node --version
   npm --version
   ```

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore in your project
3. Create a web app in your Firebase project
4. Copy your Firebase configuration:
   - Go to Project Settings > General
   - Scroll to "Your apps" section
   - Copy the Firebase config object
5. Create a `.env.local` file in the project root and add your Firebase config:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### Project Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

### Deploying to Vercel

1. Create a Vercel account at [vercel.com](https://vercel.com) if you haven't already
2. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Link your project to Vercel:
   ```bash
   vercel link
   ```

### Environment Variables Setup

1. In your Vercel project dashboard, go to Settings > Environment Variables
2. Add the following environment variables with your Firebase configuration:
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`

### Deploy

1. Deploy to production:
   ```bash
   vercel --prod
   ```

Alternatively, you can connect your GitHub repository to Vercel for automatic deployments:
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure your environment variables
4. Deploy

Your app will be automatically deployed on every push to the main branch.