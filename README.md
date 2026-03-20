# ICP Headless

This repository is a headless WordPress frontend built with Next.js and Faust.js. It renders content from a WordPress site over WPGraphQL, including:

- the home page (`/`) with the latest posts
- paginated post and project archives (`/posts`, `/projects`)
- dynamic WordPress content routes through Faust (`/[...wordpressNode]`)
- client-side search at `/search`
- a Faust preview page at `/preview`
- server-rendered `robots.txt` and `sitemap.xml`

It also includes two optional AI alt-text utilities:

- a Node.js backfill script for existing WordPress media items
- a minimal WordPress plugin that generates alt text for new uploads

## Stack and Architecture

- Next.js 14 using the Pages Router
- React 18
- Faust.js (`@faustwp/core` and `@faustwp/cli`) for WordPress integration
- Apollo Client for WPGraphQL queries and relay-style pagination caching
- Sass/SCSS modules plus global SCSS
- WordPress as the content system, with Faust and WPGraphQL expected on the backend

Runtime structure:

- [`pages`](/Users/bchenowe/Sites/icp_headless/pages) contains route entry points.
- [`wp-templates`](/Users/bchenowe/Sites/icp_headless/wp-templates) contains Faust templates for `front-page`, `page`, `single`, `project`, and archive content.
- [`plugins`](/Users/bchenowe/Sites/icp_headless/plugins) adds Faust/Apollo behavior:
  - `ProjectTemplatePlugin` maps WordPress `Project` nodes to the `project` template.
  - `RelayStylePaginationPlugin` enables Apollo relay-style pagination for posts, projects, and content nodes.
- [`components`](/Users/bchenowe/Sites/icp_headless/components) contains presentational components and GraphQL fragments used by templates.
- [`utilities`](/Users/bchenowe/Sites/icp_headless/utilities) contains SEO and site URL helpers.

Current site behavior visible in code:

- Home page fetches and renders the latest 8 posts.
- `/posts` fetches 9 posts per page.
- `/projects` fetches 5 projects per page.
- `/search` queries `contentNodes` with a search string and is marked `noindex`.
- Google Analytics is loaded in [`pages/_app.js`](/Users/bchenowe/Sites/icp_headless/pages/_app.js) using `NEXT_PUBLIC_GA_ID`, with a hardcoded fallback measurement ID if the env var is absent.
- Canonical URLs and sitemap URLs are derived from `NEXT_PUBLIC_SITE_URL`, `SITE_URL`, Vercel env vars, or `NEXT_PUBLIC_WORDPRESS_URL`.

## Prerequisites

- Node.js and npm
- A WordPress site with:
  - WPGraphQL available
  - the Faust plugin configured
  - the custom content model this frontend expects, including the `Project` content type

Notes:

- [`package.json`](/Users/bchenowe/Sites/icp_headless/package.json) declares `node >=14` and `npm >=6`.
- This workspace currently has Node `v18.20.2`, and `npm run lint` succeeds there.
- Because the project depends on Next.js 14, the declared engine range may be stale. The repo does not document a stricter supported Node version.

## Install and Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.local.example .env.local
```

There is no `.env.local.example` in this repo today. Create `.env.local` manually instead.

3. Add the required environment variables listed below.

4. Start local development:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

WordPress setup notes verified from the repo:

- [`DEVELOPMENT.md`](/Users/bchenowe/Sites/icp_headless/DEVELOPMENT.md) documents importing/exporting the Atlas Content Modeler blueprint in [`acm-blueprint.zip`](/Users/bchenowe/Sites/icp_headless/acm-blueprint.zip).
- The checked-in `.env.local` in this workspace points at `https://insidecp.calpolypartners.org`.

## Local Development Commands

```bash
npm run dev
```
Runs the local Faust development server.

```bash
npm run lint
```
Runs `faust lint`. Verified in this workspace: passes with no ESLint errors.

```bash
npm run format
```
Formats JS, JSX, Markdown, CSS, and SCSS files with Prettier.

```bash
npm run format:check
```
Checks formatting without writing changes.

```bash
npm run clean
```
Deletes `.next` and `node_modules`.

```bash
npm run generate
```
Runs `faust generatePossibleTypes` to regenerate [`possibleTypes.json`](/Users/bchenowe/Sites/icp_headless/possibleTypes.json).

## Build, Test, and Deploy Commands

```bash
npm run build
```
Runs `faust build`.

Status in this workspace:

- `npm run build` currently fails with:
  - `Unable to find a GraphQL endpoint at https://insidecp.calpolypartners.org/index.php?graphql`
  - `WPGraphQL may not be active, or your WordPress site is unavailable.`

```bash
npm start
```
Runs `faust start` for a production build.

```bash
npm run wpe-build
```
Alias for `faust build`.

Testing:

- There is no `test` script in [`package.json`](/Users/bchenowe/Sites/icp_headless/package.json).
- No Jest, Vitest, Playwright, Cypress, or similar repo-level test setup is checked in.

Deployment:

- This repo does not include deployment automation such as GitHub Actions, a Dockerfile, or a `vercel.json`.
- The only deployment-related script present is `wpe-build`, which is the same as `build`.
- The intended hosting target is not explicitly documented in code, although the project still contains Atlas/WP Engine blueprint artifacts.

## Required Environment Variables

### Frontend app

Required for normal WordPress/Faust operation:

- `NEXT_PUBLIC_WORDPRESS_URL`
  - Used directly by sitemap generation.
  - Also used as a fallback site URL and by the alt-text backfill script.

Present in the workspace `.env.local` and likely required by Faust integration, although it is not referenced directly in app source:

- `FAUST_SECRET_KEY`

Optional frontend/runtime variables:

- `NEXT_PUBLIC_GA_ID`
  - Optional. If omitted, [`pages/_app.js`](/Users/bchenowe/Sites/icp_headless/pages/_app.js) falls back to `G-BRV0397C54`.
- `NEXT_PUBLIC_SITE_URL`
  - Recommended for production. Preferred source for canonical URLs and sitemap URLs.
- `SITE_URL`
  - Optional fallback for canonical URLs and sitemap URLs.
- `VERCEL_PROJECT_PRODUCTION_URL`
  - Optional deployment-provided fallback.
- `VERCEL_URL`
  - Optional deployment-provided fallback.
- `NEXT_PUBLIC_WORDPRESS_URL`
  - Used for WordPress/GraphQL connectivity only. Do not rely on this for canonicals on a custom frontend domain, or pages may emit canonicals to the backend WordPress host instead of the public site.

### Alt-text backfill script

Used by [`scripts/backfill-image-alt-text.js`](/Users/bchenowe/Sites/icp_headless/scripts/backfill-image-alt-text.js):

- `OPENAI_API_KEY` required
- `WORDPRESS_USERNAME` required
- `WORDPRESS_APP_PASSWORD` required
- `WORDPRESS_BASE_URL` optional if `NEXT_PUBLIC_WORDPRESS_URL` is set
- `OPENAI_MODEL` optional, defaults to `gpt-4.1-mini`

Example:

```bash
npm run alt-text:backfill -- --dry-run --limit 10
```

### WordPress plugin settings

[`wordpress-plugins/openai-image-alt-text`](/Users/bchenowe/Sites/icp_headless/wordpress-plugins/openai-image-alt-text) does not use environment variables from this repo. Its API key, enabled flag, and model are stored in WordPress options through the plugin settings page.

## Important Directories and Files

- [`pages`](/Users/bchenowe/Sites/icp_headless/pages): Next.js routes
- [`wp-templates`](/Users/bchenowe/Sites/icp_headless/wp-templates): Faust content templates
- [`components`](/Users/bchenowe/Sites/icp_headless/components): UI components and GraphQL fragments
- [`plugins`](/Users/bchenowe/Sites/icp_headless/plugins): custom Faust/Apollo plugins
- [`queries`](/Users/bchenowe/Sites/icp_headless/queries): GraphQL queries
- [`utilities`](/Users/bchenowe/Sites/icp_headless/utilities): SEO and URL helpers
- [`styles`](/Users/bchenowe/Sites/icp_headless/styles): global styles and page-level SCSS modules
- [`public`](/Users/bchenowe/Sites/icp_headless/public): static assets
- [`scripts/backfill-image-alt-text.js`](/Users/bchenowe/Sites/icp_headless/scripts/backfill-image-alt-text.js): Node script to backfill missing image alt text in WordPress
- [`wordpress-plugins/openai-image-alt-text`](/Users/bchenowe/Sites/icp_headless/wordpress-plugins/openai-image-alt-text): minimal WordPress plugin for alt text generation on upload
- [`faust.config.js`](/Users/bchenowe/Sites/icp_headless/faust.config.js): Faust configuration and plugin registration
- [`next.config.js`](/Users/bchenowe/Sites/icp_headless/next.config.js): Next.js config, headers, image domains, and webpack aliases
- [`app.config.js`](/Users/bchenowe/Sites/icp_headless/app.config.js): pagination counts, theme color, and social links
- [`possibleTypes.json`](/Users/bchenowe/Sites/icp_headless/possibleTypes.json): generated GraphQL possible types map
- [`DEVELOPMENT.md`](/Users/bchenowe/Sites/icp_headless/DEVELOPMENT.md): Atlas Content Modeler import/export notes

## Verified Gaps and Cleanup Candidates

- The current build is blocked by the configured WordPress GraphQL endpoint not responding during `faust build`.
- There is no automated test suite in the repo.
- The package name in [`package.json`](/Users/bchenowe/Sites/icp_headless/package.json) is still `@faustjs/atlas-blueprint-portfolio`.
- [`app.config.js`](/Users/bchenowe/Sites/icp_headless/app.config.js) still includes WP Engine social/profile URLs for some networks.
- Testimonial-related components exist, and testimonial types appear in [`possibleTypes.json`](/Users/bchenowe/Sites/icp_headless/possibleTypes.json), but I did not find any route or template currently rendering testimonials.
- There is no checked-in `.env.local.example`, even though local env setup is required.

## Unclear From the Repo

- The exact production hosting platform is not defined in this repository.
- The exact WordPress plugin/theme combination required on the backend beyond Faust, WPGraphQL, and the ACM blueprint content model is not fully documented here.
