import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function getHtmlFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...getHtmlFiles(full));
    else if (entry.name.endsWith('.html')) files.push(full);
  }
  return files;
}

const patterns = [
  /<li>\s*\n\s*<a href="the-reckoning\.html">The Reckoning: What the Research Shows<\/a>\s*\n\s*<\/li>/g,
  /<li><a href="the-reckoning\.html">The Reckoning: What the Research Shows<\/a><\/li>/g,
];

const replacement = `<li>
                    <a href="trauma-addiction-evidence.html">When Trauma and Addiction Overlap</a>
                  </li>`;

let totalFiles = 0;

for (const file of getHtmlFiles('.')) {
  let content = readFileSync(file, 'utf8');
  let modified = content;
  for (const pattern of patterns) {
    modified = modified.replace(pattern, replacement);
  }
  if (modified !== content) {
    writeFileSync(file, modified, 'utf8');
    console.log(`Updated: ${file}`);
    totalFiles++;
  }
}

console.log(`\nDone. ${totalFiles} file(s) updated.`);