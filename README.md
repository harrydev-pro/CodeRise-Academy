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

During local development, Vite proxies `/auth` requests to `http://localhost:3000`, avoiding browser CORS checks. Set `VITE_API_URL` in a local `.env` file to use a different backend base URL. In production, the frontend calls that URL directly; if unset, it uses `http://localhost:3000`. The authentication flow uses `POST /auth/register`, `POST /auth/login`, and `GET /auth/me`; the current-user endpoint is called with the bearer token returned by login.

## Route groups

- Public: `/`, `/about`, `/contact`, `/programs`, `/video-courses`
- Authentication: `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`
- Student: `/dashboard`, `/profile`, `/my-learning`, `/my-applications`, `/my-submissions`, `/my-results`, `/my-purchases`, `/notifications`
- Learning and course details use parameterized paths under `/free-learning/:trackId` and `/video-courses/:courseId`.
- Administration pages are under `/admin`.
