// =====================================================================
// METODOLOGÍA DE EVALUACIÓN DE RIESGOS — neuraler
// Contenido versionado. La pestaña "Metodología" y el generador de
// documentos leen de aquí. Si se cambia el texto, se sube la versión:
// cada evaluación guarda la versión vigente cuando se hizo.
// =====================================================================

import { CONDICIONES_ERE, ACCIONES as ACCIONES_ERE, TABLAS_ERE } from "./ereContenido.js";

export const METODOLOGIA_VERSION = "1.9";
export const METODOLOGIA_FECHA = "2026-10-04";

// ---------- Escalas (fuente única: también las usa el cálculo) ----------

export const CONSECUENCIAS = [
  {
    codigo: "LD",
    nombre: "Ligeramente dañino",
    descripcion:
      "Lesiones superficiales o molestias que no impiden seguir trabajando.",
    ejemplos:
      "Arañazos, pequeños cortes, contusiones leves, irritación ocular, cefalea o malestar pasajero, empujón o arañazo de un paciente sin lesión.",
  },
  {
    codigo: "D",
    nombre: "Dañino",
    descripcion:
      "Lesiones o enfermedades que suelen causar baja, sin secuelas graves permanentes.",
    ejemplos:
      "Esguinces, quemaduras localizadas, fracturas menores, lumbalgia con baja, dermatitis, lesión por agresión con baja, cuadro de ansiedad o estrés laboral con baja.",
  },
  {
    codigo: "ED",
    nombre: "Extremadamente dañino",
    descripcion:
      "Lesiones graves, secuelas permanentes, enfermedades que acortan la vida o muerte.",
    ejemplos:
      "Fracturas graves, amputaciones, lesiones múltiples, intoxicación grave, agresión con lesión permanente, contagio de enfermedad grave por pinchazo accidental.",
  },
];

export const PROBABILIDADES = [
  {
    codigo: "B",
    nombre: "Baja",
    descripcion: "El daño se producirá en raras ocasiones.",
  },
  {
    codigo: "M",
    nombre: "Media",
    descripcion: "El daño se producirá en algunas ocasiones.",
  },
  {
    codigo: "A",
    nombre: "Alta",
    descripcion: "El daño se producirá siempre o casi siempre.",
  },
];

// Matriz P × C → nivel de riesgo (idéntica al cálculo de VR de la ER)
export const MATRIZ = {
  B: { LD: "T", D: "TO", ED: "MO" },
  M: { LD: "TO", D: "MO", ED: "IM" },
  A: { LD: "MO", D: "IM", ED: "IN" },
};

export const NIVELES = [
  {
    codigo: "T",
    nombre: "Trivial",
    actuacion: "No requiere ninguna acción específica.",
    plazo: "Sin plazo",
  },
  {
    codigo: "TO",
    nombre: "Tolerable",
    actuacion:
      "Las medidas existentes son suficientes. Se valoran mejoras de bajo coste y se comprueba periódicamente que las medidas siguen siendo eficaces.",
    plazo: "Comprobación en la revisión anual",
  },
  {
    codigo: "MO",
    nombre: "Moderado",
    actuacion:
      "Hay que reducir el riesgo. Se planifican las medidas, con su coste y responsable, y se implantan dentro del plazo fijado.",
    plazo: "Máximo 6 meses",
  },
  {
    codigo: "IM",
    nombre: "Importante",
    actuacion:
      "No se inicia el trabajo hasta reducir el riesgo. Si el trabajo ya se está realizando, la corrección es prioritaria frente a los riesgos moderados, aunque requiera recursos considerables.",
    plazo: "Antes de iniciar; en curso, máximo 1 mes",
  },
  {
    codigo: "IN",
    nombre: "Intolerable",
    actuacion:
      "No se inicia ni se continúa el trabajo hasta reducir el riesgo. Si no es posible reducirlo, el trabajo queda prohibido.",
    plazo: "Inmediato",
  },
];

// ---------- PAC: comprobación de condiciones en la visita ----------

export const NIVELES_DEFICIENCIA = [
  {
    codigo: "MEJ",
    nombre: "Mejorable",
    descripcion:
      "Se detecta un fallo de poca importancia. Las medidas existentes siguen funcionando.",
  },
  {
    codigo: "DEF",
    nombre: "Deficiente",
    descripcion:
      "Se detecta un fallo que hay que corregir. Las medidas existentes pierden eficacia de forma apreciable.",
  },
  {
    codigo: "MDEF",
    nombre: "Muy deficiente",
    descripcion:
      "Se detectan fallos importantes o varios a la vez. Las medidas existentes no protegen frente al riesgo.",
  },
];

// Nivel de deficiencia × consecuencias → prioridad de la incidencia
export const MATRIZ_PAC = {
  MEJ: { LD: "Baja", D: "Baja", ED: "Media" },
  DEF: { LD: "Baja", D: "Media", ED: "Alta" },
  MDEF: { LD: "Media", D: "Alta", ED: "Inmediata" },
};

export const PRIORIDADES_PAC = [
  { nombre: "Inmediata", plazo: "En la visita o en 24-48 horas" },
  { nombre: "Alta", plazo: "1 semana" },
  { nombre: "Media", plazo: "1 mes" },
  { nombre: "Baja", plazo: "3 meses" },
];

export const ESTADOS_ACCION = [
  { nombre: "Pendiente", descripcion: "La medida aún no se ha aplicado." },
  { nombre: "Realizada", descripcion: "La medida se ha aplicado tal como se planificó." },
  {
    nombre: "Medida alternativa",
    descripcion:
      "Se ha aplicado otra medida que reduce el riesgo en igual o mayor grado. Se describe cuál.",
  },
];

// ---------- Texto de las secciones ----------
// Tipos de bloque: p (párrafo), lista, pasos (secuencia numerada),
// tabla, matriz (P×C interactiva), matrizPac, nota.

export const SECCIONES = [
  {
    id: "objeto",
    titulo: "Objeto y alcance",
    bloques: [
      {
        tipo: "p",
        texto:
          "Esta metodología describe cómo se identifican, estiman y valoran los riesgos para la seguridad y salud de las personas trabajadoras en los centros evaluados, y cómo se decide qué medidas preventivas adoptar, con qué prioridad y en qué plazo.",
      },
      {
        tipo: "p",
        texto:
          "Se aplica a todos los puestos de trabajo, equipos, lugares e instalaciones del centro, y a todas las personas que trabajan en él, incluidas las contratadas a través de empresas de trabajo temporal.",
      },
      {
        tipo: "p",
        texto:
          "La evaluación recoge los riesgos detectados en la toma de datos (visitas, entrevistas con las personas trabajadoras y los mandos, y documentación del centro) y los estudios específicos que se realicen. No recoge los riesgos de situaciones que no se hayan comunicado y no puedan observarse, ni los que ya se han eliminado aplicando los principios de la acción preventiva.",
      },
      {
        tipo: "p",
        texto:
          "Se aplica la perspectiva de género en todas las fases: al identificar los riesgos y las condiciones de trabajo se tiene en cuenta cómo afectan de forma distinta a mujeres y hombres, en especial durante el embarazo y la lactancia.",
      },
    ],
  },
  {
    id: "normativa",
    titulo: "Marco normativo",
    bloques: [
      {
        tipo: "lista",
        items: [
          "Ley 31/1995, de Prevención de Riesgos Laborales: artículo 16 (evaluación y planificación), artículo 25 (personas especialmente sensibles) y artículo 26 (protección de la maternidad).",
          "Real Decreto 39/1997, Reglamento de los Servicios de Prevención: artículos 3 a 9 (contenido, revisión, documentación y planificación de la evaluación).",
          "Real Decreto 298/2009, sobre la protección de la trabajadora embarazada, que haya dado a luz o en periodo de lactancia.",
          "Normativa específica aplicable según los riesgos detectados (lugares de trabajo, equipos, manipulación de cargas, pantallas de visualización, agentes biológicos y químicos, entre otros).",
          "Real Decreto 664/1997 (agentes biológicos), Real Decreto 665/1997 (agentes cancerígenos) y Reglamento (CE) 1272/2008 sobre clasificación y etiquetado de sustancias (indicaciones de peligro H).",
        ],
      },
      {
        tipo: "p",
        texto:
          "Documentos técnicos de referencia para el método:",
      },
      {
        tipo: "lista",
        items: [
          "Documento técnico del INSST «Evaluación de Riesgos Laborales».",
          "Documento de integración para la implantación y desarrollo de la prevención en las empresas, impulsado por la Inspección de Trabajo y Seguridad Social.",
          "Agentes químicos, inhalación: evaluación cualitativa simplificada con el modelo COSHH Essentials (nota técnica de prevención del INSST).",
          "Carga física: norma UNE-EN 1005-4 e informe técnico ISO/TR 12295, que aplica las normas ISO 11228-1, 11228-2 y 11228-3 (manipulación manual) e ISO 11226 (posturas estáticas).",
          "Factores psicosociales: lista de identificación de la guía «Risk assessment essentials» de la Agencia Europea para la Seguridad y la Salud en el Trabajo (2007).",
          "Embarazo y lactancia: guía de valoración del riesgo laboral durante el embarazo y la lactancia de la Sociedad Española de Ginecología y Obstetricia (SEGO), el Instituto Nacional de la Seguridad Social (INSS) y la Asociación de Mutuas de Accidentes de Trabajo (AMAT).",
        ],
      },
      {
        tipo: "p",
        texto:
          "Como método general se utiliza el de evaluación de riesgos del Instituto Nacional de Seguridad y Salud en el Trabajo (INSST), basado en estimar para cada peligro la severidad del daño y la probabilidad de que ocurra.",
      },
    ],
  },
  {
    id: "catalogo",
    titulo: "Catálogo de riesgos y codificación",
    bloques: [
      {
        tipo: "p",
        texto:
          "Los riesgos se identifican con un código propio, R01, R02... hasta R39, seguido del nombre del riesgo. Cada medida preventiva lleva el código de su riesgo y un número de orden (por ejemplo, R01-M03). El catálogo es único para todos los centros y puestos.",
      },
      {
        tipo: "p",
        texto:
          "El catálogo sigue la lista oficial de formas de accidente y de agentes causantes de enfermedad (códigos 01 a 30) y la amplía donde lo exige el trabajo en centros de atención a personas. Los riesgos R01 a R12 coinciden en número y contenido con las formas oficiales 01 a 12. A partir de R13 el catálogo reordena y desglosa el resto de las formas oficiales e incorpora riesgos propios de estos centros: violencia, movilización de pacientes, agentes biológicos, carga física y factores psicosociales.",
      },
      {
        tipo: "p",
        texto:
          "Cada riesgo lleva asignada su forma oficial (01 a 30). La tabla siguiente recoge la equivalencia y si el encaje es directo, aproximado o sin equivalente claro.",
      },
      {
        tipo: "subtitulo",
        texto: "Por qué se mantiene un catálogo propio",
      },
      {
        tipo: "lista",
        items: [
          "Estabilidad. El código de un riesgo no cambia, de modo que las medidas, las evaluaciones y los informes ya emitidos conservan siempre su referencia.",
          "Precisión. La lista oficial describe cómo ocurre el accidente o de qué agente deriva la enfermedad, y agrupa en «otras circunstancias» los factores ergonómicos y psicosociales, que en los centros evaluados están entre los más relevantes: movilización de pacientes y carga física, estrés, violencia y fatiga por turnos. Usarla como único código obligaría a mezclarlos y a perder su valoración por separado.",
          "Comparabilidad. Como cada riesgo lleva su forma oficial, los resultados pueden agruparse con la clasificación estándar para estadísticas, comparaciones e informes.",
          "Trazabilidad. Cada evaluación conserva una copia de los riesgos con los que se hizo, por lo que un cambio posterior del catálogo no altera una evaluación ya entregada.",
        ],
      },
      {
        tipo: "tabla",
        fuente: "EQUIVALENCIA",
        columnas: ["Código", "Riesgo", "Forma oficial", "Encaje"],
      },
      {
        tipo: "subtitulo",
        texto: "Qué comprende cada riesgo",
      },
      {
        tipo: "p",
        texto:
          "La numeración R01 a R39 coincide con la lista de riesgos de la metodología general de evaluación de referencia, de modo que los informes de otras evaluaciones pueden compararse riesgo a riesgo.",
      },
      {
        tipo: "tabla",
        fuente: "DEFINICIONES",
        columnas: ["Código", "Riesgo", "Qué comprende y factores de riesgo habituales"],
      },
      {
        tipo: "p",
        texto:
          "El catálogo no incluye ningún riesgo de la forma oficial 25, causas naturales, porque son hechos que ocurren en el centro de trabajo sin ser consecuencia del propio trabajo.",
      },
      {
        tipo: "p",
        texto:
          "Un riesgo nuevo recibe el siguiente código libre y su forma oficial. Cualquier alta, baja o cambio de nombre o de equivalencia del catálogo implica una nueva versión de esta metodología.",
      },
    ],
  },
  {
    id: "actividades",
    titulo: "Evaluación por actividades",
    bloques: [
      {
        tipo: "p",
        texto:
          "El trabajo se evalúa por actividades. Una actividad es una tarea, un equipo o una condición de trabajo que se repite en varios puestos: por ejemplo, las tareas básicas de limpieza, el uso de equipos ofimáticos, el uso de escalera de mano, la turnicidad o la nocturnidad.",
      },
      {
        tipo: "p",
        texto:
          "Cada actividad se evalúa una sola vez. Se describen sus tareas y los EPI que deben proporcionarse y, para cada riesgo del catálogo que trae consigo, se recoge la condición detectada, la probabilidad, las consecuencias, la valoración y las medidas preventivas y correctivas con su marco legal.",
      },
      {
        tipo: "p",
        texto:
          "Cada puesto recoge las actividades que realiza y, además, sus riesgos propios, los que no dependen de ninguna actividad común. En el informe todos los riesgos aparecen integrados en el puesto, no en un capítulo aparte.",
      },
      {
        tipo: "p",
        texto:
          "Si dos actividades de un mismo puesto traen el mismo riesgo con la misma condición, se recoge una sola vez. Si la condición es la misma y el nivel de riesgo difiere, prevalece el más alto y se suman las medidas.",
      },
      {
        tipo: "p",
        texto:
          "Las actividades se revisan cuando cambian las tareas, los equipos o la normativa. Una evaluación ya entregada conserva la copia de lo evaluado y no cambia por revisar una actividad.",
      },
    ],
  },
  {
    id: "puestos",
    titulo: "Puestos de trabajo",
    bloques: [
      {
        tipo: "p",
        texto:
          "La evaluación se realiza por puesto de trabajo. Cada puesto recoge las actividades que realiza y, además, sus riesgos propios. La evaluación del puesto es la suma de ambas partes.",
      },
      {
        tipo: "p",
        texto:
          "Las personas trabajadoras asignadas a cada puesto figuran en el listado de empleados de cada centro de trabajo, disponible en la dirección del centro. La evaluación no recoge el número de personas por puesto, porque varía.",
      },
      {
        tipo: "p",
        texto:
          "Los puestos se definen por sus funciones. Los distintos títulos que reciben en cada centro las personas que hacen lo mismo, por ejemplo enfermero/a y enfermero/a especialista en salud mental, se asignan al puesto de la evaluación con el que coincidan sus funciones y exposiciones. Si un título no encaja con ningún puesto, se crea uno nuevo y se actualiza esta metodología.",
      },
      {
        tipo: "p",
        texto:
          "Dos puestos solo se evalúan juntos cuando tienen las mismas funciones y las mismas actividades y riesgos propios. En ese caso el informe nombra ambos puestos. Si difieren en algo, se evalúan por separado.",
      },
      {
        tipo: "p",
        texto:
          "Se evalúa por puesto, y no por grupos de puestos, por tres razones. Las actividades ya permiten escribir una vez lo que se repite en varios puestos, de modo que un grupo aportaría poco más. Los puestos que se reunirían en un mismo grupo difieren en sus exposiciones, por lo que habría que evaluar sus diferencias aparte. Y cada persona trabajadora recibe la información de su propio puesto, tal como describe su trabajo.",
      },
    ],
  },
  {
    id: "proceso",
    titulo: "Cómo se desarrolla la evaluación",
    bloques: [
      {
        tipo: "pasos",
        items: [
          {
            titulo: "Recogida de información",
            texto:
              "Datos del centro (plantas, tipo de pacientes, horario, servicios como comedor o vigilancia), puestos existentes y número de personas en cada uno. Se consulta a las personas trabajadoras y a sus representantes.",
          },
          {
            titulo: "Identificación de peligros",
            texto:
              "Para cada puesto se parte del catálogo de riesgos de la matriz. Después se aplica el cuestionario de comprobación (check) para incorporar los riesgos propios de ese centro.",
          },
          {
            titulo: "Estimación del riesgo",
            texto:
              "A cada riesgo se le asigna una probabilidad y unas consecuencias, considerando las condiciones reales de exposición y las medidas ya existentes.",
          },
          {
            titulo: "Valoración",
            texto:
              "La combinación de probabilidad y consecuencias da el nivel de riesgo, que determina si hay que actuar, cómo y en qué plazo.",
          },
          {
            titulo: "Planificación preventiva (PAP)",
            texto:
              "Cada medida queda registrada con su prioridad, plazo, responsable y estado.",
          },
          {
            titulo: "Comprobación de condiciones (PAC)",
            texto:
              "En las visitas se revisan las condiciones del centro y se registran solo las incidencias detectadas, con su prioridad y plazo de corrección.",
          },
          {
            titulo: "Información a las personas trabajadoras",
            texto:
              "Con los resultados se elabora la información de riesgos por puesto (IR) y, cuando procede, la evaluación de riesgos para embarazo y lactancia (ERE).",
          },
        ],
      },
    ],
  },
  {
    id: "estimacion",
    titulo: "Estimación del riesgo",
    bloques: [
      {
        tipo: "subtitulo",
        texto: "Consecuencias (C)",
      },
      {
        tipo: "p",
        texto:
          "Se valora el daño más probable si el riesgo llega a materializarse, teniendo en cuenta la parte del cuerpo afectada y la naturaleza del daño.",
      },
      {
        tipo: "tabla",
        fuente: "CONSECUENCIAS",
        columnas: ["Nivel", "Qué significa", "Ejemplos en el centro"],
      },
      {
        tipo: "subtitulo",
        texto: "Probabilidad (P)",
      },
      {
        tipo: "tabla",
        fuente: "PROBABILIDADES",
        columnas: ["Nivel", "Criterio"],
      },
      {
        tipo: "p",
        texto: "Para fijar la probabilidad se tiene en cuenta:",
      },
      {
        tipo: "lista",
        items: [
          "Con qué frecuencia y durante cuánto tiempo se está expuesto.",
          "Si las medidas existentes son adecuadas y se aplican en la práctica.",
          "La formación e información de quien realiza la tarea.",
          "Si se dispone de equipos de protección individual y se usan.",
          "Los accidentes, incidentes y daños a la salud ya registrados en el centro o en el puesto.",
          "Las características de los pacientes atendidos, como conductas de agitación o imprevisibles.",
          "El trabajo en solitario, en turno de noche o con poco personal.",
          "La presencia de personas especialmente sensibles a ese riesgo.",
        ],
      },
      {
        tipo: "subtitulo",
        texto: "Matriz de estimación",
      },
      {
        tipo: "matriz",
      },
      {
        tipo: "subtitulo",
        texto: "Métodos de apoyo",
      },
      {
        tipo: "lista",
        items: [
          "Agentes químicos por inhalación: se estima el riesgo potencial con el modelo COSHH Essentials a partir de la peligrosidad (indicaciones H), la tendencia a pasar al ambiente (volatilidad de los líquidos según su punto de ebullición y la temperatura de trabajo; pulverulencia de los sólidos), la cantidad usada en cada operación y el tiempo de exposición. Después se traslada a probabilidad y consecuencias teniendo en cuenta las medidas existentes.",
          "Carga física: identificación de los factores de riesgo (posturas, manipulación de cargas, movilización de personas, movimientos repetitivos y aplicación de fuerzas) y evaluación rápida según el ISO/TR 12295, que indica si hace falta una evaluación específica.",
          "Factores psicosociales (estrés y violencia): datos objetivos del centro, como absentismo, denuncias o registro de agresiones, y la lista de identificación de la Agencia Europea; si el resultado lo aconseja, se realiza una evaluación psicosocial con un método reconocido.",
        ],
      },
    ],
  },
  {
    id: "dn",
    titulo: "Disposición normativa (D.N.)",
    bloques: [
      {
        tipo: "p",
        texto:
          "Las condiciones detectadas que no corresponden a un riesgo concreto, pero que la normativa exige de forma explícita, se registran como disposición normativa y llevan el código «D.N.» en lugar del nivel de riesgo. Por ejemplo, aspectos de integración de la prevención, la dotación del botiquín o la documentación obligatoria.",
      },
    ],
  },
  {
    id: "valoracion",
    titulo: "Valoración y plazos de actuación",
    bloques: [
      {
        tipo: "p",
        texto:
          "Cada nivel de riesgo lleva asociada una forma de actuar y un plazo máximo para aplicar las medidas en la planificación preventiva. Los plazos son los que se aplican por defecto; el técnico puede acortarlos de forma justificada.",
      },
      {
        tipo: "tabla",
        fuente: "NIVELES",
        columnas: ["Nivel", "Actuación", "Plazo"],
      },
      {
        tipo: "p",
        texto:
          "Cuando dos medidas tienen el mismo nivel, se aplica antes la que corresponde a consecuencias más graves. Si también coinciden en eso, se tiene en cuenta el número de personas expuestas, el coste y el tiempo necesario.",
      },
    ],
  },
  {
    id: "medidas",
    titulo: "Medidas preventivas y correctivas",
    bloques: [
      {
        tipo: "p",
        texto:
          "Medida preventiva: la que reduce un riesgo que no se ha podido eliminar y que la empresa mantiene de forma permanente, sin fecha de fin; por ejemplo, el uso de equipos de protección individual o los controles periódicos.",
      },
      {
        tipo: "p",
        texto:
          "Medida correctiva: la que subsana un incumplimiento o una no conformidad para eliminar el riesgo o reducirlo. Se planifica en el tiempo con responsable, plazo y coste, y forma la base de la planificación preventiva (PAP).",
      },
      {
        tipo: "p",
        texto: "Para facilitar la planificación, cada medida puede llevar uno o varios tipos:",
      },
      {
        tipo: "tabla",
        fuente: "TIPOS_MEDIDA",
        columnas: ["Tipo", "Significado"],
      },
      {
        tipo: "p",
        texto:
          "Cada medida indica el marco legal que la justifica. En la planificación preventiva, las medidas iguales o parecidas de varios puestos del centro se unen en una sola acción con la prioridad más alta, del lado de la seguridad.",
      },
    ],
  },
  {
    id: "reglas",
    titulo: "Reglas complementarias",
    bloques: [
      {
        tipo: "lista",
        items: [
          "Un riesgo moderado con consecuencias extremadamente dañinas se marca para una valoración más precisa de su probabilidad. La aplicación lo señala de forma automática.",
          "Los riesgos que se incorporan a través del cuestionario de comprobación entran con probabilidad media y consecuencias dañinas (riesgo moderado) hasta que el técnico los ajuste.",
          "Si una persona especialmente sensible ocupa un puesto, se revisa la probabilidad de los riesgos que le afectan y, si procede, se emite un informe de adaptación del puesto.",
          "Un riesgo que no puede evaluarse con este método por falta de datos se deriva a una evaluación específica.",
        ],
      },
    ],
  },
  {
    id: "especificas",
    titulo: "Evaluaciones específicas",
    bloques: [
      {
        tipo: "p",
        texto:
          "El método general sirve para la mayoría de los riesgos. Cuando un riesgo exige mediciones, cuestionarios o un análisis más detallado, se realiza una evaluación específica con un método reconocido y sus resultados se incorporan a esta evaluación.",
      },
      {
        tipo: "tabla",
        fuente: "ESPECIFICAS",
        columnas: ["Ámbito", "Cuándo se realiza", "Referencia"],
      },
    ],
  },
  {
    id: "concertadas",
    titulo: "Actividades concertadas con entidades externas",
    bloques: [
      {
        tipo: "p",
        texto:
          "El servicio de prevención mancomunado asume las especialidades de Seguridad en el Trabajo, Higiene Industrial y Ergonomía y Psicosociología Aplicada. La especialidad de Medicina del Trabajo y algunas actividades que exigen medios técnicos o dedicación específicos se encargan a entidades externas. El servicio de prevención sigue siendo responsable de integrarlas en el sistema: define qué se encarga, revisa el resultado antes de aceptarlo y comprueba que sus medidas se aplican.",
      },
      {
        tipo: "tabla",
        fuente: "CONCERTADAS",
        columnas: ["Actividad", "Quién la realiza", "Qué hace el servicio de prevención", "Dónde queda"],
      },
      {
        tipo: "p",
        texto: "Criterios comunes para todas las actividades concertadas:",
      },
      {
        tipo: "lista",
        items: [
          "Antes del encargo se fija el alcance: centros, aspectos que se miden o revisan, plazo y formato del informe.",
          "Se comprueba la cualificación de la entidad y de su personal (acreditación o titulación, y calibración vigente de los equipos de medición).",
          "Cuando la entidad acude a un centro se aplica la coordinación de actividades empresariales.",
          "El técnico revisa cada informe: los resultados se incorporan a la evaluación del centro y las deficiencias pasan al PAP con su prioridad y plazo.",
          "El informe se cuelga en los documentos del centro con su tipo y fecha, de modo que cuenta en la memoria anual.",
        ],
      },
    ],
  },
  {
    id: "adaptacion",
    titulo: "Personas aptas con limitaciones: informe de adaptación",
    bloques: [
      {
        tipo: "p",
        texto:
          "Cuando vigilancia de la salud declara a una persona apta con limitaciones, envía una línea con sus datos, el reconocimiento, la vigencia y las limitaciones. La línea se importa desde su Excel y la aplicación reconoce cada limitación y propone sus medidas preventivas. El técnico las revisa y puede cambiarlas; si una limitación no se reconoce, queda en blanco con el aviso de que faltan sus medidas. Con todo revisado se emite el informe de adaptación del puesto (art. 25 de la Ley 31/1995).",
      },
      {
        tipo: "lista",
        items: [
          "Se informa al trabajador o trabajadora de las limitaciones indicadas tras su reconocimiento médico.",
          "Se le informa de la vigencia del reconocimiento y de que deberá realizar otro antes de que termine.",
          "Se le informa de que las medidas preventivas derivadas de las limitaciones son de obligado cumplimiento.",
          "Se le informa de que cualquier duda debe comunicarla a su responsable o al responsable de prevención de la empresa.",
          "Se redactan las medidas preventivas de cada limitación.",
        ],
      },
      {
        tipo: "p",
        texto:
          "El informe recoge solo las limitaciones para el puesto, sin datos de diagnóstico, y lo firman el trabajador o trabajadora, el técnico y el responsable del centro. Los datos son confidenciales: solo los ve el técnico.",
      },
    ],
  },
  {
    id: "estructura",
    titulo: "Estructura de la evaluación",
    bloques: [
      {
        tipo: "p",
        texto: "La evaluación de cada centro se organiza en tres partes:",
      },
      {
        tipo: "lista",
        items: [
          "Integración de la prevención: implantación del plan de prevención y acciones transversales que afectan a toda la organización por igual (formación, información, vigilancia de la salud, emergencias y coordinación de actividades empresariales).",
          "Entidades evaluadas y sus relaciones.",
          "Plan formativo.",
        ],
      },
      {
        tipo: "tabla",
        fuente: "ENTIDADES",
        columnas: ["Entidad", "Qué es", "Con qué se relaciona"],
      },
      {
        tipo: "p",
        texto:
          "Los productos químicos no son una entidad propia: se asocian al puesto o a la actividad en la que se usan.",
      },
      {
        tipo: "subtitulo",
        texto: "Plan formativo",
      },
      {
        tipo: "p",
        texto:
          "Se construye con las medidas de formación de la evaluación de cada puesto y puede incluir la formación del puesto (art. 19 de la Ley 31/1995), la exigida por el convenio colectivo, la complementaria en riesgos específicos y otra formación prevista en la ley, como emergencias, primeros auxilios o nivel básico.",
      },
    ],
  },
  {
    id: "maternidad",
    titulo: "Embarazo, parto reciente y lactancia (ERE)",
    bloques: [
      {
        tipo: "p",
        texto:
          "El artículo 26 de la Ley 31/1995 exige que la evaluación determine la naturaleza, el grado y la duración de la exposición de las trabajadoras embarazadas, que han dado a luz o en periodo de lactancia a agentes, procedimientos o condiciones que puedan afectar a su salud, a la del feto o a la del lactante. Cada caso se valora además de forma individual.",
      },
      {
        tipo: "pasos",
        items: [
          { titulo: "Adaptar", texto: "Si hay riesgo, la empresa adapta las condiciones o el tiempo de trabajo, incluido no realizar trabajo nocturno o a turnos." },
          { titulo: "Cambiar de puesto", texto: "Si la adaptación no es posible o no basta (con certificado de los servicios médicos del INSS o de la mutua), la trabajadora pasa a un puesto o función compatible, aunque no sea de su grupo, conservando su retribución." },
          { titulo: "Suspender el contrato", texto: "Si el cambio de puesto no es posible, se tramita la suspensión del contrato por riesgo durante el embarazo o la lactancia natural (art. 45.1.d del Estatuto de los Trabajadores)." },
        ],
      },
      {
        tipo: "subtitulo",
        texto: "Cómo se genera en la aplicación",
      },
      {
        tipo: "p",
        texto:
          "La ERE se deriva de los riesgos de la evaluación del puesto y de sus datos de exposición. En cada puesto se anotan, según sus riesgos, el peso, la frecuencia y las horas de manipulación de cargas, la frecuencia y las horas de flexiones del tronco, el tipo y las horas de trabajo de pie o sentado, el uso de escaleras de mano y, como pregunta previa, si la contención forma parte de la actividad principal (nivel I o II de agresiones). Sin esos datos el puesto no se puede marcar como evaluado. Con ellos, la ERE indica la semana exacta de inicio del riesgo para embarazo único y múltiple, y se descarga en Word y PDF (el usuario del centro, en PDF). Si cambia la evaluación del puesto, la ERE se rehace sola.",
      },
      {
        tipo: "p",
        texto:
          "Los datos de exposición también ajustan la valoración del riesgo: en la manipulación de cargas, menos de 4 kg dan consecuencias ligeramente dañinas, de 4 a 10 kg dañinas y más de 10 kg extremadamente dañinas; menos de 4 veces por hora dan probabilidad baja, 4 o más media y 4 o más durante más de 5 horas al día alta. En las flexiones del tronco y en el uso de escaleras, la frecuencia fija la probabilidad (baja, media o alta).",
      },
      {
        tipo: "p",
        texto:
          "Cada condición de la ERE se activa cuando el puesto tiene el riesgo del que depende. Indica a quién afecta (embarazo, parto reciente, lactancia), la medida, el marco legal y qué supone para el puesto:",
      },
      {
        tipo: "tabla",
        fuente: "ERE_ACCIONES",
        columnas: ["Resultado", "Qué supone"],
      },
      {
        tipo: "tabla",
        fuente: "ERE_DERIVACION",
        columnas: ["Riesgo del puesto", "Condición para la embarazada", "Resultado", "A quién afecta"],
      },
      {
        tipo: "p",
        texto:
          "Si el puesto no activa ninguna condición con riesgo, la ERE lo declara exento de riesgo para el embarazo y la lactancia con las condiciones evaluadas, lo que sirve para la relación de puestos exentos que la empresa determina previa consulta con los representantes de los trabajadores.",
      },
      {
        tipo: "subtitulo",
        texto: "Agentes y condiciones prohibidos (anexo VIII del Real Decreto 39/1997)",
      },
      {
        tipo: "tabla",
        fuente: "ERE_PROHIBIDOS",
        columnas: ["Tipo", "Embarazo", "Lactancia"],
      },
      {
        tipo: "subtitulo",
        texto: "Agentes y condiciones que pueden influir negativamente (anexo VII)",
      },
      {
        tipo: "lista",
        items: [
          "Agentes físicos, cuando puedan causar lesiones fetales o desprendimiento de placenta: choques, vibraciones o movimientos; manipulación manual de cargas pesadas con riesgo dorsolumbar; ruido; radiaciones no ionizantes; frío y calor extremos; movimientos, posturas, desplazamientos, fatiga mental y física.",
          "Agentes biológicos de los grupos 2, 3 y 4, si ellos o su tratamiento ponen en peligro a la embarazada o al feto.",
          "Agentes químicos: sustancias H340, H341, H350, H350i, H351, H361d, H361f y H361fd; agentes de los anexos I y III del Real Decreto 665/1997; mercurio y derivados; medicamentos antimitóticos; monóxido de carbono; agentes de reconocida penetración cutánea.",
          "Procedimientos industriales del anexo I del Real Decreto 665/1997.",
        ],
      },
      {
        tipo: "subtitulo",
        texto: "Criterios de valoración por riesgo",
      },
      {
        tipo: "lista",
        items: [
          "Radiaciones ionizantes: dosis máxima de 1 mSv al feto durante el resto del embarazo (2 mSv en dosímetro de abdomen). Se revisa el historial dosimétrico y se usa dosímetro de abdomen desde la comunicación del embarazo. No participa en exposiciones especialmente autorizadas ni en emergencias de la instalación.",
          "Radiaciones no ionizantes: con niveles habituales no hay riesgo; en el ámbito sanitario, 2 metros de distancia a los equipos de diatermia; en fuentes industriales, retirada si se superan los valores del anexo II del Real Decreto 1066/2001.",
          "Vibraciones: se aparta de la tarea desde la solicitud si A(8) supera 2,5 m/s² en mano-brazo o 0,25 m/s² en cuerpo entero.",
          "Temperaturas: especial atención por encima de 25 ºC o por debajo de 10 ºC; ropa de abrigo adaptada a la gestación.",
          "Ruido: no más de 80 dB(A) diarios ni picos de 135 dB(C); si se superan, retirada desde la semana 20, porque los protectores no protegen al feto.",
          "Manipulación de cargas, flexiones del tronco, escaleras de mano, bipedestación y sedestación: se limitan a partir de la semana que indican las tablas siguientes según la intensidad y la duración de la exposición, en embarazo único o múltiple.",
          "Agentes químicos: se identifican con las fichas de datos de seguridad. Los del anexo VIII no admiten exposición; los del anexo VII exigen una evaluación específica. Gases anestésicos H360D o H360Df sin garantía de no exposición: prestación por riesgo; H361d o H361df: evaluación específica y retirada si no hay valor límite que proteja a la embarazada. Citostáticos: separación del puesto con exposición alta, adaptación con exposición media o baja.",
          "Agentes biológicos: solo se considera el efecto infeccioso. Rubeola, sarampión, varicela, parotiditis y parvovirus: serología y, si es negativa o desconocida y hay riesgo de exposición, apartar del puesto. Citomegalovirus: higiene rigurosa y reubicación en contacto habitual con menores de 3 años. Virus por sangre (VHB, VHC, VIH), Coxsackie y bacterias de transmisión oral: no se justifica la exclusión. Toxoplasma y rubeola figuran en el anexo VIII salvo inmunidad.",
          "Factores psicosociales: el estrés por sí mismo no se considera riesgo para el embarazo. Se valoran la ordenación del tiempo de trabajo (turnos y nocturnidad), el trabajo en aislamiento (riesgo desde la solicitud) y las agresiones en el abdomen.",
          "Agresiones: nivel I cuando la contención forma parte de la actividad principal (como unidades psiquiátricas de agudos o menores en centros tutelados): retirada de esas funciones desde la semana 12. Nivel II cuando no hay contención como actividad principal pero sí posibilidad de agresión: se valora con el registro de agresiones y, si hay riesgo de agresión en el abdomen, pasa a nivel I.",
        ],
      },
      {
        tipo: "p",
        texto:
          "La aplicación propone el nivel de agresiones y el técnico lo confirma en la evaluación del puesto. Propone el nivel I si el centro tiene sala de contención, atiende a adultos con patología psiquiátrica en hospitalización o a menores en régimen residencial u hospitalario, o si el registro de agresiones recoge 3 o más agresiones físicas a ese puesto en los últimos 12 meses. En los demás casos propone el nivel II e indica el número de agresiones registradas.",
      },
      { tipo: "subtitulo", texto: TABLAS_ERE.cargas.titulo },
      { tipo: "tabla", fuente: "ERE_CARGAS", columnas: TABLAS_ERE.cargas.columnas },
      { tipo: "subtitulo", texto: TABLAS_ERE.pesos.titulo },
      { tipo: "tabla", fuente: "ERE_PESOS", columnas: TABLAS_ERE.pesos.columnas },
      { tipo: "subtitulo", texto: TABLAS_ERE.flexion.titulo },
      { tipo: "tabla", fuente: "ERE_FLEXION", columnas: TABLAS_ERE.flexion.columnas },
      { tipo: "subtitulo", texto: TABLAS_ERE.escaleras.titulo },
      { tipo: "p", texto: "Las escaleras fijas de los edificios no están contraindicadas, porque la trabajadora adapta la velocidad de subida. Se valoran las escaleras de mano y las escalas en las que queda a más de 1 metro del suelo." },
      { tipo: "tabla", fuente: "ERE_ESCALERAS", columnas: TABLAS_ERE.escaleras.columnas },
      { tipo: "subtitulo", texto: TABLAS_ERE.bipedestacion.titulo },
      { tipo: "tabla", fuente: "ERE_BIPEDESTACION", columnas: TABLAS_ERE.bipedestacion.columnas },
      { tipo: "subtitulo", texto: TABLAS_ERE.sedestacion.titulo },
      { tipo: "tabla", fuente: "ERE_SEDESTACION", columnas: TABLAS_ERE.sedestacion.columnas },
      {
        tipo: "p",
        texto:
          "Las semanas de las tablas son orientativas: las determina la entidad colaboradora o el criterio médico según la guía de la SEGO, el INSS y la AMAT.",
      },
    ],
  },
  {
    id: "pac",
    titulo: "Comprobación de condiciones (PAC)",
    bloques: [
      {
        tipo: "p",
        texto:
          "En cada visita se recorre el cuestionario de comprobación del centro. Todos los puntos se consideran correctos salvo que se registre una incidencia. Algunos bloques solo se revisan si el centro dispone de ese equipo o instalación.",
      },
      {
        tipo: "p",
        texto:
          "Cada incidencia se califica según el nivel de deficiencia observado y las consecuencias que podría tener:",
      },
      {
        tipo: "tabla",
        fuente: "NIVELES_DEFICIENCIA",
        columnas: ["Nivel de deficiencia", "Criterio"],
      },
      {
        tipo: "matrizPac",
      },
      {
        tipo: "p",
        texto:
          "En la siguiente visita se comprueba que cada incidencia está resuelta, en lugar de valorar la eficacia de la medida como en la planificación preventiva.",
      },
    ],
  },
  {
    id: "seguimiento",
    titulo: "Seguimiento de las medidas",
    bloques: [
      {
        tipo: "p",
        texto:
          "Cada medida de la planificación preventiva y cada incidencia de la comprobación de condiciones tiene uno de estos estados. El centro puede actualizarlos desde su acceso y queda registrado quién hizo el cambio y cuándo.",
      },
      {
        tipo: "tabla",
        fuente: "ESTADOS_ACCION",
        columnas: ["Estado", "Significado"],
      },
    ],
  },
  {
    id: "equipos",
    titulo: "Evaluación de equipos e instalaciones",
    bloques: [
      {
        tipo: "p",
        texto:
          "Los equipos de trabajo y las instalaciones de cada centro se evalúan por separado. Hay equipos e instalaciones fijos, presentes en todos los centros, y otros que se preguntan; la aplicación propone su presencia según la ficha del centro (cocina propia, lavandería, ascensor) y el técnico la confirma. Se pueden añadir otros equipos o instalaciones del centro.",
      },
      {
        tipo: "tabla",
        fuente: "EQUIPOS_CATALOGO",
        columnas: ["Código", "Equipo o instalación", "Tipo", "Presencia", "Marco legal"],
      },
      {
        tipo: "p",
        texto:
          "En cada equipo se comprueba el marcado CE, la declaración de conformidad, el libro de instrucciones, si se hace mantenimiento preventivo y si se registra (estas dos pueden no ser necesarias). En cada instalación, la revisión anual, la revisión trimestral, la inspección por organismo de control autorizado (OCA) —estas dos pueden no ser necesarias según su reglamento—, el registro de incidencias y el mantenimiento preventivo. Por defecto todo se considera correcto y solo se marca lo que falta.",
      },
      {
        tipo: "p",
        texto:
          "Los riesgos se marcan con botones (golpe, electricidad, ruido, vibración, corte, temperaturas extremas, atrapamiento y otros), todos activos por defecto, y la valoración por defecto es probabilidad baja y consecuencias dañinas (tolerable). Todo es editable.",
      },
      {
        tipo: "lista",
        items: [
          "Equipos, siempre: seguir las instrucciones del fabricante y registrar las incidencias.",
          "Equipos sin libro de instrucciones: solicitarlo al fabricante o suministrador.",
          "Equipos sin mantenimiento preventivo: realizarlo para garantizar la seguridad del equipo, según las instrucciones del fabricante.",
          "Equipos cuyo mantenimiento no se registra: registrar la documentación de mantenimiento en la carpeta de documentación específica del centro.",
          "Equipos sin marcado CE o sin declaración de conformidad: solicitar la declaración al fabricante o suministrador; si el equipo no tiene marcado CE, comprobar que cumple el anexo I del RD 1215/1997 o retirarlo de uso.",
          "Instalaciones, siempre: registrar las incidencias. Cada respuesta «no» es una incidencia que hay que corregir, con su medida concreta.",
        ],
      },
      {
        tipo: "p",
        texto:
          "Las medidas pasan al PAP del centro como acciones, con el equipo o la instalación en lugar del puesto y el riesgo del catálogo que corresponde a cada botón. Las medidas comunes, como seguir las instrucciones del fabricante, se unen en una sola acción para todos los equipos.",
      },
    ],
  },
  {
    id: "visita",
    titulo: "Visita al centro e informe",
    bloques: [
      {
        tipo: "pasos",
        items: [
          { titulo: "Preparación", texto: "Listado de puestos del centro para confirmar en la visita." },
          { titulo: "Reunión inicial con la dirección", texto: "Datos del centro y acceso a la plataforma (usuario y contraseña)." },
          { titulo: "Inicio de la evaluación", texto: "Técnico que firma, titulación, fecha y persona que acompaña." },
          { titulo: "Entrevistas con el personal", texto: "Lista de comprobación del centro y evaluación de cada puesto con sus datos de exposición." },
          { titulo: "Embarazo y limitaciones", texto: "Registro confidencial, sin nombres, de las situaciones de embarazo, parto reciente, lactancia y personas con limitaciones." },
          { titulo: "Visita a las instalaciones", texto: "Comprobación del lugar de trabajo y evaluación de los equipos e instalaciones a la vez." },
          { titulo: "Reunión final con la dirección", texto: "Resumen, cierre de la evaluación, acceso y entrega de la documentación." },
        ],
      },
      {
        tipo: "p",
        texto:
          "El informe lo firman en pantalla, al final de la visita, el técnico, la dirección del centro y el acompañante (normalmente un representante de los trabajadores). El informe de evaluación del centro recoge el objeto, los datos del centro, la metodología, los puestos evaluados y su evaluación, los equipos e instalaciones, la comprobación del lugar de trabajo, la protección de la maternidad, el resumen de la planificación, el control de cambios y la firma del técnico. Con la documentación completa (informe, PAP, información de riesgos, ERE, EPI y formación de cada puesto, equipos e instalaciones y lugar de trabajo) se genera un único PDF.",
      },
    ],
  },
  {
    id: "cambios",
    titulo: "Control de cambios",
    bloques: [
      {
        tipo: "p",
        texto:
          "Solo se registran las evaluaciones de riesgos de centro que quedan cerradas. La primera evaluación cerrada de un centro es la versión 1. Cuando se crea una nueva evaluación de un centro ya evaluado, se pide el motivo; al cerrarla se registra como la versión siguiente, con ese motivo. En todos los casos se guardan las fechas de inicio y de cierre, la versión de la metodología y el número de puestos evaluados.",
      },
      {
        tipo: "p",
        texto:
          "Si una evaluación cerrada se reabre, sale del control de cambios hasta que se vuelve a cerrar, y conserva su número de versión.",
      },
      {
        tipo: "p",
        texto:
          "La aplicación avisa cuando una evaluación está a 30 días de cumplir doce meses desde su cierre y cuando los cumple. El usuario de cada centro (normalmente la dirección) recibe por correo esos avisos y los de las acciones del PAP y de la PAC que vencen en 7 días, mañana y hoy.",
      },
      {
        tipo: "p",
        texto:
          "La nueva versión parte de la última evaluación cerrada: copia los riesgos y los datos de exposición de cada puesto (que quedan en curso para revisarlos), la lista de comprobación y el PAP con sus estados. Los puestos nuevos entran como pendientes.",
      },
    ],
  },
  {
    id: "revision",
    titulo: "Revisión de la evaluación",
    bloques: [
      {
        tipo: "p",
        texto:
          "La evaluación se revisa al menos una vez al año para confirmar que sigue vigente. La aplicación avisa cuando una evaluación supera los doce meses sin revisar. Además, se revisa siempre que:",
      },
      {
        tipo: "lista",
        items: [
          "Se incorporen equipos, productos, tecnologías o formas de trabajo nuevas, o se modifiquen los lugares de trabajo.",
          "Se cree un puesto nuevo o cambien de forma relevante las tareas de uno existente.",
          "Se incorpore una persona especialmente sensible o una trabajadora comunique su embarazo o lactancia.",
          "Se produzcan daños a la salud o se detecte que las medidas preventivas no son eficaces.",
          "Lo indiquen los controles periódicos o lo acuerden la empresa y los representantes de los trabajadores.",
          "Lo establezca una disposición específica (art. 4 del Real Decreto 39/1997).",
        ],
      },
    ],
  },
  {
    id: "documentacion",
    titulo: "Participación y documentación",
    bloques: [
      {
        tipo: "p",
        texto:
          "Se consulta a los delegados de prevención sobre el procedimiento de evaluación y sus resultados. Las personas trabajadoras reciben la información de los riesgos de su puesto y de las medidas que les afectan.",
      },
      {
        tipo: "p",
        texto:
          "La evaluación, la planificación, la comprobación de condiciones y los informes asociados quedan registrados en la aplicación con su versión y fecha. Cada evaluación conserva la versión de esta metodología con la que se realizó.",
      },
    ],
  },
];

export const ESPECIFICAS = [
  {
    ambito: "Psicosocial",
    cuando:
      "Si se detectan riesgos de carga mental, organización del trabajo, turnos, trato con pacientes o conflictos.",
    referencia: "Método validado, como el FPSICO del INSST.",
  },
  {
    ambito: "Violencia externa",
    cuando: "Siempre que haya atención directa a pacientes.",
    referencia:
      "Protocolo de prevención de agresiones y registro de incidentes del centro.",
  },
  {
    ambito: "Movilización de pacientes y cargas",
    cuando: "Puestos con movilización de pacientes o manejo habitual de cargas.",
    referencia:
      "Métodos específicos de movilización de pacientes y normativa de manipulación manual de cargas.",
  },
  {
    ambito: "Agentes biológicos",
    cuando:
      "Contacto con sangre, fluidos o pacientes con enfermedades transmisibles.",
    referencia: "Normativa de exposición a agentes biológicos.",
  },
  {
    ambito: "Agentes químicos",
    cuando: "Uso habitual de productos de limpieza, desinfección o lavandería.",
    referencia: "Normativa de agentes químicos y fichas de seguridad.",
  },
  {
    ambito: "Pantallas de visualización",
    cuando: "Uso de pantallas durante una parte relevante de la jornada.",
    referencia: "Normativa de pantallas de visualización.",
  },
  {
    ambito: "Condiciones ambientales",
    cuando: "Dudas sobre iluminación, temperatura, humedad o ruido.",
    referencia: "Informe de mediciones de una empresa externa colaboradora, según la normativa de lugares de trabajo (ver «Actividades concertadas con entidades externas»).",
  },
];

// Actividades que realizan entidades externas (tabla de la sección «concertadas»)
export const ENTIDAD_VS = "Quirón Prevención";
export const CONCERTADAS = [
  {
    actividad: "Vigilancia de la salud (Medicina del Trabajo)",
    quien: `${ENTIDAD_VS}, servicio de prevención ajeno concertado.`,
    spm: "Le facilita los riesgos de cada puesto para que aplique los protocolos específicos; recibe solo la aptitud (apto, apto con limitaciones, no apto), sin datos de diagnóstico; emite el informe de adaptación de las personas aptas con limitaciones.",
    donde: "Cartas de aptitud importadas en la plataforma; memoria de vigilancia de la salud en los documentos generales.",
  },
  {
    actividad: "Informes de condiciones ambientales (iluminación, temperatura, humedad, ruido, calidad del aire)",
    quien: "Empresa externa colaboradora.",
    spm: "Decide cuándo hacen falta (dudas en la evaluación, quejas, cambios en el local), revisa el informe e incorpora los resultados y las medidas a la evaluación del centro.",
    donde: "Documentos del centro (tipo «mediciones»).",
  },
  {
    actividad: "Medidas de emergencia (art. 20 de la Ley 31/1995)",
    quien: "Empresa externa colaboradora.",
    spm: "Revisa que se adapten al centro (pacientes que necesitan evacuación asistida, turno de noche), comprueba la designación y formación de los equipos de emergencia y el registro de los simulacros.",
    donde: "Documentos del centro (tipos «emergencias» y «simulacro»).",
  },
  {
    actividad: "Planes de autoprotección (Norma Básica de Autoprotección, Real Decreto 393/2007, y normativa autonómica)",
    quien: "Empresa externa colaboradora.",
    spm: "Comprueba en qué centros es obligatorio, revisa el plan, su implantación (formación y simulacros) y su revisión periódica.",
    donde: "Documentos del centro (tipo «emergencias»).",
  },
];

// Equivalencia entre los códigos del catálogo y la lista oficial de formas de accidente (01 a 30)
export const EQUIVALENCIA_RIESGOS = [
  ["R01", "Caídas a distinto nivel", "01 · Caída de personas a distinto nivel", "Directa"],
  ["R02", "Caídas al mismo nivel", "02 · Caída de personas al mismo nivel", "Directa"],
  ["R03", "Caída de objetos por desplome", "03 · Caída de objetos por derrumbamiento", "Directa"],
  ["R04", "Caída de objetos en manipulación", "04 · Caída de objetos por manipulación", "Directa"],
  ["R05", "Caídas de objetos desprendidos", "05 · Caída de objetos desprendidos", "Directa"],
  ["R06", "Pisadas sobre objetos", "06 · Pisadas sobre objetos", "Directa"],
  ["R07", "Golpes contra objetos inmóviles", "07 · Golpes contra objetos inmóviles", "Directa"],
  ["R08", "Golpes/contactos con elementos móviles de máquinas", "08 · Golpes y contactos con elementos móviles de la máquina", "Directa"],
  ["R09", "Golpes o cortes por objetos/herramientas", "09 · Golpes por objetos o herramientas", "Directa"],
  ["R10", "Proyección de fragmentos o partículas", "10 · Proyección de fragmentos o partículas", "Directa"],
  ["R11", "Atrapamientos por o entre objetos", "11 · Atrapamiento por o entre objetos", "Directa"],
  ["R12", "Atrapamientos por vuelco de máquinas o vehículos", "12 · Atrapamientos por vuelta de máquinas", "Directa"],
  ["R13", "Contactos térmicos", "15 · Contactos térmicos", "Directa"],
  ["R14", "Contactos eléctricos", "16 · Contactos eléctricos", "Directa"],
  ["R15", "Contactos con sustancias cáusticas/corrosivas", "18 · Contactos con sustancias cáusticas y/o corrosivas", "Directa"],
  ["R16", "Explosiones", "20 · Explosiones", "Directa"],
  ["R17", "Incendios", "21 · Fuego", "Directa"],
  ["R18", "Accidentes causados por seres vivos", "22 · Causados por seres vivos", "Directa"],
  ["R19", "Agresiones físicas", "22 · Causados por seres vivos", "Aproximada"],
  ["R20", "Atracos y robos con violencia", "22 · Causados por seres vivos", "Aproximada"],
  ["R21", "Atropellos, golpes o choques contra o con vehículos", "23 · Atropellos, golpes y choques contra vehículos", "Directa"],
  ["R22", "Accidentes de tráfico/desplazamiento", "24 · Accidentes de tráfico", "Directa"],
  ["R23", "Estrés térmico", "14 · Exposición a temperaturas extremas", "Directa"],
  ["R24", "Condiciones climatológicas adversas", "26 · Otras", "Aproximada"],
  ["R25", "Inhalación/contacto/ingestión de sustancias nocivas", "17 · Inhalación o ingestión de sustancias nocivas", "Directa"],
  ["R26", "Exposición a radiaciones", "19 · Exposiciones a radiación", "Directa"],
  ["R27", "Exposición a agentes químicos", "27 · Agentes químicos", "Directa"],
  ["R28", "Exposición a agentes físicos", "28 · Agentes físicos", "Directa"],
  ["R29", "Exposición a agentes biológicos", "29 · Agentes biológicos", "Directa"],
  ["R30", "Carga física", "13 · Sobreesfuerzos", "Aproximada"],
  ["R31", "Fatiga por uso de PVD", "30 · Otras circunstancias (enfermedad)", "Aproximada"],
  ["R32", "Condiciones de iluminación", "28 · Agentes físicos", "Aproximada"],
  ["R33", "Condiciones higrotérmicas", "28 · Agentes físicos", "Aproximada"],
  ["R34", "Disconfort ambiental", "28 · Agentes físicos", "Aproximada"],
  ["R35", "Sobreesfuerzos vocales", "30 · Otras circunstancias (enfermedad)", "Aproximada"],
  ["R36", "Estrés laboral", "30 · Otras circunstancias (enfermedad)", "Sin equivalente claro"],
  ["R37", "Fatiga derivada de la ordenación del tiempo de trabajo", "30 · Otras circunstancias (enfermedad)", "Sin equivalente claro"],
  ["R38", "Violencia en el trabajo", "22 · Causados por seres vivos", "Aproximada"],
  ["R39", "Otros riesgos", "26 · Otras", "Directa"],
];

// Qué comprende cada riesgo del catálogo (redacción propia a partir de la metodología general de referencia)
export const DEFINICIONES_RIESGOS = [
  ["R01", "Caídas de personas a distinto nivel", "Pérdida de equilibrio con diferencia de altura. Especial atención a los trabajos en altura (más de 2 m, o más de 3,5 m al punto de operación con escalera de mano). Escaleras de mano o fijas, andamios, huecos sin proteger."],
  ["R02", "Caídas de personas al mismo nivel", "Caídas en zonas de paso o superficies de trabajo y caídas sobre objetos. Falta de orden y limpieza, suelos resbaladizos o en mal estado."],
  ["R03", "Caídas de objetos por desplome", "Desplome sin intervención humana de estanterías, apilamientos, muros o estructuras. Almacenamiento inadecuado."],
  ["R04", "Caídas de objetos en manipulación", "Caída sobre la propia persona del objeto que transporta o eleva. Objetos pesados, voluminosos o con aristas."],
  ["R05", "Caídas de objetos desprendidos", "Caída de objetos que manipulan otras personas o que se desprenden por deficiencias del centro."],
  ["R06", "Pisadas sobre objetos", "Pisadas sobre objetos cortantes o punzantes en las zonas de trabajo."],
  ["R07", "Golpes contra objetos inmóviles", "La persona se golpea o roza con un objeto que no se mueve. Espacio insuficiente, zonas sin delimitar."],
  ["R08", "Golpes o contactos con elementos móviles de máquinas", "Golpes, cortes o abrasiones por partes móviles de máquinas, sin atrapamiento. Protecciones ausentes o anuladas."],
  ["R09", "Golpes o cortes por objetos o herramientas", "Golpes, cortes y pinchazos con herramientas u objetos movidos por fuerzas distintas de la gravedad."],
  ["R10", "Proyección de fragmentos o partículas", "Partículas, fragmentos o salpicaduras de líquidos proyectados sobre el cuerpo."],
  ["R11", "Atrapamientos por o entre objetos", "Atrapamiento o aplastamiento de una parte del cuerpo entre piezas, materiales o elementos de máquinas."],
  ["R12", "Atrapamientos por vuelco de máquinas o vehículos", "Aplastamiento por vuelco de carretillas, vehículos u otras máquinas."],
  ["R13", "Contactos térmicos", "Contacto con superficies o productos muy calientes o muy fríos."],
  ["R14", "Contactos eléctricos", "Contacto directo o indirecto con elementos en tensión. Cableado al descubierto, instalaciones defectuosas."],
  ["R15", "Contactos con sustancias cáusticas o corrosivas", "Contacto con productos agresivos para la piel y las mucosas. Trasvases y mezclas inadecuados."],
  ["R16", "Explosiones", "Aumento brusco de volumen, rotura de recipientes a presión o deflagración de atmósferas inflamables."],
  ["R17", "Incendios", "Accidentes producidos por el fuego o sus consecuencias."],
  ["R18", "Accidentes causados por seres vivos", "Daños causados directamente por personas o animales: mordeduras, picaduras, molestias."],
  ["R19", "Agresiones físicas", "Uso intencionado de la fuerza contra la persona trabajadora."],
  ["R20", "Atracos y robos con violencia", "Violencia o intimidación para apoderarse de bienes que custodia la persona trabajadora."],
  ["R21", "Atropellos, golpes o choques con vehículos", "Atropellos o accidentes de vehículos dentro del recinto del centro."],
  ["R22", "Accidentes de tráfico o en desplazamiento", "Accidentes en la vía pública durante la jornada o al ir y volver del trabajo (in itinere)."],
  ["R23", "Estrés térmico", "Alteraciones por ambientes muy calurosos o fríos, o por trabajo físico intenso en condiciones desfavorables."],
  ["R24", "Condiciones climatológicas adversas", "Lluvia, viento, calor, frío o radiación solar en desplazamientos o trabajos al exterior."],
  ["R25", "Inhalación, contacto o ingestión de sustancias nocivas", "Efectos inmediatos de sustancias perjudiciales por fugas, derrames, trasvases o mezclas."],
  ["R26", "Exposición a radiaciones", "Radiaciones ionizantes (rayos X) y no ionizantes (campos electromagnéticos, radiación óptica)."],
  ["R27", "Exposición a agentes químicos", "Exposición corta y elevada o continuada a sustancias químicas que pueden causar enfermedad profesional."],
  ["R28", "Exposición a agentes físicos", "Ruido, vibraciones y otras formas de energía que pueden causar enfermedad profesional."],
  ["R29", "Exposición a agentes biológicos", "Microorganismos, cultivos celulares y endoparásitos que pueden causar infección, alergia o toxicidad. Contacto con pacientes, fluidos o residuos."],
  ["R30", "Carga física", "Lesiones musculoesqueléticas por posturas forzadas, manipulación de cargas, movilización de personas, movimientos repetitivos o aplicación de fuerzas."],
  ["R31", "Fatiga por uso de pantallas (PVD)", "Riesgos visuales, posturales y de carga mental por el uso de pantallas, también en el trabajo a distancia."],
  ["R32", "Condiciones de iluminación", "Niveles de iluminación insuficientes para circular y trabajar con seguridad o que provocan fatiga visual."],
  ["R33", "Condiciones termohigrométricas", "Temperatura, humedad, velocidad del aire y renovación de aire de los lugares de trabajo."],
  ["R34", "Disconfort ambiental", "Incomodidad acústica, térmica o lumínica sin riesgo para la salud."],
  ["R35", "Sobreesfuerzos vocales", "Trastornos de la voz por hablar de forma continuada, con intensidad o con ruido de fondo."],
  ["R36", "Estrés laboral", "Desajuste entre las exigencias del trabajo y las capacidades o recursos de la persona: carga y ritmo, contenido, relaciones, rol, desarrollo."],
  ["R37", "Fatiga por la ordenación del tiempo de trabajo", "Turnos, nocturnidad, prolongación de jornada o falta de descanso entre jornadas."],
  ["R38", "Violencia en el trabajo", "Violencia física, psicológica o sexual, también en el ámbito digital, de terceros o entre personas de la organización."],
  ["R39", "Otros riesgos", "Cualquier otro riesgo no recogido en los anteriores."],
];

export const TIPOS_MEDIDA = [
  ["FOR", "Formación."],
  ["INF", "Información."],
  ["CP", "Control periódico: debe mantenerse en el tiempo."],
  ["EPI", "Equipos de protección individual."],
  ["RP", "Necesidad de recurso preventivo."],
  ["PRO", "Procedimiento de trabajo."],
  ["PA", "Requiere un estudio específico o presupuesto adicional."],
];

export const ENTIDADES = [
  ["Lugar de trabajo", "Espacio delimitado cuyas condiciones afectan por igual a varios puestos, incluidos aseos, locales de descanso, primeros auxilios y comedores.", "Instalaciones y puestos."],
  ["Instalación", "Servicio o suministro aneja al lugar de trabajo: electricidad, gas, calefacción, climatización, protección contra incendios.", "Lugares de trabajo."],
  ["Puesto de trabajo", "Conjunto de tareas relacionadas que realizan una o varias personas, con o sin productos químicos, equipos y herramientas.", "Actividades, equipos y lugares de trabajo."],
  ["Actividad", "Tarea común a varios puestos, como la limpieza, el uso de escalera de mano o la turnicidad.", "Puestos y equipos."],
  ["Equipo de trabajo", "Cualquier máquina utilizada en el trabajo.", "Puestos y actividades."],
];

import { ELEMENTOS as ELEMENTOS_EQ } from "./equiposContenido.js";
const marcas = (e) => [e.EM && "Embarazo", e.PR && "Parto reciente", e.LA && "Lactancia"].filter(Boolean).join(", ");

// Mapa para que la vista resuelva tablas por nombre
export const FUENTES = {
  CONSECUENCIAS: CONSECUENCIAS.map((c) => [`${c.nombre} (${c.codigo})`, c.descripcion, c.ejemplos]),
  PROBABILIDADES: PROBABILIDADES.map((p) => [`${p.nombre} (${p.codigo})`, p.descripcion]),
  NIVELES: NIVELES.map((n) => [`${n.nombre} (${n.codigo})`, n.actuacion, n.plazo]),
  NIVELES_DEFICIENCIA: NIVELES_DEFICIENCIA.map((d) => [d.nombre, d.descripcion]),
  PRIORIDADES_PAC: PRIORIDADES_PAC.map((p) => [p.nombre, p.plazo]),
  ESTADOS_ACCION: ESTADOS_ACCION.map((e) => [e.nombre, e.descripcion]),
  ESPECIFICAS: ESPECIFICAS.map((e) => [e.ambito, e.cuando, e.referencia]),
  CONCERTADAS: CONCERTADAS.map((c) => [c.actividad, c.quien, c.spm, c.donde]),
  EQUIVALENCIA: EQUIVALENCIA_RIESGOS,
  DEFINICIONES: DEFINICIONES_RIESGOS,
  TIPOS_MEDIDA,
  ENTIDADES,
  ERE_ACCIONES: Object.values(ACCIONES_ERE).map((a) => [a.nombre, {
    "No compatible: retirada del puesto o de la tarea": "La tarea no puede realizarse durante el embarazo o la lactancia: se retira o se cambia de puesto.",
    "Limitar a partir de la semana indicada": "La tarea se limita desde la semana de gestación que indica la tabla según la exposición.",
    "Adaptar el puesto": "Se adaptan las condiciones o el tiempo de trabajo.",
    "Valoración individual (serología, medición o fichas de seguridad)": "Depende de un dato de la trabajadora o del puesto: estado inmune, medición o fichas de datos de seguridad.",
    "Sin riesgo específico: medidas habituales": "No justifica la exclusión; se aplican las medidas habituales.",
  }[a.nombre] ?? ""]),
  ERE_DERIVACION: CONDICIONES_ERE.map((c) => [`${c.r} · ${c.riesgo}`, c.condicion, ACCIONES_ERE[c.accion].nombre, marcas(c)]),
  ERE_PROHIBIDOS: [
    ["Agentes físicos", "Radiaciones ionizantes; trabajos en atmósferas de sobrepresión elevada (locales a presión, submarinismo).", "—"],
    ["Agentes biológicos", "Toxoplasma y virus de la rubeola, salvo inmunización suficiente.", "—"],
    ["Agentes químicos", "Cancerígenos y mutágenos de categoría 1A y 1B; plomo y derivados absorbibles; sustancias H360D, H360F, H360FD, H360Fd y H360Df (antiguas R60 y R61).", "Cancerígenos y mutágenos de categoría 1A y 1B; plomo y derivados; sustancias H362 (antigua R64)."],
    ["Condiciones de trabajo", "Trabajos de minería subterránea.", "Trabajos de minería subterránea."],
  ],
  EQUIPOS_CATALOGO: ELEMENTOS_EQ.map((e) => [e.codigo, e.nombre, e.tipo === "equipo" ? "Equipo" : "Instalación", e.fijo ? "Fijo" : `Se pregunta${e.porque ? ` (se propone si ${e.porque})` : ""}`, e.legal]),
  ERE_CARGAS: TABLAS_ERE.cargas.filas,
  ERE_PESOS: TABLAS_ERE.pesos.filas,
  ERE_FLEXION: TABLAS_ERE.flexion.filas,
  ERE_ESCALERAS: TABLAS_ERE.escaleras.filas,
  ERE_BIPEDESTACION: TABLAS_ERE.bipedestacion.filas,
  ERE_SEDESTACION: TABLAS_ERE.sedestacion.filas,
};
