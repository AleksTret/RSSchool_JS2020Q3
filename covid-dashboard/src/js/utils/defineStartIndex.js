import alphabet from '../storage/alphabet';

export default function defineStartIndex(iso2, countryIso2, len) {
  const word = iso2[countryIso2] ? iso2[countryIso2] : countryIso2;
  const alphabetIndex = alphabet.indexOf(word[0].toLowerCase());
  const startIndex = Math.floor((alphabetIndex / alphabet.length) * len);
  return startIndex;
}
