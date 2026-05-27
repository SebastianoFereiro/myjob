"use client";

import * as React from "react";
import Link from "next/link";

import { proffesions } from "@/app/data/dictionary";

type Chip = {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function ChipTab({
  chip,
  active,
  onSelect,
}: {
  chip: Chip;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <Link
      href={`/jobs?query=${chip.label}`}
      role="tab"
      aria-selected={active}
      onClick={() => onSelect(chip.id)}
      className={cx(
        "flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
        active
          ? "border-foreground/10 bg-foreground text-background shadow-sm"
          : "border-transparent bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground",
      )}
    >
      {chip.icon && (
        <span
          className={cx(
            "[&>svg]:size-4",
            active ? "text-background/90" : "text-current",
          )}
        >
          {chip.icon}
        </span>
      )}

      {chip.label}
    </Link>
  );
}

function Marquee({
  items,
  activeId,
  onSelect,
  reverse,
  duration = "80s",
}: {
  items: Chip[];
  activeId: string;
  onSelect: (id: string) => void;
  reverse?: boolean;
  duration?: string;
}) {
  const anim = `animate-[marquee_${duration}_linear_infinite]`;

  return (
    <div
      className={cx(
        "group flex overflow-hidden p-2 [--gap:1rem] [gap:var(--gap)] flex-row",
        "[mask-image:linear-gradient(to_right,transparent,black_16%,black_84%,transparent)]",
      )}
    >
      {/* copy A */}
      <div
        className={cx(
          "flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row",
          anim,
          reverse && "[animation-direction:reverse]",
          "group-hover:[animation-play-state:paused]",
          "group-focus-within:[animation-play-state:paused]",
          "motion-reduce:animate-none",
        )}
      >
        {items.map((chip) => (
          <ChipTab
            key={`a-${chip.id}`}
            chip={chip}
            active={chip.id === activeId}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* copy B */}
      <div
        className={cx(
          "flex shrink-0 justify-around [gap:var(--gap)] animate-marquee flex-row",
          anim,
          reverse && "[animation-direction:reverse]",
          "group-hover:[animation-play-state:paused]",
          "group-focus-within:[animation-play-state:paused]",
          "motion-reduce:animate-none",
        )}
        aria-hidden="true"
      >
        {items.map((chip) => (
          <ChipTab
            key={`b-${chip.id}`}
            chip={chip}
            active={chip.id === activeId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

export function Feature154() {
  const chips: Chip[] = proffesions
    .slice(0, 10)
    .map((profession) => ({
      id: profession.href,
      href: profession.href,
      label: profession.name,
    }));

  const chips2: Chip[] = proffesions
    .slice(10, 20)
    .map((profession) => ({
      id: profession.href,
      href: profession.href,
      label: profession.name,
    }));

  const chips3: Chip[] = proffesions
    .slice(20, 30)
    .map((profession) => ({
      id: profession.href,
      href: profession.href,
      label: profession.name,
    }));

  const [activeId, setActiveId] = React.useState(
    chips[0]?.id || "",
  );

  return (
    <section className="w-full py-16 xl:w-[1600px]">
      <div className="container">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-6 text-center">
          <h2 className="mb-6 text-4xl font-medium tracking-tight text-pretty text-foreground md:text-5xl lg:text-6xl">
            Профессии
          </h2>

          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            Выберите интересующее направление из списка
            профессий.
          </p>
        </div>

        <div
          className="relative mt-10"
          role="tablist"
          aria-label="Профессии"
        >
          <Marquee
            items={chips}
            activeId={activeId}
            onSelect={setActiveId}
            duration="150s"
          />

          <Marquee
            items={chips2}
            activeId={activeId}
            onSelect={setActiveId}
            reverse
            duration="150s"
          />

          <Marquee
            items={chips3}
            activeId={activeId}
            onSelect={setActiveId}
            reverse
            duration="150s"
          />
        </div>
      </div>
    </section>
  );
}