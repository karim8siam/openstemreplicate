# OpenSTEM Replicate — Editorial Research Network v2

**Production-oriented, static HTML / CSS / vanilla JavaScript redesign.** A verified September 2026 inaugural research selection, curated paper articles, community, research submission, and practical idea guide.

## Contents

- `/` — redesigned responsive home
- `/research/` — twenty publisher-verified September 2026 research highlights, browse/filter/search/save
- `/research/<slug>/` — original editorial summary, limitations, DOI and publisher links, authors and available affiliations, source-aware citation copy
- `/archive/` — completed monthly archive, not an imaginary 50,000-paper database
- `/submit/` — research suggestion form using FormSubmit to email **shahriyarkarimsiam@gmail.com**, supporting PDF attachment up to 10MB and consent
- `/ideas/` — honest 'coming soon' page with actionable scientific research ideation guide and copyable prompt
- `/mates/` — Discord https://discord.com/invite/tBBKtvFJzW and direct email
- `/about/`, `/privacy/`, `/terms/` — selection policy, sources, contact, disclosures and legal boundaries
- `scripts/build.mjs` — static page generator, site-wide metadata/canonicals/sitemap when production domain supplied
- `scripts/new-month.mjs` — draft archive creator that does not fabricate papers
- `tests/` — static QA, content validation, submission and SEO checks

## Run locally

Requires Python 3 for the simplest server:

```bash
python3 -m http.server 8080
```

Open http://localhost:8080/ and use the navigation. The site is static. The submission form requires internet access and initial FormSubmit activation after publication.

## Build and test

Requires Node.js 20+; no third-party npm dependencies required:

```bash
npm run build
npm test
```

### Production SEO & Google Search Console Verification

The site automatically builds with full SEO metadata, Canonical links, Open Graph cards, Twitter cards, Schema.org JSON-LD structured data, `robots.txt`, and a valid `sitemap.xml`.

- **Default Live URL**: `https://karim8siam.github.io/openstemreplicate/`
- **Custom Domain (optional)**:
  ```bash
  SITE_URL=https://your-custom-domain.com npm run build
  ```
  Or add a `CNAME` file containing your custom domain (e.g. `openstem.org`).

- **Google Search Console Verification Tag**:
  When you register in Google Search Console:
  1. Choose **URL prefix** (e.g., `https://karim8siam.github.io/openstemreplicate/` or your custom domain).
  2. Select **HTML tag** verification method. Copy the verification token (e.g. `google-site-verification=XYZ123...`).
  3. Set it during build:
     ```bash
     GOOGLE_SITE_VERIFICATION="your-token-here" npm run build
     ```
     Or add `GOOGLE_SITE_VERIFICATION` as a repository secret in GitHub Settings > Secrets and variables > Actions.
  4. Submit your sitemap at: `https://karim8siam.github.io/openstemreplicate/sitemap.xml` (or `https://your-domain/sitemap.xml`).

Consult [docs/DEPLOYMENT_SEO.md](docs/DEPLOYMENT_SEO.md) for full step-by-step guidance.

## Next month

```bash
npm run new-month -- 2026-10
```

Then manually curate and verify October papers using `data/2026-09.json` as the schema. After you publish a reviewed 20-paper set in `data/2026-10.json`, run the build and tests. Every new edition is incorporated in the archive automatically. **This package does not autonomously identify the world's best papers.**

## Important before accepting live research submissions

Read `docs/EMAIL_SETUP.md`, run a non-sensitive test, and click the FormSubmit mailbox activation link. Submissions do not directly publish content and are not verified merely because the form exists.

## What is not claimed

- Search rankings, Google indexing or Google AdSense approval are not guaranteed.
- September's selection is an editor-reviewed candidate list verified against primary publisher publication pages; this is **not** a bibliometric ranking of global research impact.
- Institution/country/email coverage is limited to verified public records; unknown values are intentionally left blank.
- The previous computational demo cases are educational and are not reproductions of these published September papers.
- No actual member accounts, private messaging, Gemini/OpenAI paid API, or professor matching service is included.
- No automatic harvesting/scraping/ranking or authenticated Gmail API exists in this static website.

The repository contains no copyrighted PDFs or API credentials. Author contact info is included only where clearly public in the source article.
