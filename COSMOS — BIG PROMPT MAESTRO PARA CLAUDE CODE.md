# 🌌 COSMOS
## *our little universe.*

# BIG PROMPT — PRODUCT + ENGINEERING MASTER INSTRUCTION

---

# 0. TU MISIÓN

Estás trabajando como:

- Principal Software Architect
- Senior React Engineer
- Senior TypeScript Engineer
- Supabase/PostgreSQL Engineer
- Product Designer
- UX Engineer
- Motion Designer
- PWA Engineer
- QA Engineer

Tu misión es **diseñar y construir COSMOS**, una Progressive Web App privada para exactamente dos personas.

No debes limitarte a generar una demo visual.

Debes construir un producto funcional, mantenible, seguro, responsive, instalable como PWA y preparado para evolucionar.

---

# 1. FUENTE DE VERDAD

El siguiente principio tiene máxima prioridad:

> **COSMOS es un pequeño universo digital privado para dos personas.**

La experiencia une:

**PASADO → PRESENTE → FUTURO**

Pasado:
recuerdos.

Presente:
pendientes + acompañamiento.

Futuro:
planes + anticipación.

El producto debe sentirse:

**íntimo + cinematográfico + editorial + sofisticado + vivo + humano.**

Nunca debe sentirse como:

- un CRM;
- un gestor corporativo;
- un calendario empresarial;
- una red social;
- una app de productividad;
- una app infantil espacial.

---

# 2. IDENTIDAD

## Nombre

COSMOS

## Tagline

*our little universe.*

## Concepto

**Two people. One little universe.**

El tagline oficial es:

> *our little universe.*

No reemplazarlo por otro.

---

# 3. NEDI — PARTE FUNDAMENTAL DEL UNIVERSO

Existe un personaje/robot llamado:

# NEDI

Nedi forma parte del ambiente gráfico de COSMOS.

No es un chatbot obligatorio.

No es un asistente invasivo.

No debe aparecer constantemente hablando.

Nedi debe sentirse como:

> **un pequeño habitante del universo de COSMOS.**

Su función principal inicial es **ambiental, emocional y contextual**.

---

# 4. FILOSOFÍA DE NEDI

Nedi debe actuar como un pequeño compañero visual.

Puede:

- aparecer discretamente en determinadas pantallas;
- observar el calendario;
- sostener pequeños elementos;
- aparecer junto a estados vacíos;
- reaccionar a ciertos eventos;
- celebrar pequeños logros;
- acompañar un countdown;
- aparecer alrededor de recuerdos;
- ayudar visualmente a explicar acciones.

Ejemplos:

Sin recuerdos:

Nedi sentado junto a una pequeña estrella:

> “Todavía no hay estrellas aquí.”

Al completar algo importante:

Nedi puede hacer una pequeña animación de celebración.

En un countdown:

Nedi puede aparecer mirando el contador.

En un estado vacío:

Nedi puede estar explorando un pequeño espacio.

---

# 5. REGLA CRÍTICA DE NEDI

Nedi **NO debe dominar la interfaz**.

No convertir COSMOS en una app de mascota virtual.

Nedi debe seguir la regla:

> **Nedi aparece cuando aporta emoción, contexto o personalidad.**

No debe:

- tapar contenido;
- interrumpir flujos;
- exigir interacción;
- generar diálogos constantemente;
- utilizar grandes globos de texto;
- competir con fotografías;
- competir con eventos importantes.

Debe sentirse como descubrir pequeños detalles.

---

# 6. ARQUITECTURA DE NEDI

Crear Nedi como componente reutilizable:

```text
components/
└── nedi/
    ├── Nedi.tsx
    ├── NediScene.tsx
    ├── NediState.ts
    ├── NediAnimation.ts
    └── nedi.config.ts
```

Nedi debe poder tener estados:

```text
idle
happy
celebrating
thinking
observing
sleeping
curious
supporting
waiting
```

La arquitectura debe permitir incorporar posteriormente nuevas animaciones sin reconstruir la aplicación.

---

# 7. TECNOLOGÍAS

Utilizar:

```text
React
Vite
TypeScript
Tailwind CSS
Framer Motion
Lucide Icons
Supabase
PostgreSQL
Supabase Auth
Supabase Realtime
Supabase Storage
PWA
GitHub
Vercel
```

No introducir dependencias innecesarias.

Antes de añadir una librería, evaluar si puede resolverse elegantemente con las herramientas existentes.

---

# 8. PRINCIPIO MOBILE-FIRST

La aplicación debe diseñarse primero para:

- iPhone;
- Android;
- tablets.

Desktop es secundario.

La interfaz debe poder utilizarse cómodamente con una mano.

Priorizar:

- bottom navigation;
- bottom sheets;
- grandes targets táctiles;
- gestos;
- animaciones;
- safe areas;
- viewport móvil.

---

# 9. SISTEMA VISUAL

Fondo principal:

```text
#0F0F11
```

Superficies:

```text
#18181B
#27272A
```

Texto:

```text
#F4F4F5
#A1A1AA
```

Blossom:

```text
#F472B6
#F9A8D4
#FBCFE8
```

Noir representa al Usuario 1.

Blossom representa al Usuario 2.

Elementos compartidos mezclan Noir + Blossom.

---

# 10. ESTÉTICA

La referencia estética es:

**cinematic editorial dark mode + subtle astronomy + glassmorphism.**

No utilizar:

- galaxias genéricas como fondo constante;
- planetas caricaturescos;
- estrellas infantiles;
- estética gamer;
- exceso de neón;
- UI futurista exagerada.

El universo debe sentirse sugerido mediante:

- oscuridad;
- luz;
- profundidad;
- pequeños puntos luminosos;
- fotografías;
- halos;
- movimiento;
- espacio negativo.

---

# 11. HOME

La pantalla principal se llama conceptualmente:

# OBSERVATORY

Debe presentar:

### 1. ¿En qué anda hoy?

Resumen del día del otro usuario.

### 2. Calendario

Acceso inmediato al tiempo compartido.

### 3. Próximo gran momento

Countdown/evento destacado.

### 4. Nedi

Presencia ambiental contextual.

---

# 12. CALENDARIO

Implementar calendario mensual.

Requisitos:

- navegación;
- swipe horizontal;
- selección de día;
- indicadores;
- recuerdos;
- tareas;
- eventos;
- días especiales.

El calendario debe ser visualmente limpio.

No saturarlo.

---

# 13. DAY SHEET

Al tocar un día:

abrir un bottom sheet mediante Framer Motion.

No realizar una navegación abrupta.

Debe mostrar:

```text
DATE

MOMENTS & PLANS

POSTCARD
PHOTO
MICRO-STORY
SOUNDTRACK
STICKERS

TODAY'S RADAR

USER 1 TASKS
USER 2 TASKS

SUPPORT

NOTES
```

---

# 14. MEMORIES

Implementar:

## POSTCARD

Una fotografía principal + micro-relato.

Campos:

```text
id
cosmos_id
date
author_id
photo_url
story
created_at
updated_at
```

Debe existir preview visual.

---

# 15. SOUNDTRACK

Permitir asociar:

- Spotify;
- YouTube.

Guardar:

```text
platform
url
title
artist
thumbnail
```

No crear un reproductor musical complejo.

La UI debe parecer un pequeño objeto musical integrado al recuerdo.

---

# 16. STICKERS

Implementar biblioteca de PNG transparentes.

Funciones:

- selección;
- drag;
- resize;
- rotate;
- position;
- delete;
- persistencia.

Crear una arquitectura que permita que los stickers se coloquen sobre recuerdos.

---

# 17. NOTES

Implementar notas:

```text
immediate
scheduled
sealed
```

Las notas programadas se desbloquean según fecha/hora.

La animación de “raspar/abrir” es una experiencia visual.

No utilizar criptografía ficticia ni afirmar que la animación constituye seguridad.

---

# 18. TASK RADAR

Crear tareas por usuario.

Campos conceptuales:

```text
id
cosmos_id
author_id
date
title
description
priority
category
completed
completed_at
created_at
updated_at
```

Prioridades:

```text
normal
important
high
```

Categorías iniciales:

```text
Trabajo
Examen
Salud
Personal
Familia
Prioridad
Importante
```

---

# 19. SUPPORT SYSTEM

Crear sistema:

```text
task_support
```

Un usuario puede enviar apoyo al otro.

Mensajes:

```text
Mucho éxito hoy
Ya casi sales de eso
Orgulloso de ti
```

También permitir reacción mediante sticker.

El apoyo debe generar:

- aura;
- microanimación;
- realtime update.

---

# 20. COMPLETION / CHECK-IN

Cuando una tarea importante se completa:

mostrar:

> ¿Cómo te fue?

Opciones:

```text
😮‍💨 Por fin
😎 Salió bien
🥹 Sobreviví
✨ ¡Lo logré!
😩 Fue horrible
```

Permitir texto corto.

El otro usuario recibe una actualización sutil.

---

# 21. EVENTS

Crear eventos compartidos.

Campos:

```text
id
cosmos_id
title
date
time
location
latitude
longitude
description
```

Tipos:

```text
date
trip
concert
dinner
experience
other
```

---

# 22. TICKET UI

Los eventos importantes se representan visualmente como tickets.

Debe incluir:

- título;
- fecha;
- hora;
- ubicación;
- mapa;
- countdown;
- notas.

El diseño debe sentirse físico y elegante.

---

# 23. BUCKET LIST

Crear:

```text
bucket_items
```

Con:

```text
id
cosmos_id
title
description
created_by
completed
scheduled_date
```

Permitir posteriormente arrastrar una idea al calendario.

---

# 24. COUNTDOWN

Permitir fijar un próximo gran evento.

Mostrar:

```text
NEXT ADVENTURE

12 DAYS
```

Debe actualizarse dinámicamente.

No almacenar simplemente el número de días.

Calcularlo a partir de la fecha objetivo.

---

# 25. REALTIME

Utilizar Supabase Realtime para:

- tareas;
- completion;
- apoyo;
- recuerdos;
- notas;
- eventos.

Cuando el Usuario 1 modifica algo:

Usuario 2 debe verlo sin refrescar.

Gestionar correctamente:

- subscriptions;
- cleanup;
- errores;
- reconexión.

Evitar memory leaks.

---

# 26. DATABASE

Crear migraciones SQL reales.

No crear una falsa base de datos local para simular backend.

Tablas mínimas:

```text
profiles
cosmos
cosmos_members
memories
memory_media
songs
stickers
memory_stickers
tasks
task_support
task_reactions
task_checkins
events
bucket_items
countdowns
notes
notifications
```

---

# 27. RELACIÓN COSMOS

La estructura conceptual:

```text
COSMOS
│
├── MEMBER 01
│
└── MEMBER 02
```

Un COSMOS solamente puede tener dos miembros activos.

Implementar constraints y lógica de backend para garantizarlo.

No confiar solamente en el frontend.

---

# 28. RLS

Row Level Security es obligatorio.

Toda tabla privada debe tener políticas.

Principio:

```text
USER
 ↓
COSMOS MEMBERSHIP
 ↓
AUTHORIZED DATA
```

Un usuario nunca debe poder acceder a información de otro COSMOS.

Probar las políticas.

---

# 29. STORAGE

Buckets separados o estructura equivalente:

```text
photos
stickers
avatars
```

Organización:

```text
/cosmos/{cosmosId}/...
```

Implementar políticas de acceso.

No utilizar URLs públicas para información que deba permanecer privada.

---

# 30. AUTH

Implementar Supabase Auth.

El onboarding debe ser:

```text
WELCOME TO COSMOS
        ↓
Create COSMOS
        OR
Join COSMOS
        ↓
Profile
        ↓
Main Observatory
```

El flujo debe ser simple.

---

# 31. INVITACIÓN

El primer usuario puede generar una invitación para el segundo.

La invitación debe permitir:

- compartir;
- aceptar;
- vincular ambos usuarios.

Debe impedir que un tercer usuario se incorpore a un COSMOS ya completo.

---

# 32. PWA

Implementar correctamente:

- manifest;
- icons;
- service worker;
- standalone;
- theme-color;
- caching;
- update strategy.

Debe instalarse desde navegador móvil.

No presentar la PWA como una web ordinaria.

---

# 33. OFFLINE

Implementar una estrategia razonable.

Como mínimo:

- app shell cacheada;
- estados offline;
- recuperación;
- datos recientes cuando sea viable.

No intentar resolver sincronización offline compleja si compromete la estabilidad del MVP.

---

# 34. PERFORMANCE

Objetivos:

- carga inicial rápida;
- lazy loading;
- optimización de imágenes;
- compresión;
- responsive images;
- evitar renders innecesarios;
- subscriptions eficientes.

No cargar toda la biblioteca de fotografías al iniciar.

---

# 35. IMÁGENES

Las fotografías deben:

- comprimirse;
- tener thumbnails;
- utilizar carga progresiva;
- evitar archivos gigantes;
- utilizar lazy loading.

Nunca asumir que una fotografía móvil ya está optimizada.

---

# 36. COMPONENTES

Crear componentes pequeños y reutilizables.

Ejemplo:

```text
Calendar
CalendarDay
DaySheet
Postcard
MemoryCard
SoundtrackCard
StickerTray
StickerCanvas
TaskCard
SupportButton
CheckIn
EventTicket
BucketCard
Countdown
Nedi
BottomSheet
GlassCard
Avatar
```

Evitar componentes monolíticos.

---

# 37. DESIGN SYSTEM

Crear primitives:

```text
Button
IconButton
Card
GlassCard
Badge
Chip
Avatar
Input
Textarea
Modal
BottomSheet
Toast
Skeleton
Divider
```

Todas deben compartir:

- spacing;
- border radius;
- typography;
- motion;
- accessibility.

---

# 38. MOTION SYSTEM

Crear una pequeña gramática de animación.

### Micro

100–180ms

### Standard

180–300ms

### Emotional

300–600ms

Evitar animaciones excesivamente largas.

Usar spring animations cuando aporten naturalidad.

---

# 39. ACCESSIBILITY

Implementar:

- keyboard navigation;
- ARIA;
- focus;
- labels;
- reduced motion;
- contrast;
- touch targets.

No depender únicamente del color para distinguir usuarios.

---

# 40. RESPONSIVE DESKTOP

Desktop puede utilizar:

```text
Sidebar
Main Observatory
Context Panel
```

Pero conservar la estética íntima.

Nunca convertirlo en dashboard empresarial.

---

# 41. EMPTY STATES

Crear estados vacíos cuidadosamente diseñados.

Ejemplo:

## Memories

> Todavía no hay estrellas aquí.

Nedi puede aparecer discretamente.

## Future

> El futuro está esperando.

## Tasks

> Todo tranquilo por aquí.

---

# 42. ERROR STATES

Los errores deben mantener el tono de COSMOS.

Ejemplo:

> **Algo salió mal.**
>
> Tu universo sigue aquí. Inténtalo otra vez.

Pero registrar el error técnico internamente.

Nunca ocultar errores reales durante desarrollo.

---

# 43. NOTIFICATIONS

Crear sistema interno de eventos.

Tipos:

```text
support_received
task_completed
checkin_received
note_unlocked
event_upcoming
```

No notificar absolutamente todo.

---

# 44. NEDI + NOTIFICATIONS

Nedi puede reaccionar visualmente a determinados estados.

Ejemplo:

Al recibir apoyo:

Nedi puede aparecer brevemente con una pequeña señal de celebración.

Al desbloquear una nota:

Nedi puede aparecer cerca de la nota.

Al completar un evento:

Nedi puede celebrar.

Pero nunca debe bloquear al usuario.

---

# 45. PRIVACY

COSMOS es privado.

No implementar:

- perfiles públicos;
- followers;
- likes;
- feed público;
- publicidad;
- tracking invasivo.

---

# 46. DATA OWNERSHIP

Cada registro debe relacionarse con:

```text
cosmos_id
```

Siempre que corresponda.

Nunca depender solamente de `user_id` para autorización de recursos compartidos.

---

# 47. TYPESCRIPT

Strict mode.

No utilizar:

```text
any
```

salvo casos técnicamente justificados y documentados.

Crear tipos derivados del modelo de datos.

No duplicar interfaces innecesariamente.

---

# 48. STATE MANAGEMENT

No añadir Redux por defecto.

Utilizar:

- React state;
- context cuando corresponda;
- hooks;
- Supabase subscriptions;
- una solución ligera si posteriormente resulta necesaria.

No crear complejidad antes de necesitarla.

---

# 49. FORMULARIOS

Todos los formularios deben incluir:

- validación;
- loading state;
- disabled state;
- error state;
- success feedback.

Nunca permitir doble submit accidental.

---

# 50. OPTIMISTIC UI

Utilizar optimistic updates únicamente donde sea seguro.

Ejemplos:

- completar tarea;
- enviar reacción;
- pequeños cambios de UI.

Si la operación falla:

restaurar estado y mostrar feedback.

---

# 51. TESTING

Implementar tests.

Prioridad:

### Unit

Lógica de fechas.

Countdown.

Permisos.

Validaciones.

### Integration

Auth.

CRUD.

Realtime.

### E2E

Flujos críticos.

Crear COSMOS.

Unirse.

Crear recuerdo.

Crear tarea.

Enviar apoyo.

Completar tarea.

Crear evento.

---

# 52. SECURITY TESTING

Probar explícitamente:

- acceso cruzado entre COSMOS;
- usuarios no autorizados;
- manipulación de IDs;
- Storage policies;
- RLS;
- COSMOS completo;
- eliminación;
- modificación.

Nunca asumir que el frontend protege los datos.

---

# 53. DELETE / EDIT

Toda entidad editable debe tener:

- edit;
- delete;
- confirmación cuando corresponda.

Para contenido emocional importante:

considerar confirmación suave.

Ejemplo:

> ¿Seguro que quieres borrar este recuerdo?

---

# 54. AUDIT

Registrar `created_at` y `updated_at`.

Cuando tenga sentido:

```text
created_by
updated_by
```

---

# 55. TIMEZONE

Las fechas deben manejarse cuidadosamente.

El sistema debe definir claramente:

- timezone del COSMOS;
- timezone del dispositivo;
- timestamps UTC;
- fechas locales.

Los eventos de calendario no deben cambiar accidentalmente de día por conversiones incorrectas.

---

# 56. INTERNATIONALIZATION

El MVP puede comenzar en español.

Pero no hardcodear textos profundamente dentro de componentes.

Preparar la arquitectura para i18n futura.

---

# 57. SEED DATA

Crear datos de desarrollo opcionales.

Ejemplo:

```text
COSMOS Demo
User Noir
User Blossom
Memories
Tasks
Events
Bucket List
```

Nunca mezclar seed/demo data con producción.

---

# 58. DESARROLLO POR FASES

No intentes construir todo de golpe.

## PHASE 0

Foundation.

## PHASE 1

Auth + COSMOS + profiles.

## PHASE 2

Calendar + Day Sheet.

## PHASE 3

Memories.

## PHASE 4

Tasks + Support.

## PHASE 5

Events + Countdown + Bucket List.

## PHASE 6

Stickers + Notes.

## PHASE 7

Nedi.

## PHASE 8

PWA + Offline.

## PHASE 9

Polish + QA.

---

# 59. REGLA DE IMPLEMENTACIÓN

Después de completar cada fase:

1. verificar compilación;
2. verificar TypeScript;
3. ejecutar tests;
4. revisar UX;
5. revisar responsive;
6. revisar seguridad;
7. corregir errores;
8. continuar.

No acumular errores para el final.

---

# 60. GIT

Utilizar commits pequeños y descriptivos.

Ejemplos:

```text
feat: initialize cosmos app
feat: add supabase auth
feat: create cosmos membership
feat: add calendar foundation
feat: add memory postcards
feat: add task radar
feat: add support reactions
feat: add countdown
feat: add nedi ambient system
fix: prevent cross-cosmos access
perf: optimize memory images
```

No hacer un único commit gigantesco.

---

# 61. DOCUMENTACIÓN

Crear:

```text
README.md
ARCHITECTURE.md
DATABASE.md
SECURITY.md
DESIGN_SYSTEM.md
```

El README debe explicar:

- instalación;
- variables;
- Supabase;
- desarrollo;
- build;
- deployment;
- PWA.

---

# 62. ENVIRONMENT VARIABLES

Nunca hardcodear:

- Supabase URL;
- keys;
- secrets.

Utilizar `.env`.

Crear:

```text
.env.example
```

sin secretos.

---

# 63. DEPLOYMENT

Preparar deployment para Vercel.

Verificar:

- SPA routing;
- environment variables;
- PWA;
- HTTPS;
- caching;
- Supabase connection.

---

# 64. UX MICROCOPY

El lenguaje debe ser emocional pero no cursi.

Preferir:

> “Guardado en COSMOS.”

> “Mucho éxito hoy ♡”

> “El futuro está esperando.”

> “Todavía no hay estrellas aquí.”

Evitar:

> “¡Felicidades, usuario!”

> “Tarea ejecutada correctamente.”

> “Operación exitosa.”

---

# 65. THE MAGIC RULE

En cualquier pantalla pregunta:

> ¿Esto parece una aplicación o parece un pequeño universo?

Si parece una aplicación genérica:

**mejorarlo.**

Si parece un pequeño universo:

**mantenerlo.**

---

# 66. NO SOBRE-DISEÑAR

La sofisticación de COSMOS viene del:

- espacio;
- tipografía;
- luz;
- fotografía;
- movimiento;
- silencio;
- detalles.

No de agregar elementos.

Cuando dudes:

> **remove one thing.**

---

# 67. NEDI DESIGN RULE

Nedi debe ser:

**memorable pero discreto.**

Debe poder desaparecer completamente de una pantalla si su presencia no aporta nada.

Debe existir una arquitectura para:

```text
Nedi + Scene + State + Animation
```

de manera que pueda evolucionar.

---

# 68. EXPERIENCIA DE ARRANQUE

Al abrir por primera vez:

Pantalla oscura.

Una pequeña luz.

Logo:

# COSMOS

Debajo:

*our little universe.*

La transición debe ser lenta pero breve.

No utilizar una pantalla de loading innecesaria.

---

# 69. ONBOARDING

Debe ser corto.

Conceptualmente:

```text
COSMOS

our little universe.

        ↓

Create your cosmos

        OR

Join a cosmos
```

Después:

```text
Your name
Your visual identity
```

El segundo usuario completa su perfil.

---

# 70. PRIMERA EXPERIENCIA

Cuando el COSMOS está vacío:

El usuario debe sentir:

> “Este espacio todavía es nuestro.”

No:

> “No hay datos.”

Mostrar Nedi.

Mostrar una invitación a comenzar.

---

# 71. FUTURA EVOLUCIÓN

La arquitectura debe permitir posteriormente:

- múltiples colecciones de recuerdos;
- más tipos de eventos;
- temas;
- más estados de Nedi;
- widgets;
- Apple/Android integrations;
- notificaciones push;
- compartir momentos;
- exportar recuerdos;
- timeline;
- mapas;
- estadísticas emocionales opcionales.

Pero:

**NO implementar estas funciones en el MVP salvo que sean necesarias para el núcleo.**

---

# 72. COSAS QUE NO DEBES HACER

NO:

- inventar una arquitectura distinta sin justificarla;
- cambiar Supabase por otro backend;
- reemplazar React;
- introducir una base de datos falsa;
- crear un dashboard corporativo;
- convertir Nedi en chatbot;
- sobrecargar de animaciones;
- utilizar datos ficticios en producción;
- saltarte RLS;
- hardcodear credenciales;
- crear componentes gigantes;
- ignorar mobile;
- sacrificar seguridad por velocidad.

---

# 73. TU PROCESO DE TRABAJO

Antes de escribir código:

### STEP 1

Inspecciona el repositorio actual.

### STEP 2

Determina qué existe.

### STEP 3

No destruyas trabajo útil.

### STEP 4

Propón la estructura técnica.

### STEP 5

Implementa Foundation.

### STEP 6

Verifica.

### STEP 7

Continúa fase por fase.

---

# 74. SI EL REPOSITORIO ESTÁ VACÍO

Construye desde cero.

Inicializa:

```text
Vite
React
TypeScript
Tailwind
Supabase
PWA
```

Después crea la arquitectura.

---

# 75. SI EXISTE CÓDIGO

No reemplaces todo automáticamente.

Primero:

- inspecciona;
- entiende;
- reutiliza;
- refactoriza cuando sea necesario.

Conserva funcionalidades correctas.

---

# 76. DEFINICIÓN DE DONE

Una funcionalidad solamente está terminada cuando:

```text
✓ funciona
✓ es responsive
✓ tiene estados loading
✓ tiene estados error
✓ tiene empty state
✓ es accesible
✓ persiste correctamente
✓ respeta RLS
✓ funciona con realtime cuando corresponde
✓ tiene tests razonables
✓ no rompe otras funciones
✓ mantiene la estética COSMOS
```

---

# 77. PRIORIDAD ABSOLUTA

Orden de prioridades:

```text
1. Security
2. Correctness
3. UX
4. Performance
5. Maintainability
6. Visual polish
```

Nunca sacrificar seguridad por estética.

Nunca sacrificar funcionalidad por animación.

---

# 78. PRODUCT NORTH STAR

Si solamente recuerdas una cosa:

> **COSMOS no organiza una relación.**
>
> **COSMOS guarda y acompaña una vida compartida.**

---

# 79. FRASE FINAL DEL PRODUCTO

# COSMOS
### *our little universe.*

**Two people.  
One little universe.  
A lifetime of moments between them.**

---

# INSTRUCCIÓN FINAL PARA CLAUDE CODE

Ahora comienza.

No respondas únicamente con una explicación conceptual.

**INSPECCIONA EL PROYECTO Y CONSTRUYE.**

Primero analiza el estado actual del repositorio.

Después establece Foundation.

Después implementa las fases en orden.

Después prueba.

Después corrige.

Después continúa.

Cuando una decisión no esté explícitamente definida, elige la solución:

**más simple + segura + mantenible + elegante + coherente con COSMOS.**

No inventes funcionalidades innecesarias.

No sacrifiques la experiencia.

No conviertas COSMOS en una aplicación genérica.

Construye:

# **COSMOS**

*our little universe.*