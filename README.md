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

Set `VITE_API_URL` in a local `.env` file to configure the backend base URL. If it is not set, requests use `http://localhost:5000/api`.

## Route groups

- Public: `/`, `/about`, `/contact`, `/programs`, `/video-courses`
- Authentication: `/login`, `/register`, `/verify-email`, `/forgot-password`, `/reset-password`
- Student: `/dashboard`, `/profile`, `/my-learning`, `/my-applications`, `/my-submissions`, `/my-results`, `/my-purchases`, `/notifications`
- Learning and course details use parameterized paths under `/free-learning/:trackId` and `/video-courses/:courseId`.
- Administration pages are under `/admin`.
