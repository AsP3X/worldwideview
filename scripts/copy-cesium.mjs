import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const cesiumSource = path.join(root, 'node_modules/cesium/Build/Cesium');
const targetBase = path.join(root, 'public/cesium');

const folders = ['Workers', 'ThirdParty', 'Assets', 'Widgets'];

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });

    // eslint-disable-next-line prefer-const
    for (let entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// eslint-disable-next-line no-console
console.log('Copying Cesium assets...');
folders.forEach(folder => {
    const src = path.join(cesiumSource, folder);
    const dest = path.join(targetBase, folder);
    if (fs.existsSync(src)) {
        copyDir(src, dest);
        // eslint-disable-next-line no-console
        console.log(`Copied ${folder}`);
    } else {
        // eslint-disable-next-line no-console
        console.warn(`Source folder not found: ${src}`);
    }
});
// eslint-disable-next-line no-console
console.log('Cesium assets copied successfully.');
