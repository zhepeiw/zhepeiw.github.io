# Maintaining The Website

This site is built with Astro and deployed to GitHub Pages. The repository no longer depends on Jekyll; the only legacy-prefixed directory that remains is `_bibliography/`, which stores the canonical BibTeX source for publications.

## Prerequisites

- `Node.js` 22 or newer is recommended. The GitHub Actions deploy workflow uses Node 22.
- `npm` is required.
- `python3` is required only for publication thumbnail generation.

Install dependencies with:

```bash
npm install
```

## Local Development

Start the local dev server:

```bash
npm run dev
```

Build the production site:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

Notes:

- `npm run dev` and `npm run build` both regenerate publication data before Astro runs.
- The generated production output goes to `dist/`.

## Hosting And Deployment

The site is deployed with GitHub Pages through:

- `.github/workflows/deploy.yml`

Current deployment behavior:

- pushes to the `master` branch trigger a build and deploy
- the workflow installs dependencies with `npm ci`
- the workflow builds the Astro site and publishes `dist/`
- the custom domain is preserved via `public/CNAME`

This repository currently uses:

- `source` as the main working branch
- `master` as the publishing branch that triggers GitHub Pages deployment

Typical local workflow:

```bash
git checkout source
git pull origin source
npm install
npm run dev
```

When you are ready to publish your latest changes:

```bash
git checkout source
git status
git add .
git commit -m "Update website content"
git push origin source
git checkout master
git merge source
git push origin master
git checkout source
```

What this does:

- saves your latest work on `source`
- copies those commits into `master`
- pushes `master` to GitHub, which triggers `.github/workflows/deploy.yml`

If `master` is already up to date with `source`, the final `git push origin master` may say there is nothing new to publish.

If the domain changes, update:

- `public/CNAME`
- `astro.config.mjs` `site`

## Repository Structure

Main source directories:

- `src/pages`: route files such as home, publications, about, posts, contact, and 404
- `src/layouts`: page layout wrappers
- `src/components`: reusable UI pieces
- `src/styles`: global styles
- `src/content/posts`: Markdown posts
- `src/content/news`: Markdown news items
- `src/data`: site-level profile and navigation data
- `_bibliography/papers.bib`: canonical publication source
- `public/`: static assets served as-is

Generated files used by the Astro site:

- `src/generated/publications.json`: normalized publication data derived from BibTeX
- `src/generated/publication-media.json`: thumbnail metadata and optional manual overrides
- `public/downloads/bibtex/*.bib`: one downloadable BibTeX file per entry
- `public/assets/publications/*.jpg`: generated publication thumbnails

## Adding Or Updating Content

### Pages And Site Metadata

For profile copy, contact info, and navigation labels, edit:

- `src/data/site.ts`

Homepage-specific fields in `src/data/site.ts`:

- `title`: the site name used in the header and footer
- `homepage.name`: the homepage display name
- `homepage.profileImage`: the homepage portrait image path
- `homepage.roleLines`: the role/affiliation lines shown under the name
- `homepage.emailLines`: the obfuscated email lines shown on the homepage
- `homepage.socialLinks`: the homepage inline links for CV, Scholar, GitHub, X, and LinkedIn
- `homepage.intro`: the homepage self-introduction paragraphs
- `homepage.selectedPublicationIds`: the ordered list of paper ids shown in `Selected Work`
- `footerEmail.display`: the obfuscated footer email text

For page structure and layout, edit:

- `src/pages/*`
- `src/layouts/*`
- `src/components/*`
- `src/styles/global.css`

### Posts

Posts live in:

- `src/content/posts`

Each post is a Markdown file with frontmatter similar to:

```md
---
title: Example Post
date: 2026-03-20
updatedDate: 2026-03-20
tags:
  - Audio
  - Research
heroImage: /assets/images/example.jpg
---
```

Guidelines:

- place any post-specific images or files under `public/assets/...`
- reference them with site-rooted paths such as `/assets/images/...`

### News

News items live in:

- `src/content/news`

Each item is a Markdown file with:

```md
---
title: Example Update
date: 2026-03-20
---

Short update text here.
```

## Publication Workflow

### Source Of Truth

All publications originate from:

- `_bibliography/papers.bib`

To add or update a publication:

1. Edit `_bibliography/papers.bib`
2. Run:

```bash
npm run sync:data
```

This regenerates:

- `src/generated/publications.json`
- `public/downloads/bibtex/*.bib`

### Downloadable BibTeX Files

The script:

- `scripts/build-publications.mjs`

parses `_bibliography/papers.bib` and emits one `.bib` file per publication into:

- `public/downloads/bibtex`

These files power the `BibTeX` download buttons on publication cards.

### Publication Thumbnails

Publication thumbnails are generated by:

- `scripts/fetch_publication_media.py`

Run:

```bash
npm run sync:media
```

This will:

1. fetch PDFs for peer-reviewed articles and preprints
2. extract a representative figure or fall back to a rendered page image
3. write thumbnail images into `public/assets/publications`
4. update `src/generated/publication-media.json`
5. rerun `npm run sync:data`

Use `npm run sync:media` when:

- you add a new peer-reviewed article or preprint
- you want to refresh thumbnails after changing publication metadata

### Manual Media Overrides

If the automatically chosen thumbnail is not ideal, edit:

- `src/generated/publication-media.json`

Supported fields per publication id:

- `image`: static image path
- `imageAlt`: accessible alt text
- `imageSource`: short note about the source
- `summary`: optional short summary shown on the publication card

To manually replace a thumbnail:

1. Place your replacement image in `public/assets/publications/`
2. Open `src/generated/publication-media.json`
3. Find the publication id entry
4. Change `image` to your new file path
5. Optionally update `imageAlt` and `imageSource`
6. Run:

```bash
npm run sync:data
```

Do not run `npm run sync:media` afterward unless you want the automatic thumbnail extraction to overwrite the generated metadata again.

Example override:

```json
{
  "metadata-captioning": {
    "image": "/assets/publications/metadata-captioning-custom.jpg",
    "imageAlt": "Custom figure for Rethinking Music Captioning with Music Metadata LLMs",
    "imageSource": "Manually replaced from author slides",
    "summary": null
  }
}
```

Homepage text example in `src/data/site.ts`:

```ts
homepage: {
  roleLines: ["Research Scientist/Engineer, Adobe Research", "MusicAI Group"],
  intro: [
    "First paragraph shown on the homepage.",
    "Second paragraph shown on the homepage."
  ],
  selectedPublicationIds: ["paper-id-1", "paper-id-2", "paper-id-3"]
}
```

After editing the media JSON manually, run:

```bash
npm run sync:data
```

Do not run `npm run sync:media` afterward unless you want the script to regenerate entries again.

## Assets

Static assets should live under:

- `public/assets/images`
- `public/assets/publications`
- `public/assets/...` for other site files

Other downloadable files can live anywhere under `public/` and should be referenced from the site with root-relative URLs.

Examples:

- `/assets/cv_2026-03-20.pdf`
- `/assets/images/profile_2026-03-20.jpg`
- `/downloads/bibtex/metadata-captioning.bib`

## Verification Checklist

Before committing content or structural changes:

```bash
npm run build
```

Check that:

- Astro builds successfully
- the main routes render: `/`, `/publications/`, `/about/`, `/articles/`, `/contact/`, `/404.html`
- publication cards still show images and BibTeX download links
- any newly added assets resolve correctly
