// Evaluación de riesgos para trabajadoras embarazadas, que han dado a luz o en periodo de lactancia (ERE).
// Catálogo de condiciones que se derivan de los riesgos de la evaluación del puesto.
// Criterios: art. 26 Ley 31/1995, anexos VII y VIII RD 39/1997 (RD 298/2009) y guía SEGO, INSS y AMAT.
// Si se cambia el contenido, se sube ERE_VERSION y la versión de la metodología.

export const ERE_VERSION = '1.1'
export const MARCO_ERE = 'SEGO, INSS, AMAT'
export const SEGO = 'a partir de la semana de gestación que corresponda según la tabla, que determina la entidad colaboradora y/o el criterio médico en base a la guía de la SEGO, el INSS y la AMAT'

// Qué supone cada condición para el puesto
export const ACCIONES = {
  retirada: { nombre: 'No compatible: retirada del puesto o de la tarea', orden: 0, color: '#c62828' },
  limitar: { nombre: 'Limitar a partir de la semana indicada', orden: 1, color: '#ef6c00' },
  adaptar: { nombre: 'Adaptar el puesto', orden: 2, color: '#f9a825' },
  valorar: { nombre: 'Valoración individual (serología, medición o fichas de seguridad)', orden: 3, color: '#1565c0' },
  sin_exclusion: { nombre: 'Sin riesgo específico: medidas habituales', orden: 4, color: '#2e7d32' },
}

// ---------- Tablas de semana de inicio del riesgo (embarazo único / múltiple) ----------
const T = 'Riesgo tolerable'
export const TABLAS_ERE = {
  cargas: {
    titulo: 'Manipulación manual de cargas: semana de inicio del riesgo',
    columnas: ['Peso', 'Frecuencia', 'Único >5 h/día', 'Único 3-5 h/día', 'Único 2-3 h/día', 'Múltiple >5 h/día', 'Múltiple 3-5 h/día', 'Múltiple 2-3 h/día'],
    filas: [
      ['Más de 10 kg', '4 o más veces/hora', 20, 22, 24, 18, 20, 22],
      ['Más de 10 kg', 'Menos de 4 veces/hora', 24, 26, 28, 22, 24, 26],
      ['De 4 a 10 kg', '4 o más veces/hora', 24, 28, 30, 22, 26, 28],
      ['De 4 a 10 kg', 'Menos de 4 veces/hora', 28, 34, 36, 26, 32, 34],
      ['Menos de 4 kg', '—', T, T, T, T, T, T],
    ],
  },
  pesos: {
    titulo: 'Pesos máximos (kg) por debajo de los cuales no habría riesgo en el embarazo',
    columnas: ['Altura de la carga', 'Hasta sem. 20, próxima', 'Hasta sem. 20, alejada', 'Desde sem. 20, próxima', 'Desde sem. 20, alejada', 'Desde sem. 28, próxima', 'Desde sem. 28, alejada'],
    filas: [
      ['Cabeza', 7.8, 4.2, 5.2, '—', 'No manipular', 'No manipular'],
      ['Hombro', 11.4, 6.6, 7.6, 4.4, 3.8, 3.8],
      ['Codo', 15, 7.8, 10, 5.2, 5, 5],
      ['Nudillos', 12, 8, 8, 4.8, 4, 4],
      ['Media pierna', 8.4, 4.8, 5.6, '—', 'No manipular', 'No manipular'],
    ],
  },
  flexion: {
    titulo: 'Flexión del tronco de más de 60º (manos por debajo de la rodilla): semana de inicio del riesgo',
    columnas: ['Frecuencia', 'Único >5 h/día', 'Único 3-5 h/día', 'Único 2-3 h/día', 'Múltiple >5 h/día', 'Múltiple 3-5 h/día', 'Múltiple 2-3 h/día'],
    filas: [
      ['Más de 10 veces/hora', 20, 22, 24, 18, 20, 22],
      ['Entre 2 y 10 veces/hora', 28, 34, 36, 26, 32, 34],
      ['Menos de 2 veces/hora', T, T, T, T, T, T],
    ],
  },
  escaleras: {
    titulo: 'Escaleras de mano: semana de inicio del riesgo',
    columnas: ['Frecuencia', 'Altura', 'Escalera de mano, único', 'Escalera de mano, múltiple', 'Escala o poste vertical, único', 'Escala o poste vertical, múltiple'],
    filas: [
      ['Menos de 4 veces/jornada', 'Más de 1 m', 37, 32, 26, 24],
      ['Menos de 4 veces/jornada', 'Menos de 1 m', T, T, 34, 32],
      ['De 4 a 8 veces/jornada', 'Más de 1 m', 30, 28, 20, 18],
      ['De 4 a 8 veces/jornada', 'Menos de 1 m', 34, 32, 26, 24],
      ['Más de 8 veces/jornada', 'Más de 1 m', 26, 24, 18, 16],
      ['Más de 8 veces/jornada', 'Menos de 1 m', 30, 28, 20, 18],
    ],
  },
  bipedestacion: {
    titulo: 'Bipedestación: semana de inicio del riesgo',
    columnas: ['Tipo', 'Único >5 h/día', 'Único 3-5 h/día', 'Único 2-3 h/día', 'Múltiple >5 h/día', 'Múltiple 3-5 h/día', 'Múltiple 2-3 h/día'],
    filas: [
      ['Estática e ininterrumpida (de pie en el sitio, sin poder moverse)', 22, 26, 30, 20, 24, 26],
      ['Dinámica, discontinua o intermitente (15 minutos o más por hora)', 30, 34, T, 28, 32, T],
    ],
  },
  sedestacion: {
    titulo: 'Sedestación prolongada: semana de inicio del riesgo',
    columnas: ['Tipo', 'Único >5 h/día', 'Único 3-5 h/día', 'Único 2-3 h/día', 'Múltiple >5 h/día', 'Múltiple 3-5 h/día', 'Múltiple 2-3 h/día'],
    filas: [
      ['Sin posibilidad de cambiar de postura', 33, 37, T, 31, 34, T],
      ['Con posibilidad de cambiar de postura', T, T, T, T, T, T],
    ],
  },
}

// ---------- Ayudas para las condiciones de disparo ----------
const sin = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
const de = (riesgos, re) => (f) => riesgos.includes(f.riesgo_id) && (!re || re.test(sin(f.condicion)))
const no = (re) => (f) => !re.test(sin(f.condicion))
const y = (...fs) => (f) => fs.every((g) => g(f))
const o = (...fs) => (f) => fs.some((g) => g(f))

const BIO_SANITARIO = y(de(['R29']), no(/aliment|crudo|cocina/))
const SEROLOGIA = 'La condición de embarazo no presupone por sí misma la existencia de riesgo. Se valora el puesto y el estado de inmunización de la trabajadora mediante una analítica de anticuerpos. Si la serología es negativa, o mientras no se conozca, y existe sospecha razonable de exposición, se aparta del puesto de trabajo.'

// Cada condición: id, riesgo, condición para la embarazada, medidas, a quién aplica (EM, PR, LA), acción, tabla y disparo.
// «si» recibe una fila de la evaluación del puesto ({riesgo_id, condicion}) y dice si la condición le afecta.
export const CONDICIONES_ERE = [
  // ----- Seguridad -----
  {
    id: 'R01-escaleras', r: 'R01', riesgo: 'Caídas de personas a distinto nivel', grupo: 'Escaleras de mano',
    condicion: 'Utilización de escaleras de mano o escalas a más de 1 metro de altura.',
    medidas: [`Limitar las tareas que obliguen a subir a escaleras de mano o escalas a más de 1 metro ${SEGO}. Evitar en ellas las tareas que obliguen a alejarse del eje de la escalera o a ocupar las dos manos.`],
    EM: true, PR: false, LA: false, accion: 'limitar', tabla: 'escaleras',
    si: de(['R01'], /escalera(s)? (de mano|manual|portatil)|escala|escabel|altura/),
  },
  {
    id: 'R04-hombros', r: 'R04', riesgo: 'Caídas de objetos en manipulación', grupo: 'Golpes en el abdomen',
    condicion: 'Caída de objetos en manipulación, en especial por encima de los hombros.',
    medidas: ['Adaptación del puesto: restringir las tareas con riesgo de golpe en el abdomen, como manipular objetos elevando los brazos por encima de los hombros.'],
    EM: true, PR: false, LA: false, accion: 'adaptar',
    si: de(['R04']),
  },
  {
    id: 'R07-espacio', r: 'R07', riesgo: 'Golpes contra objetos inmóviles', grupo: 'Golpes en el abdomen',
    condicion: 'Espacio insuficiente para acceder o transitar.',
    medidas: ['Adaptación del puesto: restringir las tareas con riesgo de golpe en el abdomen, como los desplazamientos frecuentes, a ritmo elevado, con o sin carga, por espacios estrechos o muy concurridos.'],
    EM: true, PR: false, LA: false, accion: 'adaptar',
    si: de(['R07']),
  },
  // ----- Higiénicos: físicos y químicos -----
  {
    id: 'R26-ionizantes', r: 'R26', riesgo: 'Exposición a radiaciones', grupo: 'Radiaciones',
    condicion: 'Exposición a radiaciones ionizantes.',
    medidas: ['La dosis equivalente al feto no puede superar 1 mSv durante el resto del embarazo (2 mSv en el dosímetro de abdomen). Revisar el historial dosimétrico y colocar un dosímetro de abdomen desde la comunicación del embarazo. No participar en exposiciones especialmente autorizadas ni en situaciones del plan de emergencia de la instalación. Las tareas con exposición sin barrera estructural ni distancia (fluoroscopia, radiología intervencionista o móvil, manipulación de radiofármacos, braquiterapia manual) no son compatibles.'],
    EM: true, PR: false, LA: true, accion: 'retirada',
    si: (f) => f.riesgo_id === 'R26' && /ionizant|rayos x|radiolog|radiofarmac/.test(sin(f.condicion)) && !/no ionizant/.test(sin(f.condicion)),
  },
  {
    id: 'R26-no-ionizantes', r: 'R26', riesgo: 'Exposición a radiaciones', grupo: 'Radiaciones',
    condicion: 'Exposición a radiaciones no ionizantes (campos electromagnéticos, radiofrecuencia, microondas, radiación óptica).',
    medidas: ['Con los niveles habituales no aumenta el riesgo para el embarazo. En el ámbito sanitario, mantener una distancia mínima de 2 metros a los equipos de diatermia. En fuentes industriales de radiofrecuencia o microondas, retirar de la tarea si las emisiones superan los valores del anexo II del Real Decreto 1066/2001.'],
    EM: true, PR: false, LA: false, accion: 'valorar',
    si: (f) => f.riesgo_id === 'R26' && /no ionizant|electromagn|radiofrecuencia|microondas|optica|laser|diatermia|infrarroj|ultraviolet/.test(sin(f.condicion)),
  },
  {
    id: 'R28-ruido', r: 'R28', riesgo: 'Exposición a agentes físicos', grupo: 'Ruido',
    condicion: 'Exposición a ruido.',
    medidas: ['La gestante no puede estar expuesta a más de 80 dB(A) de nivel diario equivalente ni a picos de más de 135 dB(C), porque los protectores auditivos no protegen al feto. Si no se puede reducir la exposición, se retira de la tarea a partir de la semana 20 de gestación. Disponer de la medición de ruido del puesto.'],
    EM: true, PR: false, LA: false, accion: 'valorar',
    si: de(['R28'], /ruido/),
  },
  {
    id: 'R28-vibraciones', r: 'R28', riesgo: 'Exposición a agentes físicos', grupo: 'Vibraciones',
    condicion: 'Exposición a vibraciones mano-brazo o de cuerpo entero.',
    medidas: ['Solicitar la medición de vibraciones A(8). Si supera 2,5 m/s² en mano-brazo o 0,25 m/s² en cuerpo entero, se aparta a la embarazada de la tarea desde la solicitud. Por debajo de esos valores no hay riesgo, aunque por precaución se limita la exposición al mínimo razonable.'],
    EM: true, PR: false, LA: false, accion: 'valorar',
    si: de(['R28'], /vibraci/),
  },
  {
    id: 'R23-temperatura', r: 'R23', riesgo: 'Estrés térmico', grupo: 'Temperaturas extremas',
    condicion: 'Trabajo con temperaturas superiores a 25 ºC o inferiores a 10 ºC (cocina, cámaras, exterior).',
    medidas: ['Prestar especial atención a las tareas con calor o frío intensos: limitar el tiempo de exposición, facilitar pausas e hidratación y proporcionar ropa de abrigo adaptada a la gestación. Los tiempos de trabajo en cámaras frigoríficas no están pensados para embarazadas.'],
    EM: true, PR: false, LA: true, accion: 'adaptar',
    si: o(de(['R23']), de(['R33', 'R34'], /termic|calor|frio|temperatura/)),
  },
  {
    id: 'R27-quimicos', r: 'R27', riesgo: 'Exposición a agentes químicos', grupo: 'Agentes químicos',
    condicion: 'Uso de productos químicos (limpieza, desinfección, lavandería, mantenimiento).',
    medidas: [
      'Revisar las fichas de datos de seguridad de todos los productos que se usan en el puesto. No puede haber exposición de embarazadas ni de mujeres en lactancia a productos con las indicaciones H340, H350, H350i, H360D, H360F, H360FD, H360Fd o H360Df, a sustancias cancerígenas o mutágenas de categoría 1A o 1B, ni a plomo y derivados (anexo VIII del Real Decreto 39/1997). En lactancia, tampoco a productos H362.',
      'Los productos H310, H311, H341, H351, H361d, H361f o H361fd, el mercurio, los medicamentos antimitóticos, el monóxido de carbono y los agentes de reconocida penetración cutánea (anexo VII) exigen una evaluación específica y, si hay exposición, adaptar el puesto o retirar de la tarea.',
      'Mientras no se disponga de las fichas de datos de seguridad, evitar la manipulación de esos productos.',
    ],
    EM: true, PR: false, LA: true, accion: 'valorar',
    si: o(de(['R27']), de(['R15', 'R25'], /quimic|producto|limpieza|desinfect|lejia|detergent/)),
  },
  {
    id: 'R27-citostaticos', r: 'R27', riesgo: 'Exposición a agentes químicos', grupo: 'Medicamentos citostáticos',
    condicion: 'Preparación, administración o contacto con medicamentos citostáticos o antimitóticos, o con excretas de pacientes tratados.',
    medidas: ['Nivel de exposición alto (preparación o administración intensiva y habitual): separación del puesto. Medio (preparación ocasional): adaptar el puesto para evitar la exposición. Bajo (apoyo o administración ocasional, recogida de excretas o lencería de pacientes tratados): adaptar la tarea para reducir al mínimo la exposición. Muy bajo: medidas habituales del centro.'],
    EM: true, PR: false, LA: true, accion: 'adaptar',
    si: (f) => /citostat|antimitot|quimioterap|oncolog/.test(sin(f.condicion)),
  },
  // ----- Agentes biológicos -----
  {
    id: 'R29-rubeola', r: 'R29', riesgo: 'Exposición a agentes biológicos', grupo: 'Agentes biológicos',
    condicion: 'Exposición a rubeola por contacto con pacientes o usuarios.',
    medidas: [SEROLOGIA + ' Vacunación antes del embarazo o después del parto si no está inmunizada.'],
    EM: true, PR: false, LA: false, accion: 'valorar', si: BIO_SANITARIO,
  },
  {
    id: 'R29-sarampion', r: 'R29', riesgo: 'Exposición a agentes biológicos', grupo: 'Agentes biológicos',
    condicion: 'Exposición a sarampión por contacto con pacientes o usuarios.',
    medidas: [SEROLOGIA],
    EM: true, PR: false, LA: false, accion: 'valorar', si: BIO_SANITARIO,
  },
  {
    id: 'R29-varicela', r: 'R29', riesgo: 'Exposición a agentes biológicos', grupo: 'Agentes biológicos',
    condicion: 'Exposición a varicela zóster por contacto con pacientes o usuarios.',
    medidas: [SEROLOGIA + ' Vacunación antes del embarazo o después del parto si no está inmunizada.'],
    EM: true, PR: false, LA: false, accion: 'valorar', si: BIO_SANITARIO,
  },
  {
    id: 'R29-parotiditis', r: 'R29', riesgo: 'Exposición a agentes biológicos', grupo: 'Agentes biológicos',
    condicion: 'Exposición a parotiditis por contacto con pacientes o usuarios.',
    medidas: ['Determinación serológica (IgG). Separación del puesto si el resultado es negativo antes de la semana 12; en el segundo y tercer trimestre no hay repercusión.'],
    EM: true, PR: false, LA: false, accion: 'valorar', si: BIO_SANITARIO,
  },
  {
    id: 'R29-parvovirus', r: 'R29', riesgo: 'Exposición a agentes biológicos', grupo: 'Agentes biológicos',
    condicion: 'Exposición a parvovirus B19 por contacto con pacientes o usuarios.',
    medidas: [SEROLOGIA + ' Medidas higiénicas habituales.'],
    EM: true, PR: false, LA: false, accion: 'valorar', si: BIO_SANITARIO,
  },
  {
    id: 'R29-citomegalovirus', r: 'R29', riesgo: 'Exposición a agentes biológicos', grupo: 'Agentes biológicos',
    condicion: 'Exposición a citomegalovirus por contacto con pacientes o usuarios (especialmente niños menores de 3 años).',
    medidas: ['No hay vacuna. Cumplir de forma rigurosa la higiene de manos tras el contacto con orina, saliva o secreciones y tras la higiene de los usuarios, en especial en el cambio de pañales. Si el puesto supone contacto habitual con niños menores de 3 años, pediatría, urgencias, UCI o unidad de trasplantes, reubicar en un puesto sin riesgo de exposición.'],
    EM: true, PR: false, LA: false, accion: 'valorar', si: BIO_SANITARIO,
  },
  {
    id: 'R29-coxsackie', r: 'R29', riesgo: 'Exposición a agentes biológicos', grupo: 'Agentes biológicos',
    condicion: 'Exposición a virus Coxsackie A16 por contacto con pacientes o usuarios.',
    medidas: ['No se justifica la exclusión laboral, porque no se han documentado consecuencias para el feto. Higiene de manos y respiratoria y limpieza frecuente de superficies de contacto.'],
    EM: true, PR: false, LA: false, accion: 'sin_exclusion', si: BIO_SANITARIO,
  },
  {
    id: 'R29-parenteral', r: 'R29', riesgo: 'Exposición a agentes biológicos', grupo: 'Agentes biológicos',
    condicion: 'Exposición a virus de transmisión por sangre (hepatitis B y C, VIH) por contacto con sangre o fluidos.',
    medidas: ['No se justifica la exclusión laboral: la transmisión exige un accidente con material contaminado. Aplicar las precauciones universales y el protocolo de actuación tras exposición accidental, igual que para el resto del personal.'],
    EM: true, PR: false, LA: false, accion: 'sin_exclusion',
    si: o(de(['R29'], /fluido|sangre|cortopunzant|pinchaz|parenteral|grupos? 2 y 3/), de(['R09'], /cortopunzant|sanitari/)),
  },
  {
    id: 'R29-toxoplasma', r: 'R29', riesgo: 'Exposición a agentes biológicos', grupo: 'Agentes biológicos',
    condicion: 'Exposición a toxoplasma (tierra, jardines, animales, carne cruda).',
    medidas: ['Toxoplasma figura en el anexo VIII del Real Decreto 39/1997: no puede haber exposición salvo que la trabajadora esté inmunizada. Si hay sospecha de riesgo, se aparta de la tarea hasta conocer su estado inmune. Evitar el contacto con heces de gato y otros animales y con tierra sin guantes.'],
    EM: true, PR: false, LA: false, accion: 'valorar',
    si: (f) => /jardin|tierra|animal|gato|mascota|carne cruda/.test(sin(f.condicion)),
  },
  {
    id: 'R29-alimentos', r: 'R29', riesgo: 'Exposición a agentes biológicos', grupo: 'Agentes biológicos',
    condicion: 'Exposición a bacterias de transmisión oral (Listeria, Campylobacter, Salmonella typhi) en la manipulación de alimentos.',
    medidas: ['No se requiere separación del puesto: la higiene de manos, la higiene personal y el control de la cadena alimentaria impiden la transmisión.'],
    EM: true, PR: false, LA: false, accion: 'sin_exclusion',
    si: de(['R29'], /aliment|crudo|cocina/),
  },
  // ----- Ergonómicos -----
  {
    id: 'R30-cargas', r: 'R30', riesgo: 'Carga física', grupo: 'Manipulación manual de cargas',
    condicion: 'Manipulación manual de cargas o movilización de personas.',
    medidas: [
      `Limitar la manipulación manual de cargas ${SEGO}, según el peso, la frecuencia y las horas de exposición al día.`,
      'Respetar los pesos máximos según la altura de la carga y la semana de gestación. A partir de la semana 28 no se manipulan cargas a la altura de la cabeza ni a media pierna.',
      'La movilización de pacientes o residentes se hace con ayudas mecánicas o con ayuda de otra persona; en el tercer trimestre, se evita.',
    ],
    EM: true, PR: true, LA: false, accion: 'limitar', tabla: ['cargas', 'pesos'],
    si: de(['R30'], /carga|manipulacion de (pacientes|personas|residentes)|movilidad reducida|movilizaci|empuje|arrastre/),
  },
  {
    id: 'R30-posturas', r: 'R30', riesgo: 'Carga física', grupo: 'Posturas forzadas',
    condicion: 'Posturas forzadas y flexiones del tronco.',
    medidas: [
      `Limitar las tareas con flexiones del tronco de más de 60º (manos por debajo de la rodilla) ${SEGO}, según la frecuencia y las horas de exposición. Las flexiones esporádicas no suponen riesgo.`,
      'Bajar el plano de trabajo por debajo del abdomen para las tareas manuales.',
      'Disponer de reposapiés en los trabajos sentados y de pie.',
      'Evitar las posturas forzadas o extremas rediseñando el puesto y adaptándolo a las medidas, alcances y necesidades de espacio de la embarazada.',
      'Evitar los ritmos de trabajo impuestos.',
      'Fomentar periodos cortos de deambulación por vías seguras, anchas y sin obstáculos.',
    ],
    EM: true, PR: true, LA: false, accion: 'limitar', tabla: 'flexion',
    si: de(['R30'], /postura(s)? forzada|flexi|arrodill|agachad|inclinaci/),
  },
  {
    id: 'R30-bipedestacion', r: 'R30', riesgo: 'Carga física', grupo: 'Bipedestación',
    condicion: 'Trabajo de pie (bipedestación estática o dinámica).',
    medidas: [`Limitar la bipedestación estática ininterrumpida y la bipedestación dinámica de más de 15 minutos por hora ${SEGO}, según las horas de trabajo efectivo de pie al día. Alternar con periodos sentada.`],
    EM: true, PR: false, LA: false, accion: 'limitar', tabla: 'bipedestacion',
    si: de(['R30'], /bipedestaci|de pie|postura(s)? estatica/),
  },
  {
    id: 'R30-sedestacion', r: 'R30', riesgo: 'Carga física', grupo: 'Sedestación',
    condicion: 'Sedestación prolongada.',
    medidas: [
      `Limitar la sedestación prolongada sin posibilidad de cambiar de postura ${SEGO}. Cuando la trabajadora puede levantarse y cambiar de postura con libertad, como en las tareas administrativas, el riesgo es tolerable.`,
      'Sentarse con un ángulo de unos 110º para evitar la compresión fetal y disponer de reposapiés.',
    ],
    EM: true, PR: false, LA: false, accion: 'limitar', tabla: 'sedestacion',
    si: o(de(['R30'], /sentad|sedestaci|postura(s)? estatica/), de(['R31'], /persona(s)? usuaria|pvd|pantalla/)),
  },
  // ----- Psicosociales y organización -----
  {
    id: 'R37-turnos', r: 'R37', riesgo: 'Fatiga derivada de la ordenación del tiempo de trabajo', grupo: 'Turnos y nocturnidad',
    condicion: 'Trabajo a turnos y/o nocturno.',
    medidas: ['Limitar el trabajo a turnos y nocturno. Valorar el paso a un turno diurno fijo (art. 26.1 de la Ley 31/1995), según la guía de la SEGO, el INSS y la AMAT.'],
    EM: true, PR: true, LA: true, accion: 'adaptar',
    si: (f) => /turno|noctur/.test(sin(f.condicion)),
  },
  {
    id: 'R38-agresiones', r: 'R38', riesgo: 'Violencia en el trabajo', grupo: 'Agresiones',
    condicion: 'Posibles agresiones físicas de usuarios o terceras personas (riesgo de golpe en el abdomen).',
    medidas: [
      'Nivel I (la contención forma parte de la actividad principal, como en unidades psiquiátricas de agudos o con menores en centros tutelados): retirada de las funciones con riesgo de agresión desde la semana 12 de gestación, cuando el útero deja de estar protegido por la pelvis.',
      'Nivel II (sin contención como actividad principal, pero con posibilidad significativa de agresión): se valora con el registro de agresiones del centro; si se estima riesgo de agresión abdominal, pasa a nivel I. Mientras tanto, no realizar contenciones ni atender sola a usuarios desestabilizados.',
    ],
    EM: true, PR: false, LA: false, accion: 'adaptar',
    si: o(de(['R38'], /violencia fisica|agresi|tercera|desestabiliz|conducta|contenci/), de(['R19'])),
  },
  {
    id: 'R38-aislamiento', r: 'R38', riesgo: 'Violencia en el trabajo', grupo: 'Trabajo en aislamiento',
    condicion: 'Trabajo en solitario o en zonas aisladas.',
    medidas: ['El trabajo en aislamiento se considera riesgo para el embarazo desde la solicitud, por la dificultad para pedir y recibir ayuda. Evitar que la trabajadora trabaje sola o asegurar un sistema de comunicación y auxilio inmediato.'],
    EM: true, PR: false, LA: false, accion: 'adaptar',
    si: (f) => /aislad|en solitario|trabaj\w* sol[oa]\b|sin compan/.test(sin(f.condicion)),
  },
]

// ---------- Datos de exposición de cada puesto ----------
// Cada puesto debe tenerlos para que su ERE dé la semana exacta. Además ajustan la valoración del riesgo:
// más kilos suben C y más frecuencia sube P (también la frecuencia de flexiones y de uso de escaleras).
const HORAS = { k: 'horas', texto: 'Horas al día', opciones: [['menos2', 'Menos de 2 h/día'], ['2a3', '2-3 h/día'], ['3a5', '3-5 h/día'], ['mas5', 'Más de 5 h/día']] }
export const EXPOSICION = {
  cargas: {
    titulo: 'Manipulación manual de cargas', condicion: 'R30-cargas',
    campos: [
      { k: 'peso', texto: 'Peso habitual de las cargas', opciones: [['menos4', 'Menos de 4 kg'], ['4a10', 'De 4 a 10 kg'], ['mas10', 'Más de 10 kg']] },
      { k: 'frecuencia', texto: 'Frecuencia', opciones: [['menos4', 'Menos de 4 veces/hora'], ['4omas', '4 o más veces/hora']] },
      HORAS,
    ],
  },
  flexion: {
    titulo: 'Flexiones del tronco de más de 60º', condicion: 'R30-posturas',
    campos: [{ k: 'frecuencia', texto: 'Frecuencia', opciones: [['menos2', 'Menos de 2 veces/hora'], ['2a10', 'Entre 2 y 10 veces/hora'], ['mas10', 'Más de 10 veces/hora']] }, HORAS],
  },
  bipedestacion: {
    titulo: 'Trabajo de pie', condicion: 'R30-bipedestacion',
    campos: [{ k: 'tipo', texto: 'Tipo', opciones: [['estatica', 'Estática, sin poder moverse'], ['dinamica', 'Dinámica (15 min o más por hora)'], ['ninguna', 'Menos de 15 min por hora']] }, HORAS],
  },
  sedestacion: {
    titulo: 'Trabajo sentado', condicion: 'R30-sedestacion',
    campos: [{ k: 'cambios', texto: 'Cambios de postura', opciones: [['sin', 'Sin poder cambiar de postura'], ['con', 'Puede levantarse y cambiar de postura']] }, HORAS],
  },
  escaleras: {
    titulo: 'Escaleras de mano o escalas', condicion: 'R01-escaleras',
    campos: [
      { k: 'tipo', texto: 'Tipo', opciones: [['mano', 'Escalera de mano'], ['escala', 'Escala o poste vertical']] },
      { k: 'frecuencia', texto: 'Frecuencia', opciones: [['menos4', 'Menos de 4 veces/jornada'], ['4a8', 'De 4 a 8 veces/jornada'], ['mas8', 'Más de 8 veces/jornada']] },
      { k: 'altura', texto: 'Altura', opciones: [['menos1', 'Menos de 1 m'], ['mas1', 'Más de 1 m']] },
    ],
  },
  agresiones: {
    titulo: 'Agresiones (pregunta previa)', condicion: 'R38-agresiones',
    campos: [{ k: 'nivel', texto: '¿La contención forma parte de la actividad principal del puesto?', opciones: [['I', 'Sí: nivel I (retirada desde la semana 12)'], ['II', 'No: nivel II (según el registro de agresiones)']] }],
  },
}
