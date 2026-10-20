# QA report — 20 October 2026

## Automated verification performed

- `npm test`: **25/25 passing**, including 13 scientific calculation reference and error tests and 12 new static site/editorial tests.
- `npm run build` repeated multiple times: idempotent production of 36 site routes, correct asset paths and no duplicated navigation notices.
- Python internal link validator: **0 broken local links** in all generated HTML and legacy source templates.
- Domain-based production build tested with placeholder test origin **only during QA**, generated canonical tags and 33 sitemap URLs, then rebuilt with no domain to avoid shipping fake URLs.
- Browser HTML/CSS/JS rendering was tested with Chromium `page.set_content` (since file navigation and localhost navigation were blocked in the execution environment): desktop homepage and article layout, mobile viewport 390px, no horizontal document overflow, mobile navigation toggling, 20 item cards, search filtering (5 quantum matches), engineering filtering (4 matches), form HTML attributes, no JavaScript page errors in the tested new UI.

## Not verified externally

- FormSubmit production delivery and Gmail activation — requires the recipient to confirm and conduct a real consented live test on the deployed site.
- Live navigation on a deployed host — browser security blocked http://localhost and file:// navigation; external resource availability and CSP/hosting rewrites are environment-specific.
- Google crawling, Search Console indexing/ranking or AdSense approval — no domain or verified Search Console project supplied.
- Every third-party publisher endpoint live on the deployment day — DOIs were grounded in web publisher results, but no live batch HTTP check from container was possible because external network DNS was disabled.
- Researcher emails/affiliations beyond the publisher-backed examples — most unknown contacts are intentionally omitted.
- The pre-existing legacy studio's full browser user journeys — numerical engines passed tests, but end-to-end browser navigation was not available in this environment.

**Recheck before publication:** every source DOI, displayed metadata, scientific summary, author contact, and paper publication status; all responsive pages in Chrome, Safari, Firefox; live file submissions after FormSubmit activation; production sitemap and Search Console.
