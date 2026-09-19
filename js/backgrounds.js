// GALAXY UNIVERSE — Infinite Tiling + Neural Connections + Explosive
document.addEventListener('DOMContentLoaded', function() {
  console.log('Background script loaded, bgType:', document.body.dataset.bg);
  
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let w, h;
  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  function getScrollDistortion() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return 0;
    return Math.min(1, scrollY / docHeight);
  }

  const mouse = { x: w/2, y: h/2, active: false, down: false };
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
  window.addEventListener('mousedown', e => { mouse.down = true; createExplosion(mouse.x, mouse.y); });
  window.addEventListener('mouseup', () => mouse.down = false);
  window.addEventListener('mouseleave', () => mouse.active = false);

  const bgType = document.body.dataset.bg || 'particles';
  console.log('Background type:', bgType);

  const themes = {
    particles: { colors: ['#dc143c', '#ff6b6b', '#ff8e53', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'], spiralArms: [2, 3, 4], gridSpacing: 300, connectionDist: 400 },
    neural: { colors: ['#dc143c', '#ff4757', '#ff6348', '#c44569', '#f8b500'], spiralArms: [3, 4, 5], gridSpacing: 350, connectionDist: 450 },
    ashen: { colors: ['#dc143c', '#ff4757', '#ff6b6b', '#ff8e53', '#feca57', '#48dbfb'], spiralArms: [3, 4], gridSpacing: 320, connectionDist: 420 },
    matrix: { colors: ['#00ff41', '#39ff14', '#00ff00', '#7fff00', '#dc143c'], spiralArms: [2, 3], gridSpacing: 400, connectionDist: 500 },
    wireframe: { colors: ['#dc143c', '#ff4757', '#ff6348', '#f8b500', '#48dbfb', '#54a0ff'], spiralArms: [4, 5, 6], gridSpacing: 350, connectionDist: 450 },
    starfield: { colors: ['#dc143c', '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'], spiralArms: [2, 3, 4, 5], gridSpacing: 280, connectionDist: 380 },
    wave: { colors: ['#dc143c', '#c44569', '#f8b500', '#48dbfb', '#54a0ff', '#5f27cd'], spiralArms: [2, 3], gridSpacing: 380, connectionDist: 480 }
  };

  const theme = themes[bgType] || themes.particles;
  console.log('Theme loaded:', theme);

  function seededRandom(seed) {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  }

  function getGalaxyAt(gx, gy) {
    const seed = gx * 1000 + gy;
    const rng = (offset) => seededRandom(seed + offset);
    return {
      gx: gx, gy: gy,
      x: gx * theme.gridSpacing + rng(1) * theme.gridSpacing * 0.5,
      y: gy * theme.gridSpacing + rng(2) * theme.gridSpacing * 0.5,
      r: rng(3) * 40 + 15,
      color: theme.colors[Math.floor(rng(4) * theme.colors.length)],
      rotation: rng(5) * Math.PI * 2,
      rotSpeed: (rng(6) - 0.5) * 0.003 + 0.001,
      spiralArms: theme.spiralArms[Math.floor(rng(7) * theme.spiralArms.length)],
      pulsePhase: rng(8) * Math.PI * 2,
      tilt: rng(9) * 0.5 + 0.3,
      stars: Array.from({ length: 30 }, (_, i) => ({
        dist: rng(10 + i * 3) * 0.8 + 0.1,
        angle: (Math.floor(rng(11 + i * 3) * theme.spiralArms[0]) / theme.spiralArms[0]) * Math.PI * 2 + rng(12 + i * 3) * 3,
        size: rng(13 + i * 3) * 2 + 0.5,
        brightness: rng(14 + i * 3)
      }))
    };
  }

  const galaxyCache = new Map();
  function getGalaxy(gx, gy) {
    const key = `${gx},${gy}`;
    if (!galaxyCache.has(key)) galaxyCache.set(key, getGalaxyAt(gx, gy));
    return galaxyCache.get(key);
  }

  function getVisibleGalaxies() {
    const result = [];
    const viewMargin = 500;
    const minGX = Math.floor((-viewMargin) / theme.gridSpacing) - 1;
    const maxGX = Math.floor((w + viewMargin) / theme.gridSpacing) + 1;
    const minGY = Math.floor((-viewMargin) / theme.gridSpacing) - 1;
    const maxGY = Math.floor((h + viewMargin) / theme.gridSpacing) + 1;
    for (let gx = minGX; gx <= maxGX; gx++) {
      for (let gy = minGY; gy <= maxGY; gy++) {
        result.push(getGalaxy(gx, gy));
      }
    }
    console.log('Visible galaxies:', result.length);
    return result;
  }

  const bgStars = Array.from({ length: 400 }, () => ({ x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.5+0.3, twinkle: Math.random()*Math.PI*2, speed: Math.random()*0.02+0.005 }));
  const nebulae = Array.from({ length: 10 }, () => ({ x: Math.random()*w, y: Math.random()*h, rx: Math.random()*250+100, ry: Math.random()*180+80, rotation: Math.random()*Math.PI, color: `hsla(${Math.random()*60+320},80%,30%,0.04)` }));

  const explosions = [];
  const particles = Array.from({ length: 100 }, () => ({ x: Math.random()*w, y: Math.random()*h, vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2, r: Math.random()*3+1, life: 1, decay: Math.random()*0.01+0.005, color: theme.colors[Math.floor(Math.random()*theme.colors.length)] }));

  function createExplosion(x, y) {
    explosions.push({ x, y, radius: 0, alpha: 1, color: theme.colors[Math.floor(Math.random()*theme.colors.length)] });
    for (let i = 0; i < 15; i++) {
      const angle = Math.random()*Math.PI*2, speed = Math.random()*5+2;
      particles.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, r: Math.random()*4+2, life: 1, decay: Math.random()*0.02+0.01, color: theme.colors[Math.floor(Math.random()*theme.colors.length)] });
    }
  }

  function drawBase() {
    ctx.fillStyle = '#030308';
    ctx.fillRect(0, 0, w, h);
    nebulae.forEach(n => { ctx.save(); ctx.translate(n.x + scrollY * 0.1, n.y + scrollY * 0.05); ctx.rotate(n.rotation + scrollY * 0.0001); const g = ctx.createRadialGradient(0,0,0,0,0,n.rx); g.addColorStop(0,n.color); g.addColorStop(1,'transparent'); ctx.fillStyle=g; ctx.scale(1,n.ry/n.rx); ctx.beginPath(); ctx.arc(0,0,n.rx,0,Math.PI*2); ctx.fill(); ctx.restore(); });
    bgStars.forEach(s => { s.twinkle+=s.speed; const a=0.15+Math.sin(s.twinkle)*0.25; const sx = (s.x + scrollY * 0.05) % w; const sy = (s.y + scrollY * 0.03) % h; ctx.beginPath(); ctx.arc(sx, sy, s.r, 0, Math.PI*2); ctx.fillStyle=`rgba(255,255,255,${a})`; ctx.fill(); });
  }

  function drawGalaxy(g) {
    const d = Math.sqrt((g.x - mouse.x) ** 2 + (g.y - mouse.y) ** 2);
    const proximity = d < 300 ? Math.max(0, 1 - d / 300) : 0;
    const distortion = getScrollDistortion();
    g.rotation += g.rotSpeed * (1 + distortion * 3);
    g.pulsePhase += 0.015 * (1 + distortion * 2);

    const baseAlpha = 0.4 + Math.sin(g.pulsePhase) * 0.15;
    const alpha = Math.min(1, baseAlpha + proximity * 0.6);

    const scrollOffsetX = Math.sin(g.pulsePhase * 0.5) * scrollY * 0.3;
    const scrollOffsetY = Math.cos(g.pulsePhase * 0.3) * scrollY * 0.2;

    ctx.save();
    ctx.translate(g.x + scrollOffsetX, g.y + scrollOffsetY);
    ctx.scale(1 + distortion * 0.3, g.tilt - distortion * 0.2);

    const glowSize = g.r * (2.5 + proximity) * (1 + distortion * 0.5);
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
    gradient.addColorStop(0, `rgba(220, 20, 60, ${alpha * 0.6})`);
    gradient.addColorStop(0.2, `rgba(200, 50, 100, ${alpha * 0.3})`);
    gradient.addColorStop(0.5, `rgba(150, 50, 200, ${alpha * 0.1})`);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
    ctx.fill();

    g.stars.forEach(star => {
      const armAngle = (star.angle + g.rotation * 50) % (Math.PI * 2);
      const dist = star.dist * (1 + distortion * Math.sin(g.pulsePhase + star.angle) * 0.3);
      const x = Math.cos(armAngle) * dist * g.r;
      const y = Math.sin(armAngle) * dist * g.r;
      const twinkle = Math.sin(g.pulsePhase + star.brightness * 10) * 0.3 + 0.7;
      ctx.beginPath();
      ctx.arc(x, y, star.size * (1 + proximity * 0.5) * twinkle, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * star.brightness * twinkle})`;
      ctx.fill();
    });

    const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, g.r * 0.4);
    coreGradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`);
    coreGradient.addColorStop(0.5, `rgba(255, 200, 200, ${alpha * 0.5})`);
    coreGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(0, 0, g.r * 0.4 * (1 + proximity * 0.3), 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawNeuralConnections(visibleGalaxies) {
    const distortion = getScrollDistortion();
    const connectionDist = theme.connectionDist * (1 + distortion * 0.3);

    for (let i = 0; i < visibleGalaxies.length; i++) {
      for (let j = i + 1; j < visibleGalaxies.length; j++) {
        const a = visibleGalaxies[i];
        const b = visibleGalaxies[j];

        const scrollOffsetAX = Math.sin(a.pulsePhase * 0.5) * scrollY * 0.3;
        const scrollOffsetAY = Math.cos(a.pulsePhase * 0.3) * scrollY * 0.2;
        const scrollOffsetBX = Math.sin(b.pulsePhase * 0.5) * scrollY * 0.3;
        const scrollOffsetBY = Math.cos(b.pulsePhase * 0.3) * scrollY * 0.2;

        const ax = a.x + scrollOffsetAX;
        const ay = a.y + scrollOffsetAY;
        const bx = b.x + scrollOffsetBX;
        const by = b.y + scrollOffsetBY;

        const dist = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
        if (dist < connectionDist) {
          const alpha = 0.15 * (1 - dist / connectionDist);
          const d1 = Math.sqrt((ax - mouse.x) ** 2 + (ay - mouse.y) ** 2);
          const d2 = Math.sqrt((bx - mouse.x) ** 2 + (by - mouse.y) ** 2);
          const mouseProximity = Math.max(0, 1 - Math.min(d1, d2) / 250);

          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.strokeStyle = `rgba(220, 20, 60, ${alpha + mouseProximity * 0.4})`;
          ctx.lineWidth = mouseProximity > 0.3 ? 1.5 : 0.5;
          ctx.stroke();

          if (mouseProximity > 0.2) {
            const pulsePos = (Date.now() * 0.002 + i * 0.2) % 1;
            const px = ax + (bx - ax) * pulsePos;
            const py = ay + (by - ay) * pulsePos;
            ctx.beginPath();
            ctx.arc(px, py, 2 + mouseProximity * 2, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${mouseProximity})`;
            ctx.fill();
          }
        }
      }
    }
  }

  function drawExplosions() {
    explosions.forEach((e,i) => { e.radius+=6; e.alpha-=0.02; if(e.alpha<=0) { explosions.splice(i,1); return; } ctx.beginPath(); ctx.arc(e.x,e.y,e.radius,0,Math.PI*2); ctx.strokeStyle=e.color; ctx.globalAlpha=e.alpha; ctx.lineWidth=2; ctx.stroke(); ctx.beginPath(); ctx.arc(e.x,e.y,e.radius*0.6,0,Math.PI*2); ctx.fillStyle=e.color; ctx.globalAlpha=e.alpha*0.25; ctx.fill(); ctx.globalAlpha=1; });
    particles.forEach((p,i) => { p.x+=p.vx; p.y+=p.vy; p.vx*=0.97; p.vy*=0.97; p.life-=p.decay; if(p.life<=0) { particles.splice(i,1); return; } ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2); ctx.fillStyle=p.color; ctx.globalAlpha=p.life*0.7; ctx.fill(); ctx.globalAlpha=1; });
  }

  console.log('Starting animation loop');
  function draw() {
    try {
      drawBase();
      const visibleGalaxies = getVisibleGalaxies();
      drawNeuralConnections(visibleGalaxies);
      visibleGalaxies.forEach(g => drawGalaxy(g));
      drawExplosions();
    } catch(e) {
      console.error('Draw error:', e);
    }
    requestAnimationFrame(draw);
  }

  draw();
});
