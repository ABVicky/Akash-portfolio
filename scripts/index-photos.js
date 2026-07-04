const fs = require('fs');
const path = require('path');

const PHOTOS_DIR = path.join(__dirname, '..', 'public', 'photos');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'portfolio-manifest.json');

function run() {
  console.log('Indexing portfolio photos...');

  if (!fs.existsSync(PHOTOS_DIR)) {
    console.warn(`Photos directory ${PHOTOS_DIR} does not exist. Please run mock generation first.`);
    return;
  }

  const manifest = [];
  const categories = fs.readdirSync(PHOTOS_DIR).filter(item => {
    return fs.statSync(path.join(PHOTOS_DIR, item)).isDirectory();
  });

  categories.forEach(category => {
    const categoryPath = path.join(PHOTOS_DIR, category);
    
    // Check if there are subdirectories (projects)
    const subdirs = fs.readdirSync(categoryPath).filter(item => {
      return fs.statSync(path.join(categoryPath, item)).isDirectory();
    });

    if (subdirs.length > 0) {
      subdirs.forEach(projectSlug => {
        const projectPath = path.join(categoryPath, projectSlug);
        const files = fs.readdirSync(projectPath);

        // Parse meta.json
        let meta = {
          title: projectSlug.split('-').slice(2).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || projectSlug,
          year: new Date().getFullYear().toString(),
          location: 'Unknown',
          category: category.charAt(0).toUpperCase() + category.slice(1)
        };

        const metaPath = path.join(projectPath, 'meta.json');
        if (fs.existsSync(metaPath)) {
          try {
            const parsed = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            meta = { ...meta, ...parsed };
          } catch (e) {
            console.error(`Error parsing meta.json in ${projectSlug}:`, e.message);
          }
        }

        // Find all image files
        const images = files.filter(f => {
          const ext = path.extname(f).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext);
        });

        // Filter and separate cover from details
        const cover = images.find(img => img.startsWith('cover.')) || images[0] || '';
        const details = images
          .filter(img => img !== cover && !img.startsWith('.'))
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        manifest.push({
          id: `${category}-${projectSlug}`,
          slug: projectSlug,
          category: category.toLowerCase(),
          title: meta.title,
          year: meta.year,
          location: meta.location,
          categoryLabel: meta.category,
          coverPath: `/photos/${category}/${projectSlug}/${cover}`,
          imagePaths: details.map(img => `/photos/${category}/${projectSlug}/${img}`)
        });
      });
    } else {
      // No subdirectories; check for direct images in this category
      const files = fs.readdirSync(categoryPath);
      const images = files.filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(ext);
      });

      if (images.length > 0) {
        // Parse meta.json if it exists directly in the category folder
        let meta = {
          title: category.charAt(0).toUpperCase() + category.slice(1) + ' Collection',
          year: new Date().getFullYear().toString(),
          location: 'Los Angeles, CA',
          category: category.charAt(0).toUpperCase() + category.slice(1)
        };

        const metaPath = path.join(categoryPath, 'meta.json');
        if (fs.existsSync(metaPath)) {
          try {
            const parsed = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
            meta = { ...meta, ...parsed };
          } catch (e) {
            console.error(`Error parsing meta.json in ${category}:`, e.message);
          }
        }

        const cover = images.find(img => img.startsWith('cover.')) || images[0] || '';
        const details = images
          .filter(img => img !== cover && !img.startsWith('.'))
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        manifest.push({
          id: `${category}-collection`,
          slug: `${category.toLowerCase()}-collection`,
          category: category.toLowerCase(),
          title: meta.title,
          year: meta.year,
          location: meta.location,
          categoryLabel: meta.category,
          coverPath: `/photos/${category}/${cover}`,
          imagePaths: details.map(img => `/photos/${category}/${img}`)
        });
      }
    }
  });

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`Success! Portfolio manifest written to ${OUTPUT_FILE} with ${manifest.length} projects.`);
}

run();
