'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'cookie_consent';
const EXPIRY_MS = 6 * 30 * 24 * 60 * 60 * 1000; // ~6 months

interface CookieConsentState {
  accepted: boolean;
  timestamp: number;
}

function getConsent(): CookieConsentState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: CookieConsentState = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > EXPIRY_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function setConsent() {
  const data: CookieConsentState = { accepted: true, timestamp: Date.now() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const existing = getConsent();
    if (!existing) setVisible(true);
  }, []);

  const handleAccept = useCallback(() => {
    setConsent();
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-xl border bg-card p-4 text-sm text-card-foreground shadow-lg ring-1 ring-foreground/10 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5">
        <p className="text-pretty leading-relaxed">
          Мы используем cookies для улучшения работы сайта. Продолжая использование, вы соглашаетесь{' '}
          <a href="/terms" className="underline underline-offset-2 hover:text-primary">
            с правилами и политикой обработки данных
          </a>
          .
        </p>
        <Button onClick={handleAccept} size="sm" className="shrink-0">
          Принять
        </Button>
      </div>
    </div>
  );
}
