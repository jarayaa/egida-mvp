'use strict';
// Verificación de la compuerta de bienvenida del MVP.
//
//   node pruebas/paridad-compuerta.js
//
// QUÉ VERIFICA
// ------------
//  1. Que toda consulta de `bateria-bienvenida.txt` (saludos y preguntas por capacidades,
//     en tuteo y en trato de usted) obtenga la BIENVENIDA y no la frase de no cobertura.
//  2. Que ninguna consulta de `bateria-normativa.txt` sea secuestrada por la compuerta.
//     Esa batería no es una muestra inventada: son las preguntas reales del catálogo de
//     controles, el set gold y las formulaciones que empiezan igual que una pregunta de
//     capacidades pero nombran un sujeto normativo ("¿qué puede hacer un OIV…?").
//  3. Que la BIENVENIDA solo anuncie instrumentos del corpus de ESTA versión: prometer
//     una norma que el MVP no indexa sería la misma alucinación que la compuerta evita.
//  4. Rendimiento: la compuerta corre en cada envío y debe ser imperceptible.
//
// PARIDAD CON LA VERSIÓN ON-PREM
// ------------------------------
// Estos dos archivos de batería son los mismos que verifica `DetectorBienvenidaTest` en
// el backend Java. Si una implementación deriva de la otra, el usuario recibiría
// respuestas distintas según la versión que use, que es exactamente el defecto que se
// está corrigiendo.

const fs = require('node:fs');
const path = require('node:path');

const raiz = path.join(__dirname, '..');

// Se carga el archivo de la compuerta tal cual lo sirve el navegador —sin `module.exports`
// ni guardas de entorno—, evaluándolo en un ámbito propio. Así lo que se prueba es
// exactamente el archivo que se despliega, no una copia adaptada para la prueba.
function cargarCompuerta() {
  const codigo = fs.readFileSync(path.join(raiz, 'compuerta-bienvenida.js'), 'utf8');
  return new Function(
    codigo + '\nreturn { esSaludoOCapacidades, BIENVENIDA, normalizarConsulta, canonicalizar };',
  )();
}

function leerBateria(nombre) {
  return fs.readFileSync(path.join(__dirname, nombre), 'utf8')
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'));
}

const compuerta = cargarCompuerta();
let fallos = 0;

function revisar(archivo, esperado, rotulo) {
  const consultas = leerBateria(archivo);
  if (consultas.length === 0) {
    throw new Error('Batería vacía: ' + archivo + ' — un verde aquí no significaría nada.');
  }
  let malas = 0;
  for (const c of consultas) {
    if (compuerta.esSaludoOCapacidades(c) !== esperado) {
      console.log('  ✗ ' + rotulo + ': ' + c);
      malas++;
    }
  }
  console.log((malas === 0 ? '✓' : '✗') + ' ' + archivo
    + ': ' + consultas.length + ' evaluadas, ' + malas + ' fallos');
  fallos += malas;
}

console.log('— Compuerta de bienvenida (MVP) —');
revisar('bateria-bienvenida.txt', true, 'FALSO NEGATIVO (debía dar la bienvenida)');
revisar('bateria-normativa.txt', false, 'FALSO POSITIVO (secuestra consulta normativa)');

// ── Coherencia del texto: solo instrumentos realmente indexados en esta versión ──
const b = compuerta.BIENVENIDA;
const debeMencionar = ['DS N°7/2023', 'DS N°295/2024', 'Res. Ex. N°7/2025',
  'Res. Ex. N°87/2025', 'NCh-ISO 27001'];
const noDebeMencionar = ['Ley N°21.663', 'Ley N°19.628', '27002'];
for (const i of debeMencionar) {
  if (!b.includes(i)) { console.log('  ✗ la bienvenida omite un instrumento indexado: ' + i); fallos++; }
}
for (const i of noDebeMencionar) {
  if (b.includes(i)) { console.log('  ✗ la bienvenida anuncia una norma fuera del corpus del MVP: ' + i); fallos++; }
}
if (!b.includes('Por ejemplo')) { console.log('  ✗ la bienvenida no ofrece ejemplos de consulta'); fallos++; }
console.log('✓ texto de bienvenida: instrumentos declarados = los del corpus del MVP');

// ── Registro: la salida nunca tutea ──
const TUTEO = /\b(puedes|debes|tienes|necesitas|quieres|deseas|sabes|conoces|manejas|eres|haces|dime|dame|contigo|tuyo|tuya|tus|ti)\b|\b(explicarte|citarte|ayudarte|decirte|indicarte|orientarte|preguntarte|hacerte)\b/i;
if (TUTEO.test(b)) { console.log('  ✗ la bienvenida tutea al usuario'); fallos++; }
// La guarda se juzga a sí misma: si dejara de reconocer el tuteo, lo anterior sería vacío.
if (!TUTEO.test('Puedo explicarte lo que necesitas')) {
  console.log('  ✗ la guarda de registro no reconoce el tuteo'); fallos++;
}
if (TUTEO.test('La Contraloría comparte parte del informe, aparte del anexo')) {
  console.log('  ✗ la guarda de registro confunde sustantivos con enclíticos'); fallos++;
}
console.log('✓ registro: la salida usa trato de usted');

// ── Rendimiento ──
const muestra = leerBateria('bateria-normativa.txt').concat(leerBateria('bateria-bienvenida.txt'));
for (let i = 0; i < 20000; i++) { compuerta.esSaludoOCapacidades(muestra[i % muestra.length]); }
const repeticiones = 100000;
const t0 = process.hrtime.bigint();
for (let i = 0; i < repeticiones; i++) { compuerta.esSaludoOCapacidades(muestra[i % muestra.length]); }
const microsPorConsulta = Number(process.hrtime.bigint() - t0) / repeticiones / 1000;
const techo = 200;
if (microsPorConsulta > techo) {
  console.log('  ✗ la compuerta tarda ' + microsPorConsulta.toFixed(1) + ' µs (techo ' + techo + ' µs)');
  fallos++;
}
console.log('✓ rendimiento: ' + microsPorConsulta.toFixed(1) + ' µs por consulta (techo ' + techo + ' µs)');

// ── Cableado en app.js: el ORDEN es la esencia de la compuerta ──
// Si la llamada se moviera después de la búsqueda por palabra clave, una pregunta de
// capacidades que casara con alguna clave del banco QA se respondería con una ficha
// normativa en lugar de la bienvenida, y el resto seguiría cayendo a no cobertura. Es un
// fallo silencioso: nada revienta, solo vuelve el defecto.
const app = fs.readFileSync(path.join(raiz, 'app.js'), 'utf8');
const posCompuerta = app.indexOf('esSaludoOCapacidades');
const posPalabraClave = app.indexOf('QA.find');
if (posCompuerta === -1) {
  console.log('  ✗ app.js no invoca la compuerta de bienvenida'); fallos++;
} else if (posPalabraClave === -1) {
  console.log('  ✗ no se encontró la búsqueda por palabra clave en app.js'); fallos++;
} else if (posCompuerta > posPalabraClave) {
  console.log('  ✗ la compuerta se evalúa DESPUÉS de la búsqueda por palabra clave'); fallos++;
} else {
  console.log('✓ cableado: la compuerta se evalúa antes de la búsqueda por palabra clave');
}
// La bienvenida no es una respuesta normativa: no debe arrastrar la advertencia asistiva.
if (!/txt!==NO_COBERTURA&&txt!==BIENVENIDA/.test(app.replace(/\s+/g, ''))) {
  console.log('  ✗ la advertencia asistiva no excluye la bienvenida'); fallos++;
} else {
  console.log('✓ la bienvenida no arrastra la advertencia asistiva');
}

// ── El script de la compuerta debe estar declarado en el HTML, antes de app.js ──
const html = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');
const posSrcCompuerta = html.indexOf('compuerta-bienvenida.js');
const posSrcApp = html.indexOf('src="app.js"');
if (posSrcCompuerta === -1 || posSrcApp === -1 || posSrcCompuerta > posSrcApp) {
  console.log('  ✗ index.html no carga compuerta-bienvenida.js antes de app.js'); fallos++;
} else {
  console.log('✓ index.html carga la compuerta antes de app.js');
}

console.log(fallos === 0 ? '\nRESULTADO: sin fallos' : '\nRESULTADO: ' + fallos + ' fallos');
process.exit(fallos === 0 ? 0 : 1);
