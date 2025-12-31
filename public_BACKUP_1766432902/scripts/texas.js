(() => {
  // Helpers (match your SKU convention: INF-TX-WC / INF-TX-NC)
  const skuToStateAbbr = (sku) => String(sku || "").split("-")[1] || "";
  const skuToChildrenCode = (sku) => String(sku || "").split("-")[2] || "";
  const coverFromSku = (sku) => {
    const abbr = skuToStateAbbr(sku);
    const kids = skuToChildrenCode(sku) === "WC" ? "WithChildren" : "NoChildren";
    return `/kits/${abbr}_${kids}_CoverPhoto.png`;
  };

  const money = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return "";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
  };

  const getPrice = (p) => p?.PriceUSD ?? p?.priceUSD ?? p?.price ?? "";
  const getTitle = (p) => p?.Title ?? p?.title ?? "Texas Divorce Kit";
  const getHref = (p, fallback) => {
    // If your products already have a URL field, use it. Otherwise fallback stays.
    return p?.URL || p?.Url || p?.url || fallback || "#";
  };

  function setCard(elId, p) {
    const el = document.getElementById(elId);
    if (!el || !p) return;
    const title = getTitle(p);
    const imgSrc = (String(p?.CoverImageURL || "").trim()) || coverFromSku(p.SKU);
    const href = getHref(p, "#");

    el.innerHTML = `
      <a href="${href}">
        <img src="${imgSrc}" alt="${title}"
             onerror="this.onerror=null; this.src='/placeholder.svg';" />
      </a>
    `;
  }

  function setText(id, txt) {
    const el = document.getElementById(id);
    if (el) el.textContent = txt;
  }

  function setLink(id, href) {
    const el = document.getElementById(id);
    if (el && href) el.setAttribute("href", href);
  }

  fetch("/products.json")
    .then(r => r.json())
    .then((products) => {
      const list = Array.isArray(products) ? products : [];

      const txWC = list.find(p => String(p?.SKU || "").toUpperCase().includes("-TX-WC"));
      const txNC = list.find(p => String(p?.SKU || "").toUpperCase().includes("-TX-NC"));

      // Images
      setCard("txWithChildrenCard", txWC);
      setCard("txNoChildrenCard", txNC);

      // Prices (should already be 199/175 from your sweep)
      if (txWC) setText("txWithChildrenPrice", money(getPrice(txWC)) || "$199");
      if (txNC) setText("txNoChildrenPrice", money(getPrice(txNC)) || "$175");

      // Links: if products contain URLs, use them; otherwise keep fallbacks
      if (txWC) setLink("txWithChildrenLink", getHref(txWC, "/divorce/texas-with-children.html"));
      if (txNC) setLink("txNoChildrenLink", getHref(txNC, "#"));
    })
    .catch((e) => console.error("Texas page load error:", e));
})();
