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

function generateRelatedStates(state, stateIndex) {
  const others = states.filter(s => s.slug !== state.slug);
  const offset = (stateIndex * 7) % others.length;
  const selected = [];
  for (let i = 0; i < 5; i++) {
    selected.push(others[(offset + i * 9) % others.length]);
  }
  const unique = [...new Map(selected.map(s => [s.slug, s])).values()].slice(0, 5);
  const links = unique.map(s =>
    `          <li><a href="/states/${s.slug}/">${s.name} Divorce Forms &amp; Filing Requirements</a></li>`
  ).join('\n');
  return `
    <section class="related-states">
      <div class="container">
        <h2>Explore Divorce Forms in Other States</h2>
        <ul>
${links}
        </ul>
      </div>
    </section>
`;
}

function generateConversionLayer(state) {
  return `
    <section class="conversion-layer">
      <div class="container">
        <h2>${state.name} Divorce Form Kits</h2>
        <p class="conversion-intro">
          Filing for divorce in ${state.name} requires precise documentation and
          compliance with court formatting rules. Our ${state.name} Divorce Kits
          are structured to align with state requirements and reduce avoidable delays.
        </p>

        <div class="filing-fee-box">
          <h3>Filing Fees in ${state.name}</h3>
          <p class="filing-fee-highlight">
            Typical filing fees: ${state.filing_fee_range}
          </p>
          <p>
            Every InFormer Divorce Kit includes the official ${state.name}
            fee waiver request forms at no additional cost.
            Approval is determined by the court.
          </p>
        </div>

        <div class="product-grid">
          <div class="product-card">
            <img src="/images/products/${state.slug}-no-children.png"
                 alt="${state.name} Divorce Kit — No Children"
                 class="product-image"
                 loading="lazy"
                 width="600"
                 height="800"
                 onerror="this.style.display='none'" />
            <h3>${state.name} Divorce Kit</h3>
            <span class="blue-pill">No Children</span>
            <p class="gold-price">$175</p>
            <p class="price-note">One-time payment</p>
            <p class="product-desc">
              Complete divorce forms and structured instructions for uncontested cases without minor children.
            </p>
          </div>

          <div class="product-card">
            <img src="/images/products/${state.slug}-with-children.png"
                 alt="${state.name} Divorce Kit — With Children"
                 class="product-image"
                 loading="lazy"
                 width="600"
                 height="800"
                 onerror="this.style.display='none'" />
            <h3>${state.name} Divorce Kit</h3>
            <span class="blue-pill">With Children</span>
            <p class="gold-price">$199</p>
            <p class="price-note">One-time payment</p>
            <p class="product-desc">
              Complete divorce forms and structured instructions for uncontested cases involving minor children.
            </p>
          </div>
        </div>
      </div>
    </section>
`;
}

function generateHTML(state, stateIndex) {
  const firstCitation = state.citations.length > 0 ? state.citations[0] : null;
  const citationSource = firstCitation ? `<p><em>Source: ${firstCitation.title}</em></p>` : '';

  const citationsList = state.citations.map(c =>
    `        <li><a href="${c.url}" target="_blank" rel="noopener noreferrer">${c.title}</a></li>`
  ).join('\n');

  const faqSchema = JSON.stringify(generateFAQSchema(state), null, 2);
  const articleSchema = JSON.stringify(generateArticleSchema(state), null, 2);
  const conversionLayer = generateConversionLayer(state);
  const relatedStates = generateRelatedStates(state, stateIndex);

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
      <p class="last-verified">Last Verified: February 2026</p>
      <p>
        ${state.name} divorce laws require specific formatting, disclosures, and filing procedures.
        Our <a href="/#divorce-forms-by-state">State-Specific Divorce Forms</a> for ${state.name}
        are structured to match court expectations and reduce avoidable rejection issues.
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
${conversionLayer}
    <section class="comparison-section">
      <div class="container">
        <h2>How InFormer Compares</h2>

        <table class="comparison-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th>InFormer Legal Forms</th>
              <th>Typical Online Divorce Service</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>State-Specific Forms</td>
              <td>Yes</td>
              <td>Varies</td>
            </tr>
            <tr>
              <td>Flat Upfront Pricing</td>
              <td>Yes</td>
              <td>Often Subscription</td>
            </tr>
            <tr>
              <td>Monthly Fees</td>
              <td>No</td>
              <td>Common</td>
            </tr>
            <tr>
              <td>Attorney Upsells</td>
              <td>No</td>
              <td>Frequent</td>
            </tr>
            <tr>
              <td>Fee Waiver Forms Included</td>
              <td>Yes</td>
              <td>Rare</td>
            </tr>
          </tbody>
        </table>

        <p class="comparison-note">
          InFormer provides structured self-help legal forms.
          We do not provide legal advice.
        </p>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <h2>Sources & Verification</h2>
        <ul>
${citationsList}
        </ul>
        <p><em>Verified: ${state.last_verified}</em></p>
      </div>
    </section>

${relatedStates}

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

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "State-Specific Divorce Forms",
      "item": "https://informerlegal.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "All State Divorce Filing Requirements",
      "item": "https://informerlegal.com/states/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "${state.name} Divorce Filing Requirements",
      "item": "https://informerlegal.com/states/${state.slug}/"
    }
  ]
}
</script>

</body>
</html>
`;
}

let generated = 0;

for (let i = 0; i < states.length; i++) {
  const state = states[i];
  const stateDir = path.join(publicDir, state.slug);
  fs.mkdirSync(stateDir, { recursive: true });

  const filePath = path.join(stateDir, 'index.html');
  const html = generateHTML(state, i);
  fs.writeFileSync(filePath, html, 'utf-8');

  console.log(`Generated: public/states/${state.slug}/index.html`);
  generated++;
}

console.log(`\nDone. ${generated} state page(s) generated.`);
