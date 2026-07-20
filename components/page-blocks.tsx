import type { PageBlock } from '@/types/strapi-collections';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { markdownComponents } from '@/lib/markdown';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function HeroBlock({ block }: { block: Extract<PageBlock, { __component: 'page.hero' }> }) {
  return (
    <section className="w-full py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">{block.title}</h1>
        {block.subtitle ? (
          <p className="mt-6 text-lg text-muted-foreground md:text-xl">{block.subtitle}</p>
        ) : null}
      </div>
    </section>
  );
}

function RichTextBlock({
  block,
}: {
  block: Extract<PageBlock, { __component: 'page.rich-text' }>;
}) {
  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-4xl px-4">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
          {block.content}
        </ReactMarkdown>
      </div>
    </section>
  );
}

function FaqBlock({ block }: { block: Extract<PageBlock, { __component: 'page.faq' }> }) {
  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-3xl px-4">
        {block.title ? (
          <h2 className="mb-8 text-3xl font-bold tracking-tight">{block.title}</h2>
        ) : null}
        <div className="space-y-4">
          {(block.items ?? []).map((item, i) => (
            <details key={i} className="group rounded-lg border p-4">
              <summary className="cursor-pointer text-lg font-medium">{item.question}</summary>
              <p className="mt-2 text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactInfoBlock({
  block,
}: {
  block: Extract<PageBlock, { __component: 'page.contact-info' }>;
}) {
  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-3xl px-4">
        <Card>
          <CardContent className="space-y-4 p-6">
            {block.email ? (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Email:</span>
                <p className="text-lg">{block.email}</p>
              </div>
            ) : null}
            {block.phone ? (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Телефон:</span>
                <p className="text-lg">{block.phone}</p>
              </div>
            ) : null}
            {block.address ? (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Адрес:</span>
                <p className="text-lg">{block.address}</p>
              </div>
            ) : null}
            {block.work_hours ? (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Часы работы:</span>
                <p className="text-lg">{block.work_hours}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function PricingTableBlock({
  block,
}: {
  block: Extract<PageBlock, { __component: 'page.pricing-table' }>;
}) {
  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-6xl px-4">
        {block.title ? (
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">{block.title}</h2>
        ) : null}
        <div className="grid gap-6 md:grid-cols-3">
          {(block.items ?? []).map((item, i) => (
            <Card
              key={i}
              className={`relative flex flex-col ${item.highlighted ? 'border-primary shadow-lg' : ''}`}
            >
              <CardContent className="flex flex-1 flex-col gap-4 p-6">
                {item.highlighted ? (
                  <span className="absolute top-0 right-0 rounded-bl-lg bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Популярный
                  </span>
                ) : null}
                <h3 className="text-xl font-bold">{item.name}</h3>
                <div>
                  <span className="text-3xl font-bold">{item.price}</span>
                  <span className="ml-1 text-sm text-muted-foreground">/{item.period}</span>
                </div>
                <ul className="flex-1 space-y-2">
                  {item.features.map((f, j) => (
                    <li key={j} className="text-sm text-muted-foreground">
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  asChild
                  variant={item.highlighted ? 'default' : 'outline'}
                  className="w-full"
                >
                  <Link href={item.button_url}>{item.button_text}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function TeamBlock({ block }: { block: Extract<PageBlock, { __component: 'page.team' }> }) {
  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-6xl px-4">
        {block.title ? (
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">{block.title}</h2>
        ) : null}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(block.members ?? []).map((member, i) => (
            <Card key={i}>
              <CardContent className="p-6 text-center">
                {member.photo_url ? (
                  <div className="mx-auto mb-4 size-24 overflow-hidden rounded-full bg-muted" />
                ) : (
                  <div className="mx-auto mb-4 flex size-24 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground">
                    {member.name.charAt(0)}
                  </div>
                )}
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
                {member.bio ? (
                  <p className="mt-2 text-sm text-muted-foreground">{member.bio}</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBlock({ block }: { block: Extract<PageBlock, { __component: 'page.cta' }> }) {
  return (
    <section className="w-full py-16">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight">{block.title}</h2>
        {block.description ? (
          <p className="mt-4 text-lg text-muted-foreground">{block.description}</p>
        ) : null}
        <Button asChild size="lg" className="mt-8">
          <Link href={block.button_url}>{block.button_text}</Link>
        </Button>
      </div>
    </section>
  );
}

const blockRenderers: Record<
  PageBlock['__component'],
  (props: { block: PageBlock }) => React.ReactNode
> = {
  'page.hero': (props) => <HeroBlock block={props.block as any} />,
  'page.rich-text': (props) => <RichTextBlock block={props.block as any} />,
  'page.faq': (props) => <FaqBlock block={props.block as any} />,
  'page.contact-info': (props) => <ContactInfoBlock block={props.block as any} />,
  'page.pricing-table': (props) => <PricingTableBlock block={props.block as any} />,
  'page.team': (props) => <TeamBlock block={props.block as any} />,
  'page.cta': (props) => <CtaBlock block={props.block as any} />,
};

export function PageBlocks({ blocks }: { blocks: PageBlock[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        const renderer = blockRenderers[block.__component];
        if (!renderer) return null;
        return <div key={`${block.__component}-${block.id}-${index}`}>{renderer({ block })}</div>;
      })}
    </>
  );
}
