import type { Components } from 'react-markdown';

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
  li: ({ children }) => <li className="leading-snug">{children}</li>,
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
