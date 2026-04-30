import Image from "next/image";
import { Card } from "@/components/ui/card";

type Tool = {
  name: string;
  desc: string;
  percent: string;
  icon: string;
  iconInvertOnDark?: boolean;
};

const tools: Tool[] = [
  {
    name: "Figma",
    desc: "design tool",
    percent: "75%",
    icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/figma-icon.svg",
  },
  {
    name: "React",
    desc: "javascript library",
    percent: "95%",
    icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/react-icon.svg",
  },
  {
    name: "Next.js",
    desc: "full stack framework",
    percent: "90%",
    icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/nextjs-icon.svg",
    iconInvertOnDark: true,
  },
  {
    name: "Tailwind CSS",
    desc: "css framework",
    percent: "90%",
    icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/tailwind-icon.svg",
  },
  {
    name: "TypeScript",
    desc: "programming language",
    percent: "85%",
    icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/typescript-icon.svg",
  },
  {
    name: "GitHub",
    desc: "version control",
    percent: "95%",
    icon: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/github-icon.svg",
    iconInvertOnDark: true,
  },
];

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Card className="bg-hatch rounded-2xl p-2 border-0 shadow-none">
      <div className="flex items-center justify-between gap-10">
        <div className="flex items-center gap-4">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-transparent p-2">
            <Image
              alt=""
              src={tool.icon}
              width={32}
              height={32}
              className={`h-8 w-8 object-contain ${tool.iconInvertOnDark ? "dark:invert" : ""}`}
            />
          </div>

          <div>
            <h3 className="text-xl font-semibold tracking-tight">
              {tool.name}
            </h3>
            <p className="text-sm uppercase text-foreground/50">{tool.desc}</p>
          </div>
        </div>

        <div className="pr-5 font-semibold uppercase">{tool.percent}</div>
      </div>
    </Card>
  );
}

export function ToolsStackSection() {
  return (
    <section className="py-16 sm:py-18 lg:py-18 w-full">
      <div className="mx-auto max-w-6xl px-4 space-y-10">
        <h2 className="mb-6 pb-6 text-4xl font-medium tracking-tight text-pretty text-foreground md:text-5xl lg:text-6xl">
          Вакансии по направлениям
        </h2>

        <ul className="relative grid w-full gap-3 lg:grid-cols-2">
          {tools.map((t) => (
            <li key={t.name}>
              <ToolCard tool={t} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
