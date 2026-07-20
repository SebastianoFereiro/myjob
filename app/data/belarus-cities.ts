export interface CityInfo {
  region: string;
  regionalCenter: string;
}

export const belarusCities: Record<string, CityInfo> = {
  // Областные центры
  "Минск": { region: "Минская", regionalCenter: "Минск" },
  "Гомель": { region: "Гомельская", regionalCenter: "Гомель" },
  "Брест": { region: "Брестская", regionalCenter: "Брест" },
  "Витебск": { region: "Витебская", regionalCenter: "Витебск" },
  "Могилёв": { region: "Могилёвская", regionalCenter: "Могилёв" },
  "Могилев": { region: "Могилёвская", regionalCenter: "Могилёв" },
  "Гродно": { region: "Гродненская", regionalCenter: "Гродно" },

  // Крупные города
  "Барановичи": { region: "Брестская", regionalCenter: "Брест" },
  "Пинск": { region: "Брестская", regionalCenter: "Брест" },
  "Бобруйск": { region: "Могилёвская", regionalCenter: "Могилёв" },
  "Орша": { region: "Витебская", regionalCenter: "Витебск" },
  "Новополоцк": { region: "Витебская", regionalCenter: "Витебск" },
  "Полоцк": { region: "Витебская", regionalCenter: "Витебск" },
  "Лида": { region: "Гродненская", regionalCenter: "Гродно" },
  "Мозырь": { region: "Гомельская", regionalCenter: "Гомель" },
  "Калинковичи": { region: "Гомельская", regionalCenter: "Гомель" },
  "Солигорск": { region: "Минская", regionalCenter: "Минск" },
  "Борисов": { region: "Минская", regionalCenter: "Минск" },
  "Молодечно": { region: "Минская", regionalCenter: "Минск" },
  "Жлобин": { region: "Гомельская", regionalCenter: "Гомель" },
  "Светлогорск": { region: "Гомельская", regionalCenter: "Гомель" },
  "Речица": { region: "Гомельская", regionalCenter: "Гомель" },
  "Слуцк": { region: "Минская", regionalCenter: "Минск" },
  "Жодино": { region: "Минская", regionalCenter: "Минск" },
  "Кобрин": { region: "Брестская", regionalCenter: "Брест" },
  "Лунинец": { region: "Брестская", regionalCenter: "Брест" },
  "Новогрудок": { region: "Гродненская", regionalCenter: "Гродно" },
  "Сморгонь": { region: "Гродненская", regionalCenter: "Гродно" },
  "Рогачёв": { region: "Гомельская", regionalCenter: "Гомель" },
  "Рогачев": { region: "Гомельская", regionalCenter: "Гомель" },
  "Кричев": { region: "Могилёвская", regionalCenter: "Могилёв" },
  "Осиповичи": { region: "Могилёвская", regionalCenter: "Могилёв" },
  "Горки": { region: "Могилёвская", regionalCenter: "Могилёв" },
} as const;

const DEFAULT_REGION = "Минская";
const DEFAULT_CITY = "Минск";

export function lookupCity(cityName?: string | null): CityInfo {
  if (!cityName) return { region: DEFAULT_REGION, regionalCenter: DEFAULT_CITY };

  const trimmed = cityName.trim();
  const found = belarusCities[trimmed];
  if (found) return found;

  // Попытка поиска без учёта регистра
  const lower = trimmed.toLowerCase();
  for (const [key, info] of Object.entries(belarusCities)) {
    if (key.toLowerCase() === lower) return info;
  }

  return { region: DEFAULT_REGION, regionalCenter: DEFAULT_CITY };
}
