"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { translateAuthError } from "@/lib/auth-errors";

type Props = {
  token: string;
  callbackURL?: string;
  email?: string;
};

type State = "verifying" | "success" | "error";

export function VerifyEmailClient({ token, callbackURL = "/", email }: Props) {
  const [state, setState] = useState<State>("verifying");
  const [message, setMessage] = useState("");
  const [resendEmail, setResendEmail] = useState(email ?? "");
  const [resendState, setResendState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [resendError, setResendError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        const { error } = await authClient.verifyEmail({
          query: { token, callbackURL },
        });
        if (cancelled) return;

        if (error) {
          setState("error");
          setMessage(translateAuthError(error));
        } else {
          setState("success");
        }
      } catch {
        if (!cancelled) {
          setState("error");
          setMessage("Не удалось подтвердить email. Попробуйте ещё раз.");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [token, callbackURL]);

  const resend = useCallback(async () => {
    setResendState("sending");
    setResendError("");

    try {
      const { error } = await authClient.sendVerificationEmail({
        email: resendEmail.trim(),
        callbackURL,
      });

      if (error) {
        setResendState("error");
        setResendError(error.message || "Не удалось отправить письмо");
      } else {
        setResendState("sent");
      }
    } catch {
      setResendState("error");
      setResendError("Не удалось отправить письмо. Попробуйте позже.");
    }
  }, [resendEmail, callbackURL]);

  if (state === "verifying") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <Loader2 className="size-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Подтверждаем email...</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <CheckCircle2 className="size-12 text-emerald-500" />
        <h2 className="text-lg font-semibold">Email подтверждён</h2>
        <p className="text-sm text-muted-foreground">
          Ваш аккаунт активирован. Теперь вы можете войти.
        </p>
        <Link href={callbackURL} className="mt-2">
          <Button>Перейти в аккаунт</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 py-8 text-center">
      <XCircle className="size-12 text-destructive" />
      <h2 className="text-lg font-semibold">Не удалось подтвердить email</h2>
      <p className="text-sm text-muted-foreground">{message}</p>

      <div className="mt-2 w-full space-y-3 text-left">
        <div className="space-y-2">
          <Label htmlFor="resend-email">Email</Label>
          <Input
            id="resend-email"
            type="email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            placeholder="email@example.com"
            disabled={resendState === "sending"}
          />
        </div>

        {resendError && <p className="text-sm text-destructive">{resendError}</p>}

        {resendState === "sent" ? (
          <p className="text-sm text-emerald-600">Письмо отправлено. Проверьте почту.</p>
        ) : (
          <Button onClick={resend} disabled={resendState === "sending"} className="w-full">
            {resendState === "sending" ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Отправка...
              </>
            ) : (
              "Отправить письмо повторно"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
