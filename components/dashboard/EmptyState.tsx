import { FilePlus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border bg-background p-6 sm:p-12 text-center">
      <div className="mb-4 text-muted-foreground">
        {icon || <FilePlus className="size-12" />}
      </div>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-muted-foreground">{description}</p>
      <Button className="mt-6" asChild>
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}