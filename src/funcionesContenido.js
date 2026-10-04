// Funciones de cada puesto y evaluación de las actividades que realizan.
// Contenido de solo lectura. Cualquier cambio implica subir la versión.
export const FUNCIONES_VERSION = "1.3";
export const FUNCIONES_FECHA = "2026-10-03";

// Estado de cada actividad: documento (evaluada en el documento de ejemplo o en el de un puesto), matriz (evaluada con la matriz actual)
export const CATEGORIAS = ["Organización del trabajo y horario", "Oficina y pantallas", "Atención a usuarios", "Limpieza, lavandería y cocina", "Mantenimiento y equipos de trabajo", "Ergonomía", "Instalaciones y seguridad general", "Desplazamientos"];

// Cada puesto: funciones, actividades, valoraciones propias (ajustes sobre las actividades y riesgos propios)
export const PUESTOS_FUNCIONES = [
 {
  "nombre": "Médico/a",
  "confirmada": true,
  "funciones": "Aporta la visión médica al tratamiento neurorrehabilitador del paciente y coordina las decisiones clínicas con el resto del equipo.",
  "tareas": [
   "Estudiar la historia clínica y realizar la primera valoración: tests neurológicos y cognitivos, exploración física y entrevista con la persona acompañante.",
   "Determinar el número de sesiones y los especialistas que atenderán al paciente, y presentar al equipo la pauta prescrita.",
   "Redactar la historia clínica tras la primera visita y resolver las dudas de familiares y acompañantes sobre el diagnóstico y el tratamiento.",
   "Asistir al comité médico del hospital y a las reuniones interdisciplinares; proponer ajustes del tratamiento y pautar la previsión de mejora y la fecha de alta.",
   "Hacer el seguimiento periódico de las terapias y organizar el envío de informes de todas las áreas para el informe global final al centro que deriva al paciente."
  ],
  "contacto": "Contacto directo con pacientes y familiares en consulta.",
  "nota": "",
  "epi": "",
  "actividades": [
   "A01",
   "A02",
   "A03",
   "A04",
   "A05",
   "A06",
   "A08",
   "A09",
   "A18",
   "A20",
   "A27",
   "A28",
   "A29",
   "A31",
   "A32",
   "A33",
   "A35",
   "A36"
  ],
  "ajustes": [],
  "propios": []
 },
 {
  "nombre": "Psiquiatra",
  "confirmada": true,
  "funciones": "Confirma el diagnóstico, ajusta el tratamiento farmacológico y participa en la intervención con pacientes y familias.",
  "tareas": [
   "Entrevistar a pacientes y familiares en la valoración de primer contacto y en los seguimientos.",
   "Aplicar pruebas psicométricas y de personalidad, y plantear los objetivos que se quieren conseguir con cada paciente.",
   "Elaborar el informe de pauta de tratamiento farmacológico y explicárselo a la familia.",
   "Coordinarse por teléfono con otros recursos que atienden al paciente y resumir cada caso con el resto del equipo.",
   "Dirigir terapias de grupo e intervenciones con grupos de familias."
  ],
  "contacto": "Contacto estrecho con pacientes, también infantojuveniles con problemas de conducta.",
  "nota": "",
  "epi": "",
  "actividades": [
   "A03",
   "A04",
   "A05",
   "A06",
   "A08",
   "A09",
   "A18",
   "A20",
   "A27",
   "A28",
   "A29",
   "A31",
   "A32",
   "A33",
   "A35",
   "A36"
  ],
  "ajustes": [],
  "propios": []
 },
 {
  "nombre": "Enfermero/a",
  "confirmada": true,
  "funciones": "Presta atención integral de enfermería al paciente y vela por su salud en el día a día.",
  "tareas": [
   "Diseñar el plan educativo de salud y valorar los cuidados de enfermería al ingreso.",
   "Prestar apoyo asistencial al paciente, también en situaciones de crisis.",
   "Gestionar y administrar la medicación.",
   "Coordinarse con el psiquiatra interno y externo y con el centro de salud.",
   "Mantener comunicación continua con los padres sobre el estado de salud de los menores."
  ],
  "contacto": "Contacto directo con pacientes.",
  "nota": "Su descripción original dice que no utiliza equipos ni productos químicos; conviene revisarla, porque administra medicación y atiende a pacientes.",
  "epi": "",
  "actividades": [
   "A02",
   "A04",
   "A05",
   "A06",
   "A08",
   "A09",
   "A10",
   "A11",
   "A18",
   "A20",
   "A24",
   "A27",
   "A29",
   "A30",
   "A31",
   "A32",
   "A33",
   "A35",
   "A36"
  ],
  "ajustes": [],
  "propios": []
 },
 {
  "nombre": "Psicólogo/a",
  "confirmada": true,
  "funciones": "Coordina los servicios terapéuticos que reciben los usuarios y realiza la intervención psicológica con ellos y con sus familias.",
  "tareas": [
   "Citar y entrevistar a las familias: situación del menor, rutinas diarias y funcionamiento del centro.",
   "Aplicar pruebas y escalas de valoración, y establecer y revisar los objetivos.",
   "Realizar las sesiones terapéuticas, en el centro y en el entorno del paciente.",
   "Dar pautas a las familias y a los centros educativos sobre la intervención.",
   "Elaborar el informe final y el informe que justifica el número de sesiones ante la Conselleria; asesorar en el área social y derivar a trabajo social."
  ],
  "contacto": "Contacto estrecho con pacientes y familias; riesgo de violencia de usuarios con problemas de conducta.",
  "nota": "",
  "epi": "",
  "actividades": [
   "A03",
   "A04",
   "A05",
   "A06",
   "A08",
   "A09",
   "A18",
   "A20",
   "A27",
   "A28",
   "A29",
   "A31",
   "A32",
   "A33",
   "A35",
   "A36"
  ],
  "ajustes": [],
  "propios": []
 },
 {
  "nombre": "Farmacéutico/a",
  "confirmada": true,
  "funciones": "Dispensa medicamentos y atiende a los pacientes en la farmacia del centro.",
  "tareas": [
   "Dispensar medicamentos y preparar blísteres con la blisteadora manual.",
   "Usar pantallas de visualización de datos y material de despacho: cúter, grapadoras y similares.",
   "Colocar material en estanterías y armarios y manipular pequeñas cargas de forma ocasional.",
   "Usar de forma ocasional productos de limpieza."
  ],
  "contacto": "Atención directa a pacientes: posibles agresiones y exposición a agentes biológicos.",
  "nota": "",
  "epi": "A proporcionar: guantes de protección frente al riesgo químico (UNE-EN 374-1).",
  "actividades": [
   "A05",
   "A08",
   "A09",
   "A20",
   "A24",
   "A27",
   "A28",
   "A31",
   "A32",
   "A33",
   "A35",
   "A36"
  ],
  "ajustes": [
   {
    "actividad": "Tránsito por el centro (escaleras, accesos y zonas de paso)",
    "actividad_id": "A33",
    "r": "R02",
    "condicion": "Tránsito → distracciones",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "base": "B·LD=T"
   },
   {
    "actividad": "Manipulación manual de cargas y uso de carros",
    "actividad_id": "A27",
    "r": "R04",
    "condicion": "Manipulación manual de cargas",
    "P": "B",
    "C": "LD",
    "VR": "T",
    "base": "B·D=TO"
   },
   {
    "actividad": "Uso de equipos ofimáticos",
    "actividad_id": "A05",
    "r": "R09",
    "condicion": "Utilización de equipos de oficina",
    "P": "B",
    "C": "LD",
    "VR": "T",
    "base": "B·D=TO"
   },
   {
    "actividad": "Uso de equipos y herramientas eléctricas",
    "actividad_id": "A20",
    "r": "R14",
    "condicion": "Uso de equipos y herramientas eléctricas",
    "P": "M",
    "C": "D",
    "VR": "MO",
    "base": "B·D=TO"
   },
   {
    "actividad": "Manipulación manual de cargas y uso de carros",
    "actividad_id": "A27",
    "r": "R30",
    "condicion": "Manejo de cargas de más de 3 kg",
    "P": "B",
    "C": "LD",
    "VR": "T",
    "base": "B·D=TO"
   },
   {
    "actividad": "Uso de equipos ofimáticos",
    "actividad_id": "A05",
    "r": "R31",
    "condicion": "Personas usuarias de PVD",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "base": "M·D=MO"
   }
  ],
  "propios": [
   {
    "r": "R07",
    "riesgo": "Golpes contra objetos inmóviles",
    "condicion": "Orden y limpieza",
    "P": "B",
    "C": "LD",
    "VR": "T",
    "medidas": [
     {
      "t": "Informar a los trabajadores sobre las zonas específicas de almacenamiento de material. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "Ley 31/1995, RD 486/1997"
     }
    ]
   },
   {
    "r": "R36",
    "riesgo": "Estrés laboral",
    "condicion": "Estrés (Factores organizacionales) → Carga y ritmo de trabajo",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "medidas": [
     {
      "t": "Informar sobre el riesgo de estrés laboral. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "CT ITSS 104/2021; NTP 534, NTP 544, NTP 575, NTP 659"
     }
    ]
   },
   {
    "r": "R37",
    "riesgo": "Fatiga derivada de la ordenación del tiempo de trabajo",
    "condicion": "Fatiga derivada de la ordenación del tiempo de trabajo. (Factores organizacionales) → Carga y ritmo de trabajo",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "medidas": [
     {
      "t": "Informar sobre el riesgo de fatiga mental en el trabajo. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "CT ITSS 104/2021; NTP 534, NTP 544, NTP 575, NTP 659"
     }
    ]
   },
   {
    "r": "R38",
    "riesgo": "Violencia en el trabajo",
    "condicion": "Violencia en el trabajo (Factores interpersonales) → Relaciones personales",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "medidas": [
     {
      "t": "Informar sobre los riesgos y medidas frente al acoso sexual o por razón de sexo. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "RD 901/2020"
     },
     {
      "t": "Informar sobre el riesgo de violencia (física, psicológica y sexual) en el lugar de trabajo. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "LO 10/2022, CT ITSS 69/2009 y CT ITSS 104/2021; NTP 507, NTP 823, NTP 854, NTP 891, NTP 892"
     }
    ]
   }
  ]
 },
 {
  "nombre": "Fisioterapeuta",
  "confirmada": true,
  "funciones": "Participa en la recuperación de la movilidad motora y favorece la mayor independencia posible del paciente tras un daño cerebral.",
  "tareas": [
   "Realizar la primera entrevista y las pruebas de coordinación, dolor, fuerza y movilidad.",
   "Estudiar los casos antes y durante el tratamiento y establecer los objetivos con el equipo multidisciplinar.",
   "Aplicar el tratamiento rehabilitador y reforzar el aseo personal y las actividades de la vida diaria junto con terapia ocupacional.",
   "Diseñar actividades y preparar el material de refuerzo de las sesiones.",
   "Redactar los informes iniciales y de seguimiento y coordinarse con el equipo de terapeutas en las reuniones multidisciplinares."
  ],
  "contacto": "Contacto estrecho con usuarios adultos con problemas de conducta: riesgo de violencia física y verbal, y riesgo biológico.",
  "nota": "",
  "epi": "",
  "actividades": [
   "A05",
   "A08",
   "A09",
   "A10",
   "A18",
   "A20",
   "A27",
   "A29",
   "A30",
   "A31",
   "A32",
   "A33",
   "A35",
   "A36"
  ],
  "ajustes": [
   {
    "actividad": "Almacenamiento en estanterías y armarios",
    "actividad_id": "A32",
    "r": "R03",
    "condicion": "Almacenamiento en estanterías o armarios",
    "P": "B",
    "C": "LD",
    "VR": "T",
    "base": "B·D=TO"
   },
   {
    "actividad": "Tránsito por el centro (escaleras, accesos y zonas de paso)",
    "actividad_id": "A33",
    "r": "R07",
    "condicion": "Espacio insuficiente en accesos y tránsitos",
    "P": "B",
    "C": "LD",
    "VR": "T",
    "base": "B·D=TO"
   },
   {
    "actividad": "Uso de equipos y herramientas eléctricas",
    "actividad_id": "A20",
    "r": "R14",
    "condicion": "Uso de equipos y herramientas eléctricas",
    "P": "B",
    "C": "ED",
    "VR": "MO",
    "base": "B·D=TO"
   },
   {
    "actividad": "Movilización de pacientes y residentes",
    "actividad_id": "A10",
    "r": "R30",
    "condicion": "Manipulación manual de cargas → manipulación de pacientes",
    "P": "M",
    "C": "D",
    "VR": "MO",
    "base": "B·D=TO"
   },
   {
    "actividad": "Uso de equipos ofimáticos",
    "actividad_id": "A05",
    "r": "R31",
    "condicion": "Personas usuarias de PVD",
    "P": "B",
    "C": "LD",
    "VR": "T",
    "base": "M·D=MO"
   }
  ],
  "propios": [
   {
    "r": "R36",
    "riesgo": "Estrés laboral",
    "condicion": "Estrés (Factores organizacionales) → Carga y ritmo de trabajo",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "medidas": [
     {
      "t": "Informar sobre el riesgo de estrés laboral. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "CT ITSS 104/2021; NTP 534, NTP 544, NTP 575, NTP 659"
     }
    ]
   },
   {
    "r": "R37",
    "riesgo": "Fatiga derivada de la ordenación del tiempo de trabajo Probabilidad CONDICIÓN DETECTADA Consecuencia VR D.N Demandas psicológicas MARCO LEGAL MP/MC (P/C) MEDIDA Ley 31/1995 C Se recomienda establecer Protocolos de actuación en situaciones de difícil manejo o difícil toma de decisiones.Se informará a los trabajadores de dichos protocolos, dejando constancia documental. Ley 31/1995 C Se recomienda establecer reuniones periódicas para la toma de decisiones complejas.",
    "condicion": "Fatiga derivada de la ordenación del tiempo de trabajo. (Factores organizacionales) → Carga y ritmo de trabajo",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "medidas": [
     {
      "t": "Informar sobre el riesgo de fatiga mental en el trabajo. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "CT ITSS 104/2021; NTP 534, NTP 544, NTP 575, NTP 659"
     }
    ]
   },
   {
    "r": "R38",
    "riesgo": "Violencia en el trabajo",
    "condicion": "Violencia en el trabajo (Factores interpersonales) → Relaciones personales",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "medidas": [
     {
      "t": "Informar sobre los riesgos y medidas frente al acoso sexual o por razón de sexo. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "RD 901/2020"
     },
     {
      "t": "Informar sobre el riesgo de violencia (física, psicológica y sexual) en el lugar de trabajo. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "LO 10/2022, CT ITSS 69/2009 y CT ITSS 104/2021; NTP 507, NTP 823, NTP 854, NTP 891, NTP 892"
     }
    ]
   }
  ]
 },
 {
  "nombre": "Terapeuta ocupacional",
  "confirmada": true,
  "funciones": "Mejora la independencia y la calidad de vida del paciente tras un daño cerebral y orienta a las familias en el día a día.",
  "tareas": [
   "Entrevistar a la familia, revisar la historia médica y aplicar escalas de valoración.",
   "Diseñar planes para minimizar el riesgo en la movilidad funcional: cama y transferencias.",
   "Entrenar y adaptar las actividades de la vida diaria, y abordar las alteraciones sensoriomotoras del miembro superior, con técnicas como la imaginería motora.",
   "Recomendar productos ortopédicos y preparar los materiales terapéuticos de las sesiones.",
   "Elaborar pautas de seguimiento para pacientes y familias y registrar las incidencias de las terapias en la aplicación clínica."
  ],
  "contacto": "Contacto estrecho con pacientes.",
  "nota": "",
  "epi": "",
  "actividades": [
   "A03",
   "A04",
   "A05",
   "A06",
   "A08",
   "A09",
   "A10",
   "A18",
   "A20",
   "A27",
   "A29",
   "A30",
   "A31",
   "A32",
   "A33",
   "A35",
   "A36"
  ],
  "ajustes": [],
  "propios": []
 },
 {
  "nombre": "Trabajador/a social",
  "confirmada": true,
  "funciones": "Favorece la igualdad de oportunidades de los usuarios mediante la intervención social, las sesiones grupales y la orientación a las familias.",
  "tareas": [
   "Preparar el material de los talleres y recoger la zona de trabajo después de cada sesión.",
   "Realizar sesiones grupales con usuarios con dificultades derivadas de daño cerebral.",
   "Registrar los ejercicios y las observaciones de cada usuario.",
   "Orientar a las familias sobre recursos y trámites sociales y coordinarse con otros servicios y con el equipo."
  ],
  "contacto": "Trato directo con usuarios con discapacidad.",
  "nota": "",
  "epi": "",
  "actividades": [
   "A03",
   "A04",
   "A05",
   "A06",
   "A08",
   "A09",
   "A10",
   "A18",
   "A20",
   "A27",
   "A28",
   "A31",
   "A32",
   "A33",
   "A35",
   "A36"
  ],
  "ajustes": [],
  "propios": []
 },
 {
  "nombre": "Educador/a social",
  "confirmada": true,
  "funciones": "Favorece la igualdad de oportunidades de los usuarios mediante talleres y sesiones grupales.",
  "tareas": [
   "Preparar el material de los talleres y recoger la zona de trabajo después de cada sesión.",
   "Realizar sesiones grupales con usuarios con dificultades derivadas de daño cerebral.",
   "Registrar los ejercicios y las observaciones de cada usuario."
  ],
  "contacto": "Trato directo con usuarios; usa la voz de forma continuada.",
  "nota": "",
  "epi": "",
  "actividades": [
   "A03",
   "A04",
   "A05",
   "A06",
   "A07",
   "A08",
   "A09",
   "A10",
   "A18",
   "A20",
   "A27",
   "A28",
   "A29",
   "A31",
   "A32",
   "A33",
   "A35",
   "A36"
  ],
  "ajustes": [],
  "propios": []
 },
 {
  "nombre": "TASOC / Animador/a sociocultural",
  "confirmada": true,
  "funciones": "Realiza actividades con los usuarios, tanto en el día a día como en sesiones y excursiones fuera del centro.",
  "tareas": [
   "Acompañar a los usuarios en las tareas cotidianas.",
   "Dirigir sesiones de animación con los usuarios.",
   "Organizar y acompañar excursiones fuera del centro."
  ],
  "contacto": "Contacto estrecho con usuarios; riesgo de violencia por usuarios con problemas de conducta.",
  "nota": "",
  "epi": "",
  "actividades": [
   "A02",
   "A05",
   "A06",
   "A08",
   "A09",
   "A10",
   "A18",
   "A20",
   "A27",
   "A29",
   "A30",
   "A31",
   "A32",
   "A33",
   "A35",
   "A36",
   "A37"
  ],
  "ajustes": [],
  "propios": []
 },
 {
  "nombre": "Profesor/a",
  "confirmada": true,
  "funciones": "Enseña a los usuarios: prepara e imparte las clases y organiza actividades prácticas y excursiones.",
  "tareas": [
   "Preparar las clases: estrategias de aprendizaje, notas orientativas y recursos visuales.",
   "Impartir las clases con pizarra, proyector y ordenador, usando la voz de forma continuada.",
   "Planificar y realizar actividades prácticas, visitas y excursiones, y asistir a las reuniones con las familias y a los claustros.",
   "Usar pantallas de visualización de datos para tareas administrativas y material de oficina (cúter, grapadoras, tijeras).",
   "Manipular pequeñas cargas de forma esporádica, por debajo de unos 3 kg, y mantener posturas prolongadas de pie o sentado y posturas de tronco, cuello, muñeca y hombro al escribir en la pizarra."
  ],
  "contacto": "Trato directo con usuarios.",
  "nota": "",
  "epi": "",
  "actividades": [
   "A05",
   "A07",
   "A08",
   "A09",
   "A20",
   "A27",
   "A28",
   "A31",
   "A35",
   "A36",
   "A37"
  ],
  "ajustes": [
   {
    "actividad": "Manipulación manual de cargas y uso de carros",
    "actividad_id": "A27",
    "r": "R04",
    "condicion": "Manipulación manual de cargas",
    "P": "M",
    "C": "D",
    "VR": "MO",
    "base": "B·D=TO"
   },
   {
    "actividad": "Uso de equipos ofimáticos",
    "actividad_id": "A05",
    "r": "R09",
    "condicion": "Utilización de equipos de oficina",
    "P": "B",
    "C": "LD",
    "VR": "T",
    "base": "B·D=TO"
   },
   {
    "actividad": "Atención directa a usuarios (contacto y fluidos biológicos)",
    "actividad_id": "A08",
    "r": "R29",
    "condicion": "Grupos 2 y 3 por diferentes vías de entrada",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "base": "M·D=MO"
   },
   {
    "actividad": "Uso de la voz",
    "actividad_id": "A07",
    "r": "R35",
    "condicion": "Uso de la voz",
    "P": "M",
    "C": "D",
    "VR": "MO",
    "base": "B·D=TO"
   }
  ],
  "propios": [
   {
    "r": "R02",
    "riesgo": "Caídas de personas en el mismo nivel",
    "condicion": "Ausencia de orden y limpieza → Cables en zonas de paso",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "medidas": [
     {
      "t": "Informar a los trabajadores sobre la necesidad de evitar distribuir cables y equipos de trabajo ocupando zonas de paso. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "Ley 31/1995"
     }
    ]
   },
   {
    "r": "R07",
    "riesgo": "Golpes contra objetos inmóviles",
    "condicion": "Golpes con el mobiliario, instalaciones...",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "medidas": [
     {
      "t": "Se deberá garantizar que existe espacio suficiente debajo de la mesa para colocar las piernas",
      "tipo": "P",
      "legal": "RD 486/1997"
     },
     {
      "t": "Es importante que se cree el hábito de cerrar cajones y armarios después de su uso. Realizar un control periódico de las condiciones de trabajo, verificando la ausencia de obstáculos alrededor de los puestos de trabajo.",
      "tipo": "P",
      "legal": "Criterio Técnico"
     },
     {
      "t": "La colocación del mobiliario deberá permitir siempre la posición de pie y sentado, disponiendo de espacio suficiente para pasar fácilmente las piernas por debajo de la mesa, poder desplazar el asiento,alcanzar con facilidad los materiales y equipos, poder entrar y salir cómodamente del puesto de trabajo.",
      "tipo": "P",
      "legal": "Criterio Técnico"
     }
    ]
   },
   {
    "r": "R36",
    "riesgo": "Estrés laboral",
    "condicion": "Estrés (Factores organizacionales) → Carga y ritmo de trabajo",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "medidas": [
     {
      "t": "Informar sobre el riesgo de estrés laboral. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "CT ITSS 104/2021; NTP 534, NTP 544, NTP 575, NTP 659"
     }
    ]
   },
   {
    "r": "R37",
    "riesgo": "Fatiga derivada de la ordenación del tiempo de trabajo",
    "condicion": "Fatiga derivada de la ordenación del tiempo de trabajo. (Factores organizacionales) → Carga y ritmo de trabajo",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "medidas": [
     {
      "t": "Informar sobre el riesgo de fatiga mental en el trabajo. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "CT ITSS 104/2021; NTP 534, NTP 544, NTP 575, NTP 659"
     }
    ]
   },
   {
    "r": "R38",
    "riesgo": "Violencia en el trabajo",
    "condicion": "Violencia en el trabajo (Factores interpersonales) → Relaciones personales",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "medidas": [
     {
      "t": "Informar sobre los riesgos y medidas frente al acoso sexual o por razón de sexo. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "RD 901/2020"
     },
     {
      "t": "Informar sobre el riesgo de violencia (física, psicológica y sexual) en el lugar de trabajo. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "LO 10/2022, CT ITSS 69/2009 y CT ITSS 104/2021; NTP 507, NTP 823, NTP 854, NTP 891, NTP 892"
     }
    ]
   }
  ]
 },
 {
  "nombre": "Auxiliar de Enfermería",
  "confirmada": true,
  "funciones": "Acompaña y atiende de forma integral a pacientes y usuarios y apoya a los terapeutas en las sesiones y en el cumplimiento de la agenda diaria de terapias.",
  "tareas": [
   "Asistir al paciente en sus necesidades básicas: toma de tensión, higiene personal, acompañamiento al baño, cambios de ropa y transferencias.",
   "Supervisar la alimentación: preparar almuerzos y meriendas, controlar la comida y ayudar en la ingesta.",
   "Suministrar la medicación cuando corresponda y seguir el estado de los pacientes, registrando las incidencias en el PAI.",
   "Apoyar a los terapeutas: preparar materiales, instalar máquinas y herramientas, colocar férulas y adecuar las salas; preparar los talleres y reponer el material de higiene de los baños.",
   "Gestionar la agenda diaria y la documentación (derivaciones e informes), atender el teléfono, contactar con familias y activar o dar de baja ambulancias.",
   "Controlar y registrar los pedidos de materiales (pañales, empapadores y otros fungibles) y mantener el espacio de trabajo."
  ],
  "contacto": "Contacto directo con pacientes: higiene, cambios de ropa y transferencias.",
  "nota": "",
  "epi": "",
  "actividades": [
   "A01",
   "A02",
   "A03",
   "A04",
   "A05",
   "A06",
   "A08",
   "A09",
   "A10",
   "A12",
   "A13",
   "A18",
   "A20",
   "A27",
   "A29",
   "A30",
   "A31",
   "A32",
   "A33",
   "A35",
   "A36",
   "A37"
  ],
  "ajustes": [],
  "propios": []
 },
 {
  "nombre": "Gerocultor/a",
  "confirmada": true,
  "funciones": "Cuida cada día a los residentes mayores: higiene, alimentación, acompañamiento y medicación.",
  "tareas": [
   "Levantar y duchar a los usuarios, y hacer el aseo en la cama a los encamados según el grado de asistencia que necesiten.",
   "Cambiar la ropa y los pañales siempre que sea necesario.",
   "Acompañar a los usuarios al comedor y a las sesiones, y asistirles en el desayuno, la comida, la merienda y la cena.",
   "Administrar la medicación emblistada que no sea inyectable, en aerosol ni en gotas."
  ],
  "contacto": "Contacto directo con usuarios: expuesto a agentes biológicos y a posibles agresiones.",
  "nota": "",
  "epi": "Disponibles: calzado antideslizante (UNE-EN ISO 20347) y guantes de protección contra microorganismos (UNE-EN ISO 374-5 e ISO 16604). A proporcionar: pantalla facial, también para salpicaduras de líquidos (UNE-EN 166).",
  "actividades": [
   "A02",
   "A08",
   "A09",
   "A10",
   "A18",
   "A20",
   "A27",
   "A29",
   "A30",
   "A31",
   "A33",
   "A35",
   "A36",
   "A37"
  ],
  "ajustes": [
   {
    "actividad": "Tránsito por el centro (escaleras, accesos y zonas de paso)",
    "actividad_id": "A33",
    "r": "R02",
    "condicion": "Tránsito → distracciones",
    "P": "M",
    "C": "D",
    "VR": "MO",
    "base": "B·LD=T"
   },
   {
    "actividad": "Tránsito por el centro (escaleras, accesos y zonas de paso)",
    "actividad_id": "A33",
    "r": "R07",
    "condicion": "Espacio insuficiente en accesos y tránsitos",
    "P": "M",
    "C": "D",
    "VR": "MO",
    "base": "B·D=TO"
   },
   {
    "actividad": "Desplazamientos in itinere",
    "actividad_id": "A36",
    "r": "R22",
    "condicion": "Desplazamientos in itinere",
    "P": "M",
    "C": "D",
    "VR": "MO",
    "base": "B·ED=MO"
   },
   {
    "actividad": "Movilización de pacientes y residentes",
    "actividad_id": "A10",
    "r": "R30",
    "condicion": "Manipulación manual de cargas → manipulación de pacientes",
    "P": "M",
    "C": "D",
    "VR": "MO",
    "base": "B·D=TO"
   }
  ],
  "propios": [
   {
    "r": "R02",
    "riesgo": "Caídas de personas en el mismo nivel",
    "condicion": "Ausencia de orden y limpieza → Vertidos o derrames de productos",
    "P": "M",
    "C": "D",
    "VR": "MO",
    "medidas": [
     {
      "t": "Informar a los trabajadores sobre la necesidad de recoger inmediatamente los derrames o vertidos y señalizar la situación de suelo deslizante mientras se mantenga la situación de riesgo. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "Ley 31/1995"
     },
     {
      "t": "Velar por la utilización correcta del EPI: Calzado de trabajo con suela antideslizante y una correcta sujeción del talón (UNE_EN ISO 20347)",
      "tipo": "P",
      "legal": "RD 773/1997"
     }
    ]
   },
   {
    "r": "R10",
    "riesgo": "Proyección de fragmentos o partículas",
    "condicion": "Durante tareas de limpieza de instrumental y/o asistencia a las tareas de limpieza",
    "P": "M",
    "C": "D",
    "VR": "MO",
    "medidas": [
     {
      "t": "Proporcionar a las personas trabajadoras: Pantalla facial para salpicaduras de líquidos (UNE- EN 166)",
      "tipo": "P",
      "legal": "RD 773/1997"
     }
    ]
   },
   {
    "r": "R36",
    "riesgo": "Estrés laboral",
    "condicion": "Estrés (Factores organizacionales) → Carga y ritmo de trabajo → Excesiva carga de trabajo",
    "P": "M",
    "C": "D",
    "VR": "MO",
    "medidas": [
     {
      "t": "Informar sobre el riesgo de estrés laboral. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "CT ITSS 2012; NTP 534, NTP 544, NTP 575, NTP 659"
     }
    ]
   },
   {
    "r": "R37",
    "riesgo": "Fatiga derivada de la ordenación del tiempo de trabajo",
    "condicion": "Carga de trabajo",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "medidas": [
     {
      "t": "Informar a los trabajadores sobre el riesgo de carga mental → Dejar constancia escrita",
      "tipo": "P",
      "legal": "Ley 31/95"
     }
    ]
   },
   {
    "r": "R38",
    "riesgo": "Violencia en el trabajo",
    "condicion": "Violencia en el trabajo (Factores interpersonales) → Relaciones personales",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "medidas": [
     {
      "t": "Informar sobre los riesgos y medidas frente al acoso sexual o por razón de sexo. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "RD 901/2020"
     },
     {
      "t": "Informar sobre el riesgo de violencia (física, psicológica y sexual) en el lugar de trabajo. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "LO 10/2022, CT ITSS 69/2009 y CT ITSS 104/2021; NTP 507, NTP 823, NTP 854, NTP 891, NTP 892"
     }
    ]
   }
  ]
 },
 {
  "nombre": "Celador/a",
  "confirmada": true,
  "funciones": "Vela por la seguridad del centro y de los usuarios, y colabora en el apoyo a terapeutas, talleres y restauración.",
  "tareas": [
   "Contener e inmovilizar a los usuarios cuando sea necesario y supervisar a los que tienen riesgo de huida.",
   "Controlar que no se introduzcan elementos o sustancias peligrosas y supervisar el control de tóxicos.",
   "Apoyar a los terapeutas, los talleres y la restauración.",
   "Trasladar mobiliario y cargar y descargar mercancías."
  ],
  "contacto": "Contacto directo con usuarios; expuesto a agentes biológicos y posibles agresiones.",
  "nota": "",
  "epi": "",
  "actividades": [
   "A01",
   "A02",
   "A06",
   "A08",
   "A09",
   "A10",
   "A20",
   "A27",
   "A28",
   "A31",
   "A32",
   "A33",
   "A35",
   "A36"
  ],
  "ajustes": [],
  "propios": []
 },
 {
  "nombre": "Monitor/a",
  "confirmada": true,
  "funciones": "Supervisa y acompaña a los usuarios en su día a día y actúa ante las situaciones de crisis.",
  "tareas": [
   "Supervisar, controlar y acompañar a los pacientes en las tareas diarias y aplicar la normativa de funcionamiento.",
   "Prevenir e intervenir en situaciones de crisis.",
   "Participar en el plan de tratamiento individual y dar soporte en la medicación.",
   "Seguir el funcionamiento del menor y registrarlo en el curso clínico.",
   "Acompañar a los menores en actividades individuales fuera del grupo terapéutico."
  ],
  "contacto": "Contacto estrecho con usuarios; riesgo de violencia física y verbal por usuarios con problemas de conducta.",
  "nota": "",
  "epi": "",
  "actividades": [
   "A01",
   "A02",
   "A06",
   "A08",
   "A09",
   "A10",
   "A18",
   "A20",
   "A27",
   "A29",
   "A30",
   "A31",
   "A32",
   "A33",
   "A35",
   "A36",
   "A37"
  ],
  "ajustes": [],
  "propios": []
 },
 {
  "nombre": "Limpieza",
  "confirmada": true,
  "funciones": "Mantiene el centro en condiciones higiénicas adecuadas.",
  "tareas": [
   "Limpiar con utensilios apropiados (fregona, escoba y similares) y con productos químicos de limpieza de tipo doméstico.",
   "Usar escalera manual en tareas a menos de 2 metros de altura.",
   "Realizar tareas que conllevan esfuerzos por manipulación de cargas, posturas forzadas y movimientos repetitivos."
  ],
  "contacto": "Sin contacto asistencial; posible contacto con fluidos al limpiar baños.",
  "nota": "",
  "epi": "",
  "actividades": [
   "A02",
   "A06",
   "A08",
   "A12",
   "A20",
   "A27",
   "A29",
   "A30",
   "A31",
   "A32",
   "A33",
   "A34",
   "A35",
   "A36"
  ],
  "ajustes": [],
  "propios": []
 },
 {
  "nombre": "Personal de lavandería",
  "confirmada": true,
  "funciones": "Lava, seca y plancha la ropa de los residentes, la ropa de cama y la de aseo.",
  "tareas": [
   "Recepcionar la ropa retirada de las habitaciones y cargarla en la lavadora y la secadora.",
   "Ordenar la ropa y colocarla en estanterías; planchar con plancha manual la que lo requiera.",
   "Cambiar el envase de detergente y suavizante de la lavadora, que se suministra de forma automática."
  ],
  "contacto": "Maneja ropa de residentes, potencialmente contaminada. No sale del centro.",
  "nota": "",
  "epi": "",
  "actividades": [
   "A06",
   "A08",
   "A09",
   "A13",
   "A20",
   "A24",
   "A27",
   "A28",
   "A30",
   "A31",
   "A32",
   "A33",
   "A35",
   "A36"
  ],
  "ajustes": [],
  "propios": []
 },
 {
  "nombre": "Cocinero/a",
  "confirmada": true,
  "funciones": "Elabora los platos y menús del centro y mantiene la cocina y sus equipos limpios y en orden.",
  "tareas": [
   "Elaborar los platos y menús, manipulando alimentos crudos y congelados.",
   "Trabajar en un ambiente con calor, junto a planchas, fogones y hornos, y manipular recipientes y bandejas calientes.",
   "Usar cuchillos y útiles cortantes, vajilla, cristalería y latas de conserva.",
   "Usar los equipos de cocina: nevera, batidora, cafetera, cortador de vegetales, fogones, horno, lavavajillas, plancha y tostadora.",
   "Limpiar la vajilla, la cristalería y la cubertería tras el servicio, y las máquinas y útiles de la cocina y el comedor, con productos químicos (Suma Inox D7.1 y Suma Ultra L2).",
   "Colocar material en estanterías y armarios; realizar tareas con esfuerzos por cargas, posturas forzadas y movimientos repetitivos."
  ],
  "contacto": "Sin contacto asistencial.",
  "nota": "",
  "epi": "Disponibles: guantes de malla metálica y protectores de brazos (UNE-EN 1082-1), guantes de protección contra microorganismos (UNE-EN 374-5) y calzado antideslizante (UNE-EN ISO 20347). A proporcionar: guantes de protección frente al riesgo químico (UNE-EN 374-1) y pantalla facial (UNE-EN 166).",
  "actividades": [
   "A02",
   "A14",
   "A15",
   "A16",
   "A17",
   "A20",
   "A24",
   "A27",
   "A33",
   "A35",
   "A36"
  ],
  "ajustes": [
   {
    "actividad": "Tránsito por el centro (escaleras, accesos y zonas de paso)",
    "actividad_id": "A33",
    "r": "R02",
    "condicion": "Cables, mangueras, conductores, herramientas y otros objetos en zonas de paso",
    "P": "B",
    "C": "LD",
    "VR": "T",
    "base": "M·LD=TO"
   },
   {
    "actividad": "Manipulación manual de cargas y uso de carros",
    "actividad_id": "A27",
    "r": "R04",
    "condicion": "Manipulación manual de cargas",
    "P": "M",
    "C": "D",
    "VR": "MO",
    "base": "B·D=TO"
   }
  ],
  "propios": [
   {
    "r": "R30",
    "riesgo": "Carga Física",
    "condicion": "Carga física (manipulación manual de cargas, posturas forzadas y movimientos repetitivos)",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "medidas": [
     {
      "t": "Información sobre los riesgos y medidas preventivas derivados de trabajos con exposición a movimientos repetitivos en el puesto de cocinero/a. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "Ley 31/1995"
     },
     {
      "t": "Información sobre los riesgos y medidas preventivas frente a los trastornos musculoesqueléticos. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "Ley 31/1995"
     }
    ]
   },
   {
    "r": "R36",
    "riesgo": "Estrés laboral",
    "condicion": "Factores organizacionales: Carga y ritmo de trabajo",
    "P": "M",
    "C": "D",
    "VR": "MO",
    "medidas": [
     {
      "t": "Información sobre el riesgo de estrés laboral vinculado a la fatiga mental. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "CT ITSS 104/2021; NTP 534, NTP 544, NTP 575, NTP 659"
     }
    ]
   },
   {
    "r": "R37",
    "riesgo": "Fatiga derivada de la ordenación del tiempo de trabajo",
    "condicion": "Factores organizacionales: Carga y ritmo de trabajo",
    "P": "M",
    "C": "D",
    "VR": "MO",
    "medidas": [
     {
      "t": "Información sobre el riesgo de fatiga mental en el trabajo. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "CT ITSS 104/2021; NTP 534, NTP 544, NTP 575, NTP 659"
     }
    ]
   },
   {
    "r": "R38",
    "riesgo": "Violencia en el trabajo",
    "condicion": "Factores interpersonales: Relaciones personales",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "medidas": [
     {
      "t": "Información sobre los riesgos de violencia (física, psicológica y sexual) y medidas preventivas. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "LO 10/2022, RD 901/2020, CT ITSS 69/2009 y CT ITSS 104/2021"
     }
    ]
   },
   {
    "r": "R38",
    "riesgo": "Violencia en el trabajo",
    "condicion": "Factores organizacionales: Violencia generada por terceras personas",
    "P": "M",
    "C": "D",
    "VR": "MO",
    "medidas": [
     {
      "t": "Información a las personas trabajadoras sobre el protocolo de actuación ante agresiones implantado en la empresa.",
      "tipo": "P",
      "legal": "LO 10/2022, RD 901/2020, CT ITSS 69/2009 y CT ITSS 104/2021"
     }
    ]
   }
  ]
 },
 {
  "nombre": "Auxiliar de cocina",
  "confirmada": true,
  "funciones": "Apoya al cocinero/a en la preparación y el servicio de las comidas y en la limpieza de la cocina.",
  "tareas": [
   "Preparar los alimentos: lavar, pelar y cortar.",
   "Montar y repartir bandejas y carros y servir en el comedor.",
   "Fregar la vajilla y los utensilios, usar el lavavajillas y limpiar la cocina y el office.",
   "Retirar los residuos y reponer el material."
  ],
  "contacto": "Sin contacto asistencial, salvo el servicio en el comedor.",
  "nota": "No tiene documento propio: se evalúa mezclando las actividades de cocinero/a y de limpieza.",
  "epi": "Disponibles: guantes de malla metálica y protectores de brazos (UNE-EN 1082-1), guantes de protección contra microorganismos (UNE-EN 374-5) y calzado antideslizante (UNE-EN ISO 20347). A proporcionar: guantes de protección frente al riesgo químico (UNE-EN 374-1) y pantalla facial (UNE-EN 166).",
  "actividades": [
   "A02",
   "A06",
   "A08",
   "A12",
   "A14",
   "A15",
   "A16",
   "A17",
   "A20",
   "A24",
   "A27",
   "A29",
   "A30",
   "A31",
   "A32",
   "A33",
   "A34",
   "A35",
   "A36"
  ],
  "ajustes": [
   {
    "actividad": "Tránsito por el centro (escaleras, accesos y zonas de paso)",
    "actividad_id": "A33",
    "r": "R02",
    "condicion": "Cables, mangueras, conductores, herramientas y otros objetos en zonas de paso",
    "P": "B",
    "C": "LD",
    "VR": "T",
    "base": "M·LD=TO"
   },
   {
    "actividad": "Manipulación manual de cargas y uso de carros",
    "actividad_id": "A27",
    "r": "R04",
    "condicion": "Manipulación manual de cargas",
    "P": "M",
    "C": "D",
    "VR": "MO",
    "base": "B·D=TO"
   }
  ],
  "propios": [
   {
    "r": "R30",
    "riesgo": "Carga Física",
    "condicion": "Carga física (manipulación manual de cargas, posturas forzadas y movimientos repetitivos)",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "medidas": [
     {
      "t": "Información sobre los riesgos y medidas preventivas derivados de trabajos con exposición a movimientos repetitivos en el puesto de cocinero/a. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "Ley 31/1995"
     },
     {
      "t": "Información sobre los riesgos y medidas preventivas frente a los trastornos musculoesqueléticos. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "Ley 31/1995"
     }
    ]
   },
   {
    "r": "R36",
    "riesgo": "Estrés laboral",
    "condicion": "Factores organizacionales: Carga y ritmo de trabajo",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "medidas": [
     {
      "t": "Información sobre el riesgo de estrés laboral vinculado a la fatiga mental. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "CT ITSS 104/2021; NTP 534, NTP 544, NTP 575, NTP 659"
     }
    ]
   },
   {
    "r": "R37",
    "riesgo": "Fatiga derivada de la ordenación del tiempo de trabajo",
    "condicion": "Factores organizacionales: Carga y ritmo de trabajo",
    "P": "M",
    "C": "D",
    "VR": "MO",
    "medidas": [
     {
      "t": "Información sobre el riesgo de fatiga mental en el trabajo. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "CT ITSS 104/2021; NTP 534, NTP 544, NTP 575, NTP 659"
     }
    ]
   },
   {
    "r": "R38",
    "riesgo": "Violencia en el trabajo",
    "condicion": "Factores interpersonales: Relaciones personales",
    "P": "B",
    "C": "D",
    "VR": "TO",
    "medidas": [
     {
      "t": "Información sobre los riesgos de violencia (física, psicológica y sexual) y medidas preventivas. Dejar constancia documental de su entrega.",
      "tipo": "P",
      "legal": "LO 10/2022, RD 901/2020, CT ITSS 69/2009 y CT ITSS 104/2021"
     }
    ]
   },
   {
    "r": "R38",
    "riesgo": "Violencia en el trabajo",
    "condicion": "Factores organizacionales: Violencia generada por terceras personas",
    "P": "M",
    "C": "D",
    "VR": "MO",
    "medidas": [
     {
      "t": "Información a las personas trabajadoras sobre el protocolo de actuación ante agresiones implantado en la empresa.",
      "tipo": "P",
      "legal": "LO 10/2022, RD 901/2020, CT ITSS 69/2009 y CT ITSS 104/2021"
     }
    ]
   }
  ]
 },
 {
  "nombre": "Mantenimiento",
  "confirmada": true,
  "funciones": "Realiza el mantenimiento preventivo y correctivo de las instalaciones del centro.",
  "tareas": [
   "Fontanería (grifos, cisternas, goteos), electricidad (enchufes, luminarias, cuadros), albañilería y pintura, y carpintería.",
   "Interpretar croquis y planos de detalles constructivos e instalaciones.",
   "Usar herramientas manuales y eléctricas, compresor portátil, pistola de pintura, soldadura, radiales y herramientas de corte.",
   "Manipular productos químicos, trabajar en altura con escaleras manuales y, en su caso, realizar trabajos en tensión."
  ],
  "contacto": "Sin contacto asistencial.",
  "nota": "No realiza trabajos en espacios confinados, en plataformas elevadoras, en cubierta ni en fachadas.",
  "epi": "",
  "actividades": [
   "A06",
   "A18",
   "A19",
   "A20",
   "A21",
   "A22",
   "A23",
   "A24",
   "A25",
   "A26",
   "A27",
   "A29",
   "A31",
   "A32",
   "A33",
   "A34",
   "A35",
   "A36"
  ],
  "ajustes": [],
  "propios": []
 },
 {
  "nombre": "Personal de administración",
  "confirmada": true,
  "funciones": "Realiza tareas administrativas diversas.",
  "tareas": [
   "Trabajar con ordenadores, impresoras, teléfonos y otros equipos de oficina.",
   "Pasar la mayor parte de la jornada sentado."
  ],
  "contacto": "Sin contacto asistencial.",
  "nota": "No realiza el mantenimiento de los equipos de trabajo: lo hace el servicio técnico correspondiente.",
  "epi": "",
  "actividades": [
   "A04",
   "A05",
   "A06",
   "A20",
   "A27",
   "A28",
   "A29",
   "A31",
   "A32",
   "A33",
   "A35",
   "A36",
   "A37"
  ],
  "ajustes": [],
  "propios": []
 },
 {
  "nombre": "Recepcionista",
  "confirmada": true,
  "funciones": "Atiende directamente a los pacientes, les informa y asesora, y coordina a los terapeutas con administración.",
  "tareas": [
   "Planificar los horarios y enviarlos a las agendas; atender los cambios e incidencias de agenda de los pacientes y generar el patrón de agenda.",
   "Generar presupuestos tras la primera visita y derivar al centro de contacto a quienes piden información inicial.",
   "Enviar las incidencias de facturas y el listado semanal de renovaciones a atención al paciente.",
   "Gestionar los pedidos de material de oficina y papelería.",
   "Asesorar sobre la movilidad hasta la clínica, incluida la contratación de ambulancia."
  ],
  "contacto": "Atención directa a pacientes y familias.",
  "nota": "",
  "epi": "",
  "actividades": [
   "A01",
   "A04",
   "A05",
   "A06",
   "A09",
   "A20",
   "A27",
   "A28",
   "A29",
   "A31",
   "A32",
   "A33",
   "A35",
   "A36",
   "A37"
  ],
  "ajustes": [],
  "propios": []
 },
 {
  "nombre": "Coordinador/a",
  "confirmada": true,
  "funciones": "Coordina las acciones del equipo y es el enlace del centro con las familias de los usuarios y con la Conselleria.",
  "tareas": [
   "Preparar las reuniones semanales entre terapeutas y la coordinadora de auxiliares de enfermería; designar y seguir las tareas de cada terapeuta.",
   "Gestionar las altas, bajas, incidencias y cambios de los usuarios, sus expedientes y los programas de atención individualizados.",
   "Velar por los requisitos de la Conselleria: calidad de proveedores, plagas, extintores, mantenimiento de instalaciones, ratios y horarios.",
   "Supervisar las compras mensuales y la documentación del centro; elaborar la memoria técnica y económica semestral.",
   "Gestionar las rutas de autobús, los permisos y vacaciones, el kilometraje y el calendario anual; participar en la selección de personal.",
   "Resolver conflictos y dudas con las familias y reunirse con asociaciones externas."
  ],
  "contacto": "Contacto estrecho con usuarios adultos con problemas de conducta: riesgo de violencia física y verbal, y riesgo biológico.",
  "nota": "",
  "epi": "",
  "actividades": [
   "A03",
   "A04",
   "A05",
   "A06",
   "A08",
   "A09",
   "A20",
   "A27",
   "A28",
   "A29",
   "A31",
   "A32",
   "A33",
   "A35",
   "A36",
   "A37"
  ],
  "ajustes": [],
  "propios": []
 },
 {
  "nombre": "Director/a",
  "confirmada": true,
  "funciones": "Organiza y gestiona de forma integral los recursos del centro para cumplir los objetivos de la empresa y ofrecer un servicio de calidad.",
  "tareas": [
   "Hacer reuniones de equipo, supervisar el trabajo de los terapeutas y detectar necesidades formativas.",
   "Realizar primeras visitas, seguimientos de tratamientos y revisión de casos; elaborar informes y contactar con prescriptores médicos.",
   "Supervisar el cumplimiento de objetivos e indicadores y gestionar la documentación para inspecciones.",
   "Coordinarse con los departamentos de estructura: selección de personal, permisos y vacaciones, facturación y trabajo social.",
   "Captar pacientes y buscar nuevas líneas de negocio; registrar y resolver no conformidades; autorizar pedidos de material."
  ],
  "contacto": "Contacto con usuarios: riesgo biológico.",
  "nota": "",
  "epi": "",
  "actividades": [
   "A03",
   "A04",
   "A05",
   "A06",
   "A08",
   "A09",
   "A20",
   "A27",
   "A28",
   "A29",
   "A31",
   "A32",
   "A33",
   "A35",
   "A36",
   "A37"
  ],
  "ajustes": [],
  "propios": []
 }
];

export const ACTIVIDADES_EVALUADAS = [{"id":"A01","nombre":"Nocturnidad","categoria":"Organización del trabajo y horario","estado":"documento","tareas":"Trabajo realizado entre las 22:00 y las 6:00 horas, o con al menos tres horas de la jornada diaria, o una tercera parte de la jornada, en ese horario.","epi":"","nota":"","puestos":["Médico/a","Auxiliar de Enfermería","Celador/a","Monitor/a","Recepcionista"],"condiciones":[{"r":"R37","riesgo":"Fatiga derivada de la ordenación del tiempo de trabajo","condicion":"Factores organizacionales: Trabajo a turnos y/o nocturnos","P":"M","C":"D","VR":"MO","medidas":[{"t":"Procurar menor carga de trabajo en el turno de noche siempre que sea posible.","tipo":"C","legal":"Ley 31/1995, CT ITSS 104/2021"},{"t":"Información sobre los riesgos y medidas preventivas derivados de la organización de los horarios de trabajo (turnicidad y/o nocturnidad).","tipo":"P","legal":"CT ITSS 104/2021; Guía INSHT (Manual para la evaluación y prevención de riesgos ergonómicos y psicosociales en la PYME)"},{"t":"Formación a las personas trabajadoras sobre los riesgos derivados del trabajo a turnos y/o nocturno.","tipo":"P","legal":"Ley 31/1995, CT ITSS 104/2021"}]}]},{"id":"A02","nombre":"Turnicidad","categoria":"Organización del trabajo y horario","estado":"documento","tareas":"Ordenación del trabajo en la que varios grupos de personas se relevan para cubrir entre 16 y 24 horas diarias. Puede ser discontinuo (mañana y tarde), semicontinuo (mañana, tarde y noche con descanso el domingo) o continuo (todos los días de la semana).","epi":"","nota":"","puestos":["Médico/a","Enfermero/a","TASOC / Animador/a sociocultural","Auxiliar de Enfermería","Gerocultor/a","Celador/a","Monitor/a","Limpieza","Cocinero/a","Auxiliar de cocina"],"condiciones":[{"r":"R37","riesgo":"Fatiga derivada de la ordenación del tiempo de trabajo","condicion":"Factores organizacionales: Trabajo a turnos y/o nocturnos","P":"M","C":"D","VR":"MO","medidas":[{"t":"Información sobre los riesgos y medidas preventivas derivados de la organización de los horarios de trabajo (turnicidad y/o nocturnidad).","tipo":"P","legal":"CT ITSS 104/2021; Guía INSHT (Manual para la evaluación y prevención de riesgos ergonómicos y psicosociales en la PYME)"},{"t":"Formación a las personas trabajadoras sobre los riesgos derivados del trabajo a turnos y/o nocturno.","tipo":"P","legal":"Ley 31/1995, CT ITSS 104/2021"}]}]},{"id":"A03","nombre":"Demandas psicológicas y contenido del trabajo","categoria":"Organización del trabajo y horario","estado":"matriz","tareas":"Tareas con demandas psicológicas elevadas, situaciones complejas o toma de decisiones complejas.","epi":"","nota":"","puestos":["Médico/a","Psiquiatra","Psicólogo/a","Terapeuta ocupacional","Trabajador/a social","Educador/a social","Auxiliar de Enfermería","Coordinador/a","Director/a"],"condiciones":[{"r":"R37","riesgo":"Fatiga derivada de la ordenación del tiempo de trabajo","condicion":"Demandas psicológicas","P":"M","C":"D","VR":"MO","medidas":[{"t":"Establecer reuniones periódicas para la toma de decisiones complejas.","id":"R37-M03","u":7},{"t":"Establecer protocolos de actuación en situaciones de difícil manejo o difícil toma de decisiones e informar a los trabajadores.","id":"R37-M02","u":6},{"t":"Se recomienda establecer protocolos de actuación en situaciones de difícil manejo o difícil toma de decisiones. Se informará a los trabajadores de dichos protocolos, dejando constancia documental.","id":"R37-M07","u":2}],"np":7},{"r":"R37","riesgo":"Fatiga derivada de la ordenación del tiempo de trabajo","condicion":"Contenido de trabajo","P":"M","C":"D","VR":"MO","medidas":[{"t":"Informar sobre el riesgo de fatiga mental en el trabajo.","id":"R37-M01","u":4}],"np":4}]},{"id":"A04","nombre":"Trabajos de personal de oficina","categoria":"Oficina y pantallas","estado":"documento","tareas":"Trabajo administrativo y de despacho: gestión de documentación, atención telefónica y a personas, y uso del material de oficina.","epi":"","nota":"Descripción de tareas reescrita.","puestos":["Médico/a","Psiquiatra","Enfermero/a","Psicólogo/a","Terapeuta ocupacional","Trabajador/a social","Educador/a social","Auxiliar de Enfermería","Personal de administración","Recepcionista","Coordinador/a","Director/a"],"condiciones":[{"r":"R02","riesgo":"Caídas de personas en el mismo nivel","condicion":"Zonas de paso","P":"M","C":"LD","VR":"TO","medidas":[{"t":"Información sobre la necesidad de evitar distribuir mangueras, cables o alargaderas y equipos de trabajo ocupando zonas de paso. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"}]},{"r":"R03","riesgo":"Caídas de objetos por desplome o derrumbamiento","condicion":"Almacenamiento en estanterías o armarios","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información sobre los riesgos y medidas preventivas a adoptar en el almacenamiento de material en estanterías y armarios. Dejar constancia documental de su entrega.","tipo":"P","legal":"RD 486/1997"}]},{"r":"R04","riesgo":"Caídas de objetos en manipulación","condicion":"Materiales oficina","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información sobre manejo manual de cargas por manipulación. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995, RD 487/1997"}]},{"r":"R07","riesgo":"Golpes contra objetos inmóviles","condicion":"Espacio insuficiente al acceder o transitar","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información al personal del puesto de trabajo que deberá tener una dimensión suficiente y estar acondicionado de tal manera que haya espacio suficiente para permitir los cambios de postura y movimientos de trabajo que garantice la seguridad. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995, RD 488/1997"},{"t":"Mantener 2 m2 libres por persona trabajadora y 80 cm de acceso a puesto.","tipo":"P","legal":"RD 486/1997"}]},{"r":"R09","riesgo":"Golpes o cortes por objetos o herramientas","condicion":"Herramientas manuales o útiles","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información sobre los riesgos y medidas preventivas a adoptar en el uso de material de oficina. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"}]},{"r":"R30","riesgo":"Carga Física","condicion":"Manipulación manual de cargas de más de 3 KG. > Alguna manipulación muy puntual material oficina, portátiles, otros.","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información sobre el riesgo y medidas preventivas en tareas de manipulación manual de cargas. Dejar constancia documental de su entrega.","tipo":"P","legal":"RD 487/1997"},{"t":"Formación sobre el riesgo y medidas preventivas en tareas de manipulación manual de cargas.","tipo":"P","legal":"RD 487/1997"}]},{"r":"R30","riesgo":"Carga Física","condicion":"Exposición a posturas estáticas de pie o sentado durante 1 hora o más por jornada","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información sobre los riesgos y medidas preventivas derivados de la postura mantenida en posición sentado. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"},{"t":"Formación sobre ejercicios posturales de espalda, posición de trabajo sentado y de pie.","tipo":"P","legal":"Ley 31/1995"}]},{"r":"R30","riesgo":"Carga Física","condicion":"Exposición significativa a posturas forzadas (más de 1 h acumulada por jornada) de algún segmento corporal","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información sobre los riesgos y medidas preventivas derivados de trabajos con exposición a posturas forzadas. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"},{"t":"Formación sobre los riesgos y medidas preventivas derivados de trabajos con exposición a posturas forzadas.","tipo":"P","legal":"Ley 31/1995"}]},{"r":"R34","riesgo":"Disconfort ambiental","condicion":"Condiciones acústicas","P":"M","C":"LD","VR":"TO","medidas":[{"t":"Información sobre los riesgos y medidas preventivas a adoptar en caso de disconfort acústico. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995, NTP 503"}]},{"r":"R36","riesgo":"Estrés laboral","condicion":"Factores organizacionales: Carga y ritmo de trabajo","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información sobre el riesgo de estrés laboral vinculado a la fatiga mental. Dejar constancia documental de su entrega.","tipo":"P","legal":"CT ITSS 104/2021; NTP 534, NTP 544, NTP 575, NTP 659"},{"t":"Formación a las personas trabajadoras sobre el riesgo de estrés laboral vinculado a la fatiga mental.","tipo":"P","legal":"Ley 31/1995, CT ITSS 104/2021"},{"t":"Establecer canales de comunicación vertical y horizontal para detectar posibles problemas y para facilitar la adecuación de la carga de trabajo al tiempo asignado a su realización, por ejemplo, reuniones periódicas, buzón de sugerencias, comunicaciones en intranet, órganos de representación, encuestas, etc.","tipo":"P","legal":"Ley 31/1995, CT ITSS 104/2021"},{"t":"Información sobre el riesgo de fatiga mental en el trabajo. Dejar constancia documental de su entrega.","tipo":"P","legal":"CT ITSS 104/2021; NTP 534, NTP 544, NTP 575, NTP 659"}]},{"r":"R36","riesgo":"Estrés laboral","condicion":"Tecnoestrés (Uso de TIC, equipos en remoto, desconexión digital, etc.)","P":"M","C":"D","VR":"MO","medidas":[{"t":"Elaborar e implantar un Protocolo de desconexión digital, que establezca la política interna de desconexión digital a la que se refiere el artículo 88.3 de la LOPDGDD para garantizar los tiempos de descanso entre jornadas laborales.","tipo":"C","legal":"LO 03/2018; Ley 10/2021; Ley 31/1995"},{"t":"Información sobre el derecho a la desconexión digital.","tipo":"P","legal":"LO 03/2018, Ley 10/2021, Ley 31/1995, NTP 1122"},{"t":"Formación a las personas trabajadoras sobre el Derecho a la desconexión Digital para dar respuesta a las acciones de formación y de sensibilización sobre esta materia a las que se refiere la LOPDGDD.","tipo":"P","legal":"LO 03/2018, Ley 10/2021, Ley 31/1995, NTP 1122"}]},{"r":"R36","riesgo":"Estrés laboral","condicion":"Evaluación psicosocial","P":"M","C":"D","VR":"MO","medidas":[{"t":"Realizar evaluación específica de los Riesgos Psicosociales (Nivel Avanzado) y/o realizar intervenciones psicosociales a medida de los riesgos detectados.","tipo":"C","legal":"Ley 31/1995, CT ITSS 104/2021"}]},{"r":"R37","riesgo":"Fatiga derivada de la ordenación del tiempo de trabajo","condicion":"Factores organizacionales: Carga y ritmo de trabajo","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información sobre el riesgo de estrés laboral vinculado a la fatiga mental. Dejar constancia documental de su entrega.","tipo":"P","legal":"CT ITSS 104/2021; NTP 534, NTP 544, NTP 575, NTP 659"},{"t":"Formación a las personas trabajadoras sobre el riesgo de estrés laboral vinculado a la fatiga mental.","tipo":"P","legal":"Ley 31/1995, CT ITSS 104/2021"},{"t":"Establecer canales de comunicación vertical y horizontal para detectar posibles problemas y para facilitar la adecuación de la carga de trabajo al tiempo asignado a su realización, por ejemplo, reuniones periódicas, buzón de sugerencias, comunicaciones en intranet, órganos de representación, encuestas, etc.","tipo":"P","legal":"Ley 31/1995, CT ITSS 104/2021"},{"t":"Información sobre el riesgo de fatiga mental en el trabajo. Dejar constancia documental de su entrega.","tipo":"P","legal":"CT ITSS 104/2021; NTP 534, NTP 544, NTP 575, NTP 659"}]},{"r":"R38","riesgo":"Violencia en el trabajo","condicion":"Factores interpersonales: Relaciones personales","P":"M","C":"D","VR":"MO","medidas":[{"t":"Información sobre el riesgo de violencia (física, psicológica y sexual) en el lugar de trabajo. Dejar constancia documental de su entrega.","tipo":"P","legal":"LO 10/2022, RD 901/2020, CT ITSS 69/2009, CT ITSS 104/2021, NTP 507, NTP 823, NTP 854, NTP 891, NTP 892"},{"t":"Formación y concienciación sobre los riesgos específicos de su puesto de trabajo asociados a la violencia laboral (acoso psicológico, sexual, por razón de sexo, discriminativo, violencias sexuales, etc.), así como de las medidas de protección y prevención aplicables.","tipo":"P","legal":"LO 10/2022, RD 901/2020, CT ITSS 69/2009 y CT ITSS 104/2021"}]},{"r":"R38","riesgo":"Violencia en el trabajo","condicion":"Factores organizacionales: Violencia generada por terceras personas","P":"M","C":"D","VR":"MO","medidas":[{"t":"Información sobre los riesgos y medidas preventivas derivados de trabajos de atención al público. Dejar constancia documental de su entrega.","tipo":"P","legal":"LO 10/2022, RD 901/2020, CT ITSS 69/2009 y CT ITSS 104/2021"}]}]},{"id":"A05","nombre":"Uso de equipos ofimáticos","categoria":"Oficina y pantallas","estado":"documento","tareas":"Uso de equipos de oficina (fotocopiadora, destructora de papel, cúter, grapadora, tijeras y quitagrapas) y de pantallas de visualización de datos, con su teclado, ratón, silla y mesa, durante una parte relevante de la jornada: hasta unas 8 horas en los puestos de oficina (Real Decreto 488/1997).","epi":"","nota":"Descripción de tareas reescrita.","puestos":["Médico/a","Psiquiatra","Enfermero/a","Psicólogo/a","Farmacéutico/a","Fisioterapeuta","Terapeuta ocupacional","Trabajador/a social","Educador/a social","TASOC / Animador/a sociocultural","Profesor/a","Auxiliar de Enfermería","Personal de administración","Recepcionista","Coordinador/a","Director/a"],"condiciones":[{"r":"R09","riesgo":"Golpes o cortes por objetos o herramientas","condicion":"Utilización de equipos de oficina","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información en el uso de equipos ofimáticos y material de oficina.","tipo":"P","legal":"RD 1215/1997"},{"t":"Formación en el uso de equipos ofimáticos y material de oficina.","tipo":"P","legal":"RD 1215/1997"}]},{"r":"R11","riesgo":"Atrapamientos por o entre objetos","condicion":"Uso de destructora de papel","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información sobre los riesgos y medidas preventivas a adoptar en el uso de la destructora de papel. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"}]},{"r":"R14","riesgo":"Contactos eléctricos","condicion":"Uso de equipos y herramientas eléctricas > Uso de equipos ofimáticos","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información sobre la forma de comunicar cualquier anomalía que sea detectada en la instalación eléctrica y equipos eléctricos, así como la prohibición de realizar cualquier tipo de manipulación en las instalaciones y equipos eléctricos a no ser que estén expresamente autorizados por la empresa. Dejar constancia documental de su entrega.","tipo":"P","legal":"RD 614/2001, RD 1215/1997"}]},{"r":"R31","riesgo":"Fatiga por uso de PVD","condicion":"Fatiga física por las condiciones de la pantalla > Pantalla no regulable","P":"M","C":"D","VR":"MO","medidas":[{"t":"Dotar de pantallas orientables a voluntad.","tipo":"C","legal":"RD 488/1997"}]},{"r":"R31","riesgo":"Fatiga por uso de PVD","condicion":"Fatiga física por las condiciones del teclado/ratón","P":"M","C":"D","VR":"MO","medidas":[{"t":"El personal dispone de un teclado independiente de la pantalla permitiéndole que adopte una postura cómoda que no provoque cansancio en los brazos o manos.","tipo":"P","legal":"RD 488/1997"},{"t":"El personal dispone de teclados con símbolos de las teclas que resalten suficientemente y sean legibles desde la posición normal de trabajo.","tipo":"P","legal":"RD 488/1997"},{"t":"El personal dispone de teclados con superficie mate para evitar los reflejos.","tipo":"P","legal":"RD 488/1997"},{"t":"El personal dispone de un ratón que se adapte a la curvatura de la mano, permitiéndole un accionamiento cómodo.","tipo":"P","legal":"RD 488/1997"},{"t":"El personal dispone de un mínimo de 10 cm delante del teclado para apoyar los antebrazos y las manos.","tipo":"P","legal":"RD 488/1997"}]},{"r":"R31","riesgo":"Fatiga por uso de PVD","condicion":"Fatiga física por las condiciones del espacio de trabajo","P":"M","C":"D","VR":"MO","medidas":[{"t":"El puesto de trabajo dispone de espacio suficiente para permitir el acceso, así como para que pueda tomar asiento y levantarse con facilidad.","tipo":"P","legal":"RD 488/1997"}]},{"r":"R31","riesgo":"Fatiga por uso de PVD","condicion":"Fatiga física por las condiciones de la silla","P":"M","C":"D","VR":"MO","medidas":[{"t":"El personal dispone de asientos estables, que proporcionen libertad de movimiento, postura confortable, con altura regulable, y con respaldo reclinable y ajustable en altura.","tipo":"P","legal":"RD 488/1997"}]},{"r":"R31","riesgo":"Fatiga por uso de PVD","condicion":"Fatiga física por las condiciones de la pantalla","P":"M","C":"D","VR":"MO","medidas":[{"t":"El personal dispone de pantallas regulables en altura y orientables a voluntad.","tipo":"P","legal":"RD 488/1997"}]},{"r":"R31","riesgo":"Fatiga por uso de PVD","condicion":"Personas usuarias de PVD","P":"M","C":"D","VR":"MO","medidas":[{"t":"Información sobre los riesgos y medidas preventivas derivados del trabajo con Pantallas de Visualización de datos. Dejar constancia documental de su entrega.","tipo":"P","legal":"RD 488/1997"},{"t":"Formación sobre los riesgos y medidas preventivas derivados del trabajo con Pantallas de Visualización de datos.","tipo":"P","legal":"RD 488/1997"}]},{"r":"R31","riesgo":"Fatiga por uso de PVD","condicion":"Personas usuarias de PVD > Uso de portátil.","P":"M","C":"D","VR":"MO","medidas":[{"t":"Dotar a la persona usuaria de PVD que utilice portátil: - Teclado y ratón independientes de la pantalla, para permitir que la persona trabajadora adopte una postura cómoda que no provoque cansancio en los brazos o en las manos. Tendrá que haber espacio suficiente delante del teclado para que la persona usuaria pueda apoyar los brazos y las manos. - Pantalla independiente orientable e inclinable a voluntad, con facilidad de adaptarse a las necesidades de la persona usuaria o soporte para portátil que ofrezca las mismas posibilidades de adaptación.","tipo":"C","legal":"RD 488/1997"}]}]},{"id":"A06","nombre":"Uso de tablets y smartphones","categoria":"Oficina y pantallas","estado":"documento","tareas":"Uso de tablets y teléfonos móviles para el registro, la comunicación y la gestión diaria.","epi":"","nota":"Descripción de tareas reescrita.","puestos":["Médico/a","Psiquiatra","Enfermero/a","Psicólogo/a","Terapeuta ocupacional","Trabajador/a social","Educador/a social","TASOC / Animador/a sociocultural","Auxiliar de Enfermería","Celador/a","Monitor/a","Limpieza","Personal de lavandería","Auxiliar de cocina","Mantenimiento","Personal de administración","Recepcionista","Coordinador/a","Director/a"],"condiciones":[{"r":"R02","riesgo":"Caídas de personas en el mismo nivel","condicion":"Zonas de paso","P":"M","C":"LD","VR":"TO","medidas":[{"t":"Información sobre que no se deben utilizar dispositivos: tablet, smartphone y dispositivos PDA mientras el usuario esté desplazándose. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"}]}]},{"id":"A07","nombre":"Uso de la voz","categoria":"Oficina y pantallas","estado":"documento","tareas":"Uso continuado de la voz en conversaciones, entrevistas, sesiones y actividades de grupo.","epi":"","nota":"Descripción de tareas reescrita.","puestos":["Educador/a social","Profesor/a"],"condiciones":[{"r":"R35","riesgo":"Sobreesfuerzos vocales","condicion":"Uso de la voz","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información sobre los riesgos y medidas preventivas derivados del uso continuado de la voz. Dejar constancia documental de su entrega.","tipo":"P","legal":"RD 1299/2006"}]}]},{"id":"A08","nombre":"Atención directa a usuarios (contacto y fluidos biológicos)","categoria":"Atención a usuarios","estado":"matriz","tareas":"Contacto directo con pacientes o usuarios: higiene, cambios de ropa, curas y atención diaria, con posible contacto con fluidos.","epi":"","nota":"","puestos":["Médico/a","Psiquiatra","Enfermero/a","Psicólogo/a","Farmacéutico/a","Fisioterapeuta","Terapeuta ocupacional","Trabajador/a social","Educador/a social","TASOC / Animador/a sociocultural","Profesor/a","Auxiliar de Enfermería","Gerocultor/a","Celador/a","Monitor/a","Limpieza","Personal de lavandería","Auxiliar de cocina","Coordinador/a","Director/a"],"condiciones":[{"r":"R10","riesgo":"Proyección de fragmentos o partículas","condicion":"Proyección de fluidos corporales","P":"B","C":"D","VR":"TO","medidas":[{"t":"Velar por la utilización de gafas de protección ocular de montura integral.","id":"R10-M01","u":1},{"t":"Velar por la utilización de mascarilla filtrante contra partículas FFP cuando corresponda.","id":"R10-M02","u":1}],"np":1},{"r":"R29","riesgo":"Exposición a agentes biológicos","condicion":"Agentes biológicos grupos 2 y 3, sin intención deliberada de manipularlos","P":"M","C":"D","VR":"MO","medidas":[{"t":"Disponer de medidas específicas para evitar cortes, pinchazos, arañazos, mordeduras o picaduras.","id":"R29-M06","u":10},{"t":"Informar sobre los riesgos y medidas preventivas de la exposición a agentes biológicos.","id":"R29-M07","u":4},{"t":"Disponer de medidas específicas para evitar que los trabajadores puedan sufrir cortes, pinchazos, arañazos, mordeduras o picaduras.","id":"R29-M22","u":2},{"t":"Formar al personal sobre riesgos y medidas preventivas relacionados con la exposición a agentes biológicos.","id":"R29-M08","u":1},{"t":"Establecer un sistema de lavado, descontaminación y, cuando sea necesario, desinfección de ropa de trabajo y EPI contaminados.","id":"R29-M09","u":1},{"t":"Disponer de instrucciones para actuar en caso de accidente o incidente de riesgo biológico.","id":"R29-M27","u":1},{"t":"Disponer de instrucciones que contemplen la actuación en caso de accidente o incidente de riesgo biológico.","id":"R29-M33","u":1}],"np":11},{"r":"R29","riesgo":"Exposición a agentes biológicos","condicion":"Posible contacto con agentes biológicos / contacto con pacientes","P":"M","C":"D","VR":"MO","medidas":[{"t":"Informar sobre los riesgos y medidas preventivas durante las tareas realizadas en zonas con posible contacto con fluidos biológicos.","id":"R29-M13","u":5},{"t":"Informar sobre los riesgos y medidas preventivas de la exposición a agentes biológicos.","id":"R29-M07","u":4},{"t":"Proporcionar guantes de protección contra microorganismos y dar instrucciones para su correcta utilización. Utilizarlos cuando se manipulen fluidos biológicos.","id":"R29-M18","u":2},{"t":"Velar por la utilización correcta del EPI: guantes de protección contra microorganismos: bacterias, hongos y virus (UNE-EN ISO 374-5 e ISO 16604).","id":"R29-M24","u":2},{"t":"Informar a los trabajadores sobre los riesgos y medidas preventivas a adoptar durante las tareas realizadas en zonas con posible contacto con fluidos biológicos. Dejar constancia documental de su entrega.","id":"R29-M26","u":2},{"t":"Proporcionar mandil impermeable, instruir sobre su utilización correcta y velar por su uso.","id":"R29-M01","u":1},{"t":"Proporcionar mandil impermeable, establecer instrucciones de uso y velar por su utilización.","id":"R29-M12","u":1},{"t":"Velar por la utilización correcta de guantes de protección contra microorganismos.","id":"R29-M20","u":1},{"t":"Proporcionar guantes de protección contra microorganismos: bacterias, hongos y virus (UNE-EN ISO 374-5,2 e ISO 16604), instruir sobre su correcta utilización y velar por su utilización. Observación: cuando se vayan a manipular fluidos biológicos.","id":"R29-M25","u":1},{"t":"Proporcionar guantes de protección contra microorganismos: bacterias, hongos y virus (UNE-EN ISO 374-5,2 e ISO 16604), instruir sobre su correcta utilización y velar por su utilización cuando se manipulen fluidos biológicos.","id":"R29-M40","u":1},{"t":"Proporcionar a los trabajadores guantes de protección contra microorganismos: bacterias, hongos y virus (UNE-EN ISO 374-5,2 e ISO 16604), que deben utilizar y dar las instrucciones adecuadas para que los utilicen correctamente. Velar por su utilización. Observación: cuando se vayan a manipular fluidos biológicos.","id":"R29-M42","u":1},{"t":"Proporcionar a los trabajadores guantes de protección contra microorganismos: bacterias, hongos y virus (UNE-EN ISO 374-5,2 e ISO 16604), dar instrucciones adecuadas para su correcta utilización y velar por su utilización. Observación: cuando se vayan a manipular fluidos biológicos.","id":"R29-M43","u":1}],"np":10},{"r":"R29","riesgo":"Exposición a agentes biológicos","condicion":"Grupos 2 y 3 por diferentes vías de entrada","P":"M","C":"D","VR":"MO","medidas":[{"t":"Informar sobre los riesgos y medidas preventivas de la exposición a agentes biológicos.","id":"R29-M07","u":3},{"t":"Informar a los trabajadores sobre riesgos y medidas preventivas de la exposición a agentes biológicos. Dejar constancia documental de su entrega.","id":"R29-M23","u":2},{"t":"Velar por la utilización correcta del EPI: guantes de protección contra microorganismos: bacterias, hongos y virus (UNE-EN ISO 374-5 e ISO 16604).","id":"R29-M24","u":2},{"t":"Disponer de instrucciones que contemplen la actuación en caso de accidente o incidente de riesgo biológico.","id":"R29-M33","u":1},{"t":"Formar sobre los riesgos y medidas preventivas frente a la exposición a agentes biológicos.","id":"R29-M37","u":1}],"np":5},{"r":"R29","riesgo":"Exposición a agentes biológicos","condicion":"Contacto con pacientes/usuarios","P":"M","C":"D","VR":"MO","medidas":[{"t":"Velar por la utilización correcta de guantes de protección contra microorganismos.","id":"R29-M20","u":3},{"t":"Informar sobre los riesgos y medidas preventivas durante las tareas realizadas en zonas con posible contacto con fluidos biológicos.","id":"R29-M13","u":1},{"t":"Proporcionar guantes de protección contra microorganismos y dar instrucciones para su correcta utilización. Utilizarlos cuando se manipulen fluidos biológicos.","id":"R29-M18","u":1},{"t":"Proporcionar guantes de protección contra microorganismos cuando se manipulen fluidos biológicos, e instruir sobre su correcta utilización.","id":"R29-M39","u":1}],"np":3},{"r":"R29","riesgo":"Exposición a agentes biológicos","condicion":"Tareas en zonas con posible contacto con fluidos biológicos","P":"M","C":"D","VR":"MO","medidas":[{"t":"Informar sobre los riesgos y medidas preventivas durante las tareas realizadas en zonas con posible contacto con fluidos biológicos.","id":"R29-M13","u":4},{"t":"Realizar e implantar un protocolo de trabajo para las tareas de limpieza de pacientes y posible contacto con fluidos corporales.","id":"R29-M03","u":2},{"t":"Proporcionar pantalla facial cuando sea necesaria en tareas de higiene de usuarios.","id":"R29-M15","u":1}],"np":5},{"r":"R29","riesgo":"Exposición a agentes biológicos","condicion":"Tareas de higiene de usuarios","P":"M","C":"D","VR":"MO","medidas":[{"t":"Proporcionar pantalla facial UNE-EN ISO 16321-1 cuando sea necesaria en tareas de higiene de usuarios.","id":"R29-M04","u":1}],"np":1},{"r":"R29","riesgo":"Exposición a agentes biológicos","condicion":"Uso de EPI frente a agentes biológicos","P":"M","C":"D","VR":"MO","medidas":[{"t":"Formar sobre técnicas asépticas de colocación y retirada de los equipos de protección individual.","id":"R29-M11","u":1}],"np":1}]},{"id":"A09","nombre":"Usuarios con problemas de conducta (violencia y agresiones)","categoria":"Atención a usuarios","estado":"matriz","tareas":"Trabajo con usuarios con problemas de conducta, con riesgo de agresión física o verbal.","epi":"","nota":"","puestos":["Médico/a","Psiquiatra","Enfermero/a","Psicólogo/a","Farmacéutico/a","Fisioterapeuta","Terapeuta ocupacional","Trabajador/a social","Educador/a social","TASOC / Animador/a sociocultural","Profesor/a","Auxiliar de Enfermería","Gerocultor/a","Celador/a","Monitor/a","Personal de lavandería","Recepcionista","Coordinador/a","Director/a"],"condiciones":[{"r":"R38","riesgo":"Violencia en el trabajo","condicion":"Violencia física generada por terceras personas","P":"A","C":"D","VR":"IM","medidas":[{"t":"Informar a las personas trabajadoras sobre el protocolo de actuación ante agresiones implantado en la empresa.","id":"R38-M15","u":5},{"t":"Informar sobre el protocolo de actuación ante agresiones implantado en la empresa.","id":"R38-M03","u":4},{"t":"Informar sobre riesgos de violencia en el lugar de trabajo, incluyendo violencias psicológicas y sexuales.","id":"R38-M11","u":3},{"t":"Informar sobre riesgos y medidas ante la vulnerabilidad de la organización al acoso psicológico.","id":"R38-M12","u":3},{"t":"Elaborar e implantar un protocolo frente a agresiones externas, con sistemas de registro de incidentes y sistemas de comunicación que permitan pedir ayuda a compañeros/as y Policía.","id":"R38-M01","u":1},{"t":"Informar sobre riesgos y medidas preventivas derivados de trabajos de atención al público, incluido el riesgo de violencia sexual.","id":"R38-M13","u":1}],"np":12},{"r":"R38","riesgo":"Violencia en el trabajo","condicion":"Residentes desestabilizados","P":"A","C":"D","VR":"IM","medidas":[{"t":"Elaborar e implantar un procedimiento relativo a la contención para residentes desestabilizados.","id":"R38-M02","u":1}],"np":1},{"r":"R38","riesgo":"Violencia en el trabajo","condicion":"Violencia física, psicológica y sexual en el lugar de trabajo","P":"A","C":"D","VR":"IM","medidas":[{"t":"Informar sobre el riesgo de violencia física, psicológica y sexual en el lugar de trabajo.","id":"R38-M08","u":1}],"np":1},{"r":"R38","riesgo":"Violencia en el trabajo","condicion":"Violencia laboral","P":"A","C":"D","VR":"IM","medidas":[{"t":"Formar y concienciar sobre los riesgos específicos asociados a violencia laboral, acoso psicológico, sexual, por razón de sexo, discriminativo y violencias sexuales.","id":"R38-M04","u":1}],"np":1},{"r":"R39","riesgo":"Otros riesgos","condicion":"Violencia en el trabajo – agresiones por personas","P":"B","C":"D","VR":"TO","medidas":[{"t":"Informar a las personas trabajadoras del protocolo que contempla el modo de actuar ante agresiones externas, incluyendo las agresiones sexuales.","id":"R39-M17","u":2},{"t":"Informar sobre el protocolo de actuación ante agresiones externas, incluyendo agresiones sexuales.","id":"R39-M06","u":1}],"np":3}]},{"id":"A10","nombre":"Movilización de pacientes y residentes","categoria":"Atención a usuarios","estado":"matriz","tareas":"Movilización, transferencias y ayuda al desplazamiento de pacientes o residentes.","epi":"","nota":"","puestos":["Enfermero/a","Fisioterapeuta","Terapeuta ocupacional","Trabajador/a social","Educador/a social","TASOC / Animador/a sociocultural","Auxiliar de Enfermería","Gerocultor/a","Celador/a","Monitor/a"],"condiciones":[{"r":"R30","riesgo":"Carga física","condicion":"Manipulación de pacientes/personas con movilidad reducida","P":"M","C":"D","VR":"MO","medidas":[{"t":"Formar sobre los riesgos y medidas preventivas en tareas de manipulación de personas con movilidad reducida.","id":"R30-M05","u":6},{"t":"Informar sobre el riesgo y medidas preventivas derivados de la manipulación de personas con movilidad reducida.","id":"R30-M06","u":6},{"t":"Utilizar camas con regulación automática de altura y ruedas cuando sea técnicamente posible para facilitar las movilizaciones y reducir inclinaciones de espalda.","id":"R30-M08","u":1},{"t":"Mantener espacio suficiente entre cama y pared para permitir el acceso adecuado del personal.","id":"R30-M09","u":1},{"t":"Reciclar la formación sobre riesgos y medidas preventivas en la manipulación de personas con movilidad reducida.","id":"R30-M10","u":1},{"t":"Cumplir las instrucciones y procedimientos establecidos para la movilización de pacientes/residentes.","id":"R30-M11","u":1},{"t":"Utilizar todos los dispositivos mecánicos de ayuda disponibles, como grúas, trapecios y otros dispositivos.","id":"R30-M12","u":1},{"t":"Cuando no sea posible utilizar ayudas mecánicas, realizar una manipulación manual segura y disponer de personal suficiente.","id":"R30-M13","u":1},{"t":"Evitar flexión, torsión y giro del tronco durante las movilizaciones.","id":"R30-M14","u":1},{"t":"Evitar flexiones/extensiones de cabeza y cuello por debajo de la línea horizontal de la mirada, especialmente de forma estática.","id":"R30-M15","u":1},{"t":"Evitar elevaciones o flexiones extremas de los brazos y mantener periodos de recuperación cuando exista elevación mantenida.","id":"R30-M16","u":1},{"t":"Evitar extensión del brazo y codo hacia detrás del cuerpo y movimientos asociados de giro.","id":"R30-M17","u":1},{"t":"Evitar la elevación de los brazos por encima de los hombros.","id":"R30-M18","u":1},{"t":"Evitar giros repetidos de muñeca y movimientos de elevación con giro del antebrazo.","id":"R30-M19","u":1},{"t":"Evitar flexiones y extensiones repetitivas de muñeca y codo.","id":"R30-M20","u":1},{"t":"Antes de manipular, comprobar si existen medios mecánicos auxiliares disponibles y utilizarlos siempre que sea posible.","id":"R30-M21","u":1},{"t":"Solicitar la ayuda de uno o varios compañeros cuando sea necesaria para realizar la manipulación.","id":"R30-M22","u":1},{"t":"Flexionar las piernas manteniendo la espalda recta durante las manipulaciones.","id":"R30-M23","u":1},{"t":"Situar los pies separados y uno adelantado, orientados en la dirección del movimiento.","id":"R30-M24","u":1},{"t":"Acercar al residente al cuerpo y utilizar el propio peso para contrarrestar el peso del paciente.","id":"R30-M25","u":1},{"t":"Informar sobre los riesgos y medidas preventivas derivados de la manipulación de personas con movilidad reducida o poco colaboradoras.","id":"R30-M30","u":1},{"t":"Utilizar, cuando sea técnicamente posible, camas articuladas, sábanas deslizantes, deslizadores, equipos de manejo mecánico, sillas, grúas y otros elementos auxiliares.","id":"R30-M49","u":1},{"t":"Adoptar medidas técnicas u organizativas para evitar la movilización manual cuando sea posible.","id":"R30-M50","u":1}],"np":7},{"r":"R30","riesgo":"Carga física","condicion":"Manipulación manual de cargas → manipulación de pacientes","P":"B","C":"D","VR":"TO","medidas":[{"t":"Formar sobre los riesgos y medidas preventivas en tareas de manipulación de personas con movilidad reducida.","id":"R30-M05","u":5},{"t":"Informar sobre el riesgo y medidas preventivas derivados de la manipulación de personas con movilidad reducida.","id":"R30-M06","u":3},{"t":"Informar sobre el riesgo y medidas preventivas derivados de manipulación de personas con movilidad reducida. Dejar constancia documental de su entrega.","id":"R30-M61","u":2}],"np":5},{"r":"R30","riesgo":"Carga física","condicion":"Manipulación de residentes","P":"M","C":"D","VR":"MO","medidas":[{"t":"Evitar mantener los brazos extendidos más de 20º y evitar rotaciones o giros innecesarios de los brazos.","id":"R30-M26","u":1},{"t":"Evitar elevación de hombros y movimientos repetitivos de brazos superiores a 7 veces por minuto.","id":"R30-M27","u":1},{"t":"Evitar extensión o flexión del cuello superior a 20º y evitar giros o torsiones.","id":"R30-M28","u":1},{"t":"Evitar flexiones, giros y torsiones del tronco; realizar la manipulación con la espalda recta y flexionando las piernas cuando sea necesario.","id":"R30-M29","u":1},{"t":"Facilitar la guía informativa sobre riesgos asociados a la manipulación de residentes.","id":"R30-M31","u":1}],"np":1},{"r":"R30","riesgo":"Carga física","condicion":"Sobreesfuerzos y posturas forzadas durante la manipulación de pacientes/residentes","P":"M","C":"D","VR":"MO","medidas":[{"t":"Estudiar la sustitución progresiva de camas no regulables por camas regulables en altura, especialmente para residentes asistidos.","id":"R30-M07","u":1}],"np":1},{"r":"R30","riesgo":"Carga física","condicion":"Uso de medios mecánicos auxiliares","P":"M","C":"D","VR":"MO","medidas":[{"t":"Garantizar una dotación suficiente de medios y dispositivos mecánicos en función del número de residentes con limitaciones de movilidad.","id":"R30-M47","u":1},{"t":"Asegurar que los medios de movilización estén disponibles en todo momento para los trabajadores.","id":"R30-M48","u":1}],"np":1}]},{"id":"A11","nombre":"Instrumental cortopunzante sanitario","categoria":"Atención a usuarios","estado":"matriz","tareas":"Uso y eliminación de instrumentos sanitarios cortantes o punzantes.","epi":"","nota":"","puestos":["Enfermero/a"],"condiciones":[{"r":"R09","riesgo":"Golpes o cortes por objetos/herramientas","condicion":"Uso de instrumentos sanitarios cortopunzantes","P":"B","C":"ED","VR":"MO","medidas":[{"t":"Disponer de contenedores y envases normalizados para el desecho de material punzante o cortante biocontaminado.","id":"R09-M04","u":1},{"t":"Informar sobre los riesgos y medidas preventivas en el uso de instrumentos sanitarios cortopunzantes.","id":"R09-M05","u":1}],"np":1},{"r":"R29","riesgo":"Exposición a agentes biológicos","condicion":"Uso de instrumentos sanitarios cortopunzantes","P":"M","C":"D","VR":"MO","medidas":[{"t":"Reducir al mínimo posible el número de trabajadores que utilicen o puedan utilizar/manipular estos instrumentos.","id":"R29-M29","u":1},{"t":"Dotar de herramientas cortopunzantes sanitarias con dispositivos de bioseguridad y retirar los dispositivos convencionales.","id":"R29-M30","u":1}],"np":1}]},{"id":"A12","nombre":"Tareas básicas de limpieza","categoria":"Limpieza, lavandería y cocina","estado":"documento","tareas":"Limpieza y mantenimiento de superficies y mobiliario del local, desinfección de suelos, paredes y cristales con productos químicos, y retirada de basuras.","epi":"Mascarilla filtrante contra gases y vapores, Guantes de protección frente al riesgo químico (UNE EN 374-1), Gafas de protección ocular de montura integral (UNE-EN ISO 16321-1), Gafas de protección ocular de montura integral para gotas de líquido (UNE-EN ISO 16321-1), Calzado de protección (UNE-EN ISO 20346)","nota":"","puestos":["Auxiliar de Enfermería","Limpieza","Auxiliar de cocina"],"condiciones":[{"r":"R01","riesgo":"Caídas de personas a distinto nivel","condicion":"Trabajos de limpieza en altura > No superior a 2m de altura","P":"M","C":"D","VR":"MO","medidas":[{"t":"Dotar de útiles como alargadores de dimensiones adecuadas (mangos telescópicos) o materiales auxiliares para la limpieza de las partes altas de las ventanas, fachadas acristaladas, etc.","tipo":"C","legal":"Ley 31/1995"},{"t":"Informar de la prohibición de uso de escaleras de mano o cualquier otro elemento para la limpieza de zonas elevadas que no ofrezca las condiciones de seguridad adecuadas. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"}]},{"r":"R01","riesgo":"Caídas de personas a distinto nivel","condicion":"Uso de escalera de mano","P":"B","C":"D","VR":"TO","medidas":[{"t":"Comprobar el correcto estado de las escaleras antes de su uso: • Peldaños flojos, mal ensamblados, rotos, con grietas, o indebidamente sustituidos por barras o sujetos con alambres o cuerdas. • Mal estado de los sistemas de sujeción y apoyo. • Retirar la escalera si presenta cualquier defecto de los descritos. • Reparar la escalera por personal especializado o retirarla definitivamente.","tipo":"P","legal":"RD 2177/2004"},{"t":"Información sobre los riesgos y medidas preventivas a adoptar en el uso de pequeñas escaleras manuales.","tipo":"P","legal":"RD 2177/2004"},{"t":"Las patas de elefante disponen de elementos antideslizantes y se encuentran en buen estado. Se sustituyen o reparan en su caso.","tipo":"P","legal":"Ley 31/1995"}]},{"r":"R02","riesgo":"Caídas de personas en el mismo nivel","condicion":"Vertidos o derrames de productos","P":"M","C":"LD","VR":"TO","medidas":[{"t":"Información sobre la necesidad de señalizar la situación de suelo deslizante mientras se mantenga la situación de riesgo en caso de derrames o vertidos. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"}]},{"r":"R02","riesgo":"Caídas de personas en el mismo nivel","condicion":"Suelo húmedo o mojado","P":"M","C":"LD","VR":"TO","medidas":[{"t":"Información sobre la necesidad de mantener precaución cuando existan zonas de pavimento con resto de agua, manchas de aceite, etc., evitando pisar directamente sobre los mismos. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"}]},{"r":"R04","riesgo":"Caídas de objetos en manipulación","condicion":"Manipulación manual de cargas > Sacan la basura, movilización de materiales, etc","P":"M","C":"D","VR":"MO","medidas":[{"t":"Proporcionar a las personas trabajadoras: Calzado de protección (UNE-EN ISO 20346) Observaciones: Calzado de protección","tipo":"C","legal":"RD 773/1997"},{"t":"Dotar al personal y velar por su uso de carros auxiliares y medios mecánicos para traslado de útiles y herramientas.","tipo":"C","legal":"Ley 31/1995"},{"t":"Información sobre manejo manual de cargas por manipulación. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995, RD 487/1997"},{"t":"Los contenedores de basura disponen de ruedas para facilitar la movilización de los mismos. Estas funcionan correctamente.","tipo":"P","legal":"Ley 31/1995"}]},{"r":"R07","riesgo":"Golpes contra objetos inmóviles","condicion":"Espacio insuficiente al acceder o transitar","P":"B","C":"D","VR":"TO","medidas":[{"t":"Respetar las zonas de ubicación de equipos de trabajo y almacenamiento de materiales.","tipo":"P","legal":"RD 488/1997"}]},{"r":"R09","riesgo":"Golpes o cortes por objetos o herramientas","condicion":"Presencia de elementos cortantes o punzantes","P":"M","C":"D","VR":"MO","medidas":[{"t":"Información sobre los riesgos y medidas preventivas a adoptar durante las tareas de recogida de basuras. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"},{"t":"Información sobre los riesgos y medidas preventivas a adoptar durante las tareas de limpieza por el riesgo de golpes y cortes. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"}]},{"r":"R10","riesgo":"Proyección de fragmentos o partículas","condicion":"Proyección de líquidos por uso equipos de trasiego > Durante tareas de trasvase de producto químico, aplicación, etc","P":"B","C":"D","VR":"TO","medidas":[{"t":"Proporcionar a las personas trabajadoras: Gafas de protección ocular de montura integral (UNE-EN ISO 16321-1) Observaciones: Gafas de protección","tipo":"C","legal":"RD 773/1997"},{"t":"Evita efectuar trasvases de productos químicos. En caso de realizarlos, hazlo en lugares ventilados, lentamente y extremando las precauciones para prevenir salpicaduras. Siempre que sea posible, emplea medios auxiliares como los dosificadores.","tipo":"P","legal":"RD 656/2017"}]},{"r":"R14","riesgo":"Contactos eléctricos","condicion":"Uso de equipos y herramientas eléctricas","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información sobre los riesgos y medidas preventivas a adoptar durante las tareas de limpieza para evitar contactos eléctricos. Dejar constancia documental de su entrega.","tipo":"P","legal":"RD 614/2001"}]},{"r":"R15","riesgo":"Contactos con sustancias cáusticas o corrosivas","condicion":"Uso/almacenamiento de productos químicos corrosivos/cáusticos","P":"M","C":"D","VR":"MO","medidas":[{"t":"Se siguen las indicaciones de seguridad recogidas en la ficha de datos de seguridad.","tipo":"P","legal":"Ley 31/1995"},{"t":"Información sobre riesgos y medidas preventivas sobre uso/almacenamiento de productos químicos. Dejar constancia documental de su entrega.","tipo":"P","legal":"RD 374/2001, Ley 31/1995"}]},{"r":"R25","riesgo":"Inhalación, contacto o ingestión de sustancias nocivas","condicion":"Trasvases de productos químicos","P":"M","C":"D","VR":"MO","medidas":[{"t":"Proporcionar a las personas trabajadoras: Gafas de protección ocular de montura integral para gotas de líquido (UNE-EN ISO 16321-1) Observaciones: Gafas de protección","tipo":"C","legal":"RD 773/1997"},{"t":"Se etiquetan todos los recipientes receptores igual que los originales. Evitar, en la medida de lo posible, el trasvase de productos químicos, manteniéndolos en sus recipientes originales.","tipo":"P","legal":"RD 374/2001"},{"t":"Información sobre instrucciones de seguridad para el trasvase manual de los productos químicos.","tipo":"P","legal":"RD 374/2001"}]},{"r":"R27","riesgo":"Exposición a agentes químicos","condicion":"Por cualquier vía de entrada","P":"M","C":"D","VR":"MO","medidas":[{"t":"Proporcionar a las personas trabajadoras: Mascarilla filtrante contra gases y vapores Observaciones: Mascarilla frente a gases y vapores","tipo":"C","legal":"RD 773/1997"},{"t":"Proporcionar a las personas trabajadoras: Guantes de protección frente al riesgo químico (UNE EN 374-1) Observaciones: Guantes frente a agentes químicos","tipo":"C","legal":"RD 773/1997"},{"t":"Las fichas de datos de seguridad se encuentran visibles y legibles para todo el personal.","tipo":"P","legal":"RD 656/2017"},{"t":"Comprobar el correcto estado de las etiquetas y la actualización de las Fichas de Seguridad de los productos químicos.","tipo":"P","legal":"RD 374/2001"},{"t":"Información sobre los riesgos y medidas preventivas de exposición a agentes químicos. Dejar constancia documental de su entrega.","tipo":"P","legal":"RD 374/2001"}]},{"r":"R29","riesgo":"Exposición a agentes biológicos","condicion":"Posible exposición a agentes biológicos del Grupo 1 por diferentes vías sin intención deliberada","P":"B","C":"D","VR":"TO","medidas":[{"t":"Proporcionar a las personas trabajadoras: Guantes de protección frente al riesgo químico (UNE EN 374-1) Observaciones: Guantes de protección","tipo":"C","legal":"RD 773/1997"},{"t":"Informar al personal sobre los riesgos y medidas preventivas de limpieza","tipo":"P","legal":"Ley 31/1995"}]},{"r":"R30","riesgo":"Carga Física","condicion":"Exposición significativa a posturas forzadas (más de 1 h acumulada por jornada) de algún segmento corporal","P":"M","C":"D","VR":"MO","medidas":[{"t":"Información sobre los riesgos y medidas preventivas frente a los trastornos musculoesqueléticos. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"},{"t":"Se dispone de escaleras de mano o escabeles en los office para la limpieza de las zonas altas (cristaleras, espejos y armarios).","tipo":"P","legal":"ISO 11226, UNE 1005-4"}]}]},{"id":"A13","nombre":"Lavandería y manejo de ropa","categoria":"Limpieza, lavandería y cocina","estado":"matriz","tareas":"Lavado, secado, planchado y ordenación de la ropa de residentes y de cama, con manejo de ropa potencialmente contaminada.","epi":"","nota":"","puestos":["Auxiliar de Enfermería","Personal de lavandería"],"condiciones":[{"r":"R13","riesgo":"Contactos térmicos","condicion":"Superficies calientes durante el planchado","P":"B","C":"D","VR":"TO","medidas":[{"t":"Informar sobre la correcta realización de las labores para evitar quemaduras durante el planchado.","id":"R13-M11","u":1},{"t":"Proteger brazos y antebrazos para evitar quemaduras directas con la plancha.","id":"R13-M12","u":1},{"t":"Disponer de soporte adecuado para depositar la plancha.","id":"R13-M13","u":1}],"np":1},{"r":"R29","riesgo":"Exposición a agentes biológicos","condicion":"Manipulación de ropa potencialmente contaminada","P":"M","C":"ED","VR":"IM","medidas":[{"t":"Informar sobre los riesgos y medidas preventivas de la exposición a agentes biológicos.","id":"R29-M07","u":1},{"t":"Formar sobre los riesgos y medidas preventivas frente a la exposición a agentes biológicos.","id":"R29-M37","u":1}],"np":1},{"r":"R29","riesgo":"Exposición a agentes biológicos","condicion":"Posible contacto con agentes biológicos de grupos 2 y 3 por manipulación de ropa de la residencia","P":"M","C":"ED","VR":"IM","medidas":[{"t":"Realizar evaluación específica de exposición a agentes biológicos.","id":"R29-M35","u":1},{"t":"Cuando existan vacunas eficaces, ponerlas a disposición de los trabajadores e informar sobre ventajas e inconvenientes; documentar por escrito el ofrecimiento y su aceptación.","id":"R29-M36","u":1}],"np":1},{"r":"R29","riesgo":"Exposición a agentes biológicos","condicion":"Ropa de trabajo/EPI contaminados","P":"M","C":"D","VR":"MO","medidas":[{"t":"Prohibir que los trabajadores se lleven a su domicilio la ropa o EPI contaminados para su lavado.","id":"R29-M10","u":1}],"np":1},{"r":"R30","riesgo":"Carga física","condicion":"Aplicación de fuerzas elevadas durante tareas de planchado","P":"M","C":"D","VR":"MO","medidas":[{"t":"Informar sobre los riesgos y medidas preventivas asociados a la aplicación de fuerzas.","id":"R30-M82","u":1},{"t":"Formar sobre los riesgos y medidas preventivas asociados a la aplicación de fuerzas.","id":"R30-M83","u":1}],"np":1}]},{"id":"A14","nombre":"Uso de equipos de hostelería","categoria":"Limpieza, lavandería y cocina","estado":"documento","tareas":"Uso de la maquinaria y los útiles de cocina y office: fregaderos, lavavajillas, hornos, cocinas, planchas, extractores, básculas, equipos de frío, máquinas de hielo, cafeteras, batidora, robot de cocina, cubertería, bandejas y carros.","epi":"","nota":"","puestos":["Cocinero/a","Auxiliar de cocina"],"condiciones":[{"r":"R09","riesgo":"Golpes o cortes por objetos o herramientas","condicion":"Herramientas manuales o útiles de cocina","P":"B","C":"D","VR":"TO","medidas":[{"t":"Formación en el correcto uso de equipos de cocina.","tipo":"P","legal":"RD 1215/1997"},{"t":"Información en el correcto uso de los equipos de cocina.","tipo":"P","legal":"RD 1215/1997"}]},{"r":"R13","riesgo":"Contactos térmicos","condicion":"Superficies calientes","P":"M","C":"D","VR":"MO","medidas":[{"t":"Información sobre la correcta utilización de equipos y útiles de cocina","tipo":"P","legal":"Ley 31/1995"}]},{"r":"R14","riesgo":"Contactos eléctricos","condicion":"Uso de equipos y herramientas eléctricas","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información sobre la forma de comunicar cualquier anomalía que sea detectada en la instalación eléctrica y equipos eléctricos, así como la prohibición de realizar cualquier tipo de manipulación en las instalaciones y equipos eléctricos a no ser que estén expresamente autorizados por la empresa. Dejar constancia documental de su entrega.","tipo":"P","legal":"RD 614/2001, RD 1215/1997"},{"t":"Formación en los riesgos derivados del uso de equipos eléctricos, así como de las medidas de protección y prevención aplicables.","tipo":"P","legal":"RD 614/2001, RD 1215/1997"}]},{"r":"R17","riesgo":"Incendios","condicion":"Manipulación de materiales inflamables","P":"M","C":"D","VR":"MO","medidas":[{"t":"Información sobre la necesidad de recoger inmediatamente los derrames o vertidos de productos inflamables cuando se produzcan.","tipo":"P","legal":"Ley 31/1995"}]}]},{"id":"A15","nombre":"Uso de la cortadora de fiambre","categoria":"Limpieza, lavandería y cocina","estado":"documento","tareas":"Corte de embutidos y otros alimentos con la cortadora de fiambre.","epi":"","nota":"Descripción de tareas reescrita.","puestos":["Cocinero/a","Auxiliar de cocina"],"condiciones":[{"r":"R08","riesgo":"Golpes o contactos con elementos móviles de máquinas","condicion":"Uso de la cortadora de fiambre","P":"B","C":"D","VR":"TO","medidas":[{"t":"Formación en el correcto uso de la cortadora de fiambre.","tipo":"P","legal":"RD 1215/1997"},{"t":"Información en el correcto uso de la cortadora de fiambre según las instrucciones establecidas por el fabricante.","tipo":"P","legal":"RD 1215/1997"},{"t":"Información sobre la prohibición de utilizar la cortadora de fiambre si no dispone de empujador con el protector en perfectas condiciones, en ningún caso se utilizará guiando con la mano directamente el producto a cortar.","tipo":"P","legal":"RD 1215/1997"}]},{"r":"R14","riesgo":"Contactos eléctricos","condicion":"Uso de equipos y herramientas eléctricas","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información sobre los riesgos y medidas preventivas a adoptar en el uso de equipos eléctricos. Dejar constancia documental de su entrega.","tipo":"P","legal":"RD 614/2001, RD 1215/1997"}]}]},{"id":"A16","nombre":"Preparación y cocinado de alimentos","categoria":"Limpieza, lavandería y cocina","estado":"documento","tareas":"Elaboración de platos y menús: recepción y almacenamiento de alimentos, preparación (lavado, pelado y corte), cocinado en fogones, horno y plancha, uso de cuchillos y útiles cortantes, manejo de vajilla y recipientes calientes, y manipulación de alimentos crudos y congelados.","epi":"Disponibles: guantes de malla metálica y protectores de brazos contra cortes y pinchazos de cuchillos de mano (UNE-EN 1082-1), guantes de protección contra microorganismos (UNE-EN 374-5) y calzado de trabajo antideslizante con buena sujeción del talón (UNE-EN ISO 20347).","nota":"Evaluada con el documento del puesto de cocinero/a. Sustituye a la propuesta anterior.","puestos":["Cocinero/a","Auxiliar de cocina"],"condiciones":[{"r":"R09","riesgo":"Golpes o cortes por objetos o herramientas","condicion":"Uso de cuchillo y útiles cortantes","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información sobre las normas básicas de seguridad en el manejo de cuchillos y útiles de corte. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"},{"t":"Formación en normas básicas de seguridad en el manejo de cuchillos y útiles de corte.","tipo":"P","legal":"Ley 31/1995"},{"t":"Velar por la utilización correcta del EPI: Guantes de malla metálica y protectores de brazos contra los cortes y pinchazos producidos por cuchillos de mano (UNE-EN 1082-1) Observaciones: Reponer el guante de malla que no se encuentre en buenas condiciones de uso","tipo":"P","legal":"RD 773/1997"}]},{"r":"R09","riesgo":"Golpes o cortes por objetos o herramientas","condicion":"Manipulación de vajillas, cristalería, etc.","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información sobre el riesgo de cortes y de evitar coger los cristales rotos con las manos. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"},{"t":"Información en el correcto uso de los equipos de cocina.","tipo":"P","legal":"RD 1215/1997"}]},{"r":"R10","riesgo":"Proyección de fragmentos o partículas","condicion":"Salpicaduras líquidos calientes","P":"M","C":"D","VR":"MO","medidas":[{"t":"No se deberá dejar nunca los mangos de las sartenes hacia fuera cuando se estén utilizando y contengan aceite o alimentos calientes, de esta forma se evitará que cualquier trabajador pueda tropezar con dicho mango y proyectarse el contenido de dicha sartén sobre el cuerpo.","tipo":"P","legal":"Ley 31/1995"}]},{"r":"R13","riesgo":"Contactos térmicos","condicion":"Superficies calientes → Trabajos en cocina → Contactos con superficies calientes","P":"M","C":"D","VR":"MO","medidas":[{"t":"Información sobre la correcta realización de las labores para evitar sufrir quemaduras en la manipulación de superficies calientes. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"},{"t":"Informar a los trabajadores sobre los riesgos y medidas preventivas a adoptar en la manipulación de equipos y recipientes calientes.","tipo":"P","legal":"Ley 31/1995"}]},{"r":"R13","riesgo":"Contactos térmicos","condicion":"Manipulación de alimentos congelados, etc.","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información sobre la correcta realización de las labores para evitar sufrir contacto térmico con frío en los trabajos a bajas temperaturas. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"}]},{"r":"R17","riesgo":"Incendios","condicion":"Incendios","P":"B","C":"ED","VR":"MO","medidas":[{"t":"Información sobre las normas de actuación ante emergencias. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"}]},{"r":"R23","riesgo":"Estrés Térmico","condicion":"Estrés térmico por calor","P":"M","C":"D","VR":"MO","medidas":[{"t":"Realizar evaluación específica de la exposición a Estrés Térmico por calor. GT RD 486/1997, UNE-EN ISO 7243:2017,","tipo":"C","legal":"NTP-922"},{"t":"Información sobre la necesidad de hidratarse mediante la ingestión de agua de forma regular durante la jornada laboral. Dejar constancia documental de su entrega. GT RD 486/1997, UNE-EN ISO 7243:2017,","tipo":"P","legal":"NTP-922"},{"t":"Información sobre riesgos y medidas preventivas por exposición a ambientes calurosos. Dejar constancia documental de su entrega. GT RD 486/1997, UNE-EN ISO 7243:2017,","tipo":"P","legal":"NTP-922"},{"t":"Disponer de lugares para descanso/recuperación. GT RD 486/1997, UNE-EN ISO 7243:2017,","tipo":"P","legal":"NTP-922"},{"t":"Disponer de sistemas de extracción localizada y/o de ventilación general. GT RD 486/1997, UNE-EN ISO 7243:2017,","tipo":"P","legal":"NTP-922"},{"t":"Formación sobre riesgos y medidas preventivas por exposición a ambientes calurosos.","tipo":"P","legal":"NTP-922"}]},{"r":"R29","riesgo":"Exposición a agentes biológicos","condicion":"Posible contacto con agentes biológicos → Prácticas inadecuadas → Manipulación de alimentos crudos","P":"M","C":"D","VR":"MO","medidas":[{"t":"Velar por la utilización correcta del EPI: Guantes de protección contra microorganismos: bacterias y hongos (UNE EN 374-5)","tipo":"P","legal":"RD 773/1997"},{"t":"Información sobre los riesgos y medidas preventivas de la exposición a Agentes Biológicos. Dejar constancia documental de su entrega.","tipo":"P","legal":"RD 664/1997"},{"t":"Formación sobre los riesgos y medidas preventivas de la exposición a Agentes Biológicos.","tipo":"P","legal":"RD 664/1997"}]},{"r":"R02","riesgo":"Caídas de personas en el mismo nivel","condicion":"Suelos sucios, resbaladizos","P":"M","C":"LD","VR":"TO","medidas":[{"t":"Eliminar con rapidez los desperdicios, las manchas de grasa y demás productos residuales.","tipo":"P","legal":"RD 486/1997"},{"t":"Información sobre la necesidad de mantener precaución cuando existan zonas de pavimento con resto de agua, manchas de aceite, etc., evitando pisar directamente sobre los mismos. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"},{"t":"Información sobre la necesidad de ordenar la zona y retirar los desperdicios y materiales de desecho. Dejar constancia documental de su entrega.","tipo":"P","legal":"Ley 31/1995"},{"t":"Velar por la utilización correcta del EPI: Calzado de trabajo con suela antideslizante y una correcta sujeción del talón (UNE_EN ISO 20347)","tipo":"P","legal":"RD 773/1997"}]},{"r":"R03","riesgo":"Caídas de objetos por desplome o derrumbamiento","condicion":"Almacenamiento de alimentos o elementos de cocina","P":"B","C":"D","VR":"TO","medidas":[{"t":"Información sobre los riesgos y medidas preventivas a adoptar en el almacenamiento de material en estanterías y armarios. Dejar constancia documental de su entrega.","tipo":"P","legal":"RD 486/1997"},{"t":"Formación en riesgos y medidas preventivas a adoptar en el almacenamiento de material en estanterías y armarios.","tipo":"P","legal":"RD 486/1997"}]}]},{"id":"A17","nombre":"Limpieza de cocina, vajilla y office","categoria":"Limpieza, lavandería y cocina","estado":"documento","tareas":"Limpieza de vajilla, cristalería y cubertería tras el servicio de comedor, y de las máquinas, equipos y útiles de la cocina y de las instalaciones de comedor y cocina, con productos químicos de limpieza.","epi":"A proporcionar: guantes de protección frente al riesgo químico (UNE-EN 374-1) y pantalla facial (UNE-EN 166). Productos: Suma Inox D7.1 y Suma Ultra L2.","nota":"Evaluada con el documento del puesto de cocinero/a. Sustituye a la propuesta anterior.","puestos":["Cocinero/a","Auxiliar de cocina"],"condiciones":[{"r":"R15","riesgo":"Contactos con sustancias cáusticas o corrosivas","condicion":"Manipulación de productos químicos de limpieza en cocina","P":"B","C":"D","VR":"TO","medidas":[{"t":"Disponer de las fichas de datos de seguridad en castellano de los productos químicos existentes en el centro de trabajo en lugares accesibles y conocidos por todos los operarios para su posible consulta.","tipo":"C","legal":"RD 374/2001"},{"t":"Proporcionar a las personas trabajadoras: Pantalla facial (UNE-EN 166)","tipo":"C","legal":"RD 773/1997"},{"t":"Proporcionar a las personas trabajadoras: Guantes de protección frente al riesgo químico (UNE EN 374-1) Observaciones: Realizan la limpieza de las instalaciones.","tipo":"P","legal":"RD 773/1997"},{"t":"Información sobre riesgos y medidas preventivas sobre uso/almacenamiento de productos químicos. Dejar constancia documental de su entrega.","tipo":"P","legal":"RD 374/2001, Ley 31/1995"}]},{"r":"R25","riesgo":"Inhalación, contacto o ingestión de sustancias nocivas","condicion":"Manipulación de productos químicos","P":"B","C":"D","VR":"TO","medidas":[{"t":"Proporcionar a las personas trabajadoras: Guantes de protección frente al riesgo químico (UNE EN 374-1)","tipo":"C","legal":"RD 773/1997"},{"t":"Proporcionar a las personas trabajadoras: Pantalla facial (UNE-EN 166)","tipo":"C","legal":"RD 773/1997"},{"t":"Información sobre riesgos y medidas preventivas en la manipulación de productos químicos.","tipo":"P","legal":"RD 374/2001"}]}]},{"id":"A18","nombre":"Herramientas manuales","categoria":"Mantenimiento y equipos de trabajo","estado":"matriz","tareas":"Uso de herramientas manuales y útiles de corte, y su transporte y almacenamiento.","epi":"","nota":"No estaba evaluada en el documento (figura como «Herramientas manuales»).","puestos":["Médico/a","Psiquiatra","Enfermero/a","Psicólogo/a","Fisioterapeuta","Terapeuta ocupacional","Trabajador/a social","Educador/a social","TASOC / Animador/a sociocultural","Auxiliar de Enfermería","Gerocultor/a","Monitor/a","Mantenimiento"],"condiciones":[{"r":"R04","riesgo":"Caída de objetos en manipulación","condicion":"Uso de útiles, herramientas y equipos","P":"B","C":"D","VR":"TO","medidas":[{"t":"Informar sobre los riesgos y medidas preventivas para evitar la caída de útiles, herramientas y equipos durante su manipulación.","id":"R04-M04","u":2}],"np":2},{"r":"R09","riesgo":"Golpes o cortes por objetos/herramientas","condicion":"Utilización de herramientas manuales o útiles / prácticas inadecuadas","P":"B","C":"D","VR":"TO","medidas":[{"t":"Informar sobre los riesgos y medidas preventivas en el uso de material de oficina.","id":"R09-M01","u":8},{"t":"Informar a los trabajadores sobre los riesgos y medidas preventivas a adoptar en el uso de material de oficina. Dejar constancia documental de su entrega.","id":"R09-M03","u":3},{"t":"Sustituir herramientas defectuosas por otras en las que los elementos de corte y bordes filosos estén correctamente afilados.","id":"R09-M19","u":1}],"np":10},{"r":"R09","riesgo":"Golpes o cortes por objetos/herramientas","condicion":"Elementos cortantes o punzantes","P":"B","C":"D","VR":"TO","medidas":[{"t":"Informar previamente al uso de los EPI sobre los riesgos frente a los que protegen y cuándo deben utilizarse.","id":"R09-M08","u":1},{"t":"Mantener objetos y piezas con formas punzantes en sus embalajes hasta su colocación y mantener las herramientas ordenadas en carros portaherramientas.","id":"R09-M09","u":1},{"t":"Guardar las herramientas cortantes o punzantes en fundas adecuadas.","id":"R09-M10","u":1},{"t":"Utilizar guantes de protección contra riesgos mecánicos UNE-EN 388.","id":"R09-M11","u":1}],"np":1},{"r":"R09","riesgo":"Golpes o cortes por objetos/herramientas","condicion":"Herramientas en mal estado","P":"B","C":"D","VR":"TO","medidas":[{"t":"Revisar periódicamente el afilado de las herramientas de bordes filosos.","id":"R09-M12","u":1},{"t":"Revisar y mantener en buen estado de conservación las herramientas manuales.","id":"R09-M13","u":1},{"t":"Revisar periódicamente el estado de los mangos de las herramientas.","id":"R09-M15","u":1}],"np":1},{"r":"R09","riesgo":"Golpes o cortes por objetos/herramientas","condicion":"Transporte y almacenamiento de herramientas de corte","P":"M","C":"D","VR":"MO","medidas":[{"t":"Verificar periódicamente el correcto estado de almacenamiento de los útiles de corte.","id":"R09-M20","u":1},{"t":"Disponer de herramientas manuales y fundas para trabajar y transportarlas adecuadamente.","id":"R09-M21","u":1}],"np":1},{"r":"R09","riesgo":"Golpes o cortes por objetos/herramientas","condicion":"Prácticas inadecuadas con herramientas manuales","P":"B","C":"D","VR":"TO","medidas":[{"t":"Informar sobre las normas básicas de seguridad en el manejo de cuchillos y útiles de corte.","id":"R09-M16","u":1},{"t":"Informar sobre los riesgos y medidas aplicables en el manejo de equipos de corte.","id":"R09-M17","u":1},{"t":"Informar sobre los riesgos y medidas preventivas para el uso correcto de herramientas manuales.","id":"R09-M18","u":1}],"np":1},{"r":"R30","riesgo":"Carga física","condicion":"Aplicación de fuerzas durante el uso de herramientas","P":"M","C":"D","VR":"MO","medidas":[{"t":"Informar sobre el manejo correcto de herramientas manuales.","id":"R30-M72","u":1},{"t":"Emplear herramientas cuyo diseño se adapte a la mano, evite posturas forzadas y requiera una fuerza mínima.","id":"R30-M73","u":1},{"t":"Trabajar con muñecas en posición neutra y brazos pegados al cuerpo.","id":"R30-M74","u":1},{"t":"Informar sobre medidas preventivas durante el manejo ergonómico de herramientas portátiles.","id":"R30-M75","u":1},{"t":"Verificar que las herramientas de corte se encuentran correctamente afiladas.","id":"R30-M76","u":1}],"np":1}]},{"id":"A19","nombre":"Equipos de trabajo","categoria":"Mantenimiento y equipos de trabajo","estado":"matriz","tareas":"Uso de equipos de trabajo con elementos móviles, como el compresor portátil, la pistola de pintura o la radial.","epi":"","nota":"No estaba evaluada en el documento (figura como «Equipos de trabajo»). Evaluación breve: revisar.","puestos":["Mantenimiento"],"condiciones":[{"r":"R08","riesgo":"Golpes/contactos con elementos móviles de máquinas","condicion":"Uso de equipos de trabajo","P":"B","C":"D","VR":"TO","medidas":[{"t":"Formar sobre los riesgos derivados del uso de los equipos de trabajo y las medidas de protección y prevención aplicables.","id":"R08-M01","u":1},{"t":"Informar sobre los riesgos derivados del uso de los equipos de trabajo y las medidas de protección y prevención aplicables.","id":"R08-M02","u":1}],"np":1}]},{"id":"A20","nombre":"Uso de equipos y herramientas eléctricas","categoria":"Mantenimiento y equipos de trabajo","estado":"matriz","tareas":"Uso de equipos y herramientas eléctricas del centro y comunicación de las anomalías detectadas en instalaciones y equipos.","epi":"","nota":"Se ha añadido la condición de anomalías, que antes estaba mezclada con las reparaciones.","puestos":["Médico/a","Psiquiatra","Enfermero/a","Psicólogo/a","Farmacéutico/a","Fisioterapeuta","Terapeuta ocupacional","Trabajador/a social","Educador/a social","TASOC / Animador/a sociocultural","Profesor/a","Auxiliar de Enfermería","Gerocultor/a","Celador/a","Monitor/a","Limpieza","Personal de lavandería","Cocinero/a","Auxiliar de cocina","Mantenimiento","Personal de administración","Recepcionista","Coordinador/a","Director/a"],"condiciones":[{"r":"R14","riesgo":"Contactos eléctricos","condicion":"Uso de equipos y herramientas eléctricas","P":"B","C":"D","VR":"TO","medidas":[{"t":"Informar sobre los riesgos y medidas preventivas en el uso de equipos eléctricos.","id":"R14-M04","u":13},{"t":"Informar sobre cómo comunicar anomalías en instalaciones y equipos eléctricos y prohibir su manipulación salvo autorización expresa.","id":"R14-M05","u":9},{"t":"Informar a los trabajadores sobre la forma de comunicar cualquier anomalía detectada en la instalación eléctrica y equipos eléctricos, así como la prohibición de realizar cualquier tipo de manipulación salvo autorización expresa de la empresa. Dejar constancia documental de su entrega.","id":"R14-M07","u":3},{"t":"Informar a los trabajadores sobre los riesgos y medidas preventivas a adoptar en el uso de equipos eléctricos. Dejar constancia documental de su entrega.","id":"R14-M08","u":3},{"t":"Informar sobre la obligación de comunicar cualquier anomalía en instalaciones y equipos eléctricos y la prohibición de manipularlos sin autorización.","id":"R14-M03","u":1},{"t":"Verificar el cumplimiento de las normas básicas de seguridad en el uso de equipos eléctricos.","id":"R14-M11","u":1},{"t":"Comunicar cualquier anomalía y prohibir la manipulación de instalaciones/equipos eléctricos salvo autorización expresa.","id":"R14-M12","u":1},{"t":"Comprobar periódicamente el estado de conservación y mantenimiento del sistema eléctrico del equipo.","id":"R14-M13","u":1},{"t":"Prohibir la manipulación de instalaciones y equipos eléctricos salvo autorización expresa de la empresa.","id":"R14-M19","u":1}],"np":14},{"r":"R14","riesgo":"Contactos eléctricos","condicion":"Presencia de cableado, conexiones y alargadores en zonas de limpieza","P":"B","C":"ED","VR":"MO","medidas":[{"t":"Informar sobre los riesgos y medidas preventivas durante las tareas de limpieza para evitar contactos eléctricos.","id":"R14-M10","u":1}],"np":1},{"r":"R14","riesgo":"Contactos eléctricos","condicion":"Anomalías en instalaciones y equipos eléctricos","P":"B","C":"D","VR":"TO","medidas":[{"t":"Informar sobre la forma de comunicar anomalías y prohibir la manipulación de instalaciones y equipos eléctricos salvo autorización expresa.","id":"R14-M16","u":1},{"t":"Informar sobre la forma de comunicar cualquier anomalía detectada en la instalación y equipos eléctricos.","id":"R14-M18","u":1}],"np":2}]},{"id":"A21","nombre":"Reparaciones básicas de instalaciones eléctricas","categoria":"Mantenimiento y equipos de trabajo","estado":"matriz","tareas":"Reparaciones básicas de instalaciones y equipos eléctricos: cambio de enchufes y luminarias y revisión de cuadros.","epi":"","nota":"Se limita a las reparaciones básicas; las anomalías pasan a «Uso de equipos y herramientas eléctricas».","puestos":["Mantenimiento"],"condiciones":[{"r":"R14","riesgo":"Contactos eléctricos","condicion":"Reparaciones básicas de instalaciones eléctricas","P":"M","C":"D","VR":"MO","medidas":[{"t":"Informar sobre los riesgos y medidas preventivas aplicables a las reparaciones básicas en instalaciones eléctricas.","id":"R14-M14","u":1}],"np":1}]},{"id":"A22","nombre":"Soldadura y trabajos con calor","categoria":"Mantenimiento y equipos de trabajo","estado":"matriz","tareas":"Soldadura, esmerilado y trabajos de mantenimiento con superficies calientes o proyección de partículas.","epi":"","nota":"","puestos":["Mantenimiento"],"condiciones":[{"r":"R10","riesgo":"Proyección de fragmentos o partículas","condicion":"Proyección de fragmentos de piezas o herramientas","P":"B","C":"ED","VR":"MO","medidas":[{"t":"Utilizar gafas de protección ocular de montura integral UNE-EN ISO 16321-1.","id":"R10-M07","u":1},{"t":"Comprobar las condiciones y estado de materiales, piezas de madera y otros elementos antes de utilizar los equipos.","id":"R10-M08","u":1}],"np":1},{"r":"R10","riesgo":"Proyección de fragmentos o partículas","condicion":"Proyección de partículas incandescentes durante soldadura/esmerilado","P":"B","C":"ED","VR":"MO","medidas":[{"t":"Separar o aislar los equipos de soldadura o esmerilado mediante mamparas o pantallas móviles que protejan frente a las proyecciones.","id":"R10-M05","u":1}],"np":1},{"r":"R13","riesgo":"Contactos térmicos","condicion":"Trabajos de mantenimiento sobre superficies calientes","P":"B","C":"ED","VR":"MO","medidas":[{"t":"Informar sobre las medidas preventivas durante trabajos sobre superficies calientes de equipos.","id":"R13-M09","u":1},{"t":"Informar sobre la correcta realización de las tareas para evitar quemaduras durante operaciones de mantenimiento.","id":"R13-M10","u":1}],"np":1},{"r":"R13","riesgo":"Contactos térmicos","condicion":"Trabajos de soldadura","P":"B","C":"ED","VR":"MO","medidas":[{"t":"Proporcionar manguitos para soldadura UNE-EN ISO 11611.","id":"R13-M02","u":1},{"t":"Proporcionar ropa de protección para soldeo UNE-EN ISO 11611.","id":"R13-M03","u":1},{"t":"Proporcionar guantes de protección para soldadores UNE-EN 12477.","id":"R13-M04","u":1},{"t":"Proporcionar pantalla facial con filtros para soldadura UNE-EN ISO 16321-1/-2.","id":"R13-M05","u":1},{"t":"Proporcionar calzado de protección frente a riesgos en procesos de soldadura UNE-EN ISO 20349-2.","id":"R13-M06","u":1},{"t":"Informar sobre los riesgos y medidas preventivas durante trabajos de soldadura blanda.","id":"R13-M07","u":1},{"t":"Informar y formar sobre la correcta realización de los trabajos de soldadura.","id":"R13-M08","u":1}],"np":1},{"r":"R26","riesgo":"Exposición a radiaciones","condicion":"Radiación óptica no ionizante","P":"M","C":"D","VR":"MO","medidas":[{"t":"Señalizar la zona de soldadura identificando el peligro de exposición a radiaciones ópticas y la obligación de utilizar EPI.","id":"R26-M01","u":1},{"t":"Instalar apantallamientos para proteger frente a radiaciones o establecer perímetro de seguridad alrededor del foco emisor.","id":"R26-M02","u":1},{"t":"Informar sobre los riesgos y medidas preventivas frente a radiaciones ópticas.","id":"R26-M03","u":1},{"t":"Formar sobre los riesgos y medidas preventivas frente a radiaciones ópticas.","id":"R26-M04","u":1}],"np":1}]},{"id":"A23","nombre":"Equipos a presión","categoria":"Mantenimiento y equipos de trabajo","estado":"matriz","tareas":"Uso de compresor portátil y otros equipos a presión.","epi":"","nota":"","puestos":["Mantenimiento"],"condiciones":[{"r":"R16","riesgo":"Explosiones","condicion":"Equipos a presión","P":"M","C":"D","VR":"MO","medidas":[{"t":"Informar sobre los riesgos y medidas preventivas en el uso del compresor portátil.","id":"R16-M01","u":1},{"t":"Disponer de certificados de las inspecciones, reparaciones o modificaciones realizadas en los equipos.","id":"R16-M02","u":1},{"t":"Aplicar las instrucciones del fabricante y las medidas de seguridad de los equipos.","id":"R16-M03","u":1},{"t":"Disponer de Declaración de Conformidad, manual de instrucciones y certificado de instalación.","id":"R16-M04","u":1},{"t":"Realizar las inspecciones periódicas por organismo de control autorizado o empresa instaladora.","id":"R16-M05","u":1}],"np":1}]},{"id":"A24","nombre":"Uso de productos químicos (distintos de limpieza)","categoria":"Mantenimiento y equipos de trabajo","estado":"matriz","tareas":"Uso, almacenamiento y trasvase de productos químicos que no son los de las tareas de limpieza.","epi":"","nota":"","puestos":["Enfermero/a","Farmacéutico/a","Personal de lavandería","Cocinero/a","Auxiliar de cocina","Mantenimiento"],"condiciones":[{"r":"R10","riesgo":"Proyección de fragmentos o partículas","condicion":"Proyección de líquidos","P":"M","C":"D","VR":"MO","medidas":[{"t":"Proporcionar gafas de protección ocular de montura integral.","id":"R10-M03","u":1},{"t":"Proporcionar gafas de protección ocular de montura integral (UNE-EN ISO 16321-1).","id":"R10-M04","u":1},{"t":"Informar sobre los riesgos de proyección de líquidos durante el uso de productos químicos.","id":"R10-M06","u":1},{"t":"Utilizar gafas de protección ocular de montura integral UNE-EN ISO 16321-1.","id":"R10-M07","u":1}],"np":3},{"r":"R15","riesgo":"Contactos con sustancias cáusticas/corrosivas","condicion":"Derrames o fugas de productos químicos durante su manipulación","P":"B","C":"D","VR":"TO","medidas":[{"t":"Proporcionar guantes de protección frente al riesgo químico (UNE EN 374-1).","id":"R15-M06","u":1}],"np":1},{"r":"R15","riesgo":"Contactos con sustancias cáusticas/corrosivas","condicion":"Manipulación de productos químicos","P":"M","C":"D","VR":"MO","medidas":[{"t":"Proporcionar guantes de protección frente al riesgo químico (UNE EN 374-1).","id":"R15-M06","u":1},{"t":"Informar sobre riesgos y medidas preventivas en el uso y almacenamiento de productos químicos.","id":"R15-M08","u":1},{"t":"Formar sobre los riesgos y medidas preventivas en la manipulación de productos químicos.","id":"R15-M10","u":1},{"t":"Informar sobre los riesgos y medidas preventivas en la manipulación de productos químicos y dejar constancia documental.","id":"R15-M11","u":1}],"np":2},{"r":"R25","riesgo":"Inhalación/contacto/ingestión de sustancias nocivas","condicion":"Manipulación de productos químicos","P":"B","C":"D","VR":"TO","medidas":[{"t":"Proporcionar guantes de protección frente al riesgo químico UNE-EN 374-1.","id":"R25-M01","u":1},{"t":"Proporcionar mascarilla filtrante contra gases y vapores según las FDS de los productos.","id":"R25-M02","u":1},{"t":"Informar sobre las instrucciones de las fichas de datos de seguridad relativas a la manipulación de productos químicos.","id":"R25-M03","u":1},{"t":"Informar sobre los riesgos y medidas preventivas en la manipulación de productos químicos.","id":"R25-M04","u":1},{"t":"Mantener actualizada la lista de productos químicos utilizados y sus fichas de datos de seguridad.","id":"R25-M06","u":1},{"t":"Formar sobre los riesgos y medidas preventivas en la manipulación de productos químicos.","id":"R25-M07","u":1},{"t":"Informar sobre los riesgos y medidas preventivas en la manipulación de productos químicos y dejar constancia documental.","id":"R25-M08","u":1}],"np":2},{"r":"R25","riesgo":"Inhalación/contacto/ingestión de sustancias nocivas","condicion":"Derrames o fugas de productos químicos durante su manipulación","P":"B","C":"D","VR":"TO","medidas":[{"t":"Proporcionar guantes de protección frente al riesgo químico UNE-EN 374-1.","id":"R25-M01","u":1}],"np":1},{"r":"R27","riesgo":"Exposición a agentes químicos","condicion":"Exposición a productos químicos","P":"M","C":"D","VR":"MO","medidas":[{"t":"Informar sobre riesgos y medidas preventivas frente a la exposición a agentes químicos.","id":"R27-M02","u":2},{"t":"Proporcionar guantes de protección frente al riesgo químico UNE EN 374-1.","id":"R27-M04","u":2},{"t":"Formar sobre los riesgos y medidas preventivas frente a agentes químicos.","id":"R27-M16","u":2},{"t":"Proporcionar mascarilla filtrante contra partículas UNE-EN 149, protección FFP3.","id":"R27-M10","u":1},{"t":"Reducir la intensidad y duración de la exposición y el número de trabajadores expuestos.","id":"R27-M11","u":1},{"t":"Verificar el correcto estado de las etiquetas y la actualización de las FDS.","id":"R27-M12","u":1},{"t":"Utilizar los EPI necesarios conforme a las fichas de datos de seguridad de cada producto.","id":"R27-M14","u":1},{"t":"Disponer de un listado actualizado de productos químicos.","id":"R27-M15","u":1},{"t":"Disponer de envases correctamente etiquetados.","id":"R27-M17","u":1},{"t":"Informar sobre los riesgos y medidas preventivas de exposición a agentes químicos y dejar constancia documental.","id":"R27-M20","u":1}],"np":3},{"r":"R27","riesgo":"Exposición a agentes químicos","condicion":"Exposición por cualquier vía de entrada","P":"M","C":"D","VR":"MO","medidas":[{"t":"Disponer de las fichas de datos de seguridad en castellano, en lugares accesibles y conocidos.","id":"R27-M01","u":1},{"t":"Disponer de las fichas de datos de seguridad en castellano en lugares accesibles y conocidos por todos los trabajadores.","id":"R27-M18","u":1}],"np":2},{"r":"R27","riesgo":"Exposición a agentes químicos","condicion":"Uso de productos químicos desinfectantes/esterilizantes","P":"B","C":"D","VR":"TO","medidas":[{"t":"Informar sobre riesgos y medidas preventivas durante el uso de productos químicos desinfectantes/esterilizantes.","id":"R27-M03","u":1}],"np":1}]},{"id":"A25","nombre":"Uso de escalera de mano","categoria":"Mantenimiento y equipos de trabajo","estado":"documento","tareas":"Uso de escalera portátil plegable de aluminio para trabajar a alturas inferiores a 3,5 metros, que cumple la norma UNE-EN 131.","epi":"","nota":"","puestos":["Mantenimiento"],"condiciones":[{"r":"R01","riesgo":"Caídas de personas a distinto nivel","condicion":"Uso de escalera de mano","P":"B","C":"D","VR":"TO","medidas":[{"t":"Formación en el correcto uso de escaleras de mano.","tipo":"P","legal":"RD 2177/2004"},{"t":"Comprobar el correcto estado de las escaleras antes de su uso: • Peldaños flojos, mal ensamblados, rotos, con grietas, o indebidamente sustituidos por barras o sujetos con alambres o cuerdas. • Mal estado de los sistemas de sujeción y apoyo. • Retirar la escalera si presenta cualquier defecto de los descritos. • Reparar la escalera por personal especializado o retirarla definitivamente.","tipo":"P","legal":"RD 2177/2004"},{"t":"Información sobre los riesgos y medidas preventivas a adoptar en el uso de pequeñas escaleras manuales.","tipo":"P","legal":"RD 2177/2004"}]}]},{"id":"A26","nombre":"Ruido y vibraciones","categoria":"Mantenimiento y equipos de trabajo","estado":"matriz","tareas":"Exposición a ruido y a vibraciones mano-brazo.","epi":"","nota":"","puestos":["Mantenimiento"],"condiciones":[{"r":"R28","riesgo":"Exposición a agentes físicos","condicion":"Ruido","P":"M","C":"D","VR":"MO","medidas":[{"t":"Informar sobre los riesgos y medidas preventivas frente a la exposición a ruido.","id":"R28-M01","u":1}],"np":1},{"r":"R28","riesgo":"Exposición a agentes físicos","condicion":"Vibraciones mano-brazo","P":"M","C":"D","VR":"MO","medidas":[{"t":"Informar sobre los riesgos y medidas preventivas frente a vibraciones mano-brazo.","id":"R28-M02","u":1}],"np":1}]},{"id":"A27","nombre":"Manipulación manual de cargas y uso de carros","categoria":"Ergonomía","estado":"matriz","tareas":"Traslado manual de cargas, material y mobiliario, con o sin carros.","epi":"","nota":"","puestos":["Médico/a","Psiquiatra","Enfermero/a","Psicólogo/a","Farmacéutico/a","Fisioterapeuta","Terapeuta ocupacional","Trabajador/a social","Educador/a social","TASOC / Animador/a sociocultural","Profesor/a","Auxiliar de Enfermería","Gerocultor/a","Celador/a","Monitor/a","Limpieza","Personal de lavandería","Cocinero/a","Auxiliar de cocina","Mantenimiento","Personal de administración","Recepcionista","Coordinador/a","Director/a"],"condiciones":[{"r":"R04","riesgo":"Caída de objetos en manipulación","condicion":"Manipulación manual de cargas","P":"B","C":"D","VR":"TO","medidas":[{"t":"Informar sobre la correcta manipulación manual de cargas.","id":"R04-M01","u":11},{"t":"Informar sobre la correcta manipulación manual de cargas. Dejar constancia documental de su entrega.","id":"R04-M03","u":3},{"t":"Velar por la utilización correcta del calzado de trabajo con suela antideslizante y correcta sujeción del talón (UNE-EN ISO 20347).","id":"R04-M05","u":2},{"t":"Informar sobre manejo manual de cargas y medidas preventivas asociadas.","id":"R04-M02","u":1},{"t":"Evitar calzado suelto o que no proteja el pie, como sandalias, durante la manipulación de materiales, útiles de corte, etc.","id":"R04-M06","u":1},{"t":"Dotar y velar por el uso de carros auxiliares para el traslado de útiles y herramientas.","id":"R04-M07","u":1},{"t":"Velar por la utilización correcta del calzado de seguridad UNE-EN ISO 20345.","id":"R04-M08","u":1},{"t":"Utilizar calzado que proteja la parte anterior del pie frente a la caída de objetos manipulados y evitar zapatos sueltos o que no protejan el pie.","id":"R04-M11","u":1},{"t":"Informar sobre el manejo manual de cargas por manipulación.","id":"R04-M12","u":1}],"np":15},{"r":"R11","riesgo":"Atrapamientos por o entre objetos","condicion":"Aplastamiento de pies con ruedas de carros","P":"B","C":"D","VR":"TO","medidas":[{"t":"Velar por la utilización correcta del calzado de trabajo con suela antideslizante y correcta sujeción del talón, UNE-EN ISO 20347.","id":"R11-M01","u":1}],"np":1},{"r":"R30","riesgo":"Carga física","condicion":"Manipulación manual de cargas","P":"M","C":"D","VR":"MO","medidas":[{"t":"Informar sobre el riesgo y medidas preventivas en tareas de manipulación manual de cargas.","id":"R30-M69","u":4},{"t":"Organizar las tareas permitiendo regular el ritmo de trabajo y establecer rotación hacia actividades que no impliquen gran esfuerzo físico o los mismos grupos musculares.","id":"R30-M36","u":2},{"t":"Limitar la manipulación sobre superficies inestables y utilizar preferentemente elementos fijos.","id":"R30-M33","u":1},{"t":"No realizar manipulación desde escaleras portátiles de apoyo.","id":"R30-M34","u":1},{"t":"Limitar la manipulación de cargas por encima de los hombros o por debajo de las rodillas.","id":"R30-M35","u":1},{"t":"Establecer normas básicas para realizar correctamente la manipulación manual de cargas.","id":"R30-M37","u":1},{"t":"Fraccionar las cargas siempre que sea técnicamente posible.","id":"R30-M38","u":1},{"t":"Dotar de medios auxiliares para el manejo de cargas y velar por su utilización adecuada.","id":"R30-M39","u":1},{"t":"Para la manipulación manual: situarse frente a la carga, separar los pies, flexionar rodillas manteniendo espalda recta, sujetar firmemente con ambas manos y levantarse manteniendo la espalda recta.","id":"R30-M40","u":1},{"t":"Transportar las cargas evitando giros del tronco y solicitar ayuda de un compañero en caso de cargas pesadas.","id":"R30-M41","u":1},{"t":"Formar sobre el riesgo y medidas preventivas en tareas de manipulación manual de cargas.","id":"R30-M70","u":1},{"t":"Informar sobre el riesgo y medidas preventivas en tareas de manipulación manual de cargas. Dejar constancia documental de su entrega.","id":"R30-M81","u":1}],"np":4},{"r":"R30","riesgo":"Carga física","condicion":"Manejo de cargas de más de 3 kg","P":"B","C":"D","VR":"TO","medidas":[{"t":"Informar sobre el riesgo y medidas preventivas en tareas de manipulación manual de cargas.","id":"R30-M69","u":1},{"t":"Formar sobre el riesgo y medidas preventivas en tareas de manipulación manual de cargas.","id":"R30-M70","u":1}],"np":1},{"r":"R30","riesgo":"Carga física","condicion":"Tareas de empuje o arrastre de cargas elevadas","P":"M","C":"D","VR":"MO","medidas":[{"t":"Informar sobre las recomendaciones durante las tareas de empuje y/o arrastre de cargas.","id":"R30-M01","u":1}],"np":1}]},{"id":"A28","nombre":"Posturas estáticas y bipedestación prolongada","categoria":"Ergonomía","estado":"matriz","tareas":"Trabajo de pie o sentado mantenido durante periodos largos sin cambios posturales.","epi":"","nota":"","puestos":["Médico/a","Psiquiatra","Psicólogo/a","Farmacéutico/a","Trabajador/a social","Educador/a social","Profesor/a","Celador/a","Personal de lavandería","Personal de administración","Recepcionista","Coordinador/a","Director/a"],"condiciones":[{"r":"R30","riesgo":"Carga física","condicion":"Posturas estáticas","P":"M","C":"D","VR":"MO","medidas":[{"t":"Informar sobre ejercicios posturales de espalda en posición sentada y de pie.","id":"R30-M53","u":7},{"t":"Informar sobre los riesgos y medidas preventivas derivados de trabajos con exposición a posturas estáticas.","id":"R30-M80","u":7},{"t":"Informar a los trabajadores sobre ejercicios posturales de espalda. Posición de trabajo sentado y de pie. Dejar constancia documental de su entrega.","id":"R30-M57","u":3},{"t":"Informar a los trabajadores sobre los riesgos y medidas preventivas derivados de trabajos con exposición a posturas estáticas. Dejar constancia documental de su entrega.","id":"R30-M58","u":3},{"t":"Informar a los trabajadores sobre los riesgos y medidas preventivas derivados de trabajos con exposición a posturas forzadas. Dejar constancia documental de su entrega.","id":"R30-M59","u":3},{"t":"Informar sobre los riesgos y medidas preventivas derivados de trabajos con exposición a posturas forzadas.","id":"R30-M02","u":1}],"np":8},{"r":"R30","riesgo":"Carga física","condicion":"Bipedestación prolongada","P":"M","C":"D","VR":"MO","medidas":[{"t":"Alternar el trabajo de pie con tareas realizadas sentado o semisentado.","id":"R30-M42","u":1},{"t":"Cuando no sea posible alternar posturas, permitir pausas suficientes, preferentemente breves y frecuentes.","id":"R30-M43","u":1},{"t":"Favorecer la movilidad durante las pausas mediante pequeños desplazamientos.","id":"R30-M44","u":1},{"t":"Evitar una postura totalmente estática, caminar o moverse y cambiar la posición de los pies, repartiendo alternativamente el peso entre ambas piernas.","id":"R30-M45","u":1},{"t":"Utilizar calzado ligero, flexible y transpirable, con tacón de entre 2 y 5 cm.","id":"R30-M46","u":1}],"np":1}]},{"id":"A29","nombre":"Posturas forzadas","categoria":"Ergonomía","estado":"matriz","tareas":"Tareas con posturas forzadas de algún segmento corporal durante más de una hora acumulada por jornada.","epi":"","nota":"","puestos":["Médico/a","Psiquiatra","Enfermero/a","Psicólogo/a","Fisioterapeuta","Terapeuta ocupacional","Educador/a social","TASOC / Animador/a sociocultural","Auxiliar de Enfermería","Gerocultor/a","Monitor/a","Limpieza","Auxiliar de cocina","Mantenimiento","Personal de administración","Recepcionista","Coordinador/a","Director/a"],"condiciones":[{"r":"R30","riesgo":"Carga física","condicion":"Posturas forzadas","P":"M","C":"D","VR":"MO","medidas":[{"t":"Informar sobre los riesgos y medidas preventivas derivados de trabajos con exposición a posturas forzadas.","id":"R30-M02","u":12},{"t":"Formar sobre los riesgos y medidas preventivas derivados de trabajos con exposición a posturas forzadas.","id":"R30-M64","u":1}],"np":12},{"r":"R30","riesgo":"Carga física","condicion":"Trabajos en posición arrodillada","P":"M","C":"D","VR":"MO","medidas":[{"t":"Proporcionar rodilleras para trabajos en posición arrodillada UNE-EN 14404.","id":"R30-M77","u":1}],"np":1}]},{"id":"A30","nombre":"Movimientos repetitivos","categoria":"Ergonomía","estado":"matriz","tareas":"Tareas con ciclos de movimiento iguales y cortos durante al menos una hora por turno.","epi":"","nota":"","puestos":["Enfermero/a","Fisioterapeuta","Terapeuta ocupacional","TASOC / Animador/a sociocultural","Auxiliar de Enfermería","Gerocultor/a","Monitor/a","Limpieza","Personal de lavandería","Auxiliar de cocina"],"condiciones":[{"r":"R30","riesgo":"Carga física","condicion":"Movimientos repetitivos","P":"M","C":"D","VR":"MO","medidas":[{"t":"Establecer sistemas de pausas cortas y frecuentes a lo largo del turno de trabajo.","id":"R30-M63","u":5},{"t":"Introducir rotación de tareas para disminuir los niveles de riesgo causados por movimientos repetitivos.","id":"R30-M03","u":3},{"t":"Informar sobre los riesgos y medidas preventivas para evitar los movimientos repetitivos.","id":"R30-M67","u":2},{"t":"Introducir rotación de tareas para disminuir los niveles de riesgo.","id":"R30-M62","u":1},{"t":"Establecer sistemas de rotación entre puestos/tareas con diferentes requerimientos físicos.","id":"R30-M66","u":1},{"t":"Informar sobre los riesgos y medidas preventivas frente a los trastornos musculoesqueléticos.","id":"R30-M68","u":1}],"np":6}]},{"id":"A31","nombre":"Medidas de emergencia","categoria":"Instalaciones y seguridad general","estado":"matriz","tareas":"Conocimiento y aplicación de las medidas de emergencia y evacuación del centro.","epi":"","nota":"","puestos":["Médico/a","Psiquiatra","Enfermero/a","Psicólogo/a","Farmacéutico/a","Fisioterapeuta","Terapeuta ocupacional","Trabajador/a social","Educador/a social","TASOC / Animador/a sociocultural","Profesor/a","Auxiliar de Enfermería","Gerocultor/a","Celador/a","Monitor/a","Limpieza","Personal de lavandería","Auxiliar de cocina","Mantenimiento","Personal de administración","Recepcionista","Coordinador/a","Director/a"],"condiciones":[{"r":"R17","riesgo":"Incendios","condicion":"Medidas de emergencia","P":"B","C":"ED","VR":"MO","medidas":[{"t":"Informar sobre las normas de actuación ante emergencias.","id":"R17-M01","u":11},{"t":"Informar a los trabajadores sobre las normas de actuación ante emergencias. Dejar constancia documental de su entrega.","id":"R17-M03","u":3},{"t":"Informar sobre las normas de actuación ante situaciones de emergencia.","id":"R17-M02","u":2},{"t":"Informar a los trabajadores sobre las normas de actuación ante emergencias.","id":"R17-M04","u":1}],"np":15}]},{"id":"A32","nombre":"Almacenamiento en estanterías y armarios","categoria":"Instalaciones y seguridad general","estado":"matriz","tareas":"Colocación y retirada de material en estanterías y armarios.","epi":"","nota":"","puestos":["Médico/a","Psiquiatra","Enfermero/a","Psicólogo/a","Farmacéutico/a","Fisioterapeuta","Terapeuta ocupacional","Trabajador/a social","Educador/a social","TASOC / Animador/a sociocultural","Auxiliar de Enfermería","Celador/a","Monitor/a","Limpieza","Personal de lavandería","Auxiliar de cocina","Mantenimiento","Personal de administración","Recepcionista","Coordinador/a","Director/a"],"condiciones":[{"r":"R03","riesgo":"Caída de objetos por desplome","condicion":"Almacenamiento en estanterías o armarios","P":"B","C":"D","VR":"TO","medidas":[{"t":"Informar sobre los riesgos y medidas preventivas del almacenamiento de material en estanterías y armarios.","id":"R03-M05","u":14},{"t":"Informar sobre los correctos criterios de almacenamiento.","id":"R03-M01","u":9},{"t":"Informar sobre los criterios correctos de almacenamiento.","id":"R03-M04","u":3},{"t":"Informar sobre los correctos criterios de almacenamiento. Dejar constancia documental de su entrega.","id":"R03-M06","u":2},{"t":"Informar a los trabajadores sobre los riesgos y medidas preventivas a adoptar en el almacenamiento de material en estanterías y armarios. Dejar constancia documental de su entrega.","id":"R03-M07","u":2},{"t":"Verificar el correcto estado del material almacenado.","id":"R03-M08","u":1},{"t":"Verificar el correcto estado de los almacenamientos.","id":"R03-M09","u":1},{"t":"Verificar periódicamente el correcto estado del material almacenado y de los sistemas de almacenamiento.","id":"R03-M11","u":1}],"np":15},{"r":"R05","riesgo":"Caídas de objetos desprendidos","condicion":"Materiales almacenados","P":"B","C":"D","VR":"TO","medidas":[{"t":"Verificar el correcto estado de los almacenamientos.","id":"R05-M01","u":1}],"np":1}]},{"id":"A33","nombre":"Tránsito por el centro (escaleras, accesos y zonas de paso)","categoria":"Instalaciones y seguridad general","estado":"matriz","tareas":"Desplazamientos a pie por pasillos, escaleras fijas, accesos y zonas de paso del centro.","epi":"","nota":"","puestos":["Médico/a","Psiquiatra","Enfermero/a","Psicólogo/a","Farmacéutico/a","Fisioterapeuta","Terapeuta ocupacional","Trabajador/a social","Educador/a social","TASOC / Animador/a sociocultural","Auxiliar de Enfermería","Gerocultor/a","Celador/a","Monitor/a","Limpieza","Personal de lavandería","Cocinero/a","Auxiliar de cocina","Mantenimiento","Personal de administración","Recepcionista","Coordinador/a","Director/a"],"condiciones":[{"r":"R01","riesgo":"Caídas a distinto nivel","condicion":"Tránsito por escalera fija","P":"B","C":"D","VR":"TO","medidas":[{"t":"Informar de la necesidad de utilizar los pasamanos y de no correr ni saltar en las escaleras.","id":"R01-M01","u":13},{"t":"Utilizar los pasamanos y no correr ni saltar en las escaleras.","id":"R01-M08","u":1}],"np":14},{"r":"R01","riesgo":"Caídas a distinto nivel","condicion":"Tránsito → escalera fija → caída a distinto nivel por la escalera fija del edificio","P":"B","C":"ED","VR":"MO","medidas":[{"t":"Informar de la necesidad de utilizar los pasamanos y de no correr ni saltar en las escaleras.","id":"R01-M01","u":3}],"np":3},{"r":"R02","riesgo":"Caídas al mismo nivel","condicion":"Distracciones durante los desplazamientos","P":"B","C":"LD","VR":"T","medidas":[{"t":"Informar de que no se deben utilizar tablet, smartphone ni dispositivos PDA mientras el usuario esté desplazándose.","id":"R02-M01","u":11},{"t":"No utilizar tablet, smartphone ni dispositivos PDA mientras se esté desplazando.","id":"R02-M11","u":1}],"np":12},{"r":"R02","riesgo":"Caídas al mismo nivel","condicion":"Tránsito → distracciones","P":"B","C":"LD","VR":"T","medidas":[{"t":"Informar a los trabajadores que no se deben utilizar dispositivos: tablet, smartphone y dispositivos PDA mientras el usuario esté desplazándose. Dejar constancia documental de su entrega.","id":"R02-M06","u":3},{"t":"Informar de que no se deben utilizar tablet, smartphone ni dispositivos PDA mientras el usuario esté desplazándose.","id":"R02-M01","u":1},{"t":"Informar a los trabajadores que no se deben utilizar dispositivos tablet, smartphone y PDA mientras el usuario esté desplazándose.","id":"R02-M17","u":1}],"np":5},{"r":"R02","riesgo":"Caídas al mismo nivel","condicion":"Cables, mangueras, conductores, herramientas y otros objetos en zonas de paso","P":"M","C":"LD","VR":"TO","medidas":[{"t":"Verificar periódicamente el estado de los suelos y comprobar que no existan irregularidades, cables u objetos en el pavimento.","id":"R02-M12","u":1},{"t":"Retirar cables, mangueras, conductores, herramientas, equipos de trabajo y otros elementos de las zonas de paso.","id":"R02-M13","u":1}],"np":1},{"r":"R02","riesgo":"Caídas al mismo nivel","condicion":"Tránsito por el lugar de trabajo","P":"M","C":"LD","VR":"TO","medidas":[{"t":"Velar por la utilización correcta del calzado de trabajo con suela antideslizante y correcta sujeción del talón (UNE-EN ISO 20347).","id":"R02-M08","u":1}],"np":1},{"r":"R06","riesgo":"Pisadas sobre objetos","condicion":"Presencia de objetos cortantes o punzantes en el pavimento","P":"B","C":"D","VR":"TO","medidas":[{"t":"Eliminar la existencia de elementos cortantes y punzantes en el suelo.","id":"R06-M01","u":1},{"t":"Velar por la utilización correcta del calzado de seguridad UNE-EN ISO 20345.","id":"R06-M02","u":1}],"np":1},{"r":"R07","riesgo":"Golpes contra objetos inmóviles","condicion":"Espacio insuficiente en accesos y tránsitos","P":"B","C":"D","VR":"TO","medidas":[{"t":"Garantizar dimensiones suficientes en el puesto para permitir cambios de postura y movimientos de trabajo.","id":"R07-M03","u":5},{"t":"Informar de que el puesto debe tener dimensiones suficientes para permitir cambios de postura y movimientos de trabajo.","id":"R07-M01","u":4}],"np":9},{"r":"R07","riesgo":"Golpes contra objetos inmóviles","condicion":"Accesos y tránsitos → espacio insuficiente","P":"B","C":"D","VR":"TO","medidas":[{"t":"Informar a los trabajadores que el puesto de trabajo deberá tener una dimensión suficiente y estar acondicionado de tal manera que haya espacio suficiente para permitir los cambios de postura y movimientos de trabajo. Dejar constancia documental de su entrega.","id":"R07-M05","u":3},{"t":"Informar de que el puesto debe tener dimensiones suficientes para permitir cambios de postura y movimientos de trabajo.","id":"R07-M01","u":1},{"t":"Informar a los trabajadores que el puesto deberá tener una dimensión suficiente y estar acondicionado de tal manera que haya espacio suficiente para permitir los cambios de postura y movimientos de trabajo.","id":"R07-M11","u":1}],"np":5},{"r":"R07","riesgo":"Golpes contra objetos inmóviles","condicion":"Acopio de material","P":"B","C":"D","VR":"TO","medidas":[{"t":"Informar sobre las zonas específicas de almacenamiento de material.","id":"R07-M09","u":1}],"np":1},{"r":"R07","riesgo":"Golpes contra objetos inmóviles","condicion":"Espacio para acceder al puesto de trabajo o transitar","P":"M","C":"D","VR":"MO","medidas":[{"t":"Garantizar que los espacios de trabajo y tránsito tengan dimensiones suficientes y permitan cambios de postura y movimientos seguros.","id":"R07-M02","u":1}],"np":1},{"r":"R07","riesgo":"Golpes contra objetos inmóviles","condicion":"Mobiliario, materiales fuera de sitio, cajones abiertos, etc.","P":"B","C":"LD","VR":"T","medidas":[{"t":"Informar sobre las medidas preventivas para asegurar un correcto mantenimiento del orden y la limpieza en el lugar de trabajo.","id":"R07-M06","u":1}],"np":1}]},{"id":"A34","nombre":"Condiciones térmicas y ambientales","categoria":"Instalaciones y seguridad general","estado":"matriz","tareas":"Trabajo con condiciones térmicas o de ruido ambiental molestas.","epi":"","nota":"","puestos":["Limpieza","Auxiliar de cocina","Mantenimiento"],"condiciones":[{"r":"R34","riesgo":"Disconfort ambiental","condicion":"Ambiente sonoro","P":"M","C":"D","VR":"MO","medidas":[{"t":"Informar sobre los riesgos y medidas preventivas frente al disconfort acústico.","id":"R34-M02","u":1}],"np":1},{"r":"R34","riesgo":"Disconfort ambiental","condicion":"Condiciones térmicas","P":"M","C":"D","VR":"MO","medidas":[{"t":"Informar sobre los riesgos y medidas preventivas del disconfort térmico.","id":"R34-M01","u":1}],"np":1}]},{"id":"A35","nombre":"Condiciones climatológicas adversas","categoria":"Instalaciones y seguridad general","estado":"matriz","tareas":"Exposición a condiciones climatológicas adversas en desplazamientos y trabajos al exterior.","epi":"","nota":"","puestos":["Médico/a","Psiquiatra","Enfermero/a","Psicólogo/a","Farmacéutico/a","Fisioterapeuta","Terapeuta ocupacional","Trabajador/a social","Educador/a social","TASOC / Animador/a sociocultural","Profesor/a","Auxiliar de Enfermería","Gerocultor/a","Celador/a","Monitor/a","Limpieza","Personal de lavandería","Cocinero/a","Auxiliar de cocina","Mantenimiento","Personal de administración","Recepcionista","Coordinador/a","Director/a"],"condiciones":[{"r":"R24","riesgo":"Condiciones climatológicas adversas","condicion":"Exposición a condiciones climatológicas adversas durante desplazamientos, accesos, salidas o trabajos en el exterior, incluyendo lluvia, viento, calor, frío, nieve u otras situaciones meteorológicas adversas.","P":"B","C":"D","VR":"TO","medidas":[{"t":"Formación e información sobre el protocolo de actuación frente a condiciones climatológicas adversas.","id":"R24-M02","u":1}],"np":1}]},{"id":"A36","nombre":"Desplazamientos in itinere","categoria":"Desplazamientos","estado":"matriz","tareas":"Trayecto entre el domicilio y el centro de trabajo.","epi":"","nota":"","puestos":["Médico/a","Psiquiatra","Enfermero/a","Psicólogo/a","Farmacéutico/a","Fisioterapeuta","Terapeuta ocupacional","Trabajador/a social","Educador/a social","TASOC / Animador/a sociocultural","Profesor/a","Auxiliar de Enfermería","Gerocultor/a","Celador/a","Monitor/a","Limpieza","Personal de lavandería","Cocinero/a","Auxiliar de cocina","Mantenimiento","Personal de administración","Recepcionista","Coordinador/a","Director/a"],"condiciones":[{"r":"R22","riesgo":"Accidentes de tráfico/desplazamiento","condicion":"Desplazamientos in itinere","P":"B","C":"ED","VR":"MO","medidas":[{"t":"Informar sobre seguridad en los desplazamientos para prevenir accidentes in itinere.","id":"R22-M02","u":14},{"t":"Informar a los trabajadores sobre la seguridad en los desplazamientos con el objeto de prevenir accidentes in-itinere. Dejar constancia documental de su entrega.","id":"R22-M07","u":3},{"t":"Formar sobre seguridad en los desplazamientos para prevenir accidentes in itinere.","id":"R22-M01","u":1}],"np":15}]},{"id":"A37","nombre":"Desplazamientos en misión","categoria":"Desplazamientos","estado":"matriz","tareas":"Desplazamientos durante la jornada fuera del centro, a pie, en transporte público o en vehículo: excursiones, gestiones y acompañamientos.","epi":"","nota":"","puestos":["TASOC / Animador/a sociocultural","Profesor/a","Auxiliar de Enfermería","Gerocultor/a","Monitor/a","Personal de administración","Recepcionista","Coordinador/a","Director/a"],"condiciones":[{"r":"R22","riesgo":"Accidentes de tráfico/desplazamiento","condicion":"Desplazamientos en misión a pie o transporte público","P":"B","C":"ED","VR":"MO","medidas":[{"t":"Informar sobre riesgos y medidas preventivas en desplazamientos fuera del centro a pie o en transporte público.","id":"R22-M04","u":3},{"t":"Informar sobre los riesgos y medidas preventivas a adoptar en los desplazamientos fuera del centro de trabajo a pie y/o en transporte público.","id":"R22-M03","u":2},{"t":"Informar sobre riesgos y medidas preventivas en desplazamientos fuera del centro en vehículo.","id":"R22-M05","u":2}],"np":5},{"r":"R22","riesgo":"Accidentes de tráfico/desplazamiento","condicion":"In misión","P":"B","C":"ED","VR":"MO","medidas":[{"t":"Informar sobre los riesgos y medidas preventivas a adoptar en los desplazamientos fuera del centro de trabajo en vehículo. Dejar constancia documental de su entrega.","id":"R22-M09","u":1}],"np":1}]}];
