#!/usr/bin/env python3
"""Build the original Blue-group exemplar print pack from exemplar-day.json.
Requires reportlab. All artwork and story text in the output are original to this prototype.
"""
from __future__ import annotations
import json
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.utils import simpleSplit
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'print'; OUT.mkdir(exist_ok=True)
D=json.loads((ROOT/'exemplar-day.json').read_text())
FONT='/System/Library/Fonts/Supplemental/Arial.ttf'
BOLD='/System/Library/Fonts/Supplemental/Arial Bold.ttf'
pdfmetrics.registerFont(TTFont('ArialCustom',FONT))
pdfmetrics.registerFont(TTFont('ArialBoldCustom',BOLD))
pdfmetrics.registerFontFamily('ArialCustom',normal='ArialCustom',bold='ArialBoldCustom')
YELLOW=colors.HexColor('#EBC64F'); INK=colors.HexColor('#363333'); MUTED=colors.HexColor('#5A6769')
BLUE=colors.HexColor('#DDF2F5'); SKY=colors.HexColor('#9BCBD6'); PAPER=colors.HexColor('#F5F8FA')
GREEN=colors.HexColor('#E2F9DF'); LINE=colors.HexColor('#DDE4E6'); GOLD=colors.HexColor('#FFF3C9')
W,H=letter

S={
 'eyebrow':ParagraphStyle('eyebrow',fontName='ArialBoldCustom',fontSize=7.5,leading=10,textColor=MUTED,spaceAfter=8),
 'title':ParagraphStyle('title',fontName='ArialBoldCustom',fontSize=25,leading=29,textColor=INK,spaceAfter=10),
 'subtitle':ParagraphStyle('subtitle',fontName='ArialCustom',fontSize=11,leading=15,textColor=MUTED,spaceAfter=10),
 'h1':ParagraphStyle('h1',fontName='ArialBoldCustom',fontSize=16,leading=19,textColor=INK,spaceBefore=6,spaceAfter=10),
 'h2':ParagraphStyle('h2',fontName='ArialBoldCustom',fontSize=11.5,leading=14,textColor=INK,spaceBefore=11,spaceAfter=5),
 'body':ParagraphStyle('body',fontName='ArialCustom',fontSize=8.9,leading=13,textColor=INK,spaceAfter=5),
 'small':ParagraphStyle('small',fontName='ArialCustom',fontSize=7.5,leading=10,textColor=MUTED,spaceAfter=4),
 'step':ParagraphStyle('step',fontName='ArialCustom',fontSize=8.9,leading=13,textColor=INK,leftIndent=18,firstLineIndent=-17,spaceAfter=6),
 'table':ParagraphStyle('table',fontName='ArialCustom',fontSize=7.3,leading=9.8,textColor=INK),
 'tablehead':ParagraphStyle('tablehead',fontName='ArialBoldCustom',fontSize=7,leading=9,textColor=MUTED),
}

def p(s,style='body'):
 return Paragraph(escape(str(s)).replace('\n','<br/>'),S[style])

def brand_page(c,doc):
 c.saveState(); c.setFillColor(YELLOW); c.rect(0,H-9,W,9,stroke=0,fill=1)
 c.setFont('ArialBoldCustom',7.5);c.setFillColor(INK);c.drawString(42,H-28,'TINY EINSTEIN  /  TEACHER DAY PROTOTYPE')
 c.setStrokeColor(LINE);c.line(42,33,W-42,33)
 c.setFont('ArialCustom',7);c.setFillColor(MUTED)
 c.drawString(42,21,'Blue · 4–5 years  |  Tue, September 15, 2026  |  All About Me')
 c.drawRightString(W-42,21,f'{doc.page}')
 c.restoreState()

def block_story(b):
 out=[Table([[p(b['id'],'tablehead'),p(b['title'],'h2'),p(b['time'],'small')]],colWidths=[30,255,210],style=[('BACKGROUND',(0,0),(-1,-1),BLUE),('BOX',(0,0),(-1,-1),.4,LINE),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),6)])]
 out += [Spacer(1,6),Paragraph('<b>Goal.</b> '+escape(b['goal']),S['body']),Paragraph('<b>Before children begin.</b> '+escape(b['prepare']),S['body'])]
 for i,step in enumerate(b['steps'],1):out.append(Paragraph(f'<b>{i}.</b> '+escape(step),S['step']))
 out.append(Paragraph('<b>Teacher language:</b> '+escape(b['teacher_words']),S['body']))
 out.append(Paragraph('<b>Children do:</b> '+escape(b['child_action']),S['body']))
 out.append(Paragraph('<b>Notice:</b> '+escape(b['look_for']),S['body']))
 out.append(Paragraph('<b>Co-teacher:</b> '+escape(b['assistant']),S['body']))
 out.append(Paragraph('<b>Materials:</b> '+escape(b['materials']),S['body']))
 out.append(Spacer(1,13))
 return out

def make_guide():
 path=OUT/'teacher-guide.pdf'
 doc=SimpleDocTemplate(str(path),pagesize=letter,rightMargin=42,leftMargin=42,topMargin=44,bottomMargin=48,title='Blue Teaching Day | My choices, my voice',author='Tiny Einstein curriculum prototype')
 story=[Spacer(1,5),p('WEEK 3  /  ALL ABOUT ME  /  BLUE 4–5','eyebrow'),p('My choices, my voice','title'),p('Tuesday, September 15, 2026  ·  Complete content prototype · pedagogical review pending','subtitle')]
 intro=Table([[p('DAILY GUIDE','tablehead'),p('TEACHING METHOD','tablehead'),p('CHILD MATERIALS','tablehead')],[p('Time + sequence','table'),p('Eight fully written blocks','table'),p('Cards, 2 child pages, 4-page story','table')]],colWidths=[172,172,172])
 intro.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,-1),GOLD),('BOX',(0,0),(-1,-1),.5,LINE),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('LEFTPADDING',(0,0),(-1,-1),11)]));story += [intro,Spacer(1,12),p('Learning targets','h2')]
 for i,g in enumerate(D['goals'],1):story.append(Paragraph(f'<b>0{i}</b>  '+escape(g),S['body']))
 story += [Spacer(1,9),p('Today at a glance','h2')]
 rows=[[p('TIME','tablehead'),p('BLOCK / ROUTINE','tablehead'),p('TEACHER CUE','tablehead')]]
 for x in D['schedule']:
  rows.append([p(x['time'],'table'),p(x['title'],'table'),p(x['detail'],'table')])
 tab=Table(rows,colWidths=[69,178,269],repeatRows=1,hAlign='LEFT')
 st=[('BACKGROUND',(0,0),(-1,0),BLUE),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),7),('TOPPADDING',(0,0),(-1,-1),4),('BOTTOMPADDING',(0,0),(-1,-1),4),('LINEBELOW',(0,0),(-1,-1),.25,LINE)]
 for i,x in enumerate(D['schedule'],1):
  if x['block']=='context':st.append(('BACKGROUND',(0,i),(-1,i),colors.HexColor('#FAFBFB')))
 tab.setStyle(TableStyle(st));story += [tab,Spacer(1,10),p('The minute-by-minute splits inside Blue DOT windows are proposed for this example. The after-nap book revisit is four minutes within the 15:30–16:00 combined block.','small'),PageBreak()]
 story += [p('TEACHING METHOD  /  MORNING','eyebrow'),p('Arrival to Large Circle','h1')]
 for b in D['blocks'][:3]:story.append(KeepTogether(block_story(b)))
 story += [PageBreak(),p('TEACHING METHOD  /  PRACTICE & STORY','eyebrow'),p('Hands-on work and reading','h1')]
 for b in D['blocks'][3:5]:story.append(KeepTogether(block_story(b)))
 story += [PageBreak(),p('TEACHING METHOD  /  AFTERNOON','eyebrow'),p('Revisit, review, create','h1')]
 for b in [D['blocks'][6],D['blocks'][5],D['blocks'][7]]:story.append(KeepTogether(block_story(b)))
 story += [PageBreak(),p('PREPARATION  /  OBSERVATION','eyebrow'),p('Ready to teach','h1'),p('Print and supply checklist','h2')]
 rows=[[p('TASK','tablehead'),p('ITEM','tablehead'),p('QUANTITY','tablehead'),p('OWNER / WHEN','tablehead')]]
 for x in D['prep']:rows.append([p(x['type'],'table'),p(x['item'],'table'),p(x['quantity'],'table'),p(x['owner']+' · '+x['when'],'table')])
 t=Table(rows,colWidths=[54,150,150,162],repeatRows=1,hAlign='LEFT');t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),BLUE),('VALIGN',(0,0),(-1,-1),'TOP'),('LINEBELOW',(0,0),(-1,-1),.35,LINE),('TOPPADDING',(0,0),(-1,-1),7),('BOTTOMPADDING',(0,0),(-1,-1),7),('LEFTPADDING',(0,0),(-1,-1),6)]));story += [t,Spacer(1,16),p('Brief observations','h2')]
 for x in D['observation_prompts']:story.append(Paragraph('□  '+escape(x),S['body']))
 story += [Spacer(1,18),p('Editorial note','h2'),p('The weekly theme comes from the TE Curriculum Planner; Blue day windows come from Daily Operation Tasks. Internal time splits, method, original story, and child printables are a new prototype requiring pedagogical review. This file is not an administrator-approved weekly release.','small')]
 doc.build(story,onFirstPage=brand_page,onLaterPages=brand_page)
 return path

# All child pages are US Letter, single-sided. Safe margins leave room for classroom printers.
def child_page(c,label,n):
 c.setFillColor(YELLOW);c.rect(0,H-10,W,10,stroke=0,fill=1)
 c.setFillColor(MUTED);c.setFont('ArialBoldCustom',8);c.drawString(46,H-38,'TINY EINSTEIN  /  ALL ABOUT ME')
 c.setFont('ArialCustom',8);c.drawRightString(W-46,H-38,label)
 c.setStrokeColor(LINE);c.line(46,40,W-46,40)
 c.setFillColor(MUTED);c.setFont('ArialCustom',7);c.drawString(46,26,'Blue · 4–5 years  |  Original classroom printable')
 c.drawRightString(W-46,26,f'{n} / 7')

def line(c,x1,y1,x2,y2,color=INK,width=2):
 c.setStrokeColor(color);c.setLineWidth(width);c.line(x1,y1,x2,y2)

def icon(c,kind,x,y,size=68):
 c.saveState();c.translate(x,y); k=size/68;c.scale(k,k);c.setStrokeColor(INK);c.setFillColor(colors.white);c.setLineWidth(2.4)
 if kind=='READ':
  c.setFillColor(SKY);c.roundRect(5,16,28,35,4,stroke=1,fill=1);c.roundRect(35,16,28,35,4,stroke=1,fill=1);line(c,34,15,34,52)
  for yy in (40,32,24):line(c,11,yy,28,yy,width=1.2);line(c,41,yy,57,yy,width=1.2)
 elif kind=='BUILD':
  c.setFillColor(YELLOW)
  for xx,yy in [(7,12),(36,12),(21,38)]:c.roundRect(xx,yy,25,24,3,stroke=1,fill=1)
 elif kind=='DRAW':
  c.setFillColor(BLUE);c.roundRect(6,9,55,43,4,stroke=1,fill=1)
  c.setFillColor(colors.HexColor('#E28C7E'));c.saveState();c.translate(34,34);c.rotate(-38);c.roundRect(-5,-27,10,55,2,stroke=1,fill=1);c.setFillColor(colors.HexColor('#D6A778'));c.wedge(-5,25,5,38,0,180,stroke=1,fill=1);c.restoreState()
 elif kind=='MOVE':
  c.setFillColor(GREEN);c.ellipse(8,8,28,36,stroke=1,fill=1);c.ellipse(40,28,60,57,stroke=1,fill=1)
  for xx,yy in [(6,38),(15,42),(24,42),(41,62),(50,65),(59,62)]:c.circle(xx,yy,3.3,stroke=1,fill=1)
 else:
  c.setFillColor(GOLD);c.circle(34,34,26,stroke=1,fill=1);c.setFillColor(INK);c.setFont('ArialBoldCustom',35);c.drawCentredString(34,21,'?')
 c.restoreState()

def choice_card(c,x,y,w,h,name):
 c.setStrokeColor(colors.HexColor('#93B8BE'));c.setDash(3,3);c.setLineWidth(1);c.roundRect(x,y,w,h,11,stroke=1,fill=0);c.setDash()
 icon(c,name,x+(w-68)/2,y+h-98,68)
 c.setFillColor(INK);c.setFont('ArialBoldCustom',14 if name!='SOMETHING ELSE' else 11);c.drawCentredString(x+w/2,y+22,name)

def draw_name(c,y):
 c.setFillColor(INK);c.setFont('ArialBoldCustom',10);c.drawString(48,y,'MY NAME');line(c,112,y-1,535,y-1,color=MUTED,width=.9)

def simple_child(c,x,y,scale=1,shirt=SKY,skin=colors.HexColor('#B97553'),hair=colors.HexColor('#332B29')):
 c.saveState();c.translate(x,y);c.scale(scale,scale)
 c.setStrokeColor(INK);c.setLineWidth(2.2);c.setFillColor(shirt);c.roundRect(-31,8,62,79,16,stroke=1,fill=1)
 c.setFillColor(skin);c.circle(0,126,42,stroke=1,fill=1)
 c.setFillColor(hair);c.wedge(-42,113,42,170,0,180,stroke=0,fill=1)
 c.setFillColor(INK);c.circle(-14,128,2.2,stroke=0,fill=1);c.circle(14,128,2.2,stroke=0,fill=1)
 c.arc(-11,108,11,122,startAng=200,extent=140)
 line(c,-29,70,-62,28,INK,5);line(c,29,70,62,28,INK,5);line(c,-12,9,-23,-60,INK,5);line(c,12,9,23,-60,INK,5)
 c.restoreState()

def blocks(c,x,y,fallen=False):
 c.setStrokeColor(INK);c.setLineWidth(2)
 if fallen:positions=[(x,y),(x+52,y+15),(x+104,y-9),(x+125,y+42)]
 else:positions=[(x,y),(x+39,y),(x+20,y+39),(x+39,y+78)]
 fills=[YELLOW,SKY,GREEN,colors.HexColor('#F7B8AE')]
 for (bx,by),fill in zip(positions,fills):c.setFillColor(fill);c.roundRect(bx,by,42,42,4,stroke=1,fill=1)

def story_page(c,n,title,body,scene):
 child_page(c,'STORY  /  NIA TRIES AGAIN',n)
 c.setFillColor(INK);c.setFont('ArialBoldCustom',24);c.drawString(49,H-86,title)
 c.setFillColor(colors.HexColor('#F8FBFB'));c.roundRect(47,224,518,452,16,fill=1,stroke=0)
 c.setStrokeColor(colors.HexColor('#D9E4E5'));c.setLineWidth(1);c.roundRect(47,224,518,452,16,fill=0,stroke=1)
 # ground and a few room details
 c.setFillColor(colors.HexColor('#E9D3A9'));c.roundRect(68,245,475,35,8,fill=1,stroke=0)
 if scene==1:
  simple_child(c,182,375,1.35,shirt=colors.HexColor('#9BCBD6'))
  blocks(c,334,330)
 elif scene==2:
  simple_child(c,179,375,1.35,shirt=colors.HexColor('#9BCBD6'))
  blocks(c,309,323,True)
  c.setFillColor(YELLOW);c.setFont('ArialBoldCustom',20);c.drawString(320,465,'Oops!')
 elif scene==3:
  simple_child(c,170,375,1.22,shirt=colors.HexColor('#9BCBD6'))
  blocks(c,269,320)
  simple_child(c,450,375,1.1,shirt=colors.HexColor('#EAC27D'),skin=colors.HexColor('#D79E72'),hair=colors.HexColor('#493A32'))
  icon(c,'DRAW',395,276,64)
 elif scene==4:
  simple_child(c,192,377,1.28,shirt=colors.HexColor('#9BCBD6'))
  simple_child(c,424,377,1.28,shirt=colors.HexColor('#EAC27D'),skin=colors.HexColor('#D79E72'),hair=colors.HexColor('#493A32'))
  blocks(c,270,320)
  icon(c,'DRAW',337,300,54)
 c.setFillColor(INK);c.setFont('ArialBoldCustom',19)
 lines=simpleSplit(body,'ArialBoldCustom',19,490)
 yy=178
 for li in lines:c.drawString(60,yy,li);yy-=27
 c.setFillColor(MUTED);c.setFont('ArialCustom',9);c.drawString(60,75,'Pause and ask: '+['What might Nia try?','What could Nia do now?','What does Eli like to do?','What do you like to do?'][scene-1])
 c.showPage()

def make_child():
 path=OUT/'child-materials.pdf';c=canvas.Canvas(str(path),pagesize=letter,pageCompression=1)
 c.setTitle('All About Me | Original child materials');c.setAuthor('Tiny Einstein curriculum prototype')
 # p1: cards, cut lines
 child_page(c,'TEACHER CARDS  /  CUT OUT',1)
 c.setFillColor(INK);c.setFont('ArialBoldCustom',24);c.drawString(46,700,'What do you enjoy?')
 c.setFont('ArialCustom',10);c.setFillColor(MUTED);c.drawString(46,679,'Cut along the dashed lines. Show all choices, then invite pointing or naming.')
 xs=[50,226,402];ys=[435,217]
 names=['READ','BUILD','DRAW','MOVE','SOMETHING ELSE']
 for i,name in enumerate(names):choice_card(c,xs[i%3],ys[i//3],157,185,name)
 c.setFillColor(MUTED);c.setFont('ArialCustom',9);c.drawString(55,136,'One display set is enough. These cards can be reused during review.')
 c.showPage()
 # p2: child choice worksheet
 child_page(c,'CHILD PAGE  /  PRINT ONE PER CHILD',2)
 c.setFillColor(INK);c.setFont('ArialBoldCustom',25);c.drawString(46,700,'My Choice')
 draw_name(c,669)
 c.setFont('ArialCustom',12);c.drawString(48,636,'Circle one thing you like to do. You can choose something else.')
 for i,name in enumerate(names):
  xx=50+(i%5)*104
  c.setStrokeColor(LINE);c.roundRect(xx,499,94,118,9,stroke=1,fill=0)
  icon(c,name,xx+19,530,56)
  c.setFillColor(INK);c.setFont('ArialBoldCustom',7.3 if len(name)>9 else 9);c.drawCentredString(xx+47,509,name)
 c.setFillColor(INK);c.setFont('ArialCustom',12);c.drawString(48,468,'Draw yourself doing something you enjoy.')
 c.setStrokeColor(colors.HexColor('#AABEC2'));c.setLineWidth(1.2);c.roundRect(48,91,516,353,10,stroke=1,fill=0)
 c.showPage()
 # p3: self-portrait art sheet with integrated cut-out badges
 child_page(c,'ART PAGE  /  PRINT ONE PER CHILD',3)
 c.setFillColor(INK);c.setFont('ArialBoldCustom',24);c.drawString(46,703,'This Is Me!')
 draw_name(c,675)
 c.setFont('ArialCustom',11);c.drawString(48,647,'Draw yourself doing something you like. Add one activity badge below.')
 c.setStrokeColor(colors.HexColor('#AABEC2'));c.setLineWidth(1.2);c.roundRect(48,239,516,388,13,stroke=1,fill=0)
 c.setFillColor(INK);c.setFont('ArialCustom',11);c.drawString(48,210,'I enjoy');line(c,100,207,562,207,MUTED,.9)
 c.setFont('ArialBoldCustom',9);c.drawString(48,180,'CUT OUT ONE BADGE TO ADD TO YOUR PICTURE')
 for i,name in enumerate(names):
  xx=49+i*103;c.setStrokeColor(colors.HexColor('#91B6BC'));c.setDash(3,3);c.roundRect(xx,78,93,91,6,stroke=1,fill=0);c.setDash()
  icon(c,name,xx+25,105,44);c.setFillColor(INK);c.setFont('ArialBoldCustom',7.3 if len(name)>9 else 8);c.drawCentredString(xx+46,90,name)
 c.showPage()
 # p4-p7: original story
 story_page(c,4,'Nia Tries Again','Nia likes to build. She stacks four colorful blocks.',1)
 story_page(c,5,'The Tower Falls','The tower falls down. Nia takes a breath.',2)
 story_page(c,6,'Another Try','Nia builds again. Her friend Eli likes to draw.',3)
 story_page(c,7,'Different Things','They show each other what they made. Both ideas matter.',4)
 c.save();return path

if __name__=='__main__':
 for path in (make_guide(),make_child()):print(path, path.stat().st_size)
