const fs = require('fs');
let css = fs.readFileSync('src/pages/Home/Home.css', 'utf8');

css = css.replace(/background(-color)?:\s*(#000|#000000|#111|#111111|#0A0A0A|#171717|#1a1a1a|black);/gi, 'background$1: #F3F7FA;');
css = css.replace(/color:\s*(#fff|#ffffff|white|#f8f9fa|#e2e8f0);/gi, 'color: #24313A;');
css = css.replace(/color:\s*(#aaa|#cccccc|#ccc|#94a3b8);/gi, 'color: #64747D;');

fs.writeFileSync('src/pages/Home/Home.css', css);
console.log('Fixed Home.css');
