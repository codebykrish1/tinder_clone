# Tinder Clone 

A full-stack Tinder-style matchmaking application built with **Next.js**, **React**, **TypeScript**, **Kinde authentication**, and **Neo4j**. Users sign in, view other registered users, and swipe left to pass or right to like. Swipe relationships are stored in a graph database, which also makes it possible to detect a mutual like and report a match.

> **Project status:** This repository contains the core authentication, user-record, swipe, and mutual-match flow. It is a starter/learning project rather than a production-ready dating service. See [Current scope and limitations](#current-scope-and-limitations) before deploying it publicly.

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [How it works](#how-it-works)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Authentication setup](#authentication-setup)
- [Neo4j setup](#neo4j-setup)
- [Run the application](#run-the-application)
- [Available scripts](#available-scripts)
- [Data model](#data-model)
- [Troubleshooting](#troubleshooting)
- [Current scope and limitations](#current-scope-and-limitations)
- [Future improvements](#future-improvements)

## Features

- **Authentication:** Kinde handles user sign-in and sign-out.
- **User provisioning:** On the authentication callback, the app checks whether the signed-in user exists in Neo4j and creates a user node if needed.
- **Discovery:** Retrieves users who do not already have a `LIKE` or `DISLIKE` relationship with the current user.
- **Swipe interface:** Uses `react-tinder-card` to support swipe gestures on user cards.
- **Like and pass:** A right swipe creates a `LIKE` relationship; a left swipe creates a `DISLIKE` relationship.
- **Mutual-like detection:** When a user likes someone who has already liked them, the server action reports a match and the interface displays an alert.
- **Typed user records:** A shared TypeScript interface describes the user data used by the application.
- **Styling:** Tailwind CSS 4 and reusable card components provide the UI foundation.

## Tech stack

| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | React framework, server-rendered pages, and route handlers |
| React 19 | User interface |
| TypeScript | Static typing |
| Kinde | Authentication and session management |
| Neo4j | Graph database for user and swipe relationships |
| `neo4j-driver` | Connects the application to Neo4j |
| `react-tinder-card` | Swipeable cards |
| Tailwind CSS 4 | Styling |
| `lucide-react` | Icon library available to the project |
| pnpm | Recommended package manager; a pnpm lockfile is included |

## How it works

1. A visitor opens the home page.
2. If there is no authenticated Kinde session, the app redirects the visitor to Kinde login.
3. After authentication, Kinde sends the user to `/callback`.
4. The callback looks up the Kinde user ID (`user.id`) in Neo4j. If no matching node exists, it creates one with the user's ID, first name, last name, and email.
5. The home page loads the current user's Neo4j record and retrieves users with no existing `LIKE` or `DISLIKE` connection to that user.
6. The user swipes a card. The server action stores a `LIKE` or `DISLIKE` relationship.
7. For a like, the server action checks whether the other user already has a `LIKE` relationship back. If so, the client displays a match alert.

## Project structure

```text
tinder_clone-main/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [kindeAuth]/
│   │           └── route.ts       # Kinde authentication route handler
│   ├── callback/
│   │   └── page.tsx               # Creates a Neo4j user record after login
│   ├── components/
│   │   └── Home.tsx               # Client-side swipe card interface
│   ├── logout/
│   │   └── page.tsx               # Kinde logout link
│   ├── globals.css                # Global styles and Tailwind theme
│   ├── layout.tsx                 # Root layout and font configuration
│   ├── neo4j.action.tsx           # Server actions and graph queries
│   └── page.tsx                   # Authenticated home/discovery page
├── components/
│   └── ui/
│       └── card.tsx               # Reusable card components
├── db/
│   └── index.ts                   # Neo4j driver initialization
├── lib/
│   └── utils.ts                   # Shared UI utilities
├── types/
│   └── index.ts                   # Neo4jUser TypeScript interface
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── postcss.config.mjs
└── tsconfig.json
```

## Prerequisites

Before running the project, make sure you have:

- [Node.js](https://nodejs.org/) installed (use a current version compatible with the installed Next.js release).
- [pnpm](https://pnpm.io/installation) installed.
- A [Kinde](https://kinde.com/) application for authentication.
- A running [Neo4j](https://neo4j.com/) database, either local or hosted, and its connection credentials.

## Getting started

### 1. Get the project

Extract the repository ZIP and open a terminal in the project directory:

```bash
cd tinder_clone-main
```

If you cloned the repository from GitHub instead, open the directory created by `git clone`.

### 2. Install dependencies

The project includes a `pnpm-lock.yaml`, so pnpm is the recommended package manager:

```bash
pnpm install
```

### 3. Configure environment variables

Create a file named `.env.local` in the project root. Add the Kinde and Neo4j values described below. Do not commit this file or publish real credentials.

### 4. Configure Kinde and Neo4j

Follow the [Authentication setup](#authentication-setup) and [Neo4j setup](#neo4j-setup) sections. The app needs both services to be configured before the authenticated discovery flow can work.

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment variables

Create `.env.local` in the project root. The Neo4j driver in `db/index.ts` reads the three Neo4j variables below. The Kinde SDK also needs its application credentials and URLs; confirm the exact variable names and configuration requirements against the Kinde SDK version used by your project.

```dotenv
# Kinde authentication
KINDE_CLIENT_ID=your_kinde_client_id
KINDE_CLIENT_SECRET=your_kinde_client_secret
KINDE_ISSUER_URL=https://your-kinde-subdomain.kinde.com
KINDE_SITE_URL=http://localhost:3000
KINDE_POST_LOGIN_REDIRECT_URL=http://localhost:3000/callback
KINDE_POST_LOGOUT_REDIRECT_URL=http://localhost:3000

# Neo4j connection
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_neo4j_password
```

**Important:** The values above are examples/placeholders. Use the actual values supplied by your Kinde and Neo4j installations. For a local Neo4j instance, the URI is often `bolt://localhost:7687`; for a hosted Aura instance, use the connection URI provided by Aura. Keep credentials private.

## Authentication setup

1. Create an application in the Kinde dashboard.
2. Copy the client ID, client secret, and issuer/domain details into `.env.local`.
3. In the Kinde application settings, add the local application URL and the callback URL required by the Kinde Next.js SDK. The project currently redirects to `http://localhost:3000/callback` after login.
4. Add the local logout redirect URL as well.
5. Start the app and test sign-in and sign-out.

The authentication route is defined in `app/api/auth/[kindeAuth]/route.ts`, and the callback logic is in `app/callback/page.tsx`.

> **Deployment note:** The current source contains hard-coded localhost callback URLs in its redirects. Before deploying, replace these with environment-based URLs and register the production callback and logout URLs in Kinde.

## Neo4j setup

1. Start a Neo4j database or create an instance in Neo4j Aura.
2. Copy its URI, username, and password into `.env.local`.
3. Ensure the application can reach the database from your development machine or deployment environment.
4. Start the Next.js app and sign in. The callback should create a `User` node for a first-time user.

The driver is initialized in `db/index.ts`. User lookup, user creation, discovery, and swipe operations are implemented in `app/neo4j.action.tsx`.

The project creates the necessary user nodes and relationships as users interact with the app; a separate migration script is not included.

## Run the application

Development mode with hot reload:

```bash
pnpm dev
```

Create a production build:

```bash
pnpm build
```

Run the production build locally:

```bash
pnpm start
```

Run ESLint:

```bash
pnpm lint
```

## Available scripts

| Command | Description |
|---|---|
| `pnpm dev` | Starts the Next.js development server |
| `pnpm build` | Builds the application for production |
| `pnpm start` | Starts the production server after a build |
| `pnpm lint` | Runs ESLint |

## Data model

The application stores user data and swipe activity as a graph in Neo4j.

### User node

Each user is represented by a `User` node with these properties:

| Property | Description |
|---|---|
| `applicationId` | Kinde user ID; used to identify the user in the graph |
| `firstname` | User's first name |
| `lastname` | User's last name |
| `email` | User's email address |

The TypeScript representation is defined in `types/index.ts` as `Neo4jUser`.

### Relationships

| Relationship | Meaning |
|---|---|
| `(:User)-[:LIKE]->(:User)` | The source user liked the target user |
| `(:User)-[:DISLIKE]->(:User)` | The source user passed on the target user |

A match is detected when a `LIKE` relationship exists in both directions between two users. The current implementation checks for the reciprocal like when the current user likes another user.

## Troubleshooting

### The app redirects repeatedly to login

- Check that the Kinde client ID, client secret, issuer URL, and site URL are correct.
- Verify the callback URL in Kinde matches the URL used by the application.
- Check that the browser is accepting the session cookies.

### Neo4j connection errors

- Confirm `NEO4J_URI`, `NEO4J_USERNAME`, and `NEO4J_PASSWORD` are correct.
- Make sure the database is running and accessible from your machine.
- Check that the URI scheme matches your database setup (`bolt://` for many local instances or the Aura URI for a hosted instance).
- Restart the development server after changing `.env.local`.

### No user cards appear

- The discovery query excludes users already connected to the current user by a `LIKE` or `DISLIKE` relationship.
- Sign in with another account to create another user node.
- Confirm the current user has a corresponding `User` node in Neo4j.

### Environment changes do not take effect

Restart the Next.js development server after editing `.env.local`.

## Current scope and limitations

- The project implements the core swipe and mutual-like flow; it does not currently provide a complete production dating platform.
- The visible profile cards show a user's name and email. Profile photos, bios, preferences, location, and profile editing are not implemented in the current card component.
- Match detection is surfaced with a browser alert; there is no dedicated matches page or chat system.
- The app does not include a moderation workflow, reporting/blocking tools, rate limiting, or a full privacy and safety system.
- The home page currently renders additional user/debug information alongside the card interface. Remove this before a public release.
- The source uses localhost URLs in authentication redirects, so production URL configuration is required before deployment.
- The swipe query creates relationships directly. For production use, consider enforcing uniqueness/idempotency to prevent duplicate swipe relationships and adding database constraints/indexes.

## Future improvements

- Add profile photos, bios, age, interests, and profile editing.
- Add a dedicated matches page and real-time or persisted chat.
- Add filters and matching preferences.
- Replace hard-coded localhost redirects with environment-based URLs.
- Add validation, error handling, loading states, and empty-state UI.
- Add database constraints/indexes and make swipe operations idempotent.
- Add tests for authentication, discovery, swipe handling, and mutual-match detection.
- Add blocking, reporting, moderation, and privacy controls before accepting real users.
- Remove debug output and review personal-data exposure before production deployment.

## Contributing

Contributions and suggestions are welcome. For changes, create a branch, make the change, and open a pull request with a clear description and testing notes.
