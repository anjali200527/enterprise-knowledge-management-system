const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      results.push(file);
    }
  });
  return results;
}

const files = walk('d:/knowledge management system/src/pages');

files.forEach(file => {
  if (file.endsWith('.jsx')) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/import\s+Sidebar\s+from\s+['"].*?Sidebar.*?['"];?\n?/g, '');
    content = content.replace(/<Sidebar\s*(\/\s*>|[^>]*\/\s*>)/g, '');
    content = content.replace(/const\s+\[sidebarOpen,\s*setSidebarOpen\]\s*=\s*useState\(true\);\n?/g, '');
    // Replace menu buttons
    content = content.replace(/<button[^>]*onClick=\{[^}]*setSidebarOpen[^}]*\}[^>]*>[\s\S]*?<\/button>/g, '');
    
    fs.writeFileSync(file, content);
  } else if (file.endsWith('.css')) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/margin-left:\s*2[56]0px;?\n?/g, '');
    content = content.replace(/padding-left:\s*2[56]0px;?\n?/g, '');
    
    content = content.replace(/@media\s*\(\s*max-width:\s*1024px\s*\)\s*\{\s*\.[a-zA-Z0-9_-]+\s*\{\s*margin-left:\s*0;\s*\}\s*\}/g, '');
    fs.writeFileSync(file, content);
  }
});
console.log('Done!');
