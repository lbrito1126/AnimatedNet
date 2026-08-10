// ===== APPROVED BLOOM SNAPSHOT (fastfetch 8-point star) =====
// User-approved on 2026-08-10 ("This is perfect now"). Source commit: 0a93a41.
// This is the exact bloom field + blade/ring tables as shipped. To restore the
// look, copy this block back over the bloom section in index.html. The live
// index.html keeps this as the density=1 default; the density slider only adds
// resolution on top of it.

const bloomRng=(s=>()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; })(9);
  function bloomHsh(a,b){ let s=((a*73856093)^(b*19349663))>>>0; s=(s*1103515245+12345)>>>0; return s/4294967295; }
  // star: SMALL rounded-diamond hollow core (wider than tall), LONG outlined rugged
  // blades, rotating tick-rings for intricacy in the gap, and two rugged rings that
  // clearly spin (fast rotating dashes) with a slight flip. [tilt,A,spinSpd,flipSpd,phase,offx,offy]
  const BLOOM_RINGS=[[0.5,0.86,0.011,0.0006,0,0,0],[-0.7,0.62,-0.013,0.0007,1.6,0.10,-0.05]];
  const BLOOM_STARS=[]; for(let i=0;i<7;i++) BLOOM_STARS.push([(bloomRng()*2-1)*2.2,(bloomRng()*2-1)*1.15,bloomRng()*6.28]);
  // 8-point star: 4 long main points + 4 diagonal points (~50% shorter). [angle,length,baseWidth,coreStart]
  const BP2=Math.PI/2, BP4=Math.PI/4;
  const BLOOM_BLADES=[
    [-BP2,1.12,0.10,0.17],[BP2,1.12,0.10,0.17],            // top / bottom (fit vertical band, no clip)
    [0,1.02,0.10,0.22],[Math.PI,1.02,0.10,0.22],           // right / left (almost matching)
    [-BP4,0.56,0.065,0.15],[-3*BP4,0.56,0.065,0.15],       // diagonals
    [BP4,0.56,0.065,0.15],[3*BP4,0.56,0.065,0.15]
  ];
  function bloomField(u,w){
    const T=frameT, cx=gCols/2, cy=gRows/2, U=gRows;
    const X=(u*gCols-cx)/(U*0.40), Y=(w*gRows-cy)/(U*0.40);
    const r=Math.hypot(X,Y), a=Math.atan2(Y,X);
    let v=0;
    for(let i=0;i<BLOOM_STARS.length;i++){ const s=BLOOM_STARS[i], tw=0.5+0.5*Math.sin(T/300+s[2]);
      const dx=X-s[0], dy=Y-s[1], sz=0.03*(0.3+0.7*tw), arm=0.09*(0.3+0.7*tw);
      if((Math.abs(dx)<sz&&Math.abs(dy)<arm)||(Math.abs(dy)<sz&&Math.abs(dx)<arm)) v=Math.max(v,0.5+0.5*tw); }
    if(r>2.6) return v;
    // BIGGER hollow rounded-diamond core OUTLINE (wider than tall): clear ring, empty centre
    const n=1.7, Rcx=0.225, Rcy=0.172, f=Math.pow(Math.abs(X)/Rcx,n)+Math.pow(Math.abs(Y)/Rcy,n);
    if(f>=0.55 && f<1.22){ v=Math.max(v, 0.7+0.3*(1-Math.abs(f-0.9)/0.34)); }
    // rotating dashed tick-rings for gap intricacy (kept OUTSIDE the core so it stays clean)
    if(Math.abs(r-0.40)<0.026 && Math.sin(a*22 + T*0.0020)>0.0) v=Math.max(v,0.58);
    if(Math.abs(r-0.52)<0.022 && Math.sin(a*28 - T*0.0018)>0.3) v=Math.max(v,0.5);
    // thin, sharp blades stemming from the core (4 main + 4 diagonal)
    for(let i=0;i<BLOOM_BLADES.length;i++){ const d=BLOOM_BLADES[i][0], L=BLOOM_BLADES[i][1], wB=BLOOM_BLADES[i][2], cE=BLOOM_BLADES[i][3];
      const ca=Math.cos(d), sa=Math.sin(d), s=X*ca+Y*sa, p=-X*sa+Y*ca;
      if(s>cE && s<L){ const tt=(s-cE)/(L-cE), hw=wB*Math.pow(1-tt,1.25), edge=hw-Math.abs(p);
        if(edge>0){ const h=bloomHsh((s*70)|0,(p*70)|0);
          if(edge<0.018+0.022*h && h>0.08) v=Math.max(v,0.85);
          else if(h>0.5) v=Math.max(v,0.45+0.3*h); } } }
    // two rugged rings: fast spin (rotating dashes) + slight flip; elliptical, one offset/smaller
    for(let k=0;k<BLOOM_RINGS.length;k++){ const p=BLOOM_RINGS[k], tilt=p[0], A=p[1];
      const B=A*(0.5+0.12*Math.cos(T*p[3]+p[4]));
      const ca=Math.cos(tilt), sa=Math.sin(tilt), lx=(X-p[5])*ca+(Y-p[6])*sa, ly=-(X-p[5])*sa+(Y-p[6])*ca;
      const nx=lx/A, ny=ly/B, d=Math.sqrt(nx*nx+ny*ny), th=Math.atan2(ny,nx);
      const jit=0.035*Math.sin(th*7+p[4])+0.02*Math.sin(th*13), dash=Math.sin(th*18 - T*p[2]);
      if(dash>-0.3 && Math.abs(d-(1+jit))<0.05) v=Math.max(v,0.8); }
    v*=(0.85+0.15*(0.5+0.5*Math.sin(T/1600)));
    return v>1?1:v;
  }
