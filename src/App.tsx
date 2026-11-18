import { localeOf } from './data/event';
import { ComingSoon } from './components/ComingSoon';

// Fase 1: la web pública es solo la página «coming soon». La web anterior está en src/legacy/.
export function App({ initialPath }: { initialPath: string }) {
  return <ComingSoon locale={localeOf(initialPath)} />;
}
