const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const cacheDir = path.join(
    'node_modules',
    '.cache',
    'gh-pages',
    'https!github.com!iamvenish!E-commereceProduct-Client.git'
);

const content = fs.readFileSync(path.join('public', '404.html'), 'utf8');
fs.writeFileSync(path.join(cacheDir, '404.html'), content);

execSync(`cd ${cacheDir} && git add 404.html && git commit -m "fix: correct 404.html" && git push`, {
    stdio: 'inherit',
    shell: '/bin/bash'
});

console.log('✅ 404.html fixed and pushed!');