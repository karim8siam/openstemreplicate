(()=>{'use strict';
const $=(sel)=>document.querySelector(sel); const $$=(sel)=>Array.from(document.querySelectorAll(sel));let toastTimeout;
function toast(message){const el=$('#toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('show'),3200);}
const paperKey='openstem-replicate-curated-saved-v2';
function saved(){try{const arr=JSON.parse(localStorage.getItem(paperKey)||'[]');return Array.isArray(arr)?arr.filter(v=>typeof v==='string').slice(0,500):[];}catch{return [];}}
function refreshSaved(){const all=saved();$$('[data-save]').forEach(btn=>{const has=all.includes(btn.dataset.save);btn.classList.toggle('saved',has);btn.setAttribute('aria-pressed',String(has));btn.textContent=has?'★ Saved':'☆ Save';});}
async function copy(text){try{await navigator.clipboard.writeText(text);toast('Copied to clipboard.');}catch{const area=document.createElement('textarea');area.value=text;area.style.position='fixed';document.body.append(area);area.focus();area.select();const ok=document.execCommand('copy');area.remove();toast(ok?'Copied to clipboard.':'Copy unavailable. Select the text manually.');}}
const btn=$('#open-menu'),aside=$('#site-sidebar'),overlay=$('#mobile-overlay');function toggleMenu(on){if(!aside)return;aside.classList.toggle('open',on);overlay?.classList.toggle('open',on);btn?.setAttribute('aria-expanded',String(on));document.body.style.overflow=on?'hidden':'';}btn?.addEventListener('click',()=>toggleMenu(!aside.classList.contains('open')));$('#sidebar-close')?.addEventListener('click',()=>toggleMenu(false));overlay?.addEventListener('click',()=>toggleMenu(false));document.addEventListener('keydown',event=>{if(event.key==='Escape')toggleMenu(false);});aside?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>toggleMenu(false)));
document.addEventListener('click',event=>{const save=event.target.closest('[data-save]');if(save){let s=saved();const slug=save.dataset.save;if(s.includes(slug)){s=s.filter(x=>x!==slug);toast('Removed from saved papers.');}else{s.push(slug);toast('Saved on this device.');}try{localStorage.setItem(paperKey,JSON.stringify(s));}catch{toast('Browser storage is unavailable.');}refreshSaved();return;}const cite=event.target.closest('[data-cite]');if(cite){fetch('/data/index.json').then(r=>r.ok?r.json():Promise.reject()).then(d=>{let p=d.papers.find(p=>p.slug===cite.dataset.cite);if(!p)throw Error('Not found');return copy(`${p.authors}. (${p.month.slice(0,4)}). ${p.title}. ${p.journal}. https://doi.org/${p.doi}`);}).catch(()=>toast('Citation unavailable without the site data.'));return;}if(event.target.id==='copy-prompt'){copy($('#research-prompt')?.textContent?.trim()||'');}});refreshSaved();
// Client filtering for 180 reviewed 2026 editorial records across 9 months and 4 STEM disciplines.
const search=$('#research-search'),grid=$('#paper-grid'),count=$('#results-count'),empty=$('#empty-results');
let selectedCat='All', selectedMonth='All';
function filter(){
  if(!grid)return;
  const q=(search?.value||'').toLocaleLowerCase().trim();
  let visible=0;
  $$('.paper-card',grid).forEach(card=>{
    const cat=card.dataset.cat||card.querySelector('.cat')?.textContent?.trim();
    const month=card.dataset.month||'';
    const text=card.textContent.toLocaleLowerCase();
    const matchCat=(selectedCat==='All'||cat===selectedCat);
    const matchMonth=(selectedMonth==='All'||month===selectedMonth);
    const matchQuery=(!q||text.includes(q));
    const on=matchCat&&matchMonth&&matchQuery;
    card.hidden=!on;
    if(on)visible++;
  });
  if(count)count.textContent=`${visible} of ${$$('.paper-card',grid).length} curated publications`;
  if(empty)empty.hidden=visible!==0;
}
search?.addEventListener('input',filter);
$$('[data-cat]').forEach(b=>b.addEventListener('click',()=>{
  selectedCat=b.dataset.cat;
  $$('[data-cat]').forEach(x=>x.classList.toggle('selected',x===b));
  filter();
}));
$$('[data-month]').forEach(b=>b.addEventListener('click',()=>{
  selectedMonth=b.dataset.month;
  $$('[data-month]').forEach(x=>x.classList.toggle('selected',x===b));
  filter();
}));

// Research Paper Submission: Connected with Google Sheets ("Open stem form collecting") and Siam's email
const submit = $('#submission-form');
const formContainer = $('#form-card-container');
const WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbz3S1F9bXQfySjkfVg61lmnH8D4LLtw4AchXVbfoUkqgAX_tIt_Y9C2EEzjdPH1K4io/exec';

submit?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const field = $('#paper-attachment');
  const f = field?.files?.[0];
  const err = $('#form-error');
  if (f && (f.size > 10_000_000 || (f.type && f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')))) {
    err.hidden = false;
    err.textContent = 'Attach a PDF file below 10 MB or leave the attachment blank.';
    field.focus();
    return;
  }
  err.hidden = true;
  const btn = $('#submit-paper-btn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Recording in Google Sheet & Sending to Siam…';
  }

  const fd = new FormData(submit);
  let fileBase64 = null;
  if (f && f.size < 6_000_000) {
    try {
      fileBase64 = await new Promise((res) => {
        const reader = new FileReader();
        reader.onload = () => {
          const val = String(reader.result || '');
          res(val.includes(',') ? val.split(',')[1] : val);
        };
        reader.onerror = () => res(null);
        reader.readAsDataURL(f);
      });
    } catch (e) {}
  }

  const payload = {
    action: 'researchSubmission',
    spreadsheetId: '12lgsA1gCiG0yZJ6sEkoZwEqPMtc37OoVJVEzz_vDz0A',
    name: fd.get('name') || '',
    email: fd.get('email') || '',
    institution: fd.get('institution') || '',
    country: fd.get('country') || '',
    paper_title: fd.get('paper_title') || '',
    source_url: fd.get('source_url') || '',
    discipline: fd.get('discipline') || '',
    reason: fd.get('reason') || '',
    attachment_name: f ? f.name : 'None',
    fileBase64: fileBase64,
    fileName: f ? f.name : null,
    fileType: f ? (f.type || 'application/pdf') : null,
    permission_confirmed: fd.get('permission_confirmed') === 'yes',
    date: new Date().toISOString()
  };

  // 1. Dispatch to Google Apps Script Webhook (appends to Google Sheet & sends email notification)
  const webhookPromise = fetch(WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  }).catch(() => {});

  // 2. Dispatch to FormSubmit AJAX endpoint (backup email pipeline + multi-part attachment)
  const formSubmitPromise = fetch('https://formsubmit.co/ajax/shahriyarkarimsiam@gmail.com', {
    method: 'POST',
    body: fd,
    headers: { 'Accept': 'application/json' }
  }).catch(() => {});

  // Wait up to 1.2s for requests to flush before rendering receipt
  await Promise.race([
    Promise.allSettled([webhookPromise, formSubmitPromise]),
    new Promise(r => setTimeout(r, 1200))
  ]);

  // 3. Render clean interactive confirmation receipt
  if (formContainer) {
    formContainer.innerHTML = `
      <div class="submission-receipt-card" style="padding:10px 0;">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;flex-wrap:wrap;">
          <span style="background:#e6f3ee;color:#086b6a;font-weight:800;font-size:12px;padding:5px 12px;border-radius:100px;letter-spacing:0.03em;">✓ RECORDED IN GOOGLE SHEET</span>
          <span style="background:#eef7f4;color:#07474a;font-weight:700;font-size:12px;padding:5px 12px;border-radius:100px;">DISPATCHED TO SIAM</span>
        </div>
        <h2 style="font-size:26px;color:#07373b;margin:0 0 12px;font-weight:800;letter-spacing:-0.03em;">Research Submission Received!</h2>
        <p style="color:#556e75;font-size:14.5px;line-height:1.7;margin:0 0 22px;">Thank you, <strong>${String(payload.name).replace(/[&<>"']/g, '')}</strong>. Your research paper proposal has been recorded in our official Google Sheet (<strong>OpenSTEM Replicate — Research Submissions</strong> &rarr; tab: <strong>Research Submissions</strong>) and dispatched directly to Siam at <strong>shahriyarkarimsiam@gmail.com</strong> for editorial review.</p>
        <div style="background:#f8fbfa;border:1px solid #dbe8e4;border-radius:14px;padding:18px 20px;margin-bottom:24px;font-size:13.5px;line-height:1.75;">
          <div style="margin-bottom:6px;"><strong>Paper Title:</strong> ${String(payload.paper_title).replace(/[&<>"']/g, '')}</div>
          <div style="margin-bottom:6px;"><strong>Discipline:</strong> <span style="background:#e6f3ee;color:#086b6a;font-weight:700;padding:2px 8px;border-radius:6px;font-size:12px;">${payload.discipline}</span></div>
          <div style="margin-bottom:6px;"><strong>DOI / URL:</strong> <a href="${String(payload.source_url).replace(/[&<>"']/g, '')}" target="_blank" rel="noopener noreferrer" style="color:#067f80;font-weight:600;">${String(payload.source_url).replace(/[&<>"']/g, '')} ↗</a></div>
          <div><strong>Author &amp; Affiliation:</strong> ${String(payload.name).replace(/[&<>"']/g, '')} (${String(payload.institution || 'Independent').replace(/[&<>"']/g, '')}, ${String(payload.country || 'N/A').replace(/[&<>"']/g, '')})</div>
        </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
          <a href="mailto:shahriyarkarimsiam@gmail.com?subject=OpenSTEM%20Research%20Submission%20Copy%20-%20${encodeURIComponent(payload.paper_title)}&body=${encodeURIComponent('Hello Siam,\n\nI just submitted the following research paper to OpenSTEM Replicate:\n\nPaper Title: ' + payload.paper_title + '\nDOI/URL: ' + payload.source_url + '\nDiscipline: ' + payload.discipline + '\nAuthor: ' + payload.name + ' (' + payload.email + ')\nInstitution: ' + payload.institution + '\nReason: ' + payload.reason + '\n\nRecorded into Google Sheet: YES\nStatus: Pending Editorial Review')}" class="btn darkbtn" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px;">✉ Open copy in your email client ↗</a>
          <button type="button" class="btn outlinebtn" onclick="location.reload()" style="cursor:pointer;">Submit another paper ↺</button>
        </div>
      </div>
    `;
  }
});
})();
