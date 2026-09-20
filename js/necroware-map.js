// Necroware Interactive World Map
// Equirectangular political map with pastel colors, matching the reference style
// Overlay: Necroware 2197 corporation territories on top of real-world geography

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

  // Color palette (monochrome blood-red theme)
  const COLORS = {
    // Base ocean - dark desaturated red
    ocean: '#1a0a0a',
    // Land variations - dark grays with subtle red tint
    landDark: '#2a1515',
    landMedium: '#3a1a1a',
    landLight: '#4a2020',
    landHighlight: '#5a2525',
    // Borders - muted red
    border: '#4a1a1a',
    borderLight: '#5a2525',
    // Labels - blood red
    labelText: '#dc143c',
    // Water bodies - dark crimson
    waterBody: '#2a0f0f',
    // Corp overlays - blood red variations
    corpOverlay: 'rgba(220, 20, 60, 0.3)',
    // City dots - bright blood red
    cityDot: '#dc143c',
    cityGlow: 'rgba(220, 20, 60, 0.5)',
    // Tooltip
    tooltipBg: 'rgba(15, 5, 5, 0.95)',
    tooltipBorder: '#dc143c',
    tooltipText: '#e0c0c0'
  };

  // Country polygons (simplified equirectangular coordinates 0-100)
  const countries = [
    // NORTH AMERICA
    { name: 'Canada', color: COLORS.landMedium, polygon: [[8, 8], [18, 5], [25, 8], [28, 15], [22, 22], [15, 20], [8, 15]] },
    { name: 'United States', color: COLORS.landLight, polygon: [[8, 22], [15, 20], [22, 22], [25, 28], [22, 35], [15, 38], [8, 35], [5, 28]] },
    { name: 'Mexico', color: COLORS.landLight, polygon: [[8, 35], [15, 38], [18, 42], [12, 45], [8, 42]] },
    { name: 'Greenland', color: COLORS.landDark, polygon: [[25, 5], [32, 3], [35, 8], [30, 12], [25, 10]] },
    { name: 'Alaska', color: COLORS.landMedium, polygon: [[2, 10], [8, 8], [12, 12], [8, 18], [2, 15]] },

    // SOUTH AMERICA
    { name: 'Brazil', color: COLORS.landLight, polygon: [[18, 48], [28, 45], [32, 50], [30, 60], [22, 68], [16, 60], [14, 52]] },
    { name: 'Argentina', color: COLORS.landMedium, polygon: [[16, 60], [22, 68], [20, 78], [14, 75], [12, 65]] },
    { name: 'Colombia', color: COLORS.landMedium, polygon: [[12, 45], [18, 48], [14, 52], [10, 50]] },
    { name: 'Peru', color: COLORS.landMedium, polygon: [[10, 50], [14, 52], [12, 65], [8, 60], [8, 55]] },
    { name: 'Chile', color: COLORS.landMedium, polygon: [[12, 65], [14, 75], [12, 82], [8, 78], [10, 68]] },

    // EUROPE
    { name: 'Russia', color: COLORS.landDark, polygon: [[42, 12], [85, 8], [95, 15], [92, 28], [80, 35], [65, 32], [50, 28], [42, 22]] },
    { name: 'France', color: COLORS.landMedium, polygon: [[38, 25], [42, 22], [45, 28], [40, 32], [36, 28]] },
    { name: 'Germany', color: COLORS.landMedium, polygon: [[42, 22], [45, 20], [48, 25], [45, 30], [40, 28]] },
    { name: 'UK', color: COLORS.landMedium, polygon: [[35, 20], [38, 18], [40, 22], [37, 25]] },
    { name: 'Spain', color: COLORS.landMedium, polygon: [[33, 28], [38, 25], [40, 32], [35, 35]] },
    { name: 'Italy', color: COLORS.landMedium, polygon: [[42, 28], [45, 25], [48, 30], [45, 35], [42, 32]] },
    { name: 'Poland', color: COLORS.landMedium, polygon: [[45, 20], [50, 18], [52, 22], [48, 25], [45, 22]] },
    { name: 'Sweden', color: COLORS.landMedium, polygon: [[42, 10], [48, 8], [50, 12], [45, 18], [42, 15]] },
    { name: 'Norway', color: COLORS.landMedium, polygon: [[38, 5], [45, 3], [48, 8], [42, 10], [38, 8]] },
    { name: 'Finland', color: COLORS.landMedium, polygon: [[48, 8], [55, 5], [58, 10], [52, 15], [48, 12]] },
    { name: 'Ukraine', color: COLORS.landMedium, polygon: [[50, 22], [58, 20], [62, 25], [55, 28], [50, 25]] },

    // AFRICA
    { name: 'Nigeria', color: COLORS.landDark, polygon: [[38, 45], [45, 42], [48, 48], [42, 52], [36, 48]] },
    { name: 'Egypt', color: COLORS.landDark, polygon: [[48, 35], [55, 32], [58, 38], [52, 42], [48, 38]] },
    { name: 'South Africa', color: COLORS.landDark, polygon: [[42, 65], [52, 62], [55, 68], [48, 72], [40, 70]] },
    { name: 'Ethiopia', color: COLORS.landDark, polygon: [[55, 42], [62, 40], [65, 48], [58, 52], [55, 48]] },
    { name: 'DR Congo', color: COLORS.landDark, polygon: [[42, 52], [50, 50], [52, 58], [45, 62], [40, 58]] },
    { name: 'Kenya', color: COLORS.landDark, polygon: [[55, 52], [60, 50], [62, 58], [58, 60], [55, 55]] },
    { name: 'Morocco', color: COLORS.landDark, polygon: [[32, 35], [38, 32], [40, 38], [35, 40]] },
    { name: 'Algeria', color: COLORS.landDark, polygon: [[35, 38], [42, 35], [45, 42], [38, 45], [35, 42]] },
    { name: 'Tanzania', color: COLORS.landDark, polygon: [[55, 58], [60, 56], [62, 62], [58, 65], [55, 62]] },
    { name: 'Madagascar', color: COLORS.landDark, polygon: [[62, 62], [65, 60], [68, 65], [65, 70], [62, 68]] },

    // ASIA
    { name: 'China', color: COLORS.landMedium, polygon: [[65, 28], [80, 25], [88, 32], [85, 42], [75, 45], [65, 40], [60, 35]] },
    { name: 'India', color: COLORS.landMedium, polygon: [[62, 38], [72, 35], [75, 42], [70, 50], [62, 48], [60, 42]] },
    { name: 'Japan', color: COLORS.landMedium, polygon: [[85, 28], [90, 25], [92, 32], [88, 35], [85, 32]] },
    { name: 'Indonesia', color: COLORS.landDark, polygon: [[75, 52], [85, 48], [90, 55], [85, 62], [75, 58]] },
    { name: 'Saudi Arabia', color: COLORS.landDark, polygon: [[55, 38], [62, 35], [65, 42], [58, 45], [55, 42]] },
    { name: 'Iran', color: COLORS.landDark, polygon: [[55, 32], [65, 28], [68, 35], [62, 40], [55, 38]] },
    { name: 'Thailand', color: COLORS.landDark, polygon: [[72, 42], [78, 40], [80, 48], [75, 50], [72, 45]] },
    { name: 'Vietnam', color: COLORS.landDark, polygon: [[78, 42], [82, 40], [85, 48], [80, 50], [78, 45]] },
    { name: 'South Korea', color: COLORS.landMedium, polygon: [[82, 28], [86, 26], [88, 32], [84, 34], [82, 30]] },
    { name: 'Pakistan', color: COLORS.landDark, polygon: [[60, 35], [68, 32], [70, 38], [65, 42], [60, 40]] },
    { name: 'Kazakhstan', color: COLORS.landDark, polygon: [[58, 22], [68, 18], [72, 25], [65, 28], [58, 25]] },
    { name: 'Mongolia', color: COLORS.landDark, polygon: [[68, 18], [80, 15], [85, 22], [78, 25], [70, 22]] },
    { name: 'Turkey', color: COLORS.landDark, polygon: [[48, 28], [55, 25], [58, 30], [52, 35], [48, 32]] },
    { name: 'Myanmar', color: COLORS.landDark, polygon: [[70, 40], [75, 38], [78, 45], [73, 48], [70, 45]] },

    // OCEANIA
    { name: 'Australia', color: COLORS.landLight, polygon: [[78, 58], [88, 55], [92, 62], [88, 72], [80, 75], [75, 68]] },
    { name: 'New Zealand', color: COLORS.landDark, polygon: [[92, 72], [96, 70], [98, 76], [94, 78], [92, 75]] },
    { name: 'Papua New Guinea', color: COLORS.landDark, polygon: [[88, 55], [92, 52], [95, 58], [90, 60], [88, 58]] },

    // ANTARCTICA
    { name: 'Antarctica', color: COLORS.landHighlight, polygon: [[10, 90], [30, 88], [50, 90], [70, 88], [90, 90], [90, 95], [10, 95]] }
  ];

  // Water bodies (oceans and seas)
  const waterBodies = [
    {
      name: 'Pacific Ocean',
      color: COLORS.waterBody,
      polygon: [[30, 8], [35, 25], [32, 45], [28, 60], [20, 75], [15, 85], [10, 80], [12, 60], [15, 40], [18, 20]]
    },
    {
      name: 'Atlantic Ocean',
      color: COLORS.waterBody,
      polygon: [[30, 15], [38, 25], [40, 45], [38, 60], [30, 75], [25, 85], [20, 80], [22, 60], [25, 40], [28, 20]]
    },
    {
      name: 'Indian Ocean',
      color: COLORS.waterBody,
      polygon: [[55, 45], [65, 42], [75, 48], [78, 60], [70, 70], [58, 68], [50, 58]]
    },
    {
      name: 'Arctic Ocean',
      color: COLORS.waterBody,
      polygon: [[10, 5], [30, 3], [50, 5], [70, 3], [90, 5], [90, 10], [10, 10]]
    },
    {
      name: 'Southern Ocean',
      color: COLORS.waterBody,
      polygon: [[10, 85], [30, 83], [50, 85], [70, 83], [90, 85], [90, 90], [10, 90]]
    },
    {
      name: 'Mediterranean Sea',
      color: COLORS.waterBody,
      polygon: [[35, 32], [45, 28], [48, 35], [42, 38], [35, 35]]
    },
    {
      name: 'Caspian Sea',
      color: COLORS.waterBody,
      polygon: [[55, 25], [62, 22], [65, 28], [58, 30], [55, 28]]
    }
  ];

  // Corporation territories (overlay on real-world geography)
  const regions = [
    {
      name: 'Ark Corp Territory',
      color: 'rgba(220, 20, 60, 0.3)',
      borderColor: '#dc143c',
      description: 'Ark Corp\'s primary territory. Born from the Russian corporate-state in 2047. Hayden Volkov merged Ark Manufacturing with the Russian government, creating the first corporate-state. Now spans northern Asia and controls the largest share of Element Zero deposits.',
      polygon: [[58, 12], [85, 8], [92, 18], [88, 28], [80, 32], [65, 28], [55, 22]]
    },
    {
      name: 'X-Technologies Territory',
      color: 'rgba(0, 150, 255, 0.3)',
      borderColor: '#0096ff',
      description: 'X-Technologies\' stronghold. Founded in 2089 by Dr. Elara Voss after defecting from Ark Corp with the Element Zero synthesis process. Funded by billionaire Vex Kael. Controls the Pacific rim.',
      polygon: [[75, 35], [90, 30], [95, 40], [88, 50], [78, 48], [72, 40]]
    },
    {
      name: 'Ash District',
      color: 'rgba(255, 140, 0, 0.3)',
      borderColor: '#ff8c00',
      description: 'The last free zone. A lawless sprawl of ruins, bunkers, and survivors in the crossroads between corporate territories. Home to 100 million people. Setting of the game.',
      polygon: [[35, 45], [50, 42], [58, 50], [55, 60], [45, 65], [35, 58], [30, 50]]
    },
    {
      name: 'Neo-Kyoto Crater',
      color: 'rgba(128, 0, 128, 0.4)',
      borderColor: '#800080',
      description: 'Ground zero for the Elemental Warp. Once the city of Neo-Kyoto, population 40 million. Destroyed in 2140 by Dead Circuit with a 1-terraton Element Zero nuke.',
      polygon: [[85, 35], [90, 32], [93, 38], [88, 40], [85, 38]]
    },
    {
      name: 'VitaCorp Territory',
      color: 'rgba(0, 200, 100, 0.3)',
      borderColor: '#00c864',
      description: 'VitaCorp\'s domain. Owns reanimation technology. Controls who lives and dies. Their territory spans much of North America.',
      polygon: [[5, 18], [15, 15], [22, 22], [20, 32], [12, 35], [5, 28]]
    },
    {
      name: 'Genetico Farmlands',
      color: 'rgba(0, 150, 0, 0.3)',
      borderColor: '#009600',
      description: 'Genetico\'s agricultural heartland. Owns all food production and genetic modification. Spans Africa and South America.',
      polygon: [[35, 55], [50, 52], [55, 58], [52, 68], [42, 72], [32, 65]]
    },
    {
      name: 'Ironclad Defense Zone',
      color: 'rgba(100, 100, 150, 0.3)',
      borderColor: '#646496',
      description: 'Ironclad Defense territory. The largest private military. They don\'t fight wars — they are the war.',
      polygon: [[18, 38], [28, 35], [32, 42], [28, 48], [18, 45], [12, 42]]
    },
    {
      name: 'OmniSource Energy Grid',
      color: 'rgba(255, 200, 0, 0.25)',
      borderColor: '#ffc800',
      description: 'OmniSource controls all energy production. Their power grids span continents. They can shut off your district\'s power — and your life support — with a keystroke.',
      polygon: [[55, 25], [68, 22], [78, 28], [75, 35], [60, 32], [55, 28]]
    },
    {
      name: 'Synaptic Systems Hub',
      color: 'rgba(150, 0, 150, 0.3)',
      borderColor: '#960096',
      description: 'Synaptic Systems manufactures AI and neural interfaces. They know what you think before you think it.',
      polygon: [[38, 22], [48, 20], [52, 25], [45, 28], [38, 25]]
    },
    {
      name: 'Corporate Plazas',
      color: 'rgba(255, 215, 0, 0.25)',
      borderColor: '#ffd700',
      description: 'Neutral grounds scattered across the globe. Gleaming towers of Element Zero and glass where executives live in luxury. Kept pristine by mutually assured destruction.',
      polygon: [[20, 32], [28, 28], [32, 35], [25, 38], [18, 35]]
    },
    {
      name: 'Lower Zones',
      color: 'rgba(100, 100, 100, 0.3)',
      borderColor: '#646464',
      description: 'Dirty, violent, lawless regions where everyone else survived. Corporate wars are fought here using proxies, mercenaries, and Reanimate soldiers.',
      polygon: [[8, 55], [18, 52], [25, 58], [22, 68], [12, 72], [6, 65]]
    }
  ];

  // Cities/Points of interest
  const cities = [
    { name: 'The Spire Ruins', x: 82, y: 38, description: 'X-Technologies former HQ. 200-story tower converted to raw Element Zero by Dead Circuit in 2140.' },
    { name: 'Data Center Omega', x: 48, y: 52, description: 'Destroyed by the player. Ark Corp\'s intelligence network blinded across three continents.' },
    { name: 'MindBridge Facility', x: 42, y: 28, description: 'Where ArkMind was born. Where Dr. Okafor\'s dream died.' },
    { name: 'Lazarus Facility Alpha', x: 68, y: 18, description: 'Primary training facility for Lazarus Initiative soldiers. Location deep in Ark territory.' },
    { name: 'Dead Circuit Hideout', x: 35, y: 52, description: 'Where Dead Circuit was born. Where the resistance began.' },
    { name: 'Neo-Kyoto Crater', x: 88, y: 40, description: 'Ground zero for the Elemental Warp. Once a city of 40 million.' },
    { name: 'Corporate Plaza Prime', x: 48, y: 25, description: 'The largest Corporate Plaza. Neutral ground for executive negotiations.' },
    { name: 'Ash District Central', x: 45, y: 55, description: 'Heart of the last free zone. Home to 100 million survivors.' },
    { name: 'VitaCorp Reanimation Center', x: 15, y: 22, description: 'Where the wealthy come to stack lives like ammo.' },
    { name: 'Genetico Prime Farm', x: 48, y: 60, description: 'The largest genetically modified food production facility on Earth.' },
    { name: 'OmniSource Reactor', x: 68, y: 48, description: 'Primary energy production facility. Powers half of Asia.' },
    { name: 'Ironclad Barracks', x: 25, y: 38, description: 'Largest private military base. Home to 500,000 contractors.' },
    { name: 'Synaptic AI Core', x: 52, y: 24, description: 'Where the neural interfaces are made. Where thoughts are read.' },
    { name: 'DataVault Server Farm', x: 78, y: 58, description: 'Underground facility storing all digital information on Earth.' },
    { name: 'MediGen Hospital', x: 35, y: 28, description: 'Where the poor come to be kept alive just enough to keep working.' }
  ];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    draw();
  }

  function drawPolygon(polygon, fillColor, borderColor, lineWidth = 1) {
    if (!polygon || polygon.length < 3) return;
    ctx.beginPath();
    const first = polygon[0];
    ctx.moveTo(first[0] * canvas.width / 100, first[1] * canvas.height / 100);
    for (let i = 1; i < polygon.length; i++) {
      ctx.lineTo(polygon[i][0] * canvas.width / 100, polygon[i][1] * canvas.height / 100);
    }
    ctx.closePath();
    ctx.fillStyle = fillColor;
    ctx.fill();
    if (borderColor) {
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  function drawCity(city, isHovered) {
    const x = city.x * canvas.width / 100;
    const y = city.y * canvas.height / 100;
    const radius = isHovered ? 8 : 5;

    // Glow effect
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 3);
    gradient.addColorStop(0, isHovered ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 200, 100, 0.5)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 3, 0, Math.PI * 2);
    ctx.fill();

    // City dot
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = isHovered ? '#ffffff' : COLORS.cityDot;
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // City name
    ctx.font = isHovered ? 'bold 14px Inter, sans-serif' : '12px Inter, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(city.name, x, y - radius - 8);
    ctx.shadowBlur = 0;
  }

  function drawGrid() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    const gridSize = 50 * scale;

    for (let x = offsetX % gridSize; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = offsetY % gridSize; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  function drawBackground() {
    // Ocean background - dark with red tint
    const gradient = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.width
    );
    gradient.addColorStop(0, '#1a0a0a');
    gradient.addColorStop(0.5, '#150808');
    gradient.addColorStop(1, '#0a0505');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle blood-red grid lines
    ctx.strokeStyle = 'rgba(220, 20, 60, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 60;
    for (let x = offsetX % gridSize; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = offsetY % gridSize; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  function drawLabels() {
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = COLORS.labelText;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const labels = [
      { name: 'CANADA', polygon: [[8, 8], [18, 5], [25, 8], [28, 15], [22, 22], [15, 20], [8, 15]] },
      { name: 'UNITED STATES', polygon: [[8, 22], [15, 20], [22, 22], [25, 28], [22, 35], [15, 38], [8, 35], [5, 28]] },
      { name: 'BRAZIL', polygon: [[18, 48], [28, 45], [32, 50], [30, 60], [22, 68], [16, 60], [14, 52]] },
      { name: 'RUSSIA', polygon: [[42, 12], [85, 8], [95, 15], [92, 28], [80, 35], [65, 32], [50, 28], [42, 22]] },
      { name: 'CHINA', polygon: [[65, 28], [80, 25], [88, 32], [85, 42], [75, 45], [65, 40], [60, 35]] },
      { name: 'AUSTRALIA', polygon: [[78, 58], [88, 55], [92, 62], [88, 72], [80, 75], [75, 68]] },
      { name: 'ANTARCTICA', polygon: [[10, 90], [30, 88], [50, 90], [70, 88], [90, 90], [90, 95], [10, 95]] }
    ];

    labels.forEach(label => {
      const centroid = getCentroid(label.polygon);
      ctx.fillText(label.name, centroid[0] * canvas.width / 100, centroid[1] * canvas.height / 100);
    });
  }

  function getCentroid(polygon) {
    let sumX = 0, sumY = 0;
    polygon.forEach(p => {
      sumX += p[0];
      sumY += p[1];
    });
    return [sumX / polygon.length, sumY / polygon.length];
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    // Draw water bodies (oceans)
    waterBodies.forEach(water => {
      drawPolygon(water.polygon, water.color, 'rgba(100, 150, 200, 0.3)');
    });

    // Draw countries
    countries.forEach(country => {
      const isHovered = hoveredRegion === country.name;
      drawPolygon(country.polygon, country.color, isHovered ? '#ffffff' : COLORS.border, isHovered ? 2 : 0.5);
    });

    // Draw country labels
    drawLabels();

    // Draw corporation territories (overlay)
    regions.forEach(region => {
      const isHovered = hoveredRegion === region.name;
      drawPolygon(region.polygon, region.color, region.borderColor, isHovered ? 4 : 2);
    });

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
    const allRegions = [...countries, ...waterBodies, ...regions, ...cities];
    const region = allRegions.find(r => r.name === hoveredRegion);
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

    // Position tooltip near mouse but keep on screen
    let tooltipX = lastMouseX + 20;
    let tooltipY = lastMouseY + 20;
    if (tooltipX + tooltipWidth > canvas.width) tooltipX = lastMouseX - tooltipWidth - 20;
    if (tooltipY + tooltipHeight > canvas.height) tooltipY = lastMouseY - tooltipHeight - 20;

    // Tooltip background
    ctx.fillStyle = 'rgba(10, 10, 20, 0.95)';
    ctx.strokeStyle = region.borderColor || '#dc143c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 4);
    ctx.fill();
    ctx.stroke();

    // Tooltip title
    ctx.font = 'bold 16px Inter, sans-serif';
    ctx.fillStyle = region.borderColor || '#ffffff';
    ctx.textAlign = 'left';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(region.name, tooltipX + padding, tooltipY + padding + 15);
    ctx.shadowBlur = 0;

    // Tooltip description
    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#e0e0e8';
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
    // Check cities first (highest priority)
    for (const city of cities) {
      const cx = city.x * canvas.width / 100;
      const cy = city.y * canvas.height / 100;
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist < 15) return city.name;
    }

    // Check corporation regions
    for (const region of regions) {
      if (isPointInPolygon(x, y, region.polygon)) {
        return region.name;
      }
    }

    // Check countries
    for (const country of countries) {
      if (isPointInPolygon(x, y, country.polygon)) {
        return country.name;
      }
    }

    // Check water bodies
    for (const water of waterBodies) {
      if (isPointInPolygon(x, y, water.polygon)) {
        return water.name;
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

    // Zoom toward mouse position
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
  let lastTouchCenter = { x: 0, y: 0 };

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      lastMouseX = e.touches[0].clientX - canvas.getBoundingClientRect().left;
      lastMouseY = e.touches[0].clientY - canvas.getBoundingClientRect().top;
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistance = Math.sqrt(dx * dx + dy * dy);
      lastTouchCenter = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2
      };
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
      const allRegions = [...countries, ...waterBodies, ...regions, ...cities];
      const region = allRegions.find(r => r.name === regionName);
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
