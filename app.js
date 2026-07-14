'use strict';
// ÉGIDA · MVP no-code — lógica del portal.
// Externalizado (sin JS inline ni manejadores on* en el HTML) para permitir una
// Content-Security-Policy estricta: script-src 'self' (sin 'unsafe-inline').

// ── 20 controles críticos del MVP (4 por función NTSIC) ──
const CONTROLES=[
["A.7.1.1","¿Existe un inventario actualizado y completo de los activos de información?","IDENTIFICAR"],
["A.7.2.1","¿La información se clasifica según sensibilidad y criticidad conforme a directrices formales?","IDENTIFICAR"],
["A.6.1.3","¿Están asignadas formalmente las responsabilidades de seguridad (RIS y RAI designados)?","IDENTIFICAR"],
["A.15.1.1","¿Se identifica y documenta la normativa aplicable (DS N°7/2023, DS N°295/2024, Ley N°21.663)?","IDENTIFICAR"],
["A.11.2.1","¿Existe un proceso formal de alta y baja de usuarios para el acceso a sistemas?","PROTEGER"],
["A.10.5.1","¿Se realizan respaldos periódicos de la información y se prueban según política?","PROTEGER"],
["A.8.2.2","¿El personal recibe capacitación y sensibilización periódica en seguridad de la información?","PROTEGER"],
["A.10.4.1","¿Existen controles de detección y prevención contra código malicioso?","PROTEGER"],
["A.10.10.1","¿Se generan y conservan registros de auditoría (logs) de eventos de seguridad?","DETECTAR"],
["A.10.10.2","¿Se monitorea el uso de los sistemas de procesamiento de información?","DETECTAR"],
["A.13.1.1","¿Existen canales formales para informar los eventos de seguridad lo antes posible?","DETECTAR"],
["A.13.1.2","¿El personal, contratistas y terceros reportan las debilidades observadas o sospechadas?","DETECTAR"],
["A.13.2.1","¿Existen responsabilidades y procedimientos para una respuesta rápida y metódica a incidentes?","RESPONDER"],
["A.13.2.2","¿Se cuantifican y monitorean los tipos, volúmenes y costos de los incidentes?","RESPONDER"],
["A.13.2.3","¿Se recolecta y preserva evidencia de incidentes de forma compatible con acciones legales?","RESPONDER"],
["A.6.1.6","¿Existen contactos formales con autoridades y flujo de reporte al CSIRT Nacional (plazos DS N°295/2024)?","RESPONDER"],
["A.14.1.1","¿Existe un proceso de gestión de continuidad del negocio que aborde la seguridad de la información?","RECUPERAR"],
["A.14.1.3","¿Los planes de continuidad incorporan la seguridad de la información?","RECUPERAR"],
["A.14.1.4","¿Existe un marco de planificación que priorice la restauración de servicios esenciales?","RECUPERAR"],
["A.14.1.5","¿Los planes de continuidad se prueban y actualizan periódicamente?","RECUPERAR"]];
const NIVELES_EJEMPLO=[2,1,2,1,2,1,1,1,1,0,1,1,1,0,1,0,0,0,0,0];
const FUNCIONES=["IDENTIFICAR","PROTEGER","DETECTAR","RESPONDER","RECUPERAR"];
const COLOR_FN={IDENTIFICAR:"#0a84ff",PROTEGER:"#5e5ce6",DETECTAR:"#64d2ff",RESPONDER:"#ff9f0a",RECUPERAR:"#30d158"};
const ADVERTENCIA="Esta respuesta constituye apoyo normativo y requiere validación humana; no reemplaza la decisión institucional.";
const NO_COBERTURA="Esta materia no está cubierta por el corpus normativo indexado; consulte la fuente oficial.";

const QA=[
 {claves:["denegación","denegacion","plazos","dos","reporte"],
  q:"¿Qué plazos de reporte aplican si un servicio público sufre una denegación de servicio?",
  r:"Si el hecho tiene efecto significativo (DS N°295/2024, art. 3), la denegación de servicio está comprendida en la taxonomía como “indisponibilidad y/o denegación de servicio” (Resolución Exenta N°7/2025 de la ANCI, art. 5).\n\nPlazos aplicables:\n1) Alerta temprana: dentro de 3 horas desde que la institución tomó conocimiento (DS N°295/2024, art. 9).\n2) Segundo reporte: dentro de 72 horas desde el conocimiento (art. 10). Si la institución es OIV y ve afectada la prestación de sus servicios esenciales, la actualización debe entregarse en 24 horas (art. 10).\n3) Plan de acción: solo OIV, en un plazo no superior a 7 días corridos (art. 11).\n4) Informe final: dentro de 15 días corridos desde el envío de la alerta temprana, si el incidente fue gestionado (art. 12); si no, informes parciales cada 15 días (art. 13)."},
 {claves:["bancoestado","banco del estado","oiv"],
  q:"¿El Banco del Estado de Chile figura en la nómina de Operadores de Importancia Vital?",
  r:"Sí. Banco del Estado de Chile figura en la nómina de Operadores de Importancia Vital: aparece como “BANCO DEL ESTADO DE CHILE” en la Resolución Exenta N°87/2025 de la ANCI, bajo la sección de instituciones que realizan actividades de banca, servicios financieros y medios de pago."},
 {claves:["viernes","lunes","esperar","18:00"],
  q:"Detectamos un incidente hoy viernes a las 18:00. ¿Podemos esperar al lunes para reportarlo?",
  r:"No. Si se trata de un incidente de ciberseguridad con efecto significativo, la alerta temprana debe enviarse dentro de 3 horas desde que se tomó conocimiento (DS N°295/2024, art. 9).\n\nEn la práctica: si tomaron conocimiento el viernes a las 18:00 y el incidente es reportable, el envío debe hacerse antes de las 21:00 del mismo viernes. Luego corre el segundo reporte dentro de 72 horas (art. 10)."},
 {claves:["funciones","ntsic"],
  q:"¿Cuáles son las cinco funciones de la NTSIC?",
  r:"Las cinco funciones de la NTSIC son: identificación, protección, detección, respuesta y recuperación (DS N°7/2023, arts. 7 al 11). El marco exige organizar la seguridad de la información institucional en torno a estas funciones, con roles obligatorios no externalizables (art. 5): RIS, RAI, Delegado de Ciberseguridad y la jefatura que aprueba la Política mediante acto administrativo."},
 {claves:["multa","utm","sanción","sancion"],
  q:"¿Qué multa establece el DS N°295/2024 por no reportar a tiempo?",
  r:NO_COBERTURA+"\n\n(El DS N°295/2024 regula los plazos y contenidos de los reportes; el régimen sancionatorio está en la Ley N°21.663, que no forma parte del corpus indexado de esta versión.)"},
 {claves:["capital","francia","clima","fútbol","futbol"],
  q:"¿Cuál es la capital de Francia?",
  r:NO_COBERTURA}
];

function cap(f){return f.charAt(0)+f.slice(1).toLowerCase();}
function mostrar(v){
  ["inicio","autodiagnostico","asistente"].forEach(x=>document.getElementById("vista-"+x).classList.toggle("oculto",x!==v));
  document.querySelectorAll("#menu button").forEach(b=>b.classList.toggle("activo",b.dataset.v===v));
  window.scrollTo({top:0,behavior:"smooth"});
}
function construirTabla(){
  const tb=document.querySelector("#tabla-controles tbody"); tb.innerHTML="";
  CONTROLES.forEach((c,i)=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td><strong>${c[0]}</strong></td><td class="preg">${c[1]}</td><td><span class="tag f-${c[2]}">${cap(c[2])}</span></td>
    <td><select data-i="${i}">${[0,1,2,3].map(n=>`<option ${n===NIVELES_EJEMPLO[i]?"selected":""}>${n}</option>`).join("")}</select></td>`;
    tb.appendChild(tr);
  });
  recalcular();
}
function niveles(){return [...document.querySelectorAll("#tabla-controles select")].map(s=>+s.value);}
function calcular(){
  const n=niveles(); const imi=(n.reduce((a,b)=>a+b,0)/60)*100;
  const prom={}; FUNCIONES.forEach(f=>{const idx=CONTROLES.map((c,i)=>c[2]===f?i:-1).filter(i=>i>=0);
    prom[f]=idx.reduce((a,i)=>a+n[i],0)/idx.length;});
  return {imi:Math.round(imi*10)/10, prom};
}
function fmt(x){return x.toFixed(1).replace(".",",");}
function barra(f,v){const pct=Math.max(v/3*100,4);
  return `<div class="barra-fila"><span class="nom">${cap(f)}</span><div class="barra-cont"><div class="barra" style="width:${pct}%;background:linear-gradient(90deg,${COLOR_FN[f]},#5e5ce6)">${fmt(v)}</div></div></div>`;}
function recalcular(){
  const {imi,prom}=calcular();
  document.getElementById("imi-valor").textContent=fmt(imi);
  document.getElementById("barras").innerHTML=FUNCIONES.map(f=>barra(f,prom[f])).join("");
}
function modoAsistente(m){
  document.getElementById("asistente-vivo").classList.toggle("oculto",m!=="vivo");
  document.getElementById("asistente-demo").classList.toggle("oculto",m!=="demo");
  const vivo=m==="vivo";
  const tv=document.getElementById("tab-vivo"), td=document.getElementById("tab-demo");
  tv.className=vivo?"btn":"btn sec"; td.className=vivo?"btn sec":"btn";
}
function enviar(){
  const inp=document.getElementById("pregunta"); const t=inp.value.trim(); if(!t)return;
  agregar("u",t); inp.value="";
  const tl=t.toLowerCase();
  const hit=QA.find(x=>x.claves.some(k=>tl.includes(k)));
  setTimeout(()=>agregar("a",hit?hit.r:NO_COBERTURA,true),500);
}
function agregar(tipo,txt,adv){
  const d=document.createElement("div");d.className="msg "+tipo;d.textContent=txt;
  if(adv&&txt!==NO_COBERTURA){const s=document.createElement("span");s.className="adv";s.textContent="⚠ "+ADVERTENCIA;d.appendChild(s);}
  const ch=document.getElementById("chat");ch.appendChild(d);ch.scrollTop=ch.scrollHeight;
}

// ── Cableado de eventos (sin manejadores inline, para CSP estricta) ──
document.getElementById("menu").addEventListener("click",e=>{ if(e.target.dataset.v) mostrar(e.target.dataset.v); });
document.getElementById("btn-ir-auto").addEventListener("click",()=>mostrar("autodiagnostico"));
document.getElementById("btn-ir-asist").addEventListener("click",()=>mostrar("asistente"));
document.getElementById("tab-vivo").addEventListener("click",()=>modoAsistente("vivo"));
document.getElementById("tab-demo").addEventListener("click",()=>modoAsistente("demo"));
document.getElementById("btn-enviar").addEventListener("click",enviar);
document.getElementById("pregunta").addEventListener("keydown",e=>{ if(e.key==="Enter") enviar(); });
// Delegación: los <select> del autodiagnóstico se crean dinámicamente.
document.querySelector("#tabla-controles tbody").addEventListener("change",recalcular);

// Sugerencias de consulta (asignación de propiedad, permitida por CSP).
const sug=document.getElementById("sugerencias");
QA.slice(0,4).forEach(x=>{const b=document.createElement("button");b.textContent=x.q;b.addEventListener("click",()=>{document.getElementById("pregunta").value=x.q;enviar();});sug.appendChild(b);});

construirTabla();
