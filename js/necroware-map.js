// Necroware Interactive World Map
// Flooded world with risen water levels, submerged coastlines, and new fictional nations
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
    submerged: 'rgba(10, 5, 5, 0.6)',
    newNation: 'rgba(220, 20, 60, 0.15)',
    newNationBorder: 'rgba(220, 20, 60, 0.4)'
  };

  // Flooded continents (coastlines pushed inland due to risen sea levels ~2197)
  // Original coastlines are gone - these are the new shorelines after 200 years of flooding
  const continents = [
    // NORTH AMERICA - Eastern seaboard flooded up to the Appalachians, Gulf Coast gone, Florida submerged
    { 
      name: 'North American Remnant', 
      color: COLORS.land,
      description: 'What remains of North America after the Great Flood. The eastern seaboard is gone, swallowed by the Atlantic. The Gulf Coast is entirely underwater. Florida is a memory. The Appalachian Highlands now form the new eastern coastline.',
      polygon: [[3,15],[6,12],[10,10],[14,8],[18,10],[22,14],[25,20],[27,28],[28,35],[26,42],[22,48],[16,52],[10,48],[6,40],[3,30]]
    },
    // SUBMERGED: Eastern Seaboard, Florida, Gulf Coast, Central America, Pacific Northwest
    { name: 'Sunken Eastern Seaboard', color: COLORS.oceanShallow, description: 'Once home to 180 million people. New York, Boston, Washington DC, Philadelphia, Miami — all beneath the waves. The Atlantic now reaches the Appalachian foothills.', polygon: [[22,14],[28,12],[32,18],[30,28],[28,35],[26,42],[22,48],[18,42],[16,35],[18,25]] },
    { name: 'Gulf of Mexico (Expanded)', color: COLORS.oceanDeep, description: 'The Gulf has swallowed the entire Gulf Coast. Houston, New Orleans, Mobile, Tampa — all gone. The Gulf now reaches as far north as the Ozark Plateau.', polygon: [[10,38],[16,35],[20,38],[18,45],[12,48],[8,45]] },
    { name: 'Florida Trench', color: COLORS.oceanDeep, description: 'Florida is entirely underwater. Only the highest points of the Florida Keys break the surface as small islets. The rest is a shallow sea teeming with coral-encrusted ruins.', polygon: [[18,38],[22,36],[24,40],[22,44],[18,42]] },
    { name: 'Pacific Northwest Remnant', color: COLORS.land, description: 'The Cascade Range still rises above the waves. Seattle is gone but the Olympic Peninsula remains as a large island chain.', polygon: [[2,18],[5,15],[8,18],[6,25],[3,22]] },
    { name: 'California Remnant', color: COLORS.land, description: 'The Sierra Nevada forms the new spine of what was California. The Central Valley is an inland sea. Los Angeles is underwater. San Francisco is a small island.', polygon: [[3,25],[6,22],[8,28],[6,35],[4,32]] },
    { name: 'Alaska Remnant', color: COLORS.land, description: 'Alaska has lost its southern coast. Anchorage is gone. The Brooks Range and Alaska Range still stand above the waves.', polygon: [[2,10],[6,8],[10,10],[12,14],[8,16],[4,14]] },
    { name: 'Greenland Remnant', color: COLORS.land, description: 'Greenland has lost its southern third. The ice sheet has melted significantly, revealing new land but drowning the coasts.', polygon: [[25,5],[32,3],[35,8],[32,12],[28,12],[25,8]] },
    { name: 'Canadian Arctic Archipelago', color: COLORS.land, description: 'The Arctic islands have merged as sea levels rose. New land is emerging from the melting permafrost.', polygon: [[12,3],[20,2],[28,4],[25,8],[18,10],[12,8]] },
    { name: 'Hudson Bay (Expanded)', color: COLORS.oceanShallow, description: 'Hudson Bay has swallowed much of Manitoba and Ontario. Winnipeg is gone. The bay now reaches nearly to the Great Lakes.', polygon: [[12,12],[18,10],[22,14],[20,20],[14,22],[10,18]] },
    { name: 'Great Lakes (Merged)', color: COLORS.oceanShallow, description: 'The Great Lakes have merged into a single vast inland sea. Chicago, Detroit, Cleveland, Toronto — all submerged.', polygon: [[14,22],[18,20],[20,25],[16,28],[12,26]] },
    { name: 'Mississippi Inland Sea', color: COLORS.oceanShallow, description: 'The Mississippi River has become a vast inland sea stretching from the Gulf to Memphis. St. Louis is a port city on its western shore.', polygon: [[10,32],[14,30],[16,35],[14,40],[10,38]] },
    { name: 'Appalachian Highlands', color: COLORS.land, description: 'The Appalachians are now the eastern coastline. Millions of refugees from the drowned eastern cities have resettled here.', polygon: [[18,22],[22,20],[24,25],[22,30],[18,28]] },
    { name: 'Great Plains Remnant', color: COLORS.land, description: 'The Great Plains remain largely above water but the eastern portion is marshland. Denver is now the largest city in the interior.', polygon: [[6,25],[12,22],[16,25],[14,32],[8,35],[5,30]] },
    { name: 'Rocky Mountain Highlands', color: COLORS.land, description: 'The Rockies are a refuge. Much of the interior population has migrated here as the coasts flooded.', polygon: [[5,22],[8,20],[10,25],[8,30],[5,28]] },
    { name: 'Mexican Highlands', color: COLORS.land, description: 'Mexico\'s coastal plains are gone. Mexico City, now at a higher elevation, is one of the largest cities in the remnant world.', polygon: [[4,35],[8,32],[10,38],[8,42],[5,40]] },
    { name: 'Baja California Peninsula', color: COLORS.land, description: 'Baja is now a narrow island chain. The Gulf of California has widened significantly.', polygon: [[3,32],[5,30],[6,35],[4,38]] },
    { name: 'Yucatan Peninsula (Remnant)', color: COLORS.land, description: 'The Yucatan has lost its low-lying areas. The ancient Mayan ruins are now underwater archaeological sites.', polygon: [[12,40],[16,38],[18,42],[14,44]] },
    { name: 'Caribbean Archipelago', color: COLORS.land, description: 'The Caribbean islands are reduced to their highest peaks. Cuba, Hispaniola, Jamaica, and Puerto Rico are now small island chains.', polygon: [[18,40],[22,38],[24,42],[20,44]] },
    { name: 'Isthmus of Panama (Breached)', color: COLORS.oceanShallow, description: 'The Isthmus of Panama has been breached. The Atlantic and Pacific now connect through the Panama Strait.', polygon: [[12,45],[14,44],[14,48],[12,48]] },
    { name: 'Andean Highlands', color: COLORS.land, description: 'The Andes remain above water. The western coast of South America is now a series of fjords and islands.', polygon: [[14,50],[18,48],[20,55],[18,65],[14,70],[12,60]] },
    { name: 'Amazon Basin (Flooded)', color: COLORS.oceanShallow, description: 'The Amazon Basin is now a vast inland sea. Manaus is gone. The rainforest is half-submerged, creating a unique marine ecosystem.', polygon: [[18,50],[25,48],[28,55],[25,65],[18,68],[15,58]] },
    { name: 'Brazilian Highlands', color: COLORS.land, description: 'The Brazilian Highlands remain above water. São Paulo and Rio are gone but Brasília thrives in the interior.', polygon: [[22,55],[28,52],[30,58],[26,65],[22,62]] },
    { name: 'Patagonian Remnant', color: COLORS.land, description: 'Patagonia is one of the few habitable regions in South America. The pampas are underwater.', polygon: [[14,70],[18,68],[20,75],[16,80],[12,78]] },
    { name: 'European Remnant', color: COLORS.land, description: 'Europe has lost its low-lying areas. The Netherlands is gone. London is underwater. Paris is a coastal city on the new English Channel.', polygon: [[38,15],[45,10],[52,12],[58,18],[62,25],[58,32],[50,35],[42,30],[38,22]] },
    { name: 'British Isles (Remnant)', color: COLORS.land, description: 'The British Isles are reduced to the Scottish Highlands and the Pennines. London is gone. Edinburgh is the new capital.', polygon: [[35,15],[38,12],[40,15],[38,18],[36,18]] },
    { name: 'North Sea (Expanded)', color: COLORS.oceanDeep, description: 'The North Sea has swallowed Denmark, the Netherlands, Belgium, and much of northern Germany. Hamburg is gone.', polygon: [[42,14],[48,12],[52,15],[50,20],[44,20],[42,16]] },
    { name: 'Baltic Sea (Expanded)', color: COLORS.oceanDeep, description: 'The Baltic has swallowed Copenhagen, Stockholm, Helsinki, and the Baltic states. Only the highest ground remains.', polygon: [[48,8],[55,6],[58,10],[55,14],[50,12],[48,10]] },
    { name: 'Mediterranean (Expanded)', color: COLORS.oceanDeep, description: 'The Mediterranean has risen significantly. The Nile Delta is gone. Alexandria is underwater. Venice was gone long before the floods.', polygon: [[38,28],[45,25],[50,28],[48,35],[42,38],[38,32]] },
    { name: 'Adriatic Sea (Expanded)', color: COLORS.oceanDeep, description: 'The Adriatic has swallowed the Po Valley. Milan is gone. The Italian coast is now the Apennine ridges.', polygon: [[42,25],[46,22],[48,26],[46,30],[42,28]] },
    { name: 'Black Sea (Expanded)', color: COLORS.oceanDeep, description: 'The Black Sea has swallowed the Ukrainian coast. Odessa is gone. The Crimean Peninsula is now an island.', polygon: [[52,22],[58,20],[62,24],[58,28],[52,26]] },
    { name: 'Caspian Sea (Expanded)', color: COLORS.oceanDeep, description: 'The Caspian has expanded significantly, swallowing the Volga Delta and much of Kazakhstan.', polygon: [[55,22],[62,20],[65,24],[60,28],[55,26]] },
    { name: 'Scandinavian Remnant', color: COLORS.land, description: 'Scandinavia has lost its southern coast. Oslo is gone. The fjords have become vast inland seas.', polygon: [[40,5],[48,3],[52,6],[50,10],[44,10],[40,8]] },
    { name: 'Iberian Remnant', color: COLORS.land, description: 'Spain and Portugal have lost their coastal plains. Madrid is now the largest city on the peninsula.', polygon: [[32,28],[36,26],[40,30],[38,34],[34,34],[32,30]] },
    { name: 'Italian Remnant', color: COLORS.land, description: 'Italy is now a narrow mountain chain. Rome is gone. The Vatican is underwater.', polygon: [[42,28],[45,26],[48,28],[46,32],[42,30]] },
    { name: 'Balkan Remnant', color: COLORS.land, description: 'The Balkans have lost their coastal areas. The Danube Delta is gone.', polygon: [[48,25],[54,22],[56,26],[52,28],[48,26]] },
    { name: 'Anatolian Remnant', color: COLORS.land, description: 'Turkey has lost its coastal plains. Ankara is now the largest city.', polygon: [[52,28],[58,26],[62,30],[58,34],[52,32]] },
    { name: 'Siberian Remnant', color: COLORS.land, description: 'Siberia has lost its northern coast to the Arctic. The permafrost has melted, creating vast marshlands.', polygon: [[58,8],[75,5],[85,8],[88,15],[82,20],[70,18],[60,12]] },
    { name: 'Arctic Ocean (Expanded)', color: COLORS.oceanDeep, description: 'The Arctic Ocean has expanded dramatically. The polar ice is gone. New shipping routes have opened.', polygon: [[30,2],[50,1],[70,2],[90,4],[90,8],[30,8]] },
    { name: 'Central Asian Remnant', color: COLORS.land, description: 'Central Asia has become more arid. The Aral Sea has expanded but the Caspian has swallowed the western coast.', polygon: [[55,22],[65,20],[70,25],[65,28],[58,26]] },
    { name: 'East Asian Remnant', color: COLORS.land, description: 'China has lost its eastern seaboard. Shanghai, Beijing, Tianjin — all gone. The new coast follows the Taihang Mountains.', polygon: [[65,22],[80,18],[88,22],[86,30],[78,35],[70,32],[65,26]] },
    { name: 'Yellow Sea (Expanded)', color: COLORS.oceanDeep, description: 'The Yellow Sea has swallowed the North China Plain. Seoul is gone. The Korean Peninsula is now a narrow island chain.', polygon: [[80,22],[86,20],[88,24],[84,28],[80,26]] },
    { name: 'South China Sea (Expanded)', color: COLORS.oceanDeep, description: 'The South China Sea has swallowed Vietnam, Thailand, and the Mekong Delta. Bangkok is gone.', polygon: [[72,35],[80,32],[84,38],[80,44],[72,42]] },
    { name: 'Japanese Archipelago (Remnant)', color: COLORS.land, description: 'Japan is reduced to its mountain peaks. Tokyo is gone. Kyoto remains as the largest settlement.', polygon: [[85,25],[90,22],[92,26],[88,30],[85,28]] },
    { name: 'Indian Subcontinent (Remnant)', color: COLORS.land, description: 'India has lost its coastal plains. Mumbai, Chennai, Kolkata — all gone. The Deccan Plateau is now the heart of the subcontinent.', polygon: [[60,32],[68,30],[72,35],[70,42],[64,45],[60,40]] },
    { name: 'Bay of Bengal (Expanded)', color: COLORS.oceanDeep, description: 'The Bay of Bengal has swallowed Bangladesh and much of the Indian coast. Dhaka is gone.', polygon: [[64,35],[70,32],[72,38],[68,42],[64,40]] },
    { name: 'Arabian Peninsula (Remnant)', color: COLORS.land, description: 'The Arabian Peninsula has lost its coastal areas. The Persian Gulf has expanded northward.', polygon: [[52,32],[58,30],[62,34],[58,38],[52,36]] },
    { name: 'Persian Gulf (Expanded)', color: COLORS.oceanDeep, description: 'The Persian Gulf has swallowed the Tigris-Euphrates valley. Baghdad is gone. The Gulf now reaches the Zagros Mountains.', polygon: [[55,30],[60,28],[62,32],[58,35],[55,33]] },
    { name: 'African Remnant', color: COLORS.land, description: 'Africa has lost its coastal plains. The Nile Delta is gone. The Congo Basin is now an inland sea.', polygon: [[38,38],[48,35],[55,40],[58,55],[52,68],[42,72],[35,65],[38,50]] },
    { name: 'Nile Delta (Submerged)', color: COLORS.oceanDeep, description: 'The Nile Delta is entirely underwater. Alexandria is gone. Cairo is now a coastal city.', polygon: [[48,35],[52,33],[54,37],[50,38],[48,36]] },
    { name: 'Congo Inland Sea', color: COLORS.oceanShallow, description: 'The Congo Basin is now a vast inland sea. Kinshasa is gone. The surrounding highlands are densely populated.', polygon: [[42,50],[48,48],[50,54],[46,58],[42,56]] },
    { name: 'East African Highlands', color: COLORS.land, description: 'The East African Highlands remain above water. Nairobi is now one of the largest cities in Africa.', polygon: [[52,48],[56,46],[58,50],[56,54],[52,52]] },
    { name: 'Southern African Remnant', color: COLORS.land, description: 'Southern Africa has lost its coastal areas. Johannesburg is now the largest city on the continent.', polygon: [[42,62],[50,60],[54,64],[50,68],[44,70],[42,66]] },
    { name: 'Madagascar (Remnant)', color: COLORS.land, description: 'Madagascar is reduced to its central highlands. The coastal plains are gone.', polygon: [[60,62],[64,60],[66,64],[64,68],[62,66]] },
    { name: 'Australian Remnant', color: COLORS.land, description: 'Australia has lost its coastal plains. Sydney, Melbourne, Brisbane — all gone. The Great Dividing Range is now the eastern coast.', polygon: [[78,55],[88,52],[92,58],[88,68],[80,72],[75,65]] },
    { name: 'Great Australian Bight (Expanded)', color: COLORS.oceanDeep, description: 'The Great Australian Bight has swallowed the Nullarbor Plain. Perth is gone.', polygon: [[75,62],[82,60],[85,64],[82,68],[76,66]] },
    { name: 'New Zealand (Remnant)', color: COLORS.land, description: 'New Zealand is reduced to its mountain ranges. Auckland is gone. Wellington remains.', polygon: [[92,70],[95,68],[97,72],[94,74],[92,72]] },
    { name: 'Papua New Guinea (Remnant)', color: COLORS.land, description: 'Papua New Guinea is reduced to its highlands. Port Moresby is gone.', polygon: [[86,54],[90,52],[92,56],[88,58],[86,56]] },
    { name: 'Indonesian Archipelago (Remnant)', color: COLORS.land, description: 'Indonesia is reduced to its mountain peaks. Jakarta is gone. The islands are now much smaller.', polygon: [[74,52],[82,50],[86,54],[84,58],[76,60],[74,56]] },
    { name: 'Philippine Archipelago (Remnant)', color: COLORS.land, description: 'The Philippines are reduced to their highest peaks. Manila is gone.', polygon: [[82,38],[86,36],[88,40],[84,42],[82,40]] },
    { name: 'Antarctica', color: COLORS.land, description: 'Antarctica has lost much of its ice sheet. New land is emerging. Some nations have established research colonies.', polygon: [[10,90],[30,88],[50,90],[70,88],[90,90],[90,95],[10,95]] }
  ];

  // New fictional nations that have emerged in the flooded world
  const newNations = [
    {
      name: 'Appalachian Federation',
      color: COLORS.newNation,
      borderColor: COLORS.newNationBorder,
      description: 'Formed from the survivors of the drowned eastern seaboard. The Appalachian Federation is a mountainous nation stretching from the new eastern coast to the Mississippi Inland Sea. Capital: New Pittsburgh.',
      polygon: [[14,22],[22,20],[24,25],[22,30],[18,28],[14,26]]
    },
    {
      name: 'Great Lakes Confederation',
      color: COLORS.newNation,
      borderColor: COLORS.newNationBorder,
      description: 'A nation built around the merged Great Lakes. The Confederation controls the freshwater seas and the surrounding highlands. Capital: New Chicago.',
      polygon: [[12,20],[18,18],[20,22],[18,26],[14,26],[12,22]]
    },
    {
      name: 'Denver Compact',
      color: COLORS.newNation,
      borderColor: COLORS.newNationBorder,
      description: 'The interior nation of the former United States. The Denver Compact controls the Rocky Mountains and the western Great Plains. Capital: Denver.',
      polygon: [[5,22],[10,20],[14,22],[12,30],[8,32],[5,28]]
    },
    {
      name: 'Cascade Republic',
      color: COLORS.newNation,
      borderColor: COLORS.newNationBorder,
      description: 'A nation built on the Olympic Peninsula and the Cascade Range. The Cascade Republic controls the Pacific Northwest remnant. Capital: New Seattle.',
      polygon: [[2,18],[5,15],[8,18],[6,25],[3,22]]
    },
    {
      name: 'California Free State',
      color: COLORS.newNation,
      borderColor: COLORS.newNationBorder,
      description: 'A nation built on the Sierra Nevada. The California Free State controls the Central Valley inland sea and the surrounding mountains. Capital: New Sacramento.',
      polygon: [[3,25],[6,22],[8,28],[6,35],[4,32]]
    },
    {
      name: 'Mexican Federation',
      color: COLORS.newNation,
      borderColor: COLORS.newNationBorder,
      description: 'The remnant of Mexico, now centered on the highlands. The Mexican Federation controls the central plateau. Capital: Mexico City.',
      polygon: [[4,35],[8,32],[10,38],[8,42],[5,40]]
    },
    {
      name: 'Andean Union',
      color: COLORS.newNation,
      borderColor: COLORS.newNationBorder,
      description: 'A nation built along the Andes. The Andean Union controls the western spine of South America. Capital: Quito.',
      polygon: [[14,50],[18,48],[20,55],[18,65],[14,70],[12,60]]
    },
    {
      name: 'Brazilian Republic',
      color: COLORS.newNation,
      borderColor: COLORS.newNationBorder,
      description: 'The remnant of Brazil, now centered on the highlands. The Brazilian Republic controls the interior plateau. Capital: Brasília.',
      polygon: [[22,55],[28,52],[30,58],[26,65],[22,62]]
    },
    {
      name: 'Patagonian Commonwealth',
      color: COLORS.newNation,
      borderColor: COLORS.newNationBorder,
      description: 'A nation at the southern tip of South America. The Patagonian Commonwealth is one of the most stable nations in the remnant world. Capital: New Buenos Aires.',
      polygon: [[14,70],[18,68],[20,75],[16,80],[12,78]]
    },
    {
      name: 'European Remnant Council',
      color: COLORS.newNation,
      borderColor: COLORS.newNationBorder,
      description: 'A loose confederation of European highland nations. The Council coordinates defense and trade between the remnant states. Capital: Geneva.',
      polygon: [[38,18],[48,16],[52,20],[50,26],[42,28],[38,22]]
    },
    {
      name: 'Alpine Confederation',
      color: COLORS.newNation,
      borderColor: COLORS.newNationBorder,
      description: 'A nation built in the Alps. The Alpine Confederation is one of the most fortified nations in the world. Capital: Zurich.',
      polygon: [[42,22],[46,20],[48,24],[46,26],[42,24]]
    },
    {
      name: 'Scandinavian Remnant',
      color: COLORS.newNation,
      borderColor: COLORS.newNationBorder,
      description: 'The remnant of Scandinavia, now centered on the Norwegian and Swedish highlands. Capital: New Oslo.',
      polygon: [[40,5],[48,3],[52,6],[50,10],[44,10],[40,8]]
    },
    {
      name: 'Siberian Khanate',
      color: COLORS.newNation,
      borderColor: COLORS.newNationBorder,
      description: 'A vast nation stretching across the Siberian interior. The Khanate controls the resource-rich interior and the new Arctic coast. Capital: Novosibirsk.',
      polygon: [[58,8],[75,5],[85,8],[88,15],[82,20],[70,18],[60,12]]
    },
    {
      name: 'East Asian Coalition',
      color: COLORS.newNation,
      borderColor: COLORS.newNationBorder,
      description: 'A coalition of remnant Chinese states. The Coalition controls the highland interior and the new western coast. Capital: Chengdu.',
      polygon: [[65,22],[75,20],[80,25],[78,30],[70,28],[65,24]]
    },
    {
      name: 'Deccan Republic',
      color: COLORS.newNation,
      borderColor: COLORS.newNationBorder,
      description: 'A nation built on the Deccan Plateau. The Deccan Republic is the most populous nation in the remnant world. Capital: Bangalore.',
      polygon: [[60,35],[66,33],[68,38],[65,42],[60,40]]
    },
    {
      name: 'East African Federation',
      color: COLORS.newNation,
      borderColor: COLORS.newNationBorder,
      description: 'A nation built on the East African Highlands. The Federation controls the Great Rift Valley and the surrounding highlands. Capital: Nairobi.',
      polygon: [[52,48],[56,46],[58,50],[56,54],[52,52]]
    },
    {
      name: 'Southern African Union',
      color: COLORS.newNation,
      borderColor: COLORS.newNationBorder,
      description: 'A nation built on the Southern African plateau. The Union controls the mineral-rich interior. Capital: Johannesburg.',
      polygon: [[42,62],[50,60],[54,64],[50,68],[44,70],[42,66]]
    },
    {
      name: 'Australian Interior',
      color: COLORS.newNation,
      borderColor: COLORS.newNationBorder,
      description: 'A nation built on the Australian highlands. The Interior controls the Great Dividing Range and the western plateau. Capital: Canberra.',
      polygon: [[78,58],[86,56],[88,60],[86,64],[80,66],[78,62]]
    }
  ];

  // Corporation territories (overlay)
  const regions = [
    { name: 'Ark Corp', color: 'rgba(220, 20, 60, 0.2)', borderColor: 'rgba(220, 20, 60, 0.5)', description: 'Ark Corp controls the Siberian interior and much of northern Asia.', polygon: [[58,8],[75,5],[85,8],[88,15],[82,20],[70,18],[60,12]] },
    { name: 'X-Technologies', color: 'rgba(0, 100, 200, 0.2)', borderColor: 'rgba(0, 100, 200, 0.5)', description: 'X-Technologies controls the Pacific rim and the Japanese remnant.', polygon: [[75,35],[88,32],[92,42],[85,50],[75,48],[70,40]] },
    { name: 'Ash District', color: 'rgba(255, 140, 0, 0.2)', borderColor: 'rgba(255, 140, 0, 0.5)', description: 'The last free zone. A lawless sprawl in the crossroads between corporate territories.', polygon: [[35,45],[50,42],[58,50],[55,60],[45,65],[35,58],[30,50]] },
    { name: 'VitaCorp', color: 'rgba(0, 200, 100, 0.2)', borderColor: 'rgba(0, 200, 100, 0.5)', description: 'VitaCorp controls the North American interior and the Great Lakes.', polygon: [[5,18],[15,15],[22,22],[20,32],[12,35],[5,28]] },
    { name: 'Genetico', color: 'rgba(0, 150, 0, 0.2)', borderColor: 'rgba(0, 150, 0, 0.5)', description: 'Genetico controls the African highlands and the Brazilian interior.', polygon: [[35,55],[50,52],[55,58],[52,68],[42,72],[32,65]] },
    { name: 'Ironclad Defense', color: 'rgba(100, 100, 150, 0.2)', borderColor: 'rgba(100, 100, 150, 0.5)', description: 'Ironclad Defense controls the Andean highlands and the Mexican plateau.', polygon: [[18,38],[28,35],[32,42],[28,48],[18,45],[12,42]] },
    { name: 'OmniSource', color: 'rgba(255, 200, 0, 0.15)', borderColor: 'rgba(255, 200, 0, 0.4)', description: 'OmniSource controls the energy grids across Asia and Europe.', polygon: [[55,25],[68,22],[78,28],[75,35],[60,32],[55,28]] },
    { name: 'Synaptic Systems', color: 'rgba(150, 0, 150, 0.2)', borderColor: 'rgba(150, 0, 150, 0.4)', description: 'Synaptic Systems controls the European highlands.', polygon: [[38,22],[48,20],[52,25],[45,28],[38,25]] }
  ];

  // Cities (all above water)
  const cities = [
    { name: 'New Pittsburgh', x: 18, y: 25, description: 'Capital of the Appalachian Federation. Built on the ruins of the old city, now a fortified mountain stronghold.' },
    { name: 'New Chicago', x: 15, y: 23, description: 'Capital of the Great Lakes Confederation. A city built on stilts above the merged Great Lakes.' },
    { name: 'Denver', x: 8, y: 26, description: 'Capital of the Denver Compact. The largest city in the interior of the former United States.' },
    { name: 'New Seattle', x: 4, y: 20, description: 'Capital of the Cascade Republic. Built on the Olympic Peninsula highlands.' },
    { name: 'New Sacramento', x: 5, y: 30, description: 'Capital of the California Free State. Built on the Sierra Nevada foothills.' },
    { name: 'Mexico City', x: 7, y: 38, description: 'Capital of the Mexican Federation. One of the largest cities in the remnant world.' },
    { name: 'Quito', x: 16, y: 58, description: 'Capital of the Andean Union. Built high in the Andes.' },
    { name: 'Brasília', x: 24, y: 58, description: 'Capital of the Brazilian Republic. Now the largest city in South America.' },
    { name: 'New Buenos Aires', x: 15, y: 74, description: 'Capital of the Patagonian Commonwealth. A beacon of stability in the south.' },
    { name: 'Geneva', x: 44, y: 22, description: 'Capital of the European Remnant Council. The diplomatic center of the remnant world.' },
    { name: 'Zurich', x: 45, y: 24, description: 'Capital of the Alpine Confederation. A fortified mountain city.' },
    { name: 'New Oslo', x: 45, y: 6, description: 'Capital of the Scandinavian Remnant. Built on the Norwegian highlands.' },
    { name: 'Novosibirsk', x: 72, y: 12, description: 'Capital of the Siberian Khanate. The largest city in northern Asia.' },
    { name: 'Chengdu', x: 72, y: 25, description: 'Capital of the East Asian Coalition. Built in the Sichuan Basin.' },
    { name: 'Bangalore', x: 64, y: 38, description: 'Capital of the Deccan Republic. The most populous city in the remnant world.' },
    { name: 'Nairobi', x: 54, y: 50, description: 'Capital of the East African Federation. The largest city in Africa.' },
    { name: 'Johannesburg', x: 46, y: 65, description: 'Capital of the Southern African Union. The mineral capital of the world.' },
    { name: 'Canberra', x: 82, y: 62, description: 'Capital of the Australian Interior. Built on the Great Dividing Range.' }
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
      { name: 'CASCADE REPUBLIC', x: 4, y: 20 },
      { name: 'CALIFORNIA FREE STATE', x: 5, y: 30 },
      { name: 'MEXICAN FEDERATION', x: 7, y: 38 },
      { name: 'ANDEAN UNION', x: 16, y: 58 },
      { name: 'BRAZILIAN REPUBLIC', x: 24, y: 58 },
      { name: 'PATAGONIAN COMMONWEALTH', x: 15, y: 74 },
      { name: 'EUROPEAN REMNANT COUNCIL', x: 44, y: 22 },
      { name: 'ALPINE CONFEDERATION', x: 45, y: 24 },
      { name: 'SCANDINAVIAN REMNANT', x: 45, y: 6 },
      { name: 'SIBERIAN KHANATE', x: 72, y: 12 },
      { name: 'EAST ASIAN COALITION', x: 72, y: 25 },
      { name: 'DECCAN REPUBLIC', x: 64, y: 38 },
      { name: 'EAST AFRICAN FEDERATION', x: 54, y: 50 },
      { name: 'SOUTHERN AFRICAN UNION', x: 46, y: 65 },
      { name: 'AUSTRALIAN INTERIOR', x: 82, y: 62 },
      { name: 'SUNKEN EASTERN SEABOARD', x: 25, y: 28 },
      { name: 'GULF OF MEXICO', x: 13, y: 42 },
      { name: 'FLORIDA TRENCH', x: 21, y: 40 },
      { name: 'AMAZON BASIN', x: 22, y: 58 },
      { name: 'CONGO INLAND SEA', x: 46, y: 54 },
      { name: 'NORTH SEA', x: 46, y: 16 },
      { name: 'BALTIC SEA', x: 52, y: 10 },
      { name: 'MEDITERRANEAN', x: 44, y: 32 },
      { name: 'PERSIAN GULF', x: 58, y: 32 },
      { name: 'BAY OF BENGAL', x: 68, y: 38 },
      { name: 'YELLOW SEA', x: 84, y: 24 },
      { name: 'ARCTIC OCEAN', x: 60, y: 4 }
    ];

    labels.forEach(label => {
      ctx.fillText(label.name, label.x * canvas.width / 100, label.y * canvas.height / 100);
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();

    // Draw continents (base landmasses)
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
    const all = [...continents, ...newNations, ...regions, ...cities];
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
      const all = [...continents, ...newNations, ...regions, ...cities];
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
