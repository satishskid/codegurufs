# Code Buddy – Deployment & Environment

## One-time setup
1. Create Firebase project and Firestore (native mode).
2. Generate a Service Account JSON (Project Settings → Service Accounts → Generate new private key).
3. Create a Clerk application and get the Publishable Key.
4. Create a Google Generative AI API key.

## Env variables
Copy `.env.example` to `.env` and fill values:

- GEMINI_API_KEY
- VITE_CLERK_PUBLISHABLE_KEY
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- FIREBASE_SERVICE_ACCOUNT (paste the entire JSON as one line)

## Netlify env import
You can import all variables from the `.env` file:

```sh
npm run env:import
```

This runs `netlify env:import .env` and sets site environment variables in bulk. Alternatively, set them in the Netlify UI.

## Firestore collections
- activation_tokens: { terminalId }
- terminals: { info: { schoolName, className, teacherName }, active: boolean }
- students_progress: { grade, curriculum, history }
- allowlist_users: docId = user email (lowercased), { role: "admin" | "member" }

## Admin dashboard
- Visit `/admin` after signing in with Clerk.
- Only users with role `admin` in allowlist_users can CRUD allowlist.

## Model provider
The app uses Google Gemini via `@google/genai`. "GPT-5 (Preview)" is not part of this stack. To switch providers, add a provider layer and OpenAI key later.

## Clerk server auth

- Add CLERK_SECRET_KEY to your env. When present, serverless routes require Authorization: Bearer (Clerk JWT).
- The Netlify functions forward Authorization headers automatically.

## Initial allowlist seeding

- Set ALLOWLIST_INITIAL in env as comma-separated email:role pairs. On first admin API call, the collection seeds if empty.

## Netlify deploy notes

- After pushing to GitHub, connect the repo in Netlify and import env via `npm run env:import`.
- Ensure Functions bundler includes external modules (@google/genai, firebase-admin, @clerk/backend).
