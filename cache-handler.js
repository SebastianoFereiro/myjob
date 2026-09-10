/**
 * Общий обработчик серверного кэша Next.js (ISR, route handlers, data cache).
 *
 * Зачем: при нескольких инстансах PM2 штатный кэш живёт в памяти каждого
 * процесса, поэтому revalidateTag на одном инстансе не виден остальным.
 * Здесь записи кэша и метки ревалидации хранятся в Postgres, общем для всех
 * инстансов: get() сверяет метку тега и промахивается, если тег ревалидирован
 * после записи.
 *
 * Подключается через cacheHandler в next.config.ts. Чтобы вернуться к штатному
 * поведению — уберите cacheHandler и cacheMaxMemorySize из конфига.
 */
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
});

let schemaReady = null;

function ensureSchema() {
  if (!schemaReady) {
    schemaReady = pool
      .query(
        `CREATE TABLE IF NOT EXISTS next_cache_entries (
           key text PRIMARY KEY,
           value jsonb NOT NULL,
           tags text[] NOT NULL DEFAULT '{}',
           last_modified bigint NOT NULL
         )`,
      )
      .then(() =>
        pool.query(
          `CREATE TABLE IF NOT EXISTS next_cache_tags (
             tag text PRIMARY KEY,
             revalidated_at bigint NOT NULL
           )`,
        ),
      )
      .catch((err) => {
        schemaReady = null;
        throw err;
      });
  }
  return schemaReady;
}

function toArray(tags) {
  if (!tags) return [];
  return Array.isArray(tags) ? tags : [tags];
}

module.exports = class CacheHandler {
  constructor(options) {
    this.options = options;
  }

  async get(key) {
    try {
      await ensureSchema();
      const { rows } = await pool.query(
        "SELECT value, tags, last_modified FROM next_cache_entries WHERE key = $1",
        [key],
      );
      if (rows.length === 0) return null;

      const row = rows[0];
      const tags = row.tags || [];

      // Тег, ревалидированный после записи, гасит запись на всех инстансах.
      if (tags.length > 0) {
        const { rows: tagRows } = await pool.query(
          "SELECT MAX(revalidated_at) AS revalidated_at FROM next_cache_tags WHERE tag = ANY($1::text[])",
          [tags],
        );
        const revalidatedAt = Number(tagRows[0] && tagRows[0].revalidated_at) || 0;
        if (revalidatedAt > Number(row.last_modified)) {
          await pool.query("DELETE FROM next_cache_entries WHERE key = $1", [key]);
          return null;
        }
      }

      return {
        value: row.value,
        lastModified: Number(row.last_modified),
        tags,
      };
    } catch (err) {
      console.error("[cache-handler] get failed:", err);
      return null;
    }
  }

  async set(key, data, ctx) {
    try {
      await ensureSchema();
      if (data === null || data === undefined) {
        await pool.query("DELETE FROM next_cache_entries WHERE key = $1", [key]);
        return;
      }

      const tags = toArray(ctx && ctx.tags);
      await pool.query(
        `INSERT INTO next_cache_entries (key, value, tags, last_modified)
         VALUES ($1, $2::jsonb, $3::text[], $4)
         ON CONFLICT (key) DO UPDATE
           SET value = EXCLUDED.value,
               tags = EXCLUDED.tags,
               last_modified = EXCLUDED.last_modified`,
        [key, JSON.stringify(data), tags, Date.now()],
      );
    } catch (err) {
      console.error("[cache-handler] set failed:", err);
    }
  }

  async revalidateTag(tags) {
    try {
      await ensureSchema();
      const list = toArray(tags).filter(Boolean);
      if (list.length === 0) return;

      await pool.query(
        `INSERT INTO next_cache_tags (tag, revalidated_at)
         SELECT unnest($1::text[]), $2
         ON CONFLICT (tag) DO UPDATE
           SET revalidated_at = GREATEST(next_cache_tags.revalidated_at, EXCLUDED.revalidated_at)`,
        [list, Date.now()],
      );

      await pool.query("DELETE FROM next_cache_entries WHERE tags && $1::text[]", [list]);
    } catch (err) {
      console.error("[cache-handler] revalidateTag failed:", err);
    }
  }

  resetRequestCache() {}
};
