# PDR / PRD UX UI

## PWA Tarot Fast Search + Card Photo Matcher

## 1. Nombre tentativo

**Tarot Fast Search**

Alternativas:

* **Carta Clara**
* **Tarot en 3 segundos**
* **Arcana Search**
* **Tarot Snap**
* **Mazo Finder**

Recomendación: **Tarot Fast Search** si querés algo funcional. **Carta Clara** si querés algo más emocional y bonito.

---

## 2. Resumen del producto

Una **PWA mobile-first para iPhone** que permite buscar rápidamente el significado de cartas de tarot durante una tirada física.

La app debe funcionar como un **diccionario ultra rápido + buscador fuzzy + reconocedor visual de cartas por foto**, sin AI generativa. El usuario puede escribir el nombre de una carta en español o inglés, buscar por número, palo o palabra clave, o sacar una foto de 1 a 3 cartas físicas para que la app las matchee contra una base visual de cartas.

El objetivo principal es que una persona principiante encuentre el significado útil de una carta en **menos de 3 segundos**.

---

## 3. Usuario principal

### Persona principal

**Usuario:** novia del dueño del producto
**Nivel:** primer día aprendiendo tarot
**Contexto:** tiene un mazo físico sobre la mesa
**Necesidad:** entender rápido qué significa una carta que salió en una tirada
**Dolor:** no sabe nombres, palos, arcanos, ni diferencias entre derecha/invertida
**Dispositivo:** iPhone
**Formato:** PWA instalada o abierta desde Safari
**Momento de uso:** mientras está con cartas reales enfrente

---

## 4. Objetivo principal del producto

La app debe permitir:

> “Tengo 1, 2 o 3 cartas físicas frente a mí. Quiero encontrar qué significan ya, sin estudiar una enciclopedia.”

### North Star Metric

**Tiempo desde intención hasta significado útil:** menos de **3 segundos**.

Esto incluye:

* abrir app
* buscar o fotografiar carta
* ver resultado
* entender significado básico

---

## 5. Principios de UX

### 5.1 Velocidad primero

La app no debe sentirse como una web de contenido. Debe sentirse como **Spotlight/Search de iPhone para tarot**.

Regla: si una interacción no ayuda a encontrar significado más rápido, se elimina o se oculta.

---

### 5.2 Belleza sin fricción

Estética moderna/mística, pero sin sacrificar velocidad. Nada de intros lentos, animaciones pesadas, pantallas ornamentales ni loaders innecesarios.

El mood visual debe ser:

* moderno
* oscuro o semioscuro
* místico sutil
* legible
* táctil
* elegante
* liviano

---

### 5.3 Información en capas

No mostrar todo de golpe.

Cada carta debe tener tres niveles:

1. **1 línea:** significado inmediato.
2. **10 segundos:** explicación breve.
3. **Profundo:** detalles por amor, trabajo, dinero, consejo, sombra, asociaciones.

---

### 5.4 Principiante-friendly

La app no debe asumir que el usuario sabe qué es un arcano, un palo, una corte o una carta invertida.

Debe usar microcopy simple:

* “Derecha”
* “Invertida”
* “Amor”
* “Trabajo”
* “Consejo”
* “Sí/No”
* “Parecidas”

Evitar términos como “arquetipo junguiano” en la capa rápida.

---

### 5.5 Cero culpa, cero solemnidad

La app debe enseñar sin hacer sentir tonta a la persona.

Ejemplo de tono:

> “La Luna suele hablar de confusión, intuición y cosas que todavía no se ven claras.”

No:

> “Este arcano implica una dimensión inconsciente compleja de simbolismo lunar.”

---

## 6. Alcance del MVP

### Incluido en MVP

1. PWA mobile-first para iPhone.
2. Base de datos de 78 cartas.
3. Búsqueda instantánea.
4. Fuzzy search español/inglés.
5. Búsqueda por número.
6. Búsqueda por palo.
7. Búsqueda por keywords.
8. Vista rápida de carta.
9. Significado derecha/invertida visible.
10. Imagen miniatura de carta.
11. Filtros livianos.
12. Favoritos.
13. Historial reciente.
14. Copiar significado.
15. Modo foto para reconocer 1 a 3 cartas.
16. Matching visual sin AI generativa.
17. Offline-first para base textual e imágenes optimizadas.

### No incluido en MVP

1. Login.
2. Comunidad.
3. Lecturas automáticas generadas.
4. AI tarot reader.
5. Chatbot.
6. Marketplace de mazos.
7. Tiradas digitales.
8. Sacar carta aleatoria.
9. Astrología avanzada como flujo principal.
10. Cursos largos.

---

## 7. Propuesta de navegación

### Bottom navigation

La PWA debe tener navegación inferior con 4 tabs:

1. **Buscar**
2. **Foto**
3. **Cartas**
4. **Guardadas**

### Tab 1: Buscar

Pantalla principal.

Debe abrir directamente con:

* input enfocado o muy prominente
* placeholder útil
* chips rápidos
* resultados instantáneos

### Tab 2: Foto

Modo cámara para reconocer cartas físicas.

### Tab 3: Cartas

Grilla de las 78 cartas.

### Tab 4: Guardadas

Favoritos + historial + cartas marcadas para repasar.

---

## 8. Home / Fast Search

### Objetivo

Que el usuario pueda buscar una carta en menos de 3 segundos.

### Layout recomendado

Arriba:

```text
¿Qué carta salió?
[ Buscar carta, número o keyword... ]
```

Debajo, chips compactos:

```text
Todos | Mayores | Copas | Espadas | Bastos | Oros
```

Después:

```text
Recientes
La Luna · 3 de Espadas · La Emperatriz
```

Después:

```text
Cartas populares
La Torre · La Muerte · El Loco · Los Enamorados
```

### Comportamiento del buscador

Debe soportar:

* “luna”
* “la luna”
* “moon”
* “the moon”
* “muerte”
* “death”
* “13”
* “xiii”
* “3 espadas”
* “tres de espadas”
* “three of swords”
* “as copas”
* “ace cups”
* typos: “emperatris”, “empratriz”, “empress”
* palabras clave: “confusion”, “intuición”, “ruptura”, “amor”, “trabajo”

### Ranking de resultados

Prioridad:

1. Match exacto de nombre.
2. Match por alias español/inglés.
3. Match por número romano/arábigo.
4. Match por palo.
5. Match por keyword.
6. Match por significado.
7. Match fuzzy por typo.

---

## 9. Resultado de búsqueda

### Resultado como card compacta

Cada resultado debe verse así:

```text
[mini imagen] La Luna
Confusión · intuición · cosas ocultas
Derecha: No todo está claro todavía.
Invertida: La confusión empieza a despejarse.
```

Acciones rápidas:

* Ver
* Copiar
* Guardar

### Resultado principal destacado

Cuando hay un match fuerte, mostrar arriba una card grande:

```text
La Luna
Confusión, intuición, incertidumbre

Derecha
No todo está claro. Prestá atención a señales, emociones y dudas.

Invertida
La niebla empieza a levantarse. Algo que estaba confuso empieza a entenderse.
```

---

## 10. Pantalla de detalle de carta

### Estructura ideal

1. Imagen de carta.
2. Nombre español + inglés.
3. Keywords.
4. Derecha/invertida visibles.
5. Resumen de 1 línea.
6. Significado de 10 segundos.
7. Contextos: amor, trabajo, dinero, consejo.
8. Cartas relacionadas.
9. Asociaciones opcionales.
10. Acciones.

### Wireframe textual

```text
← Buscar

[Imagen carta]

La Luna
The Moon · Arcano Mayor XVIII

Confusión · intuición · sueños · cosas ocultas

[DERECHA] [INVERTIDA]

Resumen
No todo está claro todavía. La carta invita a escuchar la intuición sin sacar conclusiones apresuradas.

En 10 segundos
La Luna aparece cuando hay dudas, emociones mezcladas o información incompleta. No significa algo malo necesariamente: significa que hay que mirar mejor.

Amor
Puede hablar de inseguridad, idealización o señales confusas.

Trabajo
Puede indicar falta de claridad, rumores o decisiones con poca información.

Consejo
No fuerces una respuesta. Observá, preguntá y esperá más claridad.

Parecidas
La Sacerdotisa · Siete de Copas · El Colgado

[Copiar significado] [Guardar] [Marcar para repasar]
```

---

## 11. Derecha / invertida

No usar un switch chico. Para una principiante, “upright/reversed” puede ser confuso.

Usar segmented control grande:

```text
[DERECHA] [INVERTIDA]
```

Pero en la vista rápida mostrar ambas, porque durante una tirada puede necesitar comparar rápido.

### Regla UX

* En cards de búsqueda: mostrar ambas resumidas.
* En detalle: una seleccionada por defecto, con botón grande para cambiar.
* Si viene desde foto, detectar orientación si es posible y preseleccionar derecha/invertida.

---

## 12. Modo foto

### Objetivo

La usuaria tiene 1 a 3 cartas físicas sobre la mesa. Abre la app, toca “Foto”, apunta, y la app identifica cartas probables.

### Flujo

1. Toca tab **Foto**.
2. La cámara abre con overlay.
3. Microcopy:

```text
Enfocá 1 a 3 cartas
```

4. La app detecta rectángulos.
5. Captura automáticamente o con botón.
6. Recorta cada carta.
7. Corrige perspectiva.
8. Compara contra templates.
9. Muestra resultados:

```text
Detecté:
La Luna · 92%
Tres de Espadas · 88%
La Emperatriz · 83%
```

10. Usuario confirma o corrige.
11. App muestra significados rápidos de las 1 a 3 cartas.

### UX de resultado de foto

```text
Cartas detectadas

[La Luna] 92%
Confusión · intuición · cosas ocultas

[3 de Espadas] 88%
Dolor · ruptura · verdad difícil

[La Emperatriz] 83%
Cuidado · abundancia · creación

[Ver juntas] [Corregir]
```

---

## 13. Reconocimiento visual sin AI

### Enfoque técnico recomendado

Usar computer vision clásico:

1. Cámara con `getUserMedia`.
2. Canvas para procesar frame.
3. Detección de bordes/contornos.
4. Detección de rectángulos.
5. Corrección de perspectiva.
6. Normalización de imagen:

   * escala
   * contraste
   * grayscale
   * crop
7. Matching contra templates locales:

   * ORB descriptors
   * Brute Force Matcher
   * perceptual hash como fallback
   * template matching si el encuadre es frontal

OpenCV documenta matching con ORB descriptors y Brute Force Matching; esto encaja bien con “sin AI” porque no requiere modelo entrenado ni interpretación generativa. ([OpenCV Documentation][4])

### Importante

El reconocimiento visual sin AI funciona mucho mejor si la app tiene imágenes del **mismo mazo físico**.

Si el mazo de tu novia es Rider-Waite clásico, se puede usar una librería de templates del mismo estilo. Si el mazo es distinto, conviene crear un “perfil de mazo” fotografiando o cargando las 78 cartas una vez.

### MVP de foto

Para no trabarse:

* V1: foto manual, detección de carta única.
* V1.1: 1 a 3 cartas.
* V1.2: detección automática de orientación.
* V1.3: calibración del mazo físico.

---

## 14. Limitaciones PWA iPhone

La PWA puede usar cámara mediante APIs web de medios, pero iOS puede tener diferencias entre Safari y una PWA instalada. MDN documenta que `getUserMedia()` solicita permiso para usar cámara/micrófono y devuelve un stream de media; para la instalación PWA, web.dev advierte que en Apple cada instalación puede tener almacenamiento aislado. ([MDN Web Docs][5])

### Decisión de producto

El modo foto debe tener fallback:

1. **Cámara en vivo**, ideal.
2. **Subir foto desde galería**, fallback.
3. **Buscar manualmente**, siempre disponible.

Nunca depender 100% de cámara para que la app sea útil.

---

## 15. Base de datos de cartas

Cada carta debe tener este schema:

```json
{
  "id": "the_moon",
  "name_es": "La Luna",
  "name_en": "The Moon",
  "arcana": "major",
  "number": 18,
  "roman": "XVIII",
  "suit": null,
  "rank": null,
  "aliases": ["luna", "moon", "the moon", "arcano 18", "xviii", "18"],
  "keywords_upright": ["confusión", "intuición", "sueños", "cosas ocultas"],
  "keywords_reversed": ["claridad", "miedo liberado", "verdad revelada"],
  "one_line_upright": "No todo está claro todavía: escuchá tu intuición.",
  "one_line_reversed": "La confusión empieza a despejarse.",
  "quick_upright": "La Luna aparece cuando hay dudas, emociones mezcladas o información incompleta.",
  "quick_reversed": "Invertida, puede mostrar que una verdad empieza a salir a la luz.",
  "love_upright": "Puede indicar inseguridad, idealización o señales confusas.",
  "love_reversed": "Puede traer conversaciones que aclaran dudas.",
  "work_upright": "Falta información para decidir con seguridad.",
  "work_reversed": "Algo confuso empieza a ordenarse.",
  "money_upright": "No es buen momento para decisiones impulsivas.",
  "money_reversed": "Podés ver mejor un riesgo que antes estaba oculto.",
  "advice_upright": "No fuerces una conclusión. Observá más.",
  "advice_reversed": "Confiá en la claridad que empieza a aparecer.",
  "yes_no": "No claro / esperar",
  "related_cards": ["the_high_priestess", "seven_of_cups", "the_hanged_man"],
  "image": "/cards/the_moon.webp",
  "template_image": "/templates/the_moon.webp"
}
```

---

## 16. Search UX técnico

### Motor recomendado

Para MVP:

* **MiniSearch** si querés búsqueda local robusta con prefijos, fuzzy, ranking y offline.
* **Fuse.js** si querés implementación más simple y flexible.

MiniSearch declara soporte para prefix search, fuzzy search, ranking, field boosting y operación en memoria/offline; Fuse.js usa fuzzy search aproximado para tolerar errores de tipeo. ([Luca Ong][3])

### Campos indexados

Indexar con pesos:

```text
name_es: 10
name_en: 10
aliases: 9
number: 8
roman: 8
keywords_upright: 7
keywords_reversed: 7
suit: 6
one_line: 5
quick_meaning: 3
contexts: 2
```

### Requisito de performance

* Resultados visibles en menos de 100 ms después de escribir.
* Búsqueda local, sin request al servidor.
* Base precargada.
* Imágenes lazy-loaded.
* Primer render en menos de 1 segundo.

---

## 17. UI visual

### Dirección estética

**Moderna/mística, brutalmente rápida.**

No “bruja barroca pesada”. Más bien:

* fondo oscuro profundo
* cards translúcidas sutiles
* tipografía clara
* íconos mínimos
* detalles dorados o violetas muy dosificados
* imágenes chicas en búsqueda
* imágenes grandes solo en detalle

### Paleta sugerida

```text
Background: #0E0B16
Surface: #171322
Surface elevated: #211A31
Primary: #D8B46A
Secondary: #8E7CFF
Text primary: #F7F1E8
Text secondary: #B9ADC9
Danger/Intense: #E87A7A
Success/Clarity: #91D6A3
```

### Tipografía

* Títulos: elegante pero legible.
* Texto principal: sans moderna.
* Evitar fuentes demasiado decorativas en contenido.

Ejemplo:

* Headings: `Fraunces`, `Cormorant`, o similar.
* Body: `Inter`, `SF Pro`, `Nunito Sans`.

En iPhone, priorizar legibilidad: mínimo 16 px en textos importantes.

---

## 18. Componentes UI

### Search bar

Debe ser el componente más importante.

Características:

* sticky arriba
* alto mínimo 52 px
* icono search
* clear button
* placeholder contextual
* input grande

Placeholder recomendado:

```text
Buscar carta, número o keyword...
```

Alternativas:

```text
Ej: Luna, 3 espadas, amor, XVIII...
```

### Chips

Chips pequeños, horizontales, scroll suave:

```text
Todos · Mayores · Copas · Espadas · Bastos · Oros
```

No más de una fila visible.

### Card de resultado

Debe tener:

* miniatura
* nombre
* keywords
* derecha/invertida mini
* acción rápida

### Card rápida de significado

Para cuando se toca una carta:

```text
La Torre
Cambio brusco · ruptura · revelación

Derecha: Algo se rompe para mostrar la verdad.
Invertida: Resistencia al cambio o crisis evitada.

[Ver más] [Copiar]
```

---

## 19. Grilla de cartas

### Objetivo

Permitir explorar visualmente las 78 cartas.

### Layout

* 3 columnas en iPhone.
* Mini imagen.
* Nombre corto.
* Agrupación por:

  * Arcanos Mayores
  * Copas
  * Espadas
  * Bastos
  * Oros

### Interacciones

* tap abre detalle
* long press guarda
* filter chips arriba

---

## 20. Favoritos e historial

### Favoritos

Para guardar cartas difíciles.

Campos:

* carta
* fecha guardada
* nota opcional
* estado: aprendida / repasar

### Historial

Mostrar últimas búsquedas:

```text
Hoy
La Luna
Tres de Espadas
La Emperatriz
```

### Estados de aprendizaje

Opcional, pero útil:

```text
No la entiendo
Repasar
Aprendida
```

No debe molestar durante el uso principal.

---

## 21. Modo “tirada física”

Como ella tiene mazo físico, no necesitamos generar tiradas digitales.

Pero sí necesitamos una vista para ver juntas 1 a 3 cartas reconocidas o buscadas.

### Flujo

1. Busca o fotografía carta.
2. Agrega a “tirada actual”.
3. Repite hasta 3.
4. Ve resumen combinado simple.

### Vista

```text
Tirada actual

1. La Luna
Confusión / intuición

2. Tres de Espadas
Dolor / verdad difícil

3. La Emperatriz
Cuidado / creación

Resumen simple
Hay emociones confusas, una verdad que puede doler, pero también posibilidad de cuidado y crecimiento.
```

### Nota importante

No usar AI para interpretar la combinación en MVP. Puede ser una composición por reglas:

* concatenar significados
* mostrar temas repetidos
* detectar keywords comunes
* mostrar consejo general predefinido

---

## 22. Contenido: tono y estructura

### Tono

Simple, directo, cálido.

Debe sonar como:

> “Esto suele hablar de…”

No como:

> “Esto predice inevitablemente…”

### Regla de escritura

Cada explicación rápida debe tener:

* máximo 160 caracteres para una línea
* máximo 450 caracteres para explicación de 10 segundos
* lenguaje de persona normal
* cero párrafos gigantes

### Ejemplo

```text
La Muerte
Cambio · cierre · transformación

Derecha
Algo termina para que otra cosa pueda empezar. No suele hablar de muerte literal, sino de transformación.

Invertida
Puede indicar resistencia a cerrar una etapa o miedo al cambio.
```

---

## 23. Campos por carta

Cada carta debería tener:

1. Nombre español.
2. Nombre inglés.
3. Número.
4. Arcano/palo.
5. Imagen.
6. Keywords derecha.
7. Keywords invertida.
8. Significado 1 línea derecha.
9. Significado 1 línea invertida.
10. Significado 10 segundos derecha.
11. Significado 10 segundos invertida.
12. Amor derecha.
13. Amor invertida.
14. Trabajo derecha.
15. Trabajo invertida.
16. Dinero derecha.
17. Dinero invertida.
18. Consejo derecha.
19. Consejo invertida.
20. Sí/No.
21. Cartas relacionadas.
22. Asociaciones opcionales.
23. Aliases español/inglés.
24. Tags de búsqueda.

---

## 24. Requisitos funcionales

### RF1 — Búsqueda instantánea

El sistema debe mostrar resultados mientras el usuario escribe.

### RF2 — Fuzzy search

El sistema debe tolerar typos y variantes en español/inglés.

### RF3 — Búsqueda bilingüe

El usuario puede buscar “The Moon” o “La Luna”.

### RF4 — Búsqueda por número

El usuario puede buscar “18”, “XVIII” o “arcano 18”.

### RF5 — Búsqueda por keywords

El usuario puede buscar “ruptura”, “intuición”, “trabajo”, “amor”.

### RF6 — Vista rápida

El usuario puede entender la carta sin abrir detalle.

### RF7 — Derecha/invertida

El sistema debe mostrar ambos significados o permitir alternarlos fácilmente.

### RF8 — Copiar significado

El usuario puede copiar un resumen para compartir.

### RF9 — Favoritos

El usuario puede guardar cartas.

### RF10 — Historial

El sistema recuerda últimas cartas consultadas.

### RF11 — Foto

El usuario puede capturar 1 a 3 cartas físicas.

### RF12 — Matching visual

El sistema intenta identificar cartas por imagen sin AI generativa.

### RF13 — Corrección manual

El usuario puede corregir si la detección falla.

### RF14 — Offline

El usuario puede buscar significados sin internet después de la primera carga.

### RF15 — PWA installable

La app debe poder agregarse a Home Screen en iPhone.

---

## 25. Requisitos no funcionales

### Performance

* Search local en menos de 100 ms.
* App usable en menos de 1 segundo después de abrir.
* Assets iniciales menores a lo razonable para PWA mobile.
* Imágenes WebP/AVIF comprimidas.
* Lazy loading en grilla.

### Accesibilidad

* Contraste alto.
* Tap targets mínimo 44 px.
* Texto mínimo 16 px.
* No depender solo de color.
* Labels claros.
* Soporte para modo reducido de movimiento.

### Offline

* Cachear:

  * shell de app
  * JSON de cartas
  * thumbnails
  * favoritos
  * historial
* No cachear imágenes pesadas en primer load si perjudica velocidad.

### Privacidad

* Las fotos deben procesarse localmente en el dispositivo cuando sea posible.
* No subir fotos por defecto.
* Sin login en MVP.

---

## 26. Estados clave

### Empty state del buscador

```text
Buscá una carta
Probá “La Luna”, “3 espadas”, “amor” o “XVIII”.
```

### No results

```text
No encontré esa carta.
Probá con nombre, número o una palabra como “amor”.
```

Sugerir resultados parecidos.

### Cámara sin permiso

```text
Necesito acceso a la cámara para reconocer cartas.
También podés subir una foto o buscar manualmente.
```

### Matching con baja confianza

```text
No estoy segura de esta carta.
¿Es alguna de estas?
```

Mostrar 3 opciones.

### Offline

```text
Modo offline
Podés seguir buscando significados guardados.
```

---

## 27. MVP flow ideal

### Buscar manual

1. Abre app.
2. Ve buscador.
3. Escribe “luna”.
4. Aparece “La Luna” al primer resultado.
5. Lee resumen derecha/invertida.
6. Toca si quiere ver más.

Tiempo esperado: **2–3 segundos**.

### Buscar por foto

1. Abre app.
2. Toca Foto.
3. Apunta a 3 cartas.
4. App detecta cartas.
5. Muestra resultados con significado corto.
6. Usuario toca una carta si quiere profundidad.

Tiempo esperado ideal: **5–8 segundos** en MVP.
Meta futura: **3–5 segundos**.

---

## 28. Feature prioritization

### P0 — Imprescindible

* Base de 78 cartas.
* Buscador instantáneo.
* Español/inglés.
* Fuzzy search.
* Vista rápida.
* Derecha/invertida.
* PWA mobile-first.
* Performance brutal.
* Imágenes optimizadas.
* Historial reciente.

### P1 — Muy importante

* Modo foto carta única.
* Favoritos.
* Copiar significado.
* Grilla de 78 cartas.
* Filtros por palo/arcano.
* Búsqueda por número.

### P2 — Nice to have

* Foto de 1 a 3 cartas.
* Detección de orientación.
* Tirada actual.
* Cartas relacionadas.
* Estados de aprendizaje.
* Asociaciones astrológicas/simbólicas.

### P3 — Futuro

* Perfil de mazo personalizado.
* Calibración visual de mazo.
* Exportar tirada.
* Widget de iOS si algún día se hace nativa.
* AI opcional, no MVP.

---

## 29. Diseño recomendado de información rápida

Para cada carta, la primera vista debe priorizar:

```text
Nombre
Keywords
Derecha: 1 línea
Invertida: 1 línea
```

No empezar con historia, simbolismo ni párrafos largos.

### Ejemplo

```text
Tres de Espadas
Dolor · ruptura · verdad difícil

Derecha
Una verdad duele, pero permite ver algo con claridad.

Invertida
Empieza la sanación después de una herida emocional.
```

---

## 30. Métricas de éxito

### Métricas principales

1. Tiempo medio hasta primer resultado.
2. Tiempo medio hasta significado leído.
3. Porcentaje de búsquedas con resultado.
4. Porcentaje de búsquedas corregidas.
5. Uso de foto vs búsqueda manual.
6. Tiempo de carga inicial.
7. Retención de 7 días.
8. Cartas guardadas.
9. Repetición de uso durante tiradas.

### Objetivos iniciales

```text
Primer resultado visible: <100 ms
Significado útil manual: <3 s
Carga inicial: <1 s ideal / <2 s aceptable
Búsquedas exitosas: >90%
Foto carta única: >80% precisión en buena luz
Foto 1–3 cartas: >65% precisión MVP
```

---

## 31. Riesgos

### Riesgo 1: reconocimiento visual falla

Mitigación:

* búsqueda manual siempre visible
* corrección manual rápida
* mostrar top 3 candidatos
* empezar con carta única

### Riesgo 2: PWA en iPhone tiene problemas con cámara

Mitigación:

* fallback a subir foto
* fallback a búsqueda manual
* no hacer que foto sea el único camino

### Riesgo 3: la app se vuelve demasiado cargada

Mitigación:

* ocultar contenido profundo
* usar progressive disclosure
* chips limitados
* card rápida primero

### Riesgo 4: base de significados demasiado larga

Mitigación:

* límite de caracteres por nivel
* capas 1 línea / 10 segundos / profundo
* revisión editorial

---

## 32. Recomendación final de UX

La app debería abrir así:

```text
¿Qué carta salió?

[ Buscar carta, número o keyword... ]

[Foto] [Mayores] [Copas] [Espadas] [Bastos] [Oros]

Recientes
La Luna · La Torre · 3 de Espadas

Populares
La Muerte · El Loco · Los Enamorados
```

Y cuando busca:

```text
La Luna
Confusión · intuición · cosas ocultas

Derecha
No todo está claro todavía. Escuchá tu intuición.

Invertida
La confusión empieza a despejarse.

[Copiar] [Ver más] [Guardar]
```

El producto ideal no es “una web de tarot”. Es un **radar de significado**. Abre, busca, entiende, sigue la tirada. Velocidad ante todo, pero con ese toque místico lindo que hace que usarla dé ganas.

[1]: https://biddytarot.com/tarot-card-meanings/?utm_source=chatgpt.com "Tarot Card Meanings"
[2]: https://web.dev/learn/pwa/service-workers?utm_source=chatgpt.com "Service workers"
[3]: https://lucaong.github.io/minisearch/?utm_source=chatgpt.com "MiniSearch"
[4]: https://docs.opencv.org/4.x/dc/dc3/tutorial_py_matcher.html?utm_source=chatgpt.com "OpenCV: Feature Matching"
[5]: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia?utm_source=chatgpt.com "MediaDevices: getUserMedia() method - Web APIs | MDN"

