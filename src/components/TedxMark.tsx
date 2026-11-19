import artwork from '../assets/wordmark.json';

// La "x" de TEDx va en superíndice, como en el logo oficial: más pequeña y alineada
// con la parte alta de las mayúsculas. Las letras rojas son T, E, D, x (índice 3).
const X_SUPERSCRIPT = 'translate(132.75 -9.1) scale(.58)';
const VIEWBOX = '16.1 15.87 349 109.13'; // se estrecha porque la x ocupa menos

export function TedxMark() {
  return <svg className="brand-mark" viewBox={VIEWBOX} fill="#EB0028" aria-hidden="true" focusable="false">
    {artwork.letters.filter(letter => letter.red).map((letter, index) =>
      <path key={index} d={letter.d} transform={index === 3 ? X_SUPERSCRIPT : undefined} />)}
  </svg>;
}
