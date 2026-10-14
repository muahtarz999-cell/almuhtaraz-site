(function(){
  /* Skyline that builds itself: buildings rise, windows light up, cranes slew, embers drift */
  var cv=document.getElementById('city');
  if(cv&&cv.getContext){
    var ctx=cv.getContext('2d');
    var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var seen=false,W=0,H=0,sf=1,blds=[],tower=null,frames=[],embers=[],start=performance.now(),raf=0,onScreen=true,px=0,tx=0;
    var GOLD='201,168,104',HI='239,217,152';
    function mk(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;var t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
    function clamp(v,a,b){return v<a?a:v>b?b:v}
    function ease(p){return 1-Math.pow(1-p,3)}
    var sprite=document.createElement('canvas');sprite.width=sprite.height=48;
    (function(){var g=sprite.getContext('2d');var gr=g.createRadialGradient(24,24,0,24,24,24);gr.addColorStop(0,'rgba(255,240,200,1)');gr.addColorStop(.25,'rgba(239,217,152,.55)');gr.addColorStop(1,'rgba(201,168,104,0)');g.fillStyle=gr;g.fillRect(0,0,48,48)})();

    var LAYERS=[
      {k:0,fill:'#0a0c10',edge:.12,win:.16,wa:.35},
      {k:1,fill:'#0d0f14',edge:.22,win:.32,wa:.6},
      {k:2,fill:'#11141b',edge:.45,win:.55,wa:.95}
    ];
    function building(r,x,w,h,layer,delay,dur){
      var cw=7*sf,rh=9*sf;
      var cols=Math.max(1,Math.floor((w-8*sf)/cw)),rows=Math.max(1,Math.floor((h-12*sf)/rh));
      var ph=new Float32Array(cols*rows);for(var i=0;i<ph.length;i++)ph[i]=r();
      return {x:x,w:w,h:h,layer:layer,delay:delay,dur:dur,cols:cols,rows:rows,cw:cw,rh:rh,ph:ph};
    }
    function build(){
      var r=mk(11);blds=[];frames=[];embers=[];
      for(var li=0;li<3;li++){
        var x=-14;
        while(x<W+14){
          var w=(28+r()*(li===0?34:li===1?40:52))*sf;
          var hmin=[.2,.24,.18][li],hmax=[.5,.62,.5][li];
          var h=(hmin+r()*(hmax-hmin))*H;
          blds.push(building(r,x,w,h,li,(x/Math.max(W,1))*1.3+li*.25+r()*.45,1.7+r()*1.2));
          x+=w+(li===2?4:2)*sf+r()*5*sf;
        }
      }
      var tw=54*sf;
      tower={x:W*.5-tw/2,w:tw,h:H*.94,delay:.5,dur:2.8};
      tower.b=building(r,tower.x,tw,tower.h,2,0,1);
      frames=[
        {x:W*.2-30*sf,w:60*sf,h:H*.56,delay:.9,dur:3.4,ph:.4},
        {x:W*.76-28*sf,w:56*sf,h:H*.46,delay:1.3,dur:3.2,ph:2.2}
      ];
      var n=Math.round(W/13);
      for(var e=0;e<n;e++)embers.push({x:r()*W,off:r()*H*1.2,vy:.1+r()*.33,sz:.5+r()*1.3,ph:r()*6.28,sw:.3+r()*.8});
    }
    function drawWindows(b,L,y,t,p,ox){
      var done=clamp((t-b.delay-b.dur)/1.6,0,1);
      ctx.fillStyle='rgb('+HI+')';
      for(var rr=0;rr<b.rows;rr++){
        var wy=H-8*sf-rr*b.rh;if(wy<y+6)break;
        for(var c=0;c<b.cols;c++){
          var ph=b.ph[rr*b.cols+c];if(ph>L.win)continue;
          var a=(.35+.55*(.5+.5*Math.sin(t*(.5+ph*1.6)+ph*40)))*L.wa*clamp(done*2-ph,0,1);
          if(a<.03)continue;
          ctx.globalAlpha=a;
          ctx.fillRect(b.x+ox+4*sf+c*b.cw,wy-4*sf,3.2*sf,4.6*sf);
        }
      }
      ctx.globalAlpha=1;
    }
    function drawBuilding(b,t,ox){
      var L=LAYERS[b.layer];
      var p=ease(clamp((t-b.delay)/b.dur,0,1));if(p<=0)return;
      var hh=b.h*p,y=H-hh,x=b.x+ox;
      ctx.fillStyle=L.fill;ctx.fillRect(x,y,b.w,hh);
      ctx.fillStyle='rgba('+GOLD+','+L.edge*.7+')';
      ctx.fillRect(x,y,1,hh);ctx.fillRect(x+b.w-1,y,1,hh);
      ctx.fillStyle=p<1?'rgba('+HI+',.95)':'rgba('+GOLD+','+L.edge+')';
      ctx.fillRect(x,y,b.w,p<1?1.6:1);
      drawWindows(b,L,y,t,p,ox);
    }
    function drawTower(t,ox){
      var T=tower;var p=ease(clamp((t-T.delay)/T.dur,0,1));if(p<=0)return;
      var hh=T.h*p,top=H-hh,x=T.x+ox,w=T.w,nd=w*.55;
      ctx.beginPath();
      ctx.moveTo(x,H);ctx.lineTo(x,top);ctx.lineTo(x+w*.3,top);ctx.lineTo(x+w*.5,top+nd*Math.min(1,p*1.4));ctx.lineTo(x+w*.7,top);ctx.lineTo(x+w,top);ctx.lineTo(x+w,H);ctx.closePath();
      ctx.fillStyle='#12151d';ctx.fill();
      ctx.strokeStyle='rgba('+HI+','+(p<1?.95:.7)+')';ctx.lineWidth=1.2;ctx.stroke();
      var b=T.b,L={win:.7,wa:1};
      drawWindows({x:T.x,cols:b.cols,rows:b.rows,cw:b.cw,rh:b.rh,ph:b.ph,delay:T.delay,dur:T.dur},L,top+nd+4*sf,t,p,ox);
      if(p>=1){var g=.55+.45*Math.sin(t*1.7);ctx.globalAlpha=g;ctx.drawImage(sprite,x+w*.5-14,top+nd-14,28,28);ctx.globalAlpha=1}
    }
    function crane(cx,baseY,s,t,phase){
      var mastH=84*s,jib=96*s,cj=34*s,top=baseY-mastH;
      ctx.strokeStyle='rgba('+HI+',.85)';ctx.lineWidth=Math.max(.9,1.1*s);
      ctx.beginPath();
      ctx.moveTo(cx-3*s,baseY);ctx.lineTo(cx-3*s,top);ctx.moveTo(cx+3*s,baseY);ctx.lineTo(cx+3*s,top);
      var n=8;for(var i=0;i<n;i++){var y0=baseY-i*mastH/n,y1=baseY-(i+1)*mastH/n;ctx.moveTo(cx-3*s,y0);ctx.lineTo(cx+3*s,y1);ctx.moveTo(cx+3*s,y0);ctx.lineTo(cx-3*s,y1)}
      var a=t*.32+phase,len=Math.cos(a);
      var je=cx+len*jib,ce=cx-len*cj;
      ctx.moveTo(ce,top);ctx.lineTo(je,top);ctx.moveTo(ce,top+5*s);ctx.lineTo(je,top+5*s);
      var m=10;for(var k=0;k<m;k++){var xa=ce+(je-ce)*k/m,xb=ce+(je-ce)*(k+1)/m;ctx.moveTo(xa,top+(k%2?0:5*s));ctx.lineTo(xb,top+(k%2?5*s:0))}
      ctx.moveTo(cx,top-16*s);ctx.lineTo(cx,top);ctx.moveTo(cx,top-16*s);ctx.lineTo(je,top);ctx.moveTo(cx,top-16*s);ctx.lineTo(ce,top);
      ctx.stroke();
      ctx.fillStyle='rgba('+GOLD+',.9)';ctx.fillRect(ce-3*s,top+5*s,7*s,7*s);
      var tr=cx+len*jib*.62,drop=30*s+Math.sin(t*.8+phase)*9*s,sw=Math.sin(t*1.3+phase)*3*s;
      ctx.strokeStyle='rgba('+HI+',.6)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(tr,top+5*s);ctx.lineTo(tr+sw,top+5*s+drop);ctx.stroke();
      ctx.fillStyle='rgba('+HI+',.95)';ctx.fillRect(tr+sw-3*s,top+5*s+drop,6*s,5*s);
      ctx.globalAlpha=.55+.45*Math.sin(t*2.4+phase);ctx.drawImage(sprite,cx-9,top-16*s-9,18,18);ctx.globalAlpha=1;
    }
    function drawFrame(f,t,ox){
      var p=ease(clamp((t-f.delay)/f.dur,0,1));if(p<=0)return;
      var hh=f.h*p,fh=14*sf,x=f.x+ox,n=Math.floor(hh/fh);
      ctx.fillStyle='rgba('+GOLD+',.5)';
      for(var c=0;c<4;c++)ctx.fillRect(x+c*(f.w-1.4)/3,H-hh,1.3,hh);
      ctx.fillStyle='rgba('+HI+',.8)';
      for(var i=0;i<=n;i++)ctx.fillRect(x,H-i*fh-1.5,f.w,1.5);
      ctx.fillStyle='rgba('+GOLD+',.07)';ctx.fillRect(x,H-hh,f.w,hh);
      if(p>.12)crane(x+f.w*.5,H-hh,sf*.95,t,f.ph);
    }
    function drawEmbers(t){
      ctx.globalCompositeOperation='lighter';
      for(var i=0;i<embers.length;i++){
        var e=embers[i];var y=H-((t*e.vy*40+e.off)%(H*1.15));var x=e.x+Math.sin(t*e.sw+e.ph)*10;
        var a=clamp(1-Math.abs(y/H-.55)*1.6,0,1)*(.45+.55*Math.sin(t*1.8+e.ph));
        if(a<=.02)continue;ctx.globalAlpha=a*.75;var s=e.sz*7;ctx.drawImage(sprite,x-s/2,y-s/2,s,s);
      }
      ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
    }
    function render(t){
      ctx.clearRect(0,0,W,H);
      ctx.save();ctx.translate(W/2,H);ctx.scale(1,.5);
      var g=ctx.createRadialGradient(0,0,0,0,0,W*.6);g.addColorStop(0,'rgba('+GOLD+',.28)');g.addColorStop(.5,'rgba('+GOLD+',.08)');g.addColorStop(1,'rgba('+GOLD+',0)');
      ctx.fillStyle=g;ctx.fillRect(-W,-H*2,W*2,H*2);ctx.restore();
      var i;
      for(i=0;i<blds.length;i++)if(blds[i].layer===0)drawBuilding(blds[i],t,px*.4);
      for(i=0;i<blds.length;i++)if(blds[i].layer===1)drawBuilding(blds[i],t,px*.8);
      drawTower(t,px*1.1);
      for(i=0;i<frames.length;i++)drawFrame(frames[i],t,px*1.2);
      for(i=0;i<blds.length;i++)if(blds[i].layer===2)drawBuilding(blds[i],t,px*1.5);
      var hz=ctx.createLinearGradient(0,H*.55,0,H);hz.addColorStop(0,'rgba(7,8,11,0)');hz.addColorStop(1,'rgba(7,8,11,.78)');
      ctx.fillStyle=hz;ctx.fillRect(0,H*.55,W,H*.45);
      drawEmbers(t);
    }
    function loop(){
      if(!onScreen){raf=0;return}
      px+=(tx*10-px)*.05;
      render((performance.now()-start)/1000);
      raf=requestAnimationFrame(loop);
    }
    function size(){
      var r=cv.parentElement.getBoundingClientRect();
      W=Math.max(1,r.width);H=Math.max(1,r.height);sf=clamp(W/1000,.6,1);
      var d=Math.min(window.devicePixelRatio||1,2);
      cv.width=Math.round(W*d);cv.height=Math.round(H*d);ctx.setTransform(d,0,0,d,0,0);
      build();
      if(reduce)render(99);
    }
    size();
    if(window.ResizeObserver)new ResizeObserver(size).observe(cv.parentElement);else window.addEventListener('resize',size);
    if(!reduce){
      if(window.IntersectionObserver){
        new IntersectionObserver(function(es){onScreen=es[0].isIntersecting;if(onScreen&&!seen){seen=true;start=performance.now()}if(onScreen&&!raf)raf=requestAnimationFrame(loop)},{threshold:0}).observe(cv);
      }
      window.addEventListener('pointermove',function(e){tx=(e.clientX/window.innerWidth-.5)*2},{passive:true});
      raf=requestAnimationFrame(loop);
    }
  }

  /* copy buttons */
  var btns=document.querySelectorAll('[data-copy]');
  for(var i=0;i<btns.length;i++){
    btns[i].addEventListener('click',function(){
      var b=this,v=b.getAttribute('data-copy'),old=b.textContent;
      function done(ok){b.textContent=ok?'تم النسخ':'حدّد وانسخ';setTimeout(function(){b.textContent=old},1600)}
      function fallback(){
        try{var el=b.parentElement.querySelector('.val');var r=document.createRange();r.selectNodeContents(el);var s=window.getSelection();s.removeAllRanges();s.addRange(r)}catch(e){}
        done(false);
      }
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(v).then(function(){done(true)},fallback)}else fallback();
    });
  }
})();
