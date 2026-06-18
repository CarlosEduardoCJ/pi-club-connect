// Filtro de palavras ofensivas (PT-BR).
// Lista fornecida pelo produto; aplicada no chat direto e no Feed.

const BAD_WORDS = [
  "aidético","aidética","anal","arrombado","babaca","baba-ovo","babaovo","bagos","baitola",
  "boceta","boco","boiola","bokete","bolcat","boquete","bosseta","bosta","bostana","boçal",
  "bronha","buca","buceta","bunda","bunduda","busseta","bárbaro","bêbado","bêbedo",
  "caceta","cacete","cachorra","cachorro","cadela","caga","cagado","cagao","cagão","cagona",
  "canalha","caralho","casseta","cassete","checheca","chereca","chibumba","chibumbo",
  "chochota","chota","chupada","chupado","cocaina","cocaína","corno","corna","cornagem",
  "cornisse","cornuda","cornudo","cornão","corrupta","corrupto","cretina","cretino",
  "cu","cú","culhao","culhão","curalho","cuzao","cuzão","cuzuda","cuzudo",
  "debiloide","debilóide","denegrir","denigrir","doida","doido","escrota","escroto",
  "esporrada","esporrado","esporro","estupida","estúpida","estupidez","estupido","estúpido",
  "felacao","felação","foda","fodao","fodão","fode","fodi","fodida","fodido",
  "fornica","fornicação","fudendo","fudeção","furada","furado","furnica","furnicar",
  "furona","furão","gaiata","gaiato","gilete","gonorrea","gonorreia","gonorréia",
  "gosmenta","gosmento","grelinho","grelo","idiota","idiotice","imbecil","iscrota","iscroto",
  "judiar","ladra","ladrao","ladroeira","ladrona","ladrão","lazarento","lesbica","lésbica",
  "louco","macaca","macaco","machona","masturba","meleca","merda","mija","mijada","mijado","mijo",
  "mocrea","mocreia","mocréia","mongoloide","mongolóide","mulata","mulato","naba","nazista",
  "nhaca","nojeira","nojenta","nojento","nojo","olhota","otaria","otario","otária","otário",
  "palhaco","palhaço","paspalha","paspalhao","paspalho","pau","peia","peido","pentelha","pentelho",
  "perereca","pica","picao","picão","pilantra","pinel","pinto","pintudo","pintão","piranha",
  "piroca","piroco","piru","pnc","porra","pqp","prequito","priquito","prostibulo",
  "prostituta","prostituto","punheta","punhetao","punhetão","pus","puta","puto",
  "puxa-saco","puxasaco","penis","pênis","rabao","rabão","rabo","rabuda","rabudao","rabudão",
  "rabudo","rabudona","racha","rachada","rachadao","rachadinha","rachadinho","rachado",
  "ramela","remela","retardada","retardado","ridícula","rola","rolinha","rosca","sacana",
  "safada","safado","sapatao","sapatão","siririca","tarada","tarado","testuda","tesuda","tesudo",
  "tezao","tezuda","tezudo","traveco","trocha","trolha","troucha","trouxa","troxa",
  "vadia","vagabunda","vagabundo","vagina","veada","veadao","veado","viada","viadagem",
  "viadao","viadão","viado","víado","xana","xaninha","xavasca","xereca","xerereca","xexeca",
  "xibiu","xibumba","xiíta","xochota","xota","xoxota",
];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
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

export const PROFANITY_MESSAGE =
  "Sua publicação contém conteúdo inadequado e não pode ser enviada.";
