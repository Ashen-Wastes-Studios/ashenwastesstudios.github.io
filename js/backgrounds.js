// GALAXY UNIVERSE — Scroll Distortion + Interactive
(function() {
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let w, h;
  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);

  // Scroll-based distortion (0 = top, increases as you scroll down)
  let scrollY = 0;
  window.addEventListener('scroll', () => {
    scrollY = window.scrollY;
  });

  // Distortion factor based on scroll (0 at top, max at bottom of page)
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

  const themes = {
    particles: { galaxyCount: 50, colors: ['#dc143c', '#ff6b6b', '#ff8e53', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'], spiralArms: [2, 3, 4], neuralNodes: 25, coreColor: '#fff' },
    neural: { galaxyCount: 35, colors: ['#dc143c', '#ff4757', '#ff6348', '#c44569', '#f8b500'], spiralArms: [3, 4, 5], neuralNodes: 35, coreColor: '#fff' },
    ashen: { galaxyCount: 40, colors: ['#dc143c', '#ff4757', '#ff6b6b', '#ff8e53', '#feca57', '#48dbfb'], spiralArms: [3, 4], neuralNodes: 40, coreColor: '#fff' },
    matrix: { galaxyCount: 25, colors: ['#00ff41', '#39ff14', '#00ff00', '#7fff00', '#dc143c'], spiralArms: [2, 3], neuralNodes: 20, coreColor: '#00ff41' },
    wireframe: { galaxyCount: 40, colors: ['#dc143c', '#ff4757', '#ff6348', '#f8b500', '#48dbfb', '#54a0ff'], spiralArms: [4, 5, 6], neuralNodes: 30, coreColor: '#fff' },
    starfield: { galaxyCount: 55, colors: ['#dc143c', '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'], spiralArms: [2, 3, 4, 5], neuralNodes: 35, coreColor: '#fff' },
    wave: { galaxyCount: 30, colors: ['#dc143c', '#c44569', '#f8b500', '#48dbfb', '#54a0ff', '#5f27cd'], spiralArms: [2, 3], neuralNodes: 20, coreColor: '#fff' }
  };

  const theme = themes[bgType] || themes.particles;

  // Create galaxies with proper spiral structure
  const galaxies = Array.from({ length: theme.galaxyCount }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 40 + 15,
    color: theme.colors[Math.floor(Math.random() * theme.colors.length)],
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.003 + 0.001,
    spiralArms: theme.spiralArms[Math.floor(Math.random() * theme.spiralArms.length)],
    pulsePhase: Math.random() * Math.PI * 2,
    tilt: Math.random() * 0.5 + 0.3, // 3D tilt for elliptical appearance
    stars: Array.from({ length: 30 }, () => {
      const arm = Math.floor(Math.random() * theme.spiralArms[0]);
      const dist = Math.random() * 0.8 + 0.1;
      const angle = (arm / theme.spiralArms[0]) * Math.PI * 2 + dist * 3;
      return { dist, angle, size: Math.random() * 2 + 0.5, brightness: Math.random() };
    })
  }));

  const bgStars = Array.from({ length: 400 }, () => ({ x: Math.random()*w, y: Math.random()*h, r: Math.random()*1.5+0.3, twinkle: Math.random()*Math.PI*2, speed: Math.random()*0.02+0.005 }));
  const nebulae = Array.from({ length: 10 }, () => ({ x: Math.random()*w, y: Math.random()*h, rx: Math.random()*250+100, ry: Math.random()*180+80, rotation: Math.random()*Math.PI, color: `hsla(${Math.random()*60+320},80%,30%,0.04)` }));
  const neuralNodes = galaxies.slice(0, theme.neuralNodes);

  const explosions = [];
  const particles = Array.from({ length: 100 }, () => ({ x: Math.random()*w, y: Math.random()*h, vx: (Math.random()-0.5)*2, vy: (Math.random()-0.5)*2, r: Math.random()*3+1, life: 1, decay: Math.random()*0.01+0.005, color: theme.colors[Math.floor(Math.random()*theme.colors.length)] }));

  function createExplosion(x, y) {
    explosions.push({ x, y, radius: 0, alpha: 1, color: theme.colors[Math.floor(Math.random()*theme.colors.length)] });
    for (let i = 0; i < 15; i++) {
      const angle = Math.random()*Math.PI*2, speed = Math.random()*5+2;
      particles.push({ x, y, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, r: Math.random()*4+2, life: 1, decay: Math.random()*0.02+0.01, color: theme.colors[Math.floor(Math.random()*theme.colors.length)] });
    }
  }

  function drawGalaxy(g) {
    const d = Math.sqrt((g.x - mouse.x) ** 2 + (g.y - mouse.y) ** 2);
    const proximity = d < 300 ? Math.max(0, 1 - d / 300) : 0;
    
    // Scroll distortion: stars orbit faster and more chaotically as you scroll
    const distortion = getScrollDistortion();
    g.rotation += g.rotSpeed * (1 + distortion * 3);
    g.pulsePhase += 0.015 * (1 + distortion * 2);

    const baseAlpha = 0.4 + Math.sin(g.pulsePhase) * 0.15;
    const alpha = Math.min(1, baseAlpha + proximity * 0.6);

    // Scroll-based position offset (parallax-like movement)
    const scrollOffsetX = Math.sin(g.pulsePhase * 0.5) * scrollY * 0.3;
    const scrollOffsetY = Math.cos(g.pulsePhase * 0.3) * scrollY * 0.2;

    ctx.save();
    ctx.translate(g.x + scrollOffsetX, g.y + scrollOffsetY);
    // More tilt distortion when scrolled
    ctx.scale(1 + distortion * 0.3, g.tilt - distortion * 0.2);

    // Outer glow
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

    // Spiral arms
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

    // Core
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

  function drawBase() {
    ctx.fillStyle = '#030308';
    ctx.fillRect(0, 0, w, h);
    // Nebulae shift with scroll
    nebulae.forEach(n => {
      ctx.save();
      ctx.translate(n.x + scrollY * 0.1, n.y + scrollY * 0.05);
      ctx.rotate(n.rotation + scrollY * 0.0001);
      const g = ctx.createRadialGradient(0,0,0,0,0,n.rx);
      g.addColorStop(0,n.color);
      g.addColorStop(1,'transparent');
      ctx.fillStyle=g;
      ctx.scale(1,n.ry/n.rx);
      ctx.beginPath();
      ctx.arc(0,0,n.rx,0,Math.PI*2);
      ctx.fill();
      ctx.restore();
    });
    // Stars parallax (slower than foreground)
    bgStars.forEach(s => {
      s.twinkle+=s.speed;
      const a=0.15+Math.sin(s.twinkle)*0.25;
      const sx = (s.x + scrollY * 0.05) % w;
      const sy = (s.y + scrollY * 0.03) % h;
      ctx.beginPath();
      ctx.arc(sx, sy, s.r, 0, Math.PI*2);
      ctx.fillStyle=`rgba(255,255,255,${a})`;
      ctx.fill();
    });
    for (let i=0;i<neuralNodes.length;i++) for (let j=i+1;j<neuralNodes.length;j++) { const a=neuralNodes[i],b=neuralNodes[j],dist=Math.sqrt((a.x-b.x)**2+(a.y-b.y)**2); if(dist<400) { const al=0.08*(1-dist/400),d1=Math.sqrt((a.x-mouse.x)**2+(a.y-mouse.y)**2),d2=Math.sqrt((b.x-mouse.x)**2+(b.y-mouse.y)**2),mp=Math.max(0,1-Math.min(d1,d2)/200); ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.strokeStyle=`rgba(220,20,60,${al+mp*0.3})`; ctx.lineWidth=mp>0.3?1.5:0.5; ctx.stroke(); if(mp>0.3) { const pp=(Date.now()*0.001+i*0.3)%1,px=a.x+(b.x-a.x)*pp,py=a.y+(b.y-a.y)*pp; ctx.beginPath(); ctx.arc(px,py,2,0,Math.PI*2); ctx.fillStyle='#fff'; ctx.fill(); } } }
  }

  function drawExplosions() {
    explosions.forEach((e,i) => { e.radius+=6; e.alpha-=0.02; if(e.alpha<=0) { explosions.splice(i,1); return; } ctx.beginPath(); ctx.arc(e.x,e.y,e.radius,0,Math.PI*2); ctx.strokeStyle=e.color; ctx.globalAlpha=e.alpha; ctx.lineWidth=2; ctx.stroke(); ctx.beginPath(); ctx.arc(e.x,e.y,e.radius*0.6,0,Math.PI*2); ctx.fillStyle=e.color; ctx.globalAlpha=e.alpha*0.25; ctx.fill(); ctx.globalAlpha=1; });
    particles.forEach((p,i) => { p.x+=p.vx; p.y+=p.vy; p.vx*=0.97; p.vy*=0.97; p.life-=p.decay; if(p.life<=0) { particles.splice(i,1); return; } ctx.beginPath(); ctx.arc(p.x,p.y,p.r*p.life,0,Math.PI*2); ctx.fillStyle=p.color; ctx.globalAlpha=p.life*0.7; ctx.fill(); ctx.globalAlpha=1; });
  }

  // ===== 3D SHAPES (gaming/engine) =====
  let rotX=0, rotY=0;
  const shapes3D = Array.from({ length: 10 }, () => ({
    x: (Math.random()-0.5)*w*1.5, y: (Math.random()-0.5)*h*1.5, z: (Math.random()-0.5)*800,
    size: Math.random()*25+15, rotX: Math.random()*Math.PI, rotY: Math.random()*Math.PI, rotZ: Math.random()*Math.PI,
    rx: (Math.random()-0.5)*0.02, ry: (Math.random()-0.5)*0.02, rz: (Math.random()-0.5)*0.02,
    color: theme.colors[Math.floor(Math.random()*theme.colors.length)], type: Math.floor(Math.random()*4)
  }));

  function project3D(v, shape) {
    let {x, y, z} = v;
    // Rotate X
    let y1 = y * Math.cos(shape.rotX) - z * Math.sin(shape.rotX);
    let z1 = y * Math.sin(shape.rotX) + z * Math.cos(shape.rotX);
    // Rotate Y
    let x2 = x * Math.cos(shape.rotY) + z1 * Math.sin(shape.rotY);
    let z2 = -x * Math.sin(shape.rotY) + z1 * Math.cos(shape.rotY);
    // Rotate Z
    let x3 = x2 * Math.cos(shape.rotZ) - y1 * Math.sin(shape.rotZ);
    let y3 = x2 * Math.sin(shape.rotZ) + y1 * Math.cos(shape.rotZ);
    // Global rotation
    let x4 = x3 * Math.cos(rotY) - z2 * Math.sin(rotY);
    let z4 = x3 * Math.sin(rotY) + z2 * Math.cos(rotY);
    let y4 = y3 * Math.cos(rotX) - z4 * Math.sin(rotX);
    let z5 = y3 * Math.sin(rotX) + z4 * Math.cos(rotX);
    const fov = 400;
    const scale = fov / (fov + z5 + 300);
    return { x: shape.x + x4 * scale, y: shape.y + y4 * scale, scale };
  }

  function draw3DShapes() {
    if (bgType !== 'wireframe' && bgType !== 'starfield') return;
    const distortion = getScrollDistortion();
    rotX += 0.002 * (1 + distortion * 3);
    rotY += 0.003 * (1 + distortion * 3);

    shapes3D.forEach(shape => {
      shape.rotX += shape.rx * (1 + distortion * 4);
      shape.rotY += shape.ry * (1 + distortion * 4);
      shape.rotZ += shape.rz * (1 + distortion * 4);
      shape.z += 0.8 * (1 + distortion * 2);
      if (shape.z > 400) shape.z = -400;

      // Scroll-based position movement
      shape.x += Math.sin(scrollY * 0.002 + shape.rotX) * 0.5;
      shape.y += Math.cos(scrollY * 0.002 + shape.rotY) * 0.5;

      let verts = [];
      if (shape.type === 0) {
        for (let x = -1; x <= 1; x += 2) for (let y = -1; y <= 1; y += 2) for (let z = -1; z <= 1; z += 2) verts.push({x: x*shape.size, y: y*shape.size, z: z*shape.size});
      } else if (shape.type === 1) {
        verts.push({x: 0, y: -shape.size, z: 0});
        for (let i = 0; i < 3; i++) { const a = (i/3)*Math.PI*2; verts.push({x: Math.cos(a)*shape.size, y: shape.size, z: Math.sin(a)*shape.size}); }
      } else if (shape.type === 2) {
        verts.push({x: shape.size, y: 0, z: 0}, {x: -shape.size, y: 0, z: 0});
        verts.push({x: 0, y: shape.size, z: 0}, {x: 0, y: -shape.size, z: 0});
        verts.push({x: 0, y: 0, z: shape.size}, {x: 0, y: 0, z: -shape.size});
      } else {
        for (let i = 0; i < 8; i++) {
          const a = (i/8)*Math.PI*2;
          verts.push({x: Math.cos(a)*shape.size, y: Math.sin(a)*shape.size*0.6, z: (i%3-1)*shape.size*0.5});
        }
      }

      const projected = verts.map(v => project3D(v, shape));

      ctx.strokeStyle = shape.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.25;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i+1; j < projected.length; j++) {
          ctx.beginPath();
          ctx.moveTo(projected[i].x, projected[i].y);
          ctx.lineTo(projected[j].x, projected[j].y);
          ctx.stroke();
        }
      }
      projected.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5 * p.scale, 0, Math.PI*2);
        ctx.fillStyle = shape.color;
        ctx.globalAlpha = 0.4 * p.scale;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    });
  }

  // ===== WAVES (philosophy) =====
  let waveTime = 0;
  const ripples = [];
  window.addEventListener('mousemove', e => { if(Math.random()>0.92) ripples.push({x:e.clientX, y:e.clientY, r:0, maxR:180, alpha:0.8}); });

  function drawWaves() {
    if (bgType !== 'wave') return;
    const distortion = getScrollDistortion();
    waveTime += 0.008 * (1 + distortion * 2);

    for (let layer = 0; layer < 6; layer++) {
      const amp = 35 + layer * 12 + distortion * 20;
      const freq = 0.002 + layer * 0.0004;
      const speed = 0.008 + layer * 0.003 + distortion * 0.01;
      const offset = layer * 45 + scrollY * 0.1; // Waves shift down as you scroll
      const color = theme.colors[layer % theme.colors.length];

      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const d = Math.sqrt((x-mouse.x)**2 + (h*0.5+offset-mouse.y)**2);
        const mi = d < 280 ? Math.sin(d*0.06 - waveTime*2.5) * 35 * (1-d/280) : 0;
        const scrollWave = distortion * 30 * Math.sin(x*0.01 + waveTime*2);
        const y = h*0.5 + offset + Math.sin(x*freq + waveTime*speed) * amp + mi + scrollWave;
        if (x === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.12 + distortion * 0.08;
      ctx.stroke();

      // Glow
      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const d = Math.sqrt((x-mouse.x)**2 + (h*0.5+offset-mouse.y)**2);
        const mi = d < 280 ? Math.sin(d*0.06 - waveTime*2.5) * 35 * (1-d/280) : 0;
        const scrollWave = distortion * 30 * Math.sin(x*0.01 + waveTime*2);
        const y = h*0.5 + offset + Math.sin(x*freq + waveTime*speed) * amp + mi + scrollWave + 12;
        if (x === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.lineWidth = 18;
      ctx.globalAlpha = 0.025 + distortion * 0.015;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ripples.forEach((r,i) => { r.r += 4; r.alpha -= 0.012; if(r.alpha <= 0) { ripples.splice(i,1); return; } ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI*2); ctx.strokeStyle = `rgba(220,20,60,${r.alpha})`; ctx.lineWidth = 1.5; ctx.stroke(); });
  }

  function draw() {
    drawBase();
    galaxies.forEach(g => drawGalaxy(g));
    draw3DShapes();
    drawWaves();
    drawExplosions();
    requestAnimationFrame(draw);
  }

  draw();

})();
