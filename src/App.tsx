import React, { useMemo, useRef, useState } from "react";
import {
  Check,
  FileText,
  Box,
  Trees,
  DraftingCompass,
  ShieldCheck,
  Sparkles,
  Wrench,
  Droplets,
  Camera,
  Map,
  Copy,
  Calculator,
  Phone,
  Car,
  Zap,
  MessageCircle,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";

type PricingType =
  | "size"
  | "unit"
  | "flat"
  | "hourly"
  | "quote"
  | "tiered-unit"
  | "percentage";

type Locale = "en" | "es";
type SampleKey = "render" | "hoa" | "takeoff" | "plan";
type Mode = "sales" | "build" | "full";
type SectionKey = "sales" | "bundle" | "start" | "build" | "idea" | "after" | "city" | "help";

interface Size {
  id: string;
  label: string;
  sublabel: string;
  labelEs: string;
  sublabelEs: string;
}

interface Service {
  id: string;
  title: string;
  titleEs?: string;
  proTitle?: string;
  proTitleEs?: string;
  category: string;
  icon: LucideIcon;
  pricingType: PricingType;
  prices?: Record<string, number | null>;
  unitPrice?: number;
  flatPrice?: number;
  hourlyRate?: number;
  unitPrices?: Record<string, number | null>;
  percentRate?: number;
  displayPriceLabel?: string;
  quantityEnabled?: boolean;
  quantityLabel?: string;
  quantityLabelEs?: string;
  short: string;
  shortEs?: string;
  bestFor: string;
  bestForEs?: string;
  youSend: string;
  youSendEs?: string;
  youGet: string;
  youGetEs?: string;
  notIncluded: string;
  notIncludedEs?: string;
  helper?: string;
  helperEs?: string;
  sampleLabel?: string;
  sampleLabelEs?: string;
  badgeLabel?: string;
  badgeLabelEs?: string;
  sampleKey?: SampleKey;
}

interface Bundle {
  id: string;
  title: string;
  titleEs: string;
  desc: string;
  descEs: string;
  discountRate: number;
  items: Record<string, number>;
}

interface SummaryItem {
  title: string;
  price: number | null;
  qty: number;
}

const WHATSAPP_NUMBER = "15551234567";
const TEXT_NUMBER = "15551234567";

const ui = {
  en: {
    language: "Language",
    headerTitle: "Contractor Project Builder",
    headerSub: "siteform.studio • white-label plans, visuals, and paperwork support",
    sizeStep: "1. Property size",
    guidedEntryTitle: "2. What do you need to do?",
    guidedEntryDesc:
      "Pick the fastest path. This keeps the page simple and easier to use on a phone.",
    modeSalesTitle: "Just close the sale",
    modeSalesDesc: "I need a quick visual to help sell the job.",
    modeBuildTitle: "Build one thing",
    modeBuildDesc: "I am building a deck, patio, pergola, wall, or porch.",
    modeFullTitle: "Plan the full job",
    modeFullDesc: "I need help with the full layout, drawings, and paperwork.",
    activePath: "Active path",
    online: "Buy online",
    mixed: "Mixed pricing",
    quote: "Quote",
    selected: "Selected",
    addProject: "Add to Project",
    addQuote: "Add to quote",
    hideDetails: "Hide details",
    showDetails: "What this includes",
    bestFor: "Best for",
    youSend: "You send",
    youGet: "You get",
    notIncluded: "Not included",
    proTerm: "Pro term",
    bundleTitle: "Quick bundles",
    bundleDesc:
      "For landscapers who do not want to stack 3 separate services by hand.",
    bundleButton: "Use this bundle",
    bundleActive: "Bundle active",
    bundleSavings: "Bundle savings",
    bundleHoaTitle: "HOA Ready Package",
    bundleHoaDesc:
      "Remote site base + deck package + HOA / city paperwork with one click.",
    sectionSalesTitle: "Fastest way to sell the job",
    sectionSalesDesc:
      "Fast pre-sale path. Phone photo in, one client-ready concept image out.",
    sectionBuildTitle: "Build packages",
    sectionBuildDesc:
      "Clear packages for landscapers who are actually building something.",
    sectionStartTitle: "Start the base",
    sectionStartDesc:
      "Use one of these when the job needs a site base, field visit, or 3D starting point.",
    sectionIdeaTitle: "Help with your layout",
    sectionIdeaDesc:
      "Use this when you already know the layout or want help turning it into clear drawings.",
    sectionAfterTitle: "Plans and materials after layout",
    sectionAfterDesc:
      "These come after the layout is decided. Think site plan, shopping list, and watering layout.",
    sectionCityTitle: "HOA / city paperwork",
    sectionCityDesc:
      "Use these when the city or HOA wants extra paperwork.",
    sectionHelpTitle: "Need help or extra time?",
    sectionHelpDesc: "Calls, rush work, or travel time.",
    salesModeNote:
      "Sales mode auto-picks the quick concept image. Everything else moves out of the way.",
    buildModeNote:
      "Build mode brings structure packages and HOA paperwork to the front.",
    fullModeNote:
      "Full job mode shows the full workflow for the whole project.",
    contractorHint:
      "Not sure what to pick? Write what you need in Project Notes, like 'Need HOA packet for porch' or 'Need a concept image to close the job,' and we will sort the right package after you message us.",
    nonStampedNote: "Prices are for non-stamped drawings.",
    travelRuleNote:
      "For site visits beyond 20 miles, add Travel Time. Long Texas drives can eat the profit on small jobs.",
    notesTitle: "Project notes",
    notesDesc:
      "This field stays at the bottom so the phone keyboard does not wreck the flow. Photos and files still go through WhatsApp or text.",
    notesPlaceholder:
      "Example: Need HOA packet for a new porch. Client only has phone photos. Need the fastest package that helps us close the job and submit it.",
    confusedTitle: "Need help? Text us",
    confusedDesc:
      "Text or WhatsApp is the fastest way to sort out files and scope.",
    freeCall: "Text us",
    freeCallAdded: "Text request added to your notes.",
    summaryTitle: "Summary",
    summaryDesc:
      "Full total is shown here. Only the 70% deposit is charged now for priced items.",
    noServices: "No services selected",
    totalProject: "Total Project",
    deposit: "Deposit (70%)",
    balance: "Balance after completion",
    quoteNotice:
      "One or more selected items need project-specific review before final pricing.",
    requestQuote: "Request Quote",
    payDeposit: "Pay 70% Deposit",
    step2Title: "Step 2: Send photos",
    step2Desc:
      "After this, open WhatsApp or text and attach site photos, sketches, or video. This should take about 45 seconds, not 5 minutes.",
    sendWhatsapp: "Send to WhatsApp",
    sendText: "Send by Text",
    copied: "Copied",
    copyRequest: "Copy request",
    agreement:
      "I understand I am ordering work for my company. Once the layout is locked on my side, later layout changes count as redesign and require extra paid redesign time or a new design purchase.",
    agreementError: "Please check the agreement box before continuing.",
    requestSummary: "Request Summary",
    phoneNote:
      "Replace the placeholder WhatsApp and text number in the code with your real business number before publishing.",
    currentTotal: "Current total",
    checkSummary: "Check Summary",
    property: "PROPERTY",
    services: "SERVICES",
    noneSelected: "None selected",
    photosFiles: "PHOTOS / FILES",
    sentVia: "Will be sent via WhatsApp or text chat",
    total: "TOTAL",
    notes: "NOTES",
    quoteWord: "QUOTE",
    consultationNote:
      "No payment flow is wired in this sandbox yet. The buttons below are for previewing the UX and messaging flow.",
    sample: "See sample",
    bestSeller: "Best seller",
    hours: "hours",
    sheets: "sheets",
    visualHookRender: "Phone → concept",
    visualHookPlan: "Site plan",
    visualHookHoa: "HOA sheet",
    visualHookTakeoff: "Materials list",
    masterPlanNote:
      "Site Plan = The big picture. It shows where everything goes, but detailed construction for each structure is a separate Build Package.",
  },
  es: {
    language: "Idioma",
    headerTitle: "Builder de proyectos para contratistas",
    headerSub: "siteform.studio • planos, visuales y apoyo con papeles white-label",
    sizeStep: "1. Tamaño de la propiedad",
    guidedEntryTitle: "2. ¿Qué necesita hacer?",
    guidedEntryDesc:
      "Escoja la ruta más rápida. Así la página queda más simple y fácil de usar en el teléfono.",
    modeSalesTitle: "Solo cerrar la venta",
    modeSalesDesc: "Necesito una imagen rápida para vender el trabajo.",
    modeBuildTitle: "Construir una cosa",
    modeBuildDesc: "Voy a construir deck, patio, pérgola, muro o porch.",
    modeFullTitle: "Planear todo el trabajo",
    modeFullDesc: "Necesito ayuda con el layout completo, los planos y los papeles.",
    activePath: "Ruta activa",
    online: "Compra en línea",
    mixed: "Precios mixtos",
    quote: "Cotización",
    selected: "Seleccionado",
    addProject: "Agregar al proyecto",
    addQuote: "Pedir cotización",
    hideDetails: "Ocultar detalles",
    showDetails: "Qué incluye",
    bestFor: "Ideal para",
    youSend: "Usted nos envía",
    youGet: "Usted recibe",
    notIncluded: "No incluye",
    proTerm: "Término pro",
    bundleTitle: "Paquetes rápidos",
    bundleDesc:
      "Para paisajistas que no quieren juntar 3 servicios por separado.",
    bundleButton: "Usar este paquete",
    bundleActive: "Paquete activo",
    bundleSavings: "Ahorro del paquete",
    bundleHoaTitle: "Paquete listo para HOA",
    bundleHoaDesc:
      "Base remota del sitio + paquete de deck + papeles para HOA / ciudad con un clic.",
    sectionSalesTitle: "La forma más rápida de vender el trabajo",
    sectionSalesDesc:
      "Ruta rápida de preventa. Entra foto del celular, sale una imagen de concepto lista para el cliente.",
    sectionBuildTitle: "Paquetes para construir",
    sectionBuildDesc:
      "Paquetes claros para paisajistas que sí van a construir algo.",
    sectionStartTitle: "Empezar la base",
    sectionStartDesc:
      "Use uno de estos cuando el trabajo necesita una base del sitio, visita de campo o punto de arranque en 3D.",
    sectionIdeaTitle: "Ayuda con su layout",
    sectionIdeaDesc:
      "Use esto cuando ya tiene el layout o quiere ayuda para convertirlo en planos claros.",
    sectionAfterTitle: "Planos y materiales después del layout",
    sectionAfterDesc:
      "Esto va después de decidir el layout. Piense en plano general, lista de materiales y layout de riego.",
    sectionCityTitle: "Papeles para HOA / ciudad",
    sectionCityDesc:
      "Use esto cuando la ciudad o la HOA piden papeles extra.",
    sectionHelpTitle: "¿Necesita ayuda o tiempo extra?",
    sectionHelpDesc: "Llamadas, trabajo urgente o tiempo de viaje.",
    salesModeNote:
      "La ruta de ventas selecciona sola la imagen rápida de concepto. Todo lo demás se quita del camino.",
    buildModeNote:
      "La ruta de construcción pone al frente los paquetes de estructuras y los papeles HOA.",
    fullModeNote:
      "La ruta completa muestra el flujo completo de todo el trabajo.",
    contractorHint:
      "¿No sabe qué escoger? Escriba lo que necesita en las notas, por ejemplo 'Necesito paquete HOA para porch' o 'Necesito una imagen para cerrar el trabajo,' y acomodamos el paquete correcto después de su mensaje.",
    nonStampedNote: "Los precios son para dibujos no sellados.",
    travelRuleNote:
      "Para visitas a más de 20 millas, agregue Travel Time. En Texas el camino se puede comer la ganancia del trabajo pequeño.",
    notesTitle: "Notas del proyecto",
    notesDesc:
      "Este campo queda abajo para que el teclado del teléfono no rompa el flujo. Fotos y archivos siguen yendo por WhatsApp o texto.",
    notesPlaceholder:
      "Ejemplo: Necesito paquete HOA para un porch nuevo. El cliente solo tiene fotos del celular. Necesito el paquete más rápido para cerrar el trabajo y mandar papeles.",
    confusedTitle: "¿Necesita ayuda? Mándenos texto",
    confusedDesc:
      "Texto o WhatsApp es la forma más rápida para ordenar archivos y alcance.",
    freeCall: "Mándenos texto",
    freeCallAdded: "La solicitud por texto se agregó a sus notas.",
    summaryTitle: "Resumen",
    summaryDesc:
      "Aquí ve el total completo. Solo se cobra ahora el anticipo del 70% en los servicios con precio fijo.",
    noServices: "No hay servicios seleccionados",
    totalProject: "Proyecto total",
    deposit: "Anticipo (70%)",
    balance: "Saldo al terminar",
    quoteNotice:
      "Uno o más servicios necesitan revisión antes de dar precio final.",
    requestQuote: "Pedir cotización",
    payDeposit: "Pagar anticipo del 70%",
    step2Title: "Paso 2: Mande fotos",
    step2Desc:
      "Después de esto, abra WhatsApp o texto y mande fotos, sketches o video del sitio. Esto debe tomar unos 45 segundos, no 5 minutos.",
    sendWhatsapp: "Mandar por WhatsApp",
    sendText: "Mandar por texto",
    copied: "Copiado",
    copyRequest: "Copiar solicitud",
    agreement:
      "Entiendo que estoy pidiendo trabajo para mi compañía. Cuando el layout ya esté cerrado de mi lado, cualquier cambio después cuenta como rediseño y requiere tiempo extra pagado o una compra nueva de diseño.",
    agreementError: "Marque la casilla del acuerdo antes de continuar.",
    requestSummary: "Resumen de solicitud",
    phoneNote:
      "Cambie el número de WhatsApp y de texto de ejemplo por su número real antes de publicar.",
    currentTotal: "Total actual",
    checkSummary: "Ver resumen",
    property: "PROPIEDAD",
    services: "SERVICIOS",
    noneSelected: "Nada seleccionado",
    photosFiles: "FOTOS / ARCHIVOS",
    sentVia: "Se enviarán por WhatsApp o texto",
    total: "TOTAL",
    notes: "NOTAS",
    quoteWord: "COTIZAR",
    consultationNote:
      "En esta versión de sandbox todavía no hay checkout conectado. Los botones son para probar el flujo y el mensaje.",
    sample: "Ver muestra",
    bestSeller: "Más pedido",
    hours: "horas",
    sheets: "planos",
    visualHookRender: "Celular → concepto",
    visualHookPlan: "Plano general",
    visualHookHoa: "Hoja HOA",
    visualHookTakeoff: "Lista de materiales",
    masterPlanNote:
      "Plano general = La visión completa. Muestra dónde va cada cosa, pero la construcción detallada de cada estructura va en un paquete aparte.",
  },
} as const;

const SIZES: Size[] = [
  { id: "small", label: "Small", sublabel: "under 1/4 ac", labelEs: "Pequeño", sublabelEs: "menos de 1/4 ac" },
  { id: "medium", label: "Medium", sublabel: "around 1/2 ac", labelEs: "Mediano", sublabelEs: "alrededor de 1/2 ac" },
  { id: "large", label: "Large", sublabel: "1/2-1 ac", labelEs: "Grande", sublabelEs: "de 1/2 a 1 ac" },
  { id: "estate", label: "Estate", sublabel: "1-2 ac", labelEs: "Estate", sublabelEs: "de 1 a 2 ac" },
];

const STARTING_POINT_SERVICES: Service[] = [
  {
    id: "on-site-start",
    title: "Visit + Site Plan + 3D",
    titleEs: "Visita + plano del sitio + 3D",
    proTitle: "Site Visit + Base Plan + 3D Model",
    proTitleEs: "Site Visit + Base Plan + 3D Model",
    category: "Start",
    icon: Camera,
    pricingType: "size",
    prices: { small: 300, medium: 400, large: 550, estate: null },
    short: "We come out, measure, shoot photos, and build the base.",
    shortEs: "Vamos al sitio, medimos, tomamos fotos y armamos la base.",
    bestFor: "Local jobs that need real field information.",
    bestForEs: "Trabajos locales que necesitan información real del sitio.",
    youSend: "Address, access details, and any survey you already have.",
    youSendEs: "Dirección, acceso y survey si ya lo tiene.",
    youGet: "Measurements, photos, a site plan, and a 3D model.",
    youGetEs: "Medidas, fotos, plano del sitio y modelo 3D.",
    notIncluded: "Legal survey, engineering, permits, or stamped drawings.",
    notIncludedEs: "Survey legal, ingeniería, permisos o dibujos sellados.",
    helper: "If the project is more than 20 miles away, add Travel Time. Texas driving can wipe out the margin on small jobs.",
    helperEs: "Si el proyecto está a más de 20 millas, agregue Travel Time. En Texas el camino puede comerse la ganancia.",
    sampleKey: "plan",
  },
  {
    id: "survey-documents-start",
    title: "Remote Site Plan + 3D",
    titleEs: "Plano remoto del sitio + 3D",
    proTitle: "Remote Base Plan + 3D Model",
    proTitleEs: "Remote Base Plan + 3D Model",
    category: "Start",
    icon: Map,
    pricingType: "size",
    prices: { small: 200, medium: 300, large: 450, estate: null },
    short: "No site visit. You send files and we build the base remotely.",
    shortEs: "Sin visita. Usted manda archivos y armamos la base en remoto.",
    bestFor: "Out-of-town jobs or jobs with enough info already collected.",
    bestForEs: "Trabajos fuera de la ciudad o con suficiente información ya reunida.",
    youSend: "Survey, photos, PDFs, markups, or hand sketch.",
    youSendEs: "Survey, fotos, PDFs, markups o sketch a mano.",
    youGet: "A clean site plan and 3D model from your files.",
    youGetEs: "Plano limpio del sitio y modelo 3D desde sus archivos.",
    notIncluded: "Site visit, engineering, permits, or stamped drawings.",
    notIncludedEs: "Visita al sitio, ingeniería, permisos o dibujos sellados.",
    sampleKey: "plan",
  },
  {
    id: "client-model-start",
    title: "You send model, we render",
    titleEs: "Usted manda el modelo y nosotros renderizamos",
    proTitle: "Your 3D Model, We Render It",
    proTitleEs: "Your 3D Model, We Render It",
    category: "Start",
    icon: Box,
    pricingType: "size",
    prices: { small: 350, medium: 500, large: 750, estate: null },
    short: "We clean your model and turn it into something useful and presentable.",
    shortEs: "Limpiamos su modelo y lo convertimos en algo útil y presentable.",
    bestFor: "Jobs where the model exists but the presentation is weak.",
    bestForEs: "Trabajos donde el modelo existe pero la presentación está floja.",
    youSend: "Your 3D model, notes, PDFs, and material list.",
    youSendEs: "Su modelo 3D, notas, PDFs y lista de materiales.",
    youGet: "Cleaned model plus rendered views.",
    youGetEs: "Modelo limpio más vistas renderizadas.",
    notIncluded: "Full redesign or rebuilding the whole job from scratch.",
    notIncludedEs: "Rediseño completo o rehacer todo desde cero.",
    sampleKey: "render",
  },
  {
    id: "photo-concept-start",
    title: "Client-ready concept image",
    titleEs: "Imagen de concepto lista para cliente",
    proTitle: "One Client-Ready Concept Image",
    proTitleEs: "One Client-Ready Concept Image",
    category: "Start",
    icon: Trees,
    pricingType: "size",
    prices: { small: 150, medium: 150, large: 150, estate: null },
    short: "Send one phone photo. We send back one client-ready concept image.",
    shortEs: "Mande una foto del celular. Nosotros devolvemos una imagen de concepto lista para cliente.",
    bestFor: "Fast pre-sale work and early client conversations.",
    bestForEs: "Preventa rápida y primeras conversaciones con el cliente.",
    youSend: "Site photos, rough size, and quick notes.",
    youSendEs: "Fotos del sitio, tamaño aproximado y notas rápidas.",
    youGet: "One concept image and a short list of key features.",
    youGetEs: "Una imagen de concepto y una lista corta de elementos.",
    notIncluded: "Construction drawings, engineering, permits, or stamped drawings.",
    notIncludedEs: "Planos de construcción, ingeniería, permisos o dibujos sellados.",
    sampleLabel: "See sample",
    sampleLabelEs: "Ver muestra",
    badgeLabel: "Best seller",
    badgeLabelEs: "Más pedido",
    sampleKey: "render",
  },
];

const STRUCTURE_SERVICES: Service[] = [
  {
    id: "deck-small",
    title: "Deck build package",
    titleEs: "Paquete de construcción de deck",
    proTitle: "Small Deck Package under 200 sq.ft",
    proTitleEs: "Small Deck Package under 200 sq.ft",
    category: "Build",
    icon: Box,
    pricingType: "flat",
    flatPrice: 1000,
    short: "Detailed deck layout, plan set, and 3D views.",
    shortEs: "Layout detallado de deck, juego de planos y vistas 3D.",
    bestFor: "Small deck jobs that need a clean package fast.",
    bestForEs: "Decks pequeños que necesitan un paquete claro y rápido.",
    youSend: "Site plan, location, dimensions, and inspiration.",
    youSendEs: "Plano del sitio, ubicación, medidas e inspiración.",
    youGet: "Deck layout, AutoCAD plans, and 3D visuals.",
    youGetEs: "Layout del deck, planos AutoCAD y vistas 3D.",
    notIncluded: "Structural engineering, permit filing, or stamped drawings.",
    notIncludedEs: "Ingeniería estructural, trámite de permiso o dibujos sellados.",
    helper: "This is a detailed build package. It fits into the Site Plan like a puzzle piece.",
    helperEs: "Este es un paquete detallado de construcción. Encaja dentro del plano general como una pieza.",
    sampleKey: "hoa",
  },
  {
    id: "pergola-small",
    title: "Pergola build package",
    titleEs: "Paquete de construcción de pérgola",
    proTitle: "Small Pergola Package under 200 sq.ft",
    proTitleEs: "Small Pergola Package under 200 sq.ft",
    category: "Build",
    icon: Box,
    pricingType: "flat",
    flatPrice: 1000,
    short: "Detailed pergola layout, plan set, and 3D views.",
    shortEs: "Layout detallado de pérgola, juego de planos y vistas 3D.",
    bestFor: "Pergola jobs that need a clean sellable packet.",
    bestForEs: "Trabajos de pérgola que necesitan un paquete vendible.",
    youSend: "Site plan, location, dimensions, and inspiration.",
    youSendEs: "Plano del sitio, ubicación, medidas e inspiración.",
    youGet: "Pergola layout, AutoCAD plans, and 3D visuals.",
    youGetEs: "Layout de pérgola, planos AutoCAD y vistas 3D.",
    notIncluded: "Structural engineering, permit filing, or stamped drawings.",
    notIncludedEs: "Ingeniería estructural, trámite de permiso o dibujos sellados.",
    sampleKey: "hoa",
  },
  {
    id: "retaining-wall",
    title: "Retaining wall concept",
    titleEs: "Concepto de muro de contención",
    proTitle: "Retaining Wall Concept",
    proTitleEs: "Retaining Wall Concept",
    category: "Build",
    icon: ShieldCheck,
    pricingType: "quote",
    short: "Early wall direction before engineering comes in.",
    shortEs: "Dirección inicial del muro antes de meter ingeniería.",
    bestFor: "Slope problems, wall sales, and early pricing talks.",
    bestForEs: "Problemas de pendiente, venta de muros y pláticas de precio.",
    youSend: "Survey, grades if available, and site photos.",
    youSendEs: "Survey, niveles si existen y fotos del sitio.",
    youGet: "Concept wall layout with visuals and plan support.",
    youGetEs: "Layout conceptual del muro con visuales y apoyo de plano.",
    notIncluded: "Stamped engineering or final construction drawings.",
    notIncludedEs: "Ingeniería sellada o planos finales de construcción.",
    sampleKey: "hoa",
  },
];

const DESIGN_DIRECTION_SERVICES: Service[] = [
  {
    id: "design-execution-under-your-direction",
    title: "Help with your layout",
    titleEs: "Ayuda con su layout",
    proTitle: "Layout Drafting Support",
    proTitleEs: "Layout Drafting Support",
    category: "Idea",
    icon: Wrench,
    pricingType: "size",
    prices: { small: 500, medium: 800, large: 1300, estate: null },
    short: "You already know the layout. We clean it up and draw it clearly.",
    shortEs: "Usted ya sabe el layout. Nosotros lo limpiamos y lo dibujamos claro.",
    bestFor: "Landscapers who already have the idea but need it drawn well.",
    bestForEs: "Paisajistas que ya traen la idea pero necesitan dibujarla bien.",
    youSend: "Markups, sketches, references, dimensions, and notes.",
    youSendEs: "Markups, sketches, referencias, medidas y notas.",
    youGet: "A developed 3D model and review visuals.",
    youGetEs: "Modelo 3D desarrollado y visuales de revisión.",
    notIncluded: "Engineering, permit drawings, or quantities unless added later.",
    notIncludedEs: "Ingeniería, planos de permiso o cantidades a menos que se agreguen luego.",
    helper: "This is right when you are the one driving the layout.",
    helperEs: "Esto va cuando usted es quien trae el layout.",
    sampleKey: "render",
  },
  {
    id: "we-handle-the-design",
    title: "Full job layout help",
    titleEs: "Ayuda con el layout de todo el trabajo",
    proTitle: "Full Job Layout Help",
    proTitleEs: "Full Job Layout Help",
    category: "Idea",
    icon: Sparkles,
    pricingType: "size",
    prices: { small: 1000, medium: 1500, large: 2200, estate: null },
    short: "You send the scope and site info. We help build the full layout.",
    shortEs: "Usted manda el alcance y la info del sitio. Nosotros ayudamos a armar el layout completo.",
    bestFor: "Bigger jobs that need layout help for the full project.",
    bestForEs: "Trabajos grandes que necesitan ayuda con el layout de todo el proyecto.",
    youSend: "Survey, photos, must-haves, style notes, and budget level.",
    youSendEs: "Survey, fotos, cosas obligatorias, estilo y nivel de presupuesto.",
    youGet: "Layout help, 3D design modeling, and review visuals.",
    youGetEs: "Ayuda con layout, modelado 3D y visuales de revisión.",
    notIncluded: "Engineering, permit package, or detailed production sheets unless added.",
    notIncludedEs: "Ingeniería, paquete de permiso o hojas detalladas a menos que se agreguen.",
    helper: "This is right when you want us to help shape the full job, not only draw one piece.",
    helperEs: "Esto va cuando quiere que ayudemos con todo el trabajo, no solo con una pieza.",
    sampleKey: "render",
  },
];

const NEXT_PHASE_SERVICES: Service[] = [
  {
    id: "master-plan",
    title: "Full site plan",
    titleEs: "Plano general de todo el sitio",
    proTitle: "Clean 2D Site Plan",
    proTitleEs: "Clean 2D Site Plan",
    category: "After layout",
    icon: DraftingCompass,
    pricingType: "size",
    prices: { small: 200, medium: 350, large: 700, estate: null },
    short: "The big-picture plan for the whole site.",
    shortEs: "El plano general de todo el sitio.",
    bestFor: "Showing where the deck, patio, and walls go without build details.",
    bestForEs: "Mostrar dónde van deck, patio y muros sin detalles de construcción.",
    youSend: "Approved layout, model, redlines, or sketches.",
    youSendEs: "Layout aprobado, modelo, redlines o sketches.",
    youGet: "A clean site-wide plan ready for pricing, review, or presentation.",
    youGetEs: "Un plano limpio de todo el sitio listo para precio, revisión o presentación.",
    notIncluded: "Build details, engineering, permit approval, or stamped drawings.",
    notIncludedEs: "Detalles constructivos, ingeniería, aprobación de permiso o dibujos sellados.",
    helper: "Think of this as the big picture. Structure details are separate.",
    helperEs: "Piense en esto como la imagen completa. Los detalles van aparte.",
    sampleKey: "plan",
  },
  {
    id: "takeoff",
    title: "Shopping List / Materials",
    titleEs: "Lista de materiales",
    proTitle: "Take-off",
    proTitleEs: "Take-off",
    category: "After layout",
    icon: FileText,
    pricingType: "size",
    prices: { small: 200, medium: 350, large: 700, estate: null },
    short: "Material quantities from the approved plan.",
    shortEs: "Cantidades de materiales desde el plano aprobado.",
    bestFor: "Pricing the job once the layout is locked.",
    bestForEs: "Poner precio al trabajo cuando el layout ya está cerrado.",
    youSend: "Approved plan or model.",
    youSendEs: "Plano o modelo aprobado.",
    youGet: "Quantities and dimensions by scope.",
    youGetEs: "Cantidades y medidas por alcance.",
    notIncluded: "Purchasing, vendor follow-up, or field verification.",
    notIncludedEs: "Compras, seguimiento con proveedores o verificación en sitio.",
    sampleKey: "takeoff",
  },
  {
    id: "watering-concept",
    title: "Basic watering layout",
    titleEs: "Layout básico de riego",
    proTitle: "Basic Watering Layout",
    proTitleEs: "Basic Watering Layout",
    category: "After layout",
    icon: Droplets,
    pricingType: "size",
    prices: { small: 200, medium: 250, large: 300, estate: null },
    short: "Simple watering strategy for the approved layout.",
    shortEs: "Estrategia simple de riego para el layout aprobado.",
    bestFor: "Showing simple watering logic before full irrigation work.",
    bestForEs: "Mostrar lógica básica de riego antes del trabajo completo.",
    youSend: "Approved plan and planting direction.",
    youSendEs: "Plano aprobado y dirección de plantación.",
    youGet: "Zones, head placement idea, and coverage notes.",
    youGetEs: "Zonas, idea de cabezales y notas de cobertura.",
    notIncluded: "Hydraulic design or install diagrams.",
    notIncludedEs: "Diseño hidráulico o diagramas de instalación.",
    sampleKey: "plan",
  },
];

const RARE_TECHNICAL_SERVICES: Service[] = [
  {
    id: "hoa-city",
    title: "HOA / City Paperwork",
    titleEs: "Papeles para HOA / ciudad",
    proTitle: "Submittal Sheet",
    proTitleEs: "Submittal Sheet",
    category: "City",
    icon: ShieldCheck,
    pricingType: "size",
    prices: { small: 300, medium: 400, large: 600, estate: null },
    short: "Extra paperwork built from the approved layout and survey.",
    shortEs: "Papeles extra hechos desde el layout aprobado y survey.",
    bestFor: "When the city or HOA wants a formal sheet.",
    bestForEs: "Cuando la ciudad o la HOA quieren una hoja formal.",
    youSend: "Approved design, survey, and any checklist.",
    youSendEs: "Diseño aprobado, survey y checklist si existe.",
    youGet: "A design-intent paperwork sheet ready to send.",
    youGetEs: "Una hoja de papeles lista para mandar.",
    notIncluded: "Approval guarantee, engineering, or stamped drawings.",
    notIncludedEs: "Garantía de aprobación, ingeniería o dibujos sellados.",
    sampleKey: "hoa",
  },
];

const HOURLY_SERVICES: Service[] = [
  {
    id: "phone-consult",
    title: "Video / phone consultation",
    titleEs: "Consulta por video / teléfono",
    category: "Help",
    icon: Phone,
    pricingType: "hourly",
    hourlyRate: 70,
    quantityEnabled: true,
    quantityLabel: "hours",
    quantityLabelEs: "horas",
    short: "Talk through scope, options, or handoff needs.",
    shortEs: "Hablemos del alcance, opciones o lo que necesita entregar.",
    bestFor: "Short planning calls.",
    bestForEs: "Llamadas cortas de planeación.",
    youSend: "Questions, files, and topic list.",
    youSendEs: "Preguntas, archivos y lista de temas.",
    youGet: "Live consultation time.",
    youGetEs: "Tiempo de consulta en vivo.",
    notIncluded: "Design deliverables unless bought separately.",
    notIncludedEs: "Entregables de diseño a menos que se compren aparte.",
  },
  {
    id: "rush-fee",
    title: "Rush fee",
    titleEs: "Cargo urgente",
    category: "Help",
    icon: Zap,
    pricingType: "percentage",
    percentRate: 0.25,
    displayPriceLabel: "+25%",
    short: "Rush turnaround added to the priced work in the cart.",
    shortEs: "Entrega urgente agregada al trabajo con precio del carrito.",
    bestFor: "Jobs with tight deadlines.",
    bestForEs: "Trabajos con fecha muy apretada.",
    youSend: "Due date and delivery expectations.",
    youSendEs: "Fecha requerida y expectativas de entrega.",
    youGet: "Priority scheduling when available.",
    youGetEs: "Prioridad cuando haya espacio.",
    notIncluded: "Impossible deadlines.",
    notIncludedEs: "Fechas imposibles.",
  },
  {
    id: "travel-time",
    title: "Travel time",
    titleEs: "Tiempo de viaje",
    category: "Help",
    icon: Car,
    pricingType: "hourly",
    hourlyRate: 70,
    quantityEnabled: true,
    quantityLabel: "hours",
    quantityLabelEs: "horas",
    short: "Travel billed separately when needed.",
    shortEs: "Tiempo de viaje cobrado aparte cuando haga falta.",
    bestFor: "Jobs beyond 20 miles or longer field days.",
    bestForEs: "Trabajos a más de 20 millas o días largos de campo.",
    youSend: "Address and expected trip needs.",
    youSendEs: "Dirección y tiempo esperado de viaje.",
    youGet: "Travel time added clearly to the request.",
    youGetEs: "Tiempo de viaje agregado claramente a la solicitud.",
    notIncluded: "Vehicle costs or survey fees.",
    notIncludedEs: "Costos del vehículo o fees de survey.",
  },
];

const BUNDLES: Bundle[] = [
  {
    id: "hoa-ready",
    title: ui.en.bundleHoaTitle,
    titleEs: ui.es.bundleHoaTitle,
    desc: ui.en.bundleHoaDesc,
    descEs: ui.es.bundleHoaDesc,
    discountRate: 0.1,
    items: {
      "survey-documents-start": 1,
      "deck-small": 1,
      "hoa-city": 1,
    },
  },
];

function formatPrice(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "Quote";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function getBaseUnitPrice(service: Service, sizeId: string): number | null {
  switch (service.pricingType) {
    case "size":
      return service.prices?.[sizeId] ?? null;
    case "flat":
      return service.flatPrice ?? null;
    case "hourly":
      return service.hourlyRate ?? null;
    case "unit":
    case "tiered-unit":
      return service.unitPrice ?? service.unitPrices?.[sizeId] ?? null;
    case "percentage":
    case "quote":
    default:
      return null;
  }
}

function getLinePrice(service: Service, sizeId: string, quantity: number) {
  if (service.pricingType === "quote") return null;
  if (service.pricingType === "percentage") return 0;
  const base = getBaseUnitPrice(service, sizeId);
  if (base === null) return null;
  return base * Math.max(1, quantity);
}

function getServiceText(service: Service, locale: Locale) {
  return {
    title: locale === "es" ? service.titleEs ?? service.title : service.title,
    proTitle: locale === "es" ? service.proTitleEs ?? service.proTitle ?? service.titleEs ?? service.title : service.proTitle ?? service.title,
    short: locale === "es" ? service.shortEs ?? service.short : service.short,
    bestFor: locale === "es" ? service.bestForEs ?? service.bestFor : service.bestFor,
    youSend: locale === "es" ? service.youSendEs ?? service.youSend : service.youSend,
    youGet: locale === "es" ? service.youGetEs ?? service.youGet : service.youGet,
    notIncluded: locale === "es" ? service.notIncludedEs ?? service.notIncluded : service.notIncluded,
    helper: locale === "es" ? service.helperEs ?? service.helper : service.helper,
    sampleLabel: locale === "es" ? service.sampleLabelEs ?? service.sampleLabel : service.sampleLabel,
    badgeLabel: locale === "es" ? service.badgeLabelEs ?? service.badgeLabel : service.badgeLabel,
  };
}

function getVisualHook(sampleKey: SampleKey | undefined, locale: Locale) {
  const t = ui[locale];
  switch (sampleKey) {
    case "render": return t.visualHookRender;
    case "hoa": return t.visualHookHoa;
    case "takeoff": return t.visualHookTakeoff;
    case "plan": return t.visualHookPlan;
    default: return t.sample;
  }
}

function getVisibleSections(mode: Mode): SectionKey[] {
  if (mode === "sales") return ["sales", "start", "help"];
  if (mode === "build") return ["bundle", "build", "start", "city", "after", "help"];
  return ["start", "idea", "after", "build", "city", "help"];
}

function getDefaultCartForMode(mode: Mode): Record<string, number> {
  if (mode === "sales") return { "photo-concept-start": 1 };
  return {};
}

function getBundleDiscount(bundle: Bundle | null, cart: Record<string, number>, sizeId: string) {
  if (!bundle) return 0;
  const allServices = [...STARTING_POINT_SERVICES, ...STRUCTURE_SERVICES, ...DESIGN_DIRECTION_SERVICES, ...NEXT_PHASE_SERVICES, ...RARE_TECHNICAL_SERVICES, ...HOURLY_SERVICES];
  const applies = Object.entries(bundle.items).every(([id, qty]) => (cart[id] ?? 0) >= qty);
  if (!applies) return 0;
  let subtotal = 0;
  for (const [id, qty] of Object.entries(bundle.items)) {
    const service = allServices.find((s) => s.id === id);
    if (!service) continue;
    const line = getLinePrice(service, sizeId, qty);
    if (line !== null) subtotal += line;
  }
  return Math.round(subtotal * bundle.discountRate);
}

function runSelfTests() {
  const smallDeck = STRUCTURE_SERVICES.find((s) => s.id === "deck-small");
  const photo = STARTING_POINT_SERVICES.find((s) => s.id === "photo-concept-start");
  if (!smallDeck || !photo) return;
  if (getLinePrice(smallDeck, "small", 1) !== 1000) throw new Error("deck flat pricing failed");
  if (getLinePrice(photo, "small", 1) !== 150) throw new Error("photo size pricing failed");
  const discount = getBundleDiscount(BUNDLES[0], { "survey-documents-start": 1, "deck-small": 1, "hoa-city": 1 }, "small");
  if (discount <= 0) throw new Error("bundle discount failed");
}

runSelfTests();

function Pill({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "green" | "amber" | "blue" }) {
  const tones = {
    slate: "border-slate-200 bg-slate-50 text-slate-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
  } as const;
  return <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${tones[tone]}`}>{children}</span>;
}

function QtyControl({ value, onChange, label }: { value: number; onChange: (q: number) => void; label?: string }) {
  return (
    <div className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} className="h-9 w-9 rounded-xl border border-slate-200 text-lg font-black">-</button>
      <div className="min-w-[80px] text-center text-sm font-bold">{value} {label ?? ""}</div>
      <button type="button" onClick={() => onChange(value + 1)} className="h-9 w-9 rounded-xl border border-slate-200 text-lg font-black">+</button>
    </div>
  );
}

function getCardPriceLabel(service: Service, sizeId: string, quantity: number, locale: Locale) {
  if (service.pricingType === "quote") return ui[locale].quote;
  if (service.pricingType === "percentage") return service.displayPriceLabel ?? "+%";
  const price = getLinePrice(service, sizeId, quantity);
  return formatPrice(price);
}

function ServiceCard({ service, sizeId, locale, selected, qty, onToggle, onQtyChange }: {
  service: Service;
  sizeId: string;
  locale: Locale;
  selected: boolean;
  qty: number;
  onToggle: () => void;
  onQtyChange: (qty: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const t = ui[locale];
  const text = getServiceText(service, locale);
  const priceLabel = getCardPriceLabel(service, sizeId, qty, locale);
  const visualHook = getVisualHook(service.sampleKey, locale);

  return (
    <article className={`rounded-3xl border p-5 shadow-sm transition ${selected ? "border-slate-900 bg-white shadow-lg" : "border-slate-200 bg-white"}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
            <service.icon size={22} />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">{text.title}</h3>
              {text.badgeLabel ? <Pill tone="amber">{text.badgeLabel}</Pill> : null}
              {service.pricingType === "quote" ? <Pill tone="blue">{t.quote}</Pill> : null}
            </div>
            <p className="mt-1 text-sm text-slate-600">{text.short}</p>
            {service.sampleKey ? <div className="mt-3"><Pill tone="green">{visualHook}</Pill></div> : null}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xl font-black text-slate-900">{priceLabel}</div>
          <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-400">{service.pricingType === "quote" ? t.mixed : t.online}</div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" onClick={onToggle} className={`rounded-2xl px-4 py-3 text-sm font-bold transition ${selected ? "bg-slate-900 text-white" : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
          {selected ? t.selected : service.pricingType === "quote" ? t.addQuote : t.addProject}
        </button>
        <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
          {open ? t.hideDetails : t.showDetails}
        </button>
      </div>

      {selected && service.quantityEnabled ? (
        <QtyControl value={qty} onChange={onQtyChange} label={locale === "es" ? service.quantityLabelEs : service.quantityLabel} />
      ) : null}

      {open ? (
        <div className="mt-5 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.proTerm}</div>
            <div className="mt-1 font-bold text-slate-900">{text.proTitle}</div>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.bestFor}</div>
            <p className="mt-1">{text.bestFor}</p>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.youSend}</div>
            <p className="mt-1">{text.youSend}</p>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.youGet}</div>
            <p className="mt-1">{text.youGet}</p>
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.notIncluded}</div>
            <p className="mt-1">{text.notIncluded}</p>
          </div>
          {text.helper ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-900">{text.helper}</div> : null}
        </div>
      ) : null}
    </article>
  );
}

function ServiceSection({ title, desc, services, locale, sizeId, cart, onToggle, onQtyChange }: {
  title: string;
  desc: string;
  services: Service[];
  locale: Locale;
  sizeId: string;
  cart: Record<string, number>;
  onToggle: (id: string) => void;
  onQtyChange: (id: string, qty: number) => void;
}) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-2xl font-black text-slate-900">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">{desc}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            sizeId={sizeId}
            locale={locale}
            selected={Boolean(cart[service.id])}
            qty={cart[service.id] ?? 1}
            onToggle={() => onToggle(service.id)}
            onQtyChange={(qty) => onQtyChange(service.id, qty)}
          />
        ))}
      </div>
    </section>
  );
}

function BundleCard({ bundle, locale, active, onApply }: { bundle: Bundle; locale: Locale; active: boolean; onApply: () => void }) {
  return (
    <article className={`rounded-3xl border p-5 ${active ? "border-slate-900 bg-white shadow-lg" : "border-slate-200 bg-white"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900">{locale === "es" ? bundle.titleEs : bundle.title}</h3>
          <p className="mt-1 text-sm text-slate-600">{locale === "es" ? bundle.descEs : bundle.desc}</p>
        </div>
        {active ? <Pill tone="green">{ui[locale].bundleActive}</Pill> : null}
      </div>
      <button type="button" onClick={onApply} className="mt-4 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white">
        {ui[locale].bundleButton}
      </button>
    </article>
  );
}

export default function SiteformContractorProjectBuilder() {
  const [locale, setLocale] = useState<Locale>("en");
  const [sizeId, setSizeId] = useState<string>("small");
  const [mode, setMode] = useState<Mode>("sales");
  const [cart, setCart] = useState<Record<string, number>>({ "photo-concept-start": 1 });
  const [activeBundle, setActiveBundle] = useState<Bundle | null>(null);
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement | null>(null);
  const summaryRef = useRef<HTMLDivElement | null>(null);

  const t = ui[locale];
  const visibleSections = useMemo(() => getVisibleSections(mode), [mode]);
  const allServices = useMemo(() => [...STARTING_POINT_SERVICES, ...STRUCTURE_SERVICES, ...DESIGN_DIRECTION_SERVICES, ...NEXT_PHASE_SERVICES, ...RARE_TECHNICAL_SERVICES, ...HOURLY_SERVICES], []);

  const summary = useMemo(() => {
    const items: SummaryItem[] = [];
    let subtotal = 0;
    let needsQuote = false;
    let pricedSubtotal = 0;

    for (const service of allServices) {
      const qty = cart[service.id] ?? 0;
      if (!qty) continue;
      const text = getServiceText(service, locale);
      let price: number | null = null;

      if (service.pricingType === "percentage") {
        price = 0;
      } else {
        price = getLinePrice(service, sizeId, qty);
      }

      if (price === null) needsQuote = true;
      if (price !== null) {
        subtotal += price;
        if (service.pricingType !== "percentage") pricedSubtotal += price;
      }

      items.push({ title: text.title, price, qty });
    }

    const rushSelected = Boolean(cart["rush-fee"]);
    let rushAmount = 0;
    if (rushSelected) {
      rushAmount = Math.round(pricedSubtotal * (HOURLY_SERVICES.find((s) => s.id === "rush-fee")?.percentRate ?? 0));
      subtotal += rushAmount;
      items.push({ title: locale === "es" ? "Cargo urgente" : "Rush fee", price: rushAmount, qty: 1 });
    }

    const bundleDiscount = getBundleDiscount(activeBundle, cart, sizeId);
    if (bundleDiscount > 0) {
      subtotal -= bundleDiscount;
      items.push({ title: `${t.bundleSavings}${activeBundle ? ` • ${locale === "es" ? activeBundle.titleEs : activeBundle.title}` : ""}`, price: -bundleDiscount, qty: 1 });
    }

    const deposit = needsQuote ? 0 : Math.round(subtotal * 0.7);
    const remaining = needsQuote ? 0 : subtotal - deposit;

    return { items, total: subtotal, deposit, remaining, needsQuote };
  }, [activeBundle, allServices, cart, locale, sizeId, t.bundleSavings]);

  const requestBody = useMemo(() => {
    const selectedSize = SIZES.find((s) => s.id === sizeId);
    const lines = [
      `${t.property}: ${locale === "es" ? selectedSize?.labelEs : selectedSize?.label} ${locale === "es" ? selectedSize?.sublabelEs : selectedSize?.sublabel}`,
      `${t.services}:`,
      ...(summary.items.length
        ? summary.items.map((item) => `• ${item.title} x${item.qty} — ${item.price === null ? t.quoteWord : formatPrice(item.price)}`)
        : [`• ${t.noneSelected}`]),
      `${t.photosFiles}: ${t.sentVia}`,
      `${t.total}: ${summary.needsQuote ? t.quoteWord : formatPrice(summary.total)}`,
      `${t.notes}: ${notes.trim() || "-"}`,
    ];
    return lines.join("\n");
  }, [locale, notes, sizeId, summary, t]);

  const whatsappHref = useMemo(() => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(requestBody)}`, [requestBody]);
  const textHref = useMemo(() => `sms:${TEXT_NUMBER}?body=${encodeURIComponent(requestBody)}`, [requestBody]);

  const scrollToSummary = () => {
    summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNotesFocus = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    window.setTimeout(() => {
      event.target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  };

  const activateMode = (nextMode: Mode) => {
    setMode(nextMode);
    setActiveBundle(null);
    setCart(getDefaultCartForMode(nextMode));
  };

  const applyBundle = (bundle: Bundle) => {
    setActiveBundle(bundle);
    setCart((prev) => ({ ...prev, ...bundle.items }));
    setMode("build");
  };

  const toggleService = (id: string) => {
    setCart((prev) => {
      const next = { ...prev };
      const isStarting = STARTING_POINT_SERVICES.some((s) => s.id === id);
      const isDesign = DESIGN_DIRECTION_SERVICES.some((s) => s.id === id);
      const isLaterPhase = NEXT_PHASE_SERVICES.some((s) => s.id === id) || RARE_TECHNICAL_SERVICES.some((s) => s.id === id);

      if (next[id]) {
        delete next[id];
      } else {
        next[id] = 1;
      }

      if (next[id]) {
        if (isStarting) {
          for (const service of STARTING_POINT_SERVICES) if (service.id !== id) delete next[service.id];
        }
        if (isDesign) {
          for (const service of DESIGN_DIRECTION_SERVICES) if (service.id !== id) delete next[service.id];
        }
        if (isLaterPhase && !Object.keys(next).some((key) => STARTING_POINT_SERVICES.some((s) => s.id === key) || DESIGN_DIRECTION_SERVICES.some((s) => s.id === key))) {
          next["survey-documents-start"] = 1;
        }
      }
      return next;
    });
  };

  const changeQty = (id: string, qty: number) => {
    setCart((prev) => ({ ...prev, [id]: Math.max(1, qty) }));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(requestBody);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const handleFreeCall = () => {
    const line = locale === "es" ? "Necesito ayuda para escoger el paquete correcto." : "I need help choosing the right package.";
    setNotes((prev) => (prev ? `${prev}\n${line}` : line));
    notesRef.current?.focus();
  };

  const handlePrimaryAction = () => {
    setAttemptedSubmit(true);
    if (!agreed) return;
    window.alert(t.consultationNote);
  };

  const modeCards = [
    { id: "sales" as Mode, title: t.modeSalesTitle, desc: t.modeSalesDesc },
    { id: "build" as Mode, title: t.modeBuildTitle, desc: t.modeBuildDesc },
    { id: "full" as Mode, title: t.modeFullTitle, desc: t.modeFullDesc },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <header className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <Pill tone="green">{t.nonStampedNote}</Pill>
                <Pill tone="amber">{t.travelRuleNote}</Pill>
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">{t.headerTitle}</h1>
              <p className="mt-2 text-sm text-slate-600">{t.headerSub}</p>
            </div>
            <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
              <button type="button" onClick={() => setLocale("en")} className={`rounded-xl px-4 py-2 text-sm font-bold ${locale === "en" ? "bg-white shadow-sm" : "text-slate-500"}`}>EN</button>
              <button type="button" onClick={() => setLocale("es")} className={`rounded-xl px-4 py-2 text-sm font-bold ${locale === "es" ? "bg-white shadow-sm" : "text-slate-500"}`}>ES</button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <main className="space-y-8">
            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100">
                  <Calculator size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-black">{t.sizeStep}</h2>
                  <p className="text-sm text-slate-600">{t.masterPlanNote}</p>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {SIZES.map((size) => {
                  const active = sizeId === size.id;
                  const label = locale === "es" ? size.labelEs : size.label;
                  const sublabel = locale === "es" ? size.sublabelEs : size.sublabel;
                  return (
                    <button key={size.id} type="button" onClick={() => setSizeId(size.id)} className={`rounded-3xl border p-4 text-left transition ${active ? "border-slate-900 bg-slate-900 text-white shadow-lg" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                      <div className="text-lg font-black">{label}</div>
                      <div className={`mt-1 text-sm ${active ? "text-slate-200" : "text-slate-500"}`}>{sublabel}</div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-xl font-black">{t.guidedEntryTitle}</h2>
                <p className="mt-2 text-sm text-slate-600">{t.guidedEntryDesc}</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {modeCards.map((item) => {
                  const active = mode === item.id;
                  return (
                    <button key={item.id} type="button" onClick={() => activateMode(item.id)} className={`rounded-3xl border p-5 text-left transition ${active ? "border-slate-900 bg-slate-900 text-white shadow-lg" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-black">{item.title}</h3>
                        {active ? <Pill tone="green">{t.activePath}</Pill> : null}
                      </div>
                      <p className={`mt-2 text-sm ${active ? "text-slate-200" : "text-slate-600"}`}>{item.desc}</p>
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                {mode === "sales" ? t.salesModeNote : mode === "build" ? t.buildModeNote : t.fullModeNote}
              </div>
            </section>

            {visibleSections.includes("bundle") ? (
              <section className="space-y-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{t.bundleTitle}</h2>
                  <p className="mt-2 max-w-3xl text-sm text-slate-600">{t.bundleDesc}</p>
                </div>
                <div className="grid gap-4 lg:grid-cols-2">
                  {BUNDLES.map((bundle) => (
                    <BundleCard key={bundle.id} bundle={bundle} locale={locale} active={activeBundle?.id === bundle.id} onApply={() => applyBundle(bundle)} />
                  ))}
                </div>
              </section>
            ) : null}

            {visibleSections.includes("sales") ? (
              <ServiceSection title={t.sectionSalesTitle} desc={t.sectionSalesDesc} services={STARTING_POINT_SERVICES.filter((s) => s.id === "photo-concept-start")} locale={locale} sizeId={sizeId} cart={cart} onToggle={toggleService} onQtyChange={changeQty} />
            ) : null}

            {visibleSections.includes("start") ? (
              <ServiceSection title={t.sectionStartTitle} desc={t.sectionStartDesc} services={STARTING_POINT_SERVICES.filter((s) => s.id !== "photo-concept-start" || mode !== "sales")} locale={locale} sizeId={sizeId} cart={cart} onToggle={toggleService} onQtyChange={changeQty} />
            ) : null}

            {visibleSections.includes("build") ? (
              <ServiceSection title={t.sectionBuildTitle} desc={t.sectionBuildDesc} services={STRUCTURE_SERVICES} locale={locale} sizeId={sizeId} cart={cart} onToggle={toggleService} onQtyChange={changeQty} />
            ) : null}

            {visibleSections.includes("idea") ? (
              <ServiceSection title={t.sectionIdeaTitle} desc={t.sectionIdeaDesc} services={DESIGN_DIRECTION_SERVICES} locale={locale} sizeId={sizeId} cart={cart} onToggle={toggleService} onQtyChange={changeQty} />
            ) : null}

            {visibleSections.includes("after") ? (
              <ServiceSection title={t.sectionAfterTitle} desc={t.sectionAfterDesc} services={NEXT_PHASE_SERVICES} locale={locale} sizeId={sizeId} cart={cart} onToggle={toggleService} onQtyChange={changeQty} />
            ) : null}

            {visibleSections.includes("city") ? (
              <ServiceSection title={t.sectionCityTitle} desc={t.sectionCityDesc} services={RARE_TECHNICAL_SERVICES} locale={locale} sizeId={sizeId} cart={cart} onToggle={toggleService} onQtyChange={changeQty} />
            ) : null}

            {visibleSections.includes("help") ? (
              <ServiceSection title={t.sectionHelpTitle} desc={t.sectionHelpDesc} services={HOURLY_SERVICES} locale={locale} sizeId={sizeId} cart={cart} onToggle={toggleService} onQtyChange={changeQty} />
            ) : null}

            <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{t.notesTitle}</h2>
                  <p className="mt-2 max-w-3xl text-sm text-slate-600">{t.notesDesc}</p>
                </div>
                <button type="button" onClick={handleFreeCall} className="rounded-2xl border border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">{t.freeCall}</button>
              </div>
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">{t.contractorHint}</div>
              <textarea ref={notesRef} value={notes} onChange={(e) => setNotes(e.target.value)} onFocus={handleNotesFocus} placeholder={t.notesPlaceholder} className="mt-5 h-40 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400" />
            </section>
          </main>

          <aside className="xl:sticky xl:top-4 xl:self-start">
            <div ref={summaryRef} className="space-y-4 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <h2 className="text-2xl font-black text-slate-900">{t.summaryTitle}</h2>
                <p className="mt-2 text-sm text-slate-600">{t.summaryDesc}</p>
              </div>

              <div className="space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                {summary.items.length === 0 ? (
                  <div className="text-sm text-slate-500">{t.noServices}</div>
                ) : (
                  summary.items.map((item, index) => (
                    <div key={`${item.title}-${index}`} className="flex items-start justify-between gap-3 text-sm">
                      <div className="min-w-0 flex-1 text-slate-700">{item.title} {item.qty > 1 ? `x${item.qty}` : ""}</div>
                      <div className="shrink-0 font-bold text-slate-900">{item.price === null ? t.quote : item.price < 0 ? `-${formatPrice(Math.abs(item.price))}` : formatPrice(item.price)}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 p-4">
                <div className="mb-4 flex items-end justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.totalProject}</span>
                  <span className="text-3xl font-black">{formatPrice(summary.total)}</span>
                </div>

                {!summary.needsQuote && summary.total > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                      <span className="text-[10px] font-black uppercase text-emerald-700">{t.deposit}</span>
                      <span className="text-lg font-black text-emerald-700">{formatPrice(summary.deposit)}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-2xl bg-slate-100 p-4">
                      <span className="text-[10px] font-black uppercase text-slate-600">{t.balance}</span>
                      <span className="text-lg font-black text-slate-700">{formatPrice(summary.remaining)}</span>
                    </div>
                  </div>
                ) : null}

                {summary.needsQuote ? <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">{t.quoteNotice}</div> : null}
              </div>

              <button type="button" disabled={summary.items.length === 0} onClick={handlePrimaryAction} className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white transition hover:bg-black disabled:bg-slate-200 disabled:text-slate-400">
                {summary.needsQuote ? t.requestQuote : t.payDeposit}
              </button>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
                <div className="font-bold">{t.step2Title}</div>
                <p className="mt-1">{t.step2Desc}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <a href={whatsappHref} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                  <MessageCircle size={20} />
                  {t.sendWhatsapp}
                </a>
                <a href={textHref} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                  <MessageSquare size={20} />
                  {t.sendText}
                </a>
              </div>

              <button type="button" onClick={handleCopy} className="flex w-full items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition hover:text-slate-900">
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? t.copied : t.copyRequest}
              </button>

              <label className={`flex gap-3 rounded-2xl border p-4 text-[12px] leading-relaxed ${attemptedSubmit && !agreed ? "border-red-300 bg-red-50 text-red-800" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                <input type="checkbox" checked={agreed} onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (e.target.checked) setAttemptedSubmit(false);
                }} className="mt-1 h-5 w-5 rounded border-slate-300 accent-slate-900" />
                <span>{t.agreement}</span>
              </label>

              {attemptedSubmit && !agreed ? <p className="text-sm font-medium text-red-600">{t.agreementError}</p> : null}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.requestSummary}</div>
                <textarea readOnly value={requestBody} className="mt-3 h-56 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700" />
              </div>

              <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">{t.phoneNote}</div>
            </div>
          </aside>
        </div>
      </div>

      <div className="pointer-events-none fixed inset-x-0 bottom-3 z-40 px-3 md:hidden">
        <div className="pointer-events-auto mx-auto flex max-w-lg items-center gap-3 rounded-2xl border border-slate-300 bg-white/95 p-2.5 shadow-xl backdrop-blur">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.currentTotal}</div>
            <div className="text-lg font-black text-slate-900">{formatPrice(summary.total)}</div>
          </div>
          <button type="button" onClick={scrollToSummary} className="min-h-[50px] rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white">
            {t.checkSummary}
          </button>
        </div>
      </div>
    </div>
  );
}
