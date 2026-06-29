'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';

import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import type { Job } from '@/types/jobs';

const INITIAL_COUNT = 6;

export function PremiumSection({ jobs }: { jobs: Job[] }) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? jobs : jobs.slice(0, INITIAL_COUNT);
  const hiddenCount = jobs.length - visible.length;

  if (jobs.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="size-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-amber-600">
          Премиум вакансии
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {visible.map((job) => (
          <JobCard key={job.id} job={job} isPremium />
        ))}
      </div>

      {hiddenCount > 0 && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => setShowAll((prev) => !prev)}>
            {showAll ? 'Свернуть' : `Показать ещё ${hiddenCount} вакансий`}
          </Button>
        </div>
      )}
    </div>
  );
}
