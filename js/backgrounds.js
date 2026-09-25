// GALAXY UNIVERSE — Full Featured Version
function initBackgrounds() {
  const bgType = document.body.dataset.bg || 'particles';
  
  // Skip backgrounds if no section-bg system active
  if (bgType === 'map' || bgType === 'cynchure' || !document.body.dataset.sectionBgs) return;
  
  // Check if canvas already exists (e.g., for interactive map)
  let canvas = document.getElementById('bg-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
    document.body.prepend(canvas);
  }
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

  const themes = {
    particles: { colors: ['#dc143c', '#ff6b6b', '#ff8e53', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff'], spiralArms: [2, 3, 4], gridSpacing: 300, connectionDist: 400 },
    neural: { colors: ['#dc143c', '#ff4757', '#ff6348', '#c44569', '#f8b500'], spiralArms: [3, 4, 5], gridSpacing: 350, connectionDist: 450 },
    ashen: { colors: ['#dc143c', '#ff4757', '#ff6b6b', '#ff8e53', '#feca57', '#48dbfb'], spiralArms: [3, 4], gridSpacing: 320, connectionDist: 420 },
    matrix: { colors: ['#00ff41', '#39ff14', '#00ff00', '#7fff00', '#dc143c'], spiralArms: [2, 3], gridSpacing: 400, connectionDist: 500 },
    wireframe: { colors: ['#dc143c', '#ff4757', '#ff6348', '#f8b500', '#48dbfb', '#54a0ff'], spiralArms: [4, 5, 6], gridSpacing: 350, connectionDist: 450 },
    starfield: { colors: ['#dc143c', '#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3'], spiralArms: [2, 3, 4, 5], gridSpacing: 280, connectionDist: 380 },
    wave: { colors: ['#dc143c', '#c44569', '#f8b500', '#48dbfb', '#54a0ff', '#5f27cd'], spiralArms: [2, 3], gridSpacing: 380, connectionDist: 480 },
    cynchure: { colors: ['#dc143c', '#ff4757', '#ff6b6b', '#ff8e53'], spiralArms: [3, 4], gridSpacing: 300, connectionDist: 400 }
  };

  const theme = themes[bgType] || themes.particles;

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
    nebulae.forEach(n => {
      ctx.save();
      ctx.translate(n.x + scrollY * 0.1, n.y + scrollY * 0.05);
      ctx.rotate(n.rotation + scrollY * 0.0001);
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, n.rx);
      gradient.addColorStop(0, n.color);
      gradient.addColorStop(1, 'transparent');
      ctx.fillStyle = gradient;
      ctx.scale(1, n.ry / n.rx);
      ctx.beginPath();
      ctx.arc(0, 0, n.rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    bgStars.forEach(s => {
      s.twinkle += s.speed;
      const a = 0.15 + Math.sin(s.twinkle) * 0.25;
      const sx = (s.x + scrollY * 0.05) % w;
      const sy = (s.y + scrollY * 0.03) % h;
      ctx.beginPath();
      ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${a})`;
      ctx.fill();
    });
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
    explosions.forEach((e, i) => {
      e.radius += 6;
      e.alpha -= 0.02;
      if (e.alpha <= 0) { explosions.splice(i, 1); return; }
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.strokeStyle = e.color;
      ctx.globalAlpha = e.alpha;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = e.color;
      ctx.globalAlpha = e.alpha * 0.25;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
    particles.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.97;
      p.vy *= 0.97;
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); return; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life * 0.7;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  // Page-specific visuals
  const dataStreams = Array.from({ length: 15 }, () => ({
    x: Math.random() * w, y: Math.random() * h,
    speed: Math.random() * 1.5 + 0.5,
    chars: Array.from({ length: 8 }, () => String.fromCharCode(0x30A0 + Math.random() * 96)),
    opacity: Math.random() * 0.2 + 0.05
  }));

  function drawDataStreams() {
    if (bgType !== 'neural' && bgType !== 'ashen') return;
    ctx.font = '11px monospace';
    dataStreams.forEach(s => {
      s.y += s.speed;
      if (s.y > h + 100) { s.y = -100; s.x = Math.random() * w; }
      s.chars.forEach((char, i) => {
        const y = s.y + i * 12;
        if (y > 0 && y < h) {
          ctx.fillStyle = `rgba(220, 20, 60, ${s.opacity * (1 - i / s.chars.length)})`;
          ctx.fillText(char, s.x, y);
        }
      });
    });
  }

  const matrixDrops = Array.from({ length: 40 }, () => ({
    x: Math.random() * w, y: Math.random() * -h,
    speed: Math.random() * 2.5 + 1.5,
    chars: Array.from({ length: 15 }, () => String.fromCharCode(0x30A0 + Math.random() * 96))
  }));

  function drawMatrixRain() {
    if (bgType !== 'matrix') return;
    ctx.font = 'bold 13px monospace';
    matrixDrops.forEach(drop => {
      drop.y += drop.speed;
      if (drop.y > h + 200) { drop.y = -Math.random() * 200; drop.x = Math.random() * w; }
      drop.chars.forEach((char, ci) => {
        const y = drop.y + ci * 13;
        if (y > 0 && y < h) {
          const d = Math.sqrt((drop.x - mouse.x) ** 2 + (y - mouse.y) ** 2);
          const glow = d < 100 ? 0.5 * (1 - d / 100) : 0;
          const alpha = ci === 0 ? 1 : 0.12 * (1 - ci / drop.chars.length);
          ctx.fillStyle = `rgba(0, 255, 65, ${alpha + glow})`;
          ctx.fillText(char, drop.x, y);
          if (ci === 0) { ctx.fillStyle = '#fff'; ctx.fillText(char, drop.x, y); }
        }
      });
    });
  }

  let rotX = 0, rotY = 0;
  const shapes3D = Array.from({ length: 8 }, () => ({
    x: (Math.random() - 0.5) * w * 1.5, y: (Math.random() - 0.5) * h * 1.5,
    z: (Math.random() - 0.5) * 600, size: Math.random() * 25 + 15,
    rotX: Math.random() * Math.PI, rotY: Math.random() * Math.PI, rotZ: Math.random() * Math.PI,
    rx: (Math.random() - 0.5) * 0.02, ry: (Math.random() - 0.5) * 0.02, rz: (Math.random() - 0.5) * 0.02,
    color: theme.colors[Math.floor(Math.random() * theme.colors.length)],
    type: Math.floor(Math.random() * 4)
  }));

  function project3D(v, shape) {
    let {x, y, z} = v;
    let y1 = y * Math.cos(shape.rotX) - z * Math.sin(shape.rotX);
    let z1 = y * Math.sin(shape.rotX) + z * Math.cos(shape.rotX);
    let x2 = x * Math.cos(shape.rotY) + z1 * Math.sin(shape.rotY);
    let z2 = -x * Math.sin(shape.rotY) + z1 * Math.cos(shape.rotY);
    let x3 = x2 * Math.cos(shape.rotZ) - y1 * Math.sin(shape.rotZ);
    let y3 = x2 * Math.sin(shape.rotZ) + y1 * Math.cos(shape.rotZ);
    let x4 = x3 * Math.cos(rotY) - z2 * Math.sin(rotY);
    let z4 = x3 * Math.sin(rotY) + z2 * Math.cos(rotY);
    let y4 = y3 * Math.cos(rotX) - z4 * Math.sin(rotX);
    let z5 = y3 * Math.sin(rotX) + z4 * Math.cos(rotX);
    const fov = 400;
    const scale = fov / (fov + z5 + 250);
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
      if (shape.z > 300) shape.z = -300;
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
        for (let i = 0; i < 8; i++) { const a = (i/8)*Math.PI*2; verts.push({x: Math.cos(a)*shape.size, y: Math.sin(a)*shape.size*0.6, z: (i%3-1)*shape.size*0.5}); }
      }

      const projected = verts.map(v => project3D(v, shape));

      ctx.strokeStyle = shape.color;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.2;
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
        ctx.arc(p.x, p.y, 2 * p.scale, 0, Math.PI*2);
        ctx.fillStyle = shape.color;
        ctx.globalAlpha = 0.3 * p.scale;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    });
  }

  let waveTime = 0;
  const ripples = [];
  window.addEventListener('mousemove', e => { if (Math.random() > 0.92) ripples.push({x: e.clientX, y: e.clientY, r: 0, alpha: 0.8}); });

  function drawWaves() {
    if (bgType !== 'wave') return;
    const distortion = getScrollDistortion();
    waveTime += 0.008 * (1 + distortion * 2);

    for (let layer = 0; layer < 5; layer++) {
      const amp = 30 + layer * 10 + distortion * 15;
      const freq = 0.002 + layer * 0.0003;
      const speed = 0.008 + layer * 0.002 + distortion * 0.005;
      const offset = layer * 40 + scrollY * 0.1;
      const color = theme.colors[layer % theme.colors.length];

      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const d = Math.sqrt((x-mouse.x)**2 + (h*0.5+offset-mouse.y)**2);
        const mi = d < 250 ? Math.sin(d*0.06 - waveTime*2.5) * 25 * (1-d/250) : 0;
        const scrollWave = distortion * 20 * Math.sin(x*0.01 + waveTime*2);
        const y = h*0.5 + offset + Math.sin(x*freq + waveTime*speed) * amp + mi + scrollWave;
        if (x === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.1 + distortion * 0.05;
      ctx.stroke();

      ctx.beginPath();
      for (let x = 0; x <= w; x += 4) {
        const d = Math.sqrt((x-mouse.x)**2 + (h*0.5+offset-mouse.y)**2);
        const mi = d < 250 ? Math.sin(d*0.06 - waveTime*2.5) * 25 * (1-d/250) : 0;
        const scrollWave = distortion * 20 * Math.sin(x*0.01 + waveTime*2);
        const y = h*0.5 + offset + Math.sin(x*freq + waveTime*speed) * amp + mi + scrollWave + 10;
        if (x === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.lineWidth = 15;
      ctx.globalAlpha = 0.02 + distortion * 0.01;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    ripples.forEach((r,i) => { r.r += 4; r.alpha -= 0.012; if(r.alpha <= 0) { ripples.splice(i,1); return; } ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI*2); ctx.strokeStyle = `rgba(220,20,60,${r.alpha})`; ctx.lineWidth = 1.5; ctx.stroke(); });
  }

  function draw() {
    drawBase();
    const visibleGalaxies = getVisibleGalaxies();
    drawNeuralConnections(visibleGalaxies);
    visibleGalaxies.forEach(g => drawGalaxy(g));
    drawDataStreams();
    drawMatrixRain();
    draw3DShapes();
    drawWaves();
    drawExplosions();
    requestAnimationFrame(draw);
  }

  draw();
}
