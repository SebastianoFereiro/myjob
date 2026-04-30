// components/Banner.tsx
// Server Component: Баннерный блок главной страницы
export default function Banner() {
  return (
    <section className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Найди работу своей мечты
        </h1>
        <p className="text-xl sm:text-2xl text-blue-100 max-w-3xl mx-auto">
          Тысячи вакансий от ведущих компаний ждут тебя. Начни поиск прямо сейчас!
        </p>
      </div>
    </section>
  );
}
