// Necroware Interactive World Map
// Flooded world with risen water levels, submerged coastlines, new fictional nations
// AND lore-important locations from the game
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
    ocean: '#0a0606',
    oceanDeep: '#080404',
    oceanShallow: '#120808',
    land: '#2a1818',
    landFlooded: '#1a1010',
    border: '#3a1a1a',
    label: '#dc143c',
    city: '#dc143c',
    tooltipBg: 'rgba(15, 5, 5, 0.95)',
    tooltipBorder: '#dc143c',
    tooltipText: '#e0c0c0',
    grid: 'rgba(220, 20, 60, 0.03)',
    corpOverlay: 'rgba(220, 20, 60, 0.2)',
    corpBorder: 'rgba(220, 20, 60, 0.5)',
    loreLocation: '#ff4444',
    loreGlow: 'rgba(255, 68, 68, 0.6)',
    newNation: 'rgba(220, 20, 60, 0.15)',
    newNationBorder: 'rgba(220, 20, 60, 0.4)'
  };

  // Flooded continents (coastlines pushed inland due to risen sea levels ~2197)
  const continents = [
    { name: 'North American Remnant', color: COLORS.land, description: 'What remains of North America after the Great Flood. The eastern seaboard is gone. The Gulf Coast is entirely underwater. Florida is a memory.', polygon: [[3,15],[6,12],[10,10],[14,8],[18,10],[22,14],[25,20],[27,28],[28,35],[26,42],[22,48],[16,52],[10,48],[6,40],[3,30]] },
    { name: 'Sunken Eastern Seaboard', color: COLORS.oceanShallow, description: 'Once home to 180 million people. New York, Boston, Washington DC, Philadelphia, Miami — all beneath the waves.', polygon: [[22,14],[28,12],[32,18],[30,28],[28,35],[26,42],[22,48],[18,42],[16,35],[18,25]] },
    { name: 'Gulf of Mexico (Expanded)', color: COLORS.oceanDeep, description: 'The Gulf has swallowed the entire Gulf Coast. Houston, New Orleans, Mobile, Tampa — all gone.', polygon: [[10,38],[16,35],[20,38],[18,45],[12,48],[8,45]] },
    { name: 'Florida Trench', color: COLORS.oceanDeep, description: 'Florida is entirely underwater. Only the highest points of the Florida Keys break the surface as small islets.', polygon: [[18,38],[22,36],[24,40],[22,44],[18,42]] },
    { name: 'Pacific Northwest Remnant', color: COLORS.land, description: 'The Cascade Range still rises above the waves. Seattle is gone but the Olympic Peninsula remains.', polygon: [[2,18],[5,15],[8,18],[6,25],[3,22]] },
    { name: 'California Remnant', color: COLORS.land, description: 'The Sierra Nevada forms the new spine of what was California. The Central Valley is an inland sea.', polygon: [[3,25],[6,22],[8,28],[6,35],[4,32]] },
    { name: 'Alaska Remnant', color: COLORS.land, description: 'Alaska has lost its southern coast. Anchorage is gone.', polygon: [[2,10],[6,8],[10,10],[12,14],[8,16],[4,14]] },
    { name: 'Greenland Remnant', color: COLORS.land, description: 'Greenland has lost its southern third.', polygon: [[25,5],[32,3],[35,8],[32,12],[28,12],[25,8]] },
    { name: 'Canadian Arctic Archipelago', color: COLORS.land, description: 'The Arctic islands have merged as sea levels rose.', polygon: [[12,3],[20,2],[28,4],[25,8],[18,10],[12,8]] },
    { name: 'Hudson Bay (Expanded)', color: COLORS.oceanShallow, description: 'Hudson Bay has swallowed much of Manitoba and Ontario. Winnipeg is gone.', polygon: [[12,12],[18,10],[22,14],[20,20],[14,22],[10,18]] },
    { name: 'Great Lakes (Merged)', color: COLORS.oceanShallow, description: 'The Great Lakes have merged into a single vast inland sea. Chicago, Detroit, Cleveland, Toronto — all submerged.', polygon: [[14,22],[18,20],[20,25],[16,28],[12,26]] },
    { name: 'Mississippi Inland Sea', color: COLORS.oceanShallow, description: 'The Mississippi River has become a vast inland sea stretching from the Gulf to Memphis.', polygon: [[10,32],[14,30],[16,35],[14,40],[10,38]] },
    { name: 'Appalachian Highlands', color: COLORS.land, description: 'The Appalachians are now the eastern coastline. Millions of refugees have resettled here.', polygon: [[18,22],[22,20],[24,25],[22,30],[18,28]] },
    { name: 'Great Plains Remnant', color: COLORS.land, description: 'The Great Plains remain largely above water but the eastern portion is marshland.', polygon: [[6,25],[12,22],[16,25],[14,32],[8,35],[5,30]] },
    { name: 'Rocky Mountain Highlands', color: COLORS.land, description: 'The Rockies are a refuge. Much of the interior population has migrated here.', polygon: [[5,22],[8,20],[10,25],[8,30],[5,28]] },
    { name: 'Mexican Highlands', color: COLORS.land, description: 'Mexico\'s coastal plains are gone. Mexico City is one of the largest cities in the remnant world.', polygon: [[4,35],[8,32],[10,38],[8,42],[5,40]] },
    { name: 'Baja California Peninsula', color: COLORS.land, description: 'Baja is now a narrow island chain.', polygon: [[3,32],[5,30],[6,35],[4,38]] },
    { name: 'Yucatan Peninsula (Remnant)', color: COLORS.land, description: 'The Yucatan has lost its low-lying areas.', polygon: [[12,40],[16,38],[18,42],[14,44]] },
    { name: 'Caribbean Archipelago', color: COLORS.land, description: 'The Caribbean islands are reduced to their highest peaks.', polygon: [[18,40],[22,38],[24,42],[20,44]] },
    { name: 'Andean Highlands', color: COLORS.land, description: 'The Andes remain above water. The western coast of South America is now a series of fjords.', polygon: [[14,50],[18,48],[20,55],[18,65],[14,70],[12,60]] },
    { name: 'Amazon Basin (Flooded)', color: COLORS.oceanShallow, description: 'The Amazon Basin is now a vast inland sea. Manaus is gone.', polygon: [[18,50],[25,48],[28,55],[25,65],[18,68],[15,58]] },
    { name: 'Brazilian Highlands', color: COLORS.land, description: 'The Brazilian Highlands remain above water. São Paulo and Rio are gone but Brasília thrives.', polygon: [[22,55],[28,52],[30,58],[26,65],[22,62]] },
    { name: 'Patagonian Remnant', color: COLORS.land, description: 'Patagonia is one of the few habitable regions in South America.', polygon: [[14,70],[18,68],[20,75],[16,80],[12,78]] },
    { name: 'European Remnant', color: COLORS.land, description: 'Europe has lost its low-lying areas. The Netherlands is gone. London is underwater.', polygon: [[38,15],[45,10],[52,12],[58,18],[62,25],[58,32],[50,35],[42,30],[38,22]] },
    { name: 'British Isles (Remnant)', color: COLORS.land, description: 'The British Isles are reduced to the Scottish Highlands and the Pennines. London is gone.', polygon: [[35,15],[38,12],[40,15],[38,18],[36,18]] },
    { name: 'North Sea (Expanded)', color: COLORS.oceanDeep, description: 'The North Sea has swallowed Denmark, the Netherlands, Belgium, and much of northern Germany.', polygon: [[42,14],[48,12],[52,15],[50,20],[44,20],[42,16]] },
    { name: 'Baltic Sea (Expanded)', color: COLORS.oceanDeep, description: 'The Baltic has swallowed Copenhagen, Stockholm, Helsinki, and the Baltic states.', polygon: [[48,8],[55,6],[58,10],[55,14],[50,12],[48,10]] },
    { name: 'Mediterranean (Expanded)', color: COLORS.oceanDeep, description: 'The Mediterranean has risen significantly. The Nile Delta is gone.', polygon: [[38,28],[45,25],[50,28],[48,35],[42,38],[38,32]] },
    { name: 'Adriatic Sea (Expanded)', color: COLORS.oceanDeep, description: 'The Adriatic has swallowed the Po Valley. Milan is gone.', polygon: [[42,25],[46,22],[48,26],[46,30],[42,28]] },
    { name: 'Black Sea (Expanded)', color: COLORS.oceanDeep, description: 'The Black Sea has swallowed the Ukrainian coast. Odessa is gone.', polygon: [[52,22],[58,20],[62,24],[58,28],[52,26]] },
    { name: 'Caspian Sea (Expanded)', color: COLORS.oceanDeep, description: 'The Caspian has expanded significantly, swallowing the Volga Delta.', polygon: [[55,22],[62,20],[65,24],[60,28],[55,26]] },
    { name: 'Scandinavian Remnant', color: COLORS.land, description: 'Scandinavia has lost its southern coast. Oslo is gone.', polygon: [[40,5],[48,3],[52,6],[50,10],[44,10],[40,8]] },
    { name: 'Iberian Remnant', color: COLORS.land, description: 'Spain and Portugal have lost their coastal plains. Madrid is now the largest city on the peninsula.', polygon: [[32,28],[36,26],[40,30],[38,34],[34,34],[32,30]] },
    { name: 'Italian Remnant', color: COLORS.land, description: 'Italy is now a narrow mountain chain. Rome is gone.', polygon: [[42,28],[45,26],[48,28],[46,32],[42,30]] },
    { name: 'Balkan Remnant', color: COLORS.land, description: 'The Balkans have lost their coastal areas. The Danube Delta is gone.', polygon: [[48,25],[54,22],[56,26],[52,28],[48,26]] },
    { name: 'Anatolian Remnant', color: COLORS.land, description: 'Turkey has lost its coastal plains. Ankara is now the largest city.', polygon: [[52,28],[58,26],[62,30],[58,34],[52,32]] },
    { name: 'Siberian Remnant', color: COLORS.land, description: 'Siberia has lost its northern coast to the Arctic. The permafrost has melted, creating vast marshlands.', polygon: [[58,8],[75,5],[85,8],[88,15],[82,20],[70,18],[60,12]] },
    { name: 'Arctic Ocean (Expanded)', color: COLORS.oceanDeep, description: 'The Arctic Ocean has expanded dramatically. The polar ice is gone.', polygon: [[30,2],[50,1],[70,2],[90,4],[90,8],[30,8]] },
    { name: 'Central Asian Remnant', color: COLORS.land, description: 'Central Asia has become more arid.', polygon: [[55,22],[65,20],[70,25],[65,28],[58,26]] },
    { name: 'East Asian Remnant', color: COLORS.land, description: 'China has lost its eastern seaboard. Shanghai, Beijing, Tianjin — all gone.', polygon: [[65,22],[80,18],[88,22],[86,30],[78,35],[70,32],[65,26]] },
    { name: 'Yellow Sea (Expanded)', color: COLORS.oceanDeep, description: 'The Yellow Sea has swallowed the North China Plain. Seoul is gone.', polygon: [[80,22],[86,20],[88,24],[84,28],[80,26]] },
    { name: 'South China Sea (Expanded)', color: COLORS.oceanDeep, description: 'The South China Sea has swallowed Vietnam, Thailand, and the Mekong Delta. Bangkok is gone.', polygon: [[72,35],[80,32],[84,38],[80,44],[72,42]] },
    { name: 'Japanese Archipelago (Remnant)', color: COLORS.land, description: 'Japan is reduced to its mountain peaks. Tokyo is gone.', polygon: [[85,25],[90,22],[92,26],[88,30],[85,28]] },
    { name: 'Indian Subcontinent (Remnant)', color: COLORS.land, description: 'India has lost its coastal plains. Mumbai, Chennai, Kolkata — all gone.', polygon: [[60,32],[68,30],[72,35],[70,42],[64,45],[60,40]] },
    { name: 'Bay of Bengal (Expanded)', color: COLORS.oceanDeep, description: 'The Bay of Bengal has swallowed Bangladesh and much of the Indian coast.', polygon: [[64,35],[70,32],[72,38],[68,42],[64,40]] },
    { name: 'Arabian Peninsula (Remnant)', color: COLORS.land, description: 'The Arabian Peninsula has lost its coastal areas.', polygon: [[52,32],[58,30],[62,34],[58,38],[52,36]] },
    { name: 'Persian Gulf (Expanded)', color: COLORS.oceanDeep, description: 'The Persian Gulf has swallowed the Tigris-Euphrates valley. Baghdad is gone.', polygon: [[55,30],[60,28],[62,32],[58,35],[55,33]] },
    { name: 'African Remnant', color: COLORS.land, description: 'Africa has lost its coastal plains. The Nile Delta is gone. The Congo Basin is now an inland sea.', polygon: [[38,38],[48,35],[55,40],[58,55],[52,68],[42,72],[35,65],[38,50]] },
    { name: 'Nile Delta (Submerged)', color: COLORS.oceanDeep, description: 'The Nile Delta is entirely underwater. Alexandria is gone. Cairo is now a coastal city.', polygon: [[48,35],[52,33],[54,37],[50,38],[48,36]] },
    { name: 'Congo Inland Sea', color: COLORS.oceanShallow, description: 'The Congo Basin is now a vast inland sea. Kinshasa is gone.', polygon: [[42,50],[48,48],[50,54],[46,58],[42,56]] },
    { name: 'East African Highlands', color: COLORS.land, description: 'The East African Highlands remain above water. Nairobi is now one of the largest cities in Africa.', polygon: [[52,48],[56,46],[58,50],[56,54],[52,52]] },
    { name: 'Southern African Remnant', color: COLORS.land, description: 'Southern Africa has lost its coastal areas. Johannesburg is now the largest city on the continent.', polygon: [[42,62],[50,60],[54,64],[50,68],[44,70],[42,66]] },
    { name: 'Madagascar (Remnant)', color: COLORS.land, description: 'Madagascar is reduced to its central highlands.', polygon: [[60,62],[64,60],[66,64],[64,68],[62,66]] },
    { name: 'Australian Remnant', color: COLORS.land, description: 'Australia has lost its coastal plains. Sydney, Melbourne, Brisbane — all gone.', polygon: [[78,55],[88,52],[92,58],[88,68],[80,72],[75,65]] },
    { name: 'Great Australian Bight (Expanded)', color: COLORS.oceanDeep, description: 'The Great Australian Bight has swallowed the Nullarbor Plain. Perth is gone.', polygon: [[75,62],[82,60],[85,64],[82,68],[76,66]] },
    { name: 'New Zealand (Remnant)', color: COLORS.land, description: 'New Zealand is reduced to its mountain ranges. Auckland is gone.', polygon: [[92,70],[95,68],[97,72],[94,74],[92,72]] },
    { name: 'Papua New Guinea (Remnant)', color: COLORS.land, description: 'Papua New Guinea is reduced to its highlands.', polygon: [[86,54],[90,52],[92,56],[88,58],[86,56]] },
    { name: 'Indonesian Archipelago (Remnant)', color: COLORS.land, description: 'Indonesia is reduced to its mountain peaks. Jakarta is gone.', polygon: [[74,52],[82,50],[86,54],[84,58],[76,60],[74,56]] },
    { name: 'Philippine Archipelago (Remnant)', color: COLORS.land, description: 'The Philippines are reduced to their highest peaks. Manila is gone.', polygon: [[82,38],[86,36],[88,40],[84,42],[82,40]] },
    { name: 'Antarctica', color: COLORS.land, description: 'Antarctica has lost much of its ice sheet. New land is emerging.', polygon: [[10,90],[30,88],[50,90],[70,88],[90,90],[90,95],[10,95]] }
  ];

  // New fictional nations
  const newNations = [
    { name: 'Appalachian Federation', color: COLORS.newNation, borderColor: COLORS.newNationBorder, description: 'Formed from survivors of the drowned eastern seaboard. Capital: New Pittsburgh.', polygon: [[14,22],[22,20],[24,25],[22,30],[18,28],[14,26]] },
    { name: 'Great Lakes Confederation', color: COLORS.newNation, borderColor: COLORS.newNationBorder, description: 'A nation built around the merged Great Lakes. Capital: New Chicago.', polygon: [[12,20],[18,18],[20,22],[18,26],[14,26],[12,22]] },
    { name: 'Denver Compact', color: COLORS.newNation, borderColor: COLORS.newNationBorder, description: 'The interior nation of the former United States. Capital: Denver.', polygon: [[5,22],[10,20],[14,22],[12,30],[8,32],[5,28]] },
    { name: 'Cascade Republic', color: COLORS.newNation, borderColor: COLORS.newNationBorder, description: 'A nation built on the Olympic Peninsula and the Cascade Range. Capital: New Seattle.', polygon: [[2,18],[5,15],[8,18],[6,25],[3,22]] },
    { name: 'California Free State', color: COLORS.newNation, borderColor: COLORS.newNationBorder, description: 'A nation built on the Sierra Nevada. Capital: New Sacramento.', polygon: [[3,25],[6,22],[8,28],[6,35],[4,32]] },
    { name: 'Mexican Federation', color: COLORS.newNation, borderColor: COLORS.newNationBorder, description: 'The remnant of Mexico, now centered on the highlands. Capital: Mexico City.', polygon: [[4,35],[8,32],[10,38],[8,42],[5,40]] },
    { name: 'Andean Union', color: COLORS.newNation, borderColor: COLORS.newNationBorder, description: 'A nation built along the Andes. Capital: Quito.', polygon: [[14,50],[18,48],[20,55],[18,65],[14,70],[12,60]] },
    { name: 'Brazilian Republic', color: COLORS.newNation, borderColor: COLORS.newNationBorder, description: 'The remnant of Brazil, now centered on the highlands. Capital: Brasília.', polygon: [[22,55],[28,52],[30,58],[26,65],[22,62]] },
    { name: 'Patagonian Commonwealth', color: COLORS.newNation, borderColor: COLORS.newNationBorder, description: 'A nation at the southern tip of South America. Capital: New Buenos Aires.', polygon: [[14,70],[18,68],[20,75],[16,80],[12,78]] },
    { name: 'European Remnant Council', color: COLORS.newNation, borderColor: COLORS.newNationBorder, description: 'A loose confederation of European highland nations. Capital: Geneva.', polygon: [[38,18],[48,16],[52,20],[50,26],[42,28],[38,22]] },
    { name: 'Alpine Confederation', color: COLORS.newNation, borderColor: COLORS.newNationBorder, description: 'A nation built in the Alps. Capital: Zurich.', polygon: [[42,22],[46,20],[48,24],[46,26],[42,24]] },
    { name: 'Scandinavian Remnant', color: COLORS.newNation, borderColor: COLORS.newNationBorder, description: 'The remnant of Scandinavia. Capital: New Oslo.', polygon: [[40,5],[48,3],[52,6],[50,10],[44,10],[40,8]] },
    { name: 'Siberian Khanate', color: COLORS.newNation, borderColor: COLORS.newNationBorder, description: 'A vast nation stretching across the Siberian interior. Capital: Novosibirsk.', polygon: [[58,8],[75,5],[85,8],[88,15],[82,20],[70,18],[60,12]] },
    { name: 'East Asian Coalition', color: COLORS.newNation, borderColor: COLORS.newNationBorder, description: 'A coalition of remnant Chinese states. Capital: Chengdu.', polygon: [[65,22],[75,20],[80,25],[78,30],[70,28],[65,24]] },
    { name: 'Deccan Republic', color: COLORS.newNation, borderColor: COLORS.newNationBorder, description: 'A nation built on the Deccan Plateau. Capital: Bangalore.', polygon: [[60,35],[66,33],[68,38],[65,42],[60,40]] },
    { name: 'East African Federation', color: COLORS.newNation, borderColor: COLORS.newNationBorder, description: 'A nation built on the East African Highlands. Capital: Nairobi.', polygon: [[52,48],[56,46],[58,50],[56,54],[52,52]] },
    { name: 'Southern African Union', color: COLORS.newNation, borderColor: COLORS.newNationBorder, description: 'A nation built on the Southern African plateau. Capital: Johannesburg.', polygon: [[42,62],[50,60],[54,64],[50,68],[44,70],[42,66]] },
    { name: 'Australian Interior', color: COLORS.newNation, borderColor: COLORS.newNationBorder, description: 'A nation built on the Australian highlands. Capital: Canberra.', polygon: [[78,58],[86,56],[88,60],[86,64],[80,66],[78,62]] }
  ];

  // Corporation territories
  const regions = [
    { name: 'Ark Corp', color: 'rgba(220, 20, 60, 0.2)', borderColor: 'rgba(220, 20, 60, 0.5)', description: 'Ark Corp controls the Siberian interior and much of northern Asia.', polygon: [[58,8],[75,5],[85,8],[88,15],[82,20],[70,18],[60,12]] },
    { name: 'X-Technologies', color: 'rgba(0, 100, 200, 0.2)', borderColor: 'rgba(0, 100, 200, 0.5)', description: 'X-Technologies controls the Pacific rim and the Japanese remnant.', polygon: [[75,35],[88,32],[92,42],[85,50],[75,48],[70,40]] },
    { name: 'Ash District', color: 'rgba(255, 140, 0, 0.2)', borderColor: 'rgba(255, 140, 0, 0.5)', description: 'The last free zone. Setting of the game.', polygon: [[35,45],[50,42],[58,50],[55,60],[45,65],[35,58],[30,50]] },
    { name: 'VitaCorp', color: 'rgba(0, 200, 100, 0.2)', borderColor: 'rgba(0, 200, 100, 0.5)', description: 'VitaCorp controls the North American interior and the Great Lakes.', polygon: [[5,18],[15,15],[22,22],[20,32],[12,35],[5,28]] },
    { name: 'Genetico', color: 'rgba(0, 150, 0, 0.2)', borderColor: 'rgba(0, 150, 0, 0.5)', description: 'Genetico controls the African highlands and the Brazilian interior.', polygon: [[35,55],[50,52],[55,58],[52,68],[42,72],[32,65]] },
    { name: 'Ironclad Defense', color: 'rgba(100, 100, 150, 0.2)', borderColor: 'rgba(100, 100, 150, 0.5)', description: 'Ironclad Defense controls the Andean highlands.', polygon: [[18,38],[28,35],[32,42],[28,48],[18,45],[12,42]] },
    { name: 'OmniSource', color: 'rgba(255, 200, 0, 0.15)', borderColor: 'rgba(255, 200, 0, 0.4)', description: 'OmniSource controls the energy grids across Asia and Europe.', polygon: [[55,25],[68,22],[78,28],[75,35],[60,32],[55,28]] },
    { name: 'Synaptic Systems', color: 'rgba(150, 0, 150, 0.2)', borderColor: 'rgba(150, 0, 150, 0.4)', description: 'Synaptic Systems controls the European highlands.', polygon: [[38,22],[48,20],[52,25],[45,28],[38,25]] }
  ];

  // LORE LOCATIONS - All important locations from the Necroware lore
  const loreLocations = [
    // ASH DISTRICT LOCATIONS (central crossroads, where the game is set)
    { name: 'The Ash District', x: 42, y: 52, description: 'The main setting of Necroware. A lawless zone in the ruins of the corporate wars. Home to 100 million survivors, criminals, and the displaced. Where the player operates.', faction: 'Neutral', category: 'Primary Setting' },
    { name: 'Neon District', x: 44, y: 54, description: 'Heart of the Ash District\'s entertainment sector — casinos, clubs, black market memory den. Controls the flow of information, currency, and fear.', faction: 'Contested', category: 'District' },
    { name: 'Ark Relay Station (Sector 7)', x: 40, y: 50, description: 'Ark Corp intelligence relay station. First mission objective. Secured by the player, recovering Ark intelligence and cutting off X-Tech remnants.', faction: 'Ark Corp', category: 'Military' },
    { name: 'Corporate Plaza (Sector 4)', x: 38, y: 48, description: 'Old Corporate Plaza — once a gleaming tower of Element Zero and glass. X-Tech remnants fortified it. Cleared by the player in Mission 2.', faction: 'Contested', category: 'Plaza' },
    { name: 'X-Tech Ammunition Depot', x: 46, y: 48, description: 'Massive X-Tech weapons cache hidden in old factory ruins. Element Zero warheads and conversion charges. Destroyed by the player in Mission 5.', faction: 'X-Tech', category: 'Military' },
    { name: 'Dead Circuit Hideout', x: 36, y: 56, description: 'Where Dead Circuit was born. Underground venue where Ryx, Kael, and Voss played anti-corporate music. Where the resistance began.', faction: 'Resistance', category: 'Historical' },
    { name: 'Data Center Omega Crater', x: 44, y: 56, description: 'Site of the destroyed Ark Corp data center. Player planted a 500-kiloton Element Zero warhead here. Now a smoking crater of contaminated Element Zero.', faction: 'Destroyed', category: 'Mission Site' },
    
    // NEO-KYOTO / JAPAN AREA
    { name: 'Neo-Kyoto Crater', x: 88, y: 40, description: 'Ground zero. Once a city of 40 million people. Destroyed in 2140 by Dead Circuit with a 1-terraton Element Zero nuke. The Spire was unmade. Voss was converted into living Element Zero here.', faction: 'Destroyed', category: 'Historical' },
    { name: 'Voss Statue', x: 88, y: 42, description: 'The Element Zero monument that used to be Voss — the drummer from Dead Circuit. Still conscious after 50 years. Still screaming. Source of the biochip implanted in the player.', faction: 'Lore', category: 'Character Location' },
    { name: 'The Spire Ruins', x: 90, y: 38, description: 'X-Technologies former headquarters. 200-story tower converted to raw Element Zero by Dead Circuit\'s nuke. Hellspawn nest in the upper floors. Kael Voss hides here.', faction: 'X-Tech (Destroyed)', category: 'Historical' },
    { name: 'Dead Circuit Transmitter', x: 86, y: 44, description: 'Old Dead Circuit transmitter still broadcasting after 50 years. Not encrypted intelligence — a song. The signal that started everything.', faction: 'Resistance', category: 'Historical' },
    
    // ARK CORP TERRITORY (Siberian interior)
    { name: 'Lazarus Facility Alpha', x: 72, y: 14, description: 'Primary training facility for Lazarus Initiative soldiers. Children ages 6-12 collected here. Sera was trained and died 47 times here.', faction: 'Ark Corp', category: 'Military' },
    { name: 'Ark Corp Siberian HQ', x: 68, y: 18, description: 'Ark Corp\'s primary headquarters in the Siberian interior. Where the 15 board members orchestrate their corporate wars.', faction: 'Ark Corp', category: 'Corporate' },
    { name: 'Hayden\'s Bunker', x: 75, y: 8, description: 'Hidden bunker in the Siberian interior. Where Hayden Volkov\'s patterns are preserved. Where Smasher is controlled from.', faction: 'Ark Corp', category: 'Secret' },
    { name: 'ArkMind Core', x: 65, y: 22, description: 'Where ArkMind — the AI that reads thoughts — was born. Absorbed the MindBridge Foundation and gained access to 80% of the world\'s minds.', faction: 'Ark Corp', category: 'AI Facility' },
    
    // X-TERRITORIES (Pacific rim)
    { name: 'X-Tech Pacific HQ', x: 82, y: 35, description: 'X-Technologies\' remaining headquarters in the Pacific. Vex Kael\'s seat of power. Controls X-Life, X-Power, X-Synapse, X-Forge, X-Gen, X-Vault, X-Med.', faction: 'X-Tech', category: 'Corporate' },
    { name: 'X-Tech Weapons Lab', x: 78, y: 38, description: 'Where X-Technology develops its weapons stockpiles. The depot destroyed by the player was supplied from here.', faction: 'X-Tech', category: 'Military' },
    
    // MIND BRIDGE FOUNDATION (Japan area - historical)
    { name: 'MindBridge Facility', x: 85, y: 28, description: 'Founded 2052 by Dr. Soren Okafor in Japan. Nonprofit to help the disabled. Absorbed into Ark Corp. 30 board members split — 15 got 100% access, 15 kept in the dark.', faction: 'Historical', category: 'Lore' },
    
    // EUROPEAN LOCATIONS
    { name: 'European Council Plaza', x: 44, y: 22, description: 'Capital of the European Remnant Council. Diplomatic center of the remnant world. Neutral ground.', faction: 'Neutral', category: 'Political' },
    { name: 'Synaptic Systems Hub', x: 46, y: 24, description: 'Where neural interfaces are manufactured. Where thoughts are read. Synaptic Systems controls all AI and neural tech in Europe.', faction: 'Synaptic Systems', category: 'Corporate' },
    { name: 'Alpine Fortress', x: 45, y: 26, description: 'Most fortified nation in the remnant world. The Alpine Confederation holds the mountain passes.', faction: 'Neutral', category: 'Political' },
    
    // AFRICAN LOCATIONS
    { name: 'Genetico Prime Farm', x: 48, y: 60, description: 'Largest genetically modified food production facility on Earth. Controls food for half the remnant world.', faction: 'Genetico', category: 'Corporate' },
    { name: 'Nairobi Highlands', x: 54, y: 50, description: 'Capital of the East African Federation. Largest city in Africa. Built on the East African Highlands above the Congo Inland Sea.', faction: 'Neutral', category: 'Political' },
    { name: 'Congo Inland Sea Research Station', x: 46, y: 54, description: 'Research station studying the flooded Congo Basin. Strange Element Zero mutations detected in the water.', faction: 'Independent', category: 'Research' },
    
    // SOUTH AMERICAN LOCATIONS
    { name: 'Andean Command', x: 16, y: 58, description: 'Military headquarters of the Andean Union. Controls the western spine of South America.', faction: 'Andean Union', category: 'Military' },
    { name: 'Brasília Capital', x: 24, y: 58, description: 'Capital of the Brazilian Republic. Largest city in South America. Built on the highlands above the flooded Amazon Basin.', faction: 'Brazilian Republic', category: 'Political' },
    { name: 'Amazon Basin Research Post', x: 22, y: 62, description: 'Research post studying the flooded Amazon. Something is moving in the deep water. Something that shouldn\'t exist.', faction: 'Independent', category: 'Research' },
    
    // NORTH AMERICAN LOCATIONS
    { name: 'New Pittsburgh', x: 18, y: 25, description: 'Capital of the Appalachian Federation. Fortified mountain stronghold built on the ruins of old Pittsburgh.', faction: 'Appalachian Federation', category: 'Political' },
    { name: 'New Chicago', x: 15, y: 23, description: 'Capital of the Great Lakes Confederation. City built on stilts above the merged Great Lakes.', faction: 'Great Lakes Confederation', category: 'Political' },
    { name: 'Denver', x: 8, y: 26, description: 'Capital of the Denver Compact. Largest city in the interior of the former United States.', faction: 'Denver Compact', category: 'Political' },
    { name: 'New Seattle', x: 4, y: 20, description: 'Capital of the Cascade Republic. Built on the Olympic Peninsula highlands above the flooded Pacific Northwest.', faction: 'Cascade Republic', category: 'Political' },
    { name: 'New Sacramento', x: 5, y: 30, description: 'Capital of the California Free State. Built on the Sierra Nevada foothills above the Central Valley inland sea.', faction: 'California Free State', category: 'Political' },
    { name: 'VitaCorp Reanimation Center', x: 12, y: 24, description: 'Where the wealthy come to stack lives like ammo. Owns reanimation technology. Controls who lives and dies.', faction: 'VitaCorp', category: 'Corporate' },
    { name: 'Appalachian Memorial', x: 20, y: 28, description: 'Memorial to the 180 million who died when the Eastern Seaboard flooded. "They built the future on water. The water took it back."', faction: 'Memorial', category: 'Historical' },
    
    // AUSTRALIAN LOCATIONS
    { name: 'Canberra', x: 82, y: 62, description: 'Capital of the Australian Interior. Built on the Great Dividing Range above the flooded coast.', faction: 'Australian Interior', category: 'Political' },
    { name: 'DataVault Server Farm', x: 80, y: 66, description: 'Underground facility storing all digital information on Earth. Heavily guarded. Some say the backups of every human mind are stored here.', faction: 'DataVault', category: 'Corporate' },
    
    // MARS (shown as separate indicator)
    { name: 'Mars Bunker (Hayden\'s Fortress)', x: 95, y: 50, description: 'Hayden Volkov\'s fortress on Mars. Built during the first Clusterfuck. Hayden is still alive at 147. Uses Smasher as his proxy. Controls Ark Corp from the red planet.', faction: 'Ark Corp', category: 'Off-World' }
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

  function drawLoreLocation(location, isHovered) {
    const x = location.x * canvas.width / 100;
    const y = location.y * canvas.height / 100;
    const radius = isHovered ? 10 : 6;

    // Pulsing glow effect
    const time = Date.now() / 1000;
    const pulse = Math.sin(time * 2 + x + y) * 0.3 + 0.7;

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 4);
    gradient.addColorStop(0, isHovered ? `rgba(255, 68, 68, ${0.9 * pulse})` : `rgba(255, 68, 68, ${0.5 * pulse})`);
    gradient.addColorStop(0.5, `rgba(220, 20, 60, ${0.3 * pulse})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius * 4, 0, Math.PI * 2);
    ctx.fill();

    // Outer ring
    ctx.beginPath();
    ctx.arc(x, y, radius + 2, 0, Math.PI * 2);
    ctx.strokeStyle = isHovered ? '#ff4444' : 'rgba(255, 68, 68, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Inner dot
    ctx.beginPath();
    ctx.arc(x, y, radius - 2, 0, Math.PI * 2);
    ctx.fillStyle = isHovered ? '#ffffff' : COLORS.loreLocation;
    ctx.fill();

    // Category indicator
    const categoryColors = {
      'Primary Setting': '#ff0000',
      'District': '#ff4400',
      'Military': '#ff8800',
      'Plaza': '#ffaa00',
      'Historical': '#ffcc00',
      'Character Location': '#ff6666',
      'Corporate': '#ff3333',
      'Secret': '#cc0000',
      'AI Facility': '#ff00ff',
      'Research': '#00ffcc',
      'Political': '#00ccff',
      'Neutral': '#888888',
      'Contested': '#ff8800',
      'Destroyed': '#666666',
      'Memorial': '#cccccc',
      'Off-World': '#ff00ff',
      'Mission Site': '#ff4444',
      'Lore': '#ffaaaa'
    };

    // Small category dot
    ctx.beginPath();
    ctx.arc(x + radius + 4, y - radius - 4, 3, 0, Math.PI * 2);
    ctx.fillStyle = categoryColors[location.category] || '#dc143c';
    ctx.fill();

    // Name label
    ctx.font = isHovered ? 'bold 13px Inter, sans-serif' : '11px Inter, sans-serif';
    ctx.fillStyle = isHovered ? '#ff4444' : '#dc143c';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(location.name, x, y + radius + 14);
    
    // Faction label when hovered
    if (isHovered) {
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = '#888888';
      ctx.fillText(`[${location.faction}]`, x, y + radius + 26);
    }
    ctx.shadowBlur = 0;
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
      { name: 'APPALACHIAN FEDERATION', x: 18, y: 25 },
      { name: 'GREAT LAKES CONFEDERATION', x: 15, y: 22 },
      { name: 'DENVER COMPACT', x: 8, y: 26 },
      { name: 'SUNKEN EASTERN SEABOARD', x: 25, y: 28 },
      { name: 'GULF OF MEXICO', x: 13, y: 42 },
      { name: 'FLORIDA TRENCH', x: 21, y: 40 },
      { name: 'ANDEAN UNION', x: 16, y: 58 },
      { name: 'BRAZILIAN REPUBLIC', x: 24, y: 58 },
      { name: 'AMAZON BASIN', x: 22, y: 62 },
      { name: 'EUROPEAN REMNANT COUNCIL', x: 44, y: 22 },
      { name: 'SIBERIAN KHANATE', x: 72, y: 12 },
      { name: 'EAST ASIAN COALITION', x: 72, y: 25 },
      { name: 'DECCAN REPUBLIC', x: 64, y: 38 },
      { name: 'EAST AFRICAN FEDERATION', x: 54, y: 50 },
      { name: 'CONGO INLAND SEA', x: 46, y: 54 },
      { name: 'AUSTRALIAN INTERIOR', x: 82, y: 62 },
      { name: 'NORTH SEA', x: 46, y: 16 },
      { name: 'MEDITERRANEAN', x: 44, y: 32 },
      { name: 'PERSIAN GULF', x: 58, y: 32 },
      { name: 'BAY OF BENGAL', x: 68, y: 38 },
      { name: 'YELLOW SEA', x: 84, y: 24 },
      { name: 'ARCTIC OCEAN', x: 60, y: 4 },
      { name: 'NEO-KYOTO CRATER', x: 88, y: 40 }
    ];

    labels.forEach(label => {
      ctx.fillText(label.name, label.x * canvas.width / 100, label.y * canvas.height / 100);
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save context and apply transformations for pan/zoom
    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);
    
    drawBackground();

    // Draw continents
    continents.forEach(continent => {
      const isHovered = hoveredRegion === continent.name;
      drawPolygon(continent.polygon, continent.color, isHovered ? '#ffffff' : COLORS.border, isHovered ? 2 : 0.5);
    });

    // Draw new nations
    newNations.forEach(nation => {
      const isHovered = hoveredRegion === nation.name;
      drawPolygon(nation.polygon, isHovered ? 'rgba(220, 20, 60, 0.3)' : nation.color, isHovered ? '#ffffff' : nation.borderColor, isHovered ? 2 : 1);
    });

    // Draw corporation territories
    regions.forEach(region => {
      const isHovered = hoveredRegion === region.name;
      drawPolygon(region.polygon, region.color, region.borderColor, isHovered ? 4 : 2);
    });

    // Draw labels
    drawLabels();

    // Draw lore locations (the new lore-important points)
    loreLocations.forEach(location => {
      const isHovered = hoveredRegion === location.name;
      drawLoreLocation(location, isHovered);
    });

    // Restore context so tooltip draws in screen space
    ctx.restore();
    
    // Draw tooltip (outside the transform so it stays in screen space)
    if (hoveredRegion) {
      drawTooltip();
    }
  }

  function drawTooltip() {
    const all = [...continents, ...newNations, ...regions, ...loreLocations];
    const region = all.find(r => r.name === hoveredRegion);
    if (!region || !region.description) return;

    const padding = 15;
    const maxWidth = 320;
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
    const tooltipHeight = lines.length * lineHeight + padding * 2 + 50;

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

    // Faction and category for lore locations
    if (region.faction) {
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = '#ff8888';
      ctx.fillText(`Faction: ${region.faction}`, tooltipX + padding, tooltipY + padding + 35);
    }
    if (region.category) {
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = '#888888';
      ctx.fillText(`Type: ${region.category}`, tooltipX + padding + 150, tooltipY + padding + 35);
    }

    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = COLORS.tooltipText;
    const startY = region.faction ? tooltipY + padding + 55 : tooltipY + padding + 40;
    lines.forEach((line, i) => {
      ctx.fillText(line, tooltipX + padding, startY + i * lineHeight);
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

  function getRegionAtPoint(screenX, screenY) {
    // Convert screen coordinates to map coordinates (accounting for pan/zoom)
    const x = (screenX - offsetX) / scale;
    const y = (screenY - offsetY) / scale;
    
    // Lore locations first (highest priority)
    for (const loc of loreLocations) {
      const lx = loc.x * canvas.width / 100;
      const ly = loc.y * canvas.height / 100;
      const dist = Math.sqrt((x - lx) ** 2 + (y - ly) ** 2);
      if (dist < 25) return loc.name;
    }

    // Corporation regions
    for (const region of regions) {
      if (isPointInPolygon(x, y, region.polygon)) {
        return region.name;
      }
    }

    // New nations
    for (const nation of newNations) {
      if (isPointInPolygon(x, y, nation.polygon)) {
        return nation.name;
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

  // Animation loop for pulsing effects
  function animate() {
    draw();
    requestAnimationFrame(animate);
  }

  // Event handlers
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (isDragging) {
      offsetX += screenX - lastMouseX;
      offsetY += screenY - lastMouseY;
      lastMouseX = screenX;
      lastMouseY = screenY;
      draw();
      return;
    }

    lastMouseX = screenX;
    lastMouseY = screenY;

    const newHovered = getRegionAtPoint(screenX, screenY);
    if (newHovered !== hoveredRegion) {
      hoveredRegion = newHovered;
      canvas.style.cursor = hoveredRegion ? 'pointer' : 'default';
      draw();
    }
  });

  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0) {
      isDragging = true;
      const rect = canvas.getBoundingClientRect();
      lastMouseX = e.clientX - rect.left;
      lastMouseY = e.clientY - rect.top;
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

    // Zoom toward mouse position in screen space
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
  animate();

  // Expose API
  window.necrowareMap = {
    reset: () => {
      scale = 1;
      offsetX = 0;
      offsetY = 0;
      draw();
    },
    zoomTo: (regionName) => {
      const all = [...continents, ...newNations, ...regions, ...loreLocations];
      const region = all.find(r => r.name === regionName);
      if (region) {
        if (region.polygon) {
          const centerX = region.polygon.reduce((sum, p) => sum + p[0], 0) / region.polygon.length;
          const centerY = region.polygon.reduce((sum, p) => sum + p[1], 0) / region.polygon.length;
          // Map center in canvas pixels
          const mapX = centerX * canvas.width / 100;
          const mapY = centerY * canvas.height / 100;
          scale = 2;
          // Center the region in the viewport
          offsetX = canvas.width / 2 - mapX * scale;
          offsetY = canvas.height / 2 - mapY * scale;
          draw();
        } else if (region.x !== undefined) {
          // Map coordinates in canvas pixels
          const mapX = region.x * canvas.width / 100;
          const mapY = region.y * canvas.height / 100;
          scale = 3;
          offsetX = canvas.width / 2 - mapX * scale;
          offsetY = canvas.height / 2 - mapY * scale;
          draw();
        }
      }
    }
  };

})();
