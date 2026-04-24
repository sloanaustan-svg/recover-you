const fs = require('fs');
const path = require('path');

const DIR = './';
const ALREADY_HAS = 'for-coaches.html';
const INSERT = '\n              <li><a href="for-coaches.html">For Frontline Workers</a></li>';

// Matches both compact and multi-line FAQ link formats
const FAQ_PATTERN = /(<li>\s*<a href="faq\.html">FAQ<\/a>\s*<\/li>)/i;

const files = fs.readdirSync(DIR).filter(f => f.endsWith('.html'));

let updated = 0;
let skipped = 0;

files.forEach(file => {
  const filePath = path.join(DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');

  if (content.includes(ALREADY_HAS)) {
    console.log(`⏭  Skipped  — ${file} (already has link)`);
    skipped++;
    return;
  }

  if (!FAQ_PATTERN.test(content)) {
    console.log(`⚠  No match — ${file} (FAQ link not found)`);
    return;
  }

  const updated_content = content.replace(FAQ_PATTERN, `$1${INSERT}`);
  fs.writeFileSync(filePath, updated_content, 'utf8');
  console.log(`✅ Updated  — ${file}`);
  updated++;
});

console.log(`\nDone. ${updated} updated, ${skipped} skipped.`);