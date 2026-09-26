const fs = require('fs');

const files = [
  'src/pages/Profile/Profile.jsx',
  'src/pages/Settings/Settings.jsx',
  'src/pages/Help/Help.jsx',
  'src/pages/Contact/Contact.jsx',
  'src/pages/About/About.jsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // Use specific class replacement to standardize centering wrappers
    content = content.replace(/className="dashboard"/g, 'className="app-wrapper"');
    content = content.replace(/className="main"/g, 'className="page-container"');
    
    if (content !== original) {
      fs.writeFileSync(file, content);
      console.log('Fixed wrapper in JSX:', file);
    }
  }
});

const cssFiles = [
  'src/pages/Profile/Profile.css',
  'src/pages/Settings/Settings.css',
  'src/pages/Help/Help.css',
  'src/pages/Contact/Contact.css',
  'src/pages/About/About.css',
  'src/index.css'
];

cssFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let css = fs.readFileSync(file, 'utf8');
    let original = css;

    css = css.replace(/margin-left:\s*260px;?/g, '');
    css = css.replace(/margin-left:\s*240px;?/g, '');
    css = css.replace(/padding-left:\s*260px;?/g, '');
    css = css.replace(/padding-left:\s*240px;?/g, '');
    css = css.replace(/width:\s*calc\(100%\s*-\s*260px\);?/g, 'width: 100%;');
    css = css.replace(/width:\s*calc\(100%\s*-\s*240px\);?/g, 'width: 100%;');

    const wrapperRegex = /\.profile-page\s*\{|\.settings-page\s*\{|\.help-page\s*\{|\.contact-page\s*\{|\.about-page\s*\{/g;
    
    if (wrapperRegex.test(css)) {
      css = css.replace(/(\.(profile|settings|help|contact|about)-page\s*\{)/g, 
        '$1\n  width: 100%;\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 32px 40px;\n  box-sizing: border-box;\n'
      );
    }

    if (css !== original) {
      fs.writeFileSync(file, css);
      console.log('Fixed CSS in:', file);
    }
  }
});

console.log('Done.');
