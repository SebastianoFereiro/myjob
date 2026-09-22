import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/dashboard/EmptyState';
import type {
  ProductAuditEvent,
  ProductAuditEventType,
  ProductHistoryVacancyGroup,
  ProductType,
} from '@/types/product-audit';

const PRODUCT_LABELS: Record<ProductType, string> = {
  premium: 'Премиум',
  auto_boost: 'Автоподнятие',
};

const PRODUCT_ORDER: ProductType[] = ['premium', 'auto_boost'];

const EVENT_LABELS: Record<ProductAuditEventType, string> = {
  activated: 'Назначен',
  deactivated: 'Снят досрочно',
  expired: 'Истёк',
};

const EVENT_VARIANTS: Record<ProductAuditEventType, 'default' | 'secondary' | 'outline'> = {
  activated: 'default',
  deactivated: 'secondary',
  expired: 'outline',
};

/** Все даты хранятся в UTC, отображаются в часовом поясе Беларуси. */
const DATE_TIME_FORMAT = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Europe/Minsk',
});

function formatDateTime(value: string | null): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return DATE_TIME_FORMAT.format(date);
}

/** Период действия продукта в виде «с 12.09.2026 15:00 по 12.10.2026 15:00». */
function formatPeriod(event: ProductAuditEvent): string {
  const from = formatDateTime(event.periodStart);
  const to = formatDateTime(event.periodEnd);
  if (from === '—' && to === '—') return 'период не указан';
  return `с ${from} по ${to}`;
}

function ProductLog({ product, events }: { product: ProductType; events: ProductAuditEvent[] }) {
  const latest = events[0];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-medium">{PRODUCT_LABELS[product]}</h3>
        {latest ? (
          <span className="text-[13px] text-muted-foreground">{formatPeriod(latest)}</span>
        ) : (
          <span className="text-[13px] text-muted-foreground">Нет событий</span>
        )}
      </div>

      {events.length > 0 && (
        <ul className="space-y-1.5 border-l pl-3">
          {events.map((event) => (
            <li key={event.id} className="flex flex-wrap items-center gap-2 text-[13px]">
              <Badge variant={EVENT_VARIANTS[event.eventType]} className="rounded-full px-2 py-0 text-[11px]">
                {EVENT_LABELS[event.eventType]}
              </Badge>
              <span className="text-muted-foreground">{formatDateTime(event.createdAt)}</span>
              <span className="text-muted-foreground">{formatPeriod(event)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface ProductHistoryListProps {
  items: ProductHistoryVacancyGroup[];
  hasSearch: boolean;
}

export function ProductHistoryList({ items, hasSearch }: ProductHistoryListProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title={hasSearch ? 'Ничего не найдено' : 'История продуктов пуста'}
        description={
          hasSearch
            ? 'По вашему запросу нет вакансий с историей продуктов. Измените поисковый запрос.'
            : 'История появится после назначения Премиума или Автоподнятия для вакансий компании.'
        }
        actionLabel={hasSearch ? 'Создать вакансию' : 'Мои вакансии'}
        actionHref={hasSearch ? '/company/cvs/new' : '/company/dashboard'}
      />
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <Card key={item.vacancyId}>
          <CardHeader className="gap-1">
            <CardTitle className="text-base">
              {item.vacancySlug ? (
                <Link
                  href={`/jobs/${item.vacancySlug}-${item.vacancyId}`}
                  className="hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.vacancyTitle || 'Без названия'}
                </Link>
              ) : (
                item.vacancyTitle || 'Без названия'
              )}
            </CardTitle>
            <p className="text-[13px] text-muted-foreground">
              Последнее событие: {formatDateTime(item.lastEventAt)}
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            {PRODUCT_ORDER.map((product) => (
              <ProductLog key={product} product={product} events={item.products[product]} />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
