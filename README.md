# Moir - Mindful Journaling PWA

<div align="center">

A beautiful, mindful journaling application built as a Progressive Web App (PWA) for seamless mobile and desktop experiences.

**[Live Demo →](https://moir-app.web.app)**

</div>

---

## 📖 Overview

Moir is a Firebase-powered journaling app designed to help users capture thoughts, track writing streaks, organize entries into notebooks, and gain weekly insights. Built with a focus on mindfulness and reflection, Moir provides a distraction-free writing experience that works offline and installs like a native app.

---

## ✨ Key Features

- 📝 **Rich Journaling** - Write daily entries with titles, content, and dates
- 📚 **Notebook Organization** - Group entries into custom notebooks with color coding
- 🎯 **Thought Dump** - Quickly capture fleeting thoughts and define actionable items
- 📅 **Calendar View** - Visual timeline of all journal entries
- 🔍 **Search** - Find entries by content, title, or date
- 📊 **Weekly Reflections** - Automated insights from entries in enabled notebooks
- 🔥 **Writing Streak Tracker** - Stay motivated with continuous writing streaks
- 🎨 **Beautiful UI** - Clean, calming design with smooth animations
- 📱 **PWA Capabilities**:
  - ✅ Installable on mobile and desktop
  - ✅ Offline support (service worker caching)
  - ✅ Native app-like experience
  - ✅ Push notifications ready
  - ✅ No zoom, no pull-to-refresh (mobile)

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **React Router DOM** - Client-side routing
- **Lucide React** - Icon library

### Backend & Services
- **Firebase Authentication** - User auth with email/password
- **Cloud Firestore** - NoSQL database for entries, notebooks, and user data
- **Firebase Hosting** - Static site hosting with CDN
- **Workbox** - Service worker for offline caching

### PWA
- **vite-plugin-pwa** - Automated PWA generation
- **Web App Manifest** - Installability configuration
- **Service Worker** - Runtime caching and offline support

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Firestore and Authentication enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/C4lie/MOIR.git
   cd MOIR/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   
   Create a `.env.production` file in the `frontend` directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   App will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The optimized build will be generated in the `dist/` folder.

---

## 📦 Deployment

### Firebase Hosting

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Firebase (if not done)**
   ```bash
   firebase init hosting
   ```
   - Select your Firebase project
   - Set public directory to `dist`
   - Configure as single-page app: Yes
   - Don't overwrite index.html

4. **Deploy**
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 🗂️ Project Structure

```
frontend/
├── public/              # Static assets (icons, manifest)
├── src/
│   ├── components/      # Reusable UI components
│   ├── context/         # React context (AuthContext)
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Route pages (Dashboard, WriteEntry, etc.)
│   ├── firebase.ts      # Firebase configuration
│   ├── App.tsx          # Main app component with routing
│   ├── main.tsx         # App entry point
│   └── index.css        # Global styles (Tailwind)
├── dist/                # Production build output
├── firebase.json        # Firebase hosting config
├── vite.config.ts       # Vite + PWA configuration
└── package.json         # Dependencies and scripts
```

---

## 🧩 Core Functionality

### Authentication
- Email/password authentication via Firebase Auth
- Protected routes redirect to login
- Persistent auth state with React Context

### Data Models

**Entries**
```typescript
{
  userId: string
  notebookId: string
  title: string
  content: string
  entry_date: string (YYYY-MM-DD)
  created_at: Timestamp
  updated_at: Timestamp
}
```

**Notebooks**
```typescript
{
  userId: string
  name: string
  color: string
  include_in_weekly_summary: boolean
  created_at: Timestamp
}
```

**Thought Dumps**
```typescript
{
  userId: string
  problem_text: string
  action_text: string
  created_at: Timestamp
}
```

---

## 🎯 Features Breakdown

### Dashboard
- Writing streak counter
- Total entries and notebooks stats
- Recent entries preview
- Latest thought dump action widget

### Write Entry
- Auto-save with debounce (2s)
- Word count tracker
- Notebook selector
- Date picker

### Notebooks
- Create, edit, delete notebooks
- Color coding for organization
- Entry count per notebook
- Toggle weekly summary inclusion

### Weekly Reflection
- Aggregates entries from past 7 days
- Only includes notebooks with weekly summary enabled
- Shows entry count, dominant writing time, keywords

### Calendar
- Monthly view of all entries
- Click to view entry details
- Visual indicator for days with entries

---

## 🔐 Security

- Firebase Security Rules enforce user-level data isolation
- All Firestore queries filter by `userId`
- Environment variables keep Firebase keys secure
- `.gitignore` prevents secrets from being committed

---

## 📱 PWA Installation

### Mobile (Android/iOS)
1. Visit https://moir-app.web.app on mobile browser
2. Wait for install prompt or tap browser menu
3. Select "Add to Home Screen" or "Install app"
4. App icon appears on home screen

### Desktop (Chrome/Edge)
1. Visit https://moir-app.web.app
2. Click install icon (⊕) in address bar
3. Confirm installation
4. App opens in standalone window

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🌐 Live Demo

Experience Moir live at: **[https://moir-app.web.app](https://moir-app.web.app)**

---

## 💡 Acknowledgments

- Designed and built with mindfulness in mind
- Inspired by Bullet Journal methodology
- Firebase for backend infrastructure
- Vite for blazing-fast development

---

<div align="center">
Made with ❤️ by the Moir Team
</div>
