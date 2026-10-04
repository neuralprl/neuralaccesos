// Plantillas del sistema de gestión, adaptadas al Grupo Neural (servicio de prevención mancomunado, centros sanitarios y sociosanitarios).
// Cada una devuelve el cuerpo HTML del documento. Códigos provisionales: ajustarlos a la codificación ISO del sistema.
const L = '&nbsp;'
const tabla = (cabeceras, filas = 4, anchos = []) => `<table><thead><tr>${cabeceras.map((c, i) => `<th${anchos[i] ? ` style="width:${anchos[i]}"` : ''}>${c}</th>`).join('')}</tr></thead><tbody>${
  Array.from({ length: filas }, () => `<tr>${cabeceras.map(() => `<td>${L}</td>`).join('')}</tr>`).join('')}</tbody></table>`
// Tabla con la primera columna ya rellena: filas = [etiqueta, ...] y celdas extra vacías (o con ☐).
const fijas = (cabeceras, filas, anchos = [], marcas = []) => `<table><thead><tr>${cabeceras.map((c, i) => `<th${anchos[i] ? ` style="width:${anchos[i]}"` : ''}>${c}</th>`).join('')}</tr></thead><tbody>${
  filas.map((f) => `<tr><th style="text-align:left">${f}</th>${cabeceras.slice(1).map((_, i) => `<td>${marcas[i + 1] ? '☐' : L}</td>`).join('')}</tr>`).join('')}</tbody></table>`
const campos = (lista) => `<table class="campos">${lista.map((c) => `<tr><th style="width:32%">${c}</th><td>${L}</td></tr>`).join('')}</table>`
const opciones = (lista) => lista.map((o) => `☐ ${o}`).join('&nbsp;&nbsp;&nbsp; ')
const firmas = (lista) => `<table class="firmas"><tr>${lista.map((f) => `<td><div class="linea"></div>${f}</td>`).join('')}</tr></table>`
const caja = (titulo, alto = 90) => `<p class="etq">${titulo}</p><div class="caja" style="min-height:${alto}px"></div>`

export const CSS_PLANTILLA = `
.cab-doc{width:100%;border-collapse:collapse;margin-bottom:14px}
.cab-doc td{border:1px solid #555;padding:5px 8px;font-size:10pt}
.cab-doc .t{font-size:13pt;font-weight:bold;text-align:center}
table.campos th{background:#eef2f8;text-align:left}
.etq{font-weight:bold;margin:12px 0 4px}
.caja{border:1px solid #888}
.firmas{width:100%;border:0;margin-top:36px}.firmas td{border:0;text-align:center;padding:0 10px;vertical-align:bottom}
.firmas .linea{border-top:1px solid #333;margin:40px 10px 4px}
.art{margin:8px 0}
`

export function cabeceraDoc(p) {
  return `<table class="cab-doc"><tr><td rowspan="2" style="width:24%"><b>GRUPO NEURAL</b><br>Servicio de prevención mancomunado</td>
<td class="t" rowspan="2">${p.titulo}</td><td style="width:22%">Código: ${p.codigo}</td></tr>
<tr><td>Edición: 1 · Fecha: ____/____/______</td></tr></table>`
}

export const PLANTILLAS = [
  {
    id: 'acta-css', codigo: 'SG-F-CSS-01', grupo: 'Participación', menu: 'comite',
    titulo: 'Acta de reunión del Comité de Seguridad y Salud',
    descripcion: 'Reuniones trimestrales y extraordinarias del comité (arts. 38 y 39 de la Ley 31/1995).',
    html: () => `
${campos(['Empresa', 'Comité (de empresa o intercentros)', 'Fecha, hora de inicio y de fin', 'Lugar o medio (presencial / videoconferencia)', 'Tipo de reunión'])}
<p>${opciones(['Ordinaria (trimestral)', 'Extraordinaria, a petición de: ____________________'])}</p>
<p class="etq">Asistentes con voz y voto</p>
${tabla(['Nombre y apellidos', 'Representación (empresa / delegado/a de prevención)', 'Cargo', 'Firma'], 6)}
<p class="etq">Asistentes con voz y sin voto (art. 38.2: técnicos del servicio de prevención, delegados sindicales, personas expertas)</p>
${tabla(['Nombre y apellidos', 'Condición', 'Firma'], 3)}
<p class="etq">Orden del día</p>
<ol><li>Lectura y aprobación del acta anterior y seguimiento de sus acuerdos.</li><li>Daños a la salud del periodo: accidentes, incidentes, agresiones y enfermedades profesionales.</li>
<li>Evaluaciones de riesgos y planificación preventiva: novedades y estado de las acciones.</li><li>Consultas a la representación (art. 33 de la Ley 31/1995).</li>
<li>Propuestas de los delegados y delegadas de prevención.</li><li>Ruegos y preguntas.</li></ol>
${caja('Desarrollo de la reunión', 160)}
<p class="etq">Acuerdos</p>
${tabla(['Nº', 'Acuerdo', 'Responsable', 'Plazo'], 5, ['6%', '54%', '22%', '18%'])}
<p class="etq">Seguimiento de acuerdos anteriores</p>
${tabla(['Acuerdo', 'Estado', 'Observaciones'], 3)}
${campos(['Fecha prevista de la próxima reunión'])}
${firmas(['Presidencia', 'Secretaría'])}`,
  },
  {
    id: 'reglamento-css', codigo: 'SG-P-CSS-01', grupo: 'Participación', menu: 'comite',
    titulo: 'Reglamento de funcionamiento del Comité de Seguridad y Salud',
    descripcion: 'Normas internas del comité, aprobadas por el propio comité (art. 38.3 de la Ley 31/1995).',
    html: () => `
<p class="art"><b>Artículo 1. Objeto.</b> Este reglamento regula el funcionamiento del Comité de Seguridad y Salud de ____________________, órgano paritario y colegiado de participación destinado a la consulta regular y periódica de las actuaciones de la empresa en prevención de riesgos laborales (art. 38 de la Ley 31/1995).</p>
<p class="art"><b>Artículo 2. Composición.</b> Lo forman los delegados y delegadas de prevención, por una parte, y la empresa o sus representantes en igual número, por otra. Representación de la empresa: ____________________. Delegados y delegadas de prevención: ____________________.</p>
<p class="art"><b>Artículo 3. Asistentes con voz y sin voto.</b> Pueden participar, con voz pero sin voto, los delegados sindicales, los responsables técnicos de prevención que no formen parte del comité, el personal de la empresa con especial cualificación o información sobre las cuestiones a debatir y técnicos en prevención ajenos a la empresa, cuando lo solicite alguna de las representaciones.</p>
<p class="art"><b>Artículo 4. Presidencia y secretaría.</b> La presidencia la ejerce ____________________ y la secretaría ____________________, por un periodo de ______ años. La presidencia convoca y modera las reuniones; la secretaría redacta las actas y custodia la documentación.</p>
<p class="art"><b>Artículo 5. Reuniones.</b> El comité se reúne trimestralmente y siempre que lo solicite alguna de las representaciones. Las reuniones extraordinarias se celebrarán en un plazo máximo de ______ días desde la solicitud, que indicará los asuntos a tratar.</p>
<p class="art"><b>Artículo 6. Convocatoria.</b> Se envía con al menos ______ días de antelación (______ horas en las extraordinarias), por correo electrónico, con el orden del día y la documentación necesaria.</p>
<p class="art"><b>Artículo 7. Constitución y acuerdos.</b> El comité queda válidamente constituido con la asistencia de ____________________. Los acuerdos se adoptan por ____________________ de los miembros con voto. Las discrepancias se recogen en el acta.</p>
<p class="art"><b>Artículo 8. Competencias y facultades.</b> Las del art. 39 de la Ley 31/1995: participar en la elaboración, puesta en práctica y evaluación de los planes y programas de prevención; promover iniciativas de mejora; conocer la situación preventiva de los centros mediante visitas; conocer los documentos e informes del servicio de prevención; conocer y analizar los daños a la salud; y conocer e informar la memoria y la programación anual del servicio de prevención.</p>
<p class="art"><b>Artículo 9. Actas.</b> De cada reunión se levanta acta, que se aprueba en la reunión siguiente y firman presidencia y secretaría. Se conservan en el sistema de gestión.</p>
<p class="art"><b>Artículo 10. Confidencialidad.</b> Los miembros guardarán sigilo sobre la información a la que accedan, especialmente los datos de salud y personales.</p>
<p class="art"><b>Artículo 11. Modificación.</b> Este reglamento puede modificarse por acuerdo del comité.</p>
<p>Aprobado en la reunión del comité de ____/____/______.</p>
${firmas(['Presidencia', 'Secretaría'])}`,
  },
  {
    id: 'objetivos', codigo: 'SG-F-OBJ-01', grupo: 'Planificación', menu: 'politica',
    titulo: 'Ficha de objetivo de seguridad y salud',
    descripcion: 'Objetivo medible con meta, indicador, acciones y seguimiento (ISO 45001, 6.2).',
    html: () => `
${campos(['Año', 'Objetivo', 'Relación con la política de SST', 'Meta medible', 'Indicador y fórmula de cálculo', 'Valor de partida', 'Ámbito (centros o colectivos)', 'Responsable', 'Recursos asignados', 'Fecha límite'])}
<p class="etq">Acciones</p>
${tabla(['Acción', 'Responsable', 'Plazo', 'Estado'], 5, ['46%', '22%', '14%', '18%'])}
<p class="etq">Seguimiento</p>
${tabla(['Fecha', 'Valor del indicador', 'Grado de avance', 'Comentarios'], 4)}
${caja('Evaluación final y decisión (cerrar, mantener o reformular)', 80)}
${firmas(['Responsable del objetivo', 'Aprobación de la dirección'])}`,
  },
  {
    id: 'investigacion', codigo: 'SG-F-INV-01', grupo: 'Incidentes', menu: 'accidentes',
    titulo: 'Informe de investigación de accidente o incidente',
    descripcion: 'Investigación de los daños a la salud y de los incidentes relevantes (art. 16.3 de la Ley 31/1995; ISO 45001, 10.2).',
    html: () => `
<p class="etq">1. Datos del suceso</p>
<p>${opciones(['Accidente con baja', 'Accidente sin baja', 'Incidente sin daño', 'Accidente biológico', 'Agresión', 'Enfermedad profesional', 'In itinere'])}</p>
${campos(['Fecha y hora', 'Centro y lugar exacto', 'Tarea que se realizaba', 'Testigos'])}
<p class="etq">2. Persona afectada</p>
${campos(['Nombre y apellidos', 'Puesto y antigüedad en el puesto', 'Empresa (propia o externa)', 'Turno y horas trabajadas ese día', 'Lesión y parte del cuerpo', 'Parte Delt@ (número y fecha de comunicación)'])}
${caja('3. Descripción de lo ocurrido (hechos, sin valoraciones)', 120)}
<p class="etq">4. Equipo investigador y método</p>
${campos(['Componentes del equipo', 'Fecha de la investigación', 'Método (p. ej. árbol de causas, NTP 274)'])}
<p class="etq">5. Causas</p>
${tabla(['Tipo de causa', 'Descripción'], 4, ['30%', '70%'])}
<p style="font-size:9pt">Tipos: condiciones materiales o del lugar; organización del trabajo; factores individuales; usuario o tercero; gestión de la prevención (evaluación, formación, información, EPI).</p>
<p class="etq">6. Medidas</p>
${tabla(['Medida', 'Responsable', 'Plazo', '¿Pasa al PAP?'], 4, ['50%', '20%', '15%', '15%'])}
<p>¿Hay que revisar la evaluación de riesgos del puesto? ${opciones(['Sí', 'No'])} &nbsp; Comunicado a los delegados de prevención el ____/____/______</p>
${firmas(['Técnico/a de prevención', 'Responsable del centro'])}`,
  },
  {
    id: 'cuasi', codigo: 'SG-F-CUA-01', grupo: 'Incidentes', menu: 'accidentes',
    titulo: 'Comunicación de incidente o situación de riesgo',
    descripcion: 'Para que cualquier persona comunique un casi accidente o una situación peligrosa (ISO 45001, 10.2).',
    html: () => `
${campos(['Fecha y hora', 'Centro y lugar', 'Nombre de quien comunica (opcional)'])}
${caja('¿Qué ha pasado o qué situación has visto?', 110)}
${caja('¿Qué podría haber pasado?', 70)}
${caja('¿Qué propones para evitarlo?', 70)}
<p class="etq">A rellenar por el servicio de prevención</p>
${campos(['Recibido por y fecha', 'Análisis', 'Medida adoptada y responsable', 'Respuesta a quien comunicó (fecha)'])}`,
  },
  {
    id: 'cambio', codigo: 'SG-F-CAM-01', grupo: 'Planificación', menu: 'cambio',
    titulo: 'Gestión del cambio',
    descripcion: 'Valorar un cambio antes de hacerlo: obras, nuevo servicio o tipo de usuario, equipos, productos u organización (ISO 45001, 8.1.3).',
    html: () => `
${campos(['Centro', 'Descripción del cambio', 'Fecha prevista', 'Promotor del cambio'])}
<p>${opciones(['Obras o reforma', 'Nuevo servicio o actividad', 'Nuevo tipo de usuario', 'Equipos o instalaciones', 'Productos químicos', 'Organización o turnos', 'Plantilla', 'Normativa'])}</p>
${caja('Peligros nuevos o modificados', 80)}
${caja('Evaluación previa y medidas que deben estar implantadas antes del cambio', 100)}
${campos(['Consulta a los delegados de prevención (art. 33) — fecha y respuesta', 'Información y formación necesarias', '¿Hay que revisar la evaluación de riesgos o el plan de emergencia?', 'Coordinación con empresas externas (CAE)'])}
<p class="etq">Aprobación y verificación</p>
${campos(['Aprobado por y fecha', 'Verificación después del cambio (fecha y resultado)'])}
${firmas(['Técnico/a de prevención', 'Dirección'])}`,
  },
  {
    id: 'auditoria', codigo: 'SG-F-AUD-01', grupo: 'Seguimiento', menu: 'auditorias',
    titulo: 'Informe de auditoría interna',
    descripcion: 'Resultado de la auditoría interna del sistema (ISO 45001, 9.2).',
    html: () => `
${campos(['Alcance (procesos y centros auditados)', 'Criterios (ISO 45001, requisitos legales, procedimientos internos)', 'Fechas', 'Equipo auditor e independencia respecto a lo auditado', 'Personas entrevistadas'])}
${caja('Resumen y conclusión general', 90)}
<p class="etq">Hallazgos</p>
${tabla(['Nº', 'Apartado', 'Tipo', 'Descripción', 'Evidencia'], 6, ['6%', '12%', '16%', '38%', '28%'])}
<p style="font-size:9pt">Tipo: no conformidad mayor, no conformidad menor, observación u oportunidad de mejora. Las no conformidades pasan al registro de no conformidades con su análisis de causas.</p>
${caja('Puntos fuertes', 60)}
${campos(['Distribución del informe', 'Fecha de entrega'])}
${firmas(['Auditor/a', 'Responsable del sistema'])}`,
  },
  {
    id: 'revision', codigo: 'SG-F-RD-01', grupo: 'Seguimiento', menu: 'revision',
    titulo: 'Acta de revisión por la dirección',
    descripcion: 'Revisión anual del sistema por la dirección (ISO 45001, 9.3).',
    html: () => `
${campos(['Fecha', 'Periodo revisado', 'Asistentes'])}
<p class="etq">Información revisada</p>
${fijas(['Tema', 'Resumen y conclusiones'], ['Acciones de revisiones anteriores', 'Cambios internos y externos que afectan al sistema (normativa, centros, actividad)', 'Necesidades de trabajadores y partes interesadas',
    'Cumplimiento de la política y de los objetivos', 'Accidentes, incidentes y agresiones; no conformidades y acciones correctivas', 'Resultados del seguimiento y la medición (indicadores)',
    'Cumplimiento de los requisitos legales', 'Auditorías internas y externas', 'Consulta y participación de los trabajadores', 'Riesgos y oportunidades',
    'Adecuación de los recursos', 'Comunicaciones con partes interesadas', 'Oportunidades de mejora'], ['36%', '64%'])}
${caja('Conclusión sobre la idoneidad, adecuación y eficacia del sistema', 80)}
<p class="etq">Decisiones</p>
${tabla(['Decisión (mejoras, cambios, recursos, objetivos)', 'Responsable', 'Plazo'], 5, ['60%', '22%', '18%'])}
${firmas(['Dirección', 'Responsable del sistema'])}`,
  },
  {
    id: 'simulacro', codigo: 'SG-F-SIM-01', grupo: 'Operación', menu: 'emergencias',
    titulo: 'Informe de simulacro de emergencia',
    descripcion: 'Evaluación del simulacro de cada centro (Real Decreto 393/2007 y plan de autoprotección o de emergencia del centro).',
    html: () => `
${campos(['Centro', 'Fecha y hora', 'Escenario simulado', 'Observadores'])}
<p>${opciones(['Evacuación total', 'Evacuación parcial', 'Confinamiento', 'Conato de incendio'])} &nbsp; ${opciones(['Avisado', 'Sin aviso'])}</p>
${campos(['Personal participante', 'Usuarios presentes (y con movilidad reducida)', 'Turno (mañana / tarde / noche)', 'Ayuda exterior avisada (sí/no)'])}
<p class="etq">Cronología</p>
${fijas(['Momento', 'Hora', 'Observaciones'], ['Detección y alarma', 'Aviso al equipo de emergencia', 'Inicio de la evacuación', 'Salida de la última persona', 'Recuento finalizado', 'Fin del simulacro'], ['36%', '16%', '48%'])}
<p class="etq">Valoración</p>
${fijas(['Aspecto', 'Bien', 'Mejorable', 'Observaciones'], ['Alarma y comunicación', 'Actuación del equipo de emergencia', 'Evacuación de usuarios con movilidad reducida', 'Vías y salidas de evacuación', 'Punto de reunión y recuento', 'Medios de protección (extintores, alumbrado de emergencia)'], ['40%', '8%', '10%', '42%'], [false, true, true, false])}
<p class="etq">Mejoras</p>
${tabla(['Mejora', 'Responsable', 'Plazo'], 4, ['60%', '22%', '18%'])}
${firmas(['Jefe/a de emergencia', 'Técnico/a de prevención'])}`,
  },
  {
    id: 'maternidad', codigo: 'SG-P-MAT-01', grupo: 'Personas', menu: 'ere',
    titulo: 'Protocolo de protección de la maternidad y la lactancia',
    descripcion: 'Actuación cuando una trabajadora comunica embarazo, parto reciente o lactancia (art. 26 de la Ley 31/1995).',
    html: () => `
<p class="art"><b>1. Objeto.</b> Proteger la seguridad y salud de las trabajadoras embarazadas, que han dado a luz recientemente o en periodo de lactancia natural, y la del feto o el lactante, en todos los centros del Grupo Neural.</p>
<p class="art"><b>2. Marco normativo.</b> Art. 26 de la Ley 31/1995; anexos VII y VIII del Real Decreto 39/1997 (añadidos por el Real Decreto 298/2009); art. 45.1.e del Estatuto de los Trabajadores y prestaciones de riesgo durante el embarazo y la lactancia natural de la Ley General de la Seguridad Social.</p>
<p class="art"><b>3. Evaluación previa.</b> La evaluación de riesgos de cada puesto incluye la evaluación de riesgos para embarazo, parto reciente y lactancia (ERE), disponible en la plataforma para cada puesto y centro. En los centros sanitarios y sociosanitarios se presta especial atención a agentes biológicos, agresiones de usuarios, movilización de pacientes, bipedestación prolongada, turnos y trabajo nocturno.</p>
<p class="art"><b>4. Comunicación.</b> La trabajadora puede comunicar su situación, de forma voluntaria, a su responsable, a Recursos Humanos o al servicio de prevención. Se le informa de que la comunicación permite aplicar las medidas de protección. La información es confidencial y solo la conocen las personas que deben actuar.</p>
<p class="art"><b>5. Actuación.</b></p>
<ol><li>El servicio de prevención revisa la ERE del puesto con la trabajadora en un plazo máximo de ______ días.</li>
<li>Vigilancia de la salud (Quirón Prevención) valora su situación individual, si procede.</li>
<li>Si hay riesgo, se aplican por este orden: adaptación de las condiciones o del tiempo de trabajo (incluida la no realización de trabajo nocturno o a turnos); cambio a un puesto compatible; y, si no es posible, suspensión del contrato por riesgo durante el embarazo o la lactancia natural, que se tramita con la mutua.</li>
<li>Las medidas se comunican por escrito a la trabajadora y a su responsable, y se revisan en cada trimestre del embarazo, tras el parto y durante la lactancia.</li></ol>
<p class="art"><b>6. Registro.</b> Se conserva el registro de la comunicación, la revisión de la ERE, las medidas y sus revisiones, con acceso restringido.</p>
<p class="art"><b>7. Consulta.</b> Este protocolo se consulta a los delegados y delegadas de prevención antes de su aprobación.</p>
<p class="etq">Registro de actuación</p>
${campos(['Centro y puesto', 'Fecha de comunicación', 'Fecha de revisión de la ERE', 'Medida adoptada', 'Fechas de revisión'])}
${firmas(['Trabajadora (recibí)', 'Servicio de prevención'])}`,
  },
]
