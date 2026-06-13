// Filtro de palavras ofensivas (PT-BR).
// Lista ampliada com xingamentos, baixo calão e incitação à violência.
// Removidas palavras que também são nomes/sobrenomes comuns (ex.: "pinto", "rola", "preto").
const BAD_WORDS = [
  // Palavrões / baixo calão
  "porra", "caralho", "carai", "krl", "kct", "merda", "bosta", "cocô",
  "puta", "puto", "putinha", "putinho", "putaria", "putada",
  "buceta", "boceta", "bucetinha", "xota", "xoxota", "xereca", "ppk",
  "cuzao", "cuzão", "cu", "cuzinho", "cuzuda", "cuzudo",
  "fdp", "filho da puta", "filha da puta", "fildaputa",
  "vagabunda", "vagabundo", "vagaba", "piranha", "vadia", "vadio",
  "rapariga", "biscate", "galinha safada",
  "punheta", "punheteiro", "siririca",
  "gozar", "gozada", "gozou", "gozado",
  "fuder", "foder", "fodido", "fodida", "fodase", "foda-se", "fodeu",
  "trepar", "trepada", "tarado", "tarada", "tesao", "tesão",
  "pau no cu", "vai tomar no cu", "toma no cu", "vtnc", "vsf", "vai se foder",
  "vai a merda", "vai pra puta que pariu", "puta que pariu", "pqp",
  "babaca", "arrombado", "arrombada", "escroto", "escrota", "cretino", "cretina",
  "imbecil", "idiota", "burro", "burra", "jumento", "jumenta",
  "otario", "otário", "otaria", "otária", "trouxa", "panaca", "babado",
  "retardado", "retardada", "mongoloide", "mongol", "débil mental", "debil mental",

  // Termos discriminatórios / ódio
  "viado", "viadinho", "viadagem", "bicha louca", "boiola", "boiolão",
  "sapatao", "sapatão", "traveco",
  "macaco", "macaca", "neguinho safado", "preto safado", "preta safada",
  "crioulo", "criolo", "negrada", "negao safado",
  "judiar", "judiaria", "judeu safado",
  "nazista", "hitler tinha razao",

  // Insultos pessoais comuns
  "corno", "cornudo", "cornuda", "chifrudo", "chifruda",
  "lixo humano", "verme", "escória", "escoria",
  "feio do caralho", "horroroso do caralho",

  // Incitação à violência / ameaças
  "te mato", "vou te matar", "vai morrer", "morre logo", "morra",
  "te bato", "vou te bater", "leva porrada", "toma porrada",
  "quebra a cara", "vou quebrar sua cara", "arrebenta",
  "estupro", "estuprar", "estuprador",
  "se mata", "se enforca", "se suicida", "vai se matar",
  "te esfaqueio", "vou te esfaquear", "leva tiro", "toma tiro",
];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function containsProfanity(text: string): boolean {
  const n = " " + normalize(text) + " ";
  return BAD_WORDS.some((w) => n.includes(" " + normalize(w) + " "));
}
