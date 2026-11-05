# CodeRise Academy

CodeRise Academy is a React frontend built with Vite and React Router. The UI is organized into public, authentication, student, and administration routes; frontend API requests are centralized in `src/services/api/client.js`.

## Run locally

```sh
npm install
npm run dev
```

## Validate

```sh
npm run lint
npm run build
```

## Backend API

The browser always calls the API on the website's own origin under `/api` (see `src/services/api/client.js`).

- **Production (Vercel):** `vercel.json` rewrites `/api/*` to the Render backend and removes the `/api` prefix. Because the browser only ever talks to the Vercel domain, the HttpOnly session cookie and CSRF cookie are first-party. Safari on iPhone blocks third-party cookies, so do not point the frontend directly at the `onrender.com` URL. Leave `VITE_API_BASE_URL` unset in Vercel. If the backend URL changes, update the destination in `vercel.json`.
- **Local development:** `npm run dev` checks `VITE_DEV_API_URL` (default `http://localhost:3000`) at startup. If its `/health/ready` endpoint is healthy, Vite proxies `/api/*` there; otherwise, it proxies to `VITE_PRODUCTION_API_URL` (default the Render backend). Restart Vite after starting or stopping the local backend so it can select the right target. The browser continues to call only the local site's `/api` path.
- **Local production preview:** `npm run preview` proxies `/api/*` to `VITE_PRODUCTION_API_URL` (default the Render backend). Deployed Vercel sites use the rewrite above; Vite itself does not run in the deployment.

`VITE_` settings are compiled into browser code and must contain only public configuration; database, SMTP, signing, and Redis credentials belong in the backend environment. The browser keeps no access token in local storage, and mutating requests include a CSRF token.

`vercel.json` also sends every non-file path to `index.html`, so refreshing a page such as `/dashboard` works.

## Route groups

- Public: `/`, `/about`, `/contact`, `/programs`, `/programs/:programId`, `/video-courses`, `/video-courses/:courseId`, `/apply/:programId`
- Authentication: `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`
- Student: `/dashboard`, `/profile`, `/my-learning`, `/my-applications`, `/my-submissions` (My Projects), `/my-results` (Quiz History), `/my-video-courses`, `/notifications`
- Free Learning: `/free-learning`, `/free-learning/:trackId`, `/free-learning/:trackId/lessons/:topicId`, `/free-learning/:trackId/quizzes/:quizId` (+ `/results`), `/free-learning/:trackId/projects` (+ `/:projectId`, `/:projectId/submit`)
- Video lessons: `/video-courses/:courseId/lessons/:lessonId`
- Administration (admins only, loaded on demand): `/admin` (analytics), `/admin/users`, `/admin/applications`, `/admin/programs`, `/admin/learning` (tracks, levels, topics, notes, quizzes, question import), `/admin/projects`, `/admin/submissions`, `/admin/video-courses`, `/admin/reports`, `/admin/activity`, `/admin/notifications`

## Deployment

See `DEPLOYMENT.md` in the backend project for the full, ordered deployment steps.
