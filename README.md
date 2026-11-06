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

During local development, Vite proxies `/auth` requests to `http://localhost:3000`, avoiding browser CORS checks. Set `VITE_API_URL` in a local `.env` file to use a different backend base URL. In production, configure `VITE_API_URL` to the public HTTPS API origin.

Authentication uses the separately deployed CodeRise Auth Service. In production, configure `VITE_API_URL` to the public HTTPS API origin. `VITE_` settings are compiled into browser code and must contain only public configuration; database, SMTP, signing, and Redis credentials belong in the backend environment. The browser receives an HttpOnly session cookie and keeps no access token in local storage. Mutating auth requests include a CSRF token.

## Route groups

- Public: `/`, `/about`, `/contact`, `/programs`, `/video-courses`
- Authentication: `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`
- Student: `/dashboard`, `/profile`, `/my-learning`, `/my-applications`, `/my-submissions`, `/my-results`, `/my-purchases`, `/notifications`
- Learning and course details use parameterized paths under `/free-learning/:trackId` and `/video-courses/:courseId`.
- Administration pages are under `/admin`.
