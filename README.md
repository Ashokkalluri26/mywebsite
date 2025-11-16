# Job-Portal-Full-Project

## What is included
- `frontend/` - static site:
  - `index.html` - homepage reads `jobs.json`
  - `admin.html` - admin form to post jobs (calls backend)
  - `login.html` - Firebase admin login (uses provided firebase-config)
  - `styles.css` - styles
  - `jobs.json` - initial sample file
  - `firebase-config.js` - your firebase web config (filled with values you provided)

- `backend/` - Node.js Express server:
  - `index.js` - handles `/postJob` to create Blogger posts and update `jobs.json`
  - `package.json`

## How it works (summary)
1. Admin logs in via Firebase (open `frontend/login.html`) using your admin credentials.
2. Open `admin.html` and fill Title / Short / Full and click "Post Job".
3. The admin page sends a POST request to the backend (`/postJob`).
4. The backend uses Google Blogger API (OAuth2) to create the full post on Blogger.
5. Backend updates `frontend/jobs.json` with the new short-card and blog URL.
6. `index.html` reads `jobs.json` and displays short cards; Read More opens Blogger post.

## IMPORTANT - You must do these setup steps before the system works

### 1) Blogger API / OAuth2
- Go to Google Cloud Console -> APIs & Services -> Credentials.
- Create OAuth 2.0 Client ID (Web application).
- Add an Authorized redirect URI (if needed). For server-to-server, you will use a refresh token.
- Note down `CLIENT_ID` and `CLIENT_SECRET`.
- Obtain a **REFRESH_TOKEN**:
  - Easiest: use OAuth 2.0 Playground (https://developers.google.com/oauthplayground)
  - In OAuth playground, select Blogger API scope: `https://www.googleapis.com/auth/blogger`
  - Authorize & exchange authorization code for tokens — copy the `refresh_token`.
- Set the following environment variables on your backend host:
  - `BLOG_ID` = 7791873568125614615
  - `CLIENT_ID` = your-client-id
  - `CLIENT_SECRET` = your-client-secret
  - `REFRESH_TOKEN` = your-refresh-token

The backend will exchange the refresh token for access tokens automatically.

### 2) Firebase (for admin login)
- In Firebase Console -> Authentication -> Add User -> use the admin email and password:
  - Email: `kalluriashok2627@gmail.com`
  - Password: `AshokUma@1327`
- Make sure Firebase Hosting or your static host serves the `frontend/` folder.

### 3) Run backend locally (for testing)
```bash
cd backend
npm install
export BLOG_ID=7791873568125614615
export CLIENT_ID="YOUR_CLIENT_ID"
export CLIENT_SECRET="YOUR_CLIENT_SECRET"
export REFRESH_TOKEN="YOUR_REFRESH_TOKEN"
node index.js
```
- The server listens on port 5000 by default. Admin page in `admin.html` calls `http://localhost:5000/postJob`.

### 4) Deployment
- Frontend: Deploy `frontend/` to Netlify, Vercel, or GitHub Pages.
- Backend: Deploy `backend/` to Render, Railway, Heroku, or any Node host. Set the environment variables there.

## Notes & Security
- Keep `CLIENT_SECRET` and `REFRESH_TOKEN` secret.
- jobs.json is a simple approach for static hosting. For production use Firestore or a database.
- You can enhance backend to write to Firestore if you add service account credentials.

## Blog ID used in project:
7791873568125614615

## Final tips
- Test locally end-to-end: run backend, open `frontend/login.html`, login, open `admin.html` and post.
- If you need, I can provide commands or help obtaining the refresh token.

