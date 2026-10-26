export const BUSINESS_INFO = {
  name: 'Refrimathy',
  tagline: 'Servicio técnico · Bogotá',
  phoneDisplay: '311 295 5131',
  phoneHref: 'tel:+573112955131',
  whatsappNumber: '573112955131',
  whatsappBase: 'https://wa.me/573112955131?text=',
  email: 'coordinacion.refrimathy@gmail.com',
  city: 'Bogotá D.C., Colombia',
  schedule: 'Lunes a Sábado: 7:00 a.m. – 7:00 p.m. · Domingos: Urgencias previa coordinación',
  experienceYears: 7,
  url: 'https://refrimathy.netlify.app/'
};

export function buildWhatsAppUrl(message) {
  return `${BUSINESS_INFO.whatsappBase}${encodeURIComponent(message)}`;
}

export const BRANDS = [
  'Whirlpool',
  'Mabe',
  'Haceb',
  'LG',
  'Samsung',
  'Electrolux',
  'Challenger',
  'Bosch',
  'Panasonic',
  'Frigidaire',
  'Centrales',
  'Kalley'
];

export const SERVICES = [
  {
    id: 'neveras',
    name: 'Neveras',
    category: 'hogar',
    badge: 'Alta demanda',
    desc: 'Revisión, mantenimiento y reparación de neveras convencionales, No Frost y nevecones para que tus alimentos se mantengan siempre frescos.',
    highlights: ['No enfría o congela de más', 'Fugas de agua o ruidos', 'Cambio de compresor, sensores y tarjetas'],
    waText: 'Hola, necesito servicio técnico para una nevera en Bogotá.',
    iconPaths: '<path d="M6 2h12v20H6zM6 10h12M9 5v2M9 13v3"/>',
    featured: false
  },
  {
    id: 'lavadoras',
    name: 'Lavadoras',
    category: 'hogar',
    badge: 'Carga frontal y superior',
    desc: 'Atención técnica especializada para fallas de centrifugado, drenaje, códigos de error y mantenimiento preventivo de lavadoras y secadoras.',
    highlights: ['No centrifuga ni desagua', 'Ruidos fuertes o vibración', 'Mantenimiento general de tambor y bombas'],
    waText: 'Hola, necesito servicio técnico para una lavadora en Bogotá.',
    iconPaths: '<rect x="4" y="2" width="16" height="20" rx="3"/><circle cx="12" cy="13" r="5"/><path d="M7 6h2"/>',
    featured: false
  },
  {
    id: 'estufas',
    name: 'Estufas',
    category: 'cocina',
    badge: 'Gas y eléctricas',
    desc: 'Servicio técnico seguro para revisar, destapar, calibrar y reparar estufas, cubiertas empotrables y hornos domésticos o comerciales.',
    highlights: ['Quemadores con llama amarilla o baja', 'Falla en encendido eléctrico', 'Ajuste de válvulas y termocuplas'],
    waText: 'Hola, necesito servicio técnico para una estufa en Bogotá.',
    iconPaths: '<rect x="3" y="9" width="18" height="12" rx="2"/><path d="M7 5c0-2 2-2 2-4M12 5c0-2 2-2 2-4M16 5c0-2 2-2 2-4M3 15h18"/>',
    featured: false
  },
  {
    id: 'calentadores',
    name: 'Calentadores',
    category: 'cocina',
    badge: 'Paso y acumulación',
    desc: 'Diagnóstico y mantenimiento de calentadores de agua a gas y eléctricos. Cuéntanos la marca y la falla para enviarte al especialista indicado.',
    highlights: ['No enciende o se apaga solo', 'Mantenimiento preventivo anual', 'Revisión de sensores, diafragma y ductos'],
    waText: 'Hola, necesito servicio técnico para un calentador en Bogotá.',
    iconPaths: '<path d="M12 2c3 4 6 6 6 10a6 6 0 01-12 0c0-2 1-4 3-6 0 2 1 3 2 3 0-3 0-5 1-7z"/>',
    featured: false
  },
  {
    id: 'aire-acondicionado',
    name: 'Aire acondicionado',
    category: 'climatizacion',
    badge: 'Hogar y oficina',
    desc: 'Mantenimiento preventivo, carga de refrigerante, limpieza profunda y reparación para mantener tus espacios frescos y saludables.',
    highlights: ['Limpieza de filtros y serpentines', 'Bajo rendimiento de enfriamiento', 'Corrección de goteos y recarga de gas'],
    waText: 'Hola, necesito servicio de aire acondicionado en Bogotá.',
    iconPaths: '<rect x="2" y="4" width="20" height="8" rx="2"/><path d="M6 16l-1 4M12 16v4M18 16l1 4"/>',
    featured: false
  },
  {
    id: 'refrigeracion-comercial',
    name: 'Refrigeración comercial',
    category: 'climatizacion',
    badge: 'Prioridad negocios',
    desc: 'Soluciones ágiles para comercios, restaurantes, supermercados y locales con vitrinas, enfriadores y neveras industriales.',
    highlights: ['Vitrinas exhibidoras y congeladores', 'Cuartos fríos y mesas refrigeradas', 'Atención prioritaria para evitar pérdidas'],
    waText: 'Hola, tengo un negocio en Bogotá y quiero asesoría de refrigeración comercial.',
    iconPaths: '<path d="M12 2v20M4 7l16 10M20 7L4 17"/>',
    featured: true
  }
];

export const ABOUT_DATA = {
  kicker: 'Quiénes Somos',
  title: 'Más que técnicos: somos aliados del bienestar de tu hogar y negocio en Bogotá.',
  lead: 'En Refrimathy nacimos hace más de 7 años en Bogotá D.C. con un propósito claro: transformar el servicio técnico a domicilio en una experiencia honesta, puntual y libre de sorpresas.',
  storyParagraphs: [
    'Sabemos lo estresante que resulta cuando una nevera deja de enfriar o una lavadora falla a mitad de semana. Por eso formamos un equipo de técnicos propios, uniformados e identificados que llegan directamente a tu domicilio con las herramientas de diagnóstico adecuadas.',
    'Nuestra regla de oro es la transparencia: primero revisamos tu equipo a fondo, te explicamos con palabras sencillas cuál es la causa exacta de la falla y te entregamos el presupuesto detallado antes de tocar cualquier pieza. Tú siempre tienes la última palabra.'
  ],
  stats: [
    { value: '7+', label: 'Años de trayectoria', sub: 'Atendiendo en Bogotá D.C.' },
    { value: '+3.500', label: 'Equipos atendidos', sub: 'Hogares, locales y comercios' },
    { value: '19', label: 'Localidades cubiertas', sub: 'Servicio 100% a domicilio' },
    { value: '100%', label: 'Garantía respaldada', sub: 'Aprobación previa del cliente' }
  ],
  mission: {
    title: 'Nuestra Misión',
    text: 'Brindar soluciones técnicas a domicilio rápidas, transparentes y duraderas para electrodomésticos del hogar y equipos de refrigeración comercial en Bogotá, protegiendo la inversión y tranquilidad de cada familia y comerciante.'
  },
  vision: {
    title: 'Nuestro Compromiso y Visión',
    text: 'Consolidarnos como el servicio técnico de mayor confianza en Bogotá D.C., reconocido por su ética profesional, diagnóstico certero desde la primera visita y atención humana cercana.'
  },
  values: [
    {
      icon: '🔍',
      title: 'Diagnóstico Honesto',
      desc: 'Evaluamos frente a ti y explicamos el origen real de la falla sin inventar repuestos innecesarios.'
    },
    {
      icon: '🛡️',
      title: 'Respaldo y Garantía',
      desc: 'Cada intervención cuenta con soporte post-servicio y repuestos de calidad comprobada para todas las marcas.'
    },
    {
      icon: '⏱️',
      title: 'Puntualidad Bogotana',
      desc: 'Coordinamos franjas horarias reales según tu localidad y te avisamos cuando el técnico va en camino.'
    },
    {
      icon: '🤝',
      title: 'Trato Humano y Respetuoso',
      desc: 'Técnicos uniformados que cuidan el orden y la limpieza de tu cocina, zona de ropas o negocio.'
    }
  ]
};

export const WORK_GALLERY = [
  {
    src: 'https://images.pexels.com/photos/32391499/pexels-photo-32391499/free-photo-of-repair-technicians-fixing-industrial-freezer.jpeg?auto=compress&cs=tinysrgb&w=1400',
    alt: 'Profesionales realizando una reparación de refrigeración',
    pos: '30% 40%',
    title: 'Neveras y refrigeración',
    subtitle: 'Hogar y negocio · Diagnóstico térmico'
  },
  {
    src: 'https://images.pexels.com/photos/33671149/pexels-photo-33671149/free-photo-of-air-conditioner-repair-technician-in-workshop.jpeg?auto=compress&cs=tinysrgb&w=1400',
    alt: 'Profesional trabajando en un equipo de aire acondicionado',
    pos: '40% 30%',
    title: 'Aire acondicionado y lavado',
    subtitle: 'Mantenimiento preventivo y correctivo'
  },
  {
    src: 'https://images.pexels.com/photos/37340084/pexels-photo-37340084/free-photo-of-technician-repairing-electrical-equipment.jpeg?auto=compress&cs=tinysrgb&w=1400',
    alt: 'Profesional revisando un equipo eléctrico del hogar',
    pos: '88% 50%',
    title: 'Calentadores y estufas',
    subtitle: 'Revisión electrónica, gas y ajuste seguro'
  }
];

export const PROCESS_STEPS = [
  {
    num: 1,
    title: 'Nos escribes',
    desc: 'Cuéntanos equipo, marca, falla y barrio por WhatsApp o en el formulario de contacto.'
  },
  {
    num: 2,
    title: 'Coordinamos',
    desc: 'Confirmamos cobertura en tu localidad, horario disponible y valor claro de la visita técnica.'
  },
  {
    num: 3,
    title: 'Lo revisamos',
    desc: 'Un técnico uniformado evalúa el equipo en tu domicilio y te explica con claridad qué encontró.'
  },
  {
    num: 4,
    title: 'Tú decides',
    desc: 'Conoces el presupuesto exacto y las opciones antes de autorizar cualquier reparación.'
  }
];

export const WHY_POINTS = [
  { title: 'Diagnóstico claro', desc: 'Te decimos qué falla y por qué antes de intervenir.' },
  { title: 'Tú autorizas', desc: 'Nada se repara sin tu visto bueno previo.' },
  { title: 'A domicilio', desc: 'Vamos hasta tu apartamento, casa o local comercial.' },
  { title: 'Hogar y negocio', desc: 'Desde electrodomésticos familiares hasta neveras industriales.' }
];

export const BOGOTA_LOCALIDADES = [
  { name: 'Usaquén', zone: 'Norte' },
  { name: 'Chapinero', zone: 'Centro / Norte' },
  { name: 'Suba', zone: 'Norte / Noroccidente' },
  { name: 'Engativá', zone: 'Occidente' },
  { name: 'Fontibón', zone: 'Occidente' },
  { name: 'Teusaquillo', zone: 'Centro' },
  { name: 'Kennedy', zone: 'Suroccidente' },
  { name: 'Bosa', zone: 'Sur' },
  { name: 'Barrios Unidos', zone: 'Norte / Centro' },
  { name: 'Puente Aranda', zone: 'Centro / Occidente' },
  { name: 'Rafael Uribe', zone: 'Sur' },
  { name: 'Tunjuelito', zone: 'Sur' },
  { name: 'Ciudad Bolívar', zone: 'Sur' },
  { name: 'La Candelaria', zone: 'Centro' },
  { name: 'Cedritos', zone: 'Norte' },
  { name: 'Modelia / Hayuelos', zone: 'Occidente' },
  { name: 'Salitre / Colina', zone: 'Noroccidente' },
  { name: 'Antonio Nariño', zone: 'Sur / Centro' },
  { name: 'Y más zonas de Bogotá', zone: 'Cobertura Total' }
];

export const FAQS = [
  {
    q: '¿Atienden en toda Bogotá?',
    a: 'Sí, prestamos servicio técnico 100% a domicilio en toda Bogotá D.C. Escríbenos tu barrio o localidad y confirmamos disponibilidad de técnico para hoy o mañana.'
  },
  {
    q: '¿Cuánto cuesta una visita técnica?',
    a: 'El valor de la revisión depende de la ubicación y del tipo de equipo (doméstico o comercial). Siempre te lo confirmamos con total transparencia al coordinar, antes de agendar.'
  },
  {
    q: '¿Qué debo enviar para pedir servicio?',
    a: 'Solo necesitamos saber el tipo de equipo, la marca, una breve descripción de la falla y tu barrio en Bogotá. Si puedes enviarnos una foto o video corto por WhatsApp, ayuda muchísimo.'
  },
  {
    q: '¿Reparan sin explicarme antes?',
    a: 'Jamás. Nuestro protocolo exige que el técnico revise primero, te explique el diagnóstico y el costo total, y únicamente proceda si tú lo autorizas.'
  },
  {
    q: '¿Reparan neveras y equipos de negocios?',
    a: 'Sí. Contamos con especialistas en refrigeración comercial, vitrinas exhibidoras, congeladores y neveras industriales además de toda la línea blanca del hogar.'
  },
  {
    q: '¿Qué garantía tienen las reparaciones?',
    a: 'Todos nuestros trabajos autorizados cuentan con garantía técnica respaldada directamente por Refrimathy. Te entregamos soporte claro sobre la intervención realizada.'
  }
];

export const PRIVACY_CLAUSES = [
  {
    id: 'responsable',
    title: '1. Identificación del Responsable del Tratamiento',
    content: [
      'En cumplimiento de la Ley Estatutaria 1581 de 2012 ("Por la cual se dictan disposiciones generales para la protección de datos personales") y el Decreto Reglamentario 1377 de 2013 de la República de Colombia, se informa que el responsable del tratamiento de los datos personales recolectados a través de este portal web y sus canales de atención es REFRIMATHY — Servicio Técnico a Domicilio.',
      'Domicilio principal: Bogotá D.C., Colombia. Correo electrónico oficial de contacto y Protección de Datos: coordinacion.refrimathy@gmail.com. Línea de atención telefónica y WhatsApp: +57 311 295 5131.'
    ]
  },
  {
    id: 'datos-recolectados',
    title: '2. Datos Personales Recolectados',
    content: [
      'Refrimathy recolecta únicamente los datos estrictamente necesarios para la coordinación, diagnóstico y prestación de servicios técnicos a domicilio, así como para el funcionamiento estadístico de su plataforma digital:',
      '• Datos de identificación y contacto suministrados voluntariamente: Nombre, número de teléfono celular/fijo, dirección de domicilio o local comercial en Bogotá D.C., barrio/localidad y correo electrónico.',
      '• Información técnica del servicio: Tipo de electrodoméstico o equipo comercial, marca, modelo y descripción de la falla.',
      '• Datos técnicos de navegación y analítica anónima: Tipo de dispositivo (celular, computador, tablet), sistema operativo, navegador, secciones visitadas dentro del sitio web, tiempo de permanencia e interacciones con botones de contacto.'
    ]
  },
  {
    id: 'finalidades',
    title: '3. Finalidad del Tratamiento de los Datos',
    content: [
      'Los datos personales autorizados por el Titular serán utilizados exclusivamente para las siguientes finalidades legítimas:',
      '• Coordinar, programar y ejecutar visitas técnicas a domicilio en Bogotá D.C.',
      '• Elaborar diagnósticos técnicos, cotizaciones, órdenes de servicio y gestionar garantías post-servicio.',
      '• Contactar al cliente vía WhatsApp, llamada telefónica o correo electrónico para confirmar horarios de llegada del técnico y seguimiento de satisfacción.',
      '• Analizar estadísticas internas de uso del sitio web (secciones más consultadas, equipos más solicitados y localidades con mayor demanda) para optimizar la disponibilidad de técnicos.'
    ]
  },
  {
    id: 'derechos-titular',
    title: '4. Derechos de los Titulares (Habeas Data / Derechos ARCO)',
    content: [
      'De conformidad con el artículo 8 de la Ley 1581 de 2012, el Titular de los datos personales tiene los siguientes derechos:',
      '• Conocer, actualizar y rectificar sus datos personales frente a Refrimathy.',
      '• Solicitar prueba de la autorización otorgada para el tratamiento de sus datos.',
      '• Ser informado, previa solicitud, respecto del uso que se le ha dado a sus datos personales.',
      '• Revocar la autorización y/o solicitar la supresión del dato cuando en el tratamiento no se respeten los principios, derechos y garantías constitucionales y legales.',
      '• Acceder en forma gratuita a sus datos personales que hayan sido objeto de tratamiento.'
    ]
  },
  {
    id: 'seguridad-confidencialidad',
    title: '5. Seguridad, Confidencialidad y No Comercialización',
    content: [
      'Refrimathy garantiza que la información suministrada por nuestros clientes es tratada bajo estrictas medidas de confidencialidad y seguridad técnica. Bajo ninguna circunstancia vendemos, alquilamos ni cedemos bases de datos de clientes a terceros con fines publicitarios o comerciales ajenos al servicio técnico solicitado.',
      'Los técnicos asignados reciben únicamente los datos indispensables (nombre, dirección y falla del equipo) para acudir puntualmente a la visita programada.'
    ]
  },
  {
    id: 'procedimiento-consultas',
    title: '6. Procedimiento para Ejercer sus Derechos y Vigencia',
    content: [
      'Para ejercer sus derechos de consulta, actualización, rectificación o supresión de datos, el Titular puede enviar una solicitud gratuita al correo electrónico coordinacion.refrimathy@gmail.com o escribir a la línea WhatsApp +57 311 295 5131 indicando su nombre completo y petición.',
      'Las consultas serán atendidas en un término máximo de diez (10) días hábiles y los reclamos en un máximo de quince (15) días hábiles conforme a la legislación colombiana vigente. La presente política rige a partir de su publicación y actualización en octubre de 2026.'
    ]
  }
];

export const COOKIE_TABLE = [
  {
    name: 'refrimathy_cookie_consent_v1',
    type: 'Técnica / Necesaria',
    duration: '12 meses',
    purpose: 'Guarda las preferencias de consentimiento de cookies elegidas por el usuario para no mostrar el aviso en cada recarga.'
  },
  {
    name: 'refrimathy_visitor_id_v1',
    type: 'Analítica Propia',
    duration: '12 meses',
    purpose: 'Identificador anónimo autogenerado para distinguir entre visitantes nuevos y recurrentes sin almacenar datos personales.'
  },
  {
    name: 'refrimathy_db_sessions_v1',
    type: 'Analítica y Rendimiento',
    duration: 'Persistente local',
    purpose: 'Registra métricas agregadas de la sesión (secciones vistas, duración y porcentaje de lectura) para el Dashboard de calidad.'
  },
  {
    name: 'refrimathy_db_events_v1',
    type: 'Analítica e Interacción',
    duration: 'Persistente local',
    purpose: 'Registra clics en tarjetas de servicios, barrios de Bogotá y preguntas frecuentes para mejorar la oferta técnica.'
  },
  {
    name: 'refrimathy_live_visitors_v1',
    type: 'Funcional / Tiempo Real',
    duration: 'Sesión (45 seg)',
    purpose: 'Permite sincronizar el estado activo de la pestaña con el monitor en tiempo real del Dashboard.'
  }
];
