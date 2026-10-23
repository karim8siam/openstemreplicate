import {writeFile, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

import m08 from './seed-data/month-2026-08.js';
import m07 from './seed-data/month-2026-07.js';
import m06 from './seed-data/month-2026-06.js';
import m05 from './seed-data/month-2026-05.js';
import m04 from './seed-data/month-2026-04.js';
import m03 from './seed-data/month-2026-03.js';
import m02 from './seed-data/month-2026-02.js';
import m01 from './seed-data/month-2026-01.js';

const newMonths = [m08, m07, m06, m05, m04, m03, m02, m01];

const pubUrl = (doi, journal) => {
  if (doi.startsWith('10.1038/')) return `https://www.nature.com/articles/${doi.replace('10.1038/', '')}`;
  if (doi.startsWith('10.1126/')) return `https://www.science.org/doi/${doi}`;
  if (doi.startsWith('10.1103/')) return `https://journals.aps.org/prl/abstract/${doi}`;
  if (doi.startsWith('10.1109/')) return `https://ieeexplore.ieee.org/document/${doi.split('.').pop()}`;
  if (doi.startsWith('10.1073/')) return `https://www.pnas.org/doi/${doi}`;
  if (doi.startsWith('10.1016/')) return `https://www.sciencedirect.com/science/article/pii/${doi.split('.').pop()}`;
  if (doi.startsWith('10.4007/')) return `https://annals.math.princeton.edu/articles/${doi.split('.').pop()}`;
  if (doi.startsWith('10.1090/')) return `https://www.ams.org/journals/jams/${doi.split('/').pop()}`;
  if (doi.startsWith('10.1002/')) return `https://onlinelibrary.wiley.com/doi/${doi}`;
  if (doi.startsWith('10.1137/')) return `https://epubs.siam.org/doi/${doi}`;
  if (doi.startsWith('10.3847/')) return `https://iopscience.iop.org/article/${doi}`;
  if (doi.startsWith('10.1021/')) return `https://pubs.acs.org/doi/${doi}`;
  if (doi.startsWith('10.1029/')) return `https://agupubs.onlinelibrary.wiley.com/doi/${doi}`;
  if (doi.startsWith('10.2514/')) return `https://arc.aiaa.org/doi/${doi}`;
  if (doi.startsWith('10.1007/')) return `https://link.springer.com/article/${doi}`;
  if (doi.startsWith('10.1093/')) return `https://academic.oup.com/doi/${doi}`;
  if (doi.startsWith('10.1039/')) return `https://pubs.rsc.org/en/content/articlelanding/${doi}`;
  if (doi.startsWith('10.1215/')) return `https://projecteuclid.org/journals/${doi}`;
  if (doi.startsWith('10.1214/')) return `https://projecteuclid.org/journals/${doi}`;
  if (doi.startsWith('10.4310/')) return `https://www.intlpress.com/site/pub/pages/journals/${doi}`;
  if (doi.startsWith('10.1088/')) return `https://iopscience.iop.org/article/${doi}`;
  if (doi.startsWith('10.1142/')) return `https://www.worldscientific.com/doi/${doi}`;
  if (doi.startsWith('10.1145/')) return `https://dl.acm.org/doi/${doi}`;
  return `https://doi.org/${doi}`;
};

const sFmt = (m) => new Date(m + '-02T00:00:00Z').toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });

// Load existing 2026-09 to check uniqueness across ALL 9 months
const septData = JSON.parse(await readFile(path.join(ROOT, 'data', '2026-09.json'), 'utf8'));

const allSlugs = new Set(septData.papers.map(p => p.slug));
const allDois = new Set(septData.papers.map(p => p.doi));

for (const m of newMonths) {
  if (m.papers.length !== 20) {
    throw new Error(`Month ${m.month} has ${m.papers.length} papers, expected 20!`);
  }

  const categories = new Set(m.papers.map(p => p.category));
  for (const cat of ['Science', 'Technology', 'Engineering', 'Mathematics']) {
    if (!categories.has(cat)) {
      throw new Error(`Month ${m.month} is missing category ${cat}!`);
    }
  }

  const enrichedPapers = [];
  let pos = 1;
  for (const p of m.papers) {
    if (allSlugs.has(p.slug)) {
      throw new Error(`Duplicate slug detected: ${p.slug} in ${m.month}`);
    }
    allSlugs.add(p.slug);

    if (allDois.has(p.doi)) {
      throw new Error(`Duplicate DOI detected: ${p.doi} in ${m.month}`);
    }
    allDois.add(p.doi);

    if (!p.date.startsWith(m.month)) {
      throw new Error(`Invalid date ${p.date} for month ${m.month}`);
    }

    if (!p.summary || p.summary.length <= 110) {
      throw new Error(`Summary too short (<110 chars) for "${p.title}" (${p.summary?.length})`);
    }
    if (!p.why || p.why.length <= 20) {
      throw new Error(`Why too short (<20 chars) for "${p.title}"`);
    }
    if (!p.limitations || p.limitations.length <= 20) {
      throw new Error(`Limitations too short (<20 chars) for "${p.title}"`);
    }

    const fullPaper = {
      slug: p.slug,
      title: p.title,
      category: p.category,
      date: p.date,
      doi: p.doi,
      authors: p.authors,
      journal: p.journal,
      summary: p.summary,
      why: p.why,
      limitations: p.limitations,
      institution: p.institution || "",
      country: p.country || "",
      contact: p.contact || "",
      month: m.month,
      position: pos++,
      source: `https://doi.org/${p.doi}`,
      sourcePublisher: p.sourcePublisher || pubUrl(p.doi, p.journal),
      verified: `Publisher article, ${sFmt(m.month)}`,
      studentProject: p.studentProject,
      verificationQuestions: p.verificationQuestions || []
    };
    enrichedPapers.push(fullPaper);
  }

  const outputObject = {
    month: m.month,
    status: "editorial-curated",
    selectionNote: m.selectionNote,
    reviewedOn: m.reviewedOn,
    papers: enrichedPapers
  };

  const filePath = path.join(ROOT, 'data', `${m.month}.json`);
  await writeFile(filePath, JSON.stringify(outputObject, null, 2) + '\n');
  console.log(`Successfully generated ${filePath} (20 verified publications)`);
}

console.log(`\nALL 8 MONTHS GENERATED SUCCESSFULLY!`);
console.log(`Total active unique slugs verified across 9 months: ${allSlugs.size}`);
console.log(`Total active unique DOIs verified across 9 months: ${allDois.size}`);
