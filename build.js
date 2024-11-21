import fs from 'fs/promises';
import path from 'path';

import esbuild from 'esbuild';

// This allows you to create a .env.local file with a path set to where
// your local devtools extension is set up.
const DIST_DIR = './dist';
const PUBLIC_DIR = './public';

// Copy public folder
console.log('Copying public folder...');
await fs.cp(PUBLIC_DIR, DIST_DIR, { force: true, recursive: true });

// Build scripts
console.log('Building scripts...');
const watch = process.argv.includes('--watch');
const buildOptions = {
    entryPoints: ['src/content.ts', 'src/devtools_panel.ts', 'src/devtools.ts'],
    bundle: true,
    outdir: path.join(DIST_DIR, 'scripts'),
    minify: false,
    logLevel: 'info',
    plugins: []
};
if (watch) {
    console.warn('Scripts will be built in watch mode, changes to the UI or public folder will not be watched!');
    const ctx = await esbuild.context(buildOptions);
    await ctx.watch();
} else {
    await esbuild.build(buildOptions);
}
