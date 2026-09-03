(async () => {
  const VIN_RE = /\b[A-HJ-NPR-Z0-9]{17}\b/g;
  const pairs = new Map();
  const seenApiUrls = new Set();
  const logs = [];

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const cleanImage = (url) => String(url || '').replace(/([?&])size=[^&]+/, '$1size=w1024h768');
  const isPhoto = (value) => typeof value === 'string' && value.includes('images.cdn.manheim.com') && /\.(jpg|jpeg|png|webp)(\?|$)/i.test(value);

  function addPair(vin, image, source) {
    vin = String(vin || '').toUpperCase().match(VIN_RE)?.[0];
    image = cleanImage(image);
    if (!vin || !isPhoto(image)) return;
    if (!pairs.has(vin)) pairs.set(vin, new Set());
    pairs.get(vin).add(image);
    logs.push({ vin, image, source });
  }

  function collectPhotos(node, out = []) {
    if (!node || out.length > 50) return out;
    if (isPhoto(node)) out.push(node);
    else if (Array.isArray(node)) node.forEach((item) => collectPhotos(item, out));
    else if (typeof node === 'object') Object.values(node).forEach((value) => collectPhotos(value, out));
    return out;
  }

  function collectVins(node, out = []) {
    if (!node || out.length > 10) return out;
    if (typeof node === 'string') {
      const matches = node.toUpperCase().match(VIN_RE) || [];
      matches.forEach((vin) => out.push(vin));
    } else if (Array.isArray(node)) node.forEach((item) => collectVins(item, out));
    else if (typeof node === 'object') Object.values(node).forEach((value) => collectVins(value, out));
    return out;
  }

  function scanJson(node, source = 'api') {
    if (!node || typeof node !== 'object') return;

    const vins = [...new Set(collectVins(node))];
    const photos = [...new Set(collectPhotos(node))];

    // Only assign when this object clearly represents one vehicle. This avoids wrong photos.
    if (vins.length === 1 && photos.length > 0) photos.slice(0, 8).forEach((photo) => addPair(vins[0], photo, source));

    if (Array.isArray(node)) node.forEach((item) => scanJson(item, source));
    else Object.values(node).forEach((value) => scanJson(value, source));
  }

  async function fetchAndScan(url) {
    if (!url || seenApiUrls.has(url)) return;
    if (!/^https?:\/\//.test(url)) return;
    if (/logrocket|pendo|google|analytics|segment|optimizely|cdn|assets/i.test(url)) return;
    seenApiUrls.add(url);
    try {
      const response = await fetch(url, { credentials: 'include' });
      const text = await response.clone().text();
      if (!text.includes('images.cdn.manheim.com') && !text.match(VIN_RE)) return;
      const json = JSON.parse(text);
      scanJson(json, url);
      console.log('Manheim API escaneada:', url, 'VINs con fotos:', pairs.size);
    } catch {}
  }

  function scanDomCards() {
    const cards = [...document.querySelectorAll('[data-vin], [data-testid*="listing"], article, li, [class*="listing"], [class*="vehicle"]')];
    for (const card of cards) {
      const text = `${card.innerText || ''} ${card.textContent || ''} ${card.dataset ? JSON.stringify(card.dataset) : ''}`;
      const vins = [...new Set((text.toUpperCase().match(VIN_RE) || []))];
      if (vins.length !== 1) continue;
      const photos = [...card.querySelectorAll('img[src*="images.cdn.manheim.com"]')].map((img) => img.src);
      photos.slice(0, 8).forEach((photo) => addPair(vins[0], photo, 'dom-card'));
    }
  }

  async function scanPerformanceApis() {
    const urls = performance.getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((url) => /manheim|listing|search|inventory|vehicle|workbook|results/i.test(url));
    for (const url of urls) await fetchAndScan(url);
  }

  await scanPerformanceApis();
  scanDomCards();

  let page = 1;
  while (page <= 20) {
    let lastHeight = 0;
    for (let i = 0; i < 7; i++) {
      window.scrollTo(0, document.body.scrollHeight);
      await wait(900);
      await scanPerformanceApis();
      scanDomCards();
      if (document.body.scrollHeight === lastHeight) break;
      lastHeight = document.body.scrollHeight;
    }

    const next = [...document.querySelectorAll('button, a')].find((el) => {
      const label = `${el.innerText || ''} ${el.textContent || ''} ${el.getAttribute('aria-label') || ''}`.trim().toLowerCase();
      return ['next', 'siguiente', '>', '›'].includes(label) || label.includes('next page') || label.includes('next');
    });

    if (!next || next.disabled || next.getAttribute('aria-disabled') === 'true' || page >= 20) break;
    next.click();
    page++;
    await wait(3500);
    await scanPerformanceApis();
    scanDomCards();
  }

  const output = [...pairs.entries()].flatMap(([vin, photos]) => [...photos].slice(0, 8).map((image) => ({ vin, image })));
  const blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'manheim-con-fotos.json';
  a.click();

  console.table(output.slice(0, 25));
  alert(`Listo: ${output.length} fotos confiables para ${pairs.size} VINs. Si el numero es bajo, vuelve a correr el script despues de refrescar Manheim.`);
})();
