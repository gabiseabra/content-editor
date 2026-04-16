import { RichTextItem } from ".";

export function Span(item: RichTextItem) {
  if (!item.url) {
    return (
      <a href={item.url} className={Span.className(item)}>
        {item.text}
      </a>
    );
  } else {
    return <span className={Span.className(item)}>{item.text}</span>;
  }
}

Span.className = (item: Omit<RichTextItem, "text">) =>
  [
    item.bold && "bold",
    item.italic && "italic",
    item.underline && "underline",
    item.strikethrough && "strikethrough",
    item.color && `color-${item.color}`,
    item.bgColor && `bgColor-${item.bgColor}`,
  ]
    .filter(Boolean)
    .join(" ");
