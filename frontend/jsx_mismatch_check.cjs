const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/YearlyPlannerPage.jsx');
const text = fs.readFileSync(file, 'utf8');
const regex = /<\/?([A-Za-z0-9_]+)([^>]*)>/g;
const selfclosing = new Set(['input','img','br','hr','meta','link','path','rect','circle','line','polygon','polyline','ellipse','stop']);
let match;
const stack = [];
let idx = 0;
while ((match = regex.exec(text))) {
  idx += 1;
  const isClose = match[0].startsWith('</');
  const name = match[1];
  const rest = match[2] || '';
  if (!isClose) {
    if (rest.trim().endsWith('/>') || selfclosing.has(name)) continue;
    stack.push({name, idx, pos: match.index, text: match[0]});
  } else {
    if (stack.length && stack[stack.length -1].name === name) {
      stack.pop();
    } else {
      console.log('Mismatch closing', name, 'at idx', idx, 'text', match[0]);
      console.log('Stack top', stack.length ? stack[stack.length-1] : null);
      break;
    }
  }
}
console.log('remaining stack length', stack.length);
if (stack.length) console.log('top remaining', stack[stack.length-1]);
