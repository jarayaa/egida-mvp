'use strict';
// ÉGIDA · MVP no-code — compuerta determinista de bienvenida/capacidades.
//
// POR QUÉ EXISTE
// -------------
// Sin esta compuerta, el MVP respondía a "¿qué puede hacer?" con la frase de no
// cobertura ("Esta materia no está cubierta por el corpus normativo indexado"): a la
// pregunta más elemental de un usuario nuevo, el asistente contestaba que no la cubre.
// El defecto era el mismo que en la versión on-prem, agravado aquí porque el MVP resuelve
// por palabra clave y TODO lo que no calza cae a no cobertura.
//
// REGISTRO
// --------
// ÉGIDA es una plataforma institucional: la SALIDA va siempre en trato de usted. La
// ENTRADA, en cambio, tolera ambos tratos —quien tutea merece la misma respuesta—, y el
// tuteo se canonicaliza a cortesía antes de evaluarlo.
//
// PARIDAD CON LA VERSIÓN ON-PREM
// ------------------------------
// Es un port fiel de `egida.asistente.DetectorBienvenida` (backend Java). Ambas
// implementaciones se verifican contra la MISMA batería en `pruebas/paridad-compuerta.js`:
// si divergen, el usuario recibiría respuestas distintas según la versión que use.
//
// Se mantiene en archivo propio, sin tocar el DOM, para poder ejecutarlo bajo Node sin
// navegador. Se carga antes que `app.js` (CSP `script-src 'self'`).

// ── Texto canónico de bienvenida ──
// Enumera SOLO los instrumentos efectivamente indexados en ESTA versión. No replica el
// texto del backend: el corpus del MVP es distinto —no incluye la Ley N°21.663 ni la
// Ley N°19.628— y anunciarlas aquí sería exactamente la alucinación que la compuerta evita.
const BIENVENIDA =
  "Soy el asistente normativo de ÉGIDA. Oriento —con citas verificables al instrumento y "
  + "artículo— sobre la normativa chilena de seguridad de la información y ciberseguridad "
  + "del Estado. En esta versión de demostración el corpus indexado comprende el DS N°7/2023 "
  + "(Norma Técnica de Seguridad de la Información), el DS N°295/2024 (reporte de incidentes), "
  + "la Res. Ex. N°7/2025 de la ANCI (taxonomía de incidentes), la Res. Ex. N°87/2025 (nómina "
  + "de Operadores de Importancia Vital) y la NCh-ISO 27001. Por ejemplo, puede consultarme "
  + "por los plazos para reportar un incidente, si un organismo figura en la nómina de OIV, o "
  + "cuáles son las cinco funciones de la NTSIC. ¿Sobre qué materia normativa desea orientarse?";

// ── Saludo inequívoco al inicio de una consulta corta ──
const SALUDO_INICIAL = /^(muy )?(hola|holi|buenos dias|buenas tardes|buenas noches|buen dia|que tal|saludos|hey|estimado|estimada)\b/;

// ── Capacidades en TUTEO: la segunda persona ya marca al asistente como sujeto, de modo
// que se buscan en cualquier posición sin riesgo de capturar una consulta normativa.
const CAPACIDADES = [
  "en que me puedes ayudar", "en que me ayudas", "en que puedes ayudar",
  "en que ayudas", "como me puedes ayudar", "que puedes hacer", "que sabes hacer",
  "que puedes hacer por mi", "para que sirves", "para que sirve este asistente",
  "para que sirve este chat", "quien eres", "que eres", "que haces",
  "como funcionas", "como te uso", "como te utilizo",
  "que normas conoces", "que normas manejas", "que normas tienes",
  "que normas cubres", "cuales normas conoces", "que leyes conoces",
  "que puedo preguntar", "que puedo consultar", "que consultas puedo",
  "cual es tu funcion", "cuales son tus capacidades", "que informacion tienes",
  "sobre que puedes responder", "de que temas sabes"];

// ── Canonicalización del trato: tuteo → cortesía (palabra completa) ──
const TRATO_A_CORTESIA = {
  puedes: "puede", podrias: "podria", sabes: "sabe", conoces: "conoce",
  manejas: "maneja", tienes: "tiene", cubres: "cubre", sirves: "sirve",
  eres: "es", haces: "hace", funcionas: "funciona", ayudas: "ayuda",
  respondes: "responde", usas: "usa", utilizas: "utiliza", ocupas: "ocupa",
  abarcas: "abarca", tu: "su", tus: "sus", ti: "usted", contigo: "con usted"};

// ── Enclíticos de objeto: "hacerle"/"hacerte" son la misma pregunta que "hacer" ──
const ENCLITICOS = {
  hacerte: "hacer", hacerle: "hacer", preguntarte: "preguntar", preguntarle: "preguntar",
  consultarte: "consultar", consultarle: "consultar", ayudarte: "ayudar",
  ayudarle: "ayudar", ayudarme: "ayudar", orientarme: "orientar", orientarle: "orientar",
  explicarme: "explicar", decirme: "decir", responderme: "responder"};

// ── Pronombre átono ante verbo de capacidad: "en qué ME puede ayudar" → "en qué puede ayudar"
const ATONO_ANTE_VERBO = /\b(?:me|te|le|nos|se)\s+(?=(?:puede|puedo|pueden|podria|podrian|ayuda|ayudan|orienta|responde|sirve)\b)/g;

// ── Mención explícita del asistente como sujeto (se retira antes de anclar) ──
const SUJETO_ASISTENTE = /\b(a este asistente|de este asistente|al asistente|del asistente|este asistente|el asistente|usted|este chat|al chat|este portal|el portal|esta plataforma|esta herramienta|este sistema|el sistema|egida)\b/g;

const RELLENO_FINAL = /\s+(exactamente|especificamente|concretamente|en concreto|aqui|ahora|por favor|entonces|en general|mas o menos)$/;

// Preposición que queda colgando tras retirar el sujeto ("…hacer al asistente" → "…hacer al").
const PREPOSICION_COLGANTE = /\s+(a|al|de|del|en|con|para|por|sobre|hacia)$/;

// ── Capacidades en registro formal: se exige que CIERREN la consulta ──
// El anclaje es la salvaguarda: "¿qué puede hacer un OIV ante un incidente?" no termina
// en "que puede hacer" y por lo tanto no se captura.
const CAPACIDADES_FORMALES = [
  "que puede hacer", "que puede hacer por mi", "que sabe hacer", "que hace",
  "que puede responder", "sobre que puede responder", "que es", "quien es",
  "para que sirve", "cual es su proposito", "cual es su objetivo",
  "en que puede ayudar", "en que ayuda", "como puede ayudar", "puede ayudar",
  "sobre que puede orientar", "sobre que materias puede orientar",
  "en que materias puede orientar",
  "como funciona", "como se usa", "como se utiliza", "como lo uso",
  "como uso esto", "como se ocupa", "como se opera",
  "que normas conoce", "que normas maneja", "que normas tiene",
  "que normas cubre", "cuales normas conoce", "que leyes conoce",
  "que normativa conoce", "que normativa cubre", "que corpus tiene",
  "que puedo preguntar", "que puedo consultar", "sobre que puedo preguntar",
  "sobre que puedo consultar", "puedo preguntar", "puedo consultar",
  "preguntas puedo hacer", "consultas puedo hacer",
  "preguntas puede responder", "consultas puede responder",
  "que puede consultar", "que puede preguntar", "que se le puede preguntar",
  "ejemplos de preguntas", "ejemplos de consultas",
  "ejemplos de lo que puedo preguntar",
  "cual es su funcion", "cuales son sus funciones", "cuales son sus capacidades",
  "cual es su alcance", "cual es su ambito", "que informacion tiene",
  "de que temas sabe", "que temas cubre", "que materias cubre",
  "que temas abarca", "que materias abarca", "que ambito cubre"];

// Peticiones de ayuda escuetas: coincidencia EXACTA, nunca parcial.
const AYUDA_EXACTA = [
  "ayuda", "necesito ayuda", "quiero ayuda", "requiero ayuda", "ayudeme",
  "ayudame", "buenas", "que opciones hay", "opciones"];

/** Minúsculas, sin tildes, sin signos de puntuación, espacios colapsados. */
function normalizarConsulta(texto) {
  return texto.toLowerCase()
    .replace(/í/g, "i").replace(/á/g, "a").replace(/é/g, "e")
    .replace(/ó/g, "o").replace(/ú/g, "u").replace(/ñ/g, "n")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Lleva la consulta a forma única: trato, enclíticos, átonos, sujeto y relleno. */
function canonicalizar(q) {
  let texto = q.split(" ")
    .map(p => TRATO_A_CORTESIA[p] || ENCLITICOS[p] || p)
    .join(" ");
  let anterior;
  do { anterior = texto; texto = texto.replace(ATONO_ANTE_VERBO, ""); } while (texto !== anterior);
  texto = texto.replace(SUJETO_ASISTENTE, " ").replace(/\s+/g, " ").trim();
  let previo;
  do {
    previo = texto;
    texto = texto.replace(RELLENO_FINAL, "").trim();
    texto = texto.replace(PREPOSICION_COLGANTE, "").trim();
  } while (texto !== previo);
  return texto;
}

/** ¿La consulta es un saludo o una pregunta por las capacidades del asistente? */
function esSaludoOCapacidades(pregunta) {
  if (!pregunta || !pregunta.trim()) { return false; }
  const q = normalizarConsulta(pregunta);
  if (CAPACIDADES.some(c => q.includes(c))) { return true; }
  if (AYUDA_EXACTA.includes(q)) { return true; }
  if (SALUDO_INICIAL.test(q) && q.split(/\s+/).length <= 6) { return true; }
  const canonico = canonicalizar(q);
  return CAPACIDADES_FORMALES.some(c => canonico.endsWith(c));
}
