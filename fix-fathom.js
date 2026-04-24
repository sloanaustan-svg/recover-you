const fs = require('fs');
const path = require('path');

function getHtmlFiles(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(getHtmlFiles(full));
    } else if (file.endsWith('.html')) {
      results.push(full);
    }
  });
  return results;
}

const files = getHtmlFiles(__dirname);
let count = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('data-site="RLTMTAUT"') && !content.includes('data-included-domains')) {
    content = content.replace(
      'data-site="RLTMTAUT" defer',
      'data-site="RLTMTAUT" data-included-domains="recover-you.ca,www.recover-you.ca" defer'
    );
    fs.writeFileSync(file, content);
    console.log('Updated: ' + file);
    count++;
  }
});

console.log('\nDone. ' + count + ' files updated.');