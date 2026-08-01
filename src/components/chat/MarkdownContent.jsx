function escapeHtml(input = '') {
    return String(input)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatInline(text = '') {
    return escapeHtml(text)
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" class="text-primary-600 dark:text-primary-400 underline underline-offset-2">$1</a>')
        .replace(/`([^`]+)`/g, '<code class="rounded bg-gray-100 px-1.5 py-0.5 text-[0.85em] font-mono text-gray-900 dark:bg-gray-700 dark:text-gray-100">$1</code>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function renderBlock(block) {
    const lines = block.split('\n').filter(Boolean);
    if (lines.length === 0) return null;

    const isUnorderedList = lines.every((line) => /^[-*]\s+/.test(line));
    const isOrderedList = lines.every((line) => /^\d+\.\s+/.test(line));
    const isQuote = lines.every((line) => /^>\s?/.test(line));
    const isHeading = /^#{1,3}\s+/.test(lines[0]);

    if (isHeading) {
        const level = Math.min(3, lines[0].match(/^#+/)[0].length);
        const content = formatInline(lines.join(' ').replace(/^#{1,3}\s+/, ''));
        return { type: `h${level}`, html: content };
    }

    if (isQuote) {
        return {
            type: 'blockquote',
            html: formatInline(lines.map((line) => line.replace(/^>\s?/, '')).join('<br />')),
        };
    }

    if (isUnorderedList) {
        return {
            type: 'ul',
            items: lines.map((line) => formatInline(line.replace(/^[-*]\s+/, ''))),
        };
    }

    if (isOrderedList) {
        return {
            type: 'ol',
            items: lines.map((line) => formatInline(line.replace(/^\d+\.\s+/, ''))),
        };
    }

    return { type: 'p', html: formatInline(lines.join(' ')) };
}

export default function MarkdownContent({ content = '' }) {
    const blocks = String(content)
        .replace(/\r\n/g, '\n')
        .split(/\n\n+/)
        .map((block) => block.trim())
        .filter(Boolean)
        .map(renderBlock)
        .filter(Boolean);

    return (
        <div className="space-y-3 leading-relaxed">
            {blocks.map((block, index) => {
                if (block.type === 'p') {
                    return (
                        <p
                            key={index}
                            className="whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{ __html: block.html }}
                        />
                    );
                }

                if (block.type === 'blockquote') {
                    return (
                        <blockquote
                            key={index}
                            className="border-l-4 border-primary-200 pl-3 text-gray-700 dark:border-primary-700 dark:text-gray-300"
                            dangerouslySetInnerHTML={{ __html: block.html }}
                        />
                    );
                }

                if (block.type === 'ul') {
                    return (
                        <ul key={index} className="list-disc space-y-1 pl-5">
                            {block.items.map((item, itemIndex) => (
                                <li key={itemIndex} dangerouslySetInnerHTML={{ __html: item }} />
                            ))}
                        </ul>
                    );
                }

                if (block.type === 'ol') {
                    return (
                        <ol key={index} className="list-decimal space-y-1 pl-5">
                            {block.items.map((item, itemIndex) => (
                                <li key={itemIndex} dangerouslySetInnerHTML={{ __html: item }} />
                            ))}
                        </ol>
                    );
                }

                const HeadingTag = block.type;
                return (
                    <HeadingTag
                        key={index}
                        className="font-semibold text-gray-900 dark:text-white"
                        dangerouslySetInnerHTML={{ __html: block.html }}
                    />
                );
            })}
        </div>
    );
}