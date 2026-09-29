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
for(const value of ['$11,250.50','$3,749.50','$13,749.50','+33.3%']) assert.ok(html.includes(value),value);
html=renderToStaticMarkup(React.createElement(Calculator,{startingPrice:0,estimatedRepairCost:0,estimatedResaleValue:500}));
assert.ok(!html.includes('NaN')&&!html.includes('Infinity'));
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
 console.log('PASS: import uses and persists the displayed batch ID; counts across database pages; legacy batches; database errors; initial batch rendering.');
 console.log('PASS: calculator parsing, rendered totals/profit/ROI/break-even, zero investment; signup validation, normalization, confirmation, session and error paths.');
})().catch(e=>{console.error(e);process.exitCode=1});
