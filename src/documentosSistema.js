// Documentos generales del sistema que genera la aplicación en Word: programa anual de actividades y memoria anual.
import { nombreCategoria } from './gestorLogic'

const fechaES = (f) => (f ? String(f).slice(0, 10).split('-').reverse().join('/') : '')
const AZUL = '1F3864'

async function constructor() {
  const d = await import('docx')
  const { Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType, LevelFormat, PageBreak, Header, Footer, PageNumber, TableLayoutType, BorderStyle, TabStopType } = d
  const ANCHO = 9638
  const t = (x, o = {}) => new TextRun({ text: String(x ?? ''), font: 'Arial', size: o.size ?? 20, bold: o.bold, italics: o.italics, color: o.color })
  const p = (x, o = {}) => new Paragraph({ spacing: { after: o.after ?? 100, before: o.before ?? 0, line: 276 }, alignment: o.align ?? AlignmentType.JUSTIFIED, keepNext: o.keepNext, children: [t(x, o)] })
  const h1 = (x) => new Paragraph({ spacing: { before: 280, after: 120 }, keepNext: true, children: [t(x, { bold: true, size: 26, color: AZUL })] })
  const h2 = (x) => new Paragraph({ spacing: { before: 200, after: 80 }, keepNext: true, children: [t(x, { bold: true, size: 22, color: AZUL })] })
  const li = (x) => new Paragraph({ numbering: { reference: 'vinetas', level: 0 }, spacing: { after: 60, line: 276 }, alignment: AlignmentType.JUSTIFIED, children: [t(x)] })
  const borde = { style: BorderStyle.SINGLE, size: 4, color: '999999' }
  const bordes = { top: borde, bottom: borde, left: borde, right: borde }
  const tabla = (cab, filas, pesos) => {
    const tot = pesos.reduce((a, b) => a + b, 0)
    const W = pesos.map((x) => Math.floor((x / tot) * ANCHO)); W[W.length - 1] += ANCHO - W.reduce((a, b) => a + b, 0)
    const celda = (c, i, cabecera) => new TableCell({ borders: bordes, width: { size: W[i], type: WidthType.DXA }, margins: { top: 50, bottom: 50, left: 90, right: 90 },
      shading: cabecera ? { fill: 'D9E2F3', type: ShadingType.CLEAR, color: 'auto' } : undefined, children: [new Paragraph({ children: [t(c, { size: 18, bold: cabecera })] })] })
    const rows = []
    if (cab) rows.push(new TableRow({ tableHeader: true, children: cab.map((c, i) => celda(c, i, true)) }))
    filas.forEach((f) => rows.push(new TableRow({ cantSplit: true, children: f.map((c, i) => celda(c, i, false)) })))
    return [new Table({ width: { size: ANCHO, type: WidthType.DXA }, columnWidths: W, layout: TableLayoutType.FIXED, rows }), new Paragraph({ spacing: { after: 80 }, children: [] })]
  }
  const salto = () => new Paragraph({ children: [new PageBreak()] })
  const documento = ({ titulo, codigo, portada, cuerpo }) => new d.Document({
    creator: 'Servicio de Prevención · Grupo Neural', title: titulo, styles: { default: { document: { run: { font: 'Arial', size: 20 } } } },
    numbering: { config: [{ reference: 'vinetas', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] }] },
    sections: [
      { properties: { page: { margin: { top: 1300, bottom: 1200, left: 1134, right: 1134 } } }, children: portada },
      { properties: { page: { margin: { top: 1300, bottom: 1200, left: 1134, right: 1134 } } },
        headers: { default: new Header({ children: [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: AZUL, space: 4 } }, tabStops: [{ type: TabStopType.RIGHT, position: ANCHO }], children: [t('GRUPO NEURAL · SERVICIO DE PREVENCIÓN', { size: 16, bold: true, color: AZUL }), t(`\t${titulo}`, { size: 16, color: '555555' })] })] }) },
        footers: { default: new Footer({ children: [new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: ANCHO }], children: [t(`${codigo} · Revisión 0`, { size: 16, color: '555555' }), new TextRun({ children: ['\tPágina ', PageNumber.CURRENT, ' de ', PageNumber.TOTAL_PAGES], font: 'Arial', size: 16, color: '555555' })] })] }) },
        children: cuerpo },
    ],
  })
  const portada = (titulo, sub, control) => [
    new Paragraph({ spacing: { before: 2400, after: 200 }, alignment: AlignmentType.CENTER, children: [t('GRUPO NEURAL', { bold: true, size: 28, color: AZUL })] }),
    new Paragraph({ spacing: { after: 160 }, alignment: AlignmentType.CENTER, children: [t(titulo, { bold: true, size: 40, color: AZUL })] }),
    new Paragraph({ spacing: { after: 1400 }, alignment: AlignmentType.CENTER, children: [t(sub, { size: 24 })] }),
    ...tabla(['Control del documento', ''], control, [1, 2]),
    ...tabla(['Elaborado por', 'Revisado por', 'Aprobado por'], [['Julio Benages Cadroy · Técnico Superior en PRL', '[●]', '[●] (Dirección)'], ['Fecha y firma:', 'Fecha y firma:', 'Fecha y firma:']], [1, 1, 1]),
  ]
  return { d, t, p, h1, h2, li, tabla, salto, documento, portada }
}

const TRIM = (i, n) => ['T1', 'T2', 'T3', 'T4'][Math.floor((i * 4) / Math.max(1, n))]

export async function wordPrograma(datos, cfg) {
  const { d, p, h1, h2, li, tabla, documento, portada } = await constructor()
  const a = datos.anio
  const nombre = (c) => `${c.codigo} · ${c.nombre}`
  const cuerpo = [
    h1('1. Introducción'),
    p(`El ${cfg.servicio} programa las actividades preventivas que desarrollará durante ${a} en las empresas que lo integran, conforme al plan de prevención de riesgos laborales. La programación anual se presenta a los comités de seguridad y salud y a los delegados y delegadas de prevención, que tienen derecho a conocerla e informarla (art. 39.2.d de la Ley 31/1995 y art. 15.5 del Real Decreto 39/1997).`),
    p(`Empresas: ${cfg.empresas || '[●]'}. Centros de trabajo: ${datos.centros.length}.`),
    h1('2. Evaluación de riesgos'),
    h2('2.1. Evaluaciones iniciales'),
    ...(datos.iniciales.length ? tabla(['Centro', 'Situación', 'Trimestre previsto'], datos.iniciales.map((x, i) => [nombre(x.centro), x.enCurso ? 'Evaluación en curso' : 'Sin evaluar', TRIM(i, datos.iniciales.length)]), [3, 1.6, 1]) : [p('Todos los centros disponen de evaluación inicial.')]),
    h2('2.2. Revisiones anuales de la evaluación'),
    p('Cada evaluación se revisa antes de que se cumplan doce meses desde su cierre, o antes si cambian las condiciones de trabajo, se detectan daños a la salud o se incorpora una persona especialmente sensible. La revisión parte de la evaluación anterior e incluye la ERE de cada puesto, los equipos e instalaciones y la comprobación del lugar de trabajo.'),
    ...(datos.revisiones.length ? tabla(['Centro', 'Vence', 'Mes previsto'], datos.revisiones.map((x) => [nombre(x.centro), fechaES(x.vence), x.mes]), [3, 1, 1.2]) : [p('No hay revisiones que venzan este año.')]),
    h1('3. Visitas de comprobación, equipos e instalaciones'),
    p('Se visitará cada centro al menos una vez al año para comprobar las condiciones del lugar de trabajo (PAC) y evaluar los equipos de trabajo e instalaciones, coincidiendo con la evaluación o su revisión. Las incidencias se planifican con su prioridad y plazo.'),
    h1('4. Seguimiento de la planificación preventiva'),
    p('La dirección de cada centro marca en la plataforma las acciones realizadas y recibe avisos de los plazos; el servicio de prevención comprueba su eficacia. Situación al inicio del año:'),
    ...(Object.keys(datos.papCentro).length ? tabla(['Centro', 'Acciones pendientes', 'De ellas vencidas'], datos.centros.filter((c) => datos.papCentro[c.id]).map((c) => [nombre(c), String(datos.papCentro[c.id].pendientes), String(datos.papCentro[c.id].vencidas)]), [3, 1, 1]) : [p('No hay acciones pendientes.')]),
    h1('5. Vigilancia de la salud'),
    li('Reconocimientos iniciales, periódicos, tras ausencia prolongada por motivos de salud y por embarazo o lactancia, a través del servicio de prevención ajeno concertado (Quirón Prevención).'),
    li('Informes de adaptación del puesto para todas las personas declaradas aptas con limitaciones, en el plazo de un mes desde la recepción de la carta de aptitud.'),
    li('Coordinación de los protocolos con los riesgos de la evaluación (movilización de personas, agentes biológicos, pantallas de visualización, trabajo nocturno).'),
    h1('6. Protección de la maternidad y de personas especialmente sensibles'),
    li('ERE actualizada de todos los puestos evaluados, con sus datos de exposición.'),
    li('Aplicación inmediata de las medidas cuando una trabajadora comunique su embarazo o lactancia.'),
    h1('7. Formación e información'),
    li('Información de riesgos de su puesto a todas las personas de nueva incorporación, con su recibí.'),
    li('Formación del puesto de trabajo según el plan formativo de la evaluación.'),
    li('Formación en prevención y manejo de situaciones de agresividad para el personal de atención directa.'),
    li('Formación en movilización de personas y uso de ayudas técnicas.'),
    li('Formación de los equipos de emergencia de cada centro.'),
    h1('8. Emergencias'),
    p('Las medidas de emergencia, los planes de autoprotección y los informes de condiciones ambientales los elabora una empresa externa colaboradora; el servicio de prevención los revisa y comprueba su implantación. Se realizará al menos un simulacro de emergencia en cada centro, con especial atención a la evacuación asistida y al turno de noche. El informe del simulacro se colgará en los documentos del centro.'),
    ...tabla(['Centro', 'Trimestre previsto'], datos.centros.map((c, i) => [nombre(c), TRIM(i, datos.centros.length)]), [3, 1]),
    h1('9. Agresiones, accidentes e incidentes'),
    li('Investigación de todos los accidentes con baja, de los incidentes relevantes y de las agresiones con lesión.'),
    li('Análisis trimestral del registro de agresiones por centro, con propuesta de medidas y seguimiento de agresores reiterados.'),
    li('Revisión de los medios de protección frente a agresiones (avisadores, protocolos, organización de los turnos).'),
    h1('10. Coordinación de actividades empresariales'),
    p('Aplicación del procedimiento de coordinación a todas las empresas externas que trabajen en los centros (limpieza, mantenimiento, cocina, seguridad), con la documentación en la aplicación de coordinación del grupo.'),
    h1('11. Consulta, participación y gestión del sistema'),
    li('Reuniones trimestrales de los comités de seguridad y salud y consulta a los delegados de prevención.'),
    li('Auditoría del sistema de gestión según la norma ISO 45001 y revisión por la dirección.'),
    li(`Memoria anual de actividades de ${a}, al término del año.`),
    h1('12. Calendario'),
    ...tabla(['Actividad', 'T1', 'T2', 'T3', 'T4'], [
      ['Evaluaciones iniciales y revisiones', 'X', 'X', 'X', 'X'], ['Visitas de comprobación y equipos', 'X', 'X', 'X', 'X'], ['Seguimiento del PAP y la PAC', 'X', 'X', 'X', 'X'],
      ['Simulacros', 'X', 'X', 'X', 'X'], ['Análisis del registro de agresiones', 'X', 'X', 'X', 'X'], ['Comités de seguridad y salud', 'X', 'X', 'X', 'X'],
      ['Formación', 'X', 'X', 'X', 'X'], ['Auditoría y revisión por la dirección', '', '', 'X', ''], ['Memoria anual', '', '', '', 'X'],
    ], [3.4, 0.6, 0.6, 0.6, 0.6]),
    p('Fecha y firma del técnico de prevención: ____________________', { before: 240 }),
  ]
  const doc = documento({ titulo: `Programa anual de actividades ${a}`, codigo: `SG-PA-${a}`, portada: portada(`PROGRAMA ANUAL DE ACTIVIDADES PREVENTIVAS ${a}`, cfg.servicio, [['Código', `SG-PA-${a}`], ['Periodo', `01/01/${a} - 31/12/${a}`], ['Tipo', 'Documento general del sistema']]), cuerpo })
  return d.Packer.toBlob(doc)
}

export async function wordMemoria(datos, cfg) {
  const { d, p, h1, h2, li, tabla, salto, documento, portada } = await constructor()
  const a = datos.anio; const r = datos.resumen
  const pct = (x, y) => (y ? `${Math.round((x / y) * 100)} %` : '—')
  const filasResumen = [
    ['Evaluaciones de riesgos cerradas (iniciales y revisiones)', r.evaluaciones], ['Puestos de trabajo evaluados (con su ERE)', r.puestosEvaluados],
    ['Visitas de comprobación del lugar de trabajo (PAC)', r.visitas], ['Incidencias detectadas en las visitas', r.incidenciasPac], ['Centros con equipos e instalaciones evaluados', r.centrosEquipos],
    ...Object.entries(r.porCategoria).map(([k, n]) => [nombreCategoria(k), n]),
    ['Acciones del PAP realizadas en el año', r.papRealizadas], ['Acciones del PAP pendientes a 31/12', r.papPendientes], ['De ellas, con el plazo vencido', r.papVencidas],
    ['Agresiones registradas', r.agresiones], ['Agresiones con lesión y baja', r.agrBaja],
    ['Informes de adaptación emitidos (aptos con limitaciones)', r.adaptaciones], ['Situaciones de embarazo o lactancia comunicadas', r.embarazos],
  ].map(([x, n]) => [x, String(n)])
  const cuerpo = [
    h1('1. Introducción'),
    h2('1.1. Datos del servicio de prevención'),
    ...tabla(null, [['Servicio', cfg.servicio], ['Modalidad', 'Servicio de prevención mancomunado (art. 21 del Real Decreto 39/1997)'], ['Empresas', cfg.empresas || '[●]'], ['Especialidades asumidas', 'Seguridad en el Trabajo, Higiene Industrial, Ergonomía y Psicosociología Aplicada'], ['Especialidad concertada', 'Medicina del Trabajo (vigilancia de la salud): Quirón Prevención'], ['Periodo', `01/01/${a} - 31/12/${a}`], ['Centros de trabajo', String(r.totalCentros)]], [1, 2.6]),
    h2('1.2. Objeto'),
    p(`Esta memoria recoge las actividades preventivas realizadas por el servicio de prevención durante ${a}, en aplicación del plan de prevención y del programa anual. Se elabora con los datos registrados en la plataforma de gestión de la prevención a lo largo del año y se presenta a los comités de seguridad y salud y a los delegados de prevención (art. 39.2.d de la Ley 31/1995 y art. 15.5 del Real Decreto 39/1997). Queda a disposición de la autoridad laboral.`),
    h1('2. Resumen de las actividades del año'),
    ...tabla(['Actividad', 'Número'], filasResumen, [4, 1]),
    h1('3. Actividades realizadas por centro de trabajo'),
    ...(datos.actividades.length ? datos.actividades.flatMap((x) => [h2(`${x.centro.codigo} · ${x.centro.nombre}`), ...tabla(['Nº', 'Actividad', 'Fecha', 'Observaciones'], x.lista.map((y, i) => [String(i + 1), y.actividad, fechaES(y.fecha), y.obs]), [0.4, 4, 1, 1.8])]) : [p('No constan actividades registradas en el año.')]),
    h1('4. Seguimiento de la planificación preventiva'),
    ...(Object.keys(r.papCentro).length ? tabla(['Centro', 'Realizadas en el año', 'Pendientes a 31/12', 'Vencidas'], datos.centros.filter((c) => r.papCentro[c.id]).map((c) => [`${c.codigo} · ${c.nombre}`, String(r.papCentro[c.id].realizadas), String(r.papCentro[c.id].pendientes), String(r.papCentro[c.id].vencidas)]), [3, 1, 1, 1]) : [p('No constan acciones del PAP.')]),
    h1('5. Agresiones'),
    p(`Se registraron ${r.agresiones} agresiones, ${r.agrBaja} con lesión y baja.`),
    ...(r.agresiones ? tabla(['Centro', 'Agresiones'], datos.centros.filter((c) => r.agrCentro[c.id]).map((c) => [`${c.codigo} · ${c.nombre}`, String(r.agrCentro[c.id])]), [3, 1]) : []),
    h1('6. Vigilancia de la salud y protección de la maternidad'),
    p(`Se emitieron ${r.adaptaciones} informes de adaptación del puesto a personas declaradas aptas con limitaciones${r.adaptacionesPendientes ? ` y quedan ${r.adaptacionesPendientes} pendientes` : ''}. Se comunicaron ${r.embarazos} situaciones de embarazo, parto reciente o lactancia, que se atendieron con la ERE del puesto. Los datos de salud se tratan de forma confidencial y no se incluyen en esta memoria.`),
    h1('7. Valoración de la integración de la actividad preventiva'),
    p('La evaluación de riesgos de cada centro incluye la valoración de la integración de la prevención en su gestión, mediante la aplicación del plan de prevención y el seguimiento de la planificación. Indicadores del año:'),
    ...tabla(['Indicador', 'Valor'], [['Centros con evaluación vigente a 31/12', `${r.centrosVigentes} de ${r.totalCentros} (${pct(r.centrosVigentes, r.totalCentros)})`], ['Acciones del PAP realizadas frente al total gestionado', pct(r.papRealizadas, r.papRealizadas + r.papPendientes)], ['Acciones pendientes con el plazo vencido', String(r.papVencidas)], ['Centros con simulacro registrado', String(r.porCategoria.simulacro ?? 0)]], [3, 1.4]),
    h1('8. Conclusiones y propuestas para el próximo programa'),
    ...(r.centrosVigentes < r.totalCentros ? [li(`Completar o revisar la evaluación de los ${r.totalCentros - r.centrosVigentes} centros sin evaluación vigente.`)] : []),
    ...(r.papVencidas ? [li(`Cerrar las ${r.papVencidas} acciones del PAP con el plazo vencido.`)] : []),
    ...((r.porCategoria.simulacro ?? 0) < r.totalCentros ? [li('Realizar y documentar el simulacro anual en todos los centros.')] : []),
    ...(r.agresiones ? [li('Mantener el análisis del registro de agresiones y reforzar la formación en manejo de situaciones de agresividad en los centros con más incidencias.')] : []),
    li('[●] Otras conclusiones del técnico.'),
    salto(),
    p(`${cfg.lugar || '[●]'}, a ${new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}`, { before: 400 }),
    p('Julio Benages Cadroy', { before: 800 }), p('Técnico Superior en Prevención de Riesgos Laborales'),
  ]
  const doc = documento({ titulo: `Memoria anual ${a}`, codigo: `SG-MA-${a}`, portada: portada(`MEMORIA ANUAL DE ACTIVIDADES PREVENTIVAS ${a}`, cfg.servicio, [['Código', `SG-MA-${a}`], ['Periodo', `01/01/${a} - 31/12/${a}`], ['Tipo', 'Documento general del sistema (acceso restringido)']]), cuerpo })
  return d.Packer.toBlob(doc)
}
