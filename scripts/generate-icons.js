const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Create a simple SVG icon
const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="128" fill="url(#gradient)"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="120" font-weight="bold" text-anchor="middle" fill="white">✨</text>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ec4899;stop-opacity:1" />
    </linearGradient>
  </defs>
</svg>
`;

// Write the SVG file
fs.writeFileSync(path.join(iconsDir, 'icon.svg'), svgIcon);

console.log('📁 Icons directory: public/icons/');
console.log('📋 Next steps:');
console.log('   1. Replace the placeholder SVG with your actual app icon');
console.log('   2. Generate PNG versions in sizes: 192x192, 512x512');
console.log('   3. Update manifest.json with correct icon paths');
