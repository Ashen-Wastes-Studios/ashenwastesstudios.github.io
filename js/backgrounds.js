// Interactive Visual Images for All Pages
(function() {
  const canvas = document.createElement('canvas');
  canvas.id = 'bg-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;opacity:0.6;';
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');

  let w, h;
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const mouse = { x: w/2, y: h/2, active: false };
  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;
  });
  window.addEventListener('mouseleave', () => mouse.active = false);

  const bgType = document.body.dataset.bg || 'particles';
  const accent = '#dc143c';

  function getAlpha(base, dist, maxDist) {
    return Math.max(0, base * (1 - dist / maxDist));
  }

  function distance(x1, y1, x2, y2) {
    return Math.sqrt((x1-x2)**2 + (y1-y2)**2);
  }

  // ===== INTERACTIVE PARTICLES (index) =====
  if (bgType === 'particles') {
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      baseX: 0, baseY: 0,
      vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5,
      r: Math.random()*3+1, color: accent
    }));
    particles.forEach(p => { p.baseX = p.x; p.baseY = p.y; });

    function draw() {
      ctx.clearRect(0,0,w,h);
      particles.forEach(p => {
        // React to mouse
        const d = distance(p.x, p.y, mouse.x, mouse.y);
        if (d < 200) {
          const angle = Math.atan2(p.y - mouse.y, p.x - mouse.x);
          p.vx += Math.cos(angle) * 0.02;
          p.vy += Math.sin(angle) * 0.02;
        }
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.99; p.vy *= 0.99;
        if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;

        // Draw connections
        particles.forEach(p2 => {
          const d2 = distance(p.x, p.y, p2.x, p2.y);
          if (d2 < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(220,20,60,${0.1*(1-d2/150)})`;
            ctx.stroke();
          }
        });

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = accent;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ===== NEURAL NETWORK (ai, ashen-gpt) =====
  else if (bgType === 'neural') {
    const layers = [4, 6, 8, 6, 4];
    const nodes = [];
    layers.forEach((count, li) => {
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: (li + 0.5) * (w / layers.length),
          y: (i + 0.5) * (h / count),
          r: 4,
          pulse: Math.random() * Math.PI * 2
        });
      }
    });

    function draw() {
      ctx.clearRect(0,0,w,h);
      // Draw connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i+1; j < nodes.length; j++) {
          if (Math.abs(nodes[i].x - nodes[j].x) < w/layers.length + 10) {
            const d = distance(nodes[i].x, nodes[i].y, mouse.x, mouse.y);
            const glow = d < 200 ? 0.15 * (1 - d/200) : 0.03;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(220,20,60,${glow})`;
            ctx.stroke();
          }
        }
      }
      // Draw nodes
      nodes.forEach(n => {
        n.pulse += 0.03;
        const glow = Math.sin(n.pulse) * 0.5 + 0.5;
        const d = distance(n.x, n.y, mouse.x, mouse.y);
        const proximity = d < 150 ? (1 - d/150) * 10 : 0;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + proximity + glow, 0, Math.PI*2);
        ctx.fillStyle = `rgba(220,20,60,${0.3 + glow*0.4})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ===== MATRIX RAIN (chat) =====
  else if (bgType === 'matrix') {
    const fontSize = 14;
    const columns = Math.floor(w / fontSize);
    const drops = Array.from({length: columns}, () => ({
      y: Math.random() * -100,
      speed: Math.random() * 2 + 1,
      chars: Array.from({length: 20}, () => String.fromCharCode(0x30A0 + Math.random() * 96))
    }));

    function draw() {
      ctx.fillStyle = 'rgba(10,10,15,0.05)';
      ctx.fillRect(0,0,w,h);
      ctx.font = `${fontSize}px monospace`;
      drops.forEach((drop, i) => {
        const x = i * fontSize;
        drop.chars.forEach((char, ci) => {
          const y = (drop.y + ci) * fontSize;
          if (y > 0 && y < h) {
            const alpha = ci === 0 ? 0.4 : 0.1 * (1 - ci/drop.chars.length);
            const d = distance(x, y, mouse.x, mouse.y);
            const glow = d < 100 ? 0.3 * (1 - d/100) : 0;
            ctx.fillStyle = `rgba(220,20,60,${alpha + glow})`;
            ctx.fillText(char, x, y);
          }
        });
        drop.y += drop.speed;
        if (drop.y * fontSize > h + drop.chars.length * fontSize) {
          drop.y = -Math.random() * 50;
          drop.chars = Array.from({length: 20}, () => String.fromCharCode(0x30A0 + Math.random() * 96));
        }
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ===== 3D WIREFRAME (gaming-tech, engine-docs) =====
  else if (bgType === 'wireframe') {
    let rotX = 0, rotY = 0;
    const points = [];
    const size = 8;
    const spacing = 40;
    for (let x = -size; x <= size; x++) {
      for (let y = -size; y <= size; y++) {
        for (let z = -size; z <= size; z++) {
          if (Math.random() > 0.7) {
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
      ctx.clearRect(0,0,w,h);
      rotY += 0.005;
      rotX += 0.002;

      const transformed = points.map(p => {
        let {x, y, z} = p;
        // Rotate Y
        let x1 = x * Math.cos(rotY) - z * Math.sin(rotY);
        let z1 = x * Math.sin(rotY) + z * Math.cos(rotY);
        // Rotate X
        let y1 = y * Math.cos(rotX) - z1 * Math.sin(rotX);
        let z2 = y * Math.sin(rotX) + z1 * Math.cos(rotX);
        return { x: x1, y: y1, z: z2 };
      });

      transformed.forEach(p => {
        const proj = project(p.x, p.y, p.z);
        const d = distance(proj.x, proj.y, mouse.x, mouse.y);
        const glow = d < 150 ? (1 - d/150) * 0.5 : 0;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 2 * proj.scale + glow, 0, Math.PI*2);
        ctx.fillStyle = `rgba(220,20,60,${0.15 * proj.scale + glow})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ===== STARFIELD (games) =====
  else if (bgType === 'starfield') {
    const stars = Array.from({length: 100}, () => ({
      x: (Math.random()-0.5)*w*2, y: (Math.random()-0.5)*h*2, z: Math.random()*1000
    }));

    function draw() {
      ctx.clearRect(0,0,w,h);
      stars.forEach(s => {
        s.z -= 2;
        if (s.z <= 0) {
          s.z = 1000;
          s.x = (Math.random()-0.5)*w*2;
          s.y = (Math.random()-0.5)*h*2;
        }
        const sx = (s.x / s.z) * 300 + w/2;
        const sy = (s.y / s.z) * 300 + h/2;
        const size = Math.max(0, (1000-s.z)/200);
        const d = distance(sx, sy, mouse.x, mouse.y);
        const glow = d < 100 ? (1 - d/100) * 0.5 : 0;
        ctx.beginPath();
        ctx.arc(sx, sy, size + glow, 0, Math.PI*2);
        ctx.fillStyle = `rgba(220,20,60,${Math.min(1, (1000-s.z)/500) + glow})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ===== WAVE FLOW (philosophy) =====
  else if (bgType === 'wave') {
    let time = 0;
    const waves = [
      { amp: 30, freq: 0.003, speed: 0.02, offset: 0 },
      { amp: 20, freq: 0.005, speed: 0.03, offset: 100 },
      { amp: 15, freq: 0.007, speed: 0.04, offset: 200 }
    ];

    function draw() {
      ctx.clearRect(0,0,w,h);
      time += 0.01;
      waves.forEach((wave, wi) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const d = distance(x, h*0.5 + wave.offset, mouse.x, mouse.y);
          const mouseInfluence = d < 200 ? Math.sin(d * 0.05) * 20 * (1 - d/200) : 0;
          const y = h*0.5 + wave.offset + Math.sin(x * wave.freq + time * wave.speed) * wave.amp + mouseInfluence;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(220,20,60,${0.15 - wi*0.03})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

})();
