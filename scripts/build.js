/// scripts/build.js
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { parse } from "csv-parse/sync";

const OUT = "public";
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR6m74xLHujDYqwMg936UdFhRxQdec31TUh350oCYW3HIRpqZNahBhNa9RWXWLdip7lo0oMQvzRUh0-/pub?output=csv";

const SITE = { base: "https://example.com", title: "InFormer — DIY Legal Kits" };

const ensureDir = async p => fs.promises.mkdir(p, { recursive: true });
const slug = s => (s||"").toString().toLowerCase().replace(/[^\w\s-]/g,"").trim().replace(/\s+/g,"-").replace(/-+/g,"-");
const productURL = (sku, title) => `/products/${slug(`${sku}-${title}`)}/`;
const catURL = name => `/category/${slug(name)}/`;
const stateCatURL = state => `/category/divorce-kits/${slug(state)}/`;

const clean = (s='') => String(s)
  .replace(/[\u2018\u2019\u201B\u2032]/g, "'")   // curly apostrophes → '
  .replace(/[\u201C\u201D\u2033]/g, '"')       // curly quotes → "
  .replace(/[\u2013\u2014\u2212]/g, "-")       // en/em dashes → -
  .replace(/\u00A0/g, " ")                     // non-breaking space → space
  .replace(/\s+/g, " ")
  .trim();

const page = ({title,desc="",body}) => `<!doctype html><html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><meta name="description" content="${clean(desc).replace(/"/g,"&quot;")}">
<link rel="stylesheet" href="/styles.css"></head>
<body>
<header class="hdr"><a class="logo" href="/">InFormer</a>
<input class="search" id="q" placeholder="Search kits (state, tags, title)"/></header>
<main class="wrap">${body}</main>
<footer class="ftr"><a href="/refund-policy.html">Refund Policy</a> · <a href="/terms.html">Terms</a> · <a href="/contact.html">Contact</a></footer>
<script>
fetch('/search-index.json').then(r=>r.json()).then(data=>{
 const q=document.getElementById('q'); if(!q)return;
 q.addEventListener('input',()=>{
  const v=q.value.toLowerCase();
  const hits=data.filter(d=> (d.title+' '+d.state+' '+(d.tags||'')).toLowerCase().includes(v));
  const list=document.getElementById('searchResults'); if(!list)return;
  list.innerHTML=hits.slice(0,40).map(h=>\`<li><a href="\${h.url}">\${h.title}</a> — $\${h.price}</li>\`).join('');
 });
});
</script></body></html>`;

const card = p => `<article class="card">
  <a href="${productURL(p.SKU, p.Title)}">
    <img src="${p.CoverImageURL || "/placeholder.svg"}" onerror="this.src='/placeholder.svg'" alt="${clean(p.Title)}">
    <h3>${clean(p.Title)}</h3>
    <div class="meta">
      <span class="price">$${Number(p.PriceUSD).toFixed(2)}</span>
      <span class="badge">${clean(p.ChildrenStatus || "")}</span>
    </div>
    <p class="blurb">${clean(p.ShortDescription || "")}</p>
  </a>
</article>`;

async function main(){
  const res = await fetch(SHEET_CSV_URL);
  if(!res.ok) throw new Error("CSV fetch failed: "+res.status);
  const txt = await res.text();
  const rows = parse(txt, { columns:true, skip_empty_lines:true });

  const products = rows.filter(r => (r.IsActive||"").toString().toLowerCase()==="true" && (r.Category||"").toLowerCase()==="divorce kits");

  await ensureDir(OUT);
  await fs.promises.writeFile(path.join(OUT,"products.json"), JSON.stringify(products,null,2));
  const searchIndex = products.map(p=>({ sku:p.SKU, title:p.Title, price:p.PriceUSD, state:p.State, tags:p.Tags, url:productURL(p.SKU,p.Title) }));
  await fs.promises.writeFile(path.join(OUT,"search-index.json"), JSON.stringify(searchIndex,null,2));

  const homeBody = `
  <section class="hero"><h1>${SITE.title}</h1><p>State-specific divorce kits with clear, step-by-step instructions.</p><ul id="searchResults"></ul></section>
  <section><h2>Divorce Kits</h2><div class="grid">${products.slice(0,12).map(card).join("")}</div>
  <p><a class="more" href="${catURL("divorce-kits")}">See all Divorce Kits</a></p></section>`;
  await fs.promises.writeFile(path.join(OUT,"index.html"), page({title:SITE.title, desc:"State-specific divorce kits.", body:homeBody}));

  const dkDir = path.join(OUT,"category",slug("divorce-kits"));
  await ensureDir(dkDir);
  const byState = products.reduce((a,p)=>((a[p.State]??=[]).push(p),a),{});
  const catBody = `<h1>Divorce Kits</h1><nav class="state-nav">${Object.keys(byState).sort().map(s=>`<a href="${stateCatURL(s)}">${s}</a>`).join(" · ")}</nav><div class="grid">${products.map(card).join("")}</div>`;
  await fs.promises.writeFile(path.join(dkDir,"index.html"), page({title:"Divorce Kits — InFormer", desc:"All divorce kits.", body:catBody}));

  for(const state of Object.keys(byState).sort()){
    const dir = path.join(OUT,"category","divorce-kits",slug(state));
    await ensureDir(dir);
    const body = `<h1>Divorce Kits — ${state}</h1><div class="grid">${byState[state].map(card).join("")}</div>`;
    await fs.promises.writeFile(path.join(dir,"index.html"), page({title:`${state} Divorce Kits — InFormer`, desc:`Divorce kits for ${state}.`, body}));
  }

  for(const p of products){
    const dir = path.join(OUT,"products",slug(`${p.SKU}-${p.Title}`));
    await ensureDir(dir);
    const related = products.filter(r =>
      r.SKU!==p.SKU &&
      ((p.PartnerGroup && r.PartnerGroup===p.PartnerGroup) ||
       (p.Tags && r.Tags && r.Tags.split(",").some(t=>p.Tags.split(",").map(x=>x.trim()).includes(t.trim()))))
    ).slice(0,6);
    const buy = `<a class="btn" href="#" onclick="alert('Stripe Checkout wire-up comes in Step 5.')">Buy Now</a>`;
    const body = `<article class="pdp">
      <img class="hero" src="${p.CoverImageURL || "/placeholder.svg"}" onerror="this.src='/placeholder.svg'" alt="${clean(p.Title)}">
      <div class="meta"><h1>${clean(p.Title)}</h1><div class="price">$${Number(p.PriceUSD).toFixed(2)}</div>${buy}
      <p class="short">${clean(p.ShortDescription||"")}</p><hr/><div class="long">${clean(p.LongDescription||"").replace(/\n/g,"<br>")}</div></div></article>
      ${related.length? `<section><h2>Customers also bought</h2><div class="grid">${related.map(card).join("")}</div></section>`:""}`;
    await fs.promises.writeFile(path.join(dir,"index.html"), page({title:`${p.Title} — InFormer`, desc:p.ShortDescription||p.Title, body}));
  }

  await fs.promises.writeFile(path.join(OUT,"refund-policy.html"), page({title:"Refund Policy — InFormer", body:"<h1>Refund Policy</h1><p>All sales are final for digital products. Refunds only for duplicate purchases, wrong file delivery, or technical issues on our end.</p>"}));
  await fs.promises.writeFile(path.join(OUT,"terms.html"), page({title:"Terms — InFormer", body:"<h1>Terms</h1><p>DIY legal kits; not a law firm. Use at your own discretion.</p>"}));
  await fs.promises.writeFile(path.join(OUT,"contact.html"), page({title:"Contact — InFormer", body:"<h1>Contact</h1><p>Email: FormEaseSolutionsInc@gmail.com</p>"}));

  const urls = [
    `${SITE.base}/`,
    `${SITE.base}${catURL("divorce-kits")}`,
    ...Object.keys(products.reduce((a,p)=>((a[p.State]=1),a),{})).map(s=> `${SITE.base}${stateCatURL(s)}`),
    ...products.map(p => `${SITE.base}${productURL(p.SKU,p.Title)}`)
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u=>`<url><loc>${u}</loc></url>`).join("")}</urlset>`;
  await fs.promises.writeFile(path.join(OUT,"sitemap.xml"), xml);

  const css = `.wrap{max-width:1100px;margin:0 auto;padding:24px}.hdr,.ftr{padding:12px 24px;background:#0b1b34;color:#fff}.logo{font-weight:800;color:#ffd700;text-decoration:none}.search{width:100%;max-width:460px;margin-left:16px;padding:8px}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px;margin:16px 0}.card{background:#fff;border:1px solid #e6e6e6;border-radius:16px;overflow:hidden}.card img{width:100%;height:160px;object-fit:cover;background:#f5f5f5}.card h3{font-size:16px;margin:12px}.meta{display:flex;justify-content:space-between;align-items:center;margin:0 12px 8px}.price{font-weight:700}.badge{background:#eef;border-radius:999px;padding:2px 8px;font-size:12px}.blurb{margin:0 12px 16px;color:#444}.hero{width:100%;max-width:520px;border-radius:16px;background:#f5f5f5}.pdp{display:grid;grid-template-columns:1fr;gap:24px}@media(min-width:900px){.pdp{grid-template-columns:1fr 1fr}}.btn{display:inline-block;padding:10px 16px;border-radius:12px;background:#ffd700;color:#0b1b34;font-weight:800;text-decoration:none;margin:8px 0}.state-nav a{margin-right:8px}body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif}a{color:inherit;text-decoration:none}.card a:hover h3{text-decoration:underline}`;
  await fs.promises.writeFile(path.join(OUT,"styles.css"), css);

  await fs.promises.writeFile(path.join(OUT,"placeholder.svg"),
`<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360">
  <rect width="100%" height="100%" fill="#f5f5f5"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
        font-family="Arial,Helvetica,sans-serif" font-size="24" fill="#999">
    Cover image
  </text>
</svg>`);

  console.log("✅ Build complete → public/ ready.");
}

main().catch(e=>{ console.error(e); process.exit(1); });