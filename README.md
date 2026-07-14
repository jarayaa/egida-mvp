# 🛡️ ÉGIDA — MVP no-code

<div align="center">

![MVP](https://img.shields.io/badge/Fase_2-MVP_no--code-30d158?style=for-the-badge)
![Validación](https://img.shields.io/badge/Validación-16%2F16_sin_alucinaciones-0a84ff?style=for-the-badge)
![NTSIC](https://img.shields.io/badge/DS_N°7/2023-NTSIC-5e5ce6?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Portal de Autogestión de Madurez y Cumplimiento Normativo en Ciberseguridad para órganos de la Administración del Estado de Chile**

[🌐 **Ver el MVP en vivo →**](https://jarayaa.github.io/egida-mvp/)

*ACIF3003 — Proyecto de Innovación | UNAB — Jaime Araya Aros*

</div>

---

## 📖 ¿Qué es este repositorio?

Es el **MVP no-code de ÉGIDA** (validación de Fase 2), preservado como un portal ligero y autocontenido en GitHub Pages.

El MVP se construyó originalmente con herramientas **no-code**:

- **Softr** — el portal (formularios de autodiagnóstico, vistas, roles) se armó sin escribir código.
- **Chatbase** — el asistente normativo (agente RAG con base de conocimiento + prompt de citación) es genuinamente no-code y **sigue en vivo**, embebido en la pestaña «Asistente».

> ⚠️ **Por qué existe este repositorio:** la suscripción de **Softr es de pago** y está por expirar. Para no perder el MVP no-code (requisito de la entrega), esta página **preserva la experiencia del portal** en GitHub Pages —gratuito y permanente— manteniendo embebido el agente RAG de Chatbase, que es el componente no-code central y sigue operativo. Es una **instantánea de preservación**, no un intento de hacer pasar código por no-code: el portal aquí es una página estática que replica el flujo del MVP; la IA embebida es la pieza no-code real.

---

## 🧪 Qué demuestra el MVP

| Capacidad | Detalle |
|-----------|---------|
| 🎯 **Autodiagnóstico determinístico** | 20 controles críticos del Anexo A NCh-ISO 27001 (4 por función NTSIC) con cálculo real del Índice de Madurez Institucional: **IMI = (Σ niveles / 60) × 100**. |
| 🤖 **Asistente normativo (RAG)** | Responde citando instrumento y artículo, distingue OIV, aplica plazos con sus condiciones y rechaza consultas fuera del corpus, con advertencia de validación humana. |
| 🏛️ **Enfoque de sector público** | Trazable, auditable y verificable: el diagnóstico es 100% determinístico; la IA solo asiste. |

**Resultado de la validación:** 16/16 consultas respondidas con citas correctas y **0 alucinaciones**.

---

## 🔄 De MVP a producto

Validado el concepto con este MVP no-code, ÉGIDA se reconstruyó como **producto codificado**:

- **Backend**: Java 21 + Spring Boot 3, RAG propio sobre PostgreSQL 16 + pgvector.
- **Frontend**: React 18 + TypeScript + Vite.
- **Despliegue**: Docker en un VPS ARM64 con túnel Cloudflare (Zero Trust).
- **Alcance ampliado**: de 20 a 45 controles en el autodiagnóstico.

🔗 **Producto final en vivo:** [egida.uk](https://egida.uk)

---

## 🏗️ Tecnología de esta preservación

| Aspecto | Detalle |
|---------|---------|
| Archivo | `index.html` único, autocontenido (logo embebido como data URI) |
| Hosting | GitHub Pages (estático, gratuito) |
| IA | iframe del agente RAG de Chatbase (no-code, en vivo) + modo offline con respuestas de la validación |
| Cálculo IMI | Determinístico en JavaScript (replica la lógica del MVP) |
| Tema visual | macOS dark, paleta NTSIC, identidad de la marca ÉGIDA |

---

## 🔗 Enlaces

| | |
|---|---|
| 🧪 **MVP no-code (este repo)** | [jarayaa.github.io/egida-mvp](https://jarayaa.github.io/egida-mvp/) |
| 🔒 **Producto final** | [egida.uk](https://egida.uk) |
| 🎭 **Maqueta del producto** | [jarayaa.github.io/egida-demo](https://jarayaa.github.io/egida-demo/) |
| 🤖 **Agente RAG (Chatbase)** | embebido en la pestaña «Asistente» |

---

## 📜 Normativa de referencia

- **DS N°7/2023** — Norma Técnica de Seguridad de la Información y Ciberseguridad (NTSIC)
- **DS N°295/2024** — Reporte obligatorio de incidentes de ciberseguridad
- **Res. Ex. N°7/2025 ANCI** — Taxonomía de incidentes
- **Res. Ex. N°87/2025 ANCI** — Nómina de Operadores de Importancia Vital (OIV)
- **NCh-ISO 27001** — Controles del Anexo A

---

<div align="center">

**ACIF3003 — Proyecto de Innovación en Ingeniería Civil Informática**

Universidad Andrés Bello | 2026

🛡️ *Bajo la égida de la ciberseguridad* 🛡️

</div>
