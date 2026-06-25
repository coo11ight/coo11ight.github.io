# COOLAI Blog v1 Design

## Goal

Build a clean personal blog named COOLAI. The first version should feel close to the Astro Pure / Joye-style technical blog experience, but with COOLAI's own identity and without copying Joye's personal content, assets, or extra custom pages.

## Positioning

COOLAI is a personal blog focused on writing, technology, and AI learning notes. The homepage should introduce the site and guide readers into articles. Blog content is the primary product; portfolio-style pages and social/community pages can come later.

## In Scope

- Home
- Blog list
- Blog article detail pages
- About
- Contact
- Search
- Tags and dates for posts
- Dark mode
- RSS and sitemap
- Waline comments
- Pageview tracking recorded in the background but not visibly rendered
- 2-3 sample posts for validating layout, navigation, and search

## Out of Scope for v1

- Links
- Talks
- Projects
- Notes/archive as a separate content type
- Terminal/dev mode overlay
- Mascot or floating companion widget
- Activity popups
- Joye's personal avatar, QR codes, personal biography, job history, links, and article content

## Technical Approach

Use Astro with Astro Theme Pure as the base. Do not fork Joye's full repository as-is. Use Joye's site only as a reference for configuration style, page cleanliness, and Waline integration behavior.

The site should be a lean COOLAI codebase with only the v1 pages enabled. Future features such as projects, notes, links, or talks should be easy to add later, but they should not appear in the first navigation or build output unless needed by the base theme.

## Site Identity

- Site title: COOLAI
- Author: COOLAI
- Description: 写作、技术与 AI 学习记录
- Default language: Chinese
- Initial navigation: Blog, About, Contact, Search
- Visual direction: clean technical blog, medium similarity to Joye's site, not a direct clone

## Page Design

### Home

The homepage contains a compact identity section with the COOLAI name, a short description, lightweight skill or topic tags, and a latest posts section. It should avoid heavy portfolio content in v1.

### Blog

The blog page lists posts with title, date, summary, and tags. Pagination should use the theme's existing behavior if available. The page starts with 2-3 sample posts.

### Article Detail

Article pages should support Markdown/MDX content, code highlighting, table of contents where supported, tags, previous/next navigation if provided by the theme, image zoom if easily available, and a Waline comment section.

Waline pageview tracking may be enabled, but visible view-count UI should be hidden or omitted in v1.

### About

The about page uses placeholder COOLAI copy describing the blog's focus on AI, programming, products, and learning records. The copy should be easy to replace later.

### Contact

The contact page should include placeholder contact items for email, GitHub, or social links. Do not add misleading real links if the user has not provided them.

### Search

Search should index the blog content and useful static pages such as About. Pagefind or the theme's existing search integration is acceptable.

## Comments and Pageviews

Use Waline for visible comments. The Waline server URL must be configurable rather than hard-coded to Joye's server.

If no Waline server URL is configured in development, the comment area should fail gracefully or show a neutral placeholder. Pageview tracking should be wired so it can collect data once a Waline server is configured, but view counts should not be displayed in the UI for v1.

## Content

The initial site should ship with sample posts only. These posts are placeholders to verify routing, typography, tags, search, RSS, and article rendering. They should be clearly replaceable and should not copy Joye's articles.

Suggested initial tags:

- ai
- frontend
- learning

## Assets

Use a simple placeholder avatar or text-based brand mark for COOLAI. Do not copy Joye's avatar, QR codes, project images, or personal media.

## Verification

The implementation is complete when:

- The local dev server starts successfully.
- Home, Blog, an article detail page, About, Contact, and Search load without errors.
- The navigation contains only v1 pages.
- Links, Talks, Projects, Notes/archive, terminal mode, mascot, and activity popup are not visible in the v1 experience.
- Sample posts render with dates, tags, summaries, and article pages.
- Search can find sample post content.
- Dark mode works.
- RSS and sitemap build successfully.
- Waline comments are configurable.
- Pageview tracking can be enabled without showing view counts.
- The production build passes.
