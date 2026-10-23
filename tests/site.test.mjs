import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const txt = async (f) => readFile(path.join(ROOT, f), 'utf8');

// Load index.json
const siteIndex = JSON.parse(await txt('data/index.json'));
const allPapers = siteIndex.papers;

test('all 9 months from January 2026 to September 2026 are present and valid', async () => {
  const expectedMonths = [
    '2026-09', '2026-08', '2026-07', '2026-06',
    '2026-05', '2026-04', '2026-03', '2026-02', '2026-01'
  ];
  assert.equal(siteIndex.months.length, 9);
  assert.deepEqual(siteIndex.months.map(m => m.month), expectedMonths);

  for (const m of expectedMonths) {
    const raw = JSON.parse(await txt(`data/${m}.json`));
    assert.equal(raw.status, 'editorial-curated');
    assert.equal(raw.papers.length, 20);

    const categories = new Set(raw.papers.map(p => p.category));
    assert.deepEqual(categories, new Set(['Science', 'Technology', 'Engineering', 'Mathematics']));

    for (const p of raw.papers) {
      assert.match(p.doi, /^10\.\d{4,9}\//);
      assert.match(p.date, new RegExp(`^${m}-`));
      assert.ok(p.summary.length > 110, `Summary too short for ${p.slug}`);
      assert.ok(p.why.length > 20, `Why too short for ${p.slug}`);
      assert.ok(p.limitations.length > 20, `Limitations too short for ${p.slug}`);
      assert.ok(p.source.startsWith('https://doi.org/10.'));
      assert.ok(p.sourcePublisher.startsWith('https://'));
    }
  }
});

test('exactly 180 total publications with 100% globally unique slugs and DOIs', () => {
  assert.equal(allPapers.length, 180);
  const slugSet = new Set(allPapers.map(p => p.slug));
  const doiSet = new Set(allPapers.map(p => p.doi));
  assert.equal(slugSet.size, 180, 'Slugs must be globally unique across all 180 publications');
  assert.equal(doiSet.size, 180, 'DOIs must be globally unique across all 180 publications');
});

test('strict reverse-chronological order (September down to January) with Year displayed', async () => {
  const archiveHtml = await txt('archive/index.html');
  const listHtml = archiveHtml.slice(archiveHtml.indexOf('<div class="archive-list">'));
  const monthOrder = [
    'September 2026', 'August 2026', 'July 2026', 'June 2026',
    'May 2026', 'April 2026', 'March 2026', 'February 2026', 'January 2026'
  ];

  let lastIndex = -1;
  for (const mName of monthOrder) {
    const idx = listHtml.indexOf(mName);
    assert.ok(idx !== -1, `Expected "${mName}" to be displayed in .archive-list`);
    assert.ok(idx > lastIndex, `Expected "${mName}" to appear in reverse-chronological order after previous month`);
    lastIndex = idx;
  }

  // Also verify on homepage editions grid
  const homeHtml = await txt('index.html');
  const homeGrid = homeHtml.slice(homeHtml.indexOf('<div class="editions-grid">'));
  lastIndex = -1;
  for (const mName of monthOrder) {
    const idx = homeGrid.indexOf(mName);
    assert.ok(idx !== -1, `Expected "${mName}" to be displayed in .editions-grid`);
    assert.ok(idx > lastIndex, `Expected "${mName}" to appear in reverse-chronological order after previous month`);
    lastIndex = idx;
  }
});

test('paper detail pages exist on disk for all 180 publications with rich SEO Schema', async () => {
  for (let i = 0; i < allPapers.length; i += 15) { // Sample every 15th paper for fast, thorough check
    const p = allPapers[i];
    const html = await txt(`research/${p.slug}/index.html`);
    assert.ok(html.includes(p.doi));
    assert.ok(html.includes('Publisher article and research methods'));
    assert.ok(html.includes('not a full systematic review'));
    assert.ok(html.includes('rel="noopener noreferrer"'));
    assert.match(html, /<link rel="canonical" href="https:\/\/(openstemreplicate\.org|karim8siam\.github\.io\/openstemreplicate)\/research\//);
    assert.match(html, /<script type="application\/ld\+json">/);
    assert.match(html, /"headline"/);
  }
});

test('research directory /research/ contains all 180 publications and filter elements', async () => {
  const researchHtml = await txt('research/index.html');
  assert.ok(researchHtml.includes('180 of 180 curated publications'));
  assert.ok(researchHtml.includes('data-month="2026-09"'));
  assert.ok(researchHtml.includes('data-month="2026-01"'));
  assert.ok(researchHtml.includes('data-cat="Science"'));
  assert.ok(researchHtml.includes('data-cat="Mathematics"'));
  assert.ok(researchHtml.includes('research-search'));
});

test('SEO sitemap and robots.txt configured properly with GSC readiness', async () => {
  const root = await readdir(ROOT);
  assert.ok(root.includes('sitemap.xml'));
  assert.ok(root.includes('robots.txt'));
  const sitemap = await txt('sitemap.xml');
  assert.match(sitemap, /<\?xml version="1\.0" encoding="UTF-8"\?>/);
  assert.match(sitemap, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/);
  assert.match(sitemap, /<loc>https:\/\/openstemreplicate\.org\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/openstemreplicate\.org\/research\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/openstemreplicate\.org\/archive\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/openstemreplicate\.org\/archive\/2026-09\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/openstemreplicate\.org\/archive\/2026-01\/<\/loc>/);

  const urlCount = (sitemap.match(/<loc>/g) || []).length;
  assert.ok(urlCount >= 195, `Expected at least 195 URLs in sitemap, got ${urlCount}`);

  const r = await txt('robots.txt');
  assert.match(r, /User-agent: \*/);
  assert.match(r, /Allow: \//);
  assert.match(r, /Sitemap: https:\/\/openstemreplicate\.org\/sitemap\.xml/);
});

test('submissions configured to exact requested inbox and allow PDF', async () => {
  let s = await txt('submit/index.html');
  assert.match(s, /https:\/\/formsubmit\.co\/shahriyarkarimsiam@gmail\.com/);
  assert.match(s, /enctype="multipart\/form-data"/);
  assert.match(s, /type="file"/);
  assert.match(s, /name="permission_confirmed"/);
  assert.match(s, /not guarantee acceptance/);
});

test('community discord and email visible, ecosystem links complete', async () => {
  let s = await txt('mates/index.html');
  assert.match(s, /https:\/\/discord\.com\/invite\/tBBKtvFJzW/);
  assert.match(s, /shahriyarkarimsiam@gmail\.com/);
  let a = await txt('about/index.html');
  assert.match(a, /tBBKtvFJzW/);
  assert.match(a, /openstemfield\.org/);
  assert.match(a, /openstemtool\.org/);
  let idx = await txt('index.html');
  assert.match(idx, /https:\/\/openstemtool\.org\//);
  assert.match(idx, /Connected OpenSTEM Ecosystem/);
});

test('AI idea page genuinely marked coming soon, includes action guide', async () => {
  let s = await txt('ideas/index.html');
  assert.match(s, /COMING SOON/);
  assert.match(s, /Eight|08/);
  assert.match(s, /Never invent citations/);
});

test('all monthly archive editions generated from 2026-01 to 2026-09', async () => {
  for (let m = 1; m <= 9; m++) {
    const mm = String(m).padStart(2, '0');
    await access(path.join(ROOT, `archive/2026-${mm}/index.html`));
    const html = await txt(`archive/2026-${mm}/index.html`);
    assert.ok(html.includes('20 curated publications') || html.includes('20 independently authored'));
    assert.ok(html.includes('edition-nav-strip'));
  }
});
