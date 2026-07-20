import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Header from '@/components/header';
import { Footer } from '@/components/footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center px-4 py-24">
          <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-2">Страница не найдена</h2>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Страница, которую вы ищете, не существует или была перемещена.
          </p>
          <Button asChild size="lg">
            <Link href="/">На главную</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
