import {
  BriefcaseBusiness,
  Calculator,
  Code2,
  HeartPulse,
  Megaphone,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

type Direction = {
  name: string;
  desc: string;
  count: string;
  icon: LucideIcon;
};

const directions: Direction[] = [
  {
    name: "Логистика",
    desc: "склад, транспорт, закупки",
    count: "38",
    icon: Truck,
  },
  {
    name: "Продажи",
    desc: "клиенты, retail, b2b",
    count: "44",
    icon: BriefcaseBusiness,
  },
  {
    name: "IT",
    desc: "разработка, аналитика, поддержка",
    count: "27",
    icon: Code2,
  },
  {
    name: "Финансы",
    desc: "бухгалтерия, аудит, экономика",
    count: "31",
    icon: Calculator,
  },
  {
    name: "Медицина",
    desc: "клиники, уход, специалисты",
    count: "22",
    icon: HeartPulse,
  },
  {
    name: "Маркетинг",
    desc: "реклама, PR, контент",
    count: "18",
    icon: Megaphone,
  },
];

function DirectionCard({ direction }: { direction: Direction }) {
  const Icon = direction.icon;

  return (
    <Card className="bg-hatch rounded-2xl p-2 border-0 shadow-none">
     <div className="flex items-center justify-between gap-2 md:gap-10">
        <div className="flex items-center gap-4">
          <div className="flex  items-center justify-center rounded-2xl bg-background/70 p-2">
            <Icon className="size-8 text-foreground" aria-hidden="true" />
          </div>

          <div>
            <h3 className="text-xl font-semibold tracking-tight">
              {direction.name}
            </h3>
            <p className="text-xs md:text-sm uppercase text-foreground/50">
              {direction.desc}
            </p>
          </div>
        </div>

        <div className="pr-2 md:pr-5 text-right font-semibold uppercase">
          <span className="block text-2xl leading-none">{direction.count}</span>
          <span className="text-xs text-foreground/50">вакансий</span>
        </div>
      </div>
    </Card>
  );
}

export function ToolsStackSection() {
  return (
    <section id="vacancies" className="py-16 sm:py-18 lg:py-18 w-full">
      <div className="mx-auto max-w-6xl px-4 space-y-10">
        <h2 className="mb-6 pb-6 text-4xl font-medium tracking-tight text-pretty text-foreground md:text-5xl lg:text-6xl">
          Вакансии по направлениям
        </h2>

        <ul className="relative grid w-full gap-3 lg:grid-cols-2">
          {directions.map((direction) => (
            <li key={direction.name}>
              <DirectionCard direction={direction} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
