// Menú lateral del SGPRL, ordenado según la estructura de la ISO 45001.
// Cada apartado lleva su id (el que usa App.jsx), su título, la sigla si la tiene y el apartado de la norma.
// Los apartados con «pendiente» ya están en el menú pero aún sin contenido: muestran qué van a recoger.

export const MENU_TECNICO = [
  {
    id: 'organizacion',
    titulo: 'Organización',
    iso: '4 · 5',
    items: [
      { id: 'centros', titulo: 'Datos de los centros', iso: '4.3' },
      {
        id: 'empresas', titulo: 'Empresas y servicio de prevención', iso: '4.1',
        pendiente: {
          texto: 'Empresas del Grupo Neural que integran el servicio de prevención mancomunado, sus recursos y las entidades con las que se conciertan actividades.',
          recoge: [
            'Empresas del grupo: razón social, CIF, códigos de cuenta de cotización, convenio y plantilla.',
            'Servicio de prevención mancomunado: técnicos, especialidades asumidas, recursos materiales y sede.',
            'Entidades concertadas: Quirón Prevención (vigilancia de la salud) y empresas colaboradoras de mediciones, emergencias y autoprotección, con sus contratos y vencimientos.',
          ],
        },
      },
      {
        id: 'politica', titulo: 'Política y objetivos', iso: '5.2 · 6.2',
        pendiente: {
          texto: 'Política de seguridad y salud firmada por la dirección y objetivos anuales medibles con su seguimiento.',
          recoge: [
            'Política de SST vigente, con fecha, firma y difusión.',
            'Objetivos del año con meta, indicador, responsable, plazo y recursos.',
            'Seguimiento trimestral del grado de cumplimiento.',
          ],
        },
      },
      {
        id: 'responsabilidades', titulo: 'Funciones y responsabilidades', iso: '5.3',
        pendiente: {
          texto: 'Organigrama preventivo: quién hace qué en prevención en cada nivel de la organización.',
          recoge: [
            'Responsabilidades de la dirección, mandos intermedios, responsables de centro y personas trabajadoras.',
            'Responsable de prevención de cada centro y sus datos de contacto.',
            'Designación de recursos preventivos cuando proceda.',
          ],
        },
      },
      { id: 'legal', titulo: 'Requisitos legales', iso: '6.1.3 · 9.1.2' },
    ],
  },
  {
    id: 'evaluacion',
    titulo: 'Evaluación de riesgos',
    iso: '6.1.2',
    items: [
      { id: 'evaluaciones', sigla: 'ER', titulo: 'Evaluación de Riesgos', iso: '6.1.2' },
      { id: 'ere', sigla: 'ERE', titulo: 'Embarazo, parto reciente y lactancia', iso: '6.1.2' },
      { id: 'actividades', titulo: 'Evaluación de actividades', iso: '6.1.2' },
      { id: 'funciones', titulo: 'Funciones de cada puesto', iso: '6.1.2' },
      { id: 'equipos', titulo: 'Equipos e instalaciones', iso: '6.1.2' },
      { id: 'lugar', titulo: 'Lugar de trabajo', iso: '6.1.2' },
      {
        id: 'especificas', titulo: 'Evaluaciones específicas', iso: '6.1.2',
        pendiente: {
          texto: 'Planificación y registro de las evaluaciones que exigen un método propio o mediciones.',
          recoge: [
            'Evaluación psicosocial (FPSICO u otro método validado) por centro, con sus resultados y medidas.',
            'Informes de condiciones ambientales de la empresa colaboradora: iluminación, temperatura, humedad, ruido y calidad del aire.',
            'Evaluación de la movilización de pacientes y de la manipulación de cargas.',
            'Fecha de realización, próxima revisión y medidas que pasan al PAP.',
          ],
        },
      },
      { id: 'metodologia', titulo: 'Metodología del sistema', iso: '6.1.2' },
    ],
  },
  {
    id: 'planificacion',
    titulo: 'Planificación',
    iso: '6.1.4 · 8.1',
    items: [
      { id: 'pap', sigla: 'PAP', titulo: 'Planificación de la actividad preventiva', iso: '6.1.4' },
      { id: 'pac', sigla: 'PAC', titulo: 'Planificación de la acción correctiva', iso: '6.1.4' },
      {
        id: 'cambio', titulo: 'Gestión del cambio', iso: '8.1.3',
        pendiente: {
          texto: 'Control de los cambios que pueden afectar a la seguridad y salud antes de que se produzcan.',
          recoge: [
            'Cambios en un centro: obras, servicios nuevos, otro tipo de paciente, nuevos equipos o productos.',
            'Aviso automático de que hay que revisar la evaluación del centro.',
            'Valoración del cambio, medidas previas y fecha de revisión.',
          ],
        },
      },
    ],
  },
  {
    id: 'personas',
    titulo: 'Personas',
    iso: '7.2 · 7.3',
    items: [
      {
        id: 'trabajadores', titulo: 'Trabajadores', iso: '7.2',
        pendiente: {
          texto: 'Ficha preventiva de cada persona, vinculada a su centro y a su puesto de la evaluación.',
          recoge: [
            'Listado de personal por centro con su puesto oficial y el puesto de la evaluación.',
            'Recibí de la información de riesgos, entrega de EPI y formación recibida, con firma en la plataforma.',
            'Caducidad de la formación y avisos.',
            'Ofrecimiento del reconocimiento médico (aceptado o renuncia) y fecha del siguiente.',
          ],
        },
      },
      { id: 'epis', sigla: 'EPI', titulo: 'Equipos de protección individual', iso: '7.2' },
      { id: 'form', sigla: 'FORM', titulo: 'Formación en prevención', iso: '7.2' },
      { id: 'ir', sigla: 'IR', titulo: 'Información de riesgos', iso: '7.3' },
      {
        id: 'salud', titulo: 'Vigilancia de la salud', iso: '7.2 · 8.1',
        pendiente: {
          texto: 'Seguimiento de la vigilancia de la salud concertada con Quirón Prevención, sin datos de diagnóstico.',
          recoge: [
            'Aptitudes recibidas (apto, apto con limitaciones, no apto) y su vigencia.',
            'Informes de adaptación pendientes y emitidos.',
            'Reconocimientos que vencen y avisos.',
            'Memoria anual de vigilancia de la salud de Quirón Prevención.',
          ],
        },
      },
    ],
  },
  {
    id: 'participacion',
    titulo: 'Participación y comunicación',
    iso: '5.4 · 7.4',
    items: [
      {
        id: 'comite', titulo: 'Comités y delegados', iso: '5.4',
        pendiente: {
          texto: 'Órganos de representación en prevención y sus reuniones.',
          recoge: [
            'Delegados de prevención y comités de seguridad y salud de cada empresa.',
            'Calendario de reuniones trimestrales, orden del día y actas.',
            'Acuerdos y su seguimiento.',
          ],
        },
      },
      {
        id: 'consultas', titulo: 'Consultas y comunicaciones', iso: '5.4 · 7.4',
        pendiente: {
          texto: 'Consultas obligatorias a los representantes y comunicaciones de riesgos del personal.',
          recoge: [
            'Consultas del art. 33 de la Ley 31/1995 con su fecha, respuesta y decisión.',
            'Comunicaciones de riesgos y sugerencias del personal, con su respuesta.',
            'Comunicaciones internas y externas del sistema.',
          ],
        },
      },
    ],
  },
  {
    id: 'operacion',
    titulo: 'Operación',
    iso: '8',
    items: [
      { id: 'cae', sigla: 'CAE', titulo: 'Coordinación de actividades empresariales', iso: '8.1.4' },
      { id: 'mantenimiento', titulo: 'Mantenimiento legal de instalaciones', iso: '8.1 · 9.1.2' },
      {
        id: 'emergencias', titulo: 'Emergencias y autoprotección', iso: '8.2',
        pendiente: {
          texto: 'Medidas de emergencia y planes de autoprotección elaborados por la empresa colaboradora y su implantación.',
          recoge: [
            'Plan de cada centro, su fecha y su próxima revisión.',
            'Equipos de emergencia designados y su formación.',
            'Simulacros realizados, informe y mejoras.',
          ],
        },
      },
    ],
  },
  {
    id: 'mejora',
    titulo: 'Incidentes y mejora',
    iso: '10',
    items: [
      { id: 'accidentes', titulo: 'Accidentes e incidentes', iso: '10.2' },
      { id: 'agresiones', titulo: 'Registro de agresiones', iso: '10.2' },
      {
        id: 'noconformidades', titulo: 'No conformidades', iso: '10.2',
        pendiente: {
          texto: 'Incumplimientos del sistema detectados en auditorías, visitas o revisiones, y sus acciones correctivas.',
          recoge: [
            'Origen, descripción y análisis de causas.',
            'Acción correctiva, responsable y plazo.',
            'Comprobación de la eficacia y cierre.',
          ],
        },
      },
    ],
  },
  {
    id: 'seguimiento',
    titulo: 'Seguimiento y auditoría',
    iso: '9',
    items: [
      {
        id: 'indicadores', titulo: 'Cuadro de mando', iso: '9.1',
        pendiente: {
          texto: 'Indicadores del sistema en una sola pantalla, para el técnico y la dirección.',
          recoge: [
            'Centros con evaluación vigente, acciones del PAP y de la PAC realizadas y vencidas.',
            'Accidentes, agresiones e índices de siniestralidad.',
            'Formación, información y vigilancia de la salud al día.',
            'Grado de cumplimiento de los objetivos.',
          ],
        },
      },
      {
        id: 'auditorias', titulo: 'Auditorías', iso: '9.2',
        pendiente: {
          texto: 'Programa de auditorías internas de la ISO 45001 y auditoría legal del servicio de prevención (art. 30 del RD 39/1997).',
          recoge: [
            'Programa anual de auditorías internas y su alcance.',
            'Informes, hallazgos y no conformidades.',
            'Auditoría legal del servicio de prevención mancomunado: la primera en los doce meses siguientes a su constitución.',
          ],
        },
      },
      {
        id: 'revision', titulo: 'Revisión por la dirección', iso: '9.3',
        pendiente: {
          texto: 'Revisión anual del sistema por la dirección, con sus entradas y decisiones.',
          recoge: [
            'Datos de entrada: objetivos, indicadores, auditorías, incidentes, consultas y cambios.',
            'Conclusiones y decisiones sobre recursos y mejoras.',
            'Acta firmada.',
          ],
        },
      },
      { id: 'memoria', titulo: 'Memoria y programa anual', iso: '9.1' },
    ],
  },
  {
    id: 'documentacion',
    titulo: 'Documentación',
    iso: '7.5',
    items: [
      { id: 'procedimientos', titulo: 'Documentos generales y procedimientos', iso: '7.5' },
      { id: 'docs_centro', titulo: 'Documentos por centro', iso: '7.5' },
      { id: 'cambios', titulo: 'Control de cambios', iso: '7.5.3' },
      { id: 'plantillas', titulo: 'Plantillas del sistema', iso: '7.5' },
      { id: 'biblioteca', titulo: 'Biblioteca de referencia', iso: '7.5' },
    ],
  },
  {
    id: 'configuracion',
    titulo: 'Configuración',
    items: [
      { id: 'actualizar', titulo: 'Actualizar datos', ayuda: 'Centros, medidas, matriz y listas de comprobación' },
    ],
  },
]

// Menú del usuario de centro (solo lo suyo).
export const MENU_CENTRO = [
  { id: 'inicio', titulo: 'Inicio', items: [{ id: 'panel', titulo: 'Panel del centro' }] },
  {
    id: 'evaluacion', titulo: 'Evaluación de riesgos', items: [
      { id: 'evaluacion', sigla: 'ER', titulo: 'Evaluación de Riesgos' },
      { id: 'ere', sigla: 'ERE', titulo: 'Embarazo, parto reciente y lactancia' },
      { id: 'equipos', titulo: 'Equipos e instalaciones' },
      { id: 'funciones', titulo: 'Funciones de cada puesto' },
      { id: 'metodologia', titulo: 'Metodología del sistema' },
    ],
  },
  {
    id: 'planificacion', titulo: 'Planificación', items: [
      { id: 'pap', sigla: 'PAP', titulo: 'Planificación de la actividad preventiva' },
      { id: 'pac', sigla: 'PAC', titulo: 'Planificación de la acción correctiva' },
    ],
  },
  {
    id: 'personas', titulo: 'Personas', items: [
      { id: 'epis', sigla: 'EPI', titulo: 'Equipos de protección individual' },
      { id: 'form', sigla: 'FORM', titulo: 'Formación en prevención' },
      { id: 'ir', sigla: 'IR', titulo: 'Información de riesgos' },
    ],
  },
  { id: 'mejora', titulo: 'Incidentes', items: [{ id: 'comunicar', titulo: 'Comunicar accidente o incidente' }, { id: 'agresiones', titulo: 'Registro de agresiones' }] },
  { id: 'contratas', titulo: 'Contratas', items: [{ id: 'pase', titulo: 'Comprobar pase de contratas' }] },
  {
    id: 'documentacion', titulo: 'Documentación', items: [
      { id: 'procedimientos', titulo: 'Documentos generales y procedimientos' },
      { id: 'docs', titulo: 'Documentos de mi centro' },
      { id: 'biblioteca', titulo: 'Biblioteca de referencia' },
    ],
  },
]

export const todosLosItems = (menu) => menu.flatMap((g) => g.items.map((it) => ({ ...it, grupo: g.titulo })))
export const buscarItem = (menu, id) => todosLosItems(menu).find((it) => it.id === id)
