/**
 * add-sitemap-link.js
 *
 * Adds a Site Map link to the footer of every .html file in the target directory.
 *
 * Usage:
 *   node add-sitemap-link.js /path/to/your/site
 *
 * What it does:
 *   Finds the footer's site-footer__left div and appends:
 *     <span class="footer-sep">|</span>
 *     <a href="sitemap.html">Site Map</a>
 *   ...after the Privacy Policy link, if not already present.
 *
 * Safe to run multiple times -- skips files that already have the link.
 */

const fs   = require('fs');
const path = require('path');

// ── config ────────────────────────────────────────────────────────────────────

const SITE_DIR = process.argv[2] || '.';

const SKIP_FILES = [
  'sitemap.html', // already has the link
];

const SITEMAP_SNIPPET = `<span class="footer-sep">|</span>\n          <a href="sitemap.html">Site Map</a>`;

// We look for the Privacy Policy anchor (with or without surrounding whitespace)
// and insert the sitemap snippet immediately after it.
const INSERTION_MARKER = /<a\s[^>]*id="open-privacy-policy"[^>]*>Privacy Policy<\/a>/i;

// ── helpers ───────────────────────────────────────────────────────────────────

function getHtmlFiles(dir) {
  return fs.readdirSync(dir).filter(f => {
    return f.endsWith('.html') && !SKIP_FILES.includes(f);
  });
}

function alreadyHasLink(content) {
  return content.includes('href="sitemap.html"') && content.includes('Site Map');
}

// ── main ──────────────────────────────────────────────────────────────────────

const results = {
  updated:  [],
  skipped:  [],
  failed:   [],
};

const files = getHtmlFiles(SITE_DIR);

if (files.length === 0) {
  console.log(`\nNo .html files found in: ${path.resolve(SITE_DIR)}`);
  console.log('Make sure you pass the correct path as the first argument.\n');
  process.exit(1);
}

console.log(`\nProcessing ${files.length} files in: ${path.resolve(SITE_DIR)}\n`);

for (const file of files) {
  const filePath = path.join(SITE_DIR, file);

  try {
    const original = fs.readFileSync(filePath, 'utf8');

    // Skip if already patched
    if (alreadyHasLink(original)) {
      results.skipped.push({ file, reason: 'already has sitemap link' });
      continue;
    }

    // Skip if footer marker not found
    if (!INSERTION_MARKER.test(original)) {
      results.skipped.push({ file, reason: 'Privacy Policy anchor not found -- footer may differ' });
      continue;
    }

    // Insert sitemap snippet after the Privacy Policy anchor
    const updated = original.replace(
      INSERTION_MARKER,
      (match) => `${match}\n          ${SITEMAP_SNIPPET}`
    );

    fs.writeFileSync(filePath, updated, 'utf8');
    results.updated.push(file);

  } catch (err) {
    results.failed.push({ file, reason: err.message });
  }
}

// ── report ────────────────────────────────────────────────────────────────────

console.log('═'.repeat(60));
console.log('RESULTS');
console.log('═'.repeat(60));

console.log(`\n✅ UPDATED (${results.updated.length})`);
if (results.updated.length === 0) {
  console.log('   (none)');
} else {
  results.updated.forEach(f => console.log(`   ${f}`));
}

console.log(`\n⏭  SKIPPED (${results.skipped.length})`);
if (results.skipped.length === 0) {
  console.log('   (none)');
} else {
  results.skipped.forEach(({ file, reason }) =>
    console.log(`   ${file}  —  ${reason}`)
  );
}

console.log(`\n❌ FAILED (${results.failed.length})`);
if (results.failed.length === 0) {
  console.log('   (none)');
} else {
  results.failed.forEach(({ file, reason }) =>
    console.log(`   ${file}  —  ${reason}`)
  );
}

console.log('\n' + '═'.repeat(60));
console.log(`Done. ${results.updated.length} updated, ${results.skipped.length} skipped, ${results.failed.length} failed.`);
console.log('═'.repeat(60) + '\n');