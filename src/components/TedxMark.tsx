import artwork from '../assets/wordmark.json';

// Como en el logo oficial de TEDx, la «x» va más pequeña y elevada, alineada con la parte superior de «TED».
const RAISED_X = 'translate(307 15.87) scale(.72) translate(-307 -43.12)';
const [vx, vy, , vh] = artwork.tedxViewBox.split(' ').map(Number);

export function TedxMark() {
  return <svg className="brand-mark" viewBox={`${vx} ${vy} 359 ${vh}`} fill="#EB0028" aria-hidden="true" focusable="false">
    {artwork.letters.filter(letter => letter.red).map((letter, index) => <path key={index} d={letter.d} transform={index === 3 ? RAISED_X : undefined} />)}
  </svg>;
}
