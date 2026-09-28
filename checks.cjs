// Logic checks in a minimal DOM double. These do not verify browser rendering.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
class Node {
  constructor(tag='div'){this.tagName=tag;this.children=[];this.dataset={};this.attrs={};this.listeners={};this.value='';this.textContent='';this.className='';this.classList={toggle:()=>{},add:()=>{}};}
  append(...items){this.children.push(...items)}
  replaceChildren(...items){this.children=items}
  setAttribute(k,v){this.attrs[k]=v}
  removeAttribute(k){delete this.attrs[k]}
  addEventListener(k,v){this.listeners[k]=v}
  focus(){}
  click(){assert.ok(!this.disabled,'Cannot click disabled control');this.listeners.click?.()}
}
const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
const ids={};for(const [,id]of html.matchAll(/\bid="([^"]+)"/g)){assert.ok(!ids[id],`Duplicate id ${id}`);ids[id]=new Node()}
ids['curriculum-month'].value='0';const workflow=new Node();
const all=n=>[n,...n.children.flatMap(all)];
const document={getElementById:id=>{assert.ok(ids[id],`Missing id ${id}`);return ids[id]},createElement:tag=>new Node(tag),createTextNode:text=>{const n=new Node('#text');n.textContent=text;return n},querySelector:s=>s==='.week-workflow'?workflow:all(ids['calendar-rows']).find(n=>String(n.dataset.day)===s.match(/data-day="(\d+)"/)?.[1])};
const context={document,window:{location:{href:''}},Intl,Date};vm.createContext(context);
for(const file of ['curriculum-data.js','demo-calendar-data.js','app.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),context,{filename:file});
const action=label=>{const b=ids['week-actions'].children.find(n=>n.textContent===label);assert.ok(b,`Missing action ${label}`);b.click()};
const role=r=>ids.role.listeners.change({target:{value:r}});
const pick=w=>ids['calendar-rows'].children[w].children[0].children[0].click();
const day=d=>all(ids['calendar-rows']).find(n=>n.dataset.day===d);
assert.equal(ids['calendar-rows'].children.length,5);
assert.equal(all(ids['calendar-rows']).filter(n=>n.dataset.day).length,30);
assert.equal(day(6).dataset.state,undefined,'Weekend cannot be ready');
assert.equal(day(14).dataset.state,'draft');
action('Submit for approval');assert.equal(ids['week-status'].dataset.state,'pending');
assert.ok(!ids['week-actions'].children.some(n=>n.textContent==='Approve week'),'Teacher cannot approve');
role('admin');action('Return with notes');assert.equal(ids['week-status'].dataset.state,'pending','Empty note cannot return plan');
ids.comment.value='Please specify the reading passage.';action('Return with notes');assert.equal(day(14).dataset.state,'returned');
assert.ok(ids['admin-note'].textContent.includes('reading passage'));
role('teacher');action('Resubmit for approval');role('admin');action('Approve week');
assert.equal(day(14).dataset.state,'approved');assert.equal(day(19).dataset.state,undefined);
day(14).click();assert.equal(ids['day-view'].hidden,false);assert.equal(ids['day-blocks'].children.filter(n=>n.tagName==='details').length,9,'Eight core blocks plus scheduled Gymnastics');
ids.back.click();assert.equal(ids['calendar-view'].hidden,false);
day(15).click();assert.equal(context.window.location.href,'exemplar-day.html','Example day opens the complete second-level page');
role('teacher');pick(3);action('Create weekly draft');assert.equal(day(21).dataset.state,'draft');
ids['curriculum-nav'].click();assert.equal(workflow.hidden,true);
ids['curriculum-month'].value='6';ids['curriculum-month'].listeners.change();assert.equal(ids['annual-month'].textContent,'March');
assert.equal(ids['annual-weeks'].children.length,4);assert.equal(ids['annual-events'].children.length,6);
const data=context.window.TE_CURRICULUM;
assert.equal(data.months.length,12);assert.equal(data.months.flatMap(m=>m.weeks).length,50);assert.equal(data.months.flatMap(m=>m.events).length,48);assert.equal(data.themes.length,34);
assert.ok(data.months.every(m=>m.monthly_theme===null));assert.ok(data.months.flatMap(m=>m.events).every(e=>e.starts_on===null));
assert.deepEqual(context.window.TE_CURRICULUM.months[0].weeks.map(w=>w.source_label).join('|'),data.months[0].weeks.map(w=>w.source_label).join('|'));
for(const file of ['index.html','app.js','curriculum-data.js','exemplar-day.html','exemplar-day.js'])assert.ok(!/[\u0400-\u04FF]/u.test(fs.readFileSync(path.join(__dirname,file),'utf8')),`Non-English UI text in ${file}`);
for(const [,asset]of html.matchAll(/(?:src|href)="([^"]+)"/g))if(!asset.startsWith('#'))assert.ok(fs.existsSync(path.join(__dirname,asset)),`Missing local asset ${asset}`);
const example=fs.readFileSync(path.join(__dirname,'exemplar-day.html'),'utf8');
for(const [,asset]of example.matchAll(/(?:src|href)="([^"]+)"/g))if(!asset.startsWith('#'))assert.ok(fs.existsSync(path.join(__dirname,asset)),`Missing example asset ${asset}`);
const exemplar=JSON.parse(fs.readFileSync(path.join(__dirname,'exemplar-day.json'),'utf8'));assert.equal(exemplar.blocks.length,8);assert.equal(exemplar.goals.length,3);assert.ok(exemplar.prep.some(x=>x.type==='Print'));
const exampleIds={};for(const [,id]of example.matchAll(/\bid="([^"]+)"/g)){assert.ok(!exampleIds[id],`Duplicate example id ${id}`);exampleIds[id]=new Node()}
const exampleDoc={getElementById:id=>{assert.ok(exampleIds[id],`Missing example id ${id}`);return exampleIds[id]},createElement:tag=>new Node(tag)};
const exampleContext={document:exampleDoc,window:{}};vm.createContext(exampleContext);
for(const file of ['exemplar-data.js','exemplar-day.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),exampleContext,{filename:file});
assert.equal(exampleIds['method-cards'].children.length,8);assert.equal(exampleIds['schedule-rows'].children.length,exemplar.schedule.length);assert.equal(exampleIds['prep-rows'].children.length,exemplar.prep.length);
console.log('PASS: source counts and null dates; English interface; local assets; calendar; teacher submission; required revision note; resubmission; administrator approval; weekend exclusion; day blocks; annual month selection. Browser layout was not tested.');
