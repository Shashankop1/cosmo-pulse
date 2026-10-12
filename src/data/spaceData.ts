export interface ConstellationStar {
  name: string;
  mag: number;
  distLy: number;
  specType: string;
  x: number;
  y: number;
  z: number;
}

export interface Constellation {
  id: string;
  name: string;
  latinName: string;
  hemisphere: 'NORTH' | 'SOUTH' | 'EQUATORIAL';
  brightestStar: string;
  distanceRangeLy: string;
  alphaStarDistLy: number;
  description: string;
  stars: ConstellationStar[];
  lines: [number, number][]; // pairs of star indexes
}

export const DEEP_SPACE_CONSTELLATIONS: Constellation[] = [
  {
    id: 'orion',
    name: 'Orion (The Hunter)',
    latinName: 'Orion',
    hemisphere: 'EQUATORIAL',
    brightestStar: 'Rigel (β Ori)',
    distanceRangeLy: '640 - 1,340 ly',
    alphaStarDistLy: 860,
    description: 'Prominent winter constellation housing the stellar cradles M42 and blue supergiant Rigel.',
    stars: [
      { name: 'Betelgeuse (α Ori)', mag: 0.5, distLy: 642.5, specType: 'M1-2 Ia-ab', x: -45, y: 75, z: -150 },
      { name: 'Bellatrix (γ Ori)', mag: 1.64, distLy: 252.5, specType: 'B2 III', x: -10, y: 65, z: -150 },
      { name: 'Alnitak (ζ Ori)', mag: 1.77, distLy: 1260, specType: 'O9.5 Ibe', x: -35, y: 20, z: -150 },
      { name: 'Alnilam (ε Ori)', mag: 1.69, distLy: 2000, specType: 'B0 Ia', x: -25, y: 15, z: -150 },
      { name: 'Mintaka (δ Ori)', mag: 2.23, distLy: 1200, specType: 'O9.5 II', x: -15, y: 10, z: -150 },
      { name: 'Saiph (κ Ori)', mag: 2.09, distLy: 650, specType: 'B0.5 Ia', x: -40, y: -40, z: -150 },
      { name: 'Rigel (β Ori)', mag: 0.13, distLy: 863, specType: 'B8 Ia', x: -5, y: -45, z: -150 }
    ],
    lines: [
      [0, 1],
      [0, 2],
      [1, 4],
      [2, 3],
      [3, 4],
      [2, 5],
      [4, 6]
    ]
  },
  {
    id: 'ursa_major',
    name: 'Ursa Major (The Great Bear)',
    latinName: 'Ursa Major',
    hemisphere: 'NORTH',
    brightestStar: 'Alioth (ε UMa)',
    distanceRangeLy: '78 - 123 ly',
    alphaStarDistLy: 82.6,
    description: 'Contains the Big Dipper asterism, crucial circumpolar guide pointing to Polaris.',
    stars: [
      { name: 'Dubhe (α UMa)', mag: 1.79, distLy: 123, specType: 'K0 III', x: 70, y: 95, z: -130 },
      { name: 'Merak (β UMa)', mag: 2.37, distLy: 79.7, specType: 'A1 V', x: 75, y: 65, z: -130 },
      { name: 'Phecda (γ UMa)', mag: 2.44, distLy: 83.2, specType: 'A0 V', x: 45, y: 55, z: -130 },
      { name: 'Megrez (δ UMa)', mag: 3.31, distLy: 80.5, specType: 'A3 V', x: 40, y: 80, z: -130 },
      { name: 'Alioth (ε UMa)', mag: 1.77, distLy: 82.6, specType: 'A1 III-IV', x: 15, y: 95, z: -130 },
      { name: 'Mizar (ζ UMa)', mag: 2.23, distLy: 82.9, specType: 'A2 V', x: -10, y: 110, z: -130 },
      { name: 'Alkaid (η UMa)', mag: 1.86, distLy: 103.9, specType: 'B3 V', x: -35, y: 125, z: -130 }
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [3, 4],
      [4, 5],
      [5, 6]
    ]
  },
  {
    id: 'cassiopeia',
    name: 'Cassiopeia (The Queen)',
    latinName: 'Cassiopeia',
    hemisphere: 'NORTH',
    brightestStar: 'Schedar (α Cas)',
    distanceRangeLy: '54 - 610 ly',
    alphaStarDistLy: 228,
    description: 'Iconic W-shaped circumpolar asterism opposite Ursa Major across Polaris.',
    stars: [
      { name: 'Caph (β Cas)', mag: 2.28, distLy: 54.7, specType: 'F2 III', x: 110, y: 35, z: -140 },
      { name: 'Schedar (α Cas)', mag: 2.24, distLy: 228, specType: 'K0 IIIa', x: 130, y: 15, z: -140 },
      { name: 'Gamma Cas (γ Cas)', mag: 2.15, distLy: 550, specType: 'B0.5 IVe', x: 150, y: 30, z: -140 },
      { name: 'Ruchbah (δ Cas)', mag: 2.68, distLy: 99.4, specType: 'A5 V', x: 175, y: 10, z: -140 },
      { name: 'Segin (ε Cas)', mag: 3.37, distLy: 460, specType: 'B3 V', x: 195, y: 25, z: -140 }
    ],
    lines: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4]
    ]
  },
  {
    id: 'cygnus',
    name: 'Cygnus (The Northern Cross)',
    latinName: 'Cygnus',
    hemisphere: 'NORTH',
    brightestStar: 'Deneb (α Cyg)',
    distanceRangeLy: '11.4 - 2,615 ly',
    alphaStarDistLy: 2615,
    description: 'The celestial swan flying along the Milky Way galactic plane, home of Cygnus X-1.',
    stars: [
      { name: 'Deneb (α Cyg)', mag: 1.25, distLy: 2615, specType: 'A2 Ia', x: 20, y: -70, z: -140 },
      { name: 'Sadr (γ Cyg)', mag: 2.23, distLy: 1800, specType: 'F8 Ib', x: 35, y: -90, z: -140 },
      { name: 'Albireo (β Cyg)', mag: 3.05, distLy: 430, specType: 'K3 II', x: 50, y: -125, z: -140 },
      { name: 'Gienah (ε Cyg)', mag: 2.48, distLy: 73, specType: 'K0 III', x: 65, y: -80, z: -140 },
      { name: 'Delta Cyg (δ Cyg)', mag: 2.87, distLy: 165, specType: 'B9.5 IV', x: 5, y: -100, z: -140 }
    ],
    lines: [
      [0, 1],
      [1, 2],
      [3, 1],
      [1, 4]
    ]
  },
  {
    id: 'crux',
    name: 'Crux (The Southern Cross)',
    latinName: 'Crux',
    hemisphere: 'SOUTH',
    brightestStar: 'Acrux (α Cru)',
    distanceRangeLy: '88 - 350 ly',
    alphaStarDistLy: 320,
    description: 'Smallest but most distinctive southern constellation pointing directly toward South Pole.',
    stars: [
      { name: 'Acrux (α Cru)', mag: 0.77, distLy: 320, specType: 'B0.5 IV', x: -110, y: -85, z: -130 },
      { name: 'Mimosa (β Cru)', mag: 1.25, distLy: 280, specType: 'B0.5 III', x: -95, y: -65, z: -130 },
      { name: 'Gacrux (γ Cru)', mag: 1.64, distLy: 88.6, specType: 'M3.5 III', x: -115, y: -45, z: -130 },
      { name: 'Imai (δ Cru)', mag: 2.78, distLy: 345, specType: 'B2 IV', x: -130, y: -68, z: -130 }
    ],
    lines: [
      [0, 2],
      [1, 3]
    ]
  }
];

export interface DistanceBeacon {
  name: string;
  type: string;
  distLy: string;
  distParsecs: string;
  apparentMag: string;
  spectralType: string;
  x: number;
  y: number;
  z: number;
}

export const DEEP_SPACE_DISTANCE_MARKERS: DistanceBeacon[] = [
  { name: 'Proxima Centauri', type: 'Red Dwarf System', distLy: '4.24 ly', distParsecs: '1.30 pc', apparentMag: '+11.05', spectralType: 'M5.5 Ve', x: -80, y: -30, z: -90 },
  { name: 'Sirius (Alpha CMa)', type: 'Binary System A1V+DA2', distLy: '8.60 ly', distParsecs: '2.64 pc', apparentMag: '-1.46', spectralType: 'A1 V', x: -65, y: -60, z: -110 },
  { name: 'Vega (Alpha Lyr)', type: 'A-type Main Sequence', distLy: '25.04 ly', distParsecs: '7.68 pc', apparentMag: '+0.03', spectralType: 'A0 Va', x: 45, y: 35, z: -120 },
  { name: 'Arcturus (Alpha Boo)', type: 'Red Giant Star', distLy: '36.70 ly', distParsecs: '11.26 pc', apparentMag: '-0.05', spectralType: 'K1.5 III', x: 80, y: 60, z: -115 },
  { name: 'Aldebaran (Alpha Tau)', type: 'Orange Giant', distLy: '65.30 ly', distParsecs: '20.02 pc', apparentMag: '+0.85', spectralType: 'K5 III', x: -90, y: 40, z: -125 },
  { name: 'Pleiades Cluster (M45)', type: 'Open Star Cluster', distLy: '444 ly', distParsecs: '136.2 pc', apparentMag: '+1.60', spectralType: 'Reflection', x: -120, y: 55, z: -140 },
  { name: 'Betelgeuse (Alpha Ori)', type: 'Red Supergiant', distLy: '642.5 ly', distParsecs: '197.0 pc', apparentMag: '+0.50', spectralType: 'M1-2 Ia', x: -45, y: 75, z: -150 },
  { name: 'Orion Nebula (M42)', type: 'Diffuse H-II Region', distLy: '1,344 ly', distParsecs: '412.0 pc', apparentMag: '+4.00', spectralType: 'Emission', x: -30, y: 5, z: -160 },
  { name: 'Crab Nebula (M1)', type: 'Supernova Remnant Pulsar', distLy: '6,500 ly', distParsecs: '1,993 pc', apparentMag: '+8.40', spectralType: 'Plerion', x: -75, y: 90, z: -180 },
  { name: 'Sagittarius A*', type: 'Supermassive Black Hole', distLy: '26,673 ly', distParsecs: '8,178 pc', apparentMag: 'Radio Core', spectralType: 'Compact Core', x: 95, y: -90, z: -200 }
];


export interface GasComposition {
  name: string;
  val: string;
  color: string;
  percentage: number;
}

export interface CelestialBody {
  id: string;
  symbol: string;
  au: string;
  sector: string;
  name: string;
  classification: string;
  mass: string;
  earthMass: string;
  radius: string;
  equatRadius: string;
  temp: string;
  tempRange: string;
  gravity: string;
  gForce: string;
  period: string;
  axialTilt: string;
  velocity: string;
  colorHex: number;
  atmosHex: number;
  hasRings?: boolean;
  satelliteMission?: string;
  satelliteSensor?: string;
  resolutionGSD?: string;
  textureUrls?: {
    topographic: string;
    magnetosphere?: string;
    infrared?: string;
  };
  gases: GasComposition[];
  hotspots: Hotspot[];
}

export const CELESTIAL_DATA: Record<string, CelestialBody> = {
  earth: {
    id: 'earth',
    symbol: '⊕',
    au: '1.00 AU',
    sector: 'SECTOR 001 // INNER DISK',
    name: 'EARTH (TERRA-1)',
    classification: 'Type: Terrestrial / Class M Habitable',
    mass: '5.972 × 10²⁴',
    earthMass: '1.000 Earth Mass',
    radius: '6,371.0 km',
    equatRadius: 'Equat: 6,378 km',
    temp: 'Avg 15°C',
    tempRange: '-88°C to +58°C',
    gravity: '9.807 m/s²',
    gForce: '1.00 G',
    period: '365.256 Days (1.000 yr)',
    axialTilt: '23.44° AXIAL TILT',
    velocity: '29.78 km/s',
    colorHex: 0x1d4e89,
    atmosHex: 0x66fcf1,
    satelliteMission: 'NASA Blue Marble NextGen / Terra MODIS / VIIRS',
    satelliteSensor: 'MODIS + VIIRS Multi-Spectral Day/Night Global Mosaic',
    resolutionGSD: '500m Global Equirectangular Mosaic (2048x1024 True-Color)',
    textureUrls: {
      topographic: 'https://solartextures.b-cdn.net/2k_earth_daymap.jpg',
      magnetosphere: 'https://solartextures.b-cdn.net/2k_earth_nightmap.jpg',
      infrared: 'https://solartextures.b-cdn.net/2k_earth_clouds.jpg'
    },
    gases: [
      { name: 'N₂ Nitrogen', val: '78.08%', color: '#62f9ee', percentage: 78.08 },
      { name: 'O₂ Oxygen', val: '20.95%', color: '#3cdcd1', percentage: 20.95 },
      { name: 'Ar Argon', val: '0.93%', color: '#e1b6ff', percentage: 0.93 },
      { name: 'CO₂ Carbon', val: '421 ppm', color: '#ffba27', percentage: 0.04 }
    ],
    hotspots: [
      { title: 'Mariana Trench Abyss', desc: 'Depth: -10,994m // 11.35°N, 142.20°E', tag: 'ANOMALY', lat: 11.35, lon: 142.20 },
      { title: 'Aurora Borealis Oval', desc: 'Polar Magnetosphere // 68.42°N, 14.50°E', tag: 'IONIC', lat: 68.42, lon: 14.50 },
      { title: 'Guiana Space Centre', desc: 'Equatorial Launch Port // 05.23°N, 52.77°W', tag: 'ACTIVE', lat: 5.23, lon: -52.77 }
    ]
  },
  mercury: {
    id: 'mercury',
    symbol: '☿',
    au: '0.39 AU',
    sector: 'SECTOR 000 // PERIHELION ZONE',
    name: 'MERCURY (HERMES-1)',
    classification: 'Type: Terrestrial / Airless Iron Core',
    mass: '3.301 × 10²³',
    earthMass: '0.055 Earth Mass',
    radius: '2,439.7 km',
    equatRadius: 'Equat: 2,440 km',
    temp: 'Avg 167°C',
    tempRange: '-173°C to +427°C',
    gravity: '3.700 m/s²',
    gForce: '0.38 G',
    period: '87.969 Days (0.24 yr)',
    axialTilt: '0.034° AXIAL TILT',
    velocity: '47.36 km/s',
    colorHex: 0x8d99ae,
    atmosHex: 0x90e0ef,
    satelliteMission: 'NASA MESSENGER Orbiter (MDIS Satellite Camera)',
    satelliteSensor: 'Mercury Dual Imaging System (MDIS) Multispectral Imager',
    resolutionGSD: '250m Global Photometric Surface Basemap',
    textureUrls: {
      topographic: 'https://solartextures.b-cdn.net/2k_mercury.jpg'
    },
    gases: [
      { name: 'O₂ Oxygen', val: '42.0%', color: '#62f9ee', percentage: 42.0 },
      { name: 'Na Sodium', val: '29.0%', color: '#ffd166', percentage: 29.0 },
      { name: 'H₂ Hydrogen', val: '22.0%', color: '#e1b6ff', percentage: 22.0 },
      { name: 'He Helium', val: '6.0%', color: '#3cdcd1', percentage: 6.0 }
    ],
    hotspots: [
      { title: 'Caloris Basin', desc: 'Impact crater // 30.5°N, 189.8°W', tag: 'IMPACT', lat: 30.5, lon: -189.8 },
      { title: 'Discovery Rupes', desc: 'Thrust fault scarp // 56.3°S, 38.3°W', tag: 'TECTONIC', lat: -56.3, lon: -38.3 }
    ]
  },
  venus: {
    id: 'venus',
    symbol: '♀',
    au: '0.72 AU',
    sector: 'SECTOR 001 // VEIL SHROUD',
    name: 'VENUS (CYTHEREA-1)',
    classification: 'Type: Superheated Greenhouse World',
    mass: '4.867 × 10²⁴',
    earthMass: '0.815 Earth Mass',
    radius: '6,051.8 km',
    equatRadius: 'Equat: 6,052 km',
    temp: 'Avg 464°C',
    tempRange: '+437°C to +482°C',
    gravity: '8.870 m/s²',
    gForce: '0.90 G',
    period: '224.701 Days (0.62 yr)',
    axialTilt: '177.36° RETROGRADE',
    velocity: '35.02 km/s',
    colorHex: 0xd4a373,
    atmosHex: 0xffba27,
    satelliteMission: 'NASA Magellan Radar Orbiter & JAXA Akatsuki',
    satelliteSensor: 'Magellan Synthetic Aperture Radar (SAR) Global Mosaic',
    resolutionGSD: '120m SAR Synthetic Aperture Radar Altimetry',
    textureUrls: {
      topographic: 'https://solartextures.b-cdn.net/2k_venus_surface.jpg',
      infrared: 'https://solartextures.b-cdn.net/2k_venus_atmosphere.jpg'
    },
    gases: [
      { name: 'CO₂ Carbon', val: '96.5%', color: '#ff7043', percentage: 96.5 },
      { name: 'N₂ Nitrogen', val: '3.5%', color: '#62f9ee', percentage: 3.5 },
      { name: 'SO₂ Sulfur', val: '150 ppm', color: '#ffd166', percentage: 0.1 },
      { name: 'Ar Argon', val: '70 ppm', color: '#e1b6ff', percentage: 0.05 }
    ],
    hotspots: [
      { title: 'Maat Mons Volcano', desc: 'Shield volcano // 0.5°N, 194.6°E', tag: 'MAGMATIC', lat: 0.5, lon: 194.6 },
      { title: 'Aphrodite Terra', desc: 'Crustal highlands // 5.8°S, 104.8°E', tag: 'TERRA', lat: -5.8, lon: 104.8 }
    ]
  },
  mars: {
    id: 'mars',
    symbol: '♂',
    au: '1.52 AU',
    sector: 'SECTOR 002 // RED DESERT',
    name: 'MARS (ARES-4)',
    classification: 'Type: Terrestrial / Arid Oxide Crust',
    mass: '6.417 × 10²³',
    earthMass: '0.107 Earth Mass',
    radius: '3,389.5 km',
    equatRadius: 'Equat: 3,396 km',
    temp: 'Avg -63°C',
    tempRange: '-140°C to +20°C',
    gravity: '3.721 m/s²',
    gForce: '0.38 G',
    period: '686.980 Days (1.88 yr)',
    axialTilt: '25.19° AXIAL TILT',
    velocity: '24.07 km/s',
    colorHex: 0xc84b31,
    atmosHex: 0xff7043,
    satelliteMission: 'NASA Mars Reconnaissance Orbiter (MRO) / Viking 1 & 2',
    satelliteSensor: 'HiRISE + Context Camera (CTX) + Viking Global MDIM Mosaic',
    resolutionGSD: '232m Global Calibrated Color Orthorectified Composite',
    textureUrls: {
      topographic: 'https://solartextures.b-cdn.net/2k_mars.jpg'
    },
    gases: [
      { name: 'CO₂ Carbon', val: '95.32%', color: '#ff7043', percentage: 95.32 },
      { name: 'N₂ Nitrogen', val: '2.60%', color: '#62f9ee', percentage: 2.60 },
      { name: 'Ar Argon', val: '1.90%', color: '#e1b6ff', percentage: 1.90 },
      { name: 'O₂ Oxygen', val: '0.13%', color: '#3cdcd1', percentage: 0.13 }
    ],
    hotspots: [
      { title: 'Olympus Mons', desc: 'Max elevation: 21.9 km // 18.65°N, 226.2°E', tag: 'VOLCANO', lat: 18.65, lon: -133.8 },
      { title: 'Valles Marineris', desc: 'Canyon rift: 4,000 km // 14.0°S, 59.2°W', tag: 'CHASM', lat: -14.0, lon: -59.2 },
      { title: 'Jezero Crater', desc: 'Perseverance Rover target delta // 18.38°N, 77.58°E', tag: 'PALEO-LAKE', lat: 18.38, lon: 77.58 }
    ]
  },
  jupiter: {
    id: 'jupiter',
    symbol: '♃',
    au: '5.20 AU',
    sector: 'SECTOR 003 // JOVIAN BARYCENTER',
    name: 'JUPITER (JOVE-KING)',
    classification: 'Type: Gas Giant / Metallic Hydrogen Mantle',
    mass: '1.898 × 10²⁷',
    earthMass: '317.8 Earth Masses',
    radius: '69,911 km',
    equatRadius: 'Equat: 71,492 km',
    temp: 'Avg -110°C',
    tempRange: '-145°C to -108°C',
    gravity: '24.79 m/s²',
    gForce: '2.53 G',
    period: '4,332.59 Days (11.86 yr)',
    axialTilt: '3.13° AXIAL TILT',
    velocity: '13.07 km/s',
    colorHex: 0xd4a373,
    atmosHex: 0xffa726,
    satelliteMission: 'NASA Juno Spacecraft / Cassini Flyby / Hubble Space Telescope',
    satelliteSensor: 'JunoCam + Wide Field Camera 3 (WFC3) Global Cylindrical Projection',
    resolutionGSD: '15 km/pixel True-Color Atmospheric Zonal Cloud Map',
    textureUrls: {
      topographic: 'https://solartextures.b-cdn.net/2k_jupiter.jpg'
    },
    gases: [
      { name: 'H₂ Hydrogen', val: '89.8%', color: '#62f9ee', percentage: 89.8 },
      { name: 'He Helium', val: '10.2%', color: '#ffd166', percentage: 10.2 },
      { name: 'CH₄ Methane', val: '0.30%', color: '#e1b6ff', percentage: 0.30 },
      { name: 'NH₃ Ammonia', val: '260 ppm', color: '#3cdcd1', percentage: 0.05 }
    ],
    hotspots: [
      { title: 'Great Red Spot', desc: 'Anticyclonic megastorm // 22°S, 0°W', tag: 'MEGACYLONE', lat: -22.0, lon: 0.0 },
      { title: 'North Polar Auroral Ring', desc: 'Radio-bright auroral curtain // 72°N', tag: 'SYNCHROTRON', lat: 72.0, lon: 90.0 }
    ]
  },
  saturn: {
    id: 'saturn',
    symbol: '♄',
    au: '9.58 AU',
    sector: 'SECTOR 004 // RING CITADEL',
    name: 'SATURN (CHRONOS-1)',
    classification: 'Type: Gas Giant / Planar Ring System',
    mass: '5.683 × 10²⁶',
    earthMass: '95.2 Earth Masses',
    radius: '58,232 km',
    equatRadius: 'Equat: 60,268 km',
    temp: 'Avg -140°C',
    tempRange: '-178°C to -139°C',
    gravity: '10.44 m/s²',
    gForce: '1.06 G',
    period: '10,759.22 Days (29.45 yr)',
    axialTilt: '26.73° AXIAL TILT',
    velocity: '9.68 km/s',
    colorHex: 0xe0c097,
    atmosHex: 0xffe082,
    hasRings: true,
    satelliteMission: 'NASA/ESA Cassini-Huygens Orbiter (ISS Imaging Science Subsystem)',
    satelliteSensor: 'Cassini Narrow Angle Camera (NAC) Multi-Filter Mosaic',
    resolutionGSD: '20 km/pixel Calibrated True-Color Atmospheric Equirectangular Map',
    textureUrls: {
      topographic: 'https://solartextures.b-cdn.net/2k_saturn.jpg'
    },
    gases: [
      { name: 'H₂ Hydrogen', val: '96.3%', color: '#62f9ee', percentage: 96.3 },
      { name: 'He Helium', val: '3.25%', color: '#ffd166', percentage: 3.25 },
      { name: 'CH₄ Methane', val: '0.45%', color: '#e1b6ff', percentage: 0.45 },
      { name: 'NH₃ Ammonia', val: '125 ppm', color: '#3cdcd1', percentage: 0.05 }
    ],
    hotspots: [
      { title: 'Cassini Division', desc: 'Ring gap 4,800 km wide // 117,580 km', tag: 'RESONANCE', lat: 0.0, lon: 45.0 },
      { title: 'Hexagonal Polar Jet', desc: 'Persistent 6-sided jet wave // 78°N', tag: 'ATMOS-WAVE', lat: 78.0, lon: 0.0 }
    ]
  },
  uranus: {
    id: 'uranus',
    symbol: '♅',
    au: '19.22 AU',
    sector: 'SECTOR 005 // AXIAL TILT PRIME',
    name: 'URANUS (OURANOS)',
    classification: 'Type: Ice Giant / 97.77° Retrograde Tilt',
    mass: '8.681 × 10²⁵',
    earthMass: '14.5 Earth Masses',
    radius: '25,362 km',
    equatRadius: 'Equat: 25,559 km',
    temp: 'Avg -195°C',
    tempRange: '-216°C to -195°C',
    gravity: '8.690 m/s²',
    gForce: '0.89 G',
    period: '30,685.4 Days (84.01 yr)',
    axialTilt: '97.77° RETROGRADE',
    velocity: '6.80 km/s',
    colorHex: 0x48cae4,
    atmosHex: 0x00b4d8,
    satelliteMission: 'NASA Voyager 2 Flyby (1986) & Hubble WFC3 Reanalysis',
    satelliteSensor: 'Voyager 2 Narrow Angle Camera Clear/Orange/Violet Composite',
    resolutionGSD: '45 km/pixel Methane Cloud Bandpass Projection',
    textureUrls: {
      topographic: 'https://solartextures.b-cdn.net/2k_uranus.jpg'
    },
    gases: [
      { name: 'H₂ Hydrogen', val: '82.5%', color: '#62f9ee', percentage: 82.5 },
      { name: 'He Helium', val: '15.2%', color: '#ffd166', percentage: 15.2 },
      { name: 'CH₄ Methane', val: '2.30%', color: '#e1b6ff', percentage: 2.30 },
      { name: 'HD Deuteride', val: '148 ppm', color: '#3cdcd1', percentage: 0.05 }
    ],
    hotspots: [
      { title: 'Epsilon Ring Flare', desc: 'Dense icy filament system', tag: 'ICE RING', lat: 10.0, lon: 120.0 }
    ]
  },
  neptune: {
    id: 'neptune',
    symbol: '♆',
    au: '30.05 AU',
    sector: 'SECTOR 006 // KUIPER BORDERLAND',
    name: 'NEPTUNE (POSEIDON)',
    classification: 'Type: Ice Giant / Supersonic Methane Winds',
    mass: '1.024 × 10²⁶',
    earthMass: '17.1 Earth Masses',
    radius: '24,622 km',
    equatRadius: 'Equat: 24,764 km',
    temp: 'Avg -200°C',
    tempRange: '-218°C to -200°C',
    gravity: '11.15 m/s²',
    gForce: '1.14 G',
    period: '60,189.0 Days (164.8 yr)',
    axialTilt: '28.32° AXIAL TILT',
    velocity: '5.43 km/s',
    colorHex: 0x0077b6,
    atmosHex: 0x00b4d8,
    satelliteMission: 'NASA Voyager 2 Flyby (1989) & Very Large Telescope (VLT) MUSE',
    satelliteSensor: 'Voyager 2 ISS High-Resolution Planetary Imaging Camera',
    resolutionGSD: '35 km/pixel Methane Absorbance Color Corrected Map',
    textureUrls: {
      topographic: 'https://solartextures.b-cdn.net/2k_neptune.jpg'
    },
    gases: [
      { name: 'H₂ Hydrogen', val: '80.0%', color: '#62f9ee', percentage: 80.0 },
      { name: 'He Helium', val: '19.0%', color: '#ffd166', percentage: 19.0 },
      { name: 'CH₄ Methane', val: '1.50%', color: '#e1b6ff', percentage: 1.50 },
      { name: 'C₂H₆ Ethane', val: '1.5 ppm', color: '#3cdcd1', percentage: 0.05 }
    ],
    hotspots: [
      { title: 'Great Dark Spot 2024', desc: 'Retrograde vortex: 2,100 km/h // 20°S', tag: 'SUPERSONIC', lat: -20.0, lon: 45.0 }
    ]
  },
  europa: {
    id: 'europa',
    symbol: '☽',
    au: 'Jovian Moon',
    sector: 'SECTOR 003 // SUB-SURFACE OCEAN',
    name: 'EUROPA (JOVIAN-II)',
    classification: 'Type: Ocean Moon / Sub-surface Biosphere Candidate',
    mass: '4.800 × 10²²',
    earthMass: '0.008 Earth Mass',
    radius: '1,560.8 km',
    equatRadius: 'Equat: 1,561 km',
    temp: 'Avg -160°C',
    tempRange: '-220°C to -130°C',
    gravity: '1.315 m/s²',
    gForce: '0.13 G',
    period: '3.551 Days (Tidally locked)',
    axialTilt: '0.1° AXIAL TILT',
    velocity: '13.74 km/s',
    colorHex: 0xdfe7fd,
    atmosHex: 0x66fcf1,
    satelliteMission: 'NASA Galileo Orbiter SSI & Europa Clipper Trajectory',
    satelliteSensor: 'Galileo Solid-State Imaging (SSI) Multi-Spectral Camera',
    resolutionGSD: '1.6 km/pixel Global Color Mosaic (Chaos terrain & Lineae fractures)',
    textureUrls: {
      topographic: 'https://solartextures.b-cdn.net/2k_moon.jpg'
    },
    gases: [
      { name: 'O₂ Oxygen', val: '99.0%', color: '#62f9ee', percentage: 99.0 },
      { name: 'H₂O Vapor', val: '0.90%', color: '#3cdcd1', percentage: 0.90 },
      { name: 'H₂ Hydrogen', val: '0.10%', color: '#e1b6ff', percentage: 0.10 },
      { name: 'Na Salt', val: 'Traces', color: '#ffd166', percentage: 0.01 }
    ],
    hotspots: [
      { title: 'Therma Chaos', desc: 'Ice raft fracturing // 12.3°S, 184.2°W', tag: 'CRYO-PLUME', lat: -12.3, lon: -184.2 },
      { title: 'Conamara Chaos', desc: 'Sub-surface hydrothermal ocean site', tag: 'HYDROTHERMAL', lat: 10.0, lon: 88.0 }
    ]
  }
};

export interface SightingsPost {
  id: string;
  author: string;
  authorTitle: string;
  avatarUrl: string;
  verified: boolean;
  category: string;
  categoryTag: string;
  title: string;
  description: string;
  coordinates: string[];
  integration: string;
  band: string;
  imageUrl: string;
  boosts: number;
  comments: number;
  skyTagged?: boolean;
}

export const INITIAL_SIGHTINGS: SightingsPost[] = [
  {
    id: 'sighting-1',
    author: 'Dr. Elena Rostova',
    authorTitle: 'PALOMAR RESEARCH FELLOW // JWST WORKING GROUP',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCw9oCI8hJEwHvXEdpk2W3cmaUKMMAHJAwh1Q5KgvGMCmA8OyzniDKYppcQnkAGHFdF_RvmmI8t1wXnzXnAGtkJlKi8XkfL6ySc7qSPTvGorMq9SOJOVBFYA5WEIGWvE4r7d76coZKxSWvJEt6H1A9VXVjBSiwbjmCEk-dxiOHXwb3d6mybGRyy1DthfZMKqRhxPG5_yW9mFPuA-PJF6KbMj7TQwheQHKUVrfziy8toX1WHtFccffSsAw',
    verified: true,
    category: 'DEEP SKY GALAXY CLUSTER',
    categoryTag: 'DEEP SKY NEBULAE',
    title: 'James Webb Deep Field Gravitational Lens SMACS 0723',
    description: 'Extensive reprocessing of the infrared dataset uncovering high-redshift arcs lensed across 4.6 billion light-years. Noticeable gravitational curvature magnification at outer rim.',
    coordinates: ['RA 07h 23m 19s', 'DEC -73° 27′ 15″', '12.5 HRS INTEGRATION', 'NIRCam F090W / F150W / F200W'],
    integration: '12.5 HRS',
    band: 'NIRCam F090W/F150W/F200W',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBHgGSImkJHbOq_YRLUFqqQJPcuoELgEL0KMgIFcdOn3hxfYRflFuZJOcaHe4uO9qOeHajpL3vtgmmkfkZ5-oChX59gFpKw4nrohArCLzVAj4wyzf9Mme7itLbfgUxRY4AIW8h9da_CzCKrYpf5lLYdjzZQ7FNax81oK3jcNdFuWm5wUjhKXgz9Ia8f5Yuqlvoe4R6x816G0o_x3S7KIP_3ncv7WUkASAvsEWM5K1tD8F2OzdejJcRQgg',
    boosts: 2490,
    comments: 184,
    skyTagged: true
  },
  {
    id: 'sighting-2',
    author: 'AstroKip',
    authorTitle: 'HIGH-ALTITUDE BALLOON SENSOR PLATFORM 4',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDTf0Y7jZ8qM7i3UpYNUlPYLbHgE_2tjW_vOrfroU8drGGp5GIWEWbFSBe6B1AxH-tfSwN75gBiQgIsERg_pUOB3sPI8shVBuaWBE1RSzQYiLk8zOOGVzVIE1GG3q5KDHyeSjXEl8G7mZaEiU1gdfFWQnVEfQYfLJAOovrxKNjQ89sdoKOd9IAe5fqDF9OpC6OX1fZ_2r80E8WG7gD1jvSfHEs_z7VxEFHaYQgKeZo2Wl26IB8QcLnl8A',
    verified: false,
    category: 'SOLAR SYSTEM OBSERVATION',
    categoryTag: 'PLANETARY HI-RES',
    title: 'Martian Dust Devil Vortex over Olympus Mons Base',
    description: 'High-gain telephoto tracking of an atmospheric cyclonic dust plume spinning across the lower caldera basal plains. Exceptional contrast through polarizing infrared bandpass.',
    coordinates: ['MARS: 18.65° N, 226.20° E', 'FILTER: IR-680nm LONGPASS', 'ELEVATION: 12,400 M AMSL'],
    integration: 'REALTIME GAIN',
    band: 'IR-680nm LONGPASS',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCzqIPTJFOoltpti0HjA7MhmAFBwhPKGOB3hy1qgZALCdoW7GezrJ_RlXr0xvLTZ3R6k0keQtkohnz0BXPTyKxCiiLjP-PYpYikXpLq6mXf1zPdDjjdk_mL8Ot2YIIRJ_L3M82JLzq2FEG1gebESCIgZ3rmplA1t1in_t43VygF_RHnPvssD-0r1s49Sv2CkoRPnRg_6fj5BQ1g-sgAI-dZFhMfZ2f3LgrlIhLi6N1hd2NACPoxO9PxaA',
    boosts: 1842,
    comments: 96,
    skyTagged: false
  },
  {
    id: 'sighting-3',
    author: 'AuroraPulse_NO',
    authorTitle: 'ARCTIC GEOMAGNETIC RESEARCH EXPEDITION',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB4VF8oFajHyMDtf_2wJNRwCBMGdSH63ufi_Zr_k-HY_dNdg5VUOnhoHloja57C3EXJnhQkI-lFUjkAweF1jJz9nvKABmQ-PpR3-FYRVwtkjdRB2ivRHayZYG8Os4ipeN72wnaRhlq0SjWmPXjTh9nASbo-m0W0zrFbTcldbfF4fMZql0cnZQ9ITnFF5z2rYi33SadA1Mfj6ft4nVKfGTNOdqWvuqdeDrJcnn2tGWqUVSAMEA2noJaBQw',
    verified: true,
    category: 'GEOMAGNETIC STORM KP-7',
    categoryTag: 'METEOR SHOWERS',
    title: 'Double Aurora Corona over Tromsø Fjord',
    description: 'Massive coronal mass ejection slamming Earth\'s magnetosphere triggered this twin vortex directly at zenith. Shimmering atomic nitrogen violet fringing beneath emerald green oxygen bands.',
    coordinates: ['LAT: 69.6492° N, LON: 18.9553° E', 'SONY A7S III + 14mm f/1.8 GM', 'EXPOSURE: 1.2s @ ISO 3200'],
    integration: '1.2s EXPOSURE',
    band: 'VISIBLE OPTICAL + OXYGEN EMISSION',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDWJV6O-8GgVBbnuecAavAYP35mME8GaldmjpuNTEOjC5QiBhFn_Ukk3tjJu5qBbm06Pn8iC4uFdzfLJ-cB5LlEF2apuFXxFMu9zgWsT8YPZIbd2Xp4I1XhuIb7-UouZjCHmgOcUaqqWPXcAxE5mVR-GtSyysTUn1pHyU5gQVtBJXVSaUUL7fQpMefPq8OxwDXdVzKTPO-Bpc9cAiY2OOXvcPFTAT3sGyvK73hYzZ3tCNmd_y5e9lEdWg',
    boosts: 3120,
    comments: 245,
    skyTagged: false
  },
  {
    id: 'sighting-4',
    author: 'CassiniHeritage Group',
    authorTitle: 'ARCHIVAL RESTORATION LAB',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYiJpfiKT6NZ35I8tM5xo5K-yBsPR0Hw0XKnWIz5Qchy9a_ZXegTxCXSf-DrQtQRkUFQYh2k8ABucIcQKVpj5eiKh3uO1-KAkEfzndpzOuYJ3bllHUKN-FgN5cRWPIN0qAwlwqzI5M3yMuk4ooZn6sgoCq87Y5o5Affu4tCU86J8ExlJvXVoImCUEQ_S2PYDCqiCmP2VwkOnqisvRsZRpV7WVNy8dF9FyHbAB8GLpIvea21ACh9t2KRA',
    verified: true,
    category: 'PLANETARY OBSERVATION',
    categoryTag: 'PLANETARY HI-RES',
    title: 'Saturn Ring Plane Crossing & Enceladus Plume',
    description: 'Edge-on illumination reveals Cassini Division knife-thin shadow cast across Saturn\'s northern temperate cloud bands. Water vapor cryovolcanic cryo-plume from moon Enceladus clearly discernible in backlight.',
    coordinates: ['RA 22h 14m 02s', 'DEC -12° 08′ 44″', 'DISTANCE: 9.42 AU (1.41 BILLION KM)'],
    integration: 'DEEP STACK ARCHIVE',
    band: 'CLEAR + METHANE BANDPASS',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATH7HNuInq1igLjSntamfx_7gl6ogi3-Z-Amvugy0gN6sP3FfojzWnC7kPq1XwF74L3QnU1HIgN3KZLi7EdV2ClB96wFgPNgupwdo_4vwalzKt2188nojO4ioimhl5AYl9fvkuYDDBZ5w7IM2_ffzPsJk3EgiJoDEalGyANhAa9T5eJcmAYRsBSExIbuGaqr2CH8CbYF23hsWS5YOAhvWx0xOrMjER_VYLCtbye5wRRMgfTX1NJt7VrQ',
    boosts: 1510,
    comments: 82,
    skyTagged: false
  }
];
