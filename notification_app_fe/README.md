# Notification Dashboard Frontend

Stage 7 frontend for the campus notification system, built with React, Vite, and Material UI inside the existing repository.

## What is included

- All Notifications page with:
- API fetch from `http://4.224.186.213/evaluation-service/notifications`
  - proxied through the Vite dev server during local development
  - bearer token support from `VITE_ACCESS_TOKEN`
  - server-side `page`, `limit`, and `notification_type` query params
  - unread vs viewed visual styling
  - pagination and filters
- Priority Notifications page with:
  - top 10 ranking using the Stage 6 rule
  - priority order `Placement > Result > Event`
  - recency-aware scoring
  - displayed priority score
- Reusable structure under:
  - `src/components`
  - `src/pages`
  - `src/services`
  - `src/utils`
  - `src/hooks`
- Existing logging middleware reused through a small frontend logger wrapper

## Setup

Create a `.env` file inside `notification_app_fe/`:

```env
VITE_ACCESS_TOKEN=your_token
```

## Run

```bash
npm install
npm run dev
```

The Vite dev server is configured to run on [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
```

## Notes

- No backend files were changed.
- The app is isolated inside `notification_app_fe/`.
- If the API does not return total pagination metadata, the UI still supports next-page navigation using the page size and response length.
- Sample screenshots can be added later inside the `screenshots/` folder.
