const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir(path.join(__dirname, 'src', 'components'), (filePath) => {
    if (!filePath.endsWith('.jsx')) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace structural classes
    content = content.replace(/glass-panel/g, 'surface-card');
    content = content.replace(/glass-card/g, 'interactive-card');
    
    // Replace dark mode backgrounds
    content = content.replace(/bg-dark-900/g, 'bg-background');
    content = content.replace(/bg-dark-800/g, 'bg-surface');
    content = content.replace(/bg-dark-700/g, 'bg-gray-50');
    
    // Replace translucent borders
    content = content.replace(/border-white\/10/g, 'border-gray-200');
    content = content.replace(/border-white\/5/g, 'border-gray-100');
    content = content.replace(/border-white\/20/g, 'border-gray-300');
    
    // Replace translucent backgrounds
    content = content.replace(/bg-white\/5/g, 'bg-gray-50');
    content = content.replace(/bg-white\/10/g, 'bg-gray-100');
    
    // Replace common text colors (heuristic: if it's not inside a button or primary block)
    // Actually, it's safer to just replace text-white with text-gray-900 and text-gray-400 with text-gray-600 everywhere EXCEPT where bg-primary is used.
    // Instead of doing it everywhere, let's just do text-white -> text-gray-900, and we'll fix buttons if they break.
    content = content.replace(/text-white/g, 'text-gray-900');
    content = content.replace(/text-gray-300/g, 'text-gray-600');
    content = content.replace(/text-gray-400/g, 'text-gray-500');
    
    // Clean up neon glowing shadows
    content = content.replace(/shadow-\[0_0_[a-zA-Z0-9_\-.,()]+\]/g, 'shadow-sm');
    content = content.replace(/shadow-\[0_4px_[a-zA-Z0-9_\-.,()]+\]/g, 'shadow-sm');
    
    // Replace custom buttons with standard ones
    // bg-primary/90 text-white -> btn-primary
    content = content.replace(/bg-primary\/90 hover:bg-primary text-gray-900.*?rounded-xl/g, 'btn-primary');
    
    fs.writeFileSync(filePath, content);
});

// Also run on components/auth if it exists (wait, auth pages are in pages/auth)
console.log("Replacements complete.");
