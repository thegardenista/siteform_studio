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
      "Pick one path. Once you go in, the rest disappears so the screen stays clean.",
    startPath: "Start this path",
    activePath: "Active path",
    reviewOrder: "Done, review order",
    propertySize: "Property size",
    projectNotes: "Project notes",
    projectNotesHelp:
      "Questions by text are free. If something is unclear, write it here and send photos in WhatsApp.",
    notesPlaceholder:
      "Add context here. If needed, send photos, sketches, or questions in WhatsApp.",
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
    startSection: "Starting point",
    startSectionDesc:
      "Choose how the job starts: site visit, remote documents, or your existing model.",
    ideaSection: "Who owns the layout idea?",
    ideaSectionDesc:
      "Choose whether you already know the layout or want us to develop the design package with you.",
    afterLayout: "After layout",
    afterLayoutDesc:
      "These are follow-up sheets after the layout is already locked.",
    citySection: "HOA and city sheets",
    citySectionDesc:
      "Use these when the layout already exists and the project needs support paperwork.",
    buildSection: "Pick the structure",
    buildSectionDesc:
      "Choose the main thing you are building. Small deck and pergola packages already include HOA-ready drawings.",
    buildSupport: "Optional support",
    buildSupportDesc:
      "Use these only if the job needs measuring, travel outside city limits, redesign time, or rush handling.",
    quickSection: "Quick concept image",
    quickSectionDesc:
      "Send one site photo in WhatsApp, get one fast concept image back, and use it to help close the sale.",
    specialSection: "Special drawings and pricing support",
    specialSectionDesc:
      "Use these when the layout already exists and you only need the right sheet or early pricing support.",
    irrigationSection: "Licensed irrigator drafting",
    irrigationSectionDesc:
      "Drafting support only for licensed irrigators who already know the irrigation layout and want it cleaned up on screen.",
    supportSection: "Extra help",
    supportSectionDesc:
      "Site visits, travel outside city limits, redesign time, and rush handling.",
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
      "Las preguntas por texto son gratis. Si algo no está claro, escríbelo aquí y manda fotos por WhatsApp.",
    notesPlaceholder:
      "Agrega contexto aquí. Si hace falta, manda fotos, sketches o preguntas por WhatsApp.",
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
    startSection: "Punto de inicio",
    startSectionDesc:
      "Elige cómo empieza el trabajo: visita al sitio, documentos remotos o tu modelo existente.",
    ideaSection: "¿Quién define la idea del layout?",
    ideaSectionDesc:
      "Elige si ya conoces el layout o si quieres que desarrollemos el paquete de diseño contigo.",
    afterLayout: "Después del layout",
    afterLayoutDesc:
      "Estas son láminas de seguimiento cuando el layout ya está cerrado.",
    citySection: "Láminas HOA y ciudad",
    citySectionDesc:
      "Úsalas cuando el layout ya existe y el proyecto necesita papeles de apoyo.",
    buildSection: "Escoge la estructura",
    buildSectionDesc:
      "Elige lo principal que vas a construir. Los paquetes pequeños de deck y pérgola ya incluyen dibujos listos para HOA.",
    buildSupport: "Apoyo opcional",
    buildSupportDesc:
      "Úsalo solo si el trabajo necesita mediciones, viaje fuera de la ciudad, rediseño o urgencia.",
    quickSection: "Imagen conceptual rápida",
    quickSectionDesc:
      "Manda una foto del sitio por WhatsApp, recibe una imagen rápida y úsala para ayudar a cerrar la venta.",
    specialSection: "Planos especiales y apoyo de precios",
    specialSectionDesc:
      "Úsalo cuando el layout ya existe y solo necesitas la lámina correcta o apoyo inicial de precios.",
    irrigationSection: "Dibujo para irrigadores licenciados",
    irrigationSectionDesc:
      "Solo apoyo de dibujo para irrigadores licenciados que ya saben el layout de riego y quieren limpiarlo en pantalla.",
    supportSection: "Ayuda extra",
    supportSectionDesc:
      "Visitas al sitio, viaje fuera de la ciudad, tiempo de rediseño y manejo urgente.",
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
    description: "Planting plans, paving patterns, drainage concepts, take-off, HOA and city sheets.",
    descriptionEs: "Planting plans, patrones de pavimento, drenaje conceptual, take-off, HOA o ciudad.",
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
      "Send one site photo in WhatsApp, and for $150 we create one quick concept image plus a short list of suggested materials or key features.",
    bestFor:
      "Fast sales. This is the easiest way to show a homeowner an idea before full design work starts.",
    youSend:
      "One site photo, rough dimensions if you have them, and a short text about what you want to show.",
    youGet:
      "One concept image and a short list of suggested materials or main features used in the concept.",
    notIncluded:
      "Site visit, calls, accurate site model, construction-ready drawings, engineering, permits, or final design documentation.",
    helper:
      "If something is unclear, send a text question in WhatsApp together with the photo. That is the whole point of this option.",
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
      "You already know what you want. We turn your idea, sketch, or markup into a designed model with a locked layout and clear presentation.",
    bestFor:
      "Contractors who already have the idea but need help making it clear, sellable, and ready for the next phase.",
    youSend:
      "Markups, sketches, references, dimensions, material list, revisions, or even a hand-drawn sketch on a napkin.",
    youGet:
      "A developed design model, locked layout, and review visuals so the design direction is clear before the next step.",
    notIncluded:
      "Engineering, permit drawings, detailed production sheets, or takeoffs unless added later.",
    helper: "This is the right choice when you already know the layout direction and want us to formalize it.",
  },
  {
    id: "we-handle-the-design",
    title: "We Help Design It",
    category: "Idea",
    icon: Sparkles,
    pricingType: "size",
    prices: { small: 1000, medium: 1500, large: 2200, estate: null },
    short:
      "You send the site information and goals, and we develop the design brief, gather references, test intermediate sketch options, and move the job toward the final rendered direction.",
    bestFor:
      "Contractors who have the lead but do not want to solve the design process alone.",
    youSend:
      "Survey, measurements, photos, style references, must-haves, rough budget level, and site constraints.",
    youGet:
      "Design brief work, reference selection, intermediate sketch options, design development, and final direction ready for rendering.",
    notIncluded:
      "Engineering, permit package, stamped drawings, planting plans, takeoffs, or detailed production sheets unless added later.",
    helper: "This is the right choice when you want us to work through the design process, not just draft a fixed idea.",
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
    short: "Clean 2D plan drafted from a locked layout.",
    bestFor: "The layout is locked and now you need the drawing package started.",
    youSend:
      "If we already created the layout, no extra files are needed. If the layout comes from your side, send the approved plan, model, or redlines.",
    youGet: "A clean 2D master plan ready to print and show to the crew.",
    notIncluded: "New concept design, engineering, or permit approval.",
    helper:
      "If the source layout comes from outside our process and needs cleanup before drafting, that may need added time or a separate quote.",
    sampleLabel: "See sample",
  },
  {
    id: "planting-plan",
    title: "Planting Plan + Schedule",
    category: "After layout",
    icon: Trees,
    pricingType: "size",
    prices: { small: 200, medium: 350, large: 550, estate: null },
    short: "Technical planting sheet for a locked layout.",
    bestFor: "Planting is moving forward and the crew needs a clean sheet.",
    youSend:
      "If we already built the layout, no extra base files are needed. If the layout comes from your side, send the approved plan and plant direction or list.",
    youGet: "A planting plan with schedule and quantities, ready to print and show to the crew.",
    notIncluded: "Nursery sourcing, irrigation design, or new layout exploration.",
    helper:
      "If the base layout was not created by us and needs cleanup before planting documentation, that may need added time or a separate quote.",
    sampleLabel: "See sample",
  },
  {
    id: "paving-plan",
    title: "Hardscape Layout / Paving Pattern Plan",
    category: "After layout",
    icon: DraftingCompass,
    pricingType: "size",
    prices: { small: 200, medium: 350, large: 550, estate: null },
    short: "A clean hardscape sheet showing paving layout, material zones, and pattern logic if needed.",
    bestFor: "Hardscape is approved and now needs a dedicated sheet for layout and paving pattern direction.",
    youSend:
      "If we already built the layout, no extra base files are needed. If the layout comes from your side, send the approved plan, materials, and any pattern notes.",
    youGet:
      "A hardscape plan showing layout, materials, paving patterns, and tile or paver direction where needed.",
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
    youSend:
      "If we already built the layout, no extra base files are needed. If the layout comes from your side, send survey, approved locations, and gate notes.",
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
    short: "Non-engineered grading and drainage concept for a locked layout, based on topo or measured elevations.",
    bestFor: "The site needs slope or drainage thinking after the layout is locked.",
    youSend:
      "Topo survey or measured elevations, approved design, and scope of improvements. If no topo exists yet, request a site visit or bring measured data first.",
    youGet: "A conceptual grading and drainage sheet, ready to print and discuss with the crew.",
    notIncluded:
      "Civil engineering, stamped grading plans, drainage calculations, or grading concept made without usable elevation information.",
    sampleLabel: "See sample",
  },
  {
    id: "watering-concept",
    title: "Basic Watering Strategy",
    category: "After layout",
    icon: Droplets,
    pricingType: "size",
    prices: { small: 200, medium: 250, large: 300, estate: null },
    short: "A simple non-engineered plant watering strategy for the approved layout.",
    bestFor:
      "You want clear understanding of sun zones, shade zones, and plant watering needs before detailed irrigation work happens.",
    youSend:
      "Approved plan, planting direction, and any known site notes about shade, sun exposure, or difficult areas.",
    youGet:
      "Sun and shade zone notes, watering logic by area, and recommendations such as drip or other basic watering approach where appropriate.",
    notIncluded: "Pipe sizing, head layout, irrigation specs, hydraulic design, or installation diagrams.",
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
    youSend:
      "If we already built the layout, no extra base files are needed. If the layout comes from your side, send approved plan, focal points, and lighting direction if known.",
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
    youSend: "Approved plan or model if it comes from your side. If we built it, no extra files are needed.",
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
    title: "Impervious Cover Calculation",
    category: "City",
    icon: ShieldCheck,
    pricingType: "size",
    prices: { small: 300, medium: 450, large: 650, estate: null },
    short: "City-style impervious cover calculation sheet from an approved base and layout.",
    bestFor:
      "Best when the jurisdiction cares how much impervious cover or hardscape is going on the lot.",
    youSend: "Survey, existing hardscape information, and approved improvements.",
    youGet: "Impervious cover sheet and calculation summary.",
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
      "Best when protected trees need to be shown clearly on top of the project for review.",
    youSend: "Certified tree survey or tree inventory plus approved design references.",
    youGet: "A tree preservation or CRZ overlay sheet.",
    notIncluded: "Arborist report or legal determination by the jurisdiction.",
    sampleLabel: "See sample",
  },
];

const IRRIGATION_DRAFTING_SERVICES: Service[] = [
  {
    id: "irrigation-drafting",
    title: "Irrigation Drawing from Your Markups",
    category: "Irrigation",
    icon: Droplets,
    pricingType: "tiered-unit",
    unitPrices: { small: 100, medium: 200, large: 400, estate: null },
    quantityEnabled: true,
    quantityLabel: "sheets",
    short: "Drafting only from irrigation markups or paper layout.",
    bestFor:
      "Licensed irrigators who already know the irrigation layout and just need it cleaned up on screen.",
    youSend: "Field markups, hand sketches, redlines, and any base files.",
    youGet: "Clean computer-drafted irrigation sheets, ready to print and show to the crew.",
    notIncluded:
      "Irrigation design, engineering, hydraulic calculations, or installation specifications.",
    sampleLabel: "See sample",
  },
];

const SUPPORT_SERVICES: Service[] = [
  {
    id: "site-visit-support",
    title: "Site Visit for Measurements",
    category: "Help",
    icon: Camera,
    pricingType: "hourly",
    hourlyRate: 70,
    quantityEnabled: true,
    quantityLabel: "hours",
    short: "On-site measuring time when the job needs field data before drafting or redesign.",
    bestFor: "Jobs that do not have enough usable measurements, topo, or base information yet.",
    youSend: "Site address, access details, and what needs to be measured.",
    youGet: "Measured site information and field support time.",
    notIncluded: "Travel time outside city limits unless selected separately.",
  },
  {
    id: "travel-time",
    title: "Travel Time Outside City Limits",
    category: "Help",
    icon: Car,
    pricingType: "hourly",
    hourlyRate: 70,
    quantityEnabled: true,
    quantityLabel: "hours",
    short: "Travel billed separately when the property is outside city limits.",
    bestFor: "On-site work for jobs outside the city where drive time needs to be billed separately.",
    youSend: "Job location.",
    youGet: "Reserved travel time.",
    notIncluded: "On-site work time unless selected separately.",
  },
  {
    id: "revision-redesign",
    title: "Additional Revision / Redesign Time",
    category: "Help",
    icon: RefreshCcw,
    pricingType: "hourly",
    hourlyRate: 70,
    quantityEnabled: true,
    quantityLabel: "hours",
    short:
      "Extra redesign time after the included round or after the layout is already locked.",
    bestFor: "When direction changes after approval or the project needs a larger redraw.",
    youSend: "Clear revision notes and updated direction.",
    youGet: "Additional redesign time.",
    notIncluded:
      "Unlimited revision scope. If a bigger redesign is needed, the required time will be discussed separately, for example 10 extra hours or more.",
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
                  <div className={`rounded-2xl p-3 ${isSelected ? "bg-white/10" : "bg-slate-100"}`}>
                    <Icon className={`h-5 w-5 ${isSelected ? "text-white" : "text-slate-700"}`} />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-black leading-tight">{service.title}</h4>
                      {service.badgeLabel ? <Pill tone="green">{service.badgeLabel}</Pill> : null}
                      {service.sampleLabel ? <Pill>{service.sampleLabel}</Pill> : null}
                    </div>
                    <p className={`mt-2 text-sm leading-6 ${isSelected ? "text-slate-200" : "text-slate-600"}`}>{service.short}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-lg font-black ${isSelected ? "text-white" : "text-slate-900"}`}>{priceLabel}</div>
                  <div className={`text-xs ${isSelected ? "text-slate-300" : "text-slate-500"}`}>{service.category}</div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className={`rounded-2xl p-4 ${isSelected ? "bg-white/10" : "bg-slate-50"}`}>
                  <div className="text-xs font-bold uppercase tracking-wide opacity-70">{t.bestFor}</div>
                  <p className="mt-2 text-sm leading-6">{service.bestFor}</p>
                </div>
                <div className={`rounded-2xl p-4 ${isSelected ? "bg-white/10" : "bg-slate-50"}`}>
                  <div className="text-xs font-bold uppercase tracking-wide opacity-70">{t.youSend}</div>
                  <p className="mt-2 text-sm leading-6">{service.youSend}</p>
                </div>
                <div className={`rounded-2xl p-4 ${isSelected ? "bg-white/10" : "bg-slate-50"}`}>
                  <div className="text-xs font-bold uppercase tracking-wide opacity-70">{t.youGet}</div>
                  <p className="mt-2 text-sm leading-6">{service.youGet}</p>
                </div>
                <div className={`rounded-2xl p-4 ${isSelected ? "bg-white/10" : "bg-slate-50"}`}>
                  <div className="text-xs font-bold uppercase tracking-wide opacity-70">{t.notIncluded}</div>
                  <p className="mt-2 text-sm leading-6">{service.notIncluded}</p>
                </div>
              </div>

              {service.helper ? (
                <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${isSelected ? "border-white/15 bg-white/5 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                  {service.helper}
                </div>
              ) : null}

              {disabledReason ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {disabledReason}
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                {service.quantityEnabled && isSelected ? (
                  <QtyControl
                    value={selected[service.id] ?? 1}
                    onChange={(qty) => onQuantityChange(service.id, qty)}
                    label={service.quantityLabel ?? t.qty.toLowerCase()}
                  />
                ) : (
                  <div className="text-sm text-slate-500">{isSelected ? `${t.qty}: ${selected[service.id]}` : ""}</div>
                )}

                <button
                  type="button"
                  disabled={Boolean(disabledReason)}
                  onClick={() => onToggle(service.id)}
                  className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition ${
                    isSelected
                      ? "bg-white text-slate-900 hover:bg-slate-100"
                      : disabledReason
                        ? "cursor-not-allowed bg-slate-200 text-slate-400"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {isSelected ? <Check className="h-4 w-4" /> : null}
                  {isSelected ? t.remove : disabledReason ? t.chooseFirst : t.add}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProjectNotesSection({
  notes,
  setNotes,
  lang,
}: {
  notes: string;
  setNotes: (value: string) => void;
  lang: Lang;
}) {
  const t = TRANSLATIONS[lang];

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div>
        <h3 className="text-2xl font-black tracking-tight text-slate-900">{t.projectNotes}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{t.projectNotesHelp}</p>
      </div>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={6}
        placeholder={t.notesPlaceholder}
        className="mt-5 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-slate-400"
      />
    </section>
  );
}

function SummarySideBar({
  summaryRef,
  summary,
  onCopy,
  onSend,
  copied,
  lang,
}: {
  summaryRef: React.RefObject<HTMLDivElement>;
  summary: {
    items: { title: string; price: number | null; qty: number; needsQuote: boolean }[];
    pricedSubtotal: number;
    rushFee: number;
    total: number;
    deposit: number;
    remaining: number;
    needsQuote: boolean;
  };
  onCopy: () => void;
  onSend: () => void;
  copied: boolean;
  lang: Lang;
}) {
  const t = TRANSLATIONS[lang];

  return (
    <aside ref={summaryRef} className="h-fit lg:sticky lg:top-24">
      <div className="space-y-6 rounded-[2.5rem] border-2 border-slate-900 bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">{t.summary}</h2>
          <Pill tone="green">{t.live}</Pill>
        </div>

        <div className="space-y-3 rounded-3xl bg-slate-50 p-5">
          {summary.items.length === 0 ? (
            <p className="text-center text-sm text-slate-400">{t.nothingSelected}</p>
          ) : (
            summary.items.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">{item.title}</div>
                  <div className="text-xs text-slate-500">
                    {t.qty}: {item.qty}
                  </div>
                </div>
                <div className="text-right text-sm font-bold text-slate-900">
                  {item.needsQuote ? t.quote : formatPrice(item.price)}
                </div>
              </div>
            ))
          )}
        </div>

        {summary.rushFee ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t.rushFee}: {formatPrice(summary.rushFee)}
          </div>
        ) : null}

        <div className="rounded-3xl border border-slate-200 p-5 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{t.subtotal}</span>
            <span className="font-bold text-slate-900">{formatPrice(summary.total)}</span>
          </div>
          {!summary.needsQuote ? (
            <>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-slate-500">{t.deposit}</span>
                <span className="font-bold text-slate-900">{formatPrice(summary.deposit)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-slate-500">{t.remaining}</span>
                <span className="font-bold text-slate-900">{formatPrice(summary.remaining)}</span>
              </div>
            </>
          ) : (
            <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
              {t.containsQuote}
            </div>
          )}
        </div>

        <div className="grid gap-3">
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-4 text-sm font-black text-slate-900 hover:bg-slate-50"
          >
            <Copy className="h-4 w-4" />
            {copied ? t.copied : t.copySummary}
          </button>

          <button
            type="button"
            onClick={onSend}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-5 text-lg font-black text-white shadow-lg hover:bg-emerald-600"
          >
            <MessageCircle className="h-5 w-5" />
            {t.sendWhatsApp}
          </button>
        </div>
      </div>
    </aside>
  );
}

export default function B2BPartnerConfigurator() {
  const [view, setView] = useState<ViewState>("MENU");
  const [lang, setLang] = useState<Lang>("en");
  const [activePath, setActivePath] = useState<string>("quick-sale");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [selectedSize, setSelectedSize] = useState<string>("small");
  const [projectNotes, setProjectNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [showIdeaHint, setShowIdeaHint] = useState(false);
  const [showStartHint, setShowStartHint] = useState(false);

  const t = TRANSLATIONS[lang];
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const allServices = useMemo(
    () => [
      ...STARTING_POINT_SERVICES,
      ...STRUCTURE_SERVICES,
      ...DESIGN_DIRECTION_SERVICES,
      ...NEXT_PHASE_SERVICES,
      ...RARE_TECHNICAL_SERVICES,
      ...IRRIGATION_DRAFTING_SERVICES,
      ...SUPPORT_SERVICES,
    ],
    [],
  );

  const hasStart = hasStartingPointSelection(Object.keys(cart));
  const hasLayout = hasLayoutSourceSelection(Object.keys(cart));

  const selectedPath = useMemo(
    () => ENTRY_PATHS.find((path) => path.id === activePath) ?? ENTRY_PATHS[0],
    [activePath],
  );

  const getDisabledReason = (service: Service): string | null => {
    if (view !== "CONFIG") return null;

    if (activePath === "full-design") {
      if (DESIGN_DIRECTION_SERVICES.some((item) => item.id === service.id) && !hasStart) {
        return "First choose how the project starts: site visit, remote base, or your model.";
      }
      if ((NEXT_PHASE_SERVICES.some((item) => item.id === service.id) || RARE_TECHNICAL_SERVICES.some((item) => item.id === service.id)) && !hasLayout) {
        return "First choose who owns the layout idea so the follow-up sheets have something to point to.";
      }
    }

    if (activePath === "special-drawings") {
      if (RARE_TECHNICAL_SERVICES.some((item) => item.id === service.id) && !hasLayout) {
        return "These sheets work best after the layout already exists.";
      }
    }

    return null;
  };

  const summary = useMemo(() => {
    const items = allServices
      .filter((service) => cart[service.id])
      .map((service) => ({
        title: service.title,
        price: getLinePrice(service, selectedSize, cart[service.id]),
        qty: cart[service.id],
        needsQuote: service.pricingType === "quote",
      }));

    const pricedSubtotal = items.reduce((sum, item) => sum + (item.price ?? 0), 0);
    const hasRush = Boolean(cart["rush-fee"]);
    const rushFee = hasRush ? Math.round(pricedSubtotal * 0.25) : 0;
    const total = pricedSubtotal + rushFee;
    const deposit = Math.round(total * 0.7);
    const remaining = total - deposit;
    const needsQuote = items.some((item) => item.needsQuote);

    return { items, pricedSubtotal, rushFee, total, deposit, remaining, needsQuote };
  }, [allServices, cart, selectedSize]);

  const requestLines = summary.items.map(
    (item) => `• ${item.title} x${item.qty} — ${item.needsQuote ? t.quote : formatPrice(item.price)}`,
  );

  const requestBody = [
    "--------- NEW REQUEST ---------",
    `Path: ${selectedPath.title}`,
    `Property size: ${SIZES.find((size) => size.id === selectedSize)?.label ?? selectedSize}`,
    "",
    "Selected services:",
    ...(requestLines.length ? requestLines : ["• Nothing selected yet"]),
    "",
    summary.rushFee ? `Rush fee: ${formatPrice(summary.rushFee)}` : null,
    `Subtotal: ${formatPrice(summary.total)}`,
    summary.needsQuote ? "Contains quote-based items." : `Deposit (70%): ${formatPrice(summary.deposit)}`,
    "",
    projectNotes ? `Notes:\n${projectNotes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const handlePathSelect = (id: string) => {
    setActivePath(id);
    setView("CONFIG");
    setShowIdeaHint(false);
    setShowStartHint(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleService = (id: string) => {
    setCart((prev) => {
      const next = { ...prev };
      const isStarting = STARTING_POINT_SERVICES.some((s) => s.id === id);
      const isDesign = DESIGN_DIRECTION_SERVICES.some((s) => s.id === id);
      const isLaterPhase =
        NEXT_PHASE_SERVICES.some((s) => s.id === id) || RARE_TECHNICAL_SERVICES.some((s) => s.id === id);

      if (activePath === "full-design" && isDesign && !hasStartingPointSelection(Object.keys(prev))) {
        setShowStartHint(true);
        return prev;
      }

      if (activePath === "full-design" && isLaterPhase && !hasLayoutSourceSelection(Object.keys(prev))) {
        setShowIdeaHint(true);
        return prev;
      }

      if (activePath === "special-drawings" && RARE_TECHNICAL_SERVICES.some((s) => s.id === id) && !hasLayoutSourceSelection(Object.keys(prev))) {
        setShowIdeaHint(true);
        return prev;
      }

      setShowIdeaHint(false);
      setShowStartHint(false);

      if (isStarting) STARTING_POINT_SERVICES.forEach((s) => delete next[s.id]);
      if (isDesign) DESIGN_DIRECTION_SERVICES.forEach((s) => delete next[s.id]);

      if (next[id]) delete next[id];
      else next[id] = 1;

      return next;
    });
  };

  const changeQty = (id: string, qty: number) => {
    setCart((prev) => ({ ...prev, [id]: Math.max(1, qty) }));
  };

  const scrollToSummary = () => {
    summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(requestBody);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleWhatsApp = () => {
    const encoded = encodeURIComponent(requestBody);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, "_blank", "noopener,noreferrer");
  };

  const renderConfigurator = () => {
    switch (activePath) {
      case "quick-sale":
        return (
          <ServiceSection
            title={t.quickSection}
            description={t.quickSectionDesc}
            services={STARTING_POINT_SERVICES.filter((s) => s.id === "photo-concept-start")}
            selected={cart}
            onToggle={toggleService}
            onQuantityChange={changeQty}
            sizeId={selectedSize}
            lang={lang}
            tone="green"
          />
        );

      case "build-one":
        return (
          <div className="space-y-8">
            <ServiceSection
              title={t.buildSection}
              description={t.buildSectionDesc}
              services={STRUCTURE_SERVICES}
              selected={cart}
              onToggle={toggleService}
              onQuantityChange={changeQty}
              sizeId={selectedSize}
              lang={lang}
              tone="amber"
            />

            <ServiceSection
              title={t.buildSupport}
              description={t.buildSupportDesc}
              services={SUPPORT_SERVICES}
              selected={cart}
              onToggle={toggleService}
              onQuantityChange={changeQty}
              sizeId={selectedSize}
              lang={lang}
            />
          </div>
        );

      case "full-design":
        return (
          <div className="space-y-8">
            <SizeSelectionSection selectedSize={selectedSize} setSelectedSize={setSelectedSize} lang={lang} />

            <ServiceSection
              title={t.startSection}
              description={t.startSectionDesc}
              services={STARTING_POINT_SERVICES.filter((s) => s.id !== "photo-concept-start")}
              selected={cart}
              onToggle={toggleService}
              onQuantityChange={changeQty}
              sizeId={selectedSize}
              lang={lang}
            />

            {showStartHint ? (
              <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-900">
                First choose how the project starts. The design direction section depends on that.
              </div>
            ) : null}

            <ServiceSection
              title={t.ideaSection}
              description={t.ideaSectionDesc}
              services={DESIGN_DIRECTION_SERVICES}
              selected={cart}
              onToggle={toggleService}
              onQuantityChange={changeQty}
              sizeId={selectedSize}
              lang={lang}
              getDisabledReason={getDisabledReason}
              tone="green"
            />

            {showIdeaHint ? (
              <div className="rounded-[2rem] border border-amber-200 bg-amber-50 px-6 py-5 text-sm text-amber-900">
                First choose who owns the layout idea. After that, the follow-up sheets will have something to point to.
              </div>
            ) : null}

            <ServiceSection
              title={t.afterLayout}
              description={t.afterLayoutDesc}
              services={NEXT_PHASE_SERVICES}
              selected={cart}
              onToggle={toggleService}
              onQuantityChange={changeQty}
              sizeId={selectedSize}
              lang={lang}
              getDisabledReason={getDisabledReason}
            />

            <ServiceSection
              title={t.citySection}
              description={t.citySectionDesc}
              services={RARE_TECHNICAL_SERVICES}
              selected={cart}
              onToggle={toggleService}
              onQuantityChange={changeQty}
              sizeId={selectedSize}
              lang={lang}
              getDisabledReason={getDisabledReason}
            />

            <ServiceSection
              title={t.supportSection}
              description={t.supportSectionDesc}
              services={SUPPORT_SERVICES}
              selected={cart}
              onToggle={toggleService}
              onQuantityChange={changeQty}
              sizeId={selectedSize}
              lang={lang}
            />
          </div>
        );

      case "special-drawings":
        return (
          <div className="space-y-8">
            <SizeSelectionSection selectedSize={selectedSize} setSelectedSize={setSelectedSize} lang={lang} />

            <ServiceSection
              title={t.specialSection}
              description={t.specialSectionDesc}
              services={[...NEXT_PHASE_SERVICES, ...RARE_TECHNICAL_SERVICES]}
              selected={cart}
              onToggle={toggleService}
              onQuantityChange={changeQty}
              sizeId={selectedSize}
              lang={lang}
              getDisabledReason={getDisabledReason}
            />

            <ServiceSection
              title={t.irrigationSection}
              description={t.irrigationSectionDesc}
              services={IRRIGATION_DRAFTING_SERVICES}
              selected={cart}
              onToggle={toggleService}
              onQuantityChange={changeQty}
              sizeId={selectedSize}
              lang={lang}
            />

            <ServiceSection
              title={t.supportSection}
              description={t.supportSectionDesc}
              services={SUPPORT_SERVICES}
              selected={cart}
              onToggle={toggleService}
              onQuantityChange={changeQty}
              sizeId={selectedSize}
              lang={lang}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-20 text-slate-900">
      <Header view={view} setView={setView} lang={lang} setLang={setLang} />

      <main className="mx-auto max-w-7xl px-4 pt-8 md:px-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0 space-y-8">
            {view === "MENU" ? (
              <MainMenu onSelect={handlePathSelect} lang={lang} />
            ) : (
              <>
                <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="mb-2 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {t.activePath}
                      </div>
                      <h2 className="text-2xl font-black">{lang === "en" ? selectedPath.title : selectedPath.titleEs}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {lang === "en" ? selectedPath.description : selectedPath.descriptionEs}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={scrollToSummary}
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                    >
                      {t.reviewOrder}
                    </button>
                  </div>
                </section>

                <div className="space-y-8 animate-in slide-in-from-right-10 duration-300">{renderConfigurator()}</div>

                <ProjectNotesSection
                  notes={projectNotes}
                  setNotes={setProjectNotes}
                  lang={lang}
                />
              </>
            )}
          </div>

          <SummarySideBar
            summaryRef={summaryRef}
            summary={summary}
            onCopy={handleCopy}
            onSend={handleWhatsApp}
            copied={copied}
            lang={lang}
          />
        </div>
      </main>

      {view === "CONFIG" ? (
        <div className="fixed bottom-6 left-4 right-4 lg:hidden">
          <button
            type="button"
            onClick={scrollToSummary}
            className="flex w-full items-center justify-between rounded-2xl bg-slate-900 p-5 text-white shadow-2xl"
          >
            <span className="font-black">{t.summaryJump}</span>
            <span className="text-lg font-black">{formatPrice(summary.total)}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
