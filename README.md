# OffCampus

A Reddit-style social network for Indian college campuses (AKTU and beyond) —
communities per college, ranked feeds, voting, threaded comments, follows,
search, and a real recommendation engine.

This is a **single full-stack Next.js app**: the frontend, the API, and the
ranking logic all live in one project, backed by SQLite (no Docker, no Postgres
server, no Redis required to run it).

Stack: Next.js 14 (App Router) · Prisma + SQLite · plain JavaScript · Tailwind
CSS · bcryptjs · cookie-based sessions.

---

## Run it (3 steps)

You need **Node.js 18.18+ or 20+** and npm.

```bash
npm install
npm run setup      # prisma generate + create SQLite db + seed data
npm run dev
```

Open http://localhost:3000

`npm install` may run `prisma generate` automatically; `npm run setup` runs it
again (safe) and then creates and seeds `prisma/dev.db`.

### Demo login (pre-filled on the login screen)

```
email:    you@niet.offcampus
password: password123
```

Every seeded account uses the password `password123` (e.g. `priya@niet.offcampus`,
`dev@kiet.offcampus`). Or create a new account from the Sign-up page.

### Reset the data any time

```bash
npm run db:reset   # wipes the SQLite db and re-seeds
```

---

## What works

- **Auth** — signup (bcrypt-hashed passwords), login, logout, httpOnly signed
  session cookie.
- **Feeds** — For You / Hot / New / Top, ranked server-side.
- **Voting** — up/down on posts and comments, persisted, with optimistic UI.
- **Communities** — browse, join/leave; feed filtered per community.
- **Posts** — create text/link posts with tags.
- **Comments** — threaded replies, with voting.
- **Follows** — follow/unfollow; drives suggestions.
- **Search** — posts, communities and people.
- **Profiles** — user info, follower counts, their posts.

## The recommendation engine

All of it lives in `src/lib/rank.js` as pure, testable functions:

- `rankFeed()` — **For You** blends a Reddit-style hot score with your signals:
  communities you're in, your college, tags you've upvoted, and authors you
  follow. Hot / New / Top are also here.
- `suggestCommunities()` — collaborative signal (people who share a community
  with you are already there) + same college + recent activity.
- `suggestPeople()` — friends-of-friends + shared communities + same
  branch/college cohort.
- `trendingTags()` — recent weighted engagement per tag.

`src/lib/feed.js` loads the graph from the DB and hands these functions plain
objects, so the ranking logic never touches Prisma directly.

---

## Project layout

```
prisma/
  schema.prisma           SQLite schema (what the app runs on)
  schema.postgres.prisma  Production Postgres schema (enums + UUIDs) for later
  seed.js                 Colleges, communities, users, posts, comments, votes
src/
  lib/       db, auth (session), password, rank (engine), feed (loaders), format
  components/ TopBar, PostCard, VoteButtons, FeedTabs, Sidebar, SuggestPanel,
              CommentThread, CommentForm, AuthForm, SubmitForm, ...
  app/
    page.jsx            home feed
    c/[slug]/           community
    post/[id]/          post detail + comments
    u/[username]/       profile
    search/  submit/  login/  signup/
    api/               auth, vote, join, follow, comment, post
```

---

## Moving to Postgres (production)

1. Replace `prisma/schema.prisma` with `prisma/schema.postgres.prisma`.
2. Point `DATABASE_URL` at your Postgres instance.
3. `npx prisma migrate dev`.

The app code uses string values that match the Postgres enums, so it ports
without changes. From here the natural next steps are Redis caching for the hot
feed, background jobs for heavy ranking, and full-text search — but none of that
is needed to run what's in this repo.

## Notes / honesty

This was authored to run with the three commands above, but if your Node version
or platform surfaces a first-run error, it'll be a small fix — paste the error
and it's quick to resolve. `next dev` compiles routes on demand, so an issue in
one page won't stop the rest of the app from working.
