// Filtro simples de palavras ofensivas (PT-BR). Lista mínima e ampliável.
const BAD_WORDS = [
  "porra", "caralho", "merda", "puta", "puto", "buceta", "boceta", "viado",
  "viadinho", "corno", "cuzao", "cuzão", "fdp", "filho da puta", "vagabunda",
  "vagabundo", "piranha", "retardado", "retardada", "imbecil", "idiota",
  "burro", "burra", "otario", "otário", "babaca", "arrombado", "arrombada",
  "punheta", "rola", "pinto", "xota", "xoxota", "gozar", "gozada", "fuder",
  "foder", "foda-se", "fodase", "babado", "bicha", "macaco", "preto safado",
];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");

export function containsProfanity(text: string): boolean {
  const n = " " + normalize(text) + " ";
  return BAD_WORDS.some((w) => n.includes(" " + normalize(w) + " "));
}
