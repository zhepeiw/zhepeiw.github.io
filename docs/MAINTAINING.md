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

- `dev` as the main working branch
- `master` as the publish branch that GitHub Pages watches for source changes
- `deprecated-jekyll` as an archive-only branch pinned to the last pre-Astro Jekyll commit (`1c11c00`)

Typical local workflow:

```bash
git checkout dev
git pull origin dev
npm install
npm run dev
```

When you are ready to publish your latest changes:

```bash
git checkout dev
git status
git add .
git commit -m "Update website content"
git push origin dev
git checkout master
git pull origin master
git merge dev
git push origin master
git checkout dev
```

What this does:

- saves your latest work on `dev`
- updates `origin/dev` with your latest source history
- merges `dev` into `master`
- updates `origin/master` to trigger deployment
- triggers `.github/workflows/deploy.yml`, which builds the Astro site and publishes `dist/`

Notes:

- You do not need to build `dist/` manually before publishing; GitHub Actions builds and deploys it from the `master` branch.
- If `origin/master` has moved independently, pull or inspect it before merging so you do not overwrite unexpected remote-only changes.
- If `master` has no unique commits, `git merge dev` will fast-forward; otherwise Git will create a merge commit and preserve both branch histories.
- Do not use `deprecated-jekyll` for new work; it is kept only to preserve the old Jekyll site history.

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

What this includes:

- normalized author names in full-name format for the site UI and BibTeX modal
- cleaned citation-oriented BibTeX text used by the site

### Generated BibTeX Output

The script:

- `scripts/build-publications.mjs`

parses `_bibliography/papers.bib` and writes normalized publication metadata into:

- `src/generated/publications.json`

Current BibTeX behavior on the site:

- publication cards on both `/` and `/publications/` open a BibTeX modal
- the modal supports `Copy` and `Download`
- the modal shows only citation-relevant BibTeX fields, not site-specific helper fields such as `video`, `poster`, `code`, `pub`, or `display_select`

Notes:

- `_bibliography/papers.bib` is the source of truth for author naming. If a name should appear in full on the site and in the BibTeX modal, store the full name directly in the bibliography source.

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
- `/downloads/example-handout.pdf`

## Verification Checklist

Before committing content or structural changes:

```bash
npm run build
```

Check that:

- Astro builds successfully
- the main routes render: `/`, `/publications/`, `/about/`, `/articles/`, `/contact/`, `/404.html`
- publication cards still show images and working `BibTeX` buttons on both `/` and `/publications/`
- clicking `BibTeX` opens the modal, shows the citation snippet, and the `Copy` and `Download` buttons work
- any newly added assets resolve correctly
