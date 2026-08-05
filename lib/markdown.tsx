import { cloneElement, isValidElement, type ReactNode } from 'react';
import type { Components } from 'react-markdown';

// Убирает вставленные из Word/буфера маркеры списка (▪ • · ○ ● › » и т.п.)
// из первого текстового узла <li>, чтобы не дублировались с CSS-буллетом list-disc.
const LEADING_BULLET = /^\s*[▪•·◦○●›»]\s*/;

function stripLeadingBullet(node: ReactNode): ReactNode {
  if (typeof node === 'string') {
    return node.replace(LEADING_BULLET, '');
  }
  if (Array.isArray(node)) {
    if (node.length === 0) return node;
    return [stripLeadingBullet(node[0]), ...node.slice(1)];
  }
  if (isValidElement<{ children?: ReactNode }>(node)) {
    const { children, ...rest } = node.props as { children?: ReactNode };
    if (children !== undefined) {
      return cloneElement(node, { ...rest, children: stripLeadingBullet(children) });
    }
  }
  return node;
}

export const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-10 text-2xl font-semibold tracking-tight md:text-3xl">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-8 text-xl font-semibold tracking-tight md:text-2xl">{children}</h2>
  ),
  h3: ({ children }) => <h3 className="mb-2 mt-6 text-lg font-semibold md:text-xl">{children}</h3>,
  p: ({ children }) => (
    <p className="mb-2 leading-6 text-muted-foreground md:text-md">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-5 list-disc space-y-0 pl-6 text-muted-foreground md:text-md">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-5 list-decimal space-y-2 pl-6 text-muted-foreground md:text-md">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-snug">{stripLeadingBullet(children)}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-4 border-primary/30 pl-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="text-primary underline underline-offset-2 hover:text-primary/80"
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-6 border-muted" />,
  pre: ({ children }) => (
    <pre className="my-6 max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-xl bg-muted/50 p-4 text-sm leading-6">
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    // Блочный код (внутри <pre>) не стилизуем как инлайн-бейдж,
    // чтобы избежать вложенного фона
    const isBlock = /language-/.test(className || "");
    return (
      <code
        className={
          isBlock
            ? undefined
            : "rounded bg-muted/60 px-1.5 py-0.5 text-sm break-words"
        }
      >
        {children}
      </code>
    );
  },
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt || ""} className="my-6 h-auto max-w-full rounded-xl" />
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm md:text-base">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border bg-muted/50 px-4 py-2 text-left font-medium">{children}</th>
  ),
  td: ({ children }) => <td className="border px-4 py-2 text-muted-foreground">{children}</td>,
};
