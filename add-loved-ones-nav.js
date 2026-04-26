#!/usr/bin/env node

/**
 * add-loved-ones-nav.js
 *
 * Inserts the "For Loved Ones" nav entry into every HTML file in the target
 * directory. Handles the two nav formats found across the site:
 *
 *   Format A — li with class="active" wrapping the anchor:
 *     <li class="active"><a href="for-coaches.html">For Frontline Workers</a></li>
 *
 *   Format B — plain li (no class):
 *     <li><a href="for-coaches.html">For Frontline Workers</a></li>
 *
 * The new entry is inserted immediately after whichever format is found.
 *
 * Usage:
 *   node add-loved-ones-nav.js                  (defaults to current directory)
 *   node add-loved-ones-nav.js /path/to/site
 */

const fs   = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────

const TARGET_DIR = process.argv[2] || process.cwd();

const NEW_ENTRY = '<li><a href="for-loved-ones.html">For Loved Ones</a></li>';

// Patterns to search for — order matters, more specific first
const PATTERNS = [
  {
    // Format A: li.active wrapping the coaches anchor
    label: 'Format A (li.active)',
    regex: /(<li\s+class="active"><a\s+href="for-coaches\.html"[^>]*>For Frontline Workers<\/a><\/li>)/gi,
  },
  {
    // Format B: plain li wrapping the coaches anchor
    label: 'Format B (plain li)',
    regex: /(<li><a\s+href="for-coaches\.html"[^>]*>For Frontline Workers<\/a><\/li>)/gi,
  },
];

// Already-inserted sentinel — if this string exists anywhere in the file we skip it
const SENTINEL = 'for-loved-ones.html';

// ── Helpers ───────────────────────────────────────────────────────────────────

const RESET  = '\x1b[0m';
const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const DIM    = '\x1b[2m';
const BOLD   = '\x1b[1m';

function log(symbol, colour, label, file, note = '') {
  const rel  = path.relative(TARGET_DIR, file);
  const tail = note ? ` ${DIM}${note}${RESET}` : '';
  console.log(`  ${colour}${symbol}${RESET}  ${colour}${BOLD}${label}${RESET}  ${rel}${tail}`);
}

function getHtmlFiles(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules, hidden dirs, asset dirs
      if (['node_modules', 'css', 'js', 'images', 'assets', 'fonts'].includes(entry.name)) continue;
      if (entry.name.startsWith('.')) continue;
      results = results.concat(getHtmlFiles(full));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

// ── Main ──────────────────────────────────────────────────────────────────────

const files = getHtmlFiles(TARGET_DIR);

let countSuccess = 0;
let countSkipped = 0;
let countNoMatch = 0;
let countError   = 0;

console.log('');
console.log(`${BOLD}  Recover-You — Add "For Loved Ones" Nav Entry${RESET}`);
console.log(`  ${DIM}Target: ${TARGET_DIR}${RESET}`);
console.log(`  ${DIM}Files found: ${files.length}${RESET}`);
console.log('');

for (const file of files) {
  try {
    const original = fs.readFileSync(file, 'utf8');

    // Skip if already inserted
    if (original.includes(SENTINEL)) {
      log('–', YELLOW, 'SKIPPED ', file, 'already contains for-loved-ones.html');
      countSkipped++;
      continue;
    }

    let updated  = original;
    let matched  = false;
    let matchLabel = '';

    for (const { regex, label } of PATTERNS) {
      // Reset lastIndex since we're reusing the regex object
      regex.lastIndex = 0;

      if (regex.test(original)) {
        regex.lastIndex = 0; // reset again before replace
        updated    = original.replace(regex, `$1\n            ${NEW_ENTRY}`);
        matched    = true;
        matchLabel = label;
        break;
      }
    }

    if (!matched) {
      log('?', DIM, 'NO MATCH', file, 'for-coaches.html anchor not found in nav');
      countNoMatch++;
      continue;
    }

    // Only write if something actually changed
    if (updated === original) {
      log('–', YELLOW, 'SKIPPED ', file, 'replace produced no change');
      countSkipped++;
      continue;
    }

    fs.writeFileSync(file, updated, 'utf8');
    log('✓', GREEN, 'UPDATED ', file, matchLabel);
    countSuccess++;

  } catch (err) {
    log('✗', RED, 'ERROR   ', file, err.message);
    countError++;
  }
}

// ── Summary ───────────────────────────────────────────────────────────────────

console.log('');
console.log(`  ${DIM}${'─'.repeat(52)}${RESET}`);
console.log(`  ${GREEN}${BOLD}Updated ${RESET}  ${countSuccess} file(s)`);
console.log(`  ${YELLOW}${BOLD}Skipped ${RESET}  ${countSkipped} file(s)  ${DIM}(already done)${RESET}`);
if (countNoMatch > 0) {
  console.log(`  ${DIM}No match  ${countNoMatch} file(s)  (no coaches anchor found)${RESET}`);
}
if (countError > 0) {
  console.log(`  ${RED}${BOLD}Errors  ${RESET}  ${countError} file(s)`);
}
console.log('');