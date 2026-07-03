const fs = require('fs');
const path = require('path');
const https = require('https');

const PHOTOS_DIR = path.join(__dirname, '..', 'public', 'photos');

const projects = [
  {
    category: 'editorial',
    slug: 'project-01-tokyo-noir',
    meta: {
      title: 'Tokyo Noir',
      year: '2025',
      location: 'Tokyo, Japan',
      category: 'Editorial'
    },
    images: [
      { name: 'cover.jpg', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80' },
      { name: '01.jpg', url: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=1200&q=80' },
      { name: '02.jpg', url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    category: 'editorial',
    slug: 'project-02-monochrome-silence',
    meta: {
      title: 'Monochrome Silence',
      year: '2026',
      location: 'Svalbard, Norway',
      category: 'Editorial'
    },
    images: [
      { name: 'cover.jpg', url: 'https://images.unsplash.com/photo-1517022812141-23620dba5c23?auto=format&fit=crop&w=1200&q=80' },
      { name: '01.jpg', url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80' },
      { name: '02.jpg', url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    category: 'film',
    slug: 'project-03-neon-dream',
    meta: {
      title: 'Neon Dream',
      year: '2025',
      location: 'Los Angeles, USA',
      category: 'Film'
    },
    images: [
      { name: 'cover.jpg', url: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80' },
      { name: '01.jpg', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80' },
      { name: '02.jpg', url: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    category: 'film',
    slug: 'project-04-desert-mirage',
    meta: {
      title: 'Desert Mirage',
      year: '2024',
      location: 'Atacama, Chile',
      category: 'Film'
    },
    images: [
      { name: 'cover.jpg', url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80' },
      { name: '01.jpg', url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80' },
      { name: '02.jpg', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1200&q=80' }
    ]
  },
  {
    category: 'personal',
    slug: 'project-05-street-fragments',
    meta: {
      title: 'Street Fragments',
      year: '2026',
      location: 'Paris, France',
      category: 'Personal'
    },
    images: [
      { name: 'cover.jpg', url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80' },
      { name: '01.jpg', url: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80' },
      { name: '02.jpg', url: 'https://images.unsplash.com/photo-1522083165195-342750297f46?auto=format&fit=crop&w=1200&q=80' }
    ]
  }
];

function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: HTTP ${response.statusCode}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

// Generates a simple colored SVG fallback if download fails
function generateFallbackSVG(dest, title, index) {
  const colors = ['#1a1c1e', '#1c2d37', '#251f1c', '#271f28', '#1a271d'];
  const color = colors[index % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <rect width="100%" height="100%" fill="${color}"/>
    <circle cx="600" cy="400" r="300" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="2"/>
    <circle cx="600" cy="400" r="150" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui, sans-serif" font-size="48" font-weight="bold" fill="rgba(255,255,255,0.85)">${title}</text>
    <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="20" fill="rgba(255,255,255,0.4)" letter-spacing="4">CINEMATIC FRAME ${index}</text>
  </svg>`;
  fs.writeFileSync(dest, svg);
  console.log(`Generated fallback SVG at: ${dest}`);
}

async function run() {
  console.log('Starting mock content generation...');
  
  if (!fs.existsSync(PHOTOS_DIR)) {
    fs.mkdirSync(PHOTOS_DIR, { recursive: true });
  }

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const projectPath = path.join(PHOTOS_DIR, p.category, p.slug);
    
    if (!fs.existsSync(projectPath)) {
      fs.mkdirSync(projectPath, { recursive: true });
    }

    // Write meta.json
    fs.writeFileSync(
      path.join(projectPath, 'meta.json'),
      JSON.stringify(p.meta, null, 2)
    );
    console.log(`Wrote meta.json for ${p.slug}`);

    // Download/Generate images
    for (let imgIdx = 0; imgIdx < p.images.length; imgIdx++) {
      const img = p.images[imgIdx];
      const imgDest = path.join(projectPath, img.name);
      
      console.log(`Fetching image ${img.name} for ${p.slug}...`);
      try {
        await downloadImage(img.url, imgDest);
        console.log(`Successfully downloaded ${img.name}`);
      } catch (err) {
        console.warn(`Download failed for ${img.name}. Creating fallback SVG...`, err.message);
        generateFallbackSVG(imgDest, p.meta.title, imgIdx);
      }
    }
  }

  console.log('Mock content generation complete.');
}

run().catch(console.error);
