/**
 * Продакшен-сборка для PM2 с несколькими инстансами.
 *
 * `DEPLOYMENT_ID` и `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` обязаны быть заданы на
 * этапе `next build`:
 * - первое вшивается в сборку и включает skew protection;
 * - второе — общий ключ шифрования Server Actions, одинаковый для всех инстансов
 *   одного релиза (иначе «Failed to find Server Action» на чужом инстансе).
 *
 * Порядок определения значений:
 * 1. Переменные окружения DEPLOYMENT_ID / GIT_SHA / NEXT_SERVER_ACTIONS_ENCRYPTION_KEY.
 * 2. `git rev-parse --short HEAD` для DEPLOYMENT_ID.
 * 3. Файл `.env.production.local` для ключа шифрования (создаётся при первом
 *    запуске, чтобы ключ не менялся между сборками и не ломал rolling-деплой).
 */
import { execSync, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ENV_LOCAL_PATH = resolve(process.cwd(), ".env.production.local");
const KEY_NAME = "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY";
const KEY_LINE = new RegExp(`^${KEY_NAME}=(.*)$`, "m");

function sanitize(value: string | undefined): string {
  return (value ?? "").trim().replace(/[^a-zA-Z0-9_-]/g, "");
}

function resolveDeploymentId(): string {
  const fromEnv = sanitize(process.env.DEPLOYMENT_ID) || sanitize(process.env.GIT_SHA);
  if (fromEnv) return fromEnv;

  try {
    return sanitize(
      execSync("git rev-parse --short HEAD", {
        stdio: ["ignore", "pipe", "ignore"],
      }).toString(),
    );
  } catch {
    return "";
  }
}

function readKeyFromEnvFile(): string {
  if (!existsSync(ENV_LOCAL_PATH)) return "";
  const match = readFileSync(ENV_LOCAL_PATH, "utf8").match(KEY_LINE);
  return match?.[1]?.trim() ?? "";
}

function ensureEncryptionKey(): string {
  const fromEnv = process.env[KEY_NAME]?.trim();
  if (fromEnv) return fromEnv;

  const stored = readKeyFromEnvFile();
  if (stored) return stored;

  const generated = randomBytes(32).toString("base64");
  const existing = existsSync(ENV_LOCAL_PATH) ? readFileSync(ENV_LOCAL_PATH, "utf8") : "";
  const prefix = existing ? `${existing.replace(/\s*$/, "")}\n` : "";
  writeFileSync(ENV_LOCAL_PATH, `${prefix}${KEY_NAME}=${generated}\n`, "utf8");
  console.log(`Сгенерирован ${KEY_NAME} и сохранён в .env.production.local`);
  return generated;
}

const deploymentId = resolveDeploymentId();
if (!deploymentId) {
  console.error("Не удалось определить DEPLOYMENT_ID. Задайте DEPLOYMENT_ID или GIT_SHA.");
  process.exit(1);
}

const encryptionKey = ensureEncryptionKey();
console.log(`Сборка Next.js: DEPLOYMENT_ID=${deploymentId}`);

const result = spawnSync(
  process.execPath,
  [resolve("node_modules/next/dist/bin/next"), "build"],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      DEPLOYMENT_ID: deploymentId,
      [KEY_NAME]: encryptionKey,
    },
  },
);

process.exit(result.status ?? 1);
