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
type Step = "menu" | "configurator";
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

interface EntryPath {
  id: string;
  title: string;
  titleEs?: string;
  description: string;
  descriptionEs?: string;
  helper: string;
  helperEs?: string;
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

interface SummaryItem {
  title: string;
  price: number | null;
  qty: number;
  needsQuote: boolean;
}

const WHATSAPP_NUMBER = "15551234567";

const UI = {
  en: {
    header: "Partner Configurator",
    subheader: "White-label drafting and production support",
    back: "Back to menu",
    selectPath: "What do you need to do?",
    selectPathHelp:
      "Pick one path. Once you go in, everything else disappears so the screen stays clean.",
    activePath: "Active path",
    doneReview: "Done, review order",
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
    total: "Total",
    subtotal: "Subtotal",
    deposit: "Deposit (70%)",
    remaining: "Remaining later",
    rushFee: "Rush fee",
    containsQuote: "Contains quote-based items.",
    checkTotal: "Check total and send",
    sendWhatsApp: "Send to WhatsApp",
    copySummary: "Copy summary",
    copied: "Copied",
    startThisPath: "Start this path",
    chooseFirst: "Choose this first",
    selected: "Selected",
    add: "Add",
    remove: "Remove",
    qty: "Qty",
    quote: "Quote",
    bestFor: "Best for",
    youSend: "You send",
    youGet: "You get",
    notIncluded: "Not included",
    needCallRequest: "Please call me to review scope.",
    mobileJump: "Check total and send",
    noPriceYet: "No price yet",
    pathQuick: "Quick idea to help close the sale",
    pathBuild: "Build one specific thing",
    pathDesign: "Landscape design",
    pathSpecial: "Special drawings",
  },
  es: {
    header: "Configurador para socios",
    subheader: "Apoyo white-label de planos y producción",
    back: "Volver al menú",
    selectPath: "¿Qué necesitas hacer?",
    selectPathHelp:
      "Elige una ruta. Cuando entras, lo demás desaparece para mantener la pantalla limpia.",
    activePath: "Ruta activa",
    doneReview: "Listo, revisar pedido",
    propertySize: "Tamaño del lote",
    projectNotes: "Notas del proyecto",
    projectNotesHelp:
      "Agrega pedidos del cliente, dudas pendientes o puntos a vigilar.",
    notesPlaceholder: "Agrega contexto aquí. Luego puedes mandar fotos y sketches por WhatsApp.",
    freeHelpCall: "Llamada gratis",
    freeHelpCallAdded: "Se agregó una solicitud de llamada en las notas.",
    summary: "Resumen",
    live: "En vivo",
    nothingSelected: "Aún no hay servicios seleccionados",
    total: "Total",
    subtotal: "Subtotal",
    deposit: "Depósito (70%)",
    remaining: "Restante después",
    rushFee: "Cargo urgente",
    containsQuote: "Incluye partidas por cotizar.",
    checkTotal: "Revisar total y enviar",
    sendWhatsApp: "Enviar por WhatsApp",
    copySummary: "Copiar resumen",
    copied: "Copiado",
    startThisPath: "Empezar esta ruta",
    chooseFirst: "Elige esto primero",
    selected: "Seleccionado",
    add: "Agregar",
    remove: "Quitar",
    qty: "Cant.",
    quote: "Cotizar",
    bestFor: "Ideal para",
    youSend: "Tú mandas",
    youGet: "Recibes",
    notIncluded: "No incluido",
    needCallRequest: "Por favor llámame para revisar el alcance.",
    mobileJump: "Revisar total y enviar",
    noPriceYet: "Sin precio todavía",
    pathQuick: "Idea rápida para cerrar la venta",
    pathBuild: "Construir una sola cosa",
    pathDesign: "Diseño de landscape",
    pathSpecial: "Planos especiales",
  },
} as const;

const SIZES: Size[] = [
  { id: "small", label: "Small", sublabel: "under 1/4 ac", visual: "🏠" },
  { id: "medium", label: "Medium", sublabel: "around 1/2 ac", visual: "🏡" },
  { id: "large", label: "Large", sublabel: "1/2-1 ac", visual: "🌿" },
  { id: "estate", label: "Estate", sublabel: "1-2 ac", visual: "🌳" },
];

const ENTRY_PATHS: EntryPath[] = [
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
    descriptionEs: "Elige el tamaño del lote, el punto de inicio y quién define la idea del layout.",
    helper: "Best when the whole yard needs planning, not just one structure.",
    helperEs: "Ideal cuando todo el patio necesita planeación, no solo una estructura.",
  },
  {
    id: "special-drawings",
    title: "Special drawings",
    titleEs: "Planos especiales",
    description: "Planting plan, hardscape plan, irrigation drawing, take-off, HOA / city sheets.",
    descriptionEs: "Planting plan, hardscape plan, riego, take-off, HOA o láminas para ciudad.",
    helper: "Best when the layout already exists and you only need the right sheet.",
    helperEs: "Ideal cuando el layout ya existe y solo hace falta la lámina correcta.",
  },
];

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
    bestFor: "Fence and gate locations are known and just need to be documented clearly.",
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

const formatPrice = (value: number | null | undefined) => {
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
  selectedIds.some((id) =>
    STARTING_POINT_SERVICES.some((service) => service.id === id && service.id !== "photo-concept-start"),
  );

function runSelfTests() {
  console.assert(formatPrice(1200) === "$1,200", "formatPrice failed");
  console.assert(getBaseUnitPrice({ pricingType: "unit", unitPrice: 120 } as Service, "small") === 120, "unit pricing failed");
  console.assert(getBaseUnitPrice({ pricingType: "hourly", hourlyRate: 70 } as Service, "small") === 70, "hourly pricing failed");
  console.assert(getBaseUnitPrice({ pricingType: "tiered-unit", unitPrices: { small: 100 } } as Service, "small") === 100, "tiered-unit pricing failed");
  console.assert(getLinePrice({ pricingType: "flat", flatPrice: 500 } as Service, "small", 2) === 1000, "flat line pricing failed");
  console.assert(getLinePrice({ pricingType: "quote" } as Service, "small", 1) === null, "quote pricing failed");
  console.assert(Math.round(1000 * 0.7) === 700, "deposit math failed");
  console.assert(Math.round(1000 * 0.25) === 250, "rush fee math failed");
  console.assert(hasLayoutSourceSelection(["deck-small"]) === true, "structure should count as layout source");
  console.assert(hasLayoutSourceSelection(["design-execution-under-your-direction"]) === true, "design path should count as layout source");
  console.assert(hasLayoutSourceSelection(["on-site-start"]) === false, "start service alone should not count as layout source");
}

try {
  runSelfTests();
} catch (error) {
  console.warn("Configurator self-tests failed", error);
}

function Pill({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "green" | "amber" }) {
  const tones = {
    slate: "border-slate-200 bg-slate-100 text-slate-700",
    green: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-800",
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

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-black tracking-tight text-slate-900">{title}</h3>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function ServiceCard({
  service,
  selected,
  sizeId,
  qty,
  disabledReason,
  ui,
  onToggle,
  onQtyChange,
}: {
  service: Service;
  selected: boolean;
  sizeId: string;
  qty: number;
  disabledReason: string | null;
  ui: (typeof UI)["en"];
  onToggle: () => void;
  onQtyChange: (qty: number) => void;
}) {
  const Icon = service.icon;
  const basePrice =
    service.pricingType === "percentage"
      ? service.displayPriceLabel ?? "+25%"
      : formatPrice(getBaseUnitPrice(service, sizeId));

  return (
    <article
      className={`rounded-[1.75rem] border p-5 transition-all ${
        selected
          ? "border-slate-900 bg-slate-900 text-white shadow-lg"
          : disabledReason
            ? "border-slate-200 bg-slate-50 opacity-80"
            : "border-slate-200 bg-white hover:border-slate-900 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`rounded-2xl p-3 ${selected ? "bg-white/10" : "bg-slate-100"}`}>
            <Icon className={`h-5 w-5 ${selected ? "text-white" : "text-slate-700"}`} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-lg font-black leading-tight">{service.title}</h4>
              {service.badgeLabel ? <Pill tone="green">{service.badgeLabel}</Pill> : null}
              {service.sampleLabel ? <Pill>{service.sampleLabel}</Pill> : null}
            </div>
            <p className={`mt-2 text-sm leading-6 ${selected ? "text-slate-200" : "text-slate-600"}`}>{service.short}</p>
          </div>
        </div>

        <div className="text-right">
          <div className={`text-lg font-black ${selected ? "text-white" : "text-slate-900"}`}>{basePrice}</div>
          <div className={`text-xs ${selected ? "text-slate-300" : "text-slate-500"}`}>{service.category}</div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className={`rounded-2xl p-4 ${selected ? "bg-white/10" : "bg-slate-50"}`}>
          <div className="text-xs font-bold uppercase tracking-wide opacity-70">{ui.bestFor}</div>
          <p className="mt-2 text-sm leading-6">{service.bestFor}</p>
        </div>
        <div className={`rounded-2xl p-4 ${selected ? "bg-white/10" : "bg-slate-50"}`}>
          <div className="text-xs font-bold uppercase tracking-wide opacity-70">{ui.youSend}</div>
          <p className="mt-2 text-sm leading-6">{service.youSend}</p>
        </div>
        <div className={`rounded-2xl p-4 ${selected ? "bg-white/10" : "bg-slate-50"}`}>
          <div className="text-xs font-bold uppercase tracking-wide opacity-70">{ui.youGet}</div>
          <p className="mt-2 text-sm leading-6">{service.youGet}</p>
        </div>
        <div className={`rounded-2xl p-4 ${selected ? "bg-white/10" : "bg-slate-50"}`}>
          <div className="text-xs font-bold uppercase tracking-wide opacity-70">{ui.notIncluded}</div>
          <p className="mt-2 text-sm leading-6">{service.notIncluded}</p>
        </div>
      </div>

      {service.helper ? (
        <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${selected ? "border-white/15 bg-white/5 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
          {service.helper}
        </div>
      ) : null}

      {disabledReason ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {disabledReason}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        {service.quantityEnabled && selected ? (
          <QtyControl value={qty} onChange={onQtyChange} label={service.quantityLabel ?? ui.qty.toLowerCase()} />
        ) : (
          <div className="text-sm text-slate-500">{selected ? `${ui.qty}: ${qty}` : ""}</div>
        )}

        <button
          type="button"
          disabled={Boolean(disabledReason)}
          onClick={onToggle}
          className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition ${
            selected
              ? "bg-white text-slate-900 hover:bg-slate-100"
              : disabledReason
                ? "cursor-not-allowed bg-slate-200 text-slate-400"
                : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          {selected ? <Check className="h-4 w-4" /> : null}
          {selected ? ui.remove : disabledReason ? ui.chooseFirst : ui.add}
        </button>
      </div>
    </article>
  );
}

export default function SiteformPartnerConfiguratorMerged() {
  const [step, setStep] = useState<Step>("menu");
  const [lang, setLang] = useState<Lang>("en");
  const [activePath, setActivePath] = useState<string>("quick-sale");
  const [selectedSize, setSelectedSize] = useState<string>("small");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [projectNotes, setProjectNotes] = useState("");
  const [copied, setCopied] = useState(false);
  const [freeCallAdded, setFreeCallAdded] = useState(false);
  const [showIdeaHint, setShowIdeaHint] = useState(false);
  const [showStartHint, setShowStartHint] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const ui = UI[lang];

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
      ...HOURLY_SERVICES,
    ],
    [],
  );

  const hasStart = hasStartingPointSelection(Object.keys(cart));
  const hasLayout = hasLayoutSourceSelection(Object.keys(cart));

  const selectedPath = useMemo(
    () => ENTRY_PATHS.find((path) => path.id === activePath) ?? ENTRY_PATHS[0],
    [activePath],
  );

  const summary = useMemo(() => {
    const items: SummaryItem[] = allServices
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
    (item) => `• ${item.title} x${item.qty} — ${item.needsQuote ? ui.quote : formatPrice(item.price)}`,
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

  const handlePathSelect = (pathId: string) => {
    setActivePath(pathId);
    setStep("configurator");
    setShowIdeaHint(false);
    setShowStartHint(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToMenu = () => {
    setStep("menu");
    setShowIdeaHint(false);
    setShowStartHint(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleQtyChange = (id: string, qty: number) => {
    setCart((prev) => ({ ...prev, [id]: Math.max(1, qty) }));
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

      if (activePath === "build-one" && RARE_TECHNICAL_SERVICES.some((s) => s.id === id) && !hasLayoutSourceSelection(Object.keys(prev))) {
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

  const getDisabledReason = (service: Service): string | null => {
    if (step !== "configurator") return null;

    if (activePath === "full-design") {
      if (DESIGN_DIRECTION_SERVICES.some((item) => item.id === service.id) && !hasStart) {
        return "First choose how the project starts: site visit, remote base, or your model.";
      }
      if ((NEXT_PHASE_SERVICES.some((item) => item.id === service.id) || RARE_TECHNIC
