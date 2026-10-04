// Evaluación de equipos e instalaciones: catálogo, preguntas, riesgos y medidas.
// Los equipos y las instalaciones se evalúan por separado. Si cambia el contenido, se sube EQUIPOS_VERSION.

export const EQUIPOS_VERSION = '1.1'

// Riesgos (botones, todos marcados por defecto). Cada uno lleva el riesgo del catálogo con el que pasa al PAP.
export const RIESGOS_EQ = [
  { k: 'golpe', nombre: 'Golpe', equipo: ['R08', 'Golpes o contactos con elementos móviles de máquinas'], instalacion: ['R07', 'Golpes contra objetos inmóviles'] },
  { k: 'electricidad', nombre: 'Electricidad', equipo: ['R14', 'Contactos eléctricos'], instalacion: ['R14', 'Contactos eléctricos'] },
  { k: 'ruido', nombre: 'Ruido', equipo: ['R28', 'Exposición a agentes físicos'], instalacion: ['R28', 'Exposición a agentes físicos'] },
  { k: 'vibracion', nombre: 'Vibración', equipo: ['R28', 'Exposición a agentes físicos'], instalacion: ['R28', 'Exposición a agentes físicos'] },
  { k: 'corte', nombre: 'Corte', equipo: ['R09', 'Golpes o cortes por objetos o herramientas'], instalacion: ['R09', 'Golpes o cortes por objetos o herramientas'] },
  { k: 'temperaturas', nombre: 'Temperaturas extremas', equipo: ['R13', 'Contactos térmicos'], instalacion: ['R13', 'Contactos térmicos'] },
  { k: 'atrapamiento', nombre: 'Atrapamiento', equipo: ['R11', 'Atrapamientos por o entre objetos'], instalacion: ['R11', 'Atrapamientos por o entre objetos'] },
  { k: 'otros', nombre: 'Otros', equipo: ['R39', 'Otros riesgos'], instalacion: ['R39', 'Otros riesgos'] },
]

export const RESPUESTAS = { si: 'Sí', no: 'No', no_precisa: 'No precisa' }

export const PREGUNTAS = {
  equipo: [
    { k: 'ce', texto: 'Marcado CE', opciones: ['si', 'no'] },
    { k: 'declaracion', texto: 'Declaración de conformidad', opciones: ['si', 'no'] },
    { k: 'manual', texto: 'Libro de instrucciones', opciones: ['si', 'no'] },
    { k: 'mantenimiento', texto: 'Mantenimiento preventivo', opciones: ['si', 'no', 'no_precisa'] },
    { k: 'registro_mantenimiento', texto: 'Registro del mantenimiento', opciones: ['si', 'no', 'no_precisa'] },
  ],
  instalacion: [
    { k: 'revision_anual', texto: 'Revisión anual de la instalación', opciones: ['si', 'no'] },
    { k: 'revision_trimestral', texto: 'Revisión trimestral de la instalación', opciones: ['si', 'no', 'no_precisa'] },
    { k: 'oca', texto: 'Inspección por OCA', opciones: ['si', 'no', 'no_precisa'] },
    { k: 'registro_incidencias', texto: 'Registro de incidencias', opciones: ['si', 'no'] },
    { k: 'mantenimiento', texto: 'Mantenimiento preventivo', opciones: ['si', 'no'] },
  ],
}

// Equipos e instalaciones. «fijo»: está en todos los centros. «sugerido»: se propone según la ficha del centro.
export const ELEMENTOS = [
  { codigo: 'E001', tipo: 'equipo', nombre: 'Equipos informáticos', fijo: true, legal: 'RD 1215/1997; RD 488/1997' },
  { codigo: 'E002', tipo: 'equipo', nombre: 'Escalera manual', fijo: true, legal: 'RD 1215/1997 (modificado por RD 2177/2004); UNE-EN 131' },
  { codigo: 'E101', tipo: 'equipo', nombre: 'Cocina', fijo: false, legal: 'RD 1215/1997; RD 1644/2008', sugerido: (c) => c.comedor === 'cocina_propia', porque: 'el centro tiene cocina propia' },
  { codigo: 'E102', tipo: 'equipo', nombre: 'Lavavajillas / tren de lavado', fijo: false, legal: 'RD 1215/1997; RD 1644/2008', sugerido: (c) => c.comedor === 'cocina_propia', porque: 'el centro tiene cocina propia' },
  { codigo: 'E103', tipo: 'equipo', nombre: 'Lavadora', fijo: false, legal: 'RD 1215/1997; RD 1644/2008', sugerido: (c) => !!c.lavanderia, porque: 'el centro tiene lavandería' },
  { codigo: 'E104', tipo: 'equipo', nombre: 'Cortadora de fiambre', fijo: false, legal: 'RD 1215/1997; RD 1644/2008', sugerido: (c) => c.comedor === 'cocina_propia', porque: 'el centro tiene cocina propia' },
  { codigo: 'I001', tipo: 'instalacion', nombre: 'Electricidad', fijo: true, legal: 'RD 842/2002 (Reglamento electrotécnico para baja tensión); RD 614/2001' },
  { codigo: 'I002', tipo: 'instalacion', nombre: 'Gas', fijo: true, legal: 'RD 919/2006 (Reglamento técnico de distribución y utilización de combustibles gaseosos)' },
  { codigo: 'I003', tipo: 'instalacion', nombre: 'Instalación contra incendios', fijo: true, legal: 'RD 513/2017 (Reglamento de instalaciones de protección contra incendios)' },
  { codigo: 'I101', tipo: 'instalacion', nombre: 'Ascensor', fijo: false, legal: 'RD 88/2013 (ITC AEM 1 Ascensores)', sugerido: (c) => !!c.ascensor, porque: 'la ficha del centro indica ascensor' },
  { codigo: 'I102', tipo: 'instalacion', nombre: 'Instalación frigorífica', fijo: false, legal: 'RD 552/2019 (Reglamento de seguridad para instalaciones frigoríficas)', sugerido: (c) => c.comedor === 'cocina_propia', porque: 'el centro tiene cocina propia (cámaras de frío)' },
]

// Medidas de los equipos
export const MEDIDAS_EQUIPO = {
  siempre: ['Seguir las instrucciones del fabricante.', 'Registrar las incidencias.'],
  ce: 'Solicitar al fabricante o suministrador la declaración CE de conformidad. Si el equipo no tiene marcado CE, comprobar que cumple las disposiciones mínimas del anexo I del RD 1215/1997 o retirarlo de uso.',
  declaracion: 'Solicitar al fabricante o suministrador la declaración CE de conformidad y archivarla en la documentación específica del centro.',
  manual: 'Solicitar al fabricante o suministrador el manual de instrucciones.',
  mantenimiento: 'Realizar el mantenimiento preventivo para garantizar la seguridad del equipo, teniendo en cuenta las instrucciones del fabricante.',
  registro_mantenimiento: 'Registrar la documentación de mantenimiento en la carpeta de documentación específica del centro.',
}

// Medidas de las instalaciones: «registrar incidencias» siempre; cada «no» es una incidencia que corregir.
export const MEDIDAS_INSTALACION = {
  siempre: ['Registrar las incidencias.'],
  revision_anual: 'realizar la revisión anual de la instalación por empresa habilitada y archivar el certificado',
  revision_trimestral: 'realizar las revisiones trimestrales de la instalación y dejar constancia por escrito',
  oca: 'realizar la inspección periódica por un organismo de control autorizado (OCA) en los plazos de su reglamento',
  registro_incidencias: 'implantar un registro de incidencias de la instalación',
  mantenimiento: 'establecer un mantenimiento preventivo de la instalación con empresa habilitada',
}
