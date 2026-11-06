"""Random-interaction (monkey) test for thorakao-site-v6.html.
Usage: python thorakao-monkey.py thorakao-site-v6.html 120 desktop|mobile|reduced SEED
Clicks, keys, route changes, hostile text input, resizes and back-navigation; fails on page errors,
XSS, duplicate ids, DOM growth, leftover inert/overlays or horizontal overflow."""
import sys,os,random
from playwright.sync_api import sync_playwright
ARG=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:3000'
U=ARG if ARG.startswith(('http://','https://','file://')) else 'file://'+os.path.abspath(ARG)
N=int(sys.argv[2]) if len(sys.argv)>2 else 400
TEXTS=['','a','Nghệ','<script>alert(1)</script>','"><img src=x onerror=alert(1)>','😀😀😀','0901234567','x'*300,'a@b.co',"'; DROP TABLE users;--"]
KEYS=['Tab','Shift+Tab','Escape','Enter','Space','ArrowDown','ArrowUp','/','ArrowRight','Home','End']
SEL="button:visible, a[href]:visible, summary:visible, [role=tab]:visible, select:visible"
def run(seed,ctxargs,label):
    rnd=random.Random(seed);errs=[]
    with sync_playwright() as p:
        b=p.chromium.launch();ctx=b.new_context(**ctxargs);pg=ctx.new_page()
        pg.add_init_script("window.__alerts=0;window.alert=()=>{window.__alerts++}")
        pg.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)))
        pg.on('console',lambda m:errs.append('CONSOLE '+m.text) if m.type=='error' and 'ERR_' not in m.text and 'fonts.g' not in m.text else None)
        pg.goto(U);pg.wait_for_timeout(500);n0=pg.evaluate("document.querySelectorAll('*').length")
        for i in range(N):
            r=rnd.random()
            try:
                if r<.55:
                    els=pg.locator(SEL);c=els.count()
                    if c:els.nth(rnd.randrange(c)).click(timeout=600,no_wait_after=True)
                elif r<.70:pg.keyboard.press(rnd.choice(KEYS))
                elif r<.80:pg.evaluate("p=>{location.hash=p}",rnd.choice(['home','shop','scan','story','tips','contact','shop/dull','shop/saved','tips/3','tips/99','foo','','shop/zzz','home/routine']))
                elif r<.88:
                    ins=pg.locator("input:visible:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=file]), textarea:visible");c=ins.count()
                    if c:ins.nth(rnd.randrange(c)).fill(rnd.choice(TEXTS),timeout=600)
                elif r<.93:pg.mouse.wheel(0,rnd.choice([-1500,-400,400,1500,3000]))
                elif r<.96:pg.set_viewport_size({'width':rnd.choice([320,390,768,1024,1440]),'height':rnd.choice([700,900])})
                elif r<.98:pg.go_back(timeout=1500)
                else:pg.evaluate("document.querySelector('#sun,#yr')&&(document.querySelector('#yr').value=Math.floor(Math.random()*101),document.querySelector('#yr').dispatchEvent(new Event('input',{bubbles:true})))")
            except Exception as e:
                m=str(e).splitlines()[0]
                if not any(k in m for k in ('Timeout','not visible','detached','intercepts','outside of the viewport','Target page','not stable','disabled','closed')):errs.append('ACTION '+m[:120])
            pg.wait_for_timeout(15)
        pg.keyboard.press('Escape');pg.keyboard.press('Escape');pg.wait_for_timeout(300)
        st=pg.evaluate("""()=>({nodes:document.querySelectorAll('*').length,alerts:window.__alerts,ids:[...document.querySelectorAll('[id]')].map(e=>e.id).filter((x,i,a)=>a.indexOf(x)!=i),
          bagHidden:document.getElementById('bag').hidden,inertMain:document.querySelector('main').inert,openDialogs:document.querySelectorAll('dialog[open]').length,
          visiblePages:[...document.querySelectorAll('.page-view')].filter(e=>!e.hidden).length,over:document.documentElement.scrollWidth-innerWidth,hash:location.hash,
          activeViewH1:document.querySelectorAll('.page-view:not([hidden]) h1').length})""")
        if st['alerts']:errs.append('XSS alert fired')
        if st['nodes']>n0*2.5:errs.append(f"DOM growth {n0}->{st['nodes']}")
        if st['ids']:errs.append('dup ids '+str(st['ids']))
        if st['bagHidden'] and st['inertMain']:errs.append('main left inert while bag hidden')
        if st['visiblePages']!=1:errs.append('visible pages '+str(st['visiblePages']))
        if st['over']>1:errs.append('horizontal overflow '+str(st['over']))
        b.close()
    print(label,'seed',seed,'->',('OK' if not errs else 'ERRORS'),st if not errs else '');[print('   ',e) for e in sorted(set(errs))[:8]]
    return not errs
import sys as _s
mode=_s.argv[3];seed=int(_s.argv[4])
cfg={'desktop':{'viewport':{'width':1440,'height':900}},'mobile':{'viewport':{'width':390,'height':844},'has_touch':True,'is_mobile':True,'device_scale_factor':3,'user_agent':'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'},'reduced':{'viewport':{'width':1280,'height':800},'reduced_motion':'reduce'}}[mode]
ok=run(seed,cfg,mode)
print('MONKEY_PASS' if ok else 'MONKEY_FAIL')
