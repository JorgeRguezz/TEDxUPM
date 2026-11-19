import { localeOf, pageOf } from './data/event';
import { ComingSoon } from './components/ComingSoon';
import { Partners } from './components/Partners';

// Fase 1: coming soon y página de partners. La web anterior está en src/legacy/.
export function App({ initialPath }: { initialPath: string }) {
  const locale = localeOf(initialPath);
  return pageOf(initialPath) === 'partners' ? <Partners locale={locale} /> : <ComingSoon locale={locale} />;
}
