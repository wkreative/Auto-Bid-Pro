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
const {parseAmount} = load('src/lib/calculator.ts');
for (const [input, expected] of [['1,250.50',1250.5],['',0],['.',0],['1.2.3',0],['Infinity',0],[-5,0],['15000',15000]]) assert.equal(parseAmount(input),expected);
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
const Calculator=load('src/components/ResaleCalculator.tsx',{'@/lib/calculator':{parseAmount}}).default;
let html=renderToStaticMarkup(React.createElement(Calculator,{startingPrice:10000,estimatedRepairCost:1250.50,estimatedResaleValue:15000}));
for(const value of ['$10,000.00','$5,000.00','$15,000.00','+50.0%']) assert.ok(html.includes(value),value);
assert.ok(!html.includes('Reparaci'));
assert.ok(!html.includes('readOnly'));
html=renderToStaticMarkup(React.createElement(Calculator,{startingPrice:0,estimatedRepairCost:0,estimatedResaleValue:500}));
assert.ok(!html.includes('NaN')&&!html.includes('Infinity'));
const calculatorState = [];
let stateIndex = 0;
const InteractiveCalculator = load('src/components/ResaleCalculator.tsx', {
  '@/lib/calculator': {parseAmount},
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
function findBidInput(node) {
  if (!node || typeof node !== 'object') return;
  if (node.props?.id === 'auction-bid-amount') return node;
  for (const child of React.Children.toArray(node.props?.children)) {
    const found = findBidInput(child);
    if (found) return found;
  }
}
for (const [amount, total, profit, roi] of [
  ['8,000.50','$8,000.50','$6,999.50','+87.5%'],
  ['12000','$12,000.00','$3,000.00','+25.0%'],
  ['', '$0.00', '$15,000.00', '+0.0%'],
]) {
  findBidInput(calculatorTree()).props.onChange({target:{value:amount}});
  const result = renderToStaticMarkup(calculatorTree());
  for (const expected of [total,profit,roi]) assert.ok(result.includes(expected),expected);
}
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
 const {POST} = load('src/app/api/admin/import/route.ts', {
   '@/lib/import-batches': batchTools,
   '@/lib/publication': load('src/lib/publication.ts'),
   '@/utils/supabase/server': {createClient: async () => ({
     auth: {getUser: async () => ({data: {user: {id:'admin'}}})},
     from: () => ({select: () => ({eq: () => ({single: async () => ({data: {role:'admin'}})})})}),
   })},
   '@/utils/supabase/admin': {createAdminClient: () => ({from: () => ({insert: (rows) => {
     stored = rows[0]; return {select: () => ({single: async () => ({data: {id:'vehicle'},error:null})})};
   }})})},
 });
 const response = await POST({json: async () => ({batchId,vehicles:[{brand:'Test',model:'Car',year:2026,vin:'TEST',images:[]}]})});
 assert.equal(response.status,200);
 const result = await response.json();
 assert.equal(result.batchId,batchId);
 assert.equal(result.ok,1);
 assert.ok(stored.internal_notes.includes(`BATCH:${batchId} |`));
 assert.ok(stored.description.includes(`[${batchId}]`));
 const ranges=[];
 const rows=[...Array.from({length:1001},()=>({internal_notes:`BATCH:${batchId} | Puerto Rico`})),{internal_notes:'BATCH:MAN-PR-2025-01-01-ABCD | old'},{internal_notes:'unrelated'}];
 const query={select:()=>query,not:()=>query,order:()=>query,range:async(a,b)=>{ranges.push([a,b]);return {data:rows.slice(a,b+1),error:null};}};
 const list=await batchTools.listImportBatches({from:()=>query});
 assert.deepEqual(ranges,[[0,999],[1000,1999]]);
 assert.deepEqual(list,[{batch:batchId,count:1001},{batch:'MAN-PR-2025-01-01-ABCD',count:1}]);
 query.range=async()=>({data:null,error:new Error('database unavailable')});
 await assert.rejects(batchTools.listImportBatches({from:()=>query}),/database unavailable/);
 const ImportVehicles=load('src/components/admin/ImportVehicles.tsx',{'@/lib/import-batches':batchTools}).default;
 const importHtml=renderToStaticMarkup(React.createElement(ImportVehicles,{initialBatchId:batchId}));
 assert.ok(importHtml.includes(batchId));
 assert.ok(importHtml.includes('Lotes importados'));
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
