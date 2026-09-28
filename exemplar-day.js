(() => {
  'use strict';
  const d=window.TE_EXEMPLAR;
  const $=id=>document.getElementById(id);
  const make=(tag,cls,content)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(content!==undefined)n.textContent=content;return n;};
  const para=(label,text)=>{const wrap=make('div','method-fact');wrap.append(make('strong','',label),make('p','',text));return wrap;};
  $('day-subtitle').textContent=`${d.date} · ${d.week} · ${d.group}`;
  $('source-note').textContent=d.source_note;
  d.goals.forEach((goal,i)=>{const li=make('li');li.append(make('span','goal-number',`0${i+1}`),make('p','',goal));$('day-goals').append(li);});
  d.schedule.forEach(row=>{
    const tr=make('tr',row.block==='context'?'context-row':'lesson-row');
    tr.append(make('td','schedule-time',row.time));
    const name=make('td');name.append(make('strong','',row.title));
    if(row.block!=='context')name.append(make('span','block-num',row.block));
    tr.append(name,make('td','schedule-detail',row.detail));$('schedule-rows').append(tr);
  });
  d.blocks.forEach(block=>{
    const card=make('details','method-card');if(block.id==='03')card.open=true;
    const summary=make('summary');
    summary.append(make('span','method-num',block.id));
    const title=make('span','method-title');title.append(make('strong','',block.title),make('small','',block.time));summary.append(title,make('span','method-arrow','⌄'));card.append(summary);
    const body=make('div','method-body');body.append(para('GOAL',block.goal),para('PREPARE',block.prepare));
    const steps=make('div','method-steps');steps.append(make('strong','','STEP BY STEP'));
    const list=make('ol');block.steps.forEach(s=>list.append(make('li','',s)));steps.append(list);body.append(steps);
    const facts=make('div','method-facts');facts.append(para('TEACHER CAN SAY',block.teacher_words),para('CHILDREN DO',block.child_action),para('LOOK FOR',block.look_for),para('CO-TEACHER',block.assistant));body.append(facts,para('MATERIALS',block.materials));card.append(body);$('method-cards').append(card);
  });
  d.prep.forEach(p=>{const tr=make('tr');[p.type,p.item,p.quantity,p.owner,p.when].forEach((v,i)=>tr.append(make('td',i===0?'prep-type':'',v)));$('prep-rows').append(tr);});
  d.observation_prompts.forEach((prompt,i)=>{const card=make('div','observation-card');card.append(make('span','goal-number',`0${i+1}`),make('p','',prompt));$('observation-prompts').append(card);});
})();
