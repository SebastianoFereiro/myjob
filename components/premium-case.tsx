import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Pin, ArrowUp, Clock, Calendar, CheckCircle2, Zap, Crown } from 'lucide-react';

export function PremiumServicesDescription() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-8 px-4">
      {/* Заголовок */}
      <div className="text-center space-y-3">
        <Badge variant="secondary" className="text-sm font-medium px-4 py-1">
          <Crown className="w-4 h-4 mr-1.5 text-amber-500" />
          Платные услуги
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Сделайте вашу вакансию заметной
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          Увеличьте отклики в 3–5 раз с помощью премиум-размещения и автоподнятия
        </p>
      </div>

      {/* Карточки услуг */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Услуга 1: Premium (Закрепление) */}
        <Card className="relative overflow-hidden border-2 border-amber-200 bg-gradient-to-br from-amber-50/50 to-white hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 p-3">
            <Sparkles className="w-8 h-8 text-amber-400 opacity-20" />
          </div>

          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                <Pin className="w-6 h-6" />
              </div>
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Популярное</Badge>
            </div>
            <CardTitle className="text-2xl text-slate-900">Премиум-размещение</CardTitle>
            <CardDescription className="text-base text-slate-600 mt-2">
              Ваша вакансия всегда на виду в специальной зоне с золотой рамкой
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <ul className="space-y-3">
              <FeatureItem
                icon={<Pin className="w-4 h-4" />}
                text="Закрепление в отдельной секции «Premium вакансии»"
              />
              <FeatureItem
                icon={<Sparkles className="w-4 h-4" />}
                text="Золотая обводка карточки и иконка Premium"
              />
              <FeatureItem
                icon={<Zap className="w-4 h-4" />}
                text="Приоритет в поиске и фильтрах"
              />
              <FeatureItem
                icon={<Calendar className="w-4 h-4" />}
                text="Выбор периода действия: от 1 до 90 дней"
              />
            </ul>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Минимальный период</span>
                <span className="font-medium text-slate-900">1 день</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Максимальный период</span>
                <span className="font-medium text-slate-900">90 дней</span>
              </div>
            </div>

            <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold h-12 text-base">
              {/* Активировать Premium */} Для подключения обратитесь к менеджеру
            </Button>
          </CardContent>
        </Card>

        {/* Услуга 2: Auto-push (Автоподнятие) */}
        <Card className="relative overflow-hidden border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-white hover:shadow-lg transition-shadow">
          <div className="absolute top-0 right-0 p-3">
            <ArrowUp className="w-8 h-8 text-blue-400 opacity-20" />
          </div>

          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                <ArrowUp className="w-6 h-6" />
              </div>
              <Badge variant="outline" className="border-blue-300 text-blue-700">
                Автоматизация
              </Badge>
            </div>
            <CardTitle className="text-2xl text-slate-900">Авто-поднятие</CardTitle>
            <CardDescription className="text-base text-slate-600 mt-2">
              Автоматическое обновление даты публикации по расписанию
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <ul className="space-y-3">
              <FeatureItem
                icon={<ArrowUp className="w-4 h-4" />}
                text="Вакансия поднимается вверх списка автоматически"
              />
              <FeatureItem
                icon={<Clock className="w-4 h-4" />}
                text="Настраиваемый интервал: каждые 24, 48 или 72 часа"
              />
              <FeatureItem
                icon={<CheckCircle2 className="w-4 h-4" />}
                text="Работает без вашего участия — подключил и забыл"
              />
              <FeatureItem
                icon={<Calendar className="w-4 h-4" />}
                text="Выбор периода действия: от 1 до 90 дней"
              />
            </ul>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Расписание</span>
                <span className="font-medium text-slate-900">Ежедневно в 8:00</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Максимальный период</span>
                <span className="font-medium text-slate-900">90 дней</span>
              </div>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold h-12 text-base">
              {/* Настроить поднятие */}Для подключения обратитесь к менеджеру
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Сравнение и комбо */}
      <Card className="border-dashed border-2 border-slate-300 bg-slate-50/50">
        <CardContent className="pt-6 pb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-amber-100 to-blue-100">
                <Crown className="w-6 h-6 text-slate-700" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Комбо-эффект</h3>
                <p className="text-sm text-slate-500">
                  Используйте оба сервиса одновременно для максимального результата
                </p>
              </div>
            </div>
            <Button variant="outline" className="border-slate-400 hover:bg-white">
              Узнать больше
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Примечание */}
      <p className="text-center text-sm text-slate-400">
        Все услуги активируются менеджером после оплаты. Период действия указывается в полях «от» и
        «до».
      </p>
    </div>
  );
}

// Вспомогательный компонент для пункта списка
function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-0.5 p-1 rounded-md bg-slate-100 text-slate-600 shrink-0">{icon}</div>
      <span className="text-slate-700 text-sm leading-relaxed">{text}</span>
    </li>
  );
}
