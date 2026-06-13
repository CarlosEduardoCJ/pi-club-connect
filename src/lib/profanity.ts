// Filtro de palavras ofensivas (PT-BR).
// Lista ampliada: xingamentos, baixo calão, termos discriminatórios e variações leetspeak.
// Removidas palavras que também são nomes/sobrenomes comuns (ex.: "pinto", "rola", "preto").

const BAD_WORDS = [
  // ===== Palavrões / baixo calão =====
  "porra", "porrinha", "porraloka", "porra louca",
  "caralho", "carai", "caraio", "krl", "kct", "klh", "carago",
  "merda", "merdinha", "bosta", "bostinha", "cocô", "coco de cu",
  "puta", "puto", "putinha", "putinho", "putaria", "putada", "putona", "putao", "putão",
  "puta merda", "puta que pariu", "pqp", "pqpzao",
  "buceta", "boceta", "bucetinha", "bucetuda", "bct",
  "xota", "xoxota", "xereca", "xerequinha", "ppk", "pepeka", "pepequinha",
  "cuzao", "cuzão", "cuzinho", "cuzuda", "cuzudo", "cuzona", "cuzeta",
  "fdp", "filho da puta", "filha da puta", "fildaputa", "filhadaputa", "fdps",
  "vagabunda", "vagabundo", "vagaba", "vagabas",
  "piranha", "piranhuda", "vadia", "vadio", "vadiazinha",
  "rapariga", "raparigueiro", "biscate", "biscatinha",
  "galinha safada", "safada", "safado", "safadeza",
  "punheta", "punheteiro", "punhetar", "siririca", "siriricar",
  "gozar", "gozada", "gozou", "gozado", "gozadinha", "porra gozada",
  "fuder", "foder", "fudido", "fodido", "fudida", "fodida",
  "fodase", "foda-se", "foda se", "fodeu", "fodeu geral",
  "trepar", "trepada", "trepando",
  "tarado", "tarada", "tarado do caralho",
  "tesao", "tesão", "tesuda", "tesudo",
  "pau no cu", "pau no seu cu", "vai tomar no cu", "toma no cu", "tnc", "vtnc",
  "vsf", "vai se foder", "vai se fuder", "vai se ferrar",
  "vai a merda", "vai pra merda", "vai pra puta que pariu", "vai pra pqp",
  "babaca", "babacao", "babacão",
  "fudido", "fudida", "fudidinho",
  "merdinha", "merdao", "merdão",
  "tomar no cu", "vai tomar", "enfia no cu", "enfia no rabo",
  "chupa meu pau", "chupa rola", "chupa pau", "chupador", "chupadora",
  "lambe cu", "lambe ovo", "lambe saco",
  "punheteiro", "punheteira",
  "corno", "cornudo", "cornuda", "chifrudo", "chifruda", "cornao", "cornão",
  "corna", "cornazinho",
  "babaca", "panaca", "trouxa", "mané", "mane",
  "lixo humano", "verme", "verminoso", "escória", "escoria",
  "feio do caralho", "horroroso do caralho", "horrendo do caralho",
  "nojento", "nojenta", "nojo de gente",

  // ===== Termos discriminatórios / ódio =====
  "viado", "viadinho", "viadao", "viadão", "viadagem", "viadinhos",
  "bicha louca", "bichinha louca", "boiola", "boiolão", "boiolao",
  "sapatao", "sapatão", "sapatona", "sapatonice",
  "traveco", "travecao", "travecão",
  "macaco preto", "macaca preta", "neguinho safado", "preto safado", "preta safada",
  "crioulo", "criolo", "criolagem", "negrada safada", "negao safado", "negão safado",
  "judiar", "judiaria", "judeu safado", "judiazinho",
  "nazista", "hitler tinha razao", "hitler tinha razão", "heil hitler",
  "branquelo nojento", "branquela nojenta",
  "índio preguiçoso", "indio preguicoso",
  "favelado de merda", "favelada de merda",
  "nordestino burro", "nordestina burra",
  "retardado mental", "retardada mental",

  // ===== Insultos pessoais fortes =====
  "lixo de gente", "escória humana", "escoria humana",
  "verme nojento", "rato imundo", "porco imundo",
  "feio pra caralho", "burro pra caralho",

  // ===== Incitação à violência / ameaças =====
  "te mato", "vou te matar", "vai morrer", "morre logo", "morra", "morre desgracado", "morre desgraçado",
  "te bato", "vou te bater", "leva porrada", "toma porrada", "leva tapa", "toma tapa",
  "quebra a cara", "vou quebrar sua cara", "arrebenta", "arrebenta a cara",
  "estupro", "estuprar", "estuprador", "estupradora", "vou te estuprar",
  "se mata", "se enforca", "se suicida", "vai se matar", "se mata logo",
  "te esfaqueio", "vou te esfaquear", "leva facada", "toma facada",
  "leva tiro", "toma tiro", "te dou um tiro", "vou te dar um tiro",
  "te quebro", "vou te quebrar", "te arrebento", "vou te arrebentar",
  "te estouro", "vou te estourar",

  // ===== Variações leetspeak / com números/símbolos =====
  // p0rra, c4ralho, m3rda, etc. (normalize remove símbolos e dígitos não casam, então listamos versões já normalizadas com letras)
  // Adicionamos formas comuns com substituições mantendo letras:
  "p0rra", "p0rr4", "porr4", "c4ralho", "car4lho", "caralh0", "c@ralho",
  "m3rda", "merd4", "m3rd4",
  "put4", "put0", "put@",
  "buc3ta", "buceta4", "buc3t4", "bocet4", "bucet@",
  "fud3u", "fud3r", "fod3r", "f0der", "f0deu",
  "v1ado", "vi4do", "v14do", "vi@do",
  "v4gabunda", "vagabund4", "v4gabundo",
  "c4buloso", "filh0 da puta", "filh4 da puta", "fdp4",
  "tnc", "vtnc", "vsf", "pqp", "krlh", "krlho", "kct",
  "c0rno", "c0rna", "ch1frudo", "ch1fruda",
  "s4pat4o", "s4patao", "v14dinho", "b1cha", "b01ola",
  "punh3ta", "g0zar", "g0zada",
  "s3 mata", "se m4ta", "s3 enforca",
  "vai s3 fud3r", "v4i se foder", "vai s3 foder",
];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    // leetspeak: trocar números/símbolos por letras equivalentes ANTES de remover não-alfa
    .replace(/0/g, "o")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/4/g, "a")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function containsProfanity(text: string): boolean {
  const n = " " + normalize(text) + " ";
  return BAD_WORDS.some((w) => n.includes(" " + normalize(w) + " "));
}
