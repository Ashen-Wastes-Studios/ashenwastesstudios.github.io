// Necroware Interactive World Map
// Simplified political map with clean continent outlines
// Monochrome blood-red theme

(function() {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Map state
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let hoveredRegion = null;

  // Color palette (monochrome blood-red)
  const COLORS = {
    ocean: '#0d0808',
    land: '#2a1818',
    border: '#3a1a1a',
    label: '#dc143c',
    city: '#dc143c',
    tooltipBg: 'rgba(15, 5, 5, 0.95)',
    tooltipBorder: '#dc143c',
    tooltipText: '#e0c0c0',
    grid: 'rgba(220, 20, 60, 0.03)',
    corpOverlay: 'rgba(220, 20, 60, 0.2)',
    corpBorder: 'rgba(220, 20, 60, 0.5)'
  };

  // Continent outlines (clean, recognizable shapes)
  const continents = [
    { name: 'North America', polygon: [[3,15],[8,10],[15,8],[22,12],[28,20],[32,30],[30,40],[25,45],[18,48],[12,42],[6,35],[3,25]] },
    { name: 'South America', polygon: [[18,48],[25,45],[30,50],[32,60],[28,72],[20,78],[14,70],[12,58],[15,50]] },
    { name: 'Europe', polygon: [[38,15],[45,10],[52,12],[58,18],[62,25],[58,32],[50,35],[42,30],[38,22]] },
    { name: 'Africa', polygon: [[40,38],[48,35],[55,40],[58,55],[52,68],[42,72],[35,65],[38,50]] },
    { name: 'Asia', polygon: [[58,18],[70,12],[85,15],[92,25],[88,35],[80,40],[70,35],[62,28],[58,22]] },
    { name: 'Australia', polygon: [[78,55],[88,52],[92,58],[88,68],[80,72],[75,65]] },
    { name: 'Antarctica', polygon: [[10,90],[30,88],[50,90],[70,88],[90,90],[90,95],[10,95]] },
    { name: 'Greenland', polygon: [[25,5],[32,3],[35,8],[32,12],[28,12],[25,8]] },
    { name: 'UK', polygon: [[35,18],[38,16],[40,18],[38,22],[36,22]] },
    { name: 'Japan', polygon: [[85,25],[88,22],[90,26],[88,30],[86,28]] },
    { name: 'Madagascar', polygon: [[60,62],[64,60],[66,64],[64,68],[62,66]] },
    { name: 'New Zealand', polygon: [[92,70],[95,68],[97,72],[94,74],[92,72]] }
  ];

  // Country borders (simplified internal divisions)
  const countries = [
    // North America
    { name: 'Canada', parent: 'North America', polygon: [[3,15],[8,10],[15,8],[22,12],[28,20],[32,30],[30,40],[25,45],[18,48],[12,42],[6,35],[3,25]] },
    { name: 'United States', parent: 'North America', polygon: [[6,35],[12,42],[18,48],[25,45],[30,40],[32,30],[28,20],[22,12],[15,8],[8,10],[3,15]] },
    
    // Europe
    { name: 'Russia', parent: 'Europe', polygon: [[58,18],[70,12],[85,15],[92,25],[88,35],[80,40],[70,35],[62,28]] },
    { name: 'Western Europe', parent: 'Europe', polygon: [[38,15],[45,10],[52,12],[58,18],[62,25],[58,32],[50,35],[42,30],[38,22]] },
    
    // Asia
    { name: 'China', parent: 'Asia', polygon: [[62,28],[70,35],[80,40],[88,35],[85,25],[75,18],[65,20]] },
    { name: 'India', parent: 'Asia', polygon: [[62,35],[68,32],[72,38],[68,45],[62,42],[60,38]] },
    { name: 'Southeast Asia', parent: 'Asia', polygon: [[72,38],[78,36],[82,42],[78,48],[72,45],[70,40]] },
    { name: 'Middle East', parent: 'Asia', polygon: [[55,32],[62,28],[65,35],[60,40],[55,38],[52,35]] },
    
    // Africa
    { name: 'North Africa', parent: 'Africa', polygon: [[40,38],[48,35],[55,40],[58,55],[52,68],[42,72],[35,65],[38,50]] },
    { name: 'Sub-Saharan Africa', parent: 'Africa', polygon: [[55,40],[58,55],[52,68],[42,72],[35,65],[38,50],[40,38],[48,35]] },
    
    // South America
    { name: 'Brazil', parent: 'South America', polygon: [[18,48],[25,45],[30,50],[32,60],[28,72],[20,78],[14,70],[12,58],[15,50]] },
    { name: 'Andes', parent: 'South America', polygon: [[15,50],[18,48],[25,45],[30,50],[32,60],[28,72],[20,78],[14,70],[12,58]] },
    
    // Oceania
    { name: 'Australia', parent: 'Australia', polygon: [[78,55],[88,52],[92,58],[88,68],[80,72],[75,65]] }
  ];

  // Corporation territories (overlay)
  const regions = [
    { name: 'Ark Corp', polygon: [[58,18],[70,12],[85,15],[92,25],[88,35],[80,40],[70,35],[62,28],[58,22]] },
    { name: 'X-Technologies', polygon: [[75,35],[88,32],[92,42],[85,50],[75,48],[70,40]] },
    { name: 'Ash District', polygon: [[35,45],[50,42],[58,50],[55,60],[45,65],[35,58],[30,50]] },
    { name: 'VitaCorp', polygon: [[5,18],[15,15],[22,22],[20,32],[12,35],[5,28]] },
    { name: 'Genetico', polygon: [[35,55],[50,52],[55,58],[52,68],[42,72],[32,65]] },
    { name: 'Ironclad', polygon: [[18,38],[28,35],[32,42],[28,48],[18,45],[12,42]] },
    { name: 'OmniSource', polygon: [[55,25],[68,22],[78,28],[75,35],[60,32],[55,28]] },
    { name: 'Synaptic Systems', polygon: [[38,22],[48,20],[52,25],[45,28],[38,25]] }
  ];

  // Cities
  const cities = [
    { name: 'The Spire Ruins', x: 82, y: 38 },
    { name: 'Data Center Omega', x: 48, y: 52 },
    { name: 'MindBridge Facility', x: 42, y: 28 },
    { name: 'Lazarus Facility Alpha', x: 68, y: 18 },
    { name: 'Dead Circuit Hideout', x: 35, y: 52 },
    { name: 'Neo-Kyoto Crater', x: 88, y: 40 },
    { name: 'Corporate Plaza Prime', x: 48, y: 25 },
    { name: 'Ash District Central', x: 45, y: 55 },
    { name: 'VitaCorp Reanimation Center', x: 15, y: 22 },
    { name: 'Genetico Prime Farm', x: 48, y: 60 },
    { name: 'OmniSource Reactor', x: 68, y: 48 },
    { name: 'Ironclad Barracks', x: 25, y: 38 },
    { name: 'Synaptic AI Core', x: 52, y: 24 },
    { name: 'DataVault Server Farm', x: 78, y: 58 },
    { name: 'MediGen Hospital', x: 35, y: 28 }
  ];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
  }

  function drawPolygon(polygon, fill, stroke, lineWidth = 1) {
    if (!polygon || polygon.length < 3) return;
    ctx.beginPath();
    ctx.moveTo(polygon[0][0] * canvas.width / 100, polygon[0][1] * canvas.height / 100);
    for (let i = 1; i < polygon.length; i++) {
      ctx.lineTo(polygon[i][0] * canvas.width / 100, polygon[i][1] * canvas.height / 100);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  function drawBackground() {
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width
    );
    gradient.addColorStop(0, '#1a0e0e');
    gradient.addColorStop(0.5, '#0d0808');
    gradient.addColorStop(1, '#120a0a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawLabels() {
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = COLORS.label;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const labels = [
      { name: 'CANADA', x: 15, y: 13 },
      { name: 'UNITED STATES', x: 14, y: 30 },
      { name: 'BRAZIL', x: 23, y: 60 },
      { name: 'RUSSIA', x: 72, y: 16 },
      { name: 'CHINA', x: 76, y: 32 },
      { name: 'AUSTRALIA', x: 83, y: 64 },
      { name: 'ANTARCTICA', x: 50, y: 92 },
      { name: 'GREENLAND', x: 29, y: 7 },
      { name: 'EUROPE', x: 46, y: 22 },
      { name: 'AFRICA', x: 48, y: 55 },
      { name: 'JAPAN', x: 89, y: 27 }
    ];

    labels.forEach(label => {
      ctx.fillText(label.name, label.x * canvas.width / 100, label.y * canvas.height / 100);
    });
  }

  function drawCity(city, isHovered) {
    const x = city.x * canvas.width / 100;
    const y = city.y * canvas.height / 100;
    const radius = isHovered ? 8 : 5;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
    gradient.addColorStop(0, isHovered ? 'rgba(220, 20, 60, 0.8)' : 'rgba(220, 20, 60, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = isHovered ? '#ffffff' : COLORS.city;
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = isHovered ? 'bold 14px Inter, sans-serif' : '12px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(city.name, x, y - radius - 8);
    ctx.shadowBlur = 0;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    // Draw continents
    continents.forEach(continent => {
      const isHovered = hoveredRegion === continent.name;
      drawPolygon(continent.polygon, COLORS.land, isHovered ? '#ffffff' : COLORS.border, isHovered ? 2 : 0.5);
    });

    // Draw country borders
    countries.forEach(country => {
      drawPolygon(country.polygon, 'rgba(0,0,0,0)', COLORS.border, 0.5);
    });

    // Draw corporation territories
    regions.forEach(region => {
      const isHovered = hoveredRegion === region.name;
      drawPolygon(region.polygon, isHovered ? 'rgba(220, 20, 60, 0.35)' : COLORS.corpOverlay, isHovered ? '#ffffff' : COLORS.corpBorder, isHovered ? 3 : 1.5);
    });

    // Draw labels
    drawLabels();

    // Draw cities
    cities.forEach(city => {
      const isHovered = hoveredRegion === city.name;
      drawCity(city, isHovered);
    });

    // Draw tooltip
    if (hoveredRegion) {
      drawTooltip();
    }
  }

  function drawTooltip() {
    const all = [...continents, ...regions, ...cities];
    const region = all.find(r => r.name === hoveredRegion);
    if (!region || !region.description) return;

    const padding = 15;
    const maxWidth = 300;
    ctx.font = '14px Inter, sans-serif';
    const words = region.description.split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    if (currentLine) lines.push(currentLine);

    const lineHeight = 20;
    const tooltipWidth = maxWidth + padding * 2;
    const tooltipHeight = lines.length * lineHeight + padding * 2 + 30;

    let tooltipX = lastMouseX + 20;
    let tooltipY = lastMouseY + 20;
    if (tooltipX + tooltipWidth > canvas.width) tooltipX = lastMouseX - tooltipWidth - 20;
    if (tooltipY + tooltipHeight > canvas.height) tooltipY = lastMouseY - tooltipHeight - 20;

    ctx.fillStyle = COLORS.tooltipBg;
    ctx.strokeStyle = COLORS.tooltipBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
    ctx.fill();
    ctx.stroke();

    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillStyle = COLORS.tooltipBorder;
    ctx.textAlign = 'left';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(region.name, tooltipX + padding, tooltipY + padding + 15);
    ctx.shadowBlur = 0;

    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = COLORS.tooltipText;
    lines.forEach((line, i) => {
      ctx.fillText(line, tooltipX + padding, tooltipY + padding + 40 + i * lineHeight);
    });
  }

  function isPointInPolygon(x, y, polygon) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0] * canvas.width / 100;
      const yi = polygon[i][1] * canvas.height / 100;
      const xj = polygon[j][0] * canvas.width / 100;
      const yj = polygon[j][1] * canvas.height / 100;

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  }

  function getRegionAtPoint(x, y) {
    // Cities first
    for (const city of cities) {
      const cx = city.x * canvas.width / 100;
      const cy = city.y * canvas.height / 100;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist < 15) return city.name;
    }

    // Corporation regions
    for (const region of regions) {
      if (isPointInPolygon(x, y, region.polygon)) {
        return region.name;
      }
    }

    // Continents
    for (const continent of continents) {
      if (isPointInPolygon(x, y, continent.polygon)) {
        return continent.name;
      }
    }

    return null;
  }

  // Event handlers
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging) {
      offsetX += x - lastMouseX;
      offsetY += y - lastMouseY;
      lastMouseX = x;
      lastMouseY = y;
      draw();
      return;
    }

    lastMouseX = x;
    lastMouseY = y;

    const newHovered = getRegionAtPoint(x, y);
    if (newHovered !== hoveredRegion) {
      hoveredRegion = newHovered;
      canvas.style.cursor = hoveredRegion ? 'pointer' : 'default';
      draw();
    }
  });

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      isDragging = true;
      lastMouseX = e.clientX - canvas.getBoundingClientRect().left;
      lastMouseY = e.clientY - canvas.getBoundingClientRect().top;
      canvas.style.cursor = 'grabbing';
    }
  });

  canvas.addEventListener('mouseup', () => {
    isDragging = false;
    canvas.style.cursor = hoveredRegion ? 'pointer' : 'default';
  });

  canvas.addEventListener('mouseleave', () => {
    isDragging = false;
    hoveredRegion = null;
    canvas.style.cursor = 'default';
    draw();
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const wheel = e.deltaY < 0 ? 1 : -1;
    const zoom = Math.exp(wheel * zoomIntensity);

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newScale = Math.max(0.5, Math.min(5, scale * zoom));
    const scaleChange = newScale / scale;

    offsetX = mouseX - (mouseX - offsetX) * scaleChange;
    offsetY = mouseY - (mouseY - offsetY) * scaleChange;
    scale = newScale;

    draw();
  }, { passive: false });

  // Touch support
  let lastTouchDistance = 0;

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      lastMouseX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
      lastMouseY = e.touches[0].clientY - canvas.getBoundingClientRect().top;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
    }
  });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && isDragging) {
      const x = e.touches[0].clientX - canvas.getBoundingClientRect().left;
      const y = e.touches[0].clientY - canvas.getBoundingClientRect().top;
      offsetX += x - lastMouseX;
      offsetY += y - lastMouseY;
      lastMouseX = x;
      lastMouseY = y;
      draw();
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const zoom = distance / lastTouchDistance;
      scale = Math.max(0.5, Math.min(5, scale * zoom));
      lastTouchDistance = distance;
      draw();
    }
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    isDragging = false;
  });

  // Initialize
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Expose API
  window.necrowareMap = {
    reset: () => {
      scale = 1;
      offsetX = 0;
      offsetY = 0;
      draw();
    },
    zoomTo: (regionName) => {
      const all = [...continents, ...regions, ...cities];
      const region = all.find(r => r.name === regionName);
      if (region) {
        if (region.polygon) {
          const centerX = region.polygon.reduce((sum, p) => sum + p[0], 0) / region.polygon.length;
          const centerY = region.polygon.reduce((sum, p) => sum + p[1], 0) / region.polygon.length;
          scale = 2;
          offsetX = canvas.width / 2 - (centerX * canvas.width / 100) * scale;
          offsetY = canvas.height / 2 - (centerY * canvas.height / 100) * scale;
          draw();
        } else if (region.x !== undefined) {
          scale = 2;
          offsetX = canvas.width / 2 - (region.x * canvas.width / 100) * scale;
          offsetY = canvas.height / 2 - (region.y * canvas.height / 100) * scale;
          draw();
        }
      }
    }
  };

})();
