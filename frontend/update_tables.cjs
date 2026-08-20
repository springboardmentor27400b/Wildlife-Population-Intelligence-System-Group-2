const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const processDirectory = (dir) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      // Update table wrapper
      content = content.replace(/<div className=(["'])([^"']*overflow-x-auto[^"']*)\1>/g, (match, quote, classes) => {
        if (!classes.includes('rounded-xl')) {
          return `<div className=${quote}${classes} rounded-xl border border-border/50 shadow-sm${quote}>`;
        }
        return match;
      });

      // Update thead
      content = content.replace(/<thead className=(["'])([^"']*)\1>/g, (match, quote, classes) => {
        if (!classes.includes('sticky')) {
          return `<thead className=${quote}${classes} sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-10${quote}>`;
        }
        return match;
      });
      // If thead has no className
      content = content.replace(/<thead>/g, '<thead className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-10">');

      // Update tbody tr
      content = content.replace(/<tr([^>]*)className=(["'])([^"']*)\2/g, (match, before, quote, classes) => {
        if (classes.includes('hover:bg-') && !classes.includes('even:bg-muted/20')) {
           return `<tr${before}className=${quote}${classes} even:bg-muted/20${quote}`;
        }
        return match;
      });

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated table in ${file}`);
      }
    }
  }
};

processDirectory(pagesDir);
console.log('Table styling script complete.');
