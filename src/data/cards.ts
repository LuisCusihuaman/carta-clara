export type Arcana = 'major' | 'minor'
export type Suit = 'cups' | 'swords' | 'wands' | 'pentacles'

export type TarotCard = {
  id: string
  nameEs: string
  nameEn: string
  shortName: string
  arcana: Arcana
  number?: number
  roman?: string
  suit?: Suit
  suitEs?: string
  suitEn?: string
  rank?: string
  rankEs?: string
  rankEn?: string
  aliases: string[]
  keywordsUpright: string[]
  keywordsReversed: string[]
  oneLineUpright: string
  oneLineReversed: string
  quickUpright: string
  quickReversed: string
  loveUpright: string
  loveReversed: string
  workUpright: string
  workReversed: string
  moneyUpright: string
  moneyReversed: string
  adviceUpright: string
  adviceReversed: string
  yesNo: string
  relatedCards: string[]
  popularityRank: number
  accent: string
  glyph: string
}

type MajorSeed = {
  id: string
  nameEs: string
  nameEn: string
  keywords: string[]
  reversed: string[]
  oneLine: string
  reversedLine: string
  quick: string
  aliases?: string[]
  related?: string[]
  accent?: string
  glyph?: string
}

const romans = [
  '0',
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
  'XIII',
  'XIV',
  'XV',
  'XVI',
  'XVII',
  'XVIII',
  'XIX',
  'XX',
  'XXI',
]

const majorSeeds: MajorSeed[] = [
  {
    id: 'the_fool',
    nameEs: 'El Loco',
    nameEn: 'The Fool',
    keywords: ['comienzo', 'libertad', 'salto', 'confianza'],
    reversed: ['impulso', 'riesgo', 'ingenuidad', 'freno'],
    oneLine: 'Algo empieza: conviene avanzar liviana, pero sin ignorar señales obvias.',
    reversedLine: 'Hay ganas de saltar, pero falta mirar mejor el suelo.',
    quick: 'El Loco habla de inicio, apertura y confianza. No pide tener todo resuelto: pide moverse con curiosidad y cuidar los riesgos simples.',
    aliases: ['fool', '0', 'arcano 0'],
    related: ['the_magician', 'the_world', 'page_of_wands'],
    accent: '#e7c86a',
    glyph: '0',
  },
  {
    id: 'the_magician',
    nameEs: 'El Mago',
    nameEn: 'The Magician',
    keywords: ['accion', 'voluntad', 'recursos', 'manifestacion'],
    reversed: ['bloqueo', 'manipulacion', 'duda', 'dispersión'],
    oneLine: 'Tenés herramientas: la clave es enfocar intención y actuar.',
    reversedLine: 'La energía está dispersa o se usa sin claridad.',
    quick: 'El Mago aparece cuando ya hay recursos disponibles. La pregunta no es si podés, sino si estás enfocando bien tu energía.',
    related: ['the_fool', 'the_emperor', 'ace_of_wands'],
    accent: '#d85858',
    glyph: 'I',
  },
  {
    id: 'the_high_priestess',
    nameEs: 'La Sacerdotisa',
    nameEn: 'The High Priestess',
    keywords: ['intuicion', 'silencio', 'misterio', 'sabiduria'],
    reversed: ['secreto', 'desconexion', 'ruido', 'confusion'],
    oneLine: 'No todo necesita respuesta inmediata: escuchá lo que intuís.',
    reversedLine: 'Puede haber señales ignoradas o demasiada interferencia mental.',
    quick: 'La Sacerdotisa trae una pausa sabia. Invita a observar, escuchar y no revelar todo antes de tiempo.',
    related: ['the_moon', 'the_hermit', 'queen_of_cups'],
    accent: '#8e7cff',
    glyph: 'II',
  },
  {
    id: 'the_empress',
    nameEs: 'La Emperatriz',
    nameEn: 'The Empress',
    keywords: ['cuidado', 'abundancia', 'creacion', 'placer'],
    reversed: ['desgaste', 'bloqueo creativo', 'dependencia', 'descuido'],
    oneLine: 'Algo crece cuando recibe cuidado, tiempo y presencia.',
    reversedLine: 'Hay cansancio o una necesidad de volver a cuidarte.',
    quick: 'La Emperatriz habla de nutrición, cuerpo, belleza y creación. Algo fértil puede crecer si se lo acompaña con paciencia.',
    aliases: ['empress', 'empratriz', 'emperatris', '3', 'iii'],
    related: ['the_lovers', 'queen_of_pentacles', 'ace_of_cups'],
    accent: '#d89d6a',
    glyph: 'III',
  },
  {
    id: 'the_emperor',
    nameEs: 'El Emperador',
    nameEn: 'The Emperor',
    keywords: ['orden', 'limites', 'autoridad', 'estructura'],
    reversed: ['rigidez', 'control', 'desorden', 'terquedad'],
    oneLine: 'Hace falta estructura: límites claros y decisiones firmes.',
    reversedLine: 'El control puede estar apretando demasiado o faltando por completo.',
    quick: 'El Emperador organiza. Trae límites, dirección y responsabilidad para que algo se sostenga en el tiempo.',
    related: ['the_empress', 'justice', 'king_of_wands'],
    accent: '#c87545',
    glyph: 'IV',
  },
  {
    id: 'the_hierophant',
    nameEs: 'El Hierofante',
    nameEn: 'The Hierophant',
    keywords: ['guia', 'tradicion', 'aprendizaje', 'valores'],
    reversed: ['rebeldia', 'dogma', 'presion', 'cuestionamiento'],
    oneLine: 'Buscá guía, método o una regla que ayude a ordenar.',
    reversedLine: 'Tal vez una regla vieja ya no te sirve como antes.',
    quick: 'El Hierofante habla de aprendizaje, valores y marcos compartidos. Puede señalar maestros, acuerdos o tradición.',
    aliases: ['papa', 'sumo sacerdote', 'hierophant'],
    related: ['justice', 'the_hermit', 'three_of_pentacles'],
    accent: '#cfa65a',
    glyph: 'V',
  },
  {
    id: 'the_lovers',
    nameEs: 'Los Enamorados',
    nameEn: 'The Lovers',
    keywords: ['amor', 'eleccion', 'vinculo', 'deseo'],
    reversed: ['duda', 'desalineacion', 'tentacion', 'conflicto'],
    oneLine: 'Hay una elección importante entre deseo, valores y vínculo.',
    reversedLine: 'Algo no está alineado entre lo que querés y lo que elegís.',
    quick: 'Los Enamorados no son solo romance: hablan de elegir con el corazón y con coherencia.',
    aliases: ['lovers', 'enamorados', 'the lovers'],
    related: ['the_empress', 'two_of_cups', 'justice'],
    accent: '#e87a9a',
    glyph: 'VI',
  },
  {
    id: 'the_chariot',
    nameEs: 'El Carro',
    nameEn: 'The Chariot',
    keywords: ['avance', 'control', 'direccion', 'victoria'],
    reversed: ['descontrol', 'bloqueo', 'prisa', 'desvio'],
    oneLine: 'Podés avanzar si sostenés dirección y no te dispersás.',
    reversedLine: 'Hay movimiento, pero falta control o destino claro.',
    quick: 'El Carro trae impulso y decisión. Sirve cuando necesitás tomar las riendas y avanzar con foco.',
    related: ['strength', 'six_of_wands', 'eight_of_wands'],
    accent: '#91b7ff',
    glyph: 'VII',
  },
  {
    id: 'strength',
    nameEs: 'La Fuerza',
    nameEn: 'Strength',
    keywords: ['coraje', 'calma', 'paciencia', 'autocontrol'],
    reversed: ['miedo', 'impaciencia', 'agotamiento', 'inseguridad'],
    oneLine: 'La fuerza real es calma: responder sin reaccionar de más.',
    reversedLine: 'Puede faltar confianza o sobrar presión interna.',
    quick: 'La Fuerza habla de dominio suave, valentía y paciencia. No se trata de imponer, sino de sostener.',
    aliases: ['fuerza', 'strength', '8', 'viii'],
    related: ['the_chariot', 'temperance', 'queen_of_wands'],
    accent: '#e8875a',
    glyph: 'VIII',
  },
  {
    id: 'the_hermit',
    nameEs: 'El Ermitaño',
    nameEn: 'The Hermit',
    keywords: ['pausa', 'introspeccion', 'busqueda', 'sabiduria'],
    reversed: ['aislamiento', 'soledad', 'evitacion', 'encierro'],
    oneLine: 'La respuesta aparece al bajar el ruido y mirar hacia adentro.',
    reversedLine: 'La pausa puede estar volviéndose aislamiento.',
    quick: 'El Ermitaño invita a retirarse un poco para ver mejor. No es castigo: es claridad desde el silencio.',
    related: ['the_high_priestess', 'the_hanged_man', 'four_of_swords'],
    accent: '#b9adc9',
    glyph: 'IX',
  },
  {
    id: 'wheel_of_fortune',
    nameEs: 'La Rueda de la Fortuna',
    nameEn: 'Wheel of Fortune',
    keywords: ['cambio', 'ciclo', 'giro', 'oportunidad'],
    reversed: ['resistencia', 'repeticion', 'demora', 'azar'],
    oneLine: 'El ciclo gira: algo cambia aunque no lo controles del todo.',
    reversedLine: 'Un patrón se repite hasta que se aprende la lección.',
    quick: 'La Rueda marca cambios de ciclo, suerte y movimiento. Conviene adaptarse rápido sin querer controlar todo.',
    aliases: ['rueda', 'fortuna', 'wheel', 'wheel fortune'],
    related: ['death', 'judgement', 'ten_of_wands'],
    accent: '#d8b46a',
    glyph: 'X',
  },
  {
    id: 'justice',
    nameEs: 'La Justicia',
    nameEn: 'Justice',
    keywords: ['verdad', 'equilibrio', 'decision', 'consecuencia'],
    reversed: ['injusticia', 'evasión', 'desequilibrio', 'sesgo'],
    oneLine: 'Mirar los hechos con honestidad trae una decisión más justa.',
    reversedLine: 'Puede haber evasión, sesgo o consecuencias pendientes.',
    quick: 'La Justicia pide objetividad. Muestra acuerdos, decisiones, verdad y consecuencias claras.',
    related: ['the_emperor', 'the_hierophant', 'queen_of_swords'],
    accent: '#8fb8ff',
    glyph: 'XI',
  },
  {
    id: 'the_hanged_man',
    nameEs: 'El Colgado',
    nameEn: 'The Hanged Man',
    keywords: ['pausa', 'perspectiva', 'rendicion', 'espera'],
    reversed: ['estancamiento', 'sacrificio inutil', 'resistencia', 'demora'],
    oneLine: 'No empujes: cambiar la mirada puede destrabar más que actuar.',
    reversedLine: 'La espera se vuelve pesada si no trae aprendizaje.',
    quick: 'El Colgado no castiga; frena para que veas distinto. A veces la respuesta llega cuando soltás el control.',
    related: ['the_moon', 'the_hermit', 'four_of_cups'],
    accent: '#8e7cff',
    glyph: 'XII',
  },
  {
    id: 'death',
    nameEs: 'La Muerte',
    nameEn: 'Death',
    keywords: ['cierre', 'cambio', 'transformacion', 'soltar'],
    reversed: ['resistencia', 'miedo al cambio', 'apego', 'estancamiento'],
    oneLine: 'Algo termina para que otra cosa pueda empezar.',
    reversedLine: 'Hay resistencia a cerrar una etapa que ya cumplió su ciclo.',
    quick: 'La Muerte suele hablar de transformación, no de muerte literal. Marca cierres necesarios y cambios profundos.',
    aliases: ['muerte', 'death', '13', 'xiii'],
    related: ['the_tower', 'wheel_of_fortune', 'ten_of_swords'],
    accent: '#d4d4d8',
    glyph: 'XIII',
  },
  {
    id: 'temperance',
    nameEs: 'La Templanza',
    nameEn: 'Temperance',
    keywords: ['equilibrio', 'paciencia', 'mezcla', 'armonía'],
    reversed: ['exceso', 'desbalance', 'apuro', 'tension'],
    oneLine: 'La respuesta está en mezclar bien, no en irte a extremos.',
    reversedLine: 'Algo perdió proporción: conviene bajar el ritmo.',
    quick: 'Templanza trae armonía, integración y paciencia. Es una carta de ajustes finos y sanación gradual.',
    related: ['strength', 'the_star', 'two_of_pentacles'],
    accent: '#91d6a3',
    glyph: 'XIV',
  },
  {
    id: 'the_devil',
    nameEs: 'El Diablo',
    nameEn: 'The Devil',
    keywords: ['apego', 'tentacion', 'patron', 'dependencia'],
    reversed: ['liberacion', 'conciencia', 'romper patrón', 'recuperar poder'],
    oneLine: 'Hay un patrón fuerte: verlo claro ya empieza a aflojarlo.',
    reversedLine: 'Podés recuperar poder soltando una dependencia.',
    quick: 'El Diablo muestra apegos, deseos o hábitos que atan. No condena: señala dónde recuperar libertad.',
    related: ['death', 'the_tower', 'seven_of_cups'],
    accent: '#e87a7a',
    glyph: 'XV',
  },
  {
    id: 'the_tower',
    nameEs: 'La Torre',
    nameEn: 'The Tower',
    keywords: ['ruptura', 'revelacion', 'crisis', 'cambio brusco'],
    reversed: ['crisis evitada', 'resistencia', 'miedo', 'tension acumulada'],
    oneLine: 'Algo se rompe para mostrar una verdad que ya no se podía tapar.',
    reversedLine: 'Puede haber resistencia a un cambio necesario o crisis que se evita por poco.',
    quick: 'La Torre trae revelaciones rápidas. Puede incomodar, pero suele sacar a la luz lo que ya estaba inestable.',
    related: ['death', 'the_devil', 'the_star'],
    accent: '#ff8a5c',
    glyph: 'XVI',
  },
  {
    id: 'the_star',
    nameEs: 'La Estrella',
    nameEn: 'The Star',
    keywords: ['esperanza', 'sanacion', 'fe', 'calma'],
    reversed: ['desanimo', 'duda', 'cansancio', 'desconexion'],
    oneLine: 'Después del ruido, aparece una calma que ayuda a sanar.',
    reversedLine: 'La esperanza está baja, pero no desaparecida.',
    quick: 'La Estrella trae alivio, confianza y recuperación. Es una carta suave que invita a volver a creer.',
    related: ['temperance', 'the_tower', 'nine_of_cups'],
    accent: '#9dd7ff',
    glyph: 'XVII',
  },
  {
    id: 'the_moon',
    nameEs: 'La Luna',
    nameEn: 'The Moon',
    keywords: ['confusion', 'intuicion', 'suenos', 'cosas ocultas'],
    reversed: ['claridad', 'miedo liberado', 'verdad revelada', 'niebla'],
    oneLine: 'No todo está claro todavía: escuchá tu intuición.',
    reversedLine: 'La confusión empieza a despejarse.',
    quick: 'La Luna aparece cuando hay dudas, emociones mezcladas o información incompleta. No significa algo malo: significa mirar mejor.',
    aliases: ['luna', 'moon', 'the moon', 'arcano 18', 'xviii', '18', 'confusión', 'confusion'],
    related: ['the_high_priestess', 'seven_of_cups', 'the_hanged_man'],
    accent: '#8e7cff',
    glyph: 'XVIII',
  },
  {
    id: 'the_sun',
    nameEs: 'El Sol',
    nameEn: 'The Sun',
    keywords: ['claridad', 'alegria', 'energia', 'exito'],
    reversed: ['bloqueo', 'optimismo bajo', 'demora', 'agotamiento'],
    oneLine: 'Hay claridad, vitalidad y una señal bastante positiva.',
    reversedLine: 'La luz está, pero algo tapa o demora su expresión.',
    quick: 'El Sol ilumina. Habla de confianza, alegría, energía visible y resultados que se sienten claros.',
    related: ['the_star', 'the_world', 'six_of_wands'],
    accent: '#f2ca50',
    glyph: 'XIX',
  },
  {
    id: 'judgement',
    nameEs: 'El Juicio',
    nameEn: 'Judgement',
    keywords: ['despertar', 'llamado', 'revision', 'renacer'],
    reversed: ['culpa', 'negacion', 'miedo al cambio', 'autojuicio'],
    oneLine: 'Algo pide revisión honesta para poder renacer.',
    reversedLine: 'El juicio interno puede estar pesando más que la verdad.',
    quick: 'El Juicio trae llamados, cierres de ciclo y segundas oportunidades desde una mirada más consciente.',
    related: ['death', 'the_world', 'justice'],
    accent: '#dcb8ff',
    glyph: 'XX',
  },
  {
    id: 'the_world',
    nameEs: 'El Mundo',
    nameEn: 'The World',
    keywords: ['cierre', 'logro', 'integracion', 'plenitud'],
    reversed: ['pendiente', 'cierre incompleto', 'demora', 'fragmentacion'],
    oneLine: 'Un ciclo se completa: integrá lo aprendido antes de seguir.',
    reversedLine: 'Falta cerrar un detalle para sentir final real.',
    quick: 'El Mundo marca culminación, logro e integración. Algo llega a una forma completa.',
    related: ['the_fool', 'judgement', 'ten_of_pentacles'],
    accent: '#91d6a3',
    glyph: 'XXI',
  },
]

const suitMeta: Record<
  Suit,
  {
    es: string
    en: string
    context: string
    upright: string
    reversed: string
    keywords: string[]
    accent: string
    glyph: string
  }
> = {
  cups: {
    es: 'Copas',
    en: 'Cups',
    context: 'emociones, vínculos e intuición',
    upright: 'lo emocional encuentra una forma más clara',
    reversed: 'conviene ordenar lo que se siente antes de actuar',
    keywords: ['amor', 'emociones', 'vinculo', 'intuicion'],
    accent: '#74b9ff',
    glyph: 'C',
  },
  swords: {
    es: 'Espadas',
    en: 'Swords',
    context: 'mente, verdad y decisiones',
    upright: 'la verdad pide ser vista con honestidad',
    reversed: 'la mente puede estar agregando ruido o miedo',
    keywords: ['mente', 'verdad', 'decision', 'conflicto'],
    accent: '#a8b9ff',
    glyph: 'S',
  },
  wands: {
    es: 'Bastos',
    en: 'Wands',
    context: 'energía, deseo y movimiento',
    upright: 'la energía busca salida y dirección',
    reversed: 'hay impulso bloqueado o gasto de energía',
    keywords: ['accion', 'energia', 'creatividad', 'deseo'],
    accent: '#ff9f5a',
    glyph: 'B',
  },
  pentacles: {
    es: 'Oros',
    en: 'Pentacles',
    context: 'trabajo, dinero, cuerpo y estabilidad',
    upright: 'lo concreto necesita cuidado y constancia',
    reversed: 'puede haber desorden material o falta de base',
    keywords: ['trabajo', 'dinero', 'cuerpo', 'estabilidad'],
    accent: '#91d6a3',
    glyph: 'O',
  },
}

const rankSeeds = [
  {
    id: 'ace',
    es: 'As',
    en: 'Ace',
    n: 1,
    upright: 'Un inicio simple abre una posibilidad nueva',
    reversed: 'La oportunidad existe, pero todavía no termina de arrancar',
  },
  {
    id: 'two',
    es: 'Dos',
    en: 'Two',
    n: 2,
    upright: 'Hay equilibrio, elección o encuentro entre dos fuerzas',
    reversed: 'La balanza se mueve y pide una decisión más honesta',
  },
  {
    id: 'three',
    es: 'Tres',
    en: 'Three',
    n: 3,
    upright: 'Algo crece cuando se comparte o se reconoce',
    reversed: 'El crecimiento se traba por falta de claridad o apoyo',
  },
  {
    id: 'four',
    es: 'Cuatro',
    en: 'Four',
    n: 4,
    upright: 'Hace falta estabilidad, pausa o una base más firme',
    reversed: 'La seguridad puede volverse encierro o estancamiento',
  },
  {
    id: 'five',
    es: 'Cinco',
    en: 'Five',
    n: 5,
    upright: 'Hay tensión, cambio incómodo o aprendizaje por contraste',
    reversed: 'La tensión empieza a aflojar si no se alimenta más',
  },
  {
    id: 'six',
    es: 'Seis',
    en: 'Six',
    n: 6,
    upright: 'Aparece apoyo, recuperación o movimiento hacia algo mejor',
    reversed: 'Cuesta recibir ayuda o dejar atrás una dinámica vieja',
  },
  {
    id: 'seven',
    es: 'Siete',
    en: 'Seven',
    n: 7,
    upright: 'Conviene evaluar, elegir estrategia y no apurarse',
    reversed: 'Hay dudas, dispersión o cansancio de sostener la guardia',
  },
  {
    id: 'eight',
    es: 'Ocho',
    en: 'Eight',
    n: 8,
    upright: 'El movimiento se acelera y pide práctica o foco',
    reversed: 'El avance se demora por repetición, miedo o exceso de control',
  },
  {
    id: 'nine',
    es: 'Nueve',
    en: 'Nine',
    n: 9,
    upright: 'Hay culminación personal, aprendizaje y una señal fuerte',
    reversed: 'Algo pesa internamente aunque desde afuera parezca resuelto',
  },
  {
    id: 'ten',
    es: 'Diez',
    en: 'Ten',
    n: 10,
    upright: 'Un ciclo llega a su máximo y muestra su peso o recompensa',
    reversed: 'Es momento de soltar carga o cerrar sin seguir acumulando',
  },
  {
    id: 'page',
    es: 'Sota',
    en: 'Page',
    upright: 'Una señal nueva invita a aprender con curiosidad',
    reversed: 'La inmadurez o la distracción pueden confundir el mensaje',
  },
  {
    id: 'knight',
    es: 'Caballero',
    en: 'Knight',
    upright: 'La energía se pone en marcha y busca dirección',
    reversed: 'El impulso puede ir demasiado rápido o sin plan',
  },
  {
    id: 'queen',
    es: 'Reina',
    en: 'Queen',
    upright: 'Hay madurez, sensibilidad y capacidad de sostener',
    reversed: 'Puede haber exceso de entrega, control o cansancio emocional',
  },
  {
    id: 'king',
    es: 'Rey',
    en: 'King',
    upright: 'La situación pide dominio, criterio y liderazgo sereno',
    reversed: 'El liderazgo se vuelve rígido o evita hacerse cargo',
  },
]

function makeMajor(seed: MajorSeed, index: number): TarotCard {
  return {
    id: seed.id,
    nameEs: seed.nameEs,
    nameEn: seed.nameEn,
    shortName: seed.nameEs.replace(/^El |^La |^Los /, ''),
    arcana: 'major',
    number: index,
    roman: romans[index],
    aliases: [
      seed.nameEs,
      seed.nameEn,
      seed.nameEs.replace(/^El |^La |^Los /, ''),
      seed.nameEn.replace(/^The /, ''),
      String(index),
      romans[index],
      `arcano ${index}`,
      ...(seed.aliases ?? []),
    ],
    keywordsUpright: seed.keywords,
    keywordsReversed: seed.reversed,
    oneLineUpright: seed.oneLine,
    oneLineReversed: seed.reversedLine,
    quickUpright: seed.quick,
    quickReversed: `Invertida, ${seed.reversedLine.charAt(0).toLowerCase()}${seed.reversedLine.slice(1)}`,
    loveUpright: `En amor, suele hablar de ${seed.keywords.slice(0, 2).join(' y ')}. Mirá hechos y sensaciones sin dramatizar.`,
    loveReversed: `En amor, puede mostrar ${seed.reversed.slice(0, 2).join(' o ')}. Conviene ir despacio.`,
    workUpright: `En trabajo, marca ${seed.keywords.slice(0, 2).join(' y ')} aplicado a decisiones concretas.`,
    workReversed: `En trabajo, cuidado con ${seed.reversed.slice(0, 2).join(' y ')} antes de decidir.`,
    moneyUpright: 'En dinero, sugiere mirar lo práctico y evitar movimientos impulsivos.',
    moneyReversed: 'En dinero, conviene revisar riesgos, gastos o expectativas poco claras.',
    adviceUpright: seed.oneLine,
    adviceReversed: seed.reversedLine,
    yesNo: index === 18 ? 'No claro / esperar' : index % 3 === 0 ? 'Sí, con cuidado' : index % 3 === 1 ? 'Depende' : 'Todavía no claro',
    relatedCards: seed.related ?? [],
    popularityRank: [18, 16, 13, 0, 6, 3, 19].includes(index) ? index : index + 20,
    accent: seed.accent ?? '#d8b46a',
    glyph: seed.glyph ?? romans[index],
  }
}

function makeMinor(suit: Suit, rank: (typeof rankSeeds)[number], suitIndex: number): TarotCard {
  const suitInfo = suitMeta[suit]
  const id = `${rank.id}_of_${suit}`
  const nameEs = `${rank.es} de ${suitInfo.es}`
  const nameEn = `${rank.en} of ${suitInfo.en}`
  const numberAliases = rank.n
    ? [String(rank.n), `${rank.n} ${suitInfo.es}`, `${rank.n} de ${suitInfo.es}`, `${rank.n} ${suitInfo.en}`, `${rank.n} of ${suitInfo.en}`]
    : []

  const card: TarotCard = {
    id,
    nameEs,
    nameEn,
    shortName: rank.n ? `${rank.n} ${suitInfo.es}` : `${rank.es} ${suitInfo.es}`,
    arcana: 'minor',
    number: rank.n,
    suit,
    suitEs: suitInfo.es,
    suitEn: suitInfo.en,
    rank: rank.id,
    rankEs: rank.es,
    rankEn: rank.en,
    aliases: [
      nameEs,
      nameEn,
      `${rank.es} ${suitInfo.es}`,
      `${rank.en} ${suitInfo.en}`,
      `${rank.es.toLowerCase()} de ${suitInfo.es.toLowerCase()}`,
      `${rank.en.toLowerCase()} of ${suitInfo.en.toLowerCase()}`,
      suitInfo.es,
      suitInfo.en,
      ...numberAliases,
    ],
    keywordsUpright: [...suitInfo.keywords.slice(0, 3), rank.n ? `numero ${rank.n}` : rank.es.toLowerCase()],
    keywordsReversed: ['bloqueo', 'exceso', 'demora', suitInfo.reversed.split(' ')[0]],
    oneLineUpright: `${rank.upright} en ${suitInfo.context}.`,
    oneLineReversed: `${rank.reversed}.`,
    quickUpright: `${nameEs} mezcla el tema del ${rank.es.toLowerCase()} con ${suitInfo.context}: ${suitInfo.upright}.`,
    quickReversed: `Invertida, ${nameEs.toLowerCase()} muestra que ${suitInfo.reversed}.`,
    loveUpright: suit === 'cups' ? `${rank.upright} en un vínculo o emoción.` : `En amor, mirá cómo ${suitInfo.context} afecta el vínculo.`,
    loveReversed: `En amor, puede haber ${suitInfo.reversed}.`,
    workUpright: suit === 'pentacles' ? `${rank.upright} en trabajo o recursos.` : `En trabajo, señala ${rank.upright.toLowerCase()}.`,
    workReversed: `En trabajo, revisá si hay ${rank.reversed.toLowerCase()}.`,
    moneyUpright: suit === 'pentacles' ? `${rank.upright} en dinero y estabilidad.` : 'En dinero, conviene llevar la lectura a hechos concretos.',
    moneyReversed: 'En dinero, evitá decidir con prisa o con información incompleta.',
    adviceUpright: `Usá esta carta para mirar ${suitInfo.context} con honestidad.`,
    adviceReversed: 'Bajá el ritmo, revisá el patrón y elegí un paso simple.',
    yesNo: rank.n && rank.n <= 3 ? 'Sí, si se cuida' : rank.n && rank.n >= 8 ? 'Sí, con esfuerzo' : 'Depende',
    relatedCards: [],
    popularityRank: 70 + suitIndex * 14 + rankSeeds.findIndex((item) => item.id === rank.id),
    accent: suitInfo.accent,
    glyph: rank.n ? String(rank.n) : rank.es.slice(0, 1),
  }

  if (id === 'three_of_swords') {
    return {
      ...card,
      keywordsUpright: ['dolor', 'ruptura', 'verdad dificil', 'tristeza'],
      keywordsReversed: ['sanacion', 'soltar', 'perdon', 'recuperacion'],
      oneLineUpright: 'Una verdad duele, pero permite ver algo con claridad.',
      oneLineReversed: 'Empieza la sanación después de una herida emocional.',
      quickUpright: 'Tres de Espadas habla de dolor, ruptura o una verdad difícil. No suaviza: ayuda a nombrar lo que duele.',
      quickReversed: 'Invertida, muestra recuperación. La herida no desaparece de golpe, pero empieza a perder fuerza.',
      loveUpright: 'Puede indicar ruptura, distancia emocional o una conversación que duele.',
      loveReversed: 'Puede hablar de perdón, sanación o salir de una tristeza vieja.',
      workUpright: 'Una decisión o verdad incómoda puede cambiar el clima de trabajo.',
      workReversed: 'El conflicto empieza a procesarse si se habla con honestidad.',
      moneyUpright: 'Evitá negar una pérdida o dato incómodo.',
      moneyReversed: 'Una mala noticia empieza a ordenarse con un plan claro.',
      adviceUpright: 'Nombrá la verdad sin castigarte por sentir dolor.',
      adviceReversed: 'Dale espacio a la recuperación sin apurarla.',
      yesNo: 'No / duele pero aclara',
      aliases: [...card.aliases, '3 espadas', 'tres espadas', 'three swords', 'three of swords', 'ruptura', 'dolor'],
      relatedCards: ['the_tower', 'death', 'five_of_cups'],
      popularityRank: 4,
      accent: '#e87a7a',
      glyph: '3',
    }
  }

  return card
}

const majorCards = majorSeeds.map(makeMajor)

const minorCards = (Object.keys(suitMeta) as Suit[]).flatMap((suit, suitIndex) =>
  rankSeeds.map((rank) => makeMinor(suit, rank, suitIndex)),
)

function withFallbackRelations(cards: TarotCard[]): TarotCard[] {
  return cards.map((card, index) => ({
    ...card,
    relatedCards:
      card.relatedCards.length > 0
        ? card.relatedCards
        : [cards[(index + 1) % cards.length].id, cards[(index + 7) % cards.length].id, cards[(index + 13) % cards.length].id],
  }))
}

export const tarotCards: TarotCard[] = withFallbackRelations([...majorCards, ...minorCards])

export const cardsById = new Map(tarotCards.map((card) => [card.id, card]))

export const popularCardIds = ['the_moon', 'the_tower', 'death', 'the_fool', 'the_lovers', 'the_empress', 'three_of_swords']

export const detectedDemoIds = ['the_moon', 'three_of_swords', 'the_empress']
