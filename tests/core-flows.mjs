import fs from 'node:fs';
import { createRequire } from 'node:module';
const dependency = createRequire(import.meta.url);
import ts from 'typescript';
import assert from 'node:assert/strict';
function load(file, mocks = {}) {
 const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
 const loaded = {exports:{}};
 new Function('require','module','exports',code)(name => name in mocks ? mocks[name] : dependency(name),loaded,loaded.exports);
 return loaded.exports;
}
const calculatorTools = load('src/lib/calculator.ts');
const {parseAmount, brokerFee, auctionCosts, maximumOffer} = calculatorTools;
for (const [price, fee] of [[0,0],[-1,0],[999,350],[999.99,350],[1000,750],[4999.99,750],[5000,999],[14999.99,999],[15000,1200],[20000,1600]]) {
  assert.equal(brokerFee(price),fee,`Broker fee for ${price}`);
}
assert.deepEqual(auctionCosts(10000),{broker:999,paperwork:350,paymentCharge:400,total:11749});
assert.deepEqual(auctionCosts(10000,100,true),{broker:999,paperwork:350,paymentCharge:0,total:11449});
assert.equal(auctionCosts(15000).total,17150);
assert.equal(auctionCosts(999).total,1738.96);
assert.equal(auctionCosts(0).total,0);
for(const discounted of [false,true]) {
  for(const price of [999.99,1000,4999.99,5000,14999.99,15000,20000]) {
    const budget = auctionCosts(price,123,discounted).total;
    const maximum = maximumOffer(budget,123,discounted);
    assert.equal(maximum,price);
    assert.ok(auctionCosts(maximum+0.01,123,discounted).total > budget);
  }
}
for (const [input, expected] of [['1,250.50',1250.5],['',0],['.',0],['1.2.3',0],['Infinity',0],[-5,0],['15000',15000]]) assert.equal(parseAmount(input),expected);
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const Calculator=load('src/components/ResaleCalculator.tsx',{'@/lib/calculator':calculatorTools}).default;
let html=renderToStaticMarkup(React.createElement(Calculator,{startingPrice:10000,estimatedRepairCost:1250.50,estimatedResaleValue:15000}));
for(const value of ['$11,749.00','$3,251.00','$15,000.00','+27.7%']) assert.ok(html.includes(value),value);
assert.ok(!html.includes('Reparaci'));
assert.ok(!html.includes('readOnly'));
html=renderToStaticMarkup(React.createElement(Calculator,{startingPrice:0,estimatedRepairCost:0,estimatedResaleValue:500}));
assert.ok(!html.includes('NaN')&&!html.includes('Infinity'));
const calculatorState = [];
let stateIndex = 0;
const InteractiveCalculator = load('src/components/ResaleCalculator.tsx', {
  '@/lib/calculator': calculatorTools,
  react: {...React, useState(initial) {
    const index = stateIndex++;
    if (!(index in calculatorState)) calculatorState[index] = initial;
    return [calculatorState[index], value => { calculatorState[index] = value; }];
  }},
}).default;
function calculatorTree() {
  stateIndex = 0;
  return InteractiveCalculator({startingPrice:10000,estimatedResaleValue:15000});
}
function findBidInput(node, id = 'auction-bid-amount') {
  if (!node || typeof node !== 'object') return;
  if (node.props?.id === id) return node;
  for (const child of React.Children.toArray(node.props?.children)) {
    const found = findBidInput(child, id);
    if (found) return found;
  }
}
for (const [amount, total, profit, roi] of [
  ['8,000.50','$9,669.52','$5,330.48','+55.1%'],
  ['12000','$13,829.00','$1,171.00','+8.5%'],
  ['', '$0.00', '$15,000.00', '+0.0%'],
]) {
  findBidInput(calculatorTree()).props.onChange({target:{value:amount}});
  const result = renderToStaticMarkup(calculatorTree());
  for (const expected of [total,profit,roi]) assert.ok(result.includes(expected),expected);
}
findBidInput(calculatorTree()).props.onChange({target:{value:'10000'}});
findBidInput(calculatorTree(),'auction-payment').props.onChange({target:{value:'discounted'}});
const discountedHtml=renderToStaticMarkup(calculatorTree());
assert.ok(discountedHtml.includes('$11,349.00'));
assert.ok(discountedHtml.includes('$3,651.00'));
assert.ok(discountedHtml.includes('$0.00'));
let callCount=0, session=null, authError=null, payload;
const {signup}=load('src/app/register/actions.ts',{
 'next/cache':{revalidatePath(){}}, 'next/navigation':{redirect(url){throw new Error(url)}},
 'next/headers':{headers:async()=>new Map([['origin','https://example.com']])},
 '@/utils/supabase/server':{createClient:async()=>({auth:{signUp:async(data)=>{callCount++;payload=data;return {data:{session},error:authError}}}})}
});
const form=new FormData(); for(const [k,v] of Object.entries({email:' Test@example.com ',password:'password123',first_name:' Ana ',last_name:' Test '}))form.set(k,v);
(async()=>{
 await assert.rejects(signup(form),{message:'/register?confirmation=true'});
 assert.equal(payload.email,'test@example.com'); assert.equal(payload.options.data.first_name,'Ana');assert.equal(payload.options.emailRedirectTo,'https://example.com/auth/callback');
 session={access_token:'test'};await assert.rejects(signup(form),{message:'/dashboard'});
 authError={message:'rejected'};await assert.rejects(signup(form),{message:'/register?error=true'});
 form.set('password','short');await assert.rejects(signup(form),{message:'/register?error=validation'});assert.equal(callCount,3);
 const batchTools = load('src/lib/import-batches.ts');
 const batchId = batchTools.createBatchId();
 assert.ok(batchTools.isBatchId(batchId));
 assert.equal(batchTools.isBatchId('invalid|BATCH:other'), false);
 let stored;
 let importUser = {id:'admin'}, importRole = 'admin', importProfileError = null, importWrites = 0;
 const importedPhotos = [], uploadedPhotos = [];
 const {POST} = load('src/app/api/admin/import/route.ts', {
   '@/lib/import-batches': batchTools,
   '@/lib/publication': load('src/lib/publication.ts'),
   '@/utils/supabase/server': {createClient: async () => ({
     auth: {getUser: async () => ({data: {user: importUser}})},
     from: () => { throw new Error('Do not read admin roles through session RLS'); },
   })},
   '@/utils/supabase/admin': {createAdminClient: () => ({
     storage: {from: () => ({
       upload: async path => { uploadedPhotos.push(path); return {error:null}; },
       getPublicUrl: path => ({data:{publicUrl:`https://storage.example/${path}`}}),
     })},
     from: table => table === 'profiles' ? {
     select: () => ({eq: (column, id) => {
       assert.equal(column,'id'); assert.equal(id,importUser.id);
       return {single: async () => ({data: {role:importRole},error:importProfileError})};
     }}),
   } : table === 'vehicle_images' ? {insert: async rows => {importedPhotos.push(...rows);return {error:null};}} : ({insert: (rows) => {
     importWrites++;
     stored = rows[0]; return {select: () => ({single: async () => ({data: {id:`vehicle-${importWrites}`},error:null})})};
   }})})},
 });
 const response = await POST({json: async () => ({batchId,vehicles:[{brand:'Test',model:'Car',year:2026,vin:'TEST',images:[]}]})});
 assert.equal(response.status,200);
 const result = await response.json();
 assert.equal(result.batchId,batchId);
 assert.equal(result.ok,1);
 assert.ok(stored.internal_notes.includes(`BATCH:${batchId} |`));
 assert.ok(stored.description.includes(`[${batchId}]`));
 const importRequest = {json: async () => ({batchId,vehicles:[{vin:'TEST',images:[]}]})};
 importUser = null;
 assert.equal((await POST(importRequest)).status,401);
 importUser = {id:'admin'}; importRole = 'user';
 assert.equal((await POST(importRequest)).status,403);
 importRole = 'admin'; importProfileError = {message:'unavailable'};
 assert.equal((await POST(importRequest)).status,503);
 assert.equal(importWrites,1);
 importProfileError = null;
 const originalFetch = globalThis.fetch;
 try {
   globalThis.fetch = async () => ({ok:true,arrayBuffer:async()=>new Uint8Array([1,2,3]).buffer});
   const batchResponse = await POST({json:async()=>({batchId,vehicles:Array.from({length:74},(_,index)=>({
     brand:'Test',model:'Car',year:2026,vin:`TEST${index}`,images:[`https://photos.example/${index}.jpg`],
   }))})});
   const batchResult = await batchResponse.json();
   assert.equal(batchResult.ok,74); assert.equal(batchResult.fail,0); assert.deepEqual(batchResult.errs,[]);
   assert.equal(importedPhotos.length,74); assert.equal(uploadedPhotos.length,74);
   for(let index=0;index<74;index++) {
     assert.equal(importedPhotos[index].vehicle_id,`vehicle-${index+2}`);
     assert.ok(importedPhotos[index].url.includes(`/vehicle-${index+2}/images/`));
   }
 } finally {globalThis.fetch = originalFetch;}
 const ranges=[];
 const rows=[...Array.from({length:1001},()=>({internal_notes:`BATCH:${batchId} | Puerto Rico`})),{internal_notes:'BATCH:MAN-PR-2025-01-01-ABCD | old'},{internal_notes:'unrelated'}];
 const query={select:()=>query,not:()=>query,order:()=>query,range:async(a,b)=>{ranges.push([a,b]);return {data:rows.slice(a,b+1),error:null};}};
 const list=await batchTools.listImportBatches({from:()=>query});
 assert.deepEqual(ranges,[[0,999],[1000,1999]]);
 assert.deepEqual(list,[{batch:batchId,count:1001},{batch:'MAN-PR-2025-01-01-ABCD',count:1}]);
 query.range=async()=>({data:null,error:new Error('database unavailable')});
 await assert.rejects(batchTools.listImportBatches({from:()=>query}),/database unavailable/);
 const ImportVehicles=load('src/components/admin/ImportVehicles.tsx',{
   '@/lib/import-batches':batchTools,
   '@/utils/supabase/client':{createClient:()=>{throw new Error('No browser client needed while rendering');}},
 }).default;
 const importHtml=renderToStaticMarkup(React.createElement(ImportVehicles,{initialBatchId:batchId}));
 assert.ok(importHtml.includes(batchId));
 assert.ok(importHtml.includes('Lotes importados'));
 const accountHtml = renderToStaticMarkup(React.createElement(ImportVehicles,{initialBatchId:batchId,account:{email:'client@example.com',role:'user'}}));
 assert.ok(accountHtml.includes('client@example.com'));
 assert.ok(accountHtml.includes('Cliente (sin permiso para importar)'));
 assert.ok(accountHtml.includes('Cerrar sesión y usar otra cuenta'));
 for (const instruction of ['search.manheim.com', 'Export → Export to CSV', 'F12', 'allow pasting', 'Capturar esta página', 'Descargar JSON', 'fotos.json', 'Copiar script para consola', 'photos-extract.js']) {
   assert.ok(importHtml.includes(instruction), instruction);
 }
 const config = load('next.config.ts').default;
 assert.deepEqual(await config.headers(), [{source:'/photos-extract.js',headers:[{key:'Access-Control-Allow-Origin',value:'*'}]}]);
 console.log('PASS: import uses and persists the displayed batch ID; counts across database pages; legacy batches; database errors; initial batch rendering.');
 console.log('PASS: calculator parsing, rendered totals/profit/ROI/break-even, zero investment; signup validation, normalization, confirmation, session and error paths.');
 let user = null, role = 'admin', profileError = null, dbError = null, writes = 0;
 const createVehicle = load('src/app/api/admin/vehicles/route.ts', {
   '@/lib/publication': load('src/lib/publication.ts'),
   '@/utils/supabase/server': {createClient: async () => ({
     auth: {getUser: async () => ({data: {user}})},
     from: () => { throw new Error('Session profile reads must not gate administrator access'); },
   })},
   '@/utils/supabase/admin': {createAdminClient: () => {
     assert.ok(user, 'Verify session before accessing the admin client');
     return {from: table => table === 'profiles' ? {
       select: () => ({eq: (column, id) => {
         assert.equal(column, 'id'); assert.equal(id, user.id);
         return {single: async () => ({data: role ? {role} : null, error: profileError})};
       }}),
     } : ({insert: rows => {
       writes++;
       stored = rows[0];
       return {select: () => ({single: async () => ({data: dbError ? null : {id:'new-vehicle'},error:dbError})})};
     }})};
   }},
 }).POST;
 const vehicleInput = {brand:'Toyota', model:'Corolla', vin:'TESTVIN', year:2025, mileage:100,
   sale_type:'auction', status:'draft', starting_price:10000, estimated_repair_cost:500,
   estimated_resale_value:15000, description:'Test', internal_notes:'untrusted', id:'untrusted'};
 const requestVehicle = (input = vehicleInput) => createVehicle({json: async () => input});
 assert.equal((await requestVehicle()).status,401);
 user = {id:'admin'}; role = 'user';
 assert.equal((await requestVehicle()).status,403);
 role = null;
 assert.equal((await requestVehicle()).status,403);
 role = 'admin'; profileError = {message:'unavailable'};
 assert.equal((await requestVehicle()).status,503);
 profileError = null;
 assert.equal((await requestVehicle({...vehicleInput,year:null})).status,400);
 assert.equal(writes,0);
 const created = await requestVehicle();
 assert.equal(created.status,201); assert.equal((await created.json()).id,'new-vehicle');
 assert.equal(stored.status,'draft'); assert.equal(stored.starting_price,10000);
 assert.equal(stored.estimated_repair_cost,500); assert.equal(stored.direct_sale_price,null);
 assert.equal(stored.location,'Puerto Rico'); assert.equal(stored.id,undefined); assert.equal(stored.internal_notes,undefined);
 assert.equal((await requestVehicle({...vehicleInput,status:'published',sale_type:'direct_sale',direct_sale_price:20000})).status,201);
 assert.equal(stored.direct_sale_price,20000); assert.equal(stored.starting_price,null);
 assert.equal(stored.estimated_repair_cost,null);
 dbError = {code:'23505',message:'vehicles_vin_key'};
 const duplicate = await requestVehicle();
 assert.equal(duplicate.status,409); assert.equal((await duplicate.json()).error,'vehicles_vin_key');
 console.log('PASS: individual creation checks session and admin role before privileged access; validates input; supports drafts, auctions and direct sales; preserves duplicate VIN errors.');
})().catch(e=>{console.error(e);process.exitCode=1});
