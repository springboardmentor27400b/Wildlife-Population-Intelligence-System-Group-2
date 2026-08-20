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

      // Update select classes
      content = content.replace(/<select\s+([^>]*?)className=(["'])(.*?)\2/g, (match, before, quote, classNames) => {
        // Remove old classes we want to replace
        let updatedClasses = classNames
          .replace(/\b(rounded-[a-z0-9]+)\b/g, '')
          .replace(/\b(h-\d+)\b/g, '')
          .replace(/\bp[xy]-\d+(?:\.\d+)?\b/g, '')
          .replace(/\b(border-[a-z0-9/-]+)\b/g, '')
          .replace(/\b(focus:[a-z0-9/-]+)\b/g, '')
          .replace(/\b(transition-[a-z0-9/-]+)\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        // Add new standard classes
        updatedClasses += ' h-11 rounded-xl px-4 py-2.5 border-border/60 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-300';
        return `<select ${before}className=${quote}${updatedClasses.trim()}${quote}`;
      });

      // Also update regular text inputs if they are inline (not using Input component)
      content = content.replace(/<input\s+([^>]*?)className=(["'])(.*?)\2/g, (match, before, quote, classNames) => {
        if (!classNames.includes('h-') && !classNames.includes('rounded-')) return match; // skip if doesn't look like a styled input
        let updatedClasses = classNames
          .replace(/\b(rounded-[a-z0-9]+)\b/g, '')
          .replace(/\b(h-\d+)\b/g, '')
          .replace(/\bp[xy]-\d+(?:\.\d+)?\b/g, '')
          .replace(/\b(border-[a-z0-9/-]+)\b/g, '')
          .replace(/\b(focus:[a-z0-9/-]+)\b/g, '')
          .replace(/\b(transition-[a-z0-9/-]+)\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        updatedClasses += ' h-11 rounded-xl px-4 py-2.5 border-border/60 focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground/70 transition-all duration-300';
        return `<input ${before}className=${quote}${updatedClasses.trim()}${quote}`;
      });

      // Update standard Card components inside pages if they missed Dashboard update
      // Actually we did Dashboard. But for other pages, replace `<Card className="..."` with standard.
      content = content.replace(/<Card\s+([^>]*?)className=(["'])(.*?)\2/g, (match, before, quote, classNames) => {
        let updatedClasses = classNames
          .replace(/\b(rounded-[a-z0-9]+)\b/g, '')
          .replace(/\b(shadow-[a-z0-9]+)\b/g, '')
          .replace(/\b(hover:shadow-[a-z0-9]+)\b/g, '')
          .replace(/\b(transition-[a-z0-9/-]+)\b/g, '')
          .replace(/\b(hover:-translate-y-\d+(?:\.\d+)?)\b/g, '')
          .replace(/\s+/g, ' ')
          .trim();
        
        updatedClasses += ' shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl';
        return `<Card ${before}className=${quote}${updatedClasses.trim()}${quote}`;
      });

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  }
};

processDirectory(pagesDir);
console.log('UI Enhancement phase 2 & 3 script complete.');
