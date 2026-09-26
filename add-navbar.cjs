const fs = require('fs');

const pages = [
  'KnowledgeGraph/KnowledgeGraph',
  'Employees/Employees',
  'Projects/Projects',
  'Documents/Documents',
  'Relationships/Relationships',
  'ChatHistory/ChatHistory',
  'Reports/Reports',
  'Profile/Profile',
  'About/About',
  'Help/Help',
  'Support/Support',
  'Contact/Contact'
];

pages.forEach(page => {
  const file = 'src/pages/' + page + '.jsx';
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  
  // check if already has Navbar
  if (!content.includes('import Navbar')) {
    // Add import
    content = content.replace(/import\s+['"].*\.css['"];?\n?/, match => match + 'import Navbar from "../../components/Navbar/Navbar";\n');
    
    // Attempt to inject <Navbar /> after first <div className=... > or <main ...>
    content = content.replace(/return\s*\(\s*(<div[^>]*>)/, match => match + '\n      <Navbar />');
    
    fs.writeFileSync(file, content);
    console.log('Added Navbar to ' + file);
  }
});
