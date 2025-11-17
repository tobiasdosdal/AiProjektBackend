// Markdown Parser Modul

function parseMarkdown(text) {
    let html = text;
    
    // Blokcitater
    html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>');
    
    // Kodeblokke
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Overskrifter
    [6, 5, 4, 3, 2, 1].forEach(level => {
        const hashes = '#'.repeat(level);
        html = html.replace(new RegExp(`^${hashes} (.*$)`, 'gim'), `<h${level}>$1</h${level}>`);
    });
    
    // Vandrette linjer
    html = html.replace(/^(---|\*\*\*)$/gim, '<hr>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Fed tekst
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    
    // Kursiv tekst
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // Inline kode
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Lister
    const lines = html.split('\n');
    let inUnorderedList = false;
    let inOrderedList = false;
    let result = [];
    
    lines.forEach(line => {
        const trimmed = line.trim();
        const isUnordered = /^[-*] (.+)$/.test(trimmed);
        const isOrdered = /^\d+\. (.+)$/.test(trimmed);
        
        if (isUnordered || isOrdered) {
            if (!inUnorderedList && isUnordered) {
                result.push('<ul>');
                inUnorderedList = true;
            }
            if (!inOrderedList && isOrdered) {
                result.push('<ol>');
                inOrderedList = true;
            }
            if (inUnorderedList && isOrdered) {
                result.push('</ul><ol>');
                inUnorderedList = false;
                inOrderedList = true;
            }
            if (inOrderedList && isUnordered) {
                result.push('</ol><ul>');
                inOrderedList = false;
                inUnorderedList = true;
            }
            
            const content = trimmed.replace(/^[-*]\s|^\d+\.\s/, '');
            result.push(`<li>${content}</li>`);
        } else {
            if (inUnorderedList) {
                result.push('</ul>');
                inUnorderedList = false;
            }
            if (inOrderedList) {
                result.push('</ol>');
                inOrderedList = false;
            }
            result.push(trimmed === '' ? '<br>' : line);
        }
    });
    
    if (inUnorderedList) result.push('</ul>');
    if (inOrderedList) result.push('</ol>');
    
    html = result.join('\n');
    
    // Håndter afsnit og linjeskift
    const isBlockElement = (text) => /^(<h[1-6]|<ul|<ol|<pre|<blockquote|<hr)/.test(text.trim());
    
    html = html.split('\n\n').map(paragraph => {
        const trimmed = paragraph.trim();
        if (isBlockElement(trimmed) || trimmed === '<br>') return paragraph;
        return `<p>${paragraph.replace(/\n/g, '<br>')}</p>`;
    }).join('\n');
    
    return html;
}

export { parseMarkdown };
