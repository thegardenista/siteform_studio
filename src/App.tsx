import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Box,
  Calculator,
  Camera,
  Car,
  Check,
  Copy,
  DraftingCompass,
  Droplets,
  FileText,
  Map,
  MessageCircle,
  Phone,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Trees,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Lang = "en" | "es";
type ViewState = "MENU" | "CONFIG";
type PricingType =
  | "size"
  | "unit"
  | "flat"
  | "hourly"
  | "quote"
  | "tiered-unit"
  | "percentage";

interface Size {
  id: string;
  label: string;
  sublabel: string;
  visual: string;
}

interface Service {
  id: string;
  title: string;
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
  short: string;
  bestFor: string;
  youSend: string;
  youGet: string;
  notIncluded: string;
  helper?: string;
  sampleLabel?: string;
  badgeLabel?: string;
}

const WHATSAPP_NUMBER = "15551234567";

const TRANSLATIONS = {
  en: {
    header: "Partner Configurator",
    subheader: "White-label drafting and production support",
    back: "Back to menu",
    selectPath: "What do you need to do?",
    selectPathHelp:
      "Pick one path. Once you go in, everything else disappears so the screen stays clean.",
    startPath: "Start this path",
    activePath: "Active path",
    reviewOrder: "Done, review order",
    propertySize: "Property size",
    projectNotes: "Project notes",
    projectNotesHelp:
      "Add homeowner requests, what is still unclear, or what you want us to watch for.",
    notesPlaceholder: "Add context here. Photos and sketches can go to WhatsApp after this.",
    freeHelpCall: "Free help call",
    freeHelpCallAdded: "Added a request for a call into the notes.",
    summary: "Summary",
    live: "Live",
    nothingSelected: "Nothing selected yet",
    subtotal: "Subtotal",
    total: "Total",
    deposit: "Deposit (70%)",
    remaining: "Remaining later",
    rushFee: "Rush fee",
    containsQuote: "Contains quote-based items.",
    copySummary: "Copy summary",
    copied: "Copied",
    sendWhatsApp: "Send to WhatsApp",
    checkTotal: "Check total and send",
    add: "Add",
    remove: "Remove",
    chooseFirst: "Choose this first",
    quote: "Quote",
    qty: "Qty",
    bestFor: "Best for",
    youSend: "You send",
    youGet: "You get",
    notIncluded: "Not included",
    callRequest: "Please call me to review scope.",
    startSection: "Starting point",
    startSectionDesc:
      "Choose how the job starts: site visit, remote documents, or your existing model.",
    ideaSection: "Who owns the layout idea?",
    ideaSectionDesc:
      "Choose whether you already know the layout or want us to help shape it.",
    afterLayout: "After layout",
    afterLayoutDesc:
      "These are follow-up sheets and pricing aids after the design direction is already chosen.",
    citySection: "HOA and city sheets",
    citySectionDesc:
      "Use these when the layout exists and the project now needs supporting paperwork.",
    buildSection: "Pick the structure",
    buildSectionDesc:
      "Choose the main thing you are building before adding follow-up sheets.",
    buildSupport: "Optional support after structure",
    buildSupportDesc:
      "Use these only after the structure or feature is already selected.",
    quickSection: "Quick concept image",
    quickSectionDesc: "Send the photo, get one fast concept image, and use it to help close the sale.",
    specialSection: "Special drawings and estimating support",
    specialSectionDesc:
      "Use these when the layout already exists and you only need the right sheet or pricing support.",
    supportSection: "Extra help",
    supportSectionDesc: "Calls, travel, revisions, and rush handling.",
    summaryJump: "Check total and send",
  },
  es: {
    header: "Configurador para socios",
    subheader: "Apoyo white-label de planos y producción",
    back: "Volver al menú",
    selectPath: "¿Qué necesitas hacer?",
    selectPathHelp:
      "Elige una ruta. Cuando entras, lo demás desaparece para que la pantalla quede limpia.",
    startPath: "Empezar esta ruta",
    activePath: "Ruta activa",
    reviewOrder: "Listo, revisar pedido",
    propertySize: "Tamaño del lote",
    projectNotes: "Notas del proyecto",
    projectNotesHelp:
      "Agrega pedidos del cliente, dudas pendientes o cosas que debamos vigilar.",
    notesPlaceholder: "Agrega contexto aquí. Luego puedes mandar fotos y sketches por WhatsApp.",
    freeHelpCall: "Llamada gratis",
    freeHelpCallAdded: "Se agregó una solicitud de llamada en las notas.",
    summary: "Resumen",
    live: "En vivo",
    nothingSelected: "Todavía no hay servicios seleccionados",
    subtotal: "Subtotal",
    total: "Total",
    deposit: "Depósito (70%)",
    remaining: "Restante después",
    rushFee: "Cargo urgente",
    containsQuote: "Incluye partidas por cotizar.",
    copySummary: "Copiar resumen",
    copied: "Copiado",
    sendWhatsApp: "Enviar por WhatsApp",
    checkTotal: "Revisar total y enviar",
    add: "Agregar",
    remove: "Quitar",
    chooseFirst: "Elige esto primero",
    quote: "Cotizar",
    qty: "Cant.",
    bestFor: "Ideal para",
    youSend: "Tú mandas",
    youGet: "Recibes",
    notIncluded: "No incluido",
    callRequest: "Por favor llámame para revisar el alcance.",
    startSection: "Punto de inicio",
    startSectionDesc:
      "Elige cómo empieza el trabajo: visita, documentos remotos o tu modelo existente.",
    ideaSection: "¿Quién define la idea del layout?",
    ideaSectionDesc:
      "Elige si ya conoces el layout o si quieres que te ayudemos a formarlo.",
    afterLayout: "Después del layout",
    afterLayoutDesc:
      "Estas son láminas de seguimiento y apoyo de precios cuando la dirección del diseño ya está elegida.",
    citySection: "Láminas HOA y ciudad",
    citySectionDesc:
      "Úsalas cuando el layout ya existe y el proyecto necesita papeles de apoyo.",
    buildSection: "Escoge la estructura",
    buildSectionDesc:
      "Elige la estructura principal antes de agregar láminas de seguimiento.",
    buildSupport: "Apoyo opcional después de la estructura",
    buildSupportDesc:
      "Úsalo solo después de elegir la estructura o el feature.",
    quickSection: "Imagen conceptual rápida",
    quickSectionDesc: "Manda la foto, recibe una imagen rápida y úsala para ayudar a cerrar la venta.",
    specialSection: "Planos especiales y apoyo de estimación",
    specialSectionDesc:
      "Úsalo cuando el layout ya existe y solo necesitas la lámina correcta o apoyo de precios.",
    supportSection: "Ayuda extra",
    supportSectionDesc: "Llamadas, viajes, revisiones y manejo urgente.",
    summaryJump: "Revisar total y enviar",
  },
} as const;

const SIZES: Size[] = [
  { id: "small", label: "Small", sublabel: "under 1/4 ac", visual: "🏠" },
  { id: "medium", label: "Medium", sublabel: "around 1/2 ac", visual: "🏡" },
  { id: "large", label: "Large", sublabel: "1/2-1 ac", visual: "🌿" },
  { id: "estate", label: "Estate", sublabel: "1-2 ac", visual: "🌳" },
];

const ENTRY_PATHS = [
  {
    id: "quick-sale",
    title: "Quick idea to help close the sale",
    titleEs: "Idea rápida para cerrar la venta",
    description: "One fast concept image from a site photo.",
    descriptionEs: "Una imagen conceptual rápida a partir de una foto del sitio.",
    helper: "Best when you just need to show the homeowner one clear idea fast.",
    helperEs: "Ideal cuando solo necesitas mostrarle al cliente una idea clara y rápida.",
  },
  {
    id: "build-one",
    title: "Build one specific thing",
    titleEs: "Construir una sola cosa",
    description: "Deck, pergola, carport, kitchen, retaining wall, or one feature.",
    descriptionEs: "Deck, pérgola, carport, cocina exterior, muro o una sola pieza.",
    helper: "Best when the job is one clear object, not the whole yard.",
    helperEs: "Ideal cuando el trabajo es una sola estructura, no todo el patio.",
  },
  {
    id: "full-design",
    title: "Landscape design",
    titleEs: "Diseño de landscape",
    description: "Choose lot size, starting point, and who owns the layout idea.",
    descriptionEs: "Elige tamaño del lote, punto de inicio y quién define la idea del layout.",
    helper: "Best when the whole yard needs planning, not just one structure.",
    helperEs: "Ideal cuando todo el patio necesita planeación, no solo una estructura.",
  },
  {
    id: "special-drawings",
    title: "Special drawings",
    titleEs: "Planos especiales",
    description: "Planting plan, hardscape plan, irrigation drawing, take-off, HOA / city sheets.",
    descriptionEs: "Planting plan, hardscape, riego, take-off, HOA o láminas para ciudad.",
    helper: "Best when the layout already exists and you only need the right sheet.",
    helperEs: "Ideal cuando el layout ya existe y solo falta la lámina correcta.",
  },
] as const;

const STARTING_POINT_SERVICES: Service[] = [
  {
    id: "on-site-start",
    title: "Site Visit + Base Plan + 3D Model",
    category: "Start",
    icon: Camera,
    pricingType: "size",
    prices: { small: 300, medium: 400, large: 550, estate: null },
    short:
      "We come out, collect measurements, photos, and video, and build the project base. We make the map of the yard as it is now.",
    bestFor: "Local jobs where you need real site information before anything else starts.",
    youSend: "Site address, access details, and any survey or plans you already have.",
    youGet:
      "Site measurements, photos, video, a 2D base plan, and a 3D model of existing conditions.",
    notIncluded: "Boundary survey, legal survey work, engineering, permits, or final design.",
  },
  {
    id: "survey-documents-start",
    title: "Remote Base Plan + 3D Model",
    category: "Start",
    icon: Map,
    pricingType: "size",
    prices: { small: 200, medium: 300, large: 450, estate: null },
    short:
      "No site visit. You send survey, photos, PDFs, or sketches, and we build the base remotely. This is the map of the yard based on the information you send.",
    bestFor:
      "Out-of-town jobs or jobs where you already have enough information to get started.",
    youSend:
      "Survey, photos, PDFs, redlines, measurements, or even a hand-drawn sketch on a napkin.",
    youGet: "A clean 2D base plan and a 3D model built from the information you send.",
    notIncluded: "Site visit, legal survey work, engineering, permits, or final design.",
  },
  {
    id: "client-model-start",
    title: "Your 3D Model, We Render It",
    category: "Start",
    icon: Box,
    pricingType: "size",
    prices: { small: 350, medium: 500, large: 750, estate: null },
    short:
      "You send your 3D model, and we clean and prep it so we can render it and make it useful.",
    bestFor:
      "Jobs where you already have a model and just need it cleaned up and presented properly.",
    youSend: "Your 3D model, notes, survey, PDFs, sketches, and material list.",
    youGet: "A cleaned-up model ready for rendering plus rendered views for review or presentation.",
    notIncluded:
      "Full redesign, engineering, permits, or rebuilding the whole job from scratch unless added separately.",
  },
  {
    id: "photo-concept-start",
    title: "One Quick Concept Image",
    category: "Start",
    icon: Trees,
    pricingType: "size",
    prices: { small: 150, medium: 150, large: 150, estate: null },
    short:
      "Take a site photo, send it to us, and for $150 we create one quick concept image plus a short list of suggested materials or key features.",
    bestFor:
      "Fast sales. This is the easiest way to show a homeowner an idea before full design work starts.",
    youSend:
      "Site photos, rough dimensions if you have them, and a few notes about what you want to show.",
    youGet:
      "One concept image and a short list of suggested materials or main features used in the concept.",
    notIncluded:
      "Accurate site model, construction-ready drawings, engineering, permits, or final design documentation.",
    sampleLabel: "See sample",
    badgeLabel: "Best seller",
  },
];

const STRUCTURE_SERVICES: Service[] = [
  {
    id: "deck-small",
    title: "Small Deck Package under 200 sq.ft",
    category: "Build",
    icon: Box,
    pricingType: "flat",
    flatPrice: 1000,
    short: "Layout, AutoCAD plan set, and 3D visuals for a small deck.",
    bestFor: "Smaller deck jobs that need a clean package by default.",
    youSend: "Site plan, preferred location, dimensions, and reference ideas if any.",
    youGet: "Deck layout, AutoCAD plans, and 3D visuals. HOA-ready plan set by default.",
    notIncluded: "Structural engineering, stamped drawings, or permit filing by us.",
    sampleLabel: "See sample",
  },
  {
    id: "pergola-small",
    title: "Small Pergola Package under 200 sq.ft",
    category: "Build",
    icon: Box,
    pricingType: "flat",
    flatPrice: 1000,
    short: "Layout, AutoCAD plan set, and 3D visuals for a small pergola.",
    bestFor: "Smaller pergola jobs that need a clean package by default.",
    youSend: "Site plan, preferred location, dimensions, and reference ideas if any.",
    youGet: "Pergola layout, AutoCAD plans, and 3D visuals. HOA-ready plan set by default.",
    notIncluded: "Structural engineering, stamped drawings, or permit filing by us.",
    sampleLabel: "See sample",
  },
  {
    id: "carport-package",
    title: "Carport Package",
    category: "Build",
    icon: Box,
    pricingType: "quote",
    short:
      "Concept layout, plan support, and 3D visuals for a carport or covered parking structure.",
    bestFor:
      "Carport or covered parking ideas that need a clear concept before engineering or permit work.",
    youSend:
      "Site plan, dimensions, clearance notes, parking needs, and reference images if you have them.",
    youGet: "A conceptual carport layout with plan support and 3D visuals.",
    notIncluded:
      "Structural engineering, stamped permit drawings, utility coordination, or permit filing by us.",
    sampleLabel: "See sample",
  },
  {
    id: "deck-pergola-permit",
    title: "Large Deck / Pergola Package",
    category: "Build",
    icon: ShieldCheck,
    pricingType: "quote",
    short:
      "3D visuals and plan set prepared so an engineer can understand the job and take it from there.",
    bestFor:
      "Larger deck or pergola jobs that need a clearer package before engineering.",
    youSend: "Survey, dimensions, preferred layout, and any requirements you already have.",
    youGet: "3D visuals and plans prepared for engineer review and structural follow-up.",
    notIncluded:
      "Structural engineering, stamped permit drawings, permit fees, or permit filing by us.",
    sampleLabel: "See sample",
  },
  {
    id: "outdoor-kitchen",
    title: "Outdoor Kitchen Package",
    category: "Build",
    icon: Box,
    pricingType: "flat",
    flatPrice: 750,
    short:
      "Concept layout, AutoCAD plan support, appliance zones, clearances, and 3D visuals.",
    bestFor: "You need a clean concept package before detailed utility or shop work.",
    youSend: "Site plan, rough wish list, preferred appliance notes, and size limits.",
    youGet: "A conceptual outdoor kitchen layout with plan support and 3D visuals.",
    notIncluded:
      "Utility design, permit documents, appliance specification package, or construction drawings.",
    sampleLabel: "See sample",
  },
  {
    id: "specialty-feature",
    title: "Feature Add-On",
    category: "Build",
    icon: Trees,
    pricingType: "flat",
    flatPrice: 500,
    short: "Concept add-on for wet bar, fire pit area, play area, or water feature.",
    bestFor: "You want one smaller feature added to the overall concept.",
    youSend: "Plan, photos, and direction for the specific feature.",
    youGet: "Concept-level layout, plan support, and 3D visuals for that feature.",
    notIncluded: "Engineering, permit documents, utility design, or construction detailing.",
    sampleLabel: "See sample",
  },
  {
    id: "retaining-wall",
    title: "Retaining Wall Concept",
    category: "Build",
    icon: ShieldCheck,
    pricingType: "quote",
    short: "Non-engineered retaining wall layout with visuals and plan support.",
    bestFor: "You need early retaining wall direction before engineering is brought in.",
    youSend: "Survey, grades if available, photos, and wall intent.",
    youGet: "A conceptual retaining wall layout with visuals and plan support.",
    notIncluded: "Structural design, stamped engineering, or final construction drawings.",
    sampleLabel: "See sample",
  },
];

const DESIGN_DIRECTION_SERVICES: Service[] = [
  {
    id: "design-execution-under-your-direction",
    title: "You Bring the Idea, We Draw It",
    category: "Idea",
    icon: Wrench,
    pricingType: "size",
    prices: { small: 500, medium: 800, large: 1300, estate: null },
    short:
      "You already know what you want. We turn your idea, sketch, or markup into a clean model and presentation.",
    bestFor:
      "Contractors who already have the idea but need help making it look clear and sellable.",
    youSend:
      "Markups, sketches, references, dimensions, material list, revisions, or even a hand-drawn sketch on a napkin.",
    youGet:
      "A developed 3D model, review visuals, and layout support so the idea is clear before the next step.",
    notIncluded:
      "Engineering, permit drawings, detailed production sheets, or takeoffs unless added later.",
    helper: "This is the right choice when you are the one driving the layout.",
  },
  {
    id: "we-handle-the-design",
    title: "We Help Design It",
    category: "Idea",
    icon: Sparkles,
    pricingType: "size",
    prices: { small: 1000, medium: 1500, large: 2200, estate: null },
    short:
      "You send the site information and goals, and we help figure out the layout, model it, and show it clearly.",
    bestFor: "Contractors who have the lead but do not want to solve the layout alone.",
    youSend:
      "Survey, measurements, photos, style references, must-haves, rough budget level, and site constraints.",
    youGet: "Layout help, 3D design modeling, and review visuals.",
    notIncluded:
      "Engineering, permit package, stamped drawings, planting plans, takeoffs, or detailed production sheets unless added later.",
    helper: "This is the right choice when you want us to help shape the idea, not just draft it.",
  },
];

const NEXT_PHASE_SERVICES: Service[] = [
  {
    id: "master-plan",
    title: "Clean 2D Master Plan",
    category: "After layout",
    icon: DraftingCompass,
    pricingType: "size",
    prices: { small: 200, medium: 350, large: 700, estate: null },
    short: "Clean 2D plan drafted from an approved layout or approved model.",
    bestFor: "The layout is locked and now you need the drawing package started.",
    youSend: "Approved model, approved layout, redlines, or sketches.",
    youGet: "A clean 2D master plan ready to print and show to the crew.",
    notIncluded: "New concept design, engineering, or permit approval.",
    sampleLabel: "See sample",
  },
  {
    id: "planting-plan",
    title: "Planting Plan + Schedule",
    category: "After layout",
    icon: Trees,
    pricingType: "size",
    prices: { small: 200, medium: 350, large: 550, estate: null },
    short: "Technical planting sheet for the approved layout.",
    bestFor: "Planting is moving forward and the crew needs a clean sheet.",
    youSend: "Approved plan or model plus any plant direction or list if already chosen.",
    youGet: "A planting plan with schedule and quantities, ready to print and show to the crew.",
    notIncluded: "Nursery sourcing, irrigation design, or new layout exploration.",
    sampleLabel: "See sample",
  },
  {
    id: "paving-plan",
    title: "Patio / Hardscape Plan",
    category: "After layout",
    icon: DraftingCompass,
    pricingType: "size",
    prices: { small: 200, medium: 350, large: 550, estate: null },
    short: "A clean hardscape layout based on the approved design.",
    bestFor: "Patio, paving, or hardscape is approved and now needs a dedicated sheet.",
    youSend: "Approved plan or model, material notes, and edge details if known.",
    youGet:
      "A hardscape plan showing layout, materials, and main paved areas, ready to print and show to the crew.",
    notIncluded:
      "Engineering, structural base design, drainage engineering, or construction details unless added separately.",
    sampleLabel: "See sample",
  },
  {
    id: "fence-gate",
    title: "Fence + Gate Plan",
    category: "After layout",
    icon: ShieldCheck,
    pricingType: "size",
    prices: { small: 200, medium: 250, large: 300, estate: null },
    short: "Alignment plan for the approved fence and gate layout.",
    bestFor:
      "Fence and gate locations are known and just need to be documented clearly.",
    youSend: "Survey, approved locations, and gate notes.",
    youGet: "A fence and gate alignment plan, ready to print and show to the crew.",
    notIncluded: "Structural details, fabrication drawings, or engineering.",
    sampleLabel: "See sample",
  },
  {
    id: "grading",
    title: "Grading + Drainage Concept",
    category: "After layout",
    icon: DraftingCompass,
    pricingType: "size",
    prices: { small: 500, medium: 700, large: 1000, estate: null },
    short: "Non-engineered grading and drainage concept for the approved layout.",
    bestFor: "The site needs slope or drainage thinking after the layout is locked.",
    youSend: "Survey, grades if available, approved design, and scope of improvements.",
    youGet: "A conceptual grading and drainage sheet, ready to print and show to the crew.",
    notIncluded: "Civil engineering, stamped grading plans, or drainage calculations.",
    sampleLabel: "See sample",
  },
  {
    id: "irrigation-drafting",
    title: "Irrigation Drawing from Your Markups",
    category: "After layout",
    icon: Droplets,
    pricingType: "tiered-unit",
    unitPrices: { small: 100, medium: 200, large: 400, estate: null },
    quantityEnabled: true,
    quantityLabel: "sheets",
    short: "Drafting only from irrigation markups or paper layout.",
    bestFor:
      "Guys who already know the irrigation layout and just need it cleaned up on screen.",
    youSend: "Field markups, hand sketches, redlines, and any base files.",
    youGet: "Clean computer-drafted irrigation sheets, ready to print and show to the crew.",
    notIncluded:
      "Irrigation design, engineering, hydraulic calculations, or installation specifications.",
    sampleLabel: "See sample",
  },
  {
    id: "watering-concept",
    title: "Basic Watering Layout",
    category: "After layout",
    icon: Droplets,
    pricingType: "size",
    prices: { small: 200, medium: 250, large: 300, estate: null },
    short: "A simple non-engineered watering approach for the approved layout.",
    bestFor:
      "You want a simple watering strategy shown before full irrigation work happens.",
    youSend: "Approved plan and planting direction.",
    youGet: "General watering zones, head placement strategy, and coverage notes.",
    notIncluded: "Pipe sizing, specs, hydraulic design, or installation diagrams.",
    sampleLabel: "See sample",
  },
  {
    id: "lighting",
    title: "Lighting Concept",
    category: "After layout",
    icon: Trees,
    pricingType: "size",
    prices: { small: 200, medium: 250, large: 300, estate: null },
    short: "2D lighting concept with optional 3D support.",
    bestFor: "The approved design needs a lighting layer added.",
    youSend: "Approved plan, focal points, and lighting direction if known.",
    youGet: "A conceptual lighting layout, ready to print and show to the crew.",
    notIncluded: "Electrical design, wiring plans, or installation drawings.",
    sampleLabel: "See sample",
  },
  {
    id: "takeoff",
    title: "Material Quantities / Take-Off",
    category: "After layout",
    icon: FileText,
    pricingType: "size",
    prices: { small: 200, medium: 350, large: 700, estate: null },
    short: "Material quantities and dimensions from the approved 3D or 2D design.",
    bestFor: "The layout is locked and you are ready to price the job.",
    youSend: "Approved plan or model.",
    youGet: "Quantities and dimensions based on the approved scope.",
    notIncluded: "Purchasing, vendor follow-up, or field verification.",
    sampleLabel: "See sample",
  },
  {
    id: "preliminary-estimate",
    title: "Rough Estimate from Your Numbers",
    category: "After layout",
    icon: Calculator,
    pricingType: "size",
    prices: { small: 250, medium: 350, large: 500, estate: null },
    short:
      "A rough project cost built from the approved take-off using your rates, crew hours, and pricing rules.",
    bestFor:
      "Teams that want a working budget based on their own numbers before sending a final quote.",
    youSend:
      "Approved take-off, labor rates, crew hours or production assumptions, markups, equipment rates, and any material pricing you want used.",
    youGet:
      "A preliminary cost breakdown based on the approved scope and the pricing information you provide.",
    notIncluded: "Final bid, vendor-confirmed pricing, purchasing, or guaranteed job cost.",
    helper:
      "This is a planning number only. Final pricing depends on actual contractor rates, vendor quotes, site conditions, and field verification.",
    sampleLabel: "See sample",
  },
  {
    id: "budget-range",
    title: "Ballpark Budget Range",
    category: "After layout",
    icon: Calculator,
    pricingType: "size",
    prices: { small: 200, medium: 300, large: 450, estate: null },
    short:
      "A rough budget range based on the approved take-off and typical market pricing assumptions.",
    bestFor: "Teams that need a ballpark number before building a real estimate.",
    youSend:
      "Approved take-off, project location, and any notes about materials, quality level, or build expectations.",
    youGet: "A rough budget range to help with early planning and client discussion.",
    notIncluded: "Final bid, vendor quotes, exact contractor pricing, purchasing, or guaranteed totals.",
    helper: "This is a rough market-based budget only, not a contractor quote or bid.",
    sampleLabel: "See sample",
  },
  {
    id: "watercolor-render",
    title: "Rendered Plan Sheet",
    category: "After layout",
    icon: Trees,
    pricingType: "unit",
    unitPrice: 100,
    quantityEnabled: true,
    quantityLabel: "sheets",
    short: "Rendered presentation sheet from a provided CAD plan.",
    bestFor: "You already have the plan and want it to look good in front of the client.",
    youSend: "Provided CAD plan.",
    youGet: "High-resolution rendered JPG or PDF.",
    notIncluded: "Design revisions or new CAD work.",
    sampleLabel: "See sample",
  },
];

const RARE_TECHNICAL_SERVICES: Service[] = [
  {
    id: "hoa-city",
    title: "HOA / City Submittal Sheet",
    category: "City",
    icon: ShieldCheck,
    pricingType: "size",
    prices: { small: 300, medium: 400, large: 600, estate: null },
    short: "Add-on submittal sheet from an approved layout and existing survey.",
    bestFor:
      "Best when the base and layout already exist and you now need something to send to HOA or the city.",
    youSend: "Approved design, survey, and any checklist or notes you already have.",
    youGet: "A design-intent submittal sheet, ready to print and show if needed.",
    notIncluded: "Approval guarantee, engineering, or legal survey work.",
    sampleLabel: "See sample",
  },
  {
    id: "impervious",
    title: "City Coverage Calculation",
    category: "City",
    icon: ShieldCheck,
    pricingType: "size",
    prices: { small: 300, medium: 450, large: 650, estate: null },
    short: "Add-on coverage calculation sheet from an approved base and layout.",
    bestFor: "Best when the city cares how much hardscape or coverage is going on the lot.",
    youSend: "Survey, existing hardscape information, and approved improvements.",
    youGet: "Coverage sheet and calculation summary.",
    notIncluded: "Engineering certification or approval guarantee.",
    sampleLabel: "See sample",
  },
  {
    id: "tree-overlay",
    title: "Tree / CRZ Overlay",
    category: "City",
    icon: Trees,
    pricingType: "size",
    prices: { small: 500, medium: 700, large: 1000, estate: null },
    short:
      "Add-on tree / CRZ overlay based on certified tree data and an approved layout.",
    bestFor:
      "Best when protected trees now need to be shown clearly on top of the job.",
    youSend: "Certified tree survey or tree inventory plus approved design references.",
    youGet: "A tree preservation or CRZ overlay sheet.",
    notIncluded: "Arborist report or legal determination by the jurisdiction.",
    sampleLabel: "See sample",
  },
];

const HOURLY_SERVICES: Service[] = [
  {
    id: "phone-consult",
    title: "Video / Phone Consultation",
    category: "Help",
    icon: Phone,
    pricingType: "hourly",
    hourlyRate: 70,
    quantityEnabled: true,
    quantityLabel: "hours",
    short: "Talk through scope, layout questions, options, or handoff needs.",
    bestFor: "Short planning calls before work starts or between phases.",
    youSend: "Your questions, files, and topic list.",
    youGet: "Live consultation time.",
    notIncluded: "Design deliverables unless purchased separately.",
  },
  {
    id: "additional-site-visit",
    title: "Additional Site Visit",
    category: "Help",
    icon: Camera,
    pricingType: "hourly",
    hourlyRate: 70,
    quantityEnabled: true,
    quantityLabel: "hours",
    short: "Extra on-site time beyond the standard visit or for a follow-up visit.",
    bestFor: "Jobs that need another field check after the first round.",
    youSend: "Site address, access details, and what needs to be checked.",
    youGet: "Additional on-site support time.",
    notIncluded: "Travel time unless selected separately.",
  },
  {
    id: "travel-time",
    title: "Travel Time",
    category: "Help",
    icon: Car,
    pricingType: "hourly",
    hourlyRate: 70,
    quantityEnabled: true,
    quantityLabel: "hours",
    short: "Travel billed separately when applicable.",
    bestFor: "On-site work outside the normal local range or longer field days.",
    youSend: "Job location.",
    youGet: "Reserved travel time.",
    notIncluded: "On-site work time unless selected separately.",
  },
  {
    id: "revision-redesign",
    title: "Additional Revision / Redesign",
    category: "Help",
    icon: RefreshCcw,
    pricingType: "hourly",
    hourlyRate: 70,
    quantityEnabled: true,
    quantityLabel: "hours",
    short:
      "Extra changes after the included round or after the layout is already locked.",
    bestFor: "When someone changes direction after approval or wants a new version.",
    youSend: "Clear revision notes and updated direction.",
    youGet: "Additional redesign time.",
    notIncluded:
      "A full new package unless enough hours are purchased or separately quoted.",
  },
  {
    id: "rush-fee",
    title: "Rush Fee",
    category: "Help",
    icon: Zap,
    pricingType: "percentage",
    percentRate: 0.25,
    displayPriceLabel: "+25%",
    short: "Rush turnaround fee added to the priced work in the cart.",
    bestFor: "Tight deadlines that need priority scheduling.",
    youSend: "Required due date and delivery expectations.",
    youGet: "Priority scheduling when available.",
    notIncluded: "Guaranteed acceptance of impossible timelines.",
  },
];

const formatPrice = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return "Quote";
  return `$${value.toLocaleString("en-US")}`;
};

const getBaseUnitPrice = (service: Service, sizeId: string): number | null => {
  if (service.pricingType === "size") return service.prices?.[sizeId] ?? null;
  if (service.pricingType === "flat") return service.flatPrice ?? null;
  if (service.pricingType === "unit") return service.unitPrice ?? null;
  if (service.pricingType === "hourly") return service.hourlyRate ?? null;
  if (service.pricingType === "tiered-unit") return service.unitPrices?.[sizeId] ?? null;
  return null;
};

const getLinePrice = (service: Service, sizeId: string, qty = 1): number | null => {
  if (service.pricingType === "quote" || service.pricingType === "percentage") return null;
  const unit = getBaseUnitPrice(service, sizeId);
  return unit !== null ? unit * qty : null;
};

const hasLayoutSourceSelection = (selectedIds: string[]) =>
  selectedIds.some(
    (id) =>
      DESIGN_DIRECTION_SERVICES.some((service) => service.id === id) ||
      STRUCTURE_SERVICES.some((service) => service.id === id),
  );

const hasStartingPointSelection = (selectedIds: string[]) =>
  selectedIds.some(
    (id) => STARTING_POINT_SERVICES.some((service) => service.id === id && service.id !== "photo-concept-start"),
  );

function runSelfTests() {
  console.assert(formatPrice(1200) === "$1,200", "formatPrice failed");
  console.assert(
    getBaseUnitPrice({ pricingType: "unit", unitPrice: 120 } as Service, "small") === 120,
    "unit pricing failed",
  );
  console.assert(
    getBaseUnitPrice({ pricingType: "hourly", hourlyRate: 70 } as Service, "small") === 70,
    "hourly pricing failed",
  );
  console.assert(
    getBaseUnitPrice({ pricingType: "tiered-unit", unitPrices: { small: 100 } } as Service, "small") === 100,
    "tiered-unit pricing failed",
  );
  console.assert(
    getLinePrice({ pricingType: "flat", flatPrice: 500 } as Service, "small", 2) === 1000,
    "flat line pricing failed",
  );
  console.assert(getLinePrice({ pricingType: "quote" } as Service, "small", 1) === null, "quote pricing failed");
  console.assert(Math.round(1000 * 0.7) === 700, "deposit math failed");
  console.assert(Math.round(1000 * 0.25) === 250, "rush fee math failed");
  console.assert(hasLayoutSourceSelection(["deck-small"]) === true, "structure should count as layout source");
  console.assert(
    hasLayoutSourceSelection(["design-execution-under-your-direction"]) === true,
    "design path should count as layout source",
  );
  console.assert(
    hasLayoutSourceSelection(["on-site-start"]) === false,
    "start service alone should not count as layout source",
  );
}

try {
  runSelfTests();
} catch (error) {
  console.warn("Configurator self-tests failed", error);
}

function Pill({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "green" | "amber" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
  } as const;

  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

function QtyControl({ value, onChange, label }: { value: number; onChange: (q: number) => void; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="h-8 w-8 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
      >
        −
      </button>
      <div className="min-w-[72px] text-center text-xs font-semibold text-slate-600">
        {value} {label}
      </div>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="h-8 w-8 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
      >
        +
      </button>
    </div>
  );
}

function Header({
  view,
  setView,
  lang,
  setLang,
}: {
  view: ViewState;
  setView: (view: ViewState) => void;
  lang: Lang;
  setLang: (lang: Lang) => void;
}) {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 px-4 py-4 backdrop-blur-md md:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black md:text-2xl">{t.header}</h1>
          <p className="hidden text-xs text-slate-500 md:block">{t.subheader}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 hover:border-slate-900"
          >
            {lang === "en" ? "Español 🇲🇽" : "English 🇺🇸"}
          </button>

          {view === "CONFIG" ? (
            <button
              type="button"
              onClick={() => setView("MENU")}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.back}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}

function MainMenu({ onSelect, lang }: { onSelect: (id: string) => void; lang: Lang }) {
  const t = TRANSLATIONS[lang];

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">{t.selectPath}</h2>
        <p className="mt-2 text-sm text-slate-500">{t.selectPathHelp}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {ENTRY_PATHS.map((path) => (
          <button
            key={path.id}
            type="button"
            onClick={() => onSelect(path.id)}
            className="group rounded-[2rem] border-2 border-slate-100 bg-white p-6 text-left transition-all hover:border-slate-900 hover:shadow-sm"
          >
            <div className="text-xl font-black text-slate-900">{lang === "en" ? path.title : path.titleEs}</div>
            <p className="mt-2 text-sm text-slate-500">{lang === "en" ? path.description : path.descriptionEs}</p>
            <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
              {lang === "en" ? path.helper : path.helperEs}
            </div>
            <div className="mt-4 inline-flex items-center text-sm font-black text-slate-900">{t.startPath} →</div>
          </button>
        ))}
      </div>
    </section>
  );
}

function SizeSelectionSection({
  selectedSize,
  setSelectedSize,
  lang,
}: {
  selectedSize: string;
  setSelectedSize: (id: string) => void;
  lang: Lang;
}) {
  const t = TRANSLATIONS[lang];

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-5">
        <h3 className="text-2xl font-black tracking-tight text-slate-900">{t.propertySize}</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SIZES.map((size) => {
          const active = size.id === selectedSize;
          return (
            <button
              key={size.id}
              type="button"
              onClick={() => setSelectedSize(size.id)}
              className={`rounded-[1.75rem] border-2 p-5 text-left transition-all ${
                active ? "border-slate-900 bg-slate-900 text-white shadow-lg" : "border-slate-200 bg-white hover:border-slate-900"
              }`}
            >
              <div className="text-3xl">{size.visual}</div>
              <div className="mt-4 text-lg font-black">{size.label}</div>
              <div className={`text-sm ${active ? "text-slate-200" : "text-slate-500"}`}>{size.sublabel}</div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ServiceSection({
  title,
  description,
  services,
  selected,
  onToggle,
  onQuantityChange,
  sizeId,
  lang,
  getDisabledReason,
  tone = "slate",
}: {
  title: string;
  description?: string;
  services: Service[];
  selected: Record<string, number>;
  onToggle: (id: string) => void;
  onQuantityChange: (id: string, qty: number) => void;
  sizeId: string;
  lang: Lang;
  getDisabledReason?: (service: Service) => string | null;
  tone?: "slate" | "green" | "amber";
}) {
  const t = TRANSLATIONS[lang];

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900">{title}</h3>
          {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
        <Pill tone={tone}>{services.length} items</Pill>
      </div>

      <div className="grid gap-5">
        {services.map((service) => {
          const Icon = service.icon;
          const isSelected = Boolean(selected[service.id]);
          const disabledReason = getDisabledReason?.(service) ?? null;
          const priceLabel =
            service.pricingType === "percentage"
              ? service.displayPriceLabel ?? "+25%"
              : formatPrice(getBaseUnitPrice(service, sizeId));

          return (
            <article
              key={service.id}
              className={`rounded-[1.75rem] border p-5 transition-all ${
                isSelected
                  ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                  : disabledReason
                    ? "border-slate-200 bg-slate-50 opacity-80"
                    : "border-slate-200 bg-white hover:border-slate-900 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
