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

cssFiles.forEach(file => {
  let css = fs.readFileSync(file, 'utf8');
  let original = css;

  // Replace dark backgrounds globally for Home
  // Be careful with exact hex replacements
  css = css.replace(/background(-color)?:\s*(#000|#000000|#111|#111111|#0A0A0A|#171717|#1a1a1a|black);/gi, 'background$1: #FFFFFF;');
  
  // Replace dark color text that is meant to be white on dark
  // Actually, wait, if we change bg to light, we MUST change text from white to dark!
  // So replacing color: #fff or color: white or color: #FFFFFF with color: #24313A
  css = css.replace(/color:\s*(#fff|#ffffff|white);/gi, 'color: #24313A;');
  css = css.replace(/color:\s*(#aaa|#cccccc|#ccc);/gi, 'color: #64747D;');

  // Let's explicitly target specific sections as requested:
  // HERO: #F3F7FA
  if (file.includes('Hero.css')) {
    css = css.replace(/background(-color)?:\s*[^;]+;/g, match => {
      if(match.includes('linear-gradient') || match.includes('#F3F7FA') || match.includes('transparent')) return match;
      if (match.includes('button')) return match; // rudimentary check
      return 'background$1: #F3F7FA;';
    });
    // Remove dark gradients
    css = css.replace(/linear-gradient\([^)]*(rgba\(0,\s*0,\s*0|#000|#111|#0A0A0A)[^)]*\)/gi, 'none');
  }

  // FEATURES: #FFFFFF bg, #FFFFFF cards, #DCE6EA border
  if (file.includes('Features.css')) {
    css = css.replace(/\.features-section\s*\{[^}]*background[^;]+;?/g, match => match.replace(/background[^;]+;?/, 'background: #FFFFFF;'));
  }

  // HOW IT WORKS: #EAF3F6
  if (file.includes('HowItWorks.css')) {
    css = css.replace(/\.how-it-works\s*\{[^}]*background[^;]+;?/g, match => match.replace(/background[^;]+;?/, 'background: #EAF3F6;'));
  }

  // PLATFORM PREVIEW: #FFFFFF, container #F7FAFB
  if (file.includes('PlatformPreview.css')) {
    css = css.replace(/\.platform-preview\s*\{[^}]*background[^;]+;?/g, match => match.replace(/background[^;]+;?/, 'background: #FFFFFF;'));
  }

  // KNOWLEDGE GRAPH VISUAL: #F3F7FA
  if (file.includes('KnowledgeGraphVisual.css')) {
    css = css.replace(/\.kg-visual-section\s*\{[^}]*background[^;]+;?/g, match => match.replace(/background[^;]+;?/, 'background: #F3F7FA;'));
  }

  // AI ASSISTANT: #FFFFFF
  if (file.includes('AIAssistantSection.css')) {
    css = css.replace(/\.ai-assistant-section\s*\{[^}]*background[^;]+;?/g, match => match.replace(/background[^;]+;?/, 'background: #FFFFFF;'));
  }

  // ENTERPRISE SECURITY: #EAF3F6
  if (file.includes('EnterpriseSecurity.css')) {
    css = css.replace(/\.security-section\s*\{[^}]*background[^;]+;?/g, match => match.replace(/background[^;]+;?/, 'background: #EAF3F6;'));
  }

  // CTA: #E3F0F4
  if (file.includes('CTASection.css')) {
    css = css.replace(/\.cta-section\s*\{[^}]*background[^;]+;?/g, match => match.replace(/background[^;]+;?/, 'background: #E3F0F4;'));
    // Make CTA text dark since bg is light
    css = css.replace(/\.cta-section\s*\{[^}]*color[^;]+;?/g, match => match.replace(/color[^;]+;?/, 'color: #24313A;'));
  }

  // FOOTER: #EAF3F6
  if (file.includes('HomeFooter.css')) {
    css = css.replace(/\.home-footer\s*\{[^}]*background[^;]+;?/g, match => match.replace(/background[^;]+;?/, 'background: #EAF3F6;'));
  }

  // Catch all black backgrounds again just in case
  css = css.replace(/background(-color)?:\s*(#000|#000000|#111|#111111|#0A0A0A|#171717|#1a1a1a|black);/gi, 'background$1: #FFFFFF;');
  // Also remove dark gradients globally in Home
  css = css.replace(/background:\s*linear-gradient\([^)]*(rgba\(0,\s*0,\s*0|#000|#111|#0A0A0A)[^)]*\);/gi, 'background: #F3F7FA;');

  // Remove opacity 0 or visibility hidden
  css = css.replace(/opacity:\s*0;/g, 'opacity: 1;');
  css = css.replace(/visibility:\s*hidden;/g, 'visibility: visible;');
  css = css.replace(/display:\s*none;/g, '/* display: none removed */');
  
  if (css !== original) {
    fs.writeFileSync(file, css);
    console.log('Fixed theme in:', file);
  }
});

console.log('Theme fix complete.');
