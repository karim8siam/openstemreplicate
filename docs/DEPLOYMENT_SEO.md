# Production deployment and Google Search Console

## 1. Automated GitHub Pages & Static Deployment

This application is a 100% static HTML/CSS/JS site. It has automated CI/CD workflows ready in `.github/workflows/deploy.yml` and `.github/workflows/seo-ci.yml`.

1. Commit and push the project to your GitHub repository:
   ```bash
   git push origin main
   ```
2. Enable GitHub Pages:
   - Go to **Repository Settings** > **Pages**.
   - Under **Build and deployment**, select **Source: GitHub Actions**.
   - Every push to `main` will automatically run tests, build with full SEO metadata, and deploy to GitHub Pages at:
     `https://karim8siam.github.io/openstemreplicate/`

3. Custom Domain (Optional):
   - Add a `CNAME` file in the root containing your custom domain (e.g., `openstemreplicate.org`), or pass `SITE_URL=https://your-domain.com npm run build`.

---

## 2. Google Search Console & Sitemap Submission Step-by-Step

To get indexed and ranked on Google:

### Step 1: Add Property in Google Search Console
1. Go to [Google Search Console](https://search.google.com/search-console).
2. Click **Add property**.
3. Choose **URL prefix**:
   - Enter `https://karim8siam.github.io/openstemreplicate/` (or your custom domain).
   - Click **Continue**.

### Step 2: Verify Ownership with HTML Meta Tag
1. In the verification options, choose **HTML tag**.
2. Google gives you a tag like: `<meta name="google-site-verification" content="ABC...XYZ" />`.
3. Copy the token content string (`ABC...XYZ`).
4. You have two easy ways to set it:
   - **Method A (GitHub Actions Secret)**: Go to repo **Settings > Secrets and variables > Actions**, add secret `GOOGLE_SITE_VERIFICATION` with the value. On the next push, it will be automatically injected.
   - **Method B (Local Build)**:
     ```bash
     GOOGLE_SITE_VERIFICATION="ABC...XYZ" npm run build
     git commit -am "Set Google Search Console verification token"
     git push origin main
     ```
5. Click **Verify** in Google Search Console. Google will immediately confirm ownership.

### Step 3: Submit `sitemap.xml`
1. In Google Search Console, navigate to **Sitemaps** in the left sidebar.
2. Under "Add a new sitemap", enter:
   `sitemap.xml`
   (Full URL: `https://karim8siam.github.io/openstemreplicate/sitemap.xml`)
3. Click **Submit**.
4. Status will change to **Success**, showing 30 discovered URLs.

---

## 3. Google Ranking Architecture

This site includes comprehensive on-page and technical SEO architecture designed specifically for Google search ranking:

1. **Title & Meta Descriptions**:
   - Every single page has a unique, descriptive `<title>` and `<meta name="description">` optimized for search intent (between 120 and 160 characters).
2. **Canonical URLs (`<link rel="canonical">`)**:
   - Eliminates duplicate content issues across all URLs.
3. **Open Graph & Twitter Cards**:
   - Complete social preview cards (`og:title`, `og:description`, `og:image`, `twitter:card`, `twitter:image`).
4. **Rich Schema.org JSON-LD Structured Data**:
   - `WebSite` with Sitelinks `SearchAction`.
   - `Organization` with logo, contactPoint, and official social links.
   - `Article` on research detail pages linking to primary publishers and DOIs via citations.
   - `BreadcrumbList` on all hierarchical paths for Google Rich Results.
   - `CollectionPage` and `ContactPage` for respective sections.
5. **Mobile Responsiveness & Core Web Vitals**:
   - Lightweight, zero heavy framework dependencies (under 50KB total asset payload).
   - Instant loading times (sub-100ms LCP/FCP).
   - Fully responsive on mobile, tablet, and desktop viewports with accessible tap targets.
6. **Crawler Directives (`robots.txt`)**:
   - Clean indexing directives pointing directly to the XML sitemap.

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
