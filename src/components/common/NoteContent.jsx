// Renders lesson notes written in simple Markdown:
//   # / ## / ### headings, - or * bullet lists, 1. numbered lists, ``` fenced code blocks,
//   **bold**, `inline code`, [links](https://...), and ![images](https://...).
// Everything is rendered as React elements, never as raw HTML, so note content cannot inject
// markup or scripts. Links and images must use https.
function safeUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

const INLINE = /(\*\*([^*]+)\*\*)|(`([^`]+)`)|(!\[([^\]]*)\]\(([^)\s]+)\))|(\[([^\]]+)\]\(([^)\s]+)\))/g;

function renderInline(text, keyPrefix) {
  const parts = [];
  let last = 0;
  let index = 0;
  for (const match of String(text).matchAll(INLINE)) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const key = `${keyPrefix}-${index += 1}`;
    if (match[1]) parts.push(<strong key={key}>{match[2]}</strong>);
    else if (match[3]) parts.push(<code key={key} className="inline-code">{match[4]}</code>);
    else if (match[5]) {
      const src = safeUrl(match[7]);
      parts.push(src ? <img key={key} src={src} alt={match[6]} loading="lazy" className="note-image" /> : match[0]);
    } else if (match[8]) {
      const href = safeUrl(match[10]);
      parts.push(href ? <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="text-link">{match[9]}</a> : match[9]);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function parseBlocks(source) {
  const lines = String(source || "").replace(/\r\n?/g, "\n").split("\n");
  const blocks = [];
  let paragraph = [];
  let list = null;
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "p", text: paragraph.join(" ") });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fence = line.match(/^```\s*([\w-]*)\s*$/);
    if (fence) {
      flushParagraph();
      flushList();
      const code = [];
      index += 1;
      while (index < lines.length && !/^```\s*$/.test(lines[index])) {
        code.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "code", text: code.join("\n") });
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({ type: `h${heading[1].length + 1}`, text: heading[2] });
      continue;
    }
    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (bullet || numbered) {
      flushParagraph();
      const type = bullet ? "ul" : "ol";
      if (!list || list.type !== type) {
        flushList();
        list = { type, items: [] };
      }
      list.items.push((bullet || numbered)[1]);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    flushList();
    paragraph.push(line.trim());
  }
  flushParagraph();
  flushList();
  return blocks;
}

export default function NoteContent({ body }) {
  return parseBlocks(body).map((block, index) => {
    const key = `b${index}`;
    if (block.type === "code") {
      return (
        <pre className="lesson-code" key={key}>
          <code>{block.text}</code>
        </pre>
      );
    }
    if (block.type === "ul" || block.type === "ol") {
      const List = block.type;
      return (
        <List key={key}>
          {block.items.map((item, itemIndex) => <li key={itemIndex}>{renderInline(item, `${key}-${itemIndex}`)}</li>)}
        </List>
      );
    }
    const Tag = block.type;
    return <Tag key={key}>{renderInline(block.text, key)}</Tag>;
  });
}
