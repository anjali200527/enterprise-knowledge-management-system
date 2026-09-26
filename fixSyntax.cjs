const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist')) { 
      results = results.concat(walk(file));
    } else { 
      results.push(file);
    }
  });
  return results;
}

const cssFiles = walk('src/pages/Home').filter(f => f.endsWith('.css'));
cssFiles.push('src/pages/Home/Home.css');

cssFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let css = fs.readFileSync(file, 'utf8');
    let original = css;

    // Fix the syntax error from literal background$1
    css = css.replace(/background\$1:/g, 'background:');
    css = css.replace(/backgroundundefined:/g, 'background:');

    if (css !== original) {
      fs.writeFileSync(file, css);
      console.log('Fixed syntax in:', file);
    }
  }
});
