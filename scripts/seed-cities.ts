const CYRILLIC_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e',
  ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u',
  ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
  ы: 'y', э: 'e', ю: 'yu', я: 'ya',
  А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D', Е: 'E', Ё: 'E',
  Ж: 'Zh', З: 'Z', И: 'I', Й: 'Y', К: 'K', Л: 'L', М: 'M',
  Н: 'N', О: 'O', П: 'P', Р: 'R', С: 'S', Т: 'T', У: 'U',
  Ф: 'F', Х: 'Kh', Ц: 'Ts', Ч: 'Ch', Ш: 'Sh', Щ: 'Shch',
  Ы: 'Y', Э: 'E', Ю: 'Yu', Я: 'Ya',
};

function transliterate(text: string): string {
  return text.split('').map((ch) => CYRILLIC_MAP[ch] ?? ch).join('');
}

import { belarusCities } from '../app/data/belarus-cities';

const STRAPI_URL = process.env.STRAPI_URL || 'https://atlantis.myjob.by';
const API_TOKEN = "9092a88404f4c77027629bc80cda1d0fb866c69cf6c05a6998feb6177658a2546bda636d77145fdc373b8f9a0afa752f0a023bf9acf2095654f6a2b1db3b978d5d9368e43a9a960a21e9afab72711e2358e82adacafcea2ea90b108eeeab66f82c806ba6f00c533b3058c8ea6012003dfd9e554fff001a9af6fdadffbe661939";


interface CitySeed {
  title: string;
  slug: string;
  description: string;
}

async function main() {
  if (!API_TOKEN) {
    console.error('STRAPI_API_WRITE_TOKEN is required');
    process.exit(1);
  }

  const cities: CitySeed[] = Object.entries(belarusCities).map(([title, info]) => ({
    title,
    slug: transliterate(title).toLowerCase().replace(/[^a-z0-9-_.~]+/g, '-').replace(/^-+|-+$/g, ''),
    description: `${info.region} область, ${info.regionalCenter ? `региональный центр: ${info.regionalCenter}` : ''}`.trim(),
  }));

  // Удаляем дубликаты по slug
  const unique = new Map<string, CitySeed>();
  for (const city of cities) {
    if (!unique.has(city.slug)) {
      unique.set(city.slug, city);
    }
  }

  console.log(`Found ${unique.size} unique cities to seed`);

  for (const [, city] of unique) {
    try {
      // Проверяем, существует ли уже город
      const checkRes = await fetch(
        `${STRAPI_URL}/api/cities?filters[slug][$eq]=${city.slug}&pagination[pageSize]=1`,
        { headers: { Authorization: `Bearer ${API_TOKEN}` } },
      );
      const checkJson = await checkRes.json();

      if (checkJson.data && checkJson.data.length > 0) {
        console.log(`[SKIP] City "${city.title}" already exists`);
        continue;
      }

      // Создаём город
      const res = await fetch(`${STRAPI_URL}/api/cities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify({
          data: {
            title: city.title,
            slug: city.slug,
            description: city.description,
            publishedAt: new Date().toISOString(),
          },
        }),
      });

      if (res.ok) {
        console.log(`[OK] Created city "${city.title}" (${city.slug})`);
      } else {
        const err = await res.json().catch(() => ({}));
        console.error(`[FAIL] Failed to create city "${city.title}":`, err);
      }
    } catch (err) {
      console.error(`[ERROR] Error creating city "${city.title}":`, err);
    }
  }

  console.log('Done seeding cities');
}

main().catch(console.error);
