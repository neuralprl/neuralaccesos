// Informe de adaptación del puesto para trabajadores aptos con limitaciones.
// Lee las limitaciones que envía vigilancia de la salud (una línea por reconocimiento), reconoce cada limitación
// y propone sus medidas preventivas. Las medidas son editables; si una limitación no se reconoce, queda pendiente.
// Funciones puras, sin red ni base de datos.

export const ADAPTACION_VERSION = '1.0'

const N = (s) => String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\s+/g, ' ').trim()
const kg = (t) => { const m = /(\d+(?:[.,]\d+)?)\s*KG/.exec(t); return m ? m[1].replace(',', '.') : null }
const lado = (t) => (/IZQUIERD/.test(t) ? 'izquierdo' : /DERECH/.test(t) ? 'derecho' : '')
const semana = (t) => { const m = /SEMANA (\d+)/.exec(t); return m ? Number(m[1]) : null }
const cadaHoras = (t) => (/CADA HORA/.test(t) ? 'cada hora' : (/CADA (\d+) HORAS/.exec(t) ? `cada ${/CADA (\d+) HORAS/.exec(t)[1]} horas` : 'cada 2 horas'))
const exposicionCargas = (t) => {
  const peso = /ENTRE 4 Y\s+10/.test(t) ? 'de 4 a 10 kg' : /SUPERIOR A 10/.test(t) ? 'de más de 10 kg' : (kg(t) ? `de más de ${kg(t)} kg` : 'pesadas')
  const frec = /MAS DE 4 VECES/.test(t) ? '4 o más veces por hora' : /MENOS DE 4 VECES/.test(t) ? 'menos de 4 veces por hora' : ''
  const horas = /MAS DE 5 HORAS/.test(t) ? 'más de 5 horas al día' : /3\s*-\s*5 HORAS/.test(t) ? 'entre 3 y 5 horas al día' : /2\s*-\s*3 HORAS/.test(t) ? 'entre 2 y 3 horas al día' : ''
  return [peso, frec, horas].filter(Boolean).join(', ')
}

// Tipos de punto: «limitacion» (con medidas), «nota» (informativa, sin medidas), «pendiente» (no reconocida).
// Cada regla: { id, si(textoNormalizado), medidas(textoNormalizado) -> [texto], tipo? }
export const REGLAS = [
  // ---------- Embarazo y lactancia ----------
  {
    id: 'gest-cargas', si: (t) => /GESTACION/.test(t) && /CARGAS/.test(t),
    medidas: (t) => [`A partir de la semana ${semana(t)} de gestación no manipulará cargas ${exposicionCargas(t)}. Esas tareas se asignarán a otra persona o se harán con ayudas mecánicas.`],
  },
  {
    id: 'gest-lumbar', si: (t) => /GESTACION/.test(t) && /LUMBAR/.test(t),
    medidas: (t) => [`A partir de la semana ${semana(t)} de gestación no realizará flexiones repetidas del tronco (más de 10 veces por hora). Se adaptarán las alturas de trabajo y se usarán útiles de mango largo.`],
  },
  {
    id: 'gest-sedestacion', si: (t) => /GESTACION/.test(t) && /SEDESTACION SIN POSIBILIDAD/.test(t),
    medidas: (t) => [`A partir de la semana ${semana(t)} de gestación podrá levantarse y cambiar de postura con libertad; no permanecerá sentada sin poder hacerlo durante periodos prolongados.`],
  },
  {
    id: 'gest-deportes', si: (t) => /DEPORTE|PROFESORA DE GIMNASIA/.test(t),
    medidas: () => ['No participará ni dirigirá actividades físicas o deportivas con usuarios que supongan contacto físico, impactos, aumento importante de la presión abdominal o gran demanda física.'],
  },
  {
    id: 'gest-solitario', si: (t) => /SOLITARIO|ZONA AISLADA/.test(t),
    medidas: () => ['No trabajará sola ni en zonas aisladas: se organizarán los turnos para que siempre haya otra persona localizable y un medio de aviso inmediato.'],
  },
  {
    id: 'gest-recomendacion', si: (t) => /PUEDEN AFECTAR AL ESTADO DE EMBARAZO|ADAPTE EL PUESTO DE TRABAJO A LA SITUACION/.test(t),
    medidas: () => ['Se adapta el puesto según la evaluación de riesgos para el embarazo y la lactancia (ERE) de su puesto. Si la adaptación no es posible, se estudiará el cambio a un puesto compatible y, en último término, la suspensión del contrato por riesgo durante el embarazo o la lactancia (art. 26 de la Ley 31/1995).'],
  },
  { id: 'gest-semanas', tipo: 'nota', si: (t) => /LAS LIMITACIONES APLICAN A PARTIR DE LAS SEMANAS/.test(t), medidas: () => [] },
  // ---------- Agentes biológicos ----------
  {
    id: 'biologicos', si: (t) => /AGENTES BIOLOGICOS|RUBEOLA|TOXOPLASMA|PAROTIDITIS|VARICELA|CITOMEGALOVIRUS|BRUCELLA|COXIELLA/.test(t),
    medidas: (t) => {
      const agente = /RUBEOLA/.test(t) ? 'rubeola' : /TOXOPLASMA/.test(t) ? 'toxoplasma' : /PAROTIDITIS/.test(t) ? 'parotiditis' : /VARICELA/.test(t) ? 'varicela zóster'
        : /CITOMEGALOVIRUS/.test(t) ? 'citomegalovirus' : /BRUCELLA/.test(t) ? 'Brucella' : /COXIELLA/.test(t) ? 'Coxiella burnetii (fiebre Q)' : /GRUPOS 2, 3 Y 4/.test(t) ? 'agentes biológicos de los grupos 2, 3 y 4' : 'agentes biológicos'
      return [`No realizará tareas con riesgo de exposición a ${agente}: no atenderá a usuarios con infección conocida o sospechada, no manipulará fluidos, ropa ni residuos potencialmente contaminados y extremará la higiene de manos.`]
    },
  },
  // ---------- Manipulación de personas ----------
  {
    id: 'usuarios', si: (t) => /MANIPULACION MANUAL DE USUARIOS|MOVILIZACION/.test(t) && /USUARI/.test(t),
    medidas: () => [
      'No levantará ni trasladará usuarios sin medios técnicos (grúa, disco de transferencia, sábana deslizante) o sin la ayuda de otro compañero/a, salvo que el usuario pueda colaborar en la movilización.',
      'El responsable del turno organizará las movilizaciones para que disponga siempre de ayuda o de medios técnicos.',
    ],
  },
  // ---------- Cargas ----------
  {
    id: 'cargas-hombros', si: (t) => /CARGAS/.test(t) && /ENCIMA DE LOS HOMBROS/.test(t),
    medidas: (t) => [`No manipulará cargas de más de ${kg(t) ?? '…'} kg por encima de los hombros. Los materiales de uso frecuente se colocarán entre la altura de la cintura y la de los hombros.`],
  },
  {
    id: 'cargas-lumbar', si: (t) => /CARGAS/.test(t) && /FLEXION LUMBAR/.test(t),
    medidas: (t) => [`No manipulará cargas de más de ${kg(t) ?? '…'} kg cuando obliguen a flexionar el tronco: las cargas se tomarán de superficies elevadas o se usarán carros o ayudas mecánicas.`],
  },
  {
    id: 'cargas-levantar', si: (t) => /LEVANTAR CARGAS/.test(t),
    medidas: (t) => [
      `No levantará cargas de más de ${kg(t) ?? '…'} kg. Puede realizar tareas de arrastre o empuje (carros, contenedores con ruedas).`,
      `Para cargas de más de ${kg(t) ?? '…'} kg utilizará ayudas mecánicas o pedirá ayuda a otro compañero/a; las cargas se fraccionarán siempre que sea posible.`,
    ],
  },
  {
    id: 'cargas-evitar', si: (t) => /EVITAR MANIPULACION MANUAL DE CARGAS/.test(t),
    medidas: (t) => [
      `No manipulará cargas de más de ${kg(t) ?? '…'} kg${/CONTINUADA/.test(t) ? ' de forma continuada' : ''}, ni al levantarlas ni al empujarlas o arrastrarlas.`,
      `Para cargas de más de ${kg(t) ?? '…'} kg utilizará ayudas mecánicas o pedirá ayuda a otro compañero/a; las cargas se fraccionarán siempre que sea posible.`,
    ],
  },
  {
    id: 'cargas', si: (t) => /MANIPULACION MANUAL DE CARGAS/.test(t),
    medidas: (t) => [
      `No manipulará cargas de más de ${kg(t) ?? '…'} kg.`,
      `Para cargas de más de ${kg(t) ?? '…'} kg utilizará ayudas mecánicas o pedirá ayuda a otro compañero/a; las cargas se fraccionarán siempre que sea posible.`,
    ],
  },
  // ---------- Posturas y movimientos ----------
  {
    id: 'hombro', si: (t) => /ENCIMA DEL HOMBRO|ENCIMA DE LOS HOMBROS/.test(t) && /ELEVACION/.test(t),
    medidas: (t) => {
      const l = lado(t)
      return [
        `No realizará tareas${/REPETITIVOS/.test(t) ? ' repetitivas' : ''} que obliguen a elevar ${/MIEMBROS SUPERIORES/.test(t) ? 'los brazos' : `el brazo${l ? ` ${l}` : ''}`} por encima del hombro.`,
        'Los materiales y útiles de uso frecuente se colocarán entre la altura de la cintura y la de los hombros; para limpiar en altura usará útiles de mango largo o telescópicos.',
      ]
    },
  },
  {
    id: 'cervical', si: (t) => /CERVICAL/.test(t),
    medidas: () => ['Evitará las posturas mantenidas o repetidas de flexión y extensión del cuello: pantallas a la altura de los ojos, materiales a la altura de trabajo adecuada y alternancia de tareas.'],
  },
  {
    id: 'lumbar', si: (t) => /ENCORVAMIENTO|COLUMNA LUMBAR/.test(t),
    medidas: () => ['No realizará flexiones del tronco de forma continuada: usará útiles de mango largo, superficies de trabajo a la altura adecuada y alternará con tareas que no las requieran.'],
  },
  {
    id: 'codo', si: (t) => /CODO/.test(t),
    medidas: (t) => [`No realizará tareas con movimientos repetitivos de flexión y extensión del codo${lado(t) ? ` ${lado(t)}` : ''}: se alternarán con otras tareas y se usarán herramientas que reduzcan el esfuerzo.`],
  },
  {
    id: 'cuclillas', si: (t) => /CUCLILLAS/.test(t),
    medidas: () => ['No trabajará en cuclillas: usará útiles de mango largo, asientos bajos o elevará el plano de trabajo.'],
  },
  {
    id: 'bipedestacion', si: (t) => /BIPEDESTACION/.test(t) && /ALTERNAR CON SEDESTACION/.test(t),
    medidas: (t) => [`Alternará el trabajo de pie con periodos sentada/o (orientativo: 10 minutos ${cadaHoras(t)} de pie). Se le facilitará un asiento en su zona de trabajo.`],
  },
  {
    id: 'sedestacion', si: (t) => /SEDESTACION PROLONGADA/.test(t),
    medidas: (t) => [`Alternará el trabajo sentada/o con periodos de pie o caminando (orientativo: 10 minutos ${cadaHoras(t)} sentada/o). Organizará las tareas para levantarse con regularidad.`],
  },
  // ---------- Desplazamientos, altura y escaleras ----------
  {
    id: 'conduccion-recomendacion', si: (t) => /RECOMENDABLE/.test(t) && /CONDUCCION/.test(t),
    medidas: () => ['Se evitarán los desplazamientos de trabajo que supongan conducir durante periodos prolongados; si son necesarios, se harán con pausas o con otra persona al volante.'],
  },
  {
    id: 'conduccion', si: (t) => /CONDUCCION DE VEHICULOS/.test(t),
    medidas: () => ['No conducirá vehículos por motivos de trabajo. Los desplazamientos se harán con otra persona al volante o en transporte público.'],
  },
  {
    id: 'altura', si: (t) => /ALTURA/.test(t),
    medidas: () => ['No realizará trabajos en altura ni con riesgo de caída: no subirá a escaleras de mano, escabeles ni superficies elevadas. Esas tareas se asignarán a otra persona; para limpiar en altura usará útiles telescópicos desde el suelo.'],
  },
  {
    id: 'escaleras', si: (t) => /ESCALERAS/.test(t),
    medidas: () => ['No realizará tareas que obliguen a subir y bajar escaleras: se le asignarán tareas en una sola planta o usará el ascensor.'],
  },
  // ---------- Organización ----------
  {
    id: 'nocturnidad', si: (t) => /NOCTURNIDAD|NOCTURN/.test(t),
    medidas: () => ['No realizará turnos de noche: se le asignarán turnos de mañana o de tarde.'],
  },
  // ---------- Pantallas y equipos ----------
  {
    id: 'pvd', si: (t) => /PVD|PANTALLAS DE VISUALIZACION/.test(t),
    medidas: (t) => [
      'Se adaptará su puesto con pantallas de visualización: pantalla sin reflejos a la altura de los ojos, iluminación regulable y pausas visuales.',
      ...(/ATENUARSE LA INTENSIDAD DE LA LUZ/.test(t) ? ['Se atenuará la intensidad de la luz de su zona de trabajo mientras use la pantalla (luminaria regulable o con difusor, cortinas o estores).'] : []),
    ],
  },
  {
    id: 'raton', si: (t) => /RATON/.test(t),
    medidas: () => ['La empresa le proporcionará un ratón ergonómico vertical, que usará de forma habitual.'],
  },
  {
    id: 'calzado', si: (t) => /CALZADO/.test(t),
    medidas: () => ['Se recomienda calzado blando y ligero, con suela de goma o poliuretano y plantilla almohadillada, que cumpla los requisitos de calzado de su puesto según la evaluación de riesgos.'],
  },
  // ---------- Notas ----------
  { id: 'informes', tipo: 'nota', si: (t) => /APORTAR LOS INFORMES MEDICOS/.test(t), medidas: () => [] },
]

// Divide la línea de limitaciones en puntos: van separados por « - ».
export function partirLimitaciones(texto) {
  return String(texto ?? '').split(/\s+-\s+(?=[A-ZÁÉÍÓÚÑ])/).map((x) => x.trim().replace(/\.+$/, '').trim()).filter(Boolean)
}

export function analizarLimitacion(texto) {
  const t = N(texto)
  const r = REGLAS.find((x) => { try { return x.si(t) } catch { return false } })
  if (!r) return { texto, regla: null, tipo: 'pendiente', medidas: [] }
  return { texto, regla: r.id, tipo: r.tipo ?? 'limitacion', medidas: r.medidas(t) }
}

const TEXTO_NOTA = {
  informes: 'En el próximo reconocimiento médico debe aportar los informes médicos solicitados.',
  'gest-semanas': 'Las limitaciones se aplican a partir de las semanas de gestación que determine la entidad colaboradora según la guía del INSS, la SEGO y la AMAT.',
}

const sumarMeses = (iso, m) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() + m); return d.toISOString().slice(0, 10) }

// fila: { nombre, dni, empresa, centro, puesto, tipo_reconocimiento, fecha_reconocimiento (ISO), fecha_vigencia (ISO|null), vigencia_meses, grado, limitaciones (texto) }
export function prepararInforme(fila) {
  const puntos = partirLimitaciones(fila.limitaciones).map(analizarLimitacion)
  const gestacion = /GESTACI/.test(N(fila.tipo_reconocimiento)) || puntos.some((p) => /GESTACION|EMBARAZO/.test(N(p.texto)))
  let vigencia = fila.fecha_vigencia || (fila.fecha_reconocimiento && Number(fila.vigencia_meses) > 0 ? sumarMeses(fila.fecha_reconocimiento, Number(fila.vigencia_meses)) : null)
  const vigenciaTexto = vigencia ? null : gestacion ? 'durante la gestación y la lactancia natural, o hasta un nuevo reconocimiento' : null
  const comunes = [
    'Se informa al trabajador/a de las limitaciones indicadas por vigilancia de la salud tras su reconocimiento médico.',
    vigencia
      ? `Se le informa de que el reconocimiento tiene vigencia hasta el ${vigencia.split('-').reverse().join('/')}${Number(fila.vigencia_meses) > 0 ? ` (${fila.vigencia_meses} meses)` : ''} y de que deberá realizar otro antes de esa fecha.`
      : vigenciaTexto ? `Se le informa de que las limitaciones se aplican ${vigenciaTexto}.` : null,
    'Se le informa de que las medidas preventivas derivadas de las limitaciones son de obligado cumplimiento.',
    'Se le informa de que cualquier duda debe comunicarla a su responsable o al responsable de prevención de riesgos laborales de la empresa.',
  ].filter(Boolean)
  const notas = puntos.filter((p) => p.tipo === 'nota').map((p) => TEXTO_NOTA[p.regla] ?? p.texto)
  const limitaciones = puntos.filter((p) => p.tipo !== 'nota')
  // Medidas idénticas en varias limitaciones: se muestran la primera vez.
  const vistas = new Set()
  limitaciones.forEach((p) => {
    p.repetida = p.medidas.length > 0 && p.medidas.every((m) => vistas.has(m))
    p.medidas.forEach((m) => vistas.add(m))
  })
  const pendientes = []
  if (!vigencia && !vigenciaTexto) pendientes.push('Indicar la vigencia del reconocimiento (no consta la fecha).')
  limitaciones.filter((p) => p.tipo === 'pendiente').forEach((p) => pendientes.push(`Indicar las medidas preventivas de: «${p.texto}».`))
  return { ...fila, vigencia, gestacion, comunes, limitaciones, notas, pendientes }
}
