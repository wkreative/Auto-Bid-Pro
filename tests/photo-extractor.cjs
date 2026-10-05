const vm = require('node:vm');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const elements = {};
  let downloaded;
  const vins = ['1HGCM82633A004352', '1FAFP404X1F123456'];
  const cards = vins.map((vin, index) => ({innerText:vin, dataset:{vin},querySelectorAll:()=>[{src:`https://images.cdn.manheim.com/car${index}.jpg?size=small`}]}));
  cards.push({innerText:vins.join(' '), dataset:{},querySelectorAll:()=>[{src:'https://images.cdn.manheim.com/ambiguous.jpg'}]});
  const context = {
    console:{log(){},table(){}}, Blob, URL:{createObjectURL(blob){downloaded=blob;return 'blob:test';}},
    setTimeout(fn){fn();}, alert(){}, performance:{getEntriesByType(){return [];}},
    window:{scrollTo(){}},
    document:{
      body:{scrollHeight:100,innerText:'results',appendChild(panel){elements[panel.id]=panel; for(const id of ['abp-capture','abp-download','abp-photos-count']) elements[id]={};}},
      querySelectorAll(selector){return selector.includes('[data-vin]') ? cards : [];},
      getElementById(id){return elements[id];},
      createElement(){return {style:{},click(){}};},
    },
  };
  await vm.runInNewContext(fs.readFileSync('public/photos-extract.js','utf8'),context);
  elements['abp-download'].onclick();
  const rows=JSON.parse(await downloaded.text());
  assert.equal(rows.length,2);
  for(let i=0;i<2;i++) {assert.equal(rows[i].vin,vins[i]);assert.equal(rows[i].image,`https://images.cdn.manheim.com/car${i}.jpg?size=w1024h768`);}
  await elements['abp-capture'].onclick();
  elements['abp-download'].onclick();
  assert.equal(JSON.parse(await downloaded.text()).length,2);
  console.log('PASS: extractor captures photos by VIN, excludes ambiguous cards, downloads JSON and deduplicates repeated captures.');
})().catch(error=>{console.error(error);process.exitCode=1;});
