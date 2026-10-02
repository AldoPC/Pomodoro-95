const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const buildDir = path.join(root, 'build');

if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

const copies = [
  ['icon/macOS/windows-95-icon-17-removebg-preview.icns', 'build/icon.icns'],
  ['icon/linux/windows-95-icon.png', 'build/icon.png'],
];

let ok = true;
for (const [src, dest] of copies) {
  const srcPath = path.join(root, src);
  const destPath = path.join(root, dest);
  if (!fs.existsSync(srcPath)) {
    console.error(`Missing source icon: ${src}`);
    ok = false;
    continue;
  }
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied ${src} -> ${dest}`);
}

// Windows icon: pick the largest .ico as best quality
const winDir = path.join(root, 'icon/windows');
try {
  const icos = fs.readdirSync(winDir).filter(f => f.endsWith('.ico'));
  if (icos.length > 0) {
    let best = icos[0];
    let bestSize = 0;
    for (const f of icos) {
      const s = fs.statSync(path.join(winDir, f)).size;
      if (s > bestSize) { bestSize = s; best = f; }
    }
    fs.copyFileSync(path.join(winDir, best), path.join(root, 'build/icon.ico'));
    console.log(`Copied icon/windows/${best} -> build/icon.ico`);
  }
} catch (e) {
  console.warn('No Windows icon copied:', e.message);
}

if (!ok) process.exit(1);
