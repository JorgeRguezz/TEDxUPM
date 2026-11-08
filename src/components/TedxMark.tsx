import artwork from '../assets/wordmark.json';

export function TedxMark() {
  return <svg className="brand-mark" viewBox={artwork.tedxViewBox} fill="#EB0028" aria-hidden="true" focusable="false">
    {artwork.letters.filter(letter => letter.red).map((letter, index) => <path key={index} d={letter.d} />)}
  </svg>;
}
