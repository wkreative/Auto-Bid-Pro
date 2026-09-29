const fs = require('node:fs');
const ts = require(process.cwd() + '/node_modules/typescript');
const assert = require('node:assert/strict');
function load(file, mocks = {}) {
 const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX } }).outputText;
 const module = {exports:{}};
 new Function('require','module','exports',code)(name => name in mocks ? mocks[name] : require(require.resolve(name, {paths:[process.cwd()]})),module,module.exports);
 return module.exports;
}
const {parseAmount} = load('src/lib/calculator.ts');
for (const [input, expected] of [['1,250.50',1250.5],['',0],['.',0],['1.2.3',0],['Infinity',0],[-5,0],['15000',15000]]) assert.equal(parseAmount(input),expected);
const React = require(process.cwd()+'/node_modules/react');
const {renderToStaticMarkup} = require(process.cwd()+'/node_modules/react-dom/server');
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
 console.log('PASS: calculator parsing, rendered totals/profit/ROI/break-even, zero investment; signup validation, normalization, confirmation, session and error paths.');
})().catch(e=>{console.error(e);process.exitCode=1});
