(async () => {
  const pick = (o, ...keys) => { for (const k of keys) { const p = k.split('.'); let c = o; for (const x of p) c = c?.[x]; if (c) return c; } return null; };
  let apiData = null, apiUrl = null;
  for (const e of performance.getEntriesByType('resource')) {
    if (/manheim|search|results|inventory|listing/i.test(e.name) && e.name.startsWith('http')) {
      try {
        const r = await fetch(e.name, { credentials: 'include' });
        const j = await r.clone().json().catch(() => null);
        if (j && typeof j === 'object' && JSON.stringify(j).length > 500) { apiData = j; apiUrl = e.name; break; }
      } catch {}
    }
  }
  if (!apiData) {
    const html = document.documentElement.outerHTML;
    const next = document.getElementById('__NEXT_DATA__')?.textContent;
    if (next) try { apiData = JSON.parse(next); } catch {}
    if (!apiData) {
      const cards = [...document.querySelectorAll('[data-testid*="vehicle"], .vehicle-card, [class*="result"]')].map(el => ({
        make: el.textContent.match(/(Toyota|Ford|Honda|Chevrolet|Nissan|BMW|Mercedes|Jeep|Lexus|Hyundai|Kia|Mazda|Subaru|Audi|Volkswagen|Dodge|Ram|GMC|Cadillac|Acura|Infiniti|Buick|Chrysler|Lincoln)/i)?.[0],
        text: el.innerText.slice(0, 400),
        images: [...el.querySelectorAll('img')].map(i => i.src).slice(0, 5),
        vin: el.innerText.match(/\b[A-HJ-NPR-Z0-9]{17}\b/)?.[0],
      })).filter(c => c.make);
      if (cards.length) apiData = { vehicles: cards, _note: 'DOM fallback' };
    }
  }
  if (!apiData) return alert('No se pudo capturar datos. Abre Network (F12) y refresca, luego reintenta.');
  const blob = new Blob([JSON.stringify(apiData, null, 2)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'manheim.json'; a.click();
  console.log('✅ Manheim capturado desde', apiUrl || 'DOM', apiData);
  alert('✅ manheim.json descargado (' + (apiData.vehicles?.length || Object.keys(apiData).length) + ' items). Súbelo en Auto Bid Pro > Admin > Importar');
})();
