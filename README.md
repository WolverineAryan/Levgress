# Levgress: Gamified Learning & Milestone Portfolio System

Levgress is a premium, state-of-the-art educational tracker that gamifies the student development pipeline. It allows students to manage deliverables, track streaks, earn experience points (XP), unlock badges, and interact directly with instructors. Instructors can evaluate student submissions, approve or reject milestones, and communicate via real-time comment threads.

---

## 🚀 Key Features

* **Gamified Student Pipeline**: Tracks 5 milestones per project. Students submit text descriptions, links, and screenshots to level up and gain XP.
* **Instructor Portfolio Review**: A dedicated dashboard for instructors (`STAFF`) to review deliverables, grade scores, provide feedback, and accept or reject milestones.
* **Aesthetic Dashboard UI**: Highly responsive dashboards featuring modern styling, dark/light theme options, dynamic particle effects, and customized SVG radar charts visualizing skill levels.
* **Authentication**: Seamless passwordless authentication via Google Single Sign-On (SSO) powered by Firebase Auth.
* **Real-time Synchronization**: Live updates for comments, evaluations, notifications, and celebrations powered by Socket.io.
* **Automatic Database Seeding**: Boot-sequence checks that automatically populate the database with default badges, skill categories, and master tracks when empty.

---

## 🛠️ Technology Stack

### Frontend
* **Core**: React, Vite, React Router DOM
* **Styling**: Vanilla CSS with custom design variables (light/dark adaptive mode)
* **Real-time & Charts**: Socket.io-client, Recharts, Framer Motion, Lucide React
* **Auth**: Firebase Client SDK

### Backend
* **Core**: Node.js, Express, Socket.io
* **Database**: MongoDB (Mongoose ODM), Supabase Storage Client (for file attachments)
* **Auth**: Firebase Admin SDK (token verification and verification flow)
* **AI Integration**: Groq SDK (Llama-3.3-70b-versatile for grading and feedback)

---

## 📦 Project Structure

```text
├── backend/            # Express REST API, Mongoose Models, and Sockets
│   ├── src/
│   │   ├── config/     # DB, Env, Socket, and Firebase Admin configurations
│   │   ├── controllers/# Route controller actions
│   │   ├── middleware/ # Auth, rate-limiter, and error handlers
│   │   ├── models/     # Mongoose Schemas (User, Project, Milestone, Badge)
│   │   ├── routes/     # Route endpoints definitions
│   │   ├── seed/       # Seeding files (Badges, Master Skills, Mock Users)
│   │   └── services/   # Business logic (Gamification, Notifications, Projects)
│   └── server.js       # Backend entrypoint
└── frontend/           # React Single Page Application (SPA)
    ├── src/
    │   ├── api/        # Axios API handlers
    │   ├── components/ # Common layouts, UI, and chart components
    │   ├── context/    # Global Auth Context state
    │   └── pages/      # Route pages (Login, Dashboard, Projects, Onboarding, Review)
    └── vite.config.js  # Vite configurations
```

---

## ⚙️ Local Installation & Setup

### Prerequisites
* **Node.js**: v18 or later
* **MongoDB**: A running local MongoDB instance or a MongoDB Atlas cloud URI
* **Firebase**: A Firebase account to register a web application

### 1. Backend Configuration
Navigate to the `backend/` folder and create a `.env` file:
```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/levgress
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=30d
CLIENT_URL=http://localhost:5173

# Firebase Service Account JSON (Minified string)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Supabase Configurations (For file uploads)
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# Groq API Key (For AI grading)
GROQ_API_KEY=your_groq_api_key
```

Install dependencies and start the backend development server:
```bash
cd backend
npm install
npm run dev
```
*(The backend database will automatically seed itself with default skills and badges on first run).*

### 2. Frontend Configuration
Navigate to the `frontend/` folder and create a `.env` file:
```ini
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000

# Firebase Config (Google Auth)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

Install dependencies and start the frontend development server:
```bash
cd frontend
npm install
npm run dev
```

---

## ✉️ Instructor Management & Welcomes

Instructors (`STAFF`) can review student projects. To provision an instructor account and send a welcome email, configure your SMTP settings in the `backend/.env`:

```ini
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=team.levgress@gmail.com
EMAIL_PASS=your_gmail_app_password
```

Then run the promotion script in the `backend` directory:
```bash
node promote.js instructor_email@gmail.com "Instructor Name"
```
*(This will create the user with STAFF role in your database and email them a formal portal welcome letter containing their SSO details).*

---

## 🚀 Deployment

### Backend (Render / Heroku)
1. Add environment variables to your cloud hosting dashboard (e.g. `MONGO_URI`, `FIREBASE_SERVICE_ACCOUNT`, etc.).
2. Set your Build Command to: `npm install`
3. Set your Start Command to: `node server.js`

### Frontend (Vercel / Netlify)
1. Set the **Root Directory** to `frontend`.
2. Add your environment variables (e.g. `VITE_API_URL`, Firebase keys).
3. Build Command: `npm run build`
4. Output Directory: `dist`
