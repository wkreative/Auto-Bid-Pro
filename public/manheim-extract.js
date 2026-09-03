(async () => {
  const VIN_RE = /\b[A-HJ-NPR-Z0-9]{17}\b/g;
  const pairs = new Map();
  const seenApiUrls = new Set();
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const cleanImage = (url) => String(url || '').replace(/([?&])size=[^&]+/, '$1size=w1024h768');
  const isPhoto = (value) => typeof value === 'string'
    && value.includes('images.cdn.manheim.com')
    && /\.(jpg|jpeg|png|webp)(\?|$)/i.test(value);

  function addPair(vin, image, source) {
    const cleanVin = String(vin || '').toUpperCase().match(VIN_RE)?.[0];
    const cleanUrl = cleanImage(image);
    if (!cleanVin || !isPhoto(cleanUrl)) return false;
    if (!pairs.has(cleanVin)) pairs.set(cleanVin, new Set());
    const before = pairs.get(cleanVin).size;
    pairs.get(cleanVin).add(cleanUrl);
    if (pairs.get(cleanVin).size > before) console.log('Foto capturada:', cleanVin, source);
    return true;
  }

  function collectPhotos(node, out = []) {
    if (!node || out.length > 60) return out;
    if (isPhoto(node)) out.push(node);
    else if (Array.isArray(node)) node.forEach((item) => collectPhotos(item, out));
    else if (typeof node === 'object') Object.values(node).forEach((value) => collectPhotos(value, out));
    return out;
  }

  function collectVins(node, out = []) {
    if (!node || out.length > 20) return out;
    if (typeof node === 'string') (node.toUpperCase().match(VIN_RE) || []).forEach((vin) => out.push(vin));
    else if (Array.isArray(node)) node.forEach((item) => collectVins(item, out));
    else if (typeof node === 'object') Object.values(node).forEach((value) => collectVins(value, out));
    return out;
  }

  function scanJson(node, source = 'api') {
    if (!node || typeof node !== 'object') return;

    const vins = [...new Set(collectVins(node))];
    const photos = [...new Set(collectPhotos(node))];

    // Safe rule: only assign photos when this object has exactly one VIN.
    // This prevents assigning a vehicle's photos to the next vehicle by order.
    if (vins.length === 1 && photos.length > 0) photos.slice(0, 8).forEach((photo) => addPair(vins[0], photo, source));

    if (Array.isArray(node)) node.forEach((item) => scanJson(item, source));
    else Object.values(node).forEach((value) => scanJson(value, source));
  }

  async function scanApiUrl(url) {
    if (!url || seenApiUrls.has(url) || !/^https?:\/\//.test(url)) return;
    if (/logrocket|pendo|google|analytics|segment|optimizely|cdn|assets|font|css/i.test(url)) return;
    seenApiUrls.add(url);

    try {
      const response = await fetch(url, { credentials: 'include' });
      const text = await response.clone().text();
      if (!text.match(VIN_RE) && !text.includes('images.cdn.manheim.com')) return;
      scanJson(JSON.parse(text), url);
    } catch {}
  }

  async function scanPerformanceApis() {
    const urls = performance.getEntriesByType('resource')
      .map((entry) => entry.name)
      .filter((url) => /manheim|listing|search|inventory|vehicle|workbook|results|onesearch/i.test(url));
    for (const url of urls) await scanApiUrl(url);
  }

  function scanDomCards() {
    const cards = [...document.querySelectorAll('[data-vin], [data-testid*="listing"], article, li, [class*="listing"], [class*="vehicle"]')];
    for (const card of cards) {
      const text = `${card.innerText || ''} ${card.textContent || ''} ${card.dataset ? JSON.stringify(card.dataset) : ''}`;
      const vins = [...new Set(text.toUpperCase().match(VIN_RE) || [])];
      if (vins.length !== 1) continue;
      const photos = [...card.querySelectorAll('img[src*="images.cdn.manheim.com"]')].map((img) => img.src);
      photos.slice(0, 8).forEach((photo) => addPair(vins[0], photo, 'dom-card'));
    }
  }

  async function captureCurrentPage() {
    const before = [...pairs.values()].reduce((sum, set) => sum + set.size, 0);
    let lastHeight = 0;
    for (let i = 0; i < 8; i++) {
      window.scrollTo(0, document.body.scrollHeight);
      await wait(800);
      await scanPerformanceApis();
      scanDomCards();
      if (document.body.scrollHeight === lastHeight) break;
      lastHeight = document.body.scrollHeight;
    }
    window.scrollTo(0, 0);
    await wait(500);
    await scanPerformanceApis();
    scanDomCards();
    const after = [...pairs.values()].reduce((sum, set) => sum + set.size, 0);
    updatePanel();
    return after - before;
  }

  function findNextButton() {
    const candidates = [...document.querySelectorAll('button, a, [role="button"]')];
    return candidates.find((el) => {
      const label = `${el.innerText || ''} ${el.textContent || ''} ${el.getAttribute('aria-label') || ''} ${el.getAttribute('title') || ''}`.trim().toLowerCase();
      const cls = `${el.className || ''}`.toLowerCase();
      const disabled = el.disabled || el.getAttribute('aria-disabled') === 'true' || cls.includes('disabled');
      if (disabled || el.offsetParent === null) return false;
      return label === 'next' || label === 'siguiente' || label === '>' || label === '›' || label.includes('next page') || label.includes('next') || cls.includes('next');
    });
  }

  async function tryAutoPagination() {
    let pages = 1;
    while (pages < 20) {
      const next = findNextButton();
      if (!next) break;
      const beforeText = document.body.innerText;
      next.click();
      await wait(3500);
      if (document.body.innerText === beforeText) break;
      pages++;
      await captureCurrentPage();
    }
    return pages;
  }

  function output() {
    return [...pairs.entries()].flatMap(([vin, photos]) => [...photos].slice(0, 8).map((image) => ({ vin, image })));
  }

  function download() {
    const data = output();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'manheim-con-fotos.json';
    a.click();
    console.table(data.slice(0, 30));
    alert(`Listo: ${data.length} fotos confiables para ${pairs.size} VINs.`);
  }

  function updatePanel() {
    const el = document.getElementById('abp-manheim-count');
    if (el) el.textContent = `${pairs.size} VINs / ${output().length} fotos`;
  }

  function installPanel() {
    if (document.getElementById('abp-manheim-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'abp-manheim-panel';
    panel.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:999999;background:#050505;color:white;border:1px solid #22c55e;border-radius:12px;padding:12px;font:14px Arial;box-shadow:0 10px 30px rgba(0,0,0,.4);max-width:320px';
    panel.innerHTML = `
      <div style="font-weight:700;margin-bottom:6px">Auto Bid Pro - Manheim Fotos</div>
      <div id="abp-manheim-count" style="color:#22c55e;margin-bottom:10px">0 VINs / 0 fotos</div>
      <button id="abp-capture" style="background:#2563eb;color:white;border:0;border-radius:8px;padding:8px 10px;margin-right:6px;cursor:pointer">Capturar esta página</button>
      <button id="abp-download" style="background:#22c55e;color:white;border:0;border-radius:8px;padding:8px 10px;cursor:pointer">Descargar JSON</button>
      <div style="color:#aaa;font-size:12px;margin-top:8px">Si no avanza solo, da Next en Manheim y luego "Capturar esta pagina".</div>
    `;
    document.body.appendChild(panel);
    document.getElementById('abp-capture').onclick = async () => {
      const btn = document.getElementById('abp-capture');
      btn.textContent = 'Capturando...';
      await captureCurrentPage();
      btn.textContent = 'Capturar esta página';
    };
    document.getElementById('abp-download').onclick = download;
    updatePanel();
  }

  installPanel();
  await captureCurrentPage();
  const pages = await tryAutoPagination();
  updatePanel();

  if (pages > 1) download();
  else alert('Se capturo la pagina actual. Si Manheim no avanzo solo, usa el panel verde: da Next manualmente y presiona "Capturar esta pagina" en cada pagina. Al final presiona "Descargar JSON".');
})();
