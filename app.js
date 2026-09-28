(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const sampleThemes = [
    {name:'Healthy Habits', goal:'Recognize when we wash our hands.', intro:'When do our hands get messy?', items:'soap, a towel, water', question:'What do we need before a meal?'},
    {name:'My School', goal:'Name a classroom space and one way to play together.', intro:'Where do we read? Where do we play?', items:'the reading corner, the play area, a shelf', question:'What helps us play together?'},
    {name:'All About Me', goal:'Share a preference and listen to another child.', intro:'Today we will discover what each of us enjoys.', items:'a book, a ball, crayons', question:'What do you like to do? You can tell us or point.'},
    {name:'My Family', goal:'Talk about a caring person in a way that feels comfortable.', intro:'Who takes care of you?', items:'playing together, reading, going for a walk', question:'What do you enjoy doing together?'},
    {name:'Welcome, Fall', goal:'Notice and describe a sign of fall.', intro:'What has changed on our walk?', items:'a leaf, a tree, rain', question:'What do you notice about this leaf?'}
  ];
  // Calendar theme order comes from the source. Teaching scripts remain examples.
  const curriculum=window.TE_CURRICULUM;
  const themes=[sampleThemes[1],sampleThemes[3],sampleThemes[2],sampleThemes[0],sampleThemes[4]].map((theme,i)=>({...theme,name:curriculum.months[0].weeks[i].source_label}));
  // Demonstration-only bookings and child names. Source event dates remain unconfirmed.
  const demo=window.TE_DEMO_CALENDAR;
  const events=Object.fromEntries(Object.entries(demo.events).map(([day,entries])=>[day,[...entries]]));
  demo.birthdays.forEach(child=>(events[child.day]??=[]).push({kind:'birthday',name:`Birthday · ${child.name} (${child.group})`}));
  const closedDays=new Set(demo.closedDays);
  const states = {empty:'Not started',draft:'Draft',pending:'In review',returned:'Needs revision',approved:'Approved'};
  const plans = ['approved','approved','draft','empty','empty'];
  const notes = Array(5).fill('');
  let selectedWeek=2, selectedDay=null, role='teacher', view='calendar';
  const make=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const dateFor=(week,weekday)=>new Date(2026,7,30+week*7+weekday);
  const dateFormat=(date,options={month:'short',day:'numeric'})=>new Intl.DateTimeFormat('en-US',options).format(date);
  const workday=day=>{const d=new Date(2026,8,day);return d.getDay()!==0&&d.getDay()!==6&&!closedDays.has(day);};
  const setStatus=(n,state,ready=false)=>{n.dataset.state=state;n.textContent=ready&&state==='approved'?'✓ Plan ready':states[state];};
  function button(text,handler,primary=false){const b=make('button','button'+(primary?' primary':''),text);b.type='button';b.addEventListener('click',handler);return b;}
  function eventChip(e){const n=make('span','event');n.dataset.kind=e.kind;if(e.time)n.append(make('time','',e.time));n.append(document.createTextNode(e.name));return n;}
  function showView(next){
    view=next;
    ['calendar','packet','day','curriculum'].forEach(v=>$(v+'-view').hidden=v!==next);
    ['calendar','packet','curriculum'].forEach(v=>{const n=$(v+'-nav');n.classList.toggle('active',v===next);if(v===next)n.setAttribute('aria-current','page');else n.removeAttribute('aria-current');});
    document.querySelector('.week-workflow').hidden=next==='curriculum';
    $('page-title').textContent={calendar:'Your teaching calendar',packet:'Your weekly packet',day:'Your teaching day',curriculum:'Your curriculum, connected'}[next];
    if(next==='packet')renderPacket();
  }
  function changeState(next){
    const current=plans[selectedWeek];
    const permitted=role==='teacher'?((current==='empty'&&next==='draft')||(['draft','returned'].includes(current)&&next==='pending')):(current==='pending'&&['approved','returned'].includes(next));
    if(!permitted)return;
    if(next==='returned'){
      const comment=$('comment').value.trim();
      if(!comment){$('feedback').textContent='Add revision notes before returning this packet.';$('comment').focus();return;}
      notes[selectedWeek]=comment;
    }
    if(next==='approved')notes[selectedWeek]='';
    plans[selectedWeek]=next;$('comment').value='';
    renderCalendar();renderWorkflow();
    if(view==='day')showDay(selectedDay,selectedWeek,false);
    if(view==='packet')renderPacket();
    $('feedback').textContent={approved:'Preview: approved. Working days now show “Plan ready”.',pending:'Preview: packet submitted for administrator review.',returned:'Preview: packet returned with revision notes.',draft:'Preview: sample draft created. Review each day before submission.'}[next];
  }
  function renderWorkflow(){
    const state=plans[selectedWeek];
    $('week-title').textContent=`Week ${selectedWeek+1} · ${themes[selectedWeek].name}`;
    setStatus($('week-status'),state);
    const due=dateFor(selectedWeek,-3);
    $('week-deadline').textContent=`${dateFormat(dateFor(selectedWeek,1))}–${dateFormat(dateFor(selectedWeek,5))} · Submit by Thursday, ${dateFormat(due)}`;
    $('admin-note').hidden=!notes[selectedWeek];$('admin-note').textContent=notes[selectedWeek]?'Administrator: '+notes[selectedWeek]:'';
    $('comment-label').hidden=!(role==='admin'&&state==='pending');
    $('feedback').textContent='';
    const actions=$('week-actions');actions.replaceChildren();
    if(state!=='empty')actions.append(button('Review packet',()=>showView('packet')));
    if(role==='teacher'&&state==='empty')actions.append(button('Create weekly draft',()=>changeState('draft'),true));
    if(role==='teacher'&&['draft','returned'].includes(state))actions.append(button(state==='returned'?'Resubmit for approval':'Submit for approval',()=>changeState('pending'),true));
    if(role==='admin'&&state==='pending')actions.append(button('Approve week',()=>changeState('approved'),true),button('Return with notes',()=>changeState('returned')));
    if(role==='teacher'&&state==='pending')actions.append(make('p','action-hint','Awaiting administrator review.'));
    if(role==='admin'&&['empty','draft','returned'].includes(state))actions.append(make('p','action-hint','Waiting for the teacher to submit this version.'));
  }
  function renderCalendar(){
    const rows=$('calendar-rows');rows.replaceChildren();
    for(let w=0;w<5;w++){
      const tr=make('tr'),th=make('th','week-cell');th.scope='row';
      const pick=make('button','week-pick');pick.type='button';pick.setAttribute('aria-pressed',String(w===selectedWeek));
      pick.append(make('span','week-number',`WEEK ${w+1}`),make('span','week-theme',themes[w].name));
      const state=make('span','status');setStatus(state,plans[w]);pick.append(state);
      pick.addEventListener('click',()=>{selectedWeek=w;$('comment').value='';renderCalendar();renderWorkflow();});th.append(pick);tr.append(th);
      for(let d=0;d<7;d++){
        const date=dateFor(w,d),day=date.getDate(),current=date.getMonth()===8;
        const td=make('td','day-cell'+([0,6].includes(d)?' weekend':'')+(!current?' outside':''));
        const b=make('button','day');b.type='button';b.disabled=!current;
        const top=make('span','day-date');top.append(make('span','',String(day)));
        if(!current)top.append(make('span','other-month',dateFormat(date,{month:'short'})));
        if(current&&d===4){const due=make('span','due-label','PLAN DUE');due.title='Submit next week’s packet';top.append(due);}
        b.append(top);const list=make('span','events');if(current)(events[day]||[]).forEach(e=>list.append(eventChip(e)));b.append(list);if(current&&day===15&&w===2)b.append(make('span','exemplar-marker','Complete day example →'));
        if(current&&workday(day)){b.dataset.state=plans[w];const s=make('span','status');setStatus(s,plans[w],true);b.append(s);}
        if(current&&!workday(day))b.append(make('span','closed-label',closedDays.has(day)?'Center closed':'Weekend'));
        if(current){
          b.dataset.day=day;
          const planLabel=workday(day)?(plans[w]==='approved'?'Plan ready':states[plans[w]]):'No teaching plan required';
          b.setAttribute('aria-label',`${dateFormat(date,{weekday:'long',month:'long',day:'numeric'})}. ${(events[day]||[]).map(e=>[e.time,e.name].filter(Boolean).join(' ')).join('. ')}. ${planLabel}.${d===4?' Submit next week’s packet today.':''}`);
          b.addEventListener('click',()=>{if(day===15&&w===2)window.location.href='exemplar-day.html';else showDay(day,w);});
        }
        td.append(b);tr.append(td);
      }
      rows.append(tr);
    }
  }
  function renderPacket(){
    $('packet-title').textContent=`Week ${selectedWeek+1} · ${themes[selectedWeek].name}`;
    const container=$('packet-days');container.replaceChildren();
    for(let d=1;d<=5;d++){
      const date=dateFor(selectedWeek,d),inMonth=date.getMonth()===8;
      const b=make('button','packet-day');b.type='button';
      b.append(make('span','small-label',dateFormat(date,{weekday:'long'})),make('strong','',dateFormat(date)));
      if(inMonth&&workday(date.getDate())){const s=make('span','status');setStatus(s,plans[selectedWeek],true);b.append(s,make('span','',date.getDate()===15&&selectedWeek===2?'Open complete day example →':plans[selectedWeek]==='empty'?'Plan not started':'Open teaching plan →'));}
      else {b.classList.add('closed');b.append(make('span','',inMonth?'Center closed':'Outside this month’s preview'));}
      b.disabled=!inMonth;
      if(inMonth)b.addEventListener('click',()=>{if(date.getDate()===15&&selectedWeek===2)window.location.href='exemplar-day.html';else showDay(date.getDate(),selectedWeek);});
      container.append(b);
    }
  }
  function addBlock(name,time,goal,steps,materials,assistant){
    const box=make('details','block'),summary=make('summary','',name);summary.append(make('span','',time));
    const body=make('div','block-content');
    body.append(make('h3','','LEARNING GOAL'),make('p','',goal),make('h3','','PREPARATION'),make('p','','Check supplies and arrange the space before the children begin.'),make('h3','','STEP BY STEP'));
    const list=make('ol');steps.forEach(s=>list.append(make('li','',s)));body.append(list,make('h3','','CO-TEACHER'),make('p','',assistant));
    const m=make('div','material-box');m.append(make('h3','','MATERIALS & PREPARATION'),make('p','',materials));body.append(m);
    box.append(summary,body);$('day-blocks').append(box);
  }
  function showDay(day,week,moveFocus=true){
    selectedDay=day;selectedWeek=week;renderWorkflow();showView('day');
    const t=themes[week],s=plans[week];
    $('day-title').textContent=dateFormat(new Date(2026,8,day),{weekday:'long',month:'long',day:'numeric'});
    $('day-context').textContent=`WEEK ${week+1} · BLUE GROUP · 4–5 YEARS`;
    $('day-theme').textContent=`${t.name} · Sample teaching content; durations are approximate.`;
    if(workday(day))setStatus($('day-status'),s,true);else{$('day-status').dataset.state='empty';$('day-status').textContent='Non-teaching day';}
    const dayEvents=$('day-events');dayEvents.replaceChildren();(events[day]||[]).forEach(e=>dayEvents.append(eventChip(e)));
    const blocks=$('day-blocks');blocks.replaceChildren();
    if(moveFocus)$('back').focus({preventScroll:true});
    if(!workday(day)){blocks.append(make('p','sample-note','No teaching plan is needed for this day.'));return;}
    if(s==='empty'){blocks.append(make('p','sample-note','Start a weekly draft to prepare this day’s teaching plan.'));return;}
    addBlock('01 · Socializing','During arrival','Join a shared activity.',[
      'Greet each child by name and offer a calm activity to choose from.',
      'Model a simple invitation: “May I join you?” Help the child approach a peer.',
      'Give a gentle warning before the transition. Put materials away together and get ready to move.'
    ],'Materials for the chosen activity and a clearly marked place to put them away.','Welcome arriving children and support those who have not joined an activity.');
    addBlock('02 · P.E.','5–7 minutes','Repeat a simple sequence of movements.',[
      'Clear the area. Show children how to stand with enough space around them.',
      'Model marching in place, reaching up, and lowering the arms. Let children follow at a comfortable pace.',
      'Finish with a calm movement and invite the group to sit in a circle.'
    ],'Clear floor space. No additional equipment is needed for this example.','Model movements alongside the children and help them find their space.');
    addBlock('03 · Large Circle','Up to 20 minutes',t.goal,[
      `Gather the children in a circle. Show pictures of ${t.items}.`,
      `Say: “${t.intro}” Pause so children can look and respond.`,
      `Ask: “${t.question}” Accept a spoken answer or a gesture.`,
      'If a child needs support, offer two pictures to choose from. Summarize the responses and explain the next hands-on activity.'
    ],'LC-01: one set of theme picture cards for the class. The actual images still need to be prepared.','Keep cards visible and support children who need help participating.');
    addBlock('04 · Practice / Small Group','10–15 minutes','Apply an idea from the morning circle.',[
      'Lay out the same theme cards. Demonstrate one simple action with them.',
      'Invite each child to choose a picture and explain the choice or point to an answer.',
      'Offer a short follow-up question. Collect the cards and note what to revisit during Review.'
    ],'LC-01 or a duplicate set for the small group. This example does not require an individual worksheet.','Lead the agreed activity with the other children while the small group works.');
    addBlock('05 · Book Time','Before nap · About 10 minutes','Listen to a short text.',[
      'Show the cover of the book selected in advance and introduce the title.',
      'Read the chosen passage, allowing time to look at the illustrations.',
      'Close calmly and move into the pre-nap routine.'
    ],'A book and a specific passage must be selected for the real packet.','Help children settle comfortably.');
    const enrichment=(events[day]||[]).filter(e=>['lesson','special','field-trip'].includes(e.kind));
    if(enrichment.length)addBlock('Calendar activity · Event / Enrichment','As scheduled','Participate in the scheduled activity.',[
      'Today: '+enrichment.map(e=>[e.time,e.name].filter(Boolean).join(' · ')).join('; ')+'.',
      'Confirm the location, activity leader, and supplies. Prepare the group before the activity begins.',
      'Help children transition back to their next activity afterwards.'
    ],'Activity leader’s supplies and classroom preparation depend on the specific event.','Accompany the group and support transitions.');
    addBlock('06 · Review / Small Circle','15–20 minutes','Revisit the morning theme.',[
      `Show the familiar picture cards: ${t.items}.`,
      `Ask: “What did we notice or talk about today?” Revisit the question: “${t.question}”`,
      'Invite children to respond with an action or by choosing a card. Summarize what the group remembered.'
    ],'Reuse the morning LC-01 picture-card set.','Support participation without answering for the child.');
    addBlock('07 · Book Time','After nap · Duration to be confirmed','Return to familiar ideas through a book.',[
      'Open the book to a familiar illustration from the earlier reading.',
      'Invite children to point to or name something they recognize.',
      'Finish by rereading a short passage.'
    ],'The same book. Page numbers must be specified in the real packet.','Support children who are joining after nap.');
    addBlock('08 · Art','Up to 20 minutes','Express an idea from the theme through drawing.',[
      `Hand out paper and crayons. Invite children to draw something they remember about “${t.name}”.`,
      'Demonstrate how to use the materials while letting each child choose what to draw.',
      'Invite children to share their work if they wish. Collect and put away the materials together.'
    ],'One sheet of paper per child, crayons for each table, and a place to display work.','Distribute supplies and help with cleanup.');
    blocks.append(make('p','sample-note','Scenario preview only. This is not yet a complete printable teaching packet.'));
  }
  $('calendar-nav').addEventListener('click',()=>{showView('calendar');renderCalendar();});
  $('packet-nav').addEventListener('click',()=>showView('packet'));
  $('curriculum-nav').addEventListener('click',()=>showView('curriculum'));
  curriculum.months.forEach((month,i)=>{const option=make('option','',month.name);option.value=i;$('curriculum-month').append(option);});
  function renderAnnual(){
    const month=curriculum.months[Number($('curriculum-month').value)];
    $('annual-month').textContent=month.name;$('annual-weeks').replaceChildren();$('annual-events').replaceChildren();
    month.weeks.forEach(week=>{const row=make('div','annual-week');row.append(make('span','week-number',`WEEK ${week.position}`),make('strong','',week.source_label));$('annual-weeks').append(row);});
    month.events.forEach(event=>{const row=make('li','',event.source_label);if(event.explicit_age_group==='blue')row.append(make('span','source-group','Blue group'));$('annual-events').append(row);});
  }
  $('curriculum-month').addEventListener('change',renderAnnual);
  const birthdayList=$('birthday-list');
  demo.birthdays.forEach(child=>{const item=make('div','birthday-item');item.append(make('strong','',`Sep ${child.day}`),make('span','',child.name),make('small','',child.group));birthdayList.append(item);});
  curriculum.months[0].events.forEach(event=>{const kind=event.source_label.includes('No School')?'holiday':event.source_label.includes('Field Trip')?'tour':'special';$('undated-events').append(eventChip({kind,name:event.source_label}));});
  $('back').addEventListener('click',()=>{showView('calendar');renderCalendar();const b=document.querySelector(`[data-day="${selectedDay}"]`);if(b)b.focus({preventScroll:true});});
  $('role').addEventListener('change',e=>{role=e.target.value;$('comment').value='';renderWorkflow();});
  renderCalendar();renderWorkflow();renderAnnual();
})();
