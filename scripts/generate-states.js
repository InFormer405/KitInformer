import { states } from '../data/state-divorce-data.js';
import { products } from '../data/products-data.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, '..', 'public', 'states');

function generateFAQSchema(state) {
  const faqs = [
    {
      question: `What are the residency requirements for divorce in ${state.name}?`,
      answer: state.residency_requirement
    },
    {
      question: `How long does divorce take in ${state.name}?`,
      answer: state.waiting_period
    },
    {
      question: `How much does it cost to file for divorce in ${state.name}?`,
      answer: state.filing_fee_range
    },
    {
      question: `Can filing fees be waived in ${state.name}?`,
      answer: state.fee_waiver_available
    }
  ];

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

function generateArticleSchema(state) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": `${state.name} Divorce Forms & Filing Requirements (2026)`,
    "description": `${state.name} divorce filing requirements including residency rules, waiting periods, filing fees, and fee waiver information.`,
    "datePublished": "2026-01-01",
    "dateModified": "2026-02-01",
    "publisher": {
      "@type": "Organization",
      "name": "InFormer Legal Form Kits",
      "url": "https://informerlegal.com"
    },
    "author": {
      "@type": "Organization",
      "name": "InFormer Legal Form Kits"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://informerlegal.com/states/${state.slug}/`
    }
  };
}

function generateProductCards(state) {
  const stateProducts = products.filter(p => p.state === state.abbreviation);
  if (stateProducts.length === 0) return '';

  const cards = stateProducts.map(product => {
    const pillLabel = product.children ? 'With Children' : 'No Children';
    return `        <div class="product-card">
          <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.onerror=null;this.src='/images/products/placeholder.svg';" />
          <h3>${product.name}</h3>
          <span class="blue-pill">${pillLabel}</span>
          <p class="gold-price">$${product.price}</p>
          <p class="price-note">One-time payment</p>
          <p class="product-desc">${product.description}</p>
        </div>`;
  }).join('\n');

  return `
    <section class="section">
      <div class="container">
        <h2>${state.name} Divorce Form Kits</h2>
        <div class="product-grid">
${cards}
        </div>
      </div>
    </section>
`;
}

function generateHTML(state) {
  const firstCitation = state.citations.length > 0 ? state.citations[0] : null;
  const citationSource = firstCitation ? `<p><em>Source: ${firstCitation.title}</em></p>` : '';

  const citationsList = state.citations.map(c =>
    `        <li><a href="${c.url}" target="_blank" rel="noopener noreferrer">${c.title}</a></li>`
  ).join('\n');

  const faqSchema = JSON.stringify(generateFAQSchema(state), null, 2);
  const articleSchema = JSON.stringify(generateArticleSchema(state), null, 2);
  const productSection = generateProductCards(state);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${state.name} Divorce Forms & Filing Requirements (2026)</title>
  <meta name="description" content="${state.name} divorce forms with state-specific filing instructions. ${state.residency_requirement.split('.')[0]}. Filing fees: ${state.filing_fee_range.split('.')[0]}.">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link rel="canonical" href="https://informerlegal.com/states/${state.slug}/" />
  <link rel="stylesheet" href="/styles.css?v=2" />
</head>

<body>

  <nav class="breadcrumb">
    <a href="/">State-Specific Divorce Forms</a> /
    <a href="/states/">All State Divorce Forms</a> /
    ${state.name} Divorce Forms
  </nav>

  <header>
    <section class="state-intro">
      <h1>${state.name} Divorce Forms & Filing Requirements</h1>
      <p>
        ${state.name} divorce laws require specific formatting, disclosures, and filing procedures.
        Our ${state.name} divorce form kits are structured to match court expectations and reduce
        avoidable rejection issues.
      </p>
    </section>
  </header>

  <main>

    <section class="section">
      <div class="container">
        <h2>${state.name} Residency Requirement</h2>
        <p>${state.residency_requirement}</p>
        ${citationSource}
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2>${state.name} Divorce Waiting Period</h2>
        <p>${state.waiting_period}</p>
        ${citationSource}
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2>${state.name} Divorce Filing Fees</h2>
        <p>${state.filing_fee_range}</p>
        ${citationSource}
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2>${state.name} Filing Fee Waiver</h2>
        <p>${state.fee_waiver_available}</p>
        ${citationSource}
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2>${state.name} Fault Type</h2>
        <p>${state.fault_type}</p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2>Parenting Classes</h2>
        <p>${state.parenting_class_required}</p>
      </div>
    </section>
${productSection}
    <section class="section">
      <div class="container">
        <h2>Sources & Verification</h2>
        <ul>
${citationsList}
        </ul>
        <p><em>Verified: ${state.last_verified}</em></p>
      </div>
    </section>

    <section class="related-states">
      <h2>Explore Divorce Forms in Other States</h2>
      <ul>
        <li><a href="/states/">View All States</a></li>
      </ul>
    </section>

  </main>

  <footer>
    <nav class="breadcrumb">
      <a href="/">State-Specific Divorce Forms</a> /
      <a href="/states/">All State Divorce Forms</a> /
      ${state.name} Divorce Forms
    </nav>
    <p>&copy; 2026 InFormer Legal Form Kits</p>
    <p>
      InFormer Legal Forms provides self-help legal forms and informational resources.
      We are not a law firm and do not provide legal advice.
      Court acceptance and outcomes depend on individual circumstances and jurisdiction.
    </p>
  </footer>

<script type="application/ld+json">
${faqSchema}
</script>

<script type="application/ld+json">
${articleSchema}
</script>

</body>
</html>
`;
}

let generated = 0;

for (const state of states) {
  const stateDir = path.join(publicDir, state.slug);
  fs.mkdirSync(stateDir, { recursive: true });

  const filePath = path.join(stateDir, 'index.html');
  const html = generateHTML(state);
  fs.writeFileSync(filePath, html, 'utf-8');

  console.log(`Generated: public/states/${state.slug}/index.html`);
  generated++;
}

console.log(`\nDone. ${generated} state page(s) generated.`);
