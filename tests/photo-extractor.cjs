const vm = require('node:vm');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
  const elements = {};
  let downloaded;
  const vins = ['1HGCM82633A004352', '1FAFP404X1F123456'];
  const cards = vins.map((vin, index) => ({innerText:`${vin} ${index === 0 ? '10/15 2-41' : '10/15 2-17'}`, dataset:{vin},querySelectorAll:()=>[{src:`https://images.cdn.manheim.com/car${index}.jpg?size=small`}]}));
  cards.push({innerText:vins.join(' ') + ' 10/15 1-180', dataset:{},querySelectorAll:()=>[{src:'https://images.cdn.manheim.com/ambiguous.jpg'}]});
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
  assert.equal(rows[0].lot, '10/15 2-41');
  assert.equal(rows[1].lot, '10/15 2-17');
  // Lot metadata must survive even when a vehicle has no loaded photo.
  cards.push({innerText:'1HGCM82633A004353 10/15 1-180', dataset:{}, querySelectorAll:()=>[]});
  await elements['abp-capture'].onclick();
  elements['abp-download'].onclick();
  const recaptured = JSON.parse(await downloaded.text());
  assert.equal(recaptured.length,3);
  assert.deepEqual(recaptured[2], {vin:'1HGCM82633A004353', lot:'10/15 1-180'});
  console.log('PASS: extractor captures photos by VIN, excludes ambiguous cards, downloads JSON and deduplicates repeated captures.');
})().catch(error=>{console.error(error);process.exitCode=1;});
