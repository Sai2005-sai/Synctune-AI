const fs = require('fs');
let c = fs.readFileSync('src/data/musicLibrary.ts', 'utf8');
// Replace: asset: require('../../assets/music/SUBFOLDER/FILE.mp3') -> asset: '/music/SUBFOLDER/FILE.mp3'
c = c.replace(/asset: require\(['"]\.\.\/\.\.\/assets\/music\/([^'"]+)['"]\)/g, "asset: '/music/$1'");
// Also fix type annotation: ReturnType<typeof require> -> string
c = c.replace(/\*\* React Native asset reference — result of require\(\) \*\//g, '/** Web public path to the audio file */');
c = c.replace(/asset: ReturnType<typeof require>;/g, 'asset: string;');
fs.writeFileSync('src/data/musicLibrary.ts', c);
console.log('Done. Sample line:', c.split('\n').find(l => l.includes('asset:')));
