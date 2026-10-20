# Production deployment and Google Search Console

## 1. Deploy only after reviewing the content

This application is a static HTML/CSS/JS site. It can be deployed on Vercel, Netlify, Cloudflare Pages, or another static host. Node.js >=20 is required only to build and run automated tests.

1. Commit the entire project, including `data/2026-09.json`, `scripts/build.mjs`, and `assets/`.
2. Run `npm test`. Check every external DOI, article source and author email against the publisher again before publication.
3. Run `SITE_URL=https://YOUR_REAL_DOMAIN npm run build` in the build step. Set a real domain you own, with HTTPS and no trailing path. Without `SITE_URL`, no fake sitemap or canonical addresses are generated.
4. The server should serve the project root as static output. These routes are prebuilt as `folder/index.html`, such as `/research/paper2agent/index.html`.
5. Prefer serving URLs with trailing slashes consistently. Configure 301 redirects or canonical rules for duplicates. Do not index build previews or staging subdomains.
6. The production `robots.txt` contains a sitemap reference and avoids crawling private-style browser workspaces.
7. In Google Search Console verify domain ownership, submit `https://YOUR_REAL_DOMAIN/sitemap.xml` and inspect example URLs. Monitor indexing and relevant queries; do not interpret impressions as confirmed value or rankings.

**No SEO strategy guarantees a top-1%, top-10, or first-page ranking.** Competitive research queries are unusually challenging. Earn links and repeat visits through original editorial work, accurate research sources, distinctive tools, and scientific credibility.

## 2. Domainless development is intentional

`npm run build` without `SITE_URL` leaves `sitemap.xml` absent. That is correct: the project has no known registered domain. Production build with `SITE_URL` creates all URL `<loc>` entries and `<link rel="canonical">` tags. Test the URL count, then submit to Search Console.

## 3. Monthly workflow — no unverified automatic rankings

- Publish September 2026 as the verified initial 20-paper edition.
- On/after November 1, create `data/2026-10.json` with `npm run new-month -- 2026-10`.
- The new month remains empty until 20 actual research sources have been selected and checked manually.
- Use `data/2026-09.json` as the record schema. Important: each candidate needs actual DOI, title, author names, journal, correct date in month, original summary, relevance, limitations, and publisher URL. Every source must be independently checked.
- Select 20 across Science, Technology, Engineering and Mathematics. Document the selection basis. Rankings are editorial order, not global impact metrics.
- After every editorial review, run `npm run build`, `npm test` and deploy. The archive updates automatically from added JSON files.
- Corrections, retractions or updated source information need editorial review and can update an earlier month.

`npm run new-month` creates drafts, not live research metadata. There is deliberately no automatic publishing/scraping cron job or false claims of a complete research index.

## 4. Google indexing quality guidelines

- Primary scholarly metadata and the DOI belong to the original publication. Do not create pages that merely reproduce a publisher abstract.
- Add genuinely original source-grounded summaries, why-the-work-matters explanations, clear limitations and contributor review before expanding.
- Monthly index + individual article editorial analysis pages are intended to be discoverable. Local workspaces and old compatibility redirects are not included in the sitemap.
- Ensure consistent 200 responses for existing pages and proper 404 for missing routes on the static host; do not serve the homepage to every missing path with status 200.
- Limit paginated/filter duplicates. Current research filter is client-side on a single public archive; does not generate duplicate crawlable URLs.
- Do not overstate authors' universities or publicly publish inferred email addresses. A verified public corresponding-author email may be used only when publisher documentation supports it.
- If an editorial analysis is judged too thin during review, mark it noindex until improved. Google indexes at its discretion.

## 5. Scholarly structured data

When `SITE_URL` is provided, curated original article summaries carry `Article` JSON-LD with *OpenSTEM* as the editorial author and source work as citation. This is **not** claiming that OpenSTEM authored the underlying scientific paper. Full-text copyright and publisher authorship remain with source authors. Never mark an OpenSTEM review page as the original research `ScholarlyArticle`.
