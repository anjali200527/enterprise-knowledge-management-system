const fs = require('fs');

const cssFiles = [
  'src/pages/Dashboard/Dashboard.css',
  'src/pages/Employees/Employees.css',
  'src/pages/Projects/Projects.css',
  'src/pages/Documents/Documents.css',
  'src/pages/Relationships/Relationships.css',
  'src/pages/KnowledgeGraph/KnowledgeGraph.css',
  'src/pages/AIAssistant/AIAssistant.css',
  'src/pages/Reports/Reports.css',
  'src/pages/ChatHistory/ChatHistory.css',
  'src/pages/Profile/Profile.css',
  'src/pages/Settings/Settings.css',
  'src/pages/About/About.css',
  'src/pages/Help/Help.css',
  'src/pages/Support/Support.css',
  'src/pages/Contact/Contact.css'
];

cssFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let css = fs.readFileSync(file, 'utf8');
    let original = css;

    const isDataHeavy = file.match(/(Dashboard|Employees|Projects|Documents|Relationships|KnowledgeGraph|Reports)\.css$/);
    const maxW = isDataHeavy ? '1400px' : '1200px';

    const wrapperRegex = /\.([a-zA-Z0-9_-]*(page-wrapper|page-container|main-area|content|dashboard-main|dashboard-container|dashboard-content|employees-main|documents-main|projects-main|relationships-main|kg-main|reports-content|main))\s*\{([^}]*)\}/gi;
    
    css = css.replace(wrapperRegex, (match, className, suffix, inner) => {
      if (className.includes('header') || className.includes('button')) return match;
      
      let newInner = inner;
      newInner = newInner.replace(/max-width:\s*[^;]+;?/g, '');
      newInner = newInner.replace(/width:\s*[^;]+;?/g, '');
      newInner = newInner.replace(/margin:\s*0\s+auto;?/g, '');
      
      newInner += `\n  width: 100%;\n  max-width: ${maxW};\n  margin: 0 auto;\n`;
      return '.' + className + ' {' + newInner + '}';
    });

    if (css !== original) {
      fs.writeFileSync(file, css);
      console.log('Standardized width in:', file);
    }
  }
});
