export const USERS = [
  {
    id: 1,
    name: "Carlos Centro",
    email: "centro@empresa.com",
    role: "Centro",
    centerId: "C1",
    zoneId: "Z1",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
  },
  {
    id: 2,
    name: "Elena Zona",
    email: "zona@empresa.com",
    role: "Zona",
    centerId: null,
    zoneId: "Z1",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
  },
  {
    id: 3,
    name: "Administrador Global",
    email: "admin@empresa.com",
    role: "Global",
    centerId: null,
    zoneId: null,
    isSuperAdmin: true,
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150"
  }
];

export const INITIAL_MENU_ITEMS = [
  { id: 'evaluacion-riesgos', label: 'Evaluación de riesgo', icon: 'ShieldAlert' },
  { id: 'actividad-correctiva', label: 'Planificación de actividad correctiva', icon: 'ClipboardCheck' },
  { id: 'informacion-riesgo', label: 'Información de riesgo', icon: 'Info' },
  { id: 'medidas-emergencia', label: 'Medidas de emergencia', icon: 'Flame' },
  { id: 'equipos-trabajo', label: 'Equipos de trabajo', icon: 'Wrench' },
  { id: 'epis', label: 'EPIs que tengo que disponer en el centro', icon: 'HardHat' },
  { id: 'protocolos-prl', label: 'Protocolos de prevención de riesgos', icon: 'FileText' },
  { id: 'cae', label: 'Coordinación de actividades empresariales', icon: 'Users' },
  { id: 'formacion', label: 'Formación', icon: 'GraduationCap' },
  { id: 'otros', label: 'Otros aspectos a tener en cuenta', icon: 'MoreHorizontal' },
];

export const DOCUMENTS = [
  {
    id: 101,
    title: "Plan de Evacuación Centro Madrid-1",
    category: "medidas-emergencia",
    centerId: "C1",
    zoneId: "Z1",
    centerName: "Centro Madrid Norte (C1)",
    zoneName: "Zona Centro (Z1)",
    date: "2026-01-15",
    content: "DOCUMENTO DE SEGURIDAD ESTRICTA:\n\n1. En caso de emergencia, mantener la calma.\n2. Evacuar por la puerta Norte del edificio C1.\n3. Punto de encuentro: Parking exterior A."
  },
  {
    id: 102,
    title: "Evaluación Caídas e Incendios C1",
    category: "evaluacion-riesgos",
    centerId: "C1",
    zoneId: "Z1",
    centerName: "Centro Madrid Norte (C1)",
    zoneName: "Zona Centro (Z1)",
    date: "2026-02-01",
    content: "REPORTE DE EVALUACIÓN C1:\n- Riesgo de resbalón en planta baja: Medio.\n- Extintores revisados: Sí.\n- Salidas de emergencia despejadas: Sí."
  },
  {
    id: 103,
    title: "Protocolo de EPIs Centro Madrid-2",
    category: "epis",
    centerId: "C2",
    zoneId: "Z1",
    centerName: "Centro Madrid Sur (C2)",
    zoneName: "Zona Centro (Z1)",
    date: "2026-02-10",
    content: "INVENTARIO EPIs C2:\n- Cascos de protección: 50 ud.\n- Guantes dieléctricos: 20 pares.\n- Calzado de seguridad: Obligatorio en zona de carga."
  },
  {
    id: 104,
    title: "Plan Emergencias Zona Norte (Z2)",
    category: "medidas-emergencia",
    centerId: "C3",
    zoneId: "Z2",
    centerName: "Centro Bilbao (C3)",
    zoneName: "Zona Norte (Z2)",
    date: "2026-03-01",
    content: "REGISTRO ZONA NORTE Z2:\n- Documentación reservada para administración de zona y global."
  }
];
