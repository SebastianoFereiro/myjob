import type { Metadata } from 'next';
import { Mail, Phone, MapPin, Globe, Clock3, Send } from 'lucide-react';

import Header from '@/components/header';
import { Footer } from '@/components/footer';

import { navigationItems } from '@/app/data/navigation';

export const metadata: Metadata = {
  title: 'Контакты | MyJOB',
  description: 'Свяжитесь с командой MyJOB для сотрудничества, поддержки и размещения вакансий.',
};

export default function ContactsPage() {
  return (
    <>
      <Header navigationData={navigationItems} />

      <main className="min-h-screen bg-[#fafafa]">
        {/* HERO */}
        <section className="border-b bg-white">
          <div className="container py-8 md:py-12">
            <div className="rounded-[32px] border bg-gradient-to-br from-white to-zinc-50 p-6 shadow-sm md:p-10">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  CONTACT MYJOB
                </div>

                <h1 className="text-4xl font-bold tracking-tight md:text-6xl">Контакты</h1>

                <p className="mt-5 text-base leading-8 text-muted-foreground md:text-lg">
                  Свяжитесь с командой MyJOB по вопросам сотрудничества, размещения вакансий,
                  поддержки или рекламы.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <section className="container py-6 md:py-10">
          <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
            {/* LEFT */}
            <div className="rounded-[32px] border bg-white p-6 shadow-sm md:p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold md:text-3xl">Напишите нам</h2>

                <p className="mt-3 text-muted-foreground">Мы отвечаем в течение 24 часов.</p>
              </div>

              <form className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Ваше имя</label>

                    <input
                      type="text"
                      placeholder="Введите имя"
                      className="h-12 w-full rounded-2xl border bg-zinc-50 px-4 outline-none transition focus:border-black"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium">Email</label>

                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="h-12 w-full rounded-2xl border bg-zinc-50 px-4 outline-none transition focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Тема</label>

                  <input
                    type="text"
                    placeholder="Например: Размещение вакансии"
                    className="h-12 w-full rounded-2xl border bg-zinc-50 px-4 outline-none transition focus:border-black"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Сообщение</label>

                  <textarea
                    rows={6}
                    placeholder="Введите сообщение..."
                    className="w-full rounded-2xl border bg-zinc-50 p-4 outline-none transition focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-2xl bg-black px-6 py-3 font-medium text-white transition hover:scale-[1.02]"
                >
                  <Send className="h-4 w-4" />
                  Отправить сообщение
                </button>
              </form>
            </div>

            {/* SIDEBAR */}
            <aside className="space-y-6">
              {/* CONTACT INFO */}
              <div className="rounded-[32px] border bg-white p-6 shadow-sm md:p-7">
                <h3 className="mb-6 text-2xl font-semibold">Контактная информация</h3>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100">
                      <Mail className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>

                      <a href="mailto:contact@myJOB.by" className="font-medium hover:underline">
                        contact@myJOB.by
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100">
                      <Phone className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Телефон</p>

                      <a href="tel:+375291234567" className="font-medium hover:underline">
                        +375 (29) 123-45-67
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100">
                      <MapPin className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Адрес</p>

                      <p className="font-medium">Минск, Беларусь</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100">
                      <Globe className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Сайт</p>

                      <a
                        href="https://myJOB.by"
                        target="_blank"
                        className="font-medium hover:underline"
                      >
                        myJOB.by
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-100">
                      <Clock3 className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Время работы</p>

                      <p className="font-medium">Пн–Пт • 09:00–18:00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="rounded-[32px] bg-black p-6 text-white shadow-xl md:p-7">
                <h3 className="text-2xl font-semibold">Разместить вакансию</h3>

                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Свяжитесь с нами для публикации вакансий, брендирования компании и premium
                  размещения.
                </p>

                <button className="mt-6 w-full rounded-2xl bg-white px-5 py-3 font-medium text-black transition hover:scale-[1.02]">
                  Связаться с отделом продаж
                </button>
              </div>
            </aside>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
