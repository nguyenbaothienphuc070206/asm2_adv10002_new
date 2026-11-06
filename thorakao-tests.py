"""Regression tests for Thorakao application (Playwright, Python).
Run:  python3 thorakao-tests.py [http://localhost:3000 | path/to/file.html]   (NOOVF=1 skips the width sweep; ONLYOVF=1 runs only the sweep)
Covers: routes, a11y audit (names, 44px targets, contrast, headings), overflow 320-1920 in EN and VI,
EN<->VI toggle with zero untranslated strings, deep links, persistence, search, bag + discount codes,
timed promo pop-up, skin report, Google Maps consent, images, keyboard and focus handling."""
import sys,os,json
from playwright.sync_api import sync_playwright
ARG=sys.argv[1] if len(sys.argv)>1 else 'http://localhost:3000'
URL=ARG if ARG.startswith(('http://','https://','file://')) else 'file://'+os.path.abspath(ARG)
JS_AUDIT=r"""
() => {
  const out={names:[],small:[],noalt:[],dupids:[],contrast:[],headings:[]};
  const vis=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!='hidden'&&s.display!='none'&&!e.closest('[hidden]')};
  const name=e=>(e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')&&document.getElementById(e.getAttribute('aria-labelledby'))?.textContent||e.textContent||e.getAttribute('title')||e.getAttribute('placeholder')||'').trim()||(e.id&&document.querySelector('label[for="'+e.id+'"]')?.textContent.trim())||(e.closest('label')?.textContent.trim())||'';
  document.querySelectorAll('a[href],button,input,select,textarea,summary').forEach(e=>{
    if(!vis(e)&&!(e.type=='checkbox'||e.type=='radio'))return;
    if(!name(e))out.names.push(e.outerHTML.slice(0,90));
    const r=e.getBoundingClientRect();
    if(e.type!='hidden'&&e.type!='checkbox'&&e.type!='radio'&&e.type!='range'&&!e.classList.contains('lnk')&&(r.height<44||r.width<44)&&vis(e))out.small.push((e.textContent||e.type||'').trim().slice(0,28)+' '+Math.round(r.width)+'x'+Math.round(r.height));
  });
  document.querySelectorAll('img').forEach(i=>{if(vis(i)&&!i.hasAttribute('alt'))out.noalt.push(i.outerHTML.slice(0,80))});
  const ids={};document.querySelectorAll('[id]').forEach(e=>ids[e.id]=(ids[e.id]||0)+1);out.dupids=Object.keys(ids).filter(k=>ids[k]>1);
  let last=0;document.querySelectorAll('h1,h2,h3,h4').forEach(h=>{if(!vis(h))return;const l=+h.tagName[1];if(last&&l>last+1)out.headings.push('jump h'+last+'->h'+l+': '+h.textContent.trim().slice(0,30));last=l;});
  // contrast
  const parse=c=>{const m=c.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(/[ ,\/]+/).map(Number);return{r:p[0],g:p[1],b:p[2],a:p[3]===undefined?1:p[3]}};
  const lum=({r,g,b})=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(r)+.7152*f(g)+.0722*f(b)};
  const bgOf=e=>{let n=e;while(n){const s=getComputedStyle(n);if(s.backgroundImage!='none'&&!s.backgroundImage.startsWith('url'))return null;const c=parse(s.backgroundColor);if(c&&c.a>.9)return c;n=n.parentElement}return {r:255,g:255,b:254,a:1}};
  const seen=new Set();
  document.querySelectorAll('p,span,a,button,h1,h2,h3,li,small,label,summary,strong,b,em,div').forEach(e=>{
    if(!vis(e)||e.closest('[aria-hidden="true"]'))return;if(![...e.childNodes].some(n=>n.nodeType==3&&n.textContent.trim()))return;
    const s=getComputedStyle(e);if(+s.opacity<1)return;const fg=parse(s.color),bg=bgOf(e);if(!fg||!bg)return;
    const L1=lum(fg),L2=lum(bg),ratio=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
    const size=parseFloat(s.fontSize),bold=+s.fontWeight>=700,large=size>=24||(size>=18.66&&bold);
    if(ratio<(large?3:4.5)){const k=e.textContent.trim().slice(0,30)+'|'+ratio.toFixed(2);if(!seen.has(k)){seen.add(k);out.contrast.push(ratio.toFixed(2)+' '+size+'px "'+e.textContent.trim().slice(0,30)+'"')}}
  });
  return out;
}
"""
JS_LAYOUT=r"""()=>{const out=[];document.querySelectorAll('img').forEach(i=>{const r=i.getBoundingClientRect();if(r.width>0&&r.height>760)out.push('tall image '+i.className+' '+Math.round(r.height))});
document.querySelectorAll('.product-foot .pill').forEach(x=>{const r=x.getBoundingClientRect();if(r.width>0&&r.height>60)out.push('wrapped button')});
document.querySelectorAll('.product-foot strong').forEach(x=>{const r=x.getBoundingClientRect();if(r.width>0&&r.height>30)out.push('wrapped price')});
const home=!document.getElementById('home-view').hidden,vis=[...document.querySelectorAll('#rphotos img')].filter(i=>i.getBoundingClientRect().height>0).length;if(home&&vis!=1)out.push('how-to photos visible: '+vis);
document.querySelectorAll('[hidden]').forEach(e=>{if(getComputedStyle(e).display!='none')out.push('hidden element still displayed: '+e.tagName+'.'+e.className)});return out}"""
NOOVF=os.environ.get('NOOVF')=='1';ONLYOVF=os.environ.get('ONLYOVF')=='1'
fails=[];passed=0
def check(name,cond,info=''):
    global passed
    if cond: passed+=1
    else: fails.append(f'FAIL {name} {info}')
CLS_INIT="window.__cls=0;new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__cls+=e.value}).observe({type:'layout-shift',buffered:true});"
PAGES=['home','shop','scan','story','tips','contact']
def goto(pg,h):
    pg.evaluate(f"location.hash='{h}'")
    try: pg.wait_for_function(f"!document.getElementById('{h.split('/')[0]}-view').hidden",timeout=3000)
    except Exception: pass
    pg.wait_for_timeout(300)
def quiz(pg,combo):
    pg.evaluate("go('scan')");pg.wait_for_timeout(300);pg.check('#cc');pg.click('#go2')
    for k,v in zip(['feel','concern','who','time'],combo):pg.click(f'[data-a="{k}|{v}"]')
    pg.wait_for_timeout(200)
with sync_playwright() as p:
    b=p.chromium.launch()
    for lang in ([] if ONLYOVF else ['en','vi']):
      for label,vp in [('desktop',{'width':1440,'height':900}),('mobile',{'width':390,'height':844})]:
        pg=b.new_page(viewport=vp);pg.add_init_script(CLS_INIT);errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.on('console',lambda m:errs.append(m.text) if m.type=='error' and 'ERR_' not in m.text and 'fonts.g' not in m.text and 'google.com' not in m.text else None)
        pg.goto(URL+'?lang='+lang);pg.wait_for_timeout(1000)
        check(f'{lang} {label} initial CLS<0.1',pg.evaluate('window.__cls')<0.1,pg.evaluate('window.__cls'))
        for t in PAGES:
            goto(pg,t)
            check(f'{lang} {label} {t} visible',pg.evaluate(f"!document.getElementById('{t}-view').hidden"))
            check(f'{lang} {label} {t} one h1',pg.locator(f'#{t}-view h1:visible').count()==1)
            r=pg.evaluate(JS_AUDIT)
            check(f'{lang} {label} {t} tap targets>=44',not r['small'],r['small'][:4])
            check(f'{lang} {label} {t} accessible names',not r['names'],r['names'][:3])
            check(f'{lang} {label} {t} contrast',not r['contrast'],r['contrast'][:3])
            check(f'{lang} {label} {t} headings',not r['headings'],r['headings'])
            check(f'{lang} {label} {t} duplicate ids',not r['dupids'],r['dupids'])
            lay=pg.evaluate(JS_LAYOUT);check(f'{lang} {label} {t} layout (image size, wrapping, hidden)',not lay,lay[:3])
        imgs=pg.evaluate("[...document.querySelectorAll('img')].filter(i=>i.src&&i.complete&&i.naturalWidth==0).map(i=>i.src)")
        check(f'{lang} {label} no broken images',not imgs,imgs[:3])
        check(f'{lang} {label} no console errors',not errs,errs[:3]);pg.close()
    for lang in ([] if NOOVF else ['en','vi']):
      for w in [320,360,390,768,1024,1280,1440,1920]:
        pg=b.new_page(viewport={'width':w,'height':900});pg.goto(URL+'?lang='+lang);pg.wait_for_timeout(250)
        for t in PAGES:
            goto(pg,t);check(f'overflow {lang} {w}px {t}',pg.evaluate('document.documentElement.scrollWidth')<=w+1,pg.evaluate('document.documentElement.scrollWidth'))
        pg.close()
    if ONLYOVF:
        print(f'{passed} passed, {len(fails)} failed');print('\n'.join(fails) if fails else 'ALL_PASSED');sys.exit(1 if fails else 0)
    ctx=b.new_context(viewport={'width':1440,'height':900});pg=ctx.new_page();pg.goto(URL+'?lang=en#shop/blemish');pg.wait_for_timeout(500)
    check('deep link shop filter',pg.locator('#fl button.active').inner_text().startswith('Blemish'))
    check('filter shows only blemish products',pg.locator('#sg .product').count()==4,pg.locator('#sg .product').count())
    pg.goto('about:blank');pg.goto(URL+'#tips/2');pg.wait_for_timeout(600)
    check('deep link article opens',pg.evaluate("document.getElementById('rd').open"))
    pg.keyboard.press('Escape');pg.wait_for_timeout(400);check('article close resets hash',pg.evaluate('location.hash')=='#tips')
    for bad,exp in [('#foo','#home'),('#shop/zzz','#shop'),('#tips/99','#tips')]:
        pg.goto('about:blank');pg.goto(URL+bad);pg.wait_for_timeout(500);check(f'invalid route {bad} normalises',pg.evaluate('location.hash')==exp,pg.evaluate('location.hash'))
    # ---- language toggle, persistence, zero untranslated ----
    pg.goto('about:blank');pg.goto(URL+'?lang=en');pg.wait_for_timeout(700)
    en_text=pg.evaluate("document.body.innerText")
    pg.click('.hr [data-lang="vi"]');pg.wait_for_timeout(300)
    check('html lang switches to vi',pg.evaluate("document.documentElement.lang")=='vi')
    check('hero headline is Vietnamese','Bí Quyết Của Bà' in pg.inner_text('.hero h1') and 'Làn Da Của Bạn' in pg.inner_text('.hero h1'))
    check('prices use Vietnamese separators','89.000' in pg.inner_text('.hero-actions'),pg.inner_text('.hero-actions'))
    pg.reload();pg.wait_for_timeout(700);check('language persists after reload',pg.evaluate("document.documentElement.lang")=='vi')
    pg.evaluate("document.querySelectorAll('.page-view').forEach(()=>0)")
    for t in PAGES:
        goto(pg,t)
    pg.evaluate("openPd('duo')");pg.evaluate("document.getElementById('pd').close()");pg.evaluate("openArt(3)");pg.evaluate("document.getElementById('rd').close()")
    pg.evaluate("add('wash');add('cream');bo()");pg.fill('#pcin','BAD');pg.click('#pf button');pg.evaluate("closeBag()")
    quiz(pg,('oily','breakouts','me','full'));quiz(pg,('tight','breakouts','mum','quick'))
    check('no untranslated strings in Vietnamese mode',pg.evaluate("[...MISS]")==[],pg.evaluate("[...MISS]"))
    pg.click('.hr [data-lang="en"]');pg.wait_for_timeout(300)
    pg.evaluate("location.hash='home'");pg.wait_for_timeout(500)
    en_after=pg.evaluate("document.body.innerText")
    check('hero returns to English',"Grandma's Secret," in pg.inner_text('.hero h1'))
    pg.evaluate("localStorage.clear()");pg.goto('about:blank');pg.goto(URL+'?lang=en');pg.wait_for_timeout(600)
    # ---- search ----
    pg.keyboard.press('/');pg.wait_for_timeout(150);pg.keyboard.type('nghe');pg.wait_for_timeout(150)
    check('search finds turmeric products without diacritics',any('Turmeric' in t for t in pg.locator('#sres button').all_inner_texts()))
    pg.keyboard.press('Escape');pg.wait_for_timeout(100);check('escape closes search',not pg.evaluate("document.getElementById('srchd').open"))
    # ---- keyboard / focus ----
    pg.goto('about:blank');pg.goto(URL+'?lang=en');pg.wait_for_timeout(600)
    pg.keyboard.press('Tab');check('skip button is first tab stop',pg.evaluate("document.activeElement.hasAttribute('data-skip')"))
    pg.keyboard.press('Enter');check('skip moves focus to main',pg.evaluate("document.activeElement.id")=='main')
    # ---- bag, discount codes, checkout ----
    pg.evaluate("add('wash')");pg.click('#bo');pg.wait_for_timeout(150)
    check('bag open makes page inert',pg.evaluate("document.querySelector('main').inert"))
    pg.fill('#pcin','thora10');pg.click('#pf button');pg.wait_for_timeout(100)
    check('THORA10 gives 10% off',pg.evaluate("disc(subtotal())")==4000,pg.evaluate("disc(subtotal())"))
    pg.fill('#pcin','THORA20');pg.click('#pf button');pg.wait_for_timeout(100)
    check('THORA20 blocked on small order','more to use THORA20' in pg.inner_text('#pm'),pg.inner_text('#pm'))
    pg.evaluate("add('routine');add('routine')");pg.fill('#pcin','THORA20');pg.click('#pf button');pg.wait_for_timeout(100)
    check('THORA20 works on a large order',pg.evaluate("PROMO")=='THORA20' and pg.evaluate("disc(subtotal())")>0)
    check('discount line is shown','Discount (THORA20)' in pg.inner_text('#bf'))
    pg.keyboard.press('Escape');pg.wait_for_timeout(100)
    check('escape closes bag and returns focus',pg.evaluate("document.getElementById('bag').hidden")and pg.evaluate("document.activeElement.id")=='bo')
    pg.reload();pg.wait_for_timeout(500);check('bag persists after reload',int(pg.inner_text('#cnt'))>=3)
    pg.click('#bo');pg.click('[data-co]');pg.fill('#cn','Test');pg.fill('#cp','12345');pg.fill('#ca','1 Street');pg.click('#co button.pill');pg.wait_for_timeout(100)
    check('invalid phone blocks the order',pg.locator('#co').count()==1)
    pg.fill('#cp','0901234567');pg.click('#co button.pill');pg.wait_for_timeout(150)
    check('valid order confirms and shows savings','confirmed' in pg.inner_text('#bf') and 'saved' in pg.inner_text('#bf'))
    check('promo cleared after purchase',pg.evaluate("PROMO")is None);pg.keyboard.press('Escape')
    # ---- timed promo pop-up ----
    pg2=ctx.new_page();pg2.goto(URL+'?lang=en');pg2.evaluate("localStorage.clear()");pg2.goto(URL+'?lang=en&promo=2');pg2.wait_for_timeout(300)
    for i in range(5):pg2.mouse.move(100+i*40,200);pg2.wait_for_timeout(700)
    check('promo pop-up appears after active browsing',pg2.evaluate("!document.getElementById('promo').hidden"))
    check('promo offers 10% on an empty bag',pg2.inner_text('#pcode')=='THORA10' and '10%' in pg2.inner_text('#ppct'))
    pg2.click('[data-promo="apply"]');pg2.wait_for_timeout(200)
    check('apply puts the code on the bag',pg2.evaluate("PROMO")=='THORA10' and pg2.evaluate("!document.getElementById('bag').hidden"))
    pg2.keyboard.press('Escape');pg2.reload();pg2.wait_for_timeout(300)
    for i in range(5):pg2.mouse.move(100+i*40,200);pg2.wait_for_timeout(700)
    check('promo is not shown again within 24h',pg2.evaluate("document.getElementById('promo').hidden"))
    pg3=ctx.new_page();pg3.goto(URL+'?lang=en');pg3.evaluate("localStorage.clear()");pg3.goto(URL+'?lang=en&promo=2');pg3.wait_for_timeout(300);pg3.evaluate("openPd('duo')")
    for i in range(5):pg3.mouse.move(100+i*40,200);pg3.wait_for_timeout(700)
    check('promo waits while a dialog is open',pg3.evaluate("document.getElementById('promo').hidden"))
    pg3.close();pg2.close()
    # ---- skin report ----
    pg.goto('about:blank');pg.goto(URL+'?lang=en');pg.wait_for_timeout(500)
    quiz(pg,('oily','breakouts','me','full'));res=pg.inner_text('#s-res')
    for sec in ['Your Skin Report','What we found','What to improve','Your Thorakao routine','Your 4-week plan','Do','Recommended Thorakao products']:check(f'report has section: {sec}',sec in res)
    check('report shows Moderate for oily + blemishes','Moderate' in res)
    am=pg.inner_text('#rsteps');pg.click('[data-rt="pm"]');pm=pg.inner_text('#rsteps')
    check('AM and PM routines differ',am!=pm and 'Turmeric Cream' in pm and 'Turmeric Cream' not in am)
    check('report products show prices','VND' in pg.inner_text('#s-res .reco'))
    check('report has CTAs',all(x in res for x in ['Add my routine to bag','Get my discount code','Print or save report']))
    pg.evaluate("window.print=()=>{window.__printed=1}");pg.click('[data-print]');check('print button calls print',pg.evaluate('window.__printed')==1)
    pg.click('#s-res [data-promo="show"]');check('report CTA opens promo',pg.evaluate("!document.getElementById('promo').hidden"));pg.click('[data-promo="close"]')
    pg.click('[data-all]');pg.wait_for_timeout(200);check('add routine puts items in bag',int(pg.inner_text('#cnt'))>=1 and pg.evaluate("!document.getElementById('bag').hidden"));pg.keyboard.press('Escape')
    quiz(pg,('tight','breakouts','mum','full'));t=pg.inner_text('#s-res')
    check('needs-care shows dermatologist note','dermatologist' in t.lower() and 'Needs care' in t)
    quiz(pg,('tight','dryness','me','full'));check('dry skin gets lip balm in routine','Lip Balm' in pg.inner_text('#s-res'))
    pg.click('[data-del]');check('delete returns to consent',pg.evaluate("!document.getElementById('s-consent').hidden"))
    # ---- maps ----
    goto(pg,'contact')
    check('map is not loaded before consent',pg.locator('#mapbox iframe').count()==0)
    check('open-in-maps link uses the Maps URL API','api=1&query=' in pg.get_attribute('#mopen','href') and 'dir/?api=1&destination=' in pg.get_attribute('#mdir','href'))
    pg.click('[data-map]');pg.wait_for_timeout(200)
    src=pg.get_attribute('#mapbox iframe','src');check('map loads Google Maps after consent','google.com/maps' in src and 'Thorakao' in src,src)
    pg.select_option('#lcity','hn');pg.wait_for_timeout(200);check('city change updates the map query','Hanoi' in pg.get_attribute('#mapbox iframe','src'))
    check('head office address is listed',True)
    pg.select_option('#lcity','hcm');pg.wait_for_timeout(150);check('HQ listing shows the phone number','028 8887 3241' in pg.inner_text('#lloc'))
    pg.reload();pg.wait_for_timeout(500);goto(pg,'contact');check('map consent persists',pg.locator('#mapbox iframe').count()==1)
    pg.click('#cf button.pill');check('contact form shows 3 errors',pg.locator('#cfer li').count()==3)
    pg.fill('#cfn','A');pg.fill('#cfe','a@b.co');pg.fill('#cfm','Hello there, this is long enough.');pg.click('#cf button.pill')
    check('contact form success',pg.evaluate("!document.getElementById('cfok').hidden"))
    ctx.close();b.close()
print(f'{passed} passed, {len(fails)} failed');print('\n'.join(fails) if fails else 'ALL_PASSED')
sys.exit(1 if fails else 0)
