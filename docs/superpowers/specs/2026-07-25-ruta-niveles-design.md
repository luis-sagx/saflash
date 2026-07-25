# Ruta de niveles y expansión de contenido — Diseño

Fecha: 2026-07-25
Proyecto: saflash (Expo / React Native / SQLite)

## Problema

Hoy la app arranca con tres slides de onboarding y deja al usuario frente a una lista
de 25 categorías sin ningún orden sugerido. No sabe por dónde empezar ni si el material
corresponde a su nivel. El contenido tampoco alcanza para acompañar un recorrido
completo: 1.115 palabras y ~530 frases, concentradas en A1–A2, con B2 casi vacío y C1
inexistente.

## Objetivo

Convertir saflash en un recorrido guiado por niveles: el usuario declara (o mide) su
nivel al inicio, la app lo ubica en un punto del camino, y avanza lección por lección.
Si el nivel le queda flojo o apretado, puede cambiarlo en cualquier momento.

## Alcance

Dentro:

- Selección de nivel en onboarding, con test de ubicación opcional.
- Ruta de lecciones (unidades por nivel) como pantalla principal.
- Pantalla de estudio por lección, con estrellas y desbloqueo.
- Cambio de nivel manual, más sugerencia automática según desempeño.
- Expansión de contenido a ~2.500 palabras, ~900 frases, ~40 categorías, niveles A1–C1.

Fuera:

- Ejercicios nuevos (quiz de opción múltiple dentro de la lección, escritura, dictado).
- Infraestructura de testing automatizado.
- Sincronización o cuentas de usuario.

## Decisiones de diseño

**La ruta es el camino principal.** Home pasa a mostrar el recorrido. Las pestañas
Palabras y Frases quedan como modo libre para explorar categorías sueltas. Un único
botón "Continuar" resuelve la pregunta "¿qué hago ahora?".

**El nivel se autodeclara, y el test es opcional.** Cuatro tarjetas cubren el 90% de los
casos sin fricción; quien quiera precisión hace diez preguntas.

**El nivel lo cambia el usuario, no la app.** La app detecta desempeño anómalo y ofrece
una sugerencia; la decisión siempre es del usuario. Un salto automático de nivel a
espaldas de quien estudia se siente como una falla, no como una ayuda.

**Una lección nunca se reprueba.** Completar las diez tarjetas desbloquea la siguiente.
El desempeño se refleja en estrellas, no en un muro. La app es para practicar, no para
examinar.

## Arquitectura

### Modelo de contenido

Jerarquía fija de tres niveles:

```
nivel (A1 … C1)
└── unidad (tema: "Saludos", "Comida", "Trabajo")
    └── lección (10 tarjetas: ~8 palabras + ~2 frases)
```

Tamaño del recorrido:

| Nivel | Unidades | Lecciones/unidad | Lecciones | Palabras | Frases |
|-------|---------:|-----------------:|----------:|---------:|-------:|
| A1    | 8        | 6                | 48        | 384      | 96     |
| A2    | 8        | 6                | 48        | 384      | 96     |
| B1    | 8        | 6                | 48        | 384      | 96     |
| B2    | 7        | 5                | 35        | 280      | 70     |
| C1    | 6        | 5                | 30        | 240      | 60     |
| **Total** |      |                  | **209**   | **1.672** | **418** |

La ruta consume las palabras más frecuentes de cada tema y nivel. Las restantes (~830
palabras, ~480 frases) siguen disponibles en modo libre. Esto es intencional: el
recorrido guiado prioriza lo de mayor rendimiento, y el modo libre da profundidad a
quien la busque.

### Esquema de base de datos

Tablas nuevas:

```sql
CREATE TABLE lessons (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  level        TEXT    NOT NULL,          -- 'A1' … 'C1'
  unit_index   INTEGER NOT NULL,          -- 0-based dentro del nivel
  lesson_index INTEGER NOT NULL,          -- 0-based dentro de la unidad
  unit_title   TEXT    NOT NULL,
  category     TEXT    NOT NULL,
  icon         TEXT,                      -- emoji
  UNIQUE(level, unit_index, lesson_index)
);

CREATE TABLE lesson_cards (
  lesson_id  INTEGER NOT NULL REFERENCES lessons(id),
  card_type  TEXT    NOT NULL,            -- 'word' | 'phrase'
  card_id    INTEGER NOT NULL,
  position   INTEGER NOT NULL,
  PRIMARY KEY (lesson_id, position)
);

CREATE TABLE lesson_progress (
  lesson_id    INTEGER PRIMARY KEY REFERENCES lessons(id),
  status       TEXT    DEFAULT 'locked',  -- 'locked' | 'unlocked' | 'completed'
  stars        INTEGER DEFAULT 0,
  accuracy     REAL    DEFAULT 0,
  completed_at TEXT
);
```

Columnas nuevas en `user_config` (vía `addColumnIfMissing`, ya existente):

```
level             TEXT    DEFAULT 'A1'
placement_done    INTEGER DEFAULT 0
current_lesson_id INTEGER
```

**Por qué `lesson_cards` se materializa.** Resolver el contenido de una lección al vuelo
con `ORDER BY frequency_rank LIMIT 8 OFFSET n` es más simple, pero cada palabra nueva que
se agregue al seed desplazaría el contenido de lecciones ya completadas: el usuario
volvería a una lección terminada y encontraría otro material. La tabla se llena una vez
en `seedRunner` y queda congelada. Las lecciones de niveles agregados después se anexan
al final sin tocar lo anterior.

### Organización de las semillas

`src/seeds/words_seed.js` (1.253 líneas) se parte por nivel:

```
src/seeds/words/a1.js   a2.js   b1.js   b2.js   c1.js   index.js
src/seeds/phrases/a1.js a2.js   b1.js   b2.js   c1.js   index.js
```

Cada archivo exporta su arreglo compacto (`[english, spanish, category, subcategory]`;
el nivel viene implícito del archivo). `index.js` concatena y aplica las funciones de
expansión que hoy viven en `words_seed.js` (`guessPhonetic`, `makeExample`, `CAT_IMG`),
que se mueven a `src/seeds/wordExpander.js` para no duplicarlas. `frequency_rank` se
asigna en el índice, en orden A1→C1, preservando el criterio actual.

A 2.500 palabras un archivo único deja de ser editable. Este corte también permite
sembrar y validar un nivel por vez.

**Compatibilidad con instalaciones existentes.** `seedRunner` ya salta el sembrado
cuando la tabla tiene filas. Se cambia a un chequeo por nivel: inserta solo las palabras
y frases de los niveles que aún no tienen filas. Un usuario con la base vieja recibe el
contenido nuevo sin perder su `user_progress`.

### Curriculum

`src/curriculum/curriculum.js` — datos puros, sin acceso a base:

```js
export const CURRICULUM = {
  A1: [
    { title: 'Primeros pasos', icon: '👋', category: 'basics',    lessons: 6 },
    { title: 'Números',        icon: '🔢', category: 'numbers',   lessons: 6 },
    // …
  ],
  // A2, B1, B2, C1
};
```

`src/curriculum/curriculumBuilder.js` — una función, `buildCurriculum(db)`:

1. Recorre `CURRICULUM` en orden de nivel y unidad.
2. Por cada lección toma las siguientes 8 palabras sin asignar de esa categoría y nivel,
   ordenadas por `frequency_rank`, y las siguientes 2 frases del mismo criterio.
3. Inserta la fila en `lessons` y las diez en `lesson_cards`.
4. Si una categoría se queda sin material, cae a la categoría `other` del mismo nivel y
   registra un aviso. El script de validación convierte ese aviso en error.

Corre una sola vez, después del sembrado, si `lessons` está vacía.

### Desbloqueo

La primera lección del nivel inicial del usuario nace en `unlocked`. Completar una
lección marca la siguiente como `unlocked` y actualiza `current_lesson_id`. Todo lo
anterior al nivel inicial queda `unlocked` también, para que quien entre en B1 pueda
bajar a repasar A1 si quiere; lo posterior queda `locked`.

## Pantallas

### Onboarding

Flujo: 3 slides actuales → `LevelPickScreen` → (opcional) `PlacementTestScreen` → MainTabs.

`LevelPickScreen`: cuatro tarjetas — *Nunca estudié* (A1), *Sé lo básico* (A2),
*Me defiendo* (B1), *Nivel alto* (B2). Debajo, un enlace secundario: "Prefiero hacer un
test rápido". C1 no se ofrece como autodeclaración: quien está en C1 lo alcanza por el
test o subiendo desde B2.

`PlacementTestScreen`: diez preguntas de opción múltiple, traducción inglés→español,
cuatro opciones. Dos preguntas por nivel, A1 a C1, generadas desde el seed: la respuesta
correcta es una palabra del nivel; los tres distractores salen de la misma categoría y
nivel, para que la pregunta mida vocabulario y no descarte por contexto.

Corte: se asigna el nivel más alto en el que acertó al menos 1 de 2, siempre que haya
acertado también en todos los niveles anteriores. Sin ningún acierto, A1. Salir a mitad
del test conserva el nivel autodeclarado.

### PathScreen

Reemplaza el contenido de `HomeScreen`. La cabecera actual (saludo, racha, meta diaria,
fila de estadísticas) se conserva arriba; debajo va el recorrido.

Lista vertical de nodos de lección, desplazados alternadamente a izquierda y derecha,
agrupados bajo una cabecera por unidad. Estados del nodo:

- **Bloqueada** — gris, sin interacción, candado.
- **Actual** — resaltada, con anillo animado.
- **Completada** — color de nivel, con sus estrellas debajo.

Un botón fijo al pie, "Continuar", navega directo a la lección actual. Al entrar, la
lista hace scroll automático a esa lección.

### StudyLessonScreen

Reutiliza `FlashCard`, `RatingButtons`, `PronunciationButton` y el servicio
`spacedRepetition` sin cambios. La única diferencia con `StudyWordsScreen` es el origen
del mazo: diez tarjetas fijas leídas de `lesson_cards`, en vez de una cola por categoría.

Las calificaciones se escriben igual en `user_progress`, así que el repaso espaciado
sigue operando y las tarjetas vuelven a aparecer en el modo libre cuando toca repasarlas.

Al terminar, `LessonSummary` (extiende el `SessionSummary` existente) muestra estrellas:

- 3 estrellas si el 80% o más se calificó "Fácil"
- 2 estrellas desde 50%
- 1 estrella por completar

Se escribe `lesson_progress`, se desbloquea la siguiente lección y, si corresponde, se
muestra la sugerencia de nivel.

### Usuarios que ya tenían la app

Un usuario existente tiene `onboarding_done = 1`, así que nunca pasa por
`LevelPickScreen`. Para él, `PathScreen` detecta `placement_done = 0` y presenta la
selección de nivel como hoja modal la primera vez que abre la pantalla, con el mismo
contenido y el mismo test opcional. No se puede descartar sin elegir: la ruta necesita un
nivel para ubicarlo.

Su `user_progress` no se toca. Las palabras que ya sabía siguen marcadas y sus lecciones
correspondientes aparecen sin completar, porque `lesson_progress` es independiente —
volver a verlas en la ruta es repaso, no pérdida.

### SettingsScreen

Se agrega "Mi nivel", con el nivel actual y acceso a `LevelPickScreen` en modo cambio.

## Ajuste de nivel

`src/services/levelAdjustment.js`, evaluado al cerrar cada lección sobre las últimas tres
completadas:

- 90% o más de calificaciones "Fácil" → *"¿Te resulta muy fácil? Podés saltar a {nivel+1}"*
- 40% o menos → *"¿Muy difícil? Probá con {nivel−1}"*

Se muestra como `LevelSuggestionCard` dentro de `LessonSummary`. Dos botones: aceptar o
descartar. Descartar silencia la sugerencia por diez lecciones, para no repetir la misma
propuesta después de cada sesión.

Aceptar (o cambiar de nivel desde Ajustes) actualiza `user_config.level` y mueve
`current_lesson_id` a la primera lección no completada del nivel destino. No se borra
progreso: las lecciones completadas siguen completadas y el usuario puede volver.

En A1 no se ofrece bajar; en C1 no se ofrece subir.

## Archivos

Nuevos:

```
src/curriculum/curriculum.js
src/curriculum/curriculumBuilder.js
src/database/lessonsRepository.js
src/services/placementService.js
src/services/levelAdjustment.js
src/screens/LevelPickScreen.jsx
src/screens/PlacementTestScreen.jsx
src/screens/PathScreen.jsx
src/screens/StudyLessonScreen.jsx
src/components/LessonNode.jsx
src/components/UnitHeader.jsx
src/components/LevelSuggestionCard.jsx
src/hooks/useLessonPath.js
src/seeds/words/{a1,a2,b1,b2,c1,index}.js
src/seeds/phrases/{a1,a2,b1,b2,c1,index}.js
src/seeds/wordExpander.js
scripts/validate-content.js
```

Modificados:

```
src/database/database.js        tablas y columnas nuevas
src/seeds/seedRunner.js         sembrado por nivel + buildCurriculum
src/navigation/AppNavigator.jsx rutas de nivel y test
src/navigation/MainTabNavigator.jsx  Home → PathScreen
src/screens/HomeScreen.jsx      cabecera reutilizada por PathScreen
src/screens/SettingsScreen.jsx  entrada "Mi nivel"
src/screens/OnboardingScreen.jsx  texto del slide 1; navega a LevelPick
src/store/appStore.js           level, currentLessonId
src/utils/constants.js          niveles, tamaño de lección, umbrales
```

Eliminados: `src/seeds/words_seed.js`, `src/seeds/phrases_seed.js` (reemplazados por los
directorios).

## Verificación

El proyecto no tiene tests ni runner, y montar esa infraestructura queda fuera de este
alcance. La verificación es:

`scripts/validate-content.js` — Node puro sobre los módulos de seed y curriculum, sin
base de datos. Falla si:

- hay `english_word` duplicado, o `phrase_en` duplicado;
- alguna palabra o frase tiene nivel fuera de A1–C1;
- alguna categoría del curriculum no tiene imagen en `CAT_IMG`;
- algún nivel del curriculum no tiene material suficiente para sus lecciones;
- el total de palabras o frases queda por debajo de lo previsto;
- `buildCurriculum` produce alguna lección con distinto de 10 tarjetas, o cae a `other`.

Se corre con `node scripts/validate-content.js` y se agrega como script de npm.

Prueba manual en Expo, sobre base limpia y sobre base existente:

1. Instalación nueva → onboarding → elegir nivel → la ruta abre en la lección correcta.
2. Instalación nueva → onboarding → test de ubicación → nivel asignado coherente.
3. Completar una lección → estrellas correctas, siguiente lección desbloqueada.
4. Forzar tres lecciones con todo "Fácil" → aparece la sugerencia de subir.
5. Cambiar nivel desde Ajustes → el puntero se mueve, el progreso previo se conserva.
6. Base de la versión anterior → el contenido nuevo aparece, `user_progress` intacto.

## Riesgos

**El slide 1 promete "5.000 Palabras" y llegaremos a ~2.500.** El texto pasa a
"2.500 Palabras Esenciales". Es la corrección honesta; hoy el slide ya miente, porque el
seed tiene 1.115.

**Volumen de contenido a redactar.** ~1.400 palabras y ~370 frases nuevas, con
traducción, categoría y nivel. Es la mayor parte del trabajo y se hará por tandas de un
nivel a la vez, validando cada tanda antes de seguir.

**`buildCurriculum` sobre base existente.** Corre solo si `lessons` está vacía, así que
un usuario que actualice recibe la ruta completa de golpe.
