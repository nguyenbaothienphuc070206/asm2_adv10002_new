"""Static markup check: nesting, duplicate ids, label/aria targets, alt text. Usage: python thorakao-static-check.py [index.html]"""
import sys,re,glob,os
from html.parser import HTMLParser
target=sys.argv[1] if len(sys.argv)>1 else 'index.html'
src=open(target,encoding='utf-8').read()
VOID={'meta','link','img','input','br','hr','source','area','base','col','embed','track','wbr','path','circle','rect'}
BLOCK={'div','ul','ol','form','h1','h2','h3','h4','h5','h6','details','table','section','article','header','footer','nav','aside','main','dialog','fieldset','figure'}
INTER={'button','a'}
class P(HTMLParser):
    def __init__(s):super().__init__();s.st=[];s.err=[];s.ids={};s.fors=[];s.refs=[]
    def handle_starttag(s,t,a):
        d=dict(a);ln=s.getpos()[0]
        if 'id' in d:s.ids[d['id']]=s.ids.get(d['id'],0)+1
        if t=='label' and 'for' in d:s.fors.append((d['for'],ln))
        for k in ('aria-controls','aria-labelledby','aria-describedby'):
            if k in d:s.refs.append((d[k],k,ln))
        if t=='img' and 'alt' not in d and 'data-img' not in d:s.err.append(f'L{ln}: img without alt')
        if t=='button' and 'type' not in d:s.err.append(f'L{ln}: button without type')
        stack_tags=[x[0] for x in s.st]
        if t in BLOCK and 'p' in stack_tags:s.err.append(f'L{ln}: <{t}> inside <p>')
        if t in INTER and any(x in INTER for x in stack_tags):s.err.append(f'L{ln}: <{t}> inside interactive')
        if t=='input' and d.get('type') not in ('hidden',) and not any(k in d for k in ('aria-label','id')) :s.err.append(f'L{ln}: input without id/label')
        if t not in VOID:s.st.append((t,ln))
    def handle_endtag(s,t):
        if t in VOID:return
        if not s.st:s.err.append(f'L{s.getpos()[0]}: stray </{t}>');return
        if s.st[-1][0]==t:s.st.pop()
        else:
            names=[x[0] for x in s.st]
            if t in names:
                while s.st and s.st[-1][0]!=t:
                    o=s.st.pop()
                    if o[0] not in ('p','li','option'):s.err.append(f'L{o[1]}: <{o[0]}> not closed before </{t}> (L{s.getpos()[0]})')
                s.st.pop()
            else:s.err.append(f'L{s.getpos()[0]}: stray </{t}>')
p=P();p.feed(src)
for t,l in p.st:p.err.append(f'L{l}: <{t}> never closed')
dups=[k for k,v in p.ids.items() if v>1]
if dups:p.err.append('duplicate ids: '+str(dups))
for f,l in p.fors:
    if f not in p.ids:p.err.append(f'L{l}: label for="{f}" has no target')
for r,k,l in p.refs:
    for i in r.split():
        if i not in p.ids:p.err.append(f'L{l}: {k}="{i}" has no target')
m=re.search(r'<script>(.*)</script>',src,re.S)
if m:
    js=m.group(1)
else:
    base=os.path.dirname(os.path.abspath(target))
    js='\n'.join(open(f,encoding='utf-8').read() for f in glob.glob(os.path.join(base,'src','**','*.js'),recursive=True))
need=set(re.findall(r"\$\('#([\w-]+)'\)",js))
dyn=set(re.findall(r'id="([\w-]+)"',js))
miss=sorted(need-set(p.ids)-dyn)
if miss:p.err.append('ids used in JS but not in static or dynamic HTML: '+str(miss))
print('\n'.join(p.err) if p.err else 'STATIC_OK')
