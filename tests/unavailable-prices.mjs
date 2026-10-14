import fs from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
function load(file, mocks = {}, exposeParser = false) {
  const source = fs.readFileSync(file, 'utf8') + (exposeParser ? '\nexport { parseCSV };' : '');
  const code = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  const module = {exports:{}};
  new Function('require', 'module', 'exports', code)(name => name in mocks ? mocks[name] : require(name), module, module.exports);
  return module.exports;
}
const {parseCSV} = load('src/components/admin/ImportVehicles.tsx', {
  '@/lib/import-batches': {}, '@/utils/supabase/client': {},
}, true);
for (const value of ['', 'Not Available', 'Not Avaible', 'N/A']) {
  const rows = parseCSV(`Vin,Year,Make,Model,MMR\n1HGCM82633A004352,2025,Toyota,Corolla,${value}`);
  assert.equal(rows[0].starting_price, null, value);
}
for (const [value, expected] of [['1000',1000], ['17500',17500], ['"$17,500"',17500]]) {
  assert.equal(parseCSV(`Vin,Year,Make,Model,MMR\n1HGCM82633A004352,2025,Toyota,Corolla,${value}`)[0].starting_price, expected);
}
assert.equal(parseCSV('Vin,Year,Make,Model\n1HGCM82633A004352,2025,Toyota,Corolla')[0].starting_price, null);
const React = require('react');
const {renderToStaticMarkup} = require('react-dom/server');
const Calculator = load('src/components/ResaleCalculator.tsx', {'@/lib/calculator':load('src/lib/calculator.ts')}).default;
const html = renderToStaticMarkup(React.createElement(Calculator, {startingPrice:null}));
assert.ok(html.includes('Precio base de referencia: Not Available'));
assert.ok(html.includes('value=""'));
console.log('PASS: unavailable and missing CSV prices stay null, real prices including $1,000 remain unchanged, calculator shows Not Available.');
