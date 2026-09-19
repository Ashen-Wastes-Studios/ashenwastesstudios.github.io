// EXPLOSIVE Interactive Backgrounds for Ashen Wastes Studios
(function() {
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let w, h;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const mouse = { x: w/2, y: h/2, active: false, down: false };
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; });
  window.addEventListener('mousedown', e => { mouse.down = true; createExplosion(mouse.x, mouse.y); });
  window.addEventListener('mouseup', () => mouse.down = false);
  window.addEventListener('mouseleave', () => mouse.active = false);

  const bgType = document.body.dataset.bg || 'particles';

  // Explosion effects array
  const explosions = [];

  function createExplosion(x, y) {
    explosions.push({ x, y, radius: 0, maxRadius: 200, alpha: 1, color: `hsl(${Math.random()*30+350}, 100%, 50%)` });
  }

  function drawExplosions() {
    explosions.forEach((e, i) => {
      e.radius += 8;
      e.alpha -= 0.02;
      if (e.alpha <= 0) { explosions.splice(i, 1); return; }
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
      ctx.strokeStyle = e.color;
      ctx.globalAlpha = e.alpha;
      ctx.lineWidth = 3;
      ctx.stroke();
      // Glow
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.radius * 0.7, 0, Math.PI * 2);
      ctx.fillStyle = e.color;
      ctx.globalAlpha = e.alpha * 0.3;
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  // ===== EXPLOSIVE PARTICLES (index) =====
  if (bgType === 'particles') {
    const particles = Array.from({ length: 150 }, () => ({
      x: Math.random()*w, y: Math.random()*h,
      vx: (Math.random()-0.5)*1.5, vy: (Math.random()-0.5)*1.5,
      r: Math.random()*4+1, color: `hsl(${Math.random()*30+350}, 100%, 50%)`
    }));

    function draw() {
      ctx.fillStyle = 'rgba(10,10,15,0.1)';
      ctx.fillRect(0,0,w,h);
      particles.forEach(p => {
        // Flee from mouse
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 250) {
          const force = (250 - d) / 250;
          p.vx += (dx/d) * force * 0.5;
          p.vy += (dy/d) * force * 0.5;
        }
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.96; p.vy *= 0.96;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

        // Glow trail
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r*3, 0, Math.PI*2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.2;
        ctx.fill();
        // Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
      // Connections
      ctx.globalAlpha = 0.3;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i+1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(220,20,60,${0.3*(1-dist/120)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      drawExplosions();
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ===== EXPLOSIVE NEURAL (ai, ashen-gpt) =====
  else if (bgType === 'neural') {
    const nodes = Array.from({ length: 80 }, () => ({
      x: Math.random()*w, y: Math.random()*h,
      vx: (Math.random()-0.5)*0.8, vy: (Math.random()-0.5)*0.8,
      r: Math.random()*5+2, pulse: Math.random()*Math.PI*2
    }));

    function draw() {
      ctx.fillStyle = 'rgba(10,10,15,0.08)';
      ctx.fillRect(0,0,w,h);
      nodes.forEach(n => {
        n.pulse += 0.05;
        const d = Math.sqrt((n.x-mouse.x)**2 + (n.y-mouse.y)**2);
        if (d < 200) {
          n.r = 5 + Math.sin(n.pulse) * 3 + (200-d)/30;
        } else {
          n.r = 3 + Math.sin(n.pulse) * 2;
        }
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        // Outer glow
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r*3, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(220,20,60,0.3)';
        ctx.fill();
        // Inner core
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI*2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      });
      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i+1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx*dx + dy*dy);
          if (dist < 180) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(220,20,60,${0.2*(1-dist/180)})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }
      drawExplosions();
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ===== EXPLOSIVE MATRIX (chat) =====
  else if (bgType === 'matrix') {
    const fontSize = 16;
    const columns = Math.floor(w / fontSize);
    const drops = Array.from({length: columns}, () => ({
      y: Math.random() * -200,
      speed: Math.random() * 3 + 2,
      chars: Array.from({length: 25}, () => String.fromCharCode(0x30A0 + Math.random() * 96))
    }));

    function draw() {
      ctx.fillStyle = 'rgba(10,10,15,0.06)';
      ctx.fillRect(0,0,w,h);
      ctx.font = `bold ${fontSize}px monospace`;
      drops.forEach((drop, i) => {
        const x = i * fontSize;
        drop.chars.forEach((char, ci) => {
          const y = (drop.y + ci) * fontSize;
          if (y > 0 && y < h) {
            const d = Math.sqrt((x-mouse.x)**2 + (y-mouse.y)**2);
            const glow = d < 120 ? 0.8 * (1 - d/120) : 0;
            const alpha = ci === 0 ? 1 : 0.2 * (1 - ci/drop.chars.length);
            ctx.fillStyle = `rgba(220,20,60,${alpha + glow})`;
            ctx.fillText(char, x, y);
            // Bright lead character
            if (ci === 0) {
              ctx.fillStyle = '#fff';
              ctx.fillText(char, x, y);
            }
          }
        });
        drop.y += drop.speed;
        if (drop.y * fontSize > h + drop.chars.length * fontSize) {
          drop.y = -Math.random() * 100;
        }
      });
      drawExplosions();
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ===== EXPLOSIVE WIREFRAME (gaming-tech, engine-docs) =====
  else if (bgType === 'wireframe') {
    let rotX = 0, rotY = 0;
    const points = [];
    const size = 10;
    const spacing = 50;
    for (let x = -size; x <= size; x++) {
      for (let y = -size; y <= size; y++) {
        for (let z = -size; z <= size; z++) {
          if (Math.random() > 0.6) {
            points.push({x: x*spacing, y: y*spacing, z: z*spacing});
          }
        }
      }
    }

    function project(x, y, z) {
      const fov = 400;
      const scale = fov / (fov + z + 300);
      return { x: w/2 + x * scale, y: h/2 + y * scale, scale };
    }

    function draw() {
      ctx.fillStyle = 'rgba(10,10,15,0.1)';
      ctx.fillRect(0,0,w,h);
      rotY += 0.008;
      rotX += 0.004;

      points.forEach(p => {
        let {x, y, z} = p;
        let x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
        let z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
        let y1 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
        let z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
        const proj = project(x1, y1, z2);
        const d = Math.sqrt((proj.x-mouse.x)**2 + (proj.y-mouse.y)**2);
        const glow = d < 180 ? (1 - d/180) * 2 : 0;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 3 * proj.scale + glow, 0, Math.PI*2);
        ctx.fillStyle = `rgba(220,20,60,${0.3 * proj.scale + glow})`;
        ctx.fill();
        if (glow > 0.5) {
          ctx.beginPath();
          ctx.arc(proj.x, proj.y, 6 + glow, 0, Math.PI*2);
          ctx.fillStyle = `rgba(220,20,60,${glow * 0.5})`;
          ctx.fill();
        }
      });
      drawExplosions();
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ===== EXPLOSIVE STARFIELD (games) =====
  else if (bgType === 'starfield') {
    const stars = Array.from({length: 200}, () => ({
      x: (Math.random()-0.5)*w*3, y: (Math.random()-0.5)*h*3, z: Math.random()*1500, trail: []
    }));

    function draw() {
      ctx.fillStyle = 'rgba(10,10,15,0.08)';
      ctx.fillRect(0,0,w,h);
      stars.forEach(s => {
        s.z -= 4;
        if (s.z <= 0) {
          s.z = 1500;
          s.x = (Math.random()-0.5)*w*3;
          s.y = (Math.random()-0.5)*h*3;
          s.trail = [];
        }
        const sx = (s.x / s.z) * 400 + w/2;
        const sy = (s.y / s.z) * 400 + h/2;
        const size = Math.max(0, (1500-s.z)/200);
        const d = Math.sqrt((sx-mouse.x)**2 + (sy-mouse.y)**2);
        const glow = d < 120 ? (1 - d/120) * 3 : 0;
        // Trail
        s.trail.push({x: sx, y: sy});
        if (s.trail.length > 5) s.trail.shift();
        s.trail.forEach((t, i) => {
          ctx.beginPath();
          ctx.arc(t.x, t.y, size * (i/s.trail.length), 0, Math.PI*2);
          ctx.fillStyle = `rgba(220,20,60,${0.3 * (i/s.trail.length)})`;
          ctx.fill();
        });
        ctx.beginPath();
        ctx.arc(sx, sy, size + glow, 0, Math.PI*2);
        ctx.fillStyle = '#fff';
        ctx.fill();
      });
      drawExplosions();
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ===== EXPLOSIVE WAVES (philosophy) =====
  else if (bgType === 'wave') {
    let time = 0;
    const waves = [
      { amp: 50, freq: 0.002, speed: 0.03, offset: 0 },
      { amp: 35, freq: 0.004, speed: 0.04, offset: 80 },
      { amp: 25, freq: 0.006, speed: 0.05, offset: 160 }
    ];
    const ripples = [];

    window.addEventListener('mousemove', e => {
      if (Math.random() > 0.92) {
        ripples.push({ x: e.clientX, y: e.clientY, r: 0, maxR: 150, alpha: 1 });
      }
    });

    function draw() {
      ctx.fillStyle = 'rgba(10,10,15,0.05)';
      ctx.fillRect(0,0,w,h);
      time += 0.02;
      waves.forEach((wave, wi) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const d = Math.sqrt((x-mouse.x)**2 + (h*0.5+wave.offset-mouse.y)**2);
          const mouseInfluence = d < 250 ? Math.sin(d*0.08 - time*2) * 30 * (1-d/250) : 0;
          const y = h*0.5 + wave.offset + Math.sin(x * wave.freq + time * wave.speed) * wave.amp + mouseInfluence;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(220,20,60,${0.2 - wi*0.04})`;
        ctx.lineWidth = 3;
        ctx.stroke();
        // Glow under wave
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const d = Math.sqrt((x-mouse.x)**2 + (h*0.5+wave.offset-mouse.y)**2);
          const mouseInfluence = d < 250 ? Math.sin(d*0.08 - time*2) * 30 * (1-d/250) : 0;
          const y = h*0.5 + wave.offset + Math.sin(x * wave.freq + time * wave.speed) * wave.amp + mouseInfluence;
          if (x === 0) ctx.moveTo(x, y+10);
          else ctx.lineTo(x, y+10);
        }
        ctx.strokeStyle = `rgba(220,20,60,${0.05 - wi*0.01})`;
        ctx.lineWidth = 15;
        ctx.stroke();
      });
      // Ripples
      ripples.forEach((r, i) => {
        r.r += 4;
        r.alpha -= 0.015;
        if (r.alpha <= 0) { ripples.splice(i, 1); return; }
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.r, 0, Math.PI*2);
        ctx.strokeStyle = `rgba(220,20,60,${r.alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      drawExplosions();
      requestAnimationFrame(draw);
    }
    draw();
  }

})();
