import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Box,
  Camera,
  Check,
  Copy,
  DraftingCompass,
  Droplets,
  FileText,
  Loader2,
  Map,
  MessageCircle,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Trees,
  Upload,
  Wrench,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";

type Lang = "en" | "es";
type ViewState = "MENU" | "CONFIG" | "SUCCESS";
type PricingType = "size" | "flat" | "unit" | "hourly" | "quote" | "percentage";
type NoticeKind = "hard" | "soft" | null;

interface Size {
  id: string;
  label: string;
  sublabel: string;
  visual: string;
}

interface EntryPath {
  id: string;
  title: string;
  titleEs: string;
  description: string;
  descriptionEs: string;
  helper: string;
  helperEs: string;
}

interface Service {
  id: string;
  title: string;
  category: string;
  icon: LucideIcon;
  pricingType: PricingType;
  prices?: Record<string, number | null>;
  flatPrice?: number;
  unitPrice?: number;
  hourlyRate?: number;
  displayPriceLabel?: string;
  stripePriceId?: string | null;
  quantityEnabled?: boolean;
  quantityLabel?: string;
  badgeLabel?: string;
  sampleLabel?: string;
  short: string;
  bestFor: string;
  youSend: string;
  youGet: string;
  notIncluded: string;
  helper?: string;
  hardDependency?: string[];
  softDependency?: string[];
  allowWithoutDependency?: boolean;
  contactOnly?: boolean;
}

interface OrderContact {
  clientName: string;
  customerEmail: string;
  projectAddress: string;
  notes: string;
}

interface QuickHelpForm {
  contact: string;
  question: string;
  budgetTimeline: string;
}

interface PaidOrderSnapshot {
  sessionId: string;
  orderId: string;
  pathId: string;
  pathTitle: string;
  sizeId: string;
  sizeLabel: string;
  clientName: string;
  customerEmail: string;
  projectAddress: string;
  items: Array<{ id: string; title: string; qty: number }>;
}

interface SummaryLine {
  title: string;
  qty: number;
  price: number | null;
  isQuote: boolean;
}

const DEMO_MODE = true;
const NOTES_LIMIT = 2000;
const WHATSAPP_NUMBER = "15551234567";

const T = {
  en: {
    header: "Scope Builder",
    subheader: "Drafting, visuals, and plan support for landscapers",
    selectPath: "What does this job need?",
    selectPathHelp:
      "Choose the service group for this job. After you enter, you will only see the options for that category.",
    openThisGroup: "Open this group",
    activeGroup: "Active group",
    back: "Back to menu",
    reviewOrder: "Review order",
    propertySize: "Property size",
    projectInfo: "Billing and project info",
    clientName: "Client name",
    clientEmail: "Client email",
    projectAddress: "Project address",
    notes: "Project details / Notes",
    notesHelp:
      "Use this for a short but useful project description before checkout. Full project intake happens after payment.",
    notesPlaceholder:
      "Example: Front yard only, xeriscape preferred, gate stays, retaining wall may be needed near driveway.",
    quickHelp: "Need help with the service?",
    quickHelpTitle: "Questions?",
    quickHelpText:
      "Submit your project details or questions below. Leave your email or phone number, and we'll get back to you if it's a fit for our current workflow.",
    helpContact: "Email or Phone",
    helpContactPlaceholder: "How should we reach you?",
    helpQuestion: "Your question or project address",
    helpQuestionPlaceholder:
      "Tell us what you need, where the project is, and what feels unclear.",
    helpBudgetTimeline: "Budget / Timeline (optional)",
    helpBudgetTimelinePlaceholder:
      "Example: Need this priced this week, build phase next month.",
    helpSend: "Submit Question",
    helpSending: "Sending...",
    helpSent: "Sent",
    close: "Close",
    summary: "Summary",
    nothingSelected: "Nothing selected yet",
    qty: "Qty",
    total: "Total",
    deposit: "Deposit (70%)",
    remaining: "Remaining later",
    tbd: "TBD",
    currentPricedSubtotal: "Current priced subtotal",
    rushFee: "Rush fee",
    tbdHelp:
      "This order contains quote-based or estate items. Those need manual review before payment.",
    copySummary: "Copy summary",
    copied: "Copied",
    resetCart: "Reset cart",
    cleared: "Cleared",
    confirmReset: "Reset cart and clear current selection?",
    generateInvoice: "Generate Invoice & Pay",
    generating: "Generating...",
    termsLine:
      "Stripe checkout should include Terms of Service consent and the Terms & Rules link.",
    fillRequired:
      "Add client name, client email, and at least one payable service.",
    quoteBlocksCheckout:
      "Quote-based or estate items need manual follow-up before payment.",
    add: "Add",
    remove: "Remove",
    chooseFirst: "Choose this first",
    discussInHelp: "Discuss first",
    bestFor: "Best for",
    youSend: "You send",
    youGet: "You get",
    notIncluded: "Not included",
    warning: "Important",
    startSection: "Starting point",
    startSectionDesc:
      "Choose how the project base is prepared. On-site base modeling requires a site visit first.",
    ideaSection: "Who owns the layout idea?",
    ideaSectionDesc:
      "You already know the layout, or you want us to help develop it into a render-ready direction.",
    afterLayout: "After layout",
    afterLayoutDesc:
      "At this point the layout is approved and treated as locked. From here you can order detailed plans and follow-up sheets.",
    buildSection: "Pick the structure",
    buildSectionDesc:
      "Choose the main thing you are building. These packages are without site visit unless you add one separately.",
    supportSection: "Support and add-ons",
    supportSectionDesc:
      "Site visit, outside-city travel, rush handling, or scoped redesign discussion after the main service is chosen.",
    quickSection: "Quick concept image",
    quickSectionDesc:
      "This is the fastest paid visual to help close the sale.",
    specialSection: "Special drawings",
    specialSectionDesc:
      "Use these when documents already exist and you need one clean deliverable.",
    citySection: "HOA and city sheets",
    citySectionDesc:
      "These use an existing base, usually a clean master plan. You can still check the price now, but the price assumes that base already exists.",
    irrigationSection: "Licensed irrigator drafting",
    irrigationSectionDesc:
      "Drafting support only for licensed irrigators who already know the irrigation layout and want it cleaned up on screen.",
    softDependencyMasterPlan:
      "Price assumes there is already a clean master plan or other usable base. If not, extra setup may be needed.",
    softDependencyLayout:
      "Price assumes the main layout is already approved. If layout work is still missing, this may need a different package first.",
    hardDependencySiteVisit: "Choose Site Visit first.",
    hardDependencyOutsideCity: "Add Site Visit first.",
    successTitle: "Payment received",
    successText:
      "Now the real intake starts. Upload photos, survey files, and the full scope here.",
    uploadPhotos: "Project photos",
    uploadSurvey: "Survey / PDFs",
    detailedBrief: "Detailed scope",
    detailedBriefPlaceholder:
      "Add the full project brief here. This is the right place for the long version.",
    saveIntake: "Save intake",
    intakeSaved: "Intake saved",
    openProjectChat: "Open project chat",
    successNote:
      "Use project chat only after payment for quick text and photo follow-up.",
    verifyingPayment: "Checking payment status...",
    previewMode:
      "Preview mode: checkout endpoint is not connected, showing local success screen.",
    uploadWidgetNote:
      "Replace these file fields with Uploadcare or Cloudinary widget when backend is connected.",
    showcaseBadge: "Try it on a real job",
    showcaseTitle: "Visuals that help close the job.",
    showcaseDesc:
      "Send one site photo. Get a photorealistic concept adjusted to the project, not just blindly generated. If the client moves forward, add takeoffs, plans, or specialty sheets next.",
    showcaseStep1: "Use one photo to test the idea before committing to full scope.",
    showcaseStep2: "Show the concept to the homeowner and move the sale forward faster.",
    showcaseStep3: "Need more depth? Add layout support, takeoffs, grading, HOA, or CRZ sheets.",
    showcaseCta: "Try 1 Quick Concept",
    showcaseBrowse: "Browse all service paths",
    showcaseNote: "Best first step for builders who want to test the workflow on one real job.",
  },
  es: {
    header: "Scope Builder",
    subheader: "Planos, visuales y apoyo técnico para landscapers",
    selectPath: "¿Qué necesita este trabajo?",
    selectPathHelp:
      "Elige el grupo de servicios para este trabajo. Cuando entras, solo verás las opciones de esa categoría.",
    openThisGroup: "Abrir este grupo",
    activeGroup: "Grupo activo",
    back: "Volver al menú",
    reviewOrder: "Revisar pedido",
    propertySize: "Tamaño del lote",
    projectInfo: "Datos para factura y proyecto",
    clientName: "Nombre del cliente",
    clientEmail: "Email del cliente",
    projectAddress: "Dirección del proyecto",
    notes: "Detalles del proyecto / Notes",
    notesHelp:
      "Usa esto para una descripción corta pero útil antes del checkout. El intake completo viene después del pago.",
    notesPlaceholder:
      "Ejemplo: Solo frente, xeriscape preferido, la puerta se queda, puede hacer falta retaining wall cerca del driveway.",
    quickHelp: "Need help with the service?",
    quickHelpTitle: "Questions?",
    quickHelpText:
      "Submit your project details or questions below. Leave your email or phone number, and we'll get back to you if it's a fit for our current workflow.",
    helpContact: "Email or Phone",
    helpContactPlaceholder: "How should we reach you?",
    helpQuestion: "Your question or project address",
    helpQuestionPlaceholder:
      "Tell us what you need, where the project is, and what feels unclear.",
    helpBudgetTimeline: "Budget / Timeline (optional)",
    helpBudgetTimelinePlaceholder:
      "Example: Need this priced this week, build phase next month.",
    helpSend: "Submit Question",
    helpSending: "Sending...",
    helpSent: "Sent",
    close: "Close",
    summary: "Resumen",
    nothingSelected: "Todavía no hay servicios seleccionados",
    qty: "Cant.",
    total: "Total",
    deposit: "Depósito (70%)",
    remaining: "Restante después",
    tbd: "Por definir",
    currentPricedSubtotal: "Subtotal actual con precio",
    rushFee: "Cargo urgente",
    tbdHelp:
      "Este pedido incluye partidas por cotizar o tamaño estate. Esas partidas necesitan revisión manual antes del pago.",
    copySummary: "Copiar resumen",
    copied: "Copiado",
    resetCart: "Vaciar carrito",
    cleared: "Vacío",
    confirmReset: "¿Vaciar carrito y borrar la selección actual?",
    generateInvoice: "Generar factura y pagar",
    generating: "Generando...",
    termsLine:
      "Stripe checkout debe incluir consentimiento de Terms of Service y enlace a Terms & Rules.",
    fillRequired:
      "Agrega nombre del cliente, email del cliente y al menos un servicio pagable.",
    quoteBlocksCheckout:
      "Las partidas por cotizar o estate necesitan seguimiento manual antes del pago.",
    add: "Agregar",
    remove: "Quitar",
    chooseFirst: "Elige esto primero",
    discussInHelp: "Hablar primero",
    bestFor: "Ideal para",
    youSend: "Tú mandas",
    youGet: "Recibes",
    notIncluded: "No incluido",
    warning: "Importante",
    startSection: "Punto de inicio",
    startSectionDesc:
      "Elige cómo se prepara la base del proyecto. El modelado en sitio requiere primero una visita.",
    ideaSection: "¿Quién define la idea del layout?",
    ideaSectionDesc:
      "Ya conoces el layout o quieres que te ayudemos a llevarlo hasta una dirección lista para render.",
    afterLayout: "Después del layout",
    afterLayoutDesc:
      "En este punto el layout ya está aprobado y se trata como cerrado. Desde aquí puedes pedir planos detallados y láminas de seguimiento.",
    buildSection: "Escoge la estructura",
    buildSectionDesc:
      "Elige lo principal que vas a construir. Estos paquetes son sin visita al sitio, a menos que la agregues por separado.",
    supportSection: "Apoyo y add-ons",
    supportSectionDesc:
      "Visita al sitio, viaje fuera de la ciudad, urgencia o discusión de rediseño después de elegir el servicio principal.",
    quickSection: "Imagen conceptual rápida",
    quickSectionDesc:
      "Es la visual pagada más rápida para ayudar a cerrar la venta.",
    specialSection: "Planos especiales",
    specialSectionDesc:
      "Úsalo cuando ya existen documentos y necesitas una entrega limpia.",
    citySection: "Láminas HOA y ciudad",
    citySectionDesc:
      "Estas usan una base existente, normalmente un master plan limpio. Puedes revisar el precio ahora, pero el precio asume que esa base ya existe.",
    irrigationSection: "Dibujo para irrigadores licenciados",
    irrigationSectionDesc:
      "Solo apoyo de dibujo para irrigadores licenciados que ya saben el layout de riego y quieren limpiarlo en pantalla.",
    softDependencyMasterPlan:
      "El precio asume que ya existe un master plan limpio u otra base utilizable. Si no, puede hacer falta trabajo extra.",
    softDependencyLayout:
      "El precio asume que el layout principal ya está aprobado. Si todavía falta ese trabajo, primero puede necesitar otro paquete.",
    hardDependencySiteVisit: "Elige primero Site Visit.",
    hardDependencyOutsideCity: "Primero agrega Site Visit.",
    successTitle: "Pago recibido",
    successText:
      "Ahora empieza el intake real. Sube fotos, survey y el alcance completo aquí.",
    uploadPhotos: "Fotos del proyecto",
    uploadSurvey: "Survey / PDFs",
    detailedBrief: "Alcance detallado",
    detailedBriefPlaceholder:
      "Agrega aquí la versión larga del proyecto. Este es el lugar correcto para el detalle completo.",
    saveIntake: "Guardar intake",
    intakeSaved: "Intake guardado",
    openProjectChat: "Abrir chat del proyecto",
    successNote:
      "Usa el chat del proyecto solo después del pago para textos rápidos y seguimiento con fotos.",
    verifyingPayment: "Verificando el pago...",
    previewMode:
      "Modo preview: el endpoint de checkout no está conectado, mostrando pantalla local de éxito.",
    uploadWidgetNote:
      "Sustituye estos campos por Uploadcare o Cloudinary widget cuando conectes el backend.",
    showcaseBadge: "Pruébalo en un trabajo real",
    showcaseTitle: "Visuales que ayudan a cerrar el trabajo.",
    showcaseDesc:
      "Manda una foto del sitio. Recibe un concepto fotorrealista ajustado al proyecto, no generado a ciegas. Si el cliente avanza, agrega takeoffs, planos o láminas especiales.",
    showcaseStep1: "Usa una foto para probar la idea antes de comprometerte con el alcance completo.",
    showcaseStep2: "Muestra el concepto al dueño y avanza la venta más rápido.",
    showcaseStep3: "¿Necesitas más detalle? Agrega layout, takeoffs, grading, HOA o láminas CRZ.",
    showcaseCta: "Probar 1 Concepto Rápido",
    showcaseBrowse: "Ver todos los servicios",
    showcaseNote: "El mejor primer paso para constructores que quieren probar el flujo en un trabajo real.",
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
    descriptionEs:
      "Una imagen conceptual rápida a partir de una foto del sitio.",
    helper: "Best when you just need one fast visual to move the sale forward.",
    helperEs:
      "Ideal cuando solo necesitas una imagen rápida para mover la venta.",
  },
  {
    id: "build-one",
    title: "Build one specific thing",
    titleEs: "Construir una sola cosa",
    description:
      "Deck, pergola, carport, kitchen, retaining wall, or one feature.",
    descriptionEs:
      "Deck, pérgola, carport, cocina exterior, muro o una sola pieza.",
    helper: "Best when the job is one clear structure, not the whole yard.",
    helperEs:
      "Ideal cuando el trabajo es una sola estructura, no todo el patio.",
  },
  {
    id: "full-design",
    title: "Landscape design",
    titleEs: "Diseño de landscape",
    description:
      "Choose lot size, base setup, and who owns the layout idea.",
    descriptionEs:
      "Elige tamaño del lote, preparación de base y quién define la idea del layout.",
    helper:
      "Best when the whole yard needs design work, not just one structure.",
    helperEs:
      "Ideal cuando todo el patio necesita diseño, no solo una estructura.",
  },
  {
    id: "special-drawings",
    title: "Special drawings",
    titleEs: "Planos especiales",
    description:
      "Master plans, planting sheets, paving patterns, drainage concepts, HOA and city sheets.",
    descriptionEs:
      "Master plans, planting sheets, patrones de pavimento, drenaje conceptual, HOA o ciudad.",
    helper:
      "Best when documents already exist and you need one clean deliverable.",
    helperEs:
      "Ideal cuando ya existen documentos y necesitas una entrega limpia.",
  },
];

const STARTING_POINT_SERVICES: Service[] = [
  {
    id: "site-visit-start",
    title: "Site Visit",
    category: "Start",
    icon: Camera,
    pricingType: "flat",
    flatPrice: 200,
    stripePriceId: "price_sitevisit_200",
    short:
      "Basic local site visit time for travel, time on site, and measurement setup.",
    bestFor: "Local jobs that do not have enough usable measurements yet.",
    youSend:
      "Site address, access details, and anything already known about the property.",
    youGet:
      "Site visit time, raw measurements, photos, and field notes.",
    notIncluded:
      "Base plan, 3D model, design work, or travel outside city limits.",
    helper:
      "Choose this together with Base Plan + 3D Model if you want us to build the existing-conditions model from the site visit.",
  },
  {
    id: "onsite-base-model",
    title: "Base Plan + 3D Model",
    category: "Start",
    icon: Map,
    pricingType: "size",
    prices: { small: 100, medium: 200, large: 350, estate: null },
    stripePriceId: null,
    short:
      "We build a basic 2D base plan and a 3D model of existing conditions with no design added.",
    bestFor:
      "Jobs where we already visited the site and now need the existing yard modeled cleanly.",
    youSend: "Choose Site Visit first so we have usable field data.",
    youGet:
      "A base 2D plan and a 3D existing-conditions model, without design work.",
    notIncluded:
      "Site visit time, design layout, rendering package, or engineering.",
    helper: "This service is only available together with Site Visit.",
    hardDependency: ["site-visit-start"],
  },
  {
    id: "survey-documents-start",
    title: "Remote Base Plan + 3D Model",
    category: "Start",
    icon: Map,
    pricingType: "size",
    prices: { small: 200, medium: 300, large: 450, estate: null },
    stripePriceId: null,
    short:
      "No site visit. You send survey, photos, PDFs, sketches, or measurements, and we build the basic 2D and 3D model remotely.",
    bestFor:
      "Out-of-town jobs or jobs where enough information already exists.",
    youSend:
      "Survey, photos, PDFs, redlines, dimensions, or even a hand-drawn sketch.",
    youGet:
      "A base 2D plan and a 3D existing-conditions model built from your documents.",
    notIncluded:
      "Site visit, legal survey work, engineering, permits, or final design.",
  },
  {
    id: "client-model-start",
    title: "Your 3D Model, We Render It",
    category: "Start",
    icon: Box,
    pricingType: "size",
    prices: { small: 350, medium: 500, large: 750, estate: null },
    stripePriceId: null,
    short:
      "You send your model already built, and we review it, prep it for rendering, and use it for visuals.",
    bestFor:
      "Jobs where the model already exists and mainly needs rendering setup, material application, and presentation work.",
    youSend:
      "A render-ready 3D model, material links or JPEG references, notes, and any survey or PDFs that help us review it.",
    youGet:
      "Model review, render setup, material application from your references, and rendered views. Once the model is ready, material looks can be tested without a fixed limit.",
    notIncluded:
      "Heavy model cleanup, rebuilding missing geometry, creating materials from scratch, or design work not already present in the model.",
    helper:
      "After review, extra cleanup hours may be discussed and billed only after approval. If we have to create or rebuild materials for you, that is extra hourly work.",
  },
  {
    id: "photo-concept-start",
    title: "One Quick Concept Image",
    category: "Start",
    icon: Trees,
    pricingType: "flat",
    flatPrice: 150,
    stripePriceId: "price_quickconcept_150",
    short: "Fast paid concept image to help close the sale.",
    bestFor: "Fast sales before full design work starts.",
    youSend:
      "One site photo after payment, rough dimensions if you have them, and a short text about what you want to show.",
    youGet:
      "One concept image and a short list of suggested materials or main features used in the concept.",
    notIncluded:
      "Site visit, accurate site model, construction-ready drawings, engineering, permits, or final design documentation.",
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
    stripePriceId: "price_decksmall_1000",
    short: "Layout, AutoCAD plan set, and 3D visuals for a small deck.",
    bestFor: "Smaller deck jobs that need a clean package by default.",
    youSend:
      "Site plan, preferred location, dimensions, and reference ideas if any.",
    youGet:
      "Deck layout, AutoCAD plans, and 3D visuals. HOA-ready plan set by default.",
    notIncluded:
      "Site visit, structural engineering, stamped drawings, or permit filing by us.",
    helper:
      "This package is without site visit. Add Site Visit if field measuring is needed.",
    sampleLabel: "See sample",
  },
  {
    id: "pergola-small",
    title: "Small Pergola Package under 200 sq.ft",
    category: "Build",
    icon: Box,
    pricingType: "flat",
    flatPrice: 1000,
    stripePriceId: "price_pergolasmall_1000",
    short: "Layout, AutoCAD plan set, and 3D visuals for a small pergola.",
    bestFor: "Smaller pergola jobs that need a clean package by default.",
    youSend:
      "Site plan, preferred location, dimensions, and reference ideas if any.",
    youGet:
      "Pergola layout, AutoCAD plans, and 3D visuals. HOA-ready plan set by default.",
    notIncluded:
      "Site visit, structural engineering, stamped drawings, or permit filing by us.",
    helper:
      "This package is without site visit. Add Site Visit if field measuring is needed.",
    sampleLabel: "See sample",
  },
  {
    id: "carport-package",
    title: "Carport Package",
    category: "Build",
    icon: Box,
    pricingType: "quote",
    stripePriceId: null,
    short:
      "Concept layout, plan support, and 3D visuals for a carport or covered parking structure.",
    bestFor:
      "Carport or covered parking ideas that need a clear concept before engineering or permit work.",
    youSend:
      "Site plan, dimensions, clearance notes, parking needs, and reference images if you have them.",
    youGet: "A conceptual carport layout with plan support and 3D visuals.",
    notIncluded:
      "Site visit, structural engineering, stamped permit drawings, utility coordination, or permit filing by us.",
    helper:
      "This package is without site visit. Add Site Visit if field measuring is needed.",
    sampleLabel: "See sample",
  },
  {
    id: "large-structure-package",
    title: "Large Deck / Pergola Package",
    category: "Build",
    icon: ShieldCheck,
    pricingType: "quote",
    stripePriceId: null,
    short:
      "3D visuals and plan set prepared so an engineer can understand the job and take it from there.",
    bestFor:
      "Larger structure jobs that need a clearer package before engineering.",
    youSend:
      "Survey, dimensions, preferred layout, and any requirements you already have.",
    youGet:
      "3D visuals and plans prepared for engineer review and structural follow-up.",
    notIncluded:
      "Site visit, structural engineering, stamped permit drawings, permit fees, or permit filing by us.",
    helper:
      "This package is without site visit. Add Site Visit if field measuring is needed.",
    sampleLabel: "See sample",
  },
  {
    id: "outdoor-kitchen",
    title: "Outdoor Kitchen Package",
    category: "Build",
    icon: Box,
    pricingType: "flat",
    flatPrice: 750,
    stripePriceId: "price_outdoorkitchen_750",
    short:
      "Concept layout, AutoCAD plan support, appliance zones, clearances, and 3D visuals.",
    bestFor:
      "You need a clean concept package before detailed utility or shop work.",
    youSend:
      "Site plan, rough wish list, preferred appliance notes, and size limits.",
    youGet:
      "A conceptual outdoor kitchen layout with plan support and 3D visuals.",
    notIncluded:
      "Site visit, utility design, permit documents, appliance specification package, or construction drawings.",
    helper:
      "This package is without site visit. Add Site Visit if field measuring is needed.",
    sampleLabel: "See sample",
  },
  {
    id: "retaining-wall",
    title: "Retaining Wall Concept",
    category: "Build",
    icon: ShieldCheck,
    pricingType: "quote",
    stripePriceId: null,
    short:
      "Non-engineered retaining wall layout with visuals and plan support.",
    bestFor:
      "You need early retaining wall direction before engineering is brought in.",
    youSend: "Survey, grades if available, photos, and wall intent.",
    youGet:
      "A conceptual retaining wall layout with visuals and plan support.",
    notIncluded:
      "Site visit, structural design, stamped engineering, or final construction drawings.",
    helper:
      "This package is without site visit. Add Site Visit if field measuring is needed.",
    sampleLabel: "See sample",
  },
];

const DESIGN_DIRECTION_SERVICES: Service[] = [
  {
    id: "draw-your-idea",
    title: "You Bring the Idea, We Draw It",
    category: "Idea",
    icon: Wrench,
    pricingType: "size",
    prices: { small: 500, medium: 800, large: 1300, estate: null },
    stripePriceId: null,
    short:
      "You decide where elements, levels, features, decor, and transitions go, and we turn that into a render-ready model with a locked layout.",
    bestFor:
      "Contractors who already understand the layout and need it formalized into a clean model and presentation package.",
    youSend:
      "Your layout thinking, markups, sketches, reference images, dimensions, material links, and pictures that show the elements you want built into the model.",
    youGet:
      "A designed model with a locked layout, applied material direction, and review visuals ready to move toward rendering.",
    notIncluded:
      "Engineering, permit drawings, detailed production sheets, or takeoffs unless added later.",
    helper:
      "Support your ideas with images and material links so we can model the right elements and textures cleanly.",
  },
  {
    id: "help-design-it",
    title: "We Help Design It",
    category: "Idea",
    icon: Sparkles,
    pricingType: "size",
    prices: { small: 1000, medium: 1500, large: 2200, estate: null },
    stripePriceId: null,
    short:
      "We help shape the design brief, select references, test sketch options, and move the job toward the final rendered direction.",
    bestFor:
      "Contractors who have the lead but do not want to solve the design process alone.",
    youSend:
      "Survey, measurements, photos, style references, must-haves, rough budget level, and site constraints.",
    youGet:
      "Design brief work, reference selection, intermediate sketch options, design development, and final direction ready for rendering.",
    notIncluded:
      "Engineering, permit package, stamped drawings, planting plans, takeoffs, or detailed production sheets unless added later.",
    helper:
      "This is design development before final rendering, not just drafting a fixed idea.",
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
    stripePriceId: null,
    short:
      "A clean 2D master plan from your documents or from a layout we already produced.",
    bestFor: "You need one clear main plan sheet the crew can read.",
    youSend:
      "If we already created the layout, no extra files are needed. If not, send your approved plan, model, redlines, or source documents.",
    youGet: "A clean 2D master plan ready to print and show to the crew.",
    notIncluded: "New concept design, engineering, or permit approval.",
    helper:
      "If the source documents come from outside our process and need cleanup first, that may need added time or a separate quote.",
    sampleLabel: "See sample",
  },
  {
    id: "planting-plan",
    title: "Planting Plan + Schedule",
    category: "After layout",
    icon: Trees,
    pricingType: "size",
    prices: { small: 200, medium: 350, large: 550, estate: null },
    stripePriceId: null,
    short:
      "Technical planting sheet from your documents or from a layout we already produced.",
    bestFor: "Planting is moving forward and the crew needs a clean sheet.",
    youSend:
      "If we already built the layout, no extra base files are needed. If not, send the approved plan and plant direction or list.",
    youGet:
      "A planting plan with schedule and quantities, ready to print and show to the crew.",
    notIncluded:
      "Nursery sourcing, irrigation design, or new layout exploration.",
    helper:
      "If the base documents were not created by us and need cleanup before planting documentation, that may need added time or a separate quote.",
    sampleLabel: "See sample",
    softDependency: ["master-plan"],
    allowWithoutDependency: true,
  },
  {
    id: "paving-plan",
    title: "Hardscape Layout / Paving Pattern Plan",
    category: "After layout",
    icon: DraftingCompass,
    pricingType: "size",
    prices: { small: 200, medium: 350, large: 550, estate: null },
    stripePriceId: null,
    short:
      "A clean hardscape sheet showing paving layout, material zones, and pattern logic where needed.",
    bestFor:
      "Hardscape is approved and now needs one dedicated paving and material sheet.",
    youSend:
      "If we already built the layout, no extra base files are needed. If not, send the approved plan, materials, and any paving pattern notes.",
    youGet:
      "A hardscape plan showing layout, materials, paving patterns, and tile or paver direction where needed.",
    notIncluded:
      "Engineering, structural base design, drainage engineering, or construction details unless added separately.",
    sampleLabel: "See sample",
    softDependency: ["master-plan"],
    allowWithoutDependency: true,
  },
  {
    id: "grading",
    title: "Grading + Drainage Concept",
    category: "After layout",
    icon: DraftingCompass,
    pricingType: "size",
    prices: { small: 500, medium: 700, large: 1000, estate: null },
    stripePriceId: null,
    short:
      "Non-engineered grading and drainage concept based on topo or measured elevations.",
    bestFor:
      "The site needs slope or drainage thinking after the main layout is approved.",
    youSend:
      "Topo survey or measured elevations, approved design, and scope of improvements. If no topo exists yet, request a site visit or bring measured data first.",
    youGet:
      "A conceptual grading and drainage sheet, ready to print and discuss with the crew.",
    notIncluded:
      "Civil engineering, stamped grading plans, drainage calculations, or grading work made without usable elevation information.",
    helper:
      "We cannot guess slopes. This service needs topo or real measured elevations.",
    sampleLabel: "See sample",
    softDependency: ["master-plan"],
    allowWithoutDependency: true,
  },
  {
    id: "watering-strategy",
    title: "Basic Watering Strategy",
    category: "After layout",
    icon: Droplets,
    pricingType: "size",
    prices: { small: 200, medium: 250, large: 300, estate: null },
    stripePriceId: null,
    short:
      "A simple non-engineered plant watering strategy for the approved planting areas.",
    bestFor:
      "You want clear understanding of sun zones, shade zones, and plant watering needs before detailed irrigation work happens.",
    youSend:
      "Approved plan, planting direction, and any known notes about shade, sun exposure, or difficult areas.",
    youGet:
      "Sun and shade zone notes, watering logic by area, and recommendations such as drip or other basic watering approach where appropriate.",
    notIncluded:
      "Pipe sizing, head layout, irrigation specs, hydraulic design, or installation diagrams.",
    sampleLabel: "See sample",
    softDependency: ["master-plan"],
    allowWithoutDependency: true,
  },
  {
    id: "lighting",
    title: "Lighting Concept",
    category: "After layout",
    icon: Trees,
    pricingType: "size",
    prices: { small: 200, medium: 250, large: 300, estate: null },
    stripePriceId: null,
    short:
      "2D lighting concept. If we already have the design model, night views are included as a bonus.",
    bestFor: "The approved design needs a lighting layer added.",
    youSend:
      "If we already built the layout, no extra base files are needed. If not, send approved plan, focal points, and lighting direction if known.",
    youGet:
      "A conceptual lighting layout, ready to print and show to the crew, plus bonus night views when our model already exists.",
    notIncluded:
      "Electrical design, wiring plans, or installation drawings.",
    sampleLabel: "See sample",
    softDependency: ["master-plan"],
    allowWithoutDependency: true,
  },
  {
    id: "takeoff",
    title: "Material Quantities / Take-Off",
    category: "After layout",
    icon: FileText,
    pricingType: "size",
    prices: { small: 200, medium: 350, large: 700, estate: null },
    stripePriceId: null,
    short:
      "Material quantities and dimensions from an approved 3D or 2D design.",
    bestFor: "The scope is clear and you are ready to price the job.",
    youSend:
      "Approved plan or model if it comes from your side. If we built it, no extra files are needed.",
    youGet:
      "Quantities and dimensions based on the approved scope, delivered in Google Sheets. Tell us what format works best for your team.",
    notIncluded: "Purchasing, vendor follow-up, or field verification.",
    sampleLabel: "See sample",
    softDependency: ["master-plan"],
    allowWithoutDependency: true,
  },
  {
    id: "artistic-sheet",
    title: "Artistic Rendered Sheet",
    category: "After layout",
    icon: Trees,
    pricingType: "unit",
    unitPrice: 100,
    stripePriceId: "price_artisticsheet_100",
    quantityEnabled: true,
    quantityLabel: "sheets",
    short:
      "Artistic presentation sheet from a CAD plan, master plan, or render base.",
    bestFor:
      "You already have a plan or view and want an artistic sheet that looks better in front of the client.",
    youSend:
      "Provided CAD plan, master plan, or base render. You can also show the style you want, such as watercolor or ink sketch.",
    youGet:
      "One high-resolution artistic sheet in the selected style, such as watercolor or ink sketch. Price is per sheet, not for the whole project.",
    notIncluded: "Design revisions or new CAD work.",
    helper:
      "This can be a master plan sheet or an artistic treatment of rendered views.",
    sampleLabel: "See sample",
  },
];

const CITY_SERVICES: Service[] = [
  {
    id: "hoa-city",
    title: "HOA / City Submittal Sheet",
    category: "City",
    icon: ShieldCheck,
    pricingType: "size",
    prices: { small: 300, medium: 400, large: 600, estate: null },
    stripePriceId: null,
    short: "Add-on submittal sheet from an approved master plan and survey.",
    bestFor:
      "Jobs that already have a clean master plan and now need a submittal sheet.",
    youSend:
      "Approved master plan, survey, and any checklist or notes you already have.",
    youGet:
      "A design-intent submittal sheet, ready to print and show if needed.",
    notIncluded:
      "Approval guarantee, engineering, or legal survey work.",
    sampleLabel: "See sample",
    softDependency: ["master-plan"],
    allowWithoutDependency: true,
  },
  {
    id: "impervious",
    title: "Impervious Cover Calculation",
    category: "City",
    icon: FileText,
    pricingType: "size",
    prices: { small: 300, medium: 450, large: 650, estate: null },
    stripePriceId: null,
    short:
      "Impervious cover calculation sheet prepared in a city-style format from a master plan and survey.",
    bestFor:
      "Jobs where the jurisdiction cares how much impervious cover is already on the lot and how much is being added.",
    youSend:
      "Survey, existing hardscape information, and approved master plan or improvements.",
    youGet: "Impervious cover sheet and calculation summary.",
    notIncluded: "Engineering certification or approval guarantee.",
    sampleLabel: "See sample",
    softDependency: ["master-plan"],
    allowWithoutDependency: true,
  },
  {
    id: "tree-overlay",
    title: "Tree / CRZ Overlay",
    category: "City",
    icon: Trees,
    pricingType: "size",
    prices: { small: 500, medium: 700, large: 1000, estate: null },
    stripePriceId: null,
    short:
      "Add-on tree / CRZ overlay based on certified tree data and a clean master plan.",
    bestFor:
      "Projects where protected trees need to be shown clearly for review.",
    youSend:
      "Certified tree survey or tree inventory plus approved master plan references.",
    youGet: "A tree preservation or CRZ overlay sheet.",
    notIncluded:
      "Arborist report or legal determination by the jurisdiction.",
    sampleLabel: "See sample",
    softDependency: ["master-plan"],
    allowWithoutDependency: true,
  },
];

const IRRIGATION_SERVICES: Service[] = [
  {
    id: "irrigation-drafting",
    title: "Irrigation Drawing from Your Markups",
    category: "Irrigation",
    icon: Droplets,
    pricingType: "size",
    prices: { small: 100, medium: 200, large: 400, estate: null },
    stripePriceId: null,
    quantityEnabled: true,
    quantityLabel: "sheets",
    short: "Drafting only from irrigation markups or paper layout.",
    bestFor:
      "Licensed irrigators who already know the irrigation layout and just need it cleaned up on screen.",
    youSend: "Field markups, hand sketches, redlines, and any base files.",
    youGet:
      "Clean computer-drafted irrigation sheets, ready to print and show to the crew.",
    notIncluded:
      "Irrigation design, engineering, hydraulic calculations, or installation specifications.",
    sampleLabel: "See sample",
  },
];

const SUPPORT_SERVICES: Service[] = [
  {
    id: "site-visit-addon",
    title: "Site Visit",
    category: "Help",
    icon: Camera,
    pricingType: "flat",
    flatPrice: 200,
    stripePriceId: "price_sitevisit_200",
    short:
      "Basic local site visit time for travel, time on site, and measurement setup.",
    bestFor:
      "Jobs that need field measuring before structure work or special drawings.",
    youSend:
      "Site address, access details, and what needs to be checked.",
    youGet:
      "Site visit time, raw measurements, photos, and field notes.",
    notIncluded:
      "Base plan, 3D model, design work, or travel outside city limits.",
  },
  {
    id: "travel-outside-city",
    title: "Travel Outside City Limits",
    category: "Help",
    icon: Map,
    pricingType: "hourly",
    hourlyRate: 70,
    stripePriceId: "price_travelhour_70",
    quantityEnabled: true,
    quantityLabel: "hours",
    short: "Extra travel time when the site is outside city limits.",
    bestFor: "Out-of-town site visits.",
    youSend: "Job location and expected travel distance.",
    youGet: "Approved extra travel time billed hourly.",
    notIncluded: "Local site visit time itself.",
    helper: "Use this only together with Site Visit.",
    hardDependency: ["site-visit-addon", "site-visit-start"],
  },
  {
    id: "revision-redesign",
    title: "Additional Revision / Redesign Time",
    category: "Help",
    icon: RefreshCcw,
    pricingType: "hourly",
    hourlyRate: 70,
    stripePriceId: null,
    short:
      "Used only when revision time is still smaller than starting a new design round.",
    bestFor:
      "Changes after approval that are too big for a normal revision but still smaller than a full restart.",
    youSend: "Clear revision notes and updated direction.",
    youGet:
      "A scoped redesign discussion and approved hourly estimate in writing.",
    notIncluded:
      "Unlimited revision scope or a hidden redesign without approval.",
    helper:
      "If the redraw gets too large, it usually makes more sense to buy a new layout package instead.",
    contactOnly: true,
  },
  {
    id: "rush-fee",
    title: "Rush Fee",
    category: "Help",
    icon: Zap,
    pricingType: "percentage",
    stripePriceId: null,
    displayPriceLabel: "+25%",
    short: "Rush turnaround fee added to the priced work in the cart.",
    bestFor: "Tight deadlines that need priority scheduling.",
    youSend: "Required due date and delivery expectations.",
    youGet: "Priority scheduling when available.",
    notIncluded: "Guaranteed acceptance of impossible timelines.",
  },
];

const ALL_SERVICES = [
  ...STARTING_POINT_SERVICES,
  ...STRUCTURE_SERVICES,
  ...DESIGN_DIRECTION_SERVICES,
  ...NEXT_PHASE_SERVICES,
  ...CITY_SERVICES,
  ...IRRIGATION_SERVICES,
  ...SUPPORT_SERVICES,
];

function formatPrice(value: number | null | undefined) {
  if (value === null || value === undefined) return "Quote";
  return `$${value.toLocaleString("en-US")}`;
}

function getBasePrice(service: Service, sizeId: string): number | null {
  if (service.pricingType === "size") return service.prices?.[sizeId] ?? null;
  if (service.pricingType === "flat") return service.flatPrice ?? null;
  if (service.pricingType === "unit") return service.unitPrice ?? null;
  if (service.pricingType === "hourly") return service.hourlyRate ?? null;
  return null;
}

function sanitizeText(value?: string) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function translateServiceTitle(service: Service, _lang: Lang) {
  return service.title;
}

// ─── Before/After Slider ────────────────────────────────────────────────────

function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeLabel = "ORIGINAL",
  afterLabel = "ADAPTED CONCEPT",
}: {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}) {
  const [position, setPosition] = useState(46);

  return (
    <div className="rounded-[2rem] bg-[#071833] p-4 md:p-6">
      <div className="relative mx-auto overflow-hidden rounded-[1.75rem] border-4 border-white/90 bg-white shadow-2xl">
        <div className="relative aspect-[1/1] w-full md:aspect-[16/10]">
          <img
            src={beforeImage}
            alt={beforeLabel}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ width: `${position}%` }}
          >
            <img
              src={afterImage}
              alt={afterLabel}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="pointer-events-none absolute left-4 top-4 z-20 rounded-full bg-black/70 px-3 py-1 text-xs font-black tracking-wide text-white shadow">
            {afterLabel}
          </div>
          <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full bg-emerald-500 px-3 py-1 text-xs font-black tracking-wide text-white shadow">
            {beforeLabel}
          </div>
          <div
            className="pointer-events-none absolute top-0 bottom-0 z-10 w-1 bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.5)]"
            style={{ left: `calc(${position}% - 2px)` }}
          />
          <div
            className="pointer-events-none absolute top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-emerald-50 text-xl font-black text-emerald-700 shadow-lg"
            style={{ left: `calc(${position}% - 24px)` }}
          >
            ↔
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={position}
            onChange={(e) => setPosition(Number(e.target.value))}
            className="absolute inset-0 z-30 h-full w-full cursor-ew-resize opacity-0"
            aria-label="Compare before and after"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Landing Showcase ───────────────────────────────────────────────────────

function LandingShowcase({
  lang,
  onTryQuickConcept,
}: {
  lang: Lang;
  onTryQuickConcept: () => void;
}) {
  const t = T[lang];
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div>
          <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {t.showcaseBadge}
          </div>
          <h2 className="mt-4 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
            {t.showcaseTitle}
          </h2>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-600 md:text-lg">
            {t.showcaseDesc}
          </p>
          <div className="mt-6 grid gap-3 text-sm text-slate-700">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 font-black text-emerald-700">
                1
              </span>
              <span>{t.showcaseStep1}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 font-black text-emerald-700">
                2
              </span>
              <span>{t.showcaseStep2}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 font-black text-emerald-700">
                3
              </span>
              <span>{t.showcaseStep3}</span>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onTryQuickConcept}
              className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-6 py-4 text-base font-black text-white shadow-lg transition hover:bg-emerald-700"
            >
              {t.showcaseCta}
            </button>
            <a
              href="#service-groups"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-6 py-4 text-base font-black text-slate-900 hover:bg-slate-50"
            >
              {t.showcaseBrowse}
            </a>
          </div>
          <p className="mt-3 text-xs leading-6 text-slate-500">
            {t.showcaseNote}
          </p>
        </div>
        <BeforeAfterSlider
          beforeImage="/images/showcase-original.jpg"
          afterImage="/images/showcase-concept.jpg"
          beforeLabel="ORIGINAL"
          afterLabel="ADAPTED CONCEPT"
        />
      </div>
    </section>
  );
}

// ─── QtyControl ─────────────────────────────────────────────────────────────

function QtyControl({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="h-12 w-12 rounded-xl border border-slate-200 text-base font-bold text-slate-700 hover:bg-slate-50"
      >
        −
      </button>
      <div className="min-w-[84px] text-center text-xs font-semibold text-slate-600">
        {value} {label}
      </div>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="h-12 w-12 rounded-xl border border-slate-200 text-base font-bold text-slate-700 hover:bg-slate-50"
      >
        +
      </button>
    </div>
  );
}

// ─── Header ─────────────────────────────────────────────────────────────────

function Header({
  view,
  lang,
  setLang,
  onBack,
  onOpenHelp,
}: {
  view: ViewState;
  lang: Lang;
  setLang: (lang: Lang) => void;
  onBack: () => void;
  onOpenHelp: () => void;
}) {
  const t = T[lang];
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-4 backdrop-blur md:px-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-black md:text-2xl">{t.header}</h1>
          <p className="hidden text-xs text-slate-500 md:block">
            {t.subheader}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {view !== "SUCCESS" ? (
            <button
              type="button"
              onClick={onOpenHelp}
              className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 hover:border-slate-900"
            >
              {t.quickHelp}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 hover:border-slate-900"
          >
            {lang === "en" ? "Español 🇲🇽" : "English 🇺🇸"}
          </button>
          {view !== "MENU" ? (
            <button
              type="button"
              onClick={onBack}
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

// ─── MenuCard ────────────────────────────────────────────────────────────────

function MenuCard({
  lang,
  path,
  onSelect,
}: {
  lang: Lang;
  path: EntryPath;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(path.id)}
      className="group rounded-[2rem] border-2 border-slate-100 bg-white p-6 text-left transition-all hover:border-slate-900 hover:shadow-sm"
    >
      <div className="text-xl font-black text-slate-900">
        {lang === "en" ? path.title : path.titleEs}
      </div>
      <p className="mt-2 text-sm text-slate-500">
        {lang === "en" ? path.description : path.descriptionEs}
      </p>
      <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
        {lang === "en" ? path.helper : path.helperEs}
      </div>
      <div className="mt-4 inline-flex items-center text-sm font-black text-slate-900">
        {lang === "en" ? "Open this group" : "Abrir este grupo"} →
      </div>
    </button>
  );
}

// ─── SizeSelector ────────────────────────────────────────────────────────────

function SizeSelector({
  value,
  onChange,
  lang,
}: {
  value: string;
  onChange: (id: string) => void;
  lang: Lang;
}) {
  const t = T[lang];
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h3 className="text-2xl font-black tracking-tight text-slate-900">
        {t.propertySize}
      </h3>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {SIZES.map((size) => {
          const active = size.id === value;
          return (
            <button
              key={size.id}
              type="button"
              onClick={() => onChange(size.id)}
              className={`rounded-[1.75rem] border-2 p-5 text-left transition-all ${
                active
                  ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                  : "border-slate-200 bg-white hover:border-slate-900"
              }`}
            >
              <div className="text-3xl">{size.visual}</div>
              <div className="mt-4 text-lg font-black">{size.label}</div>
              <div
                className={`text-sm ${
                  active ? "text-slate-200" : "text-slate-500"
                }`}
              >
                {size.sublabel}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ─── ServiceSection ──────────────────────────────────────────────────────────

function ServiceSection({
  title,
  description,
  services,
  selectedSize,
  cart,
  lang,
  getNotice,
  onToggle,
  onQty,
  onDiscuss,
}: {
  title: string;
  description: string;
  services: Service[];
  selectedSize: string;
  cart: Record<string, number>;
  lang: Lang;
  getNotice: (service: Service) => { kind: NoticeKind; text: string | null };
  onToggle: (service: Service) => void;
  onQty: (serviceId: string, qty: number) => void;
  onDiscuss: (service: Service) => void;
}) {
  const t = T[lang];
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {services.length} items
        </div>
      </div>
      <div className="grid gap-5">
        {services.map((service) => {
          const Icon = service.icon;
          const selected = Boolean(cart[service.id]);
          const notice = getNotice(service);
          const priceLabel =
            service.pricingType === "percentage"
              ? service.displayPriceLabel ?? "+25%"
              : formatPrice(getBasePrice(service, selectedSize));
          return (
            <article
              key={service.id}
              className={`rounded-[1.75rem] border p-5 transition-all ${
                selected
                  ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                  : "border-slate-200 bg-white hover:border-slate-900 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`rounded-2xl p-3 ${
                      selected ? "bg-white/10" : "bg-slate-100"
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        selected ? "text-white" : "text-slate-700"
                      }`}
                    />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-black leading-tight">
                        {translateServiceTitle(service, lang)}
                      </h4>
                      {service.badgeLabel ? (
                        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                          {service.badgeLabel}
                        </span>
                      ) : null}
                      {service.sampleLabel ? (
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {service.sampleLabel}
                        </span>
                      ) : null}
                    </div>
                    <p
                      className={`mt-2 text-sm leading-6 ${
                        selected ? "text-slate-200" : "text-slate-600"
                      }`}
                    >
                      {service.short}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-lg font-black ${
                      selected ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {priceLabel}
                  </div>
                  <div
                    className={`text-xs ${
                      selected ? "text-slate-300" : "text-slate-500"
                    }`}
                  >
                    {service.category}
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div
                  className={`rounded-2xl p-4 ${
                    selected ? "bg-white/10" : "bg-slate-50"
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-wide opacity-70">
                    {t.bestFor}
                  </div>
                  <p className="mt-2 text-sm leading-6">{service.bestFor}</p>
                </div>
                <div
                  className={`rounded-2xl p-4 ${
                    selected ? "bg-white/10" : "bg-slate-50"
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-wide opacity-70">
                    {t.youSend}
                  </div>
                  <p className="mt-2 text-sm leading-6">{service.youSend}</p>
                </div>
                <div
                  className={`rounded-2xl p-4 ${
                    selected ? "bg-white/10" : "bg-slate-50"
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-wide opacity-70">
                    {t.youGet}
                  </div>
                  <p className="mt-2 text-sm leading-6">{service.youGet}</p>
                </div>
                <div
                  className={`rounded-2xl p-4 ${
                    selected ? "bg-white/10" : "bg-slate-50"
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-wide opacity-70">
                    {t.notIncluded}
                  </div>
                  <p className="mt-2 text-sm leading-6">
                    {service.notIncluded}
                  </p>
                </div>
              </div>
              {service.helper ? (
                <div
                  className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                    selected
                      ? "border-white/15 bg-white/5 text-slate-200"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  {service.helper}
                </div>
              ) : null}
              {notice.text ? (
                <div
                  className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                    notice.kind === "hard"
                      ? "border-amber-200 bg-amber-50 text-amber-900"
                      : "border-blue-200 bg-blue-50 text-blue-900"
                  }`}
                >
                  <span className="font-black">{t.warning}: </span>
                  {notice.text}
                </div>
              ) : null}
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                {service.quantityEnabled && selected ? (
                  <QtyControl
                    value={cart[service.id] ?? 1}
                    onChange={(qty) => onQty(service.id, qty)}
                    label={service.quantityLabel ?? t.qty.toLowerCase()}
                  />
                ) : (
                  <div className="text-sm text-slate-500">
                    {selected ? `${t.qty}: ${cart[service.id]}` : ""}
                  </div>
                )}
                {service.contactOnly ? (
                  <button
                    type="button"
                    onClick={() => onDiscuss(service)}
                    className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
                  >
                    {t.discussInHelp}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={notice.kind === "hard"}
                    onClick={() => onToggle(service)}
                    className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-black transition ${
                      selected
                        ? "bg-white text-slate-900 hover:bg-slate-100"
                        : notice.kind === "hard"
                        ? "cursor-not-allowed bg-slate-200 text-slate-400"
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    }`}
                  >
                    {selected ? <Check className="h-4 w-4" /> : null}
                    {selected
                      ? t.remove
                      : notice.kind === "hard"
                      ? t.chooseFirst
                      : t.add}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// ─── ProjectInfoCard ─────────────────────────────────────────────────────────

function ProjectInfoCard({
  contact,
  onChange,
  lang,
}: {
  contact: OrderContact;
  onChange: (patch: Partial<OrderContact>) => void;
  lang: Lang;
}) {
  const t = T[lang];
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h3 className="text-2xl font-black tracking-tight text-slate-900">
        {t.projectInfo}
      </h3>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">
            {t.clientName}
          </span>
          <input
            value={contact.clientName}
            onChange={(e) => onChange({ clientName: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">
            {t.clientEmail}
          </span>
          <input
            type="email"
            value={contact.customerEmail}
            onChange={(e) => onChange({ customerEmail: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
          />
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">
            {t.projectAddress}
          </span>
          <input
            value={contact.projectAddress}
            onChange={(e) => onChange({ projectAddress: e.target.value })}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
          />
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">
            {t.notes}
          </span>
          <textarea
            value={contact.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            maxLength={NOTES_LIMIT}
            rows={6}
            placeholder={t.notesPlaceholder}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-slate-400"
          />
          <div className="text-right text-xs text-slate-400">
            {contact.notes.length} / {NOTES_LIMIT}
          </div>
          <div className="text-xs text-slate-500">{t.notesHelp}</div>
        </label>
      </div>
    </section>
  );
}

// ─── SummarySidebar ──────────────────────────────────────────────────────────

function SummarySidebar({
  lang,
  items,
  total,
  deposit,
  remaining,
  rushFee,
  hasTbd,
  canCheckout,
  isCreating,
  onCopy,
  onReset,
  onCheckout,
  copied,
  cleared,
}: {
  lang: Lang;
  items: SummaryLine[];
  total: number;
  deposit: number;
  remaining: number;
  rushFee: number;
  hasTbd: boolean;
  canCheckout: boolean;
  isCreating: boolean;
  onCopy: () => void;
  onReset: () => void;
  onCheckout: () => void;
  copied: boolean;
  cleared: boolean;
}) {
  const t = T[lang];
  return (
    <aside className="h-fit lg:sticky lg:top-24">
      <div className="space-y-6 rounded-[2.5rem] border-2 border-slate-900 bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">{t.summary}</h2>
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Live
          </span>
        </div>
        <div className="space-y-3 rounded-3xl bg-slate-50 p-5">
          {items.length === 0 ? (
            <p className="text-center text-sm text-slate-400">
              {t.nothingSelected}
            </p>
          ) : (
            items.map((item, index) => (
              <div
                key={`${item.title}-${index}`}
                className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3 last:border-0 last:pb-0"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {item.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {t.qty}: {item.qty}
                  </div>
                </div>
                <div className="text-right text-sm font-bold text-slate-900">
                  {item.isQuote || item.price === null
                    ? t.tbd
                    : formatPrice(item.price)}
                </div>
              </div>
            ))
          )}
        </div>
        {rushFee ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t.rushFee}: {formatPrice(rushFee)}
          </div>
        ) : null}
        <div className="rounded-3xl border border-slate-200 p-5 text-sm">
          {hasTbd ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">
                  {t.currentPricedSubtotal}
                </span>
                <span className="font-bold text-slate-900">
                  {formatPrice(total)}
                </span>
              </div>
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                {t.tbdHelp}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t.total}</span>
                <span className="font-bold text-slate-900">
                  {formatPrice(total)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-slate-500">{t.deposit}</span>
                <span className="font-bold text-slate-900">
                  {formatPrice(deposit)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-slate-500">{t.remaining}</span>
                <span className="font-bold text-slate-900">
                  {formatPrice(remaining)}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="grid gap-3">
          <button
            type="button"
            onClick={onCopy}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-4 text-sm font-black text-slate-900 hover:bg-slate-50"
          >
            <Copy className="h-4 w-4" />
            {copied ? t.copied : t.copySummary}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-4 text-sm font-black text-slate-900 hover:bg-slate-50"
          >
            <RefreshCcw className="h-4 w-4" />
            {cleared ? t.cleared : t.resetCart}
          </button>
        </div>
        <button
          type="button"
          disabled={!canCheckout || isCreating}
          onClick={onCheckout}
          className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-5 text-lg font-black text-white shadow-lg ${
            !canCheckout || isCreating
              ? "bg-slate-300"
              : "bg-slate-900 hover:bg-slate-800"
          }`}
        >
          {isCreating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <FileText className="h-5 w-5" />
          )}
          {isCreating ? t.generating : t.generateInvoice}
        </button>
        <div className="text-xs leading-6 text-slate-500">{t.termsLine}</div>
      </div>
    </aside>
  );
}

// ─── QuickHelpModal ──────────────────────────────────────────────────────────

function QuickHelpModal({
  lang,
  form,
  setForm,
  onClose,
  onSend,
  sending,
  sent,
}: {
  lang: Lang;
  form: QuickHelpForm;
  setForm: (patch: Partial<QuickHelpForm>) => void;
  onClose: () => void;
  onSend: () => void;
  sending: boolean;
  sent: boolean;
}) {
  const t = T[lang];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-xl rounded-[2rem] bg-white p-6 shadow-2xl md:p-8">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-black text-slate-900">
              {t.quickHelpTitle}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {t.quickHelpText}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-5 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              {t.helpContact}
            </span>
            <input
              placeholder={t.helpContactPlaceholder}
              value={form.contact}
              onChange={(e) => setForm({ contact: e.target.value })}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              {t.helpQuestion}
            </span>
            <textarea
              value={form.question}
              onChange={(e) => setForm({ question: e.target.value })}
              rows={4}
              maxLength={1000}
              placeholder={t.helpQuestionPlaceholder}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-slate-400"
            />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              {t.helpBudgetTimeline}
            </span>
            <input
              placeholder={t.helpBudgetTimelinePlaceholder}
              value={form.budgetTimeline}
              onChange={(e) => setForm({ budgetTimeline: e.target.value })}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </label>
          {sent ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {t.helpSent}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-900 hover:bg-slate-50"
            >
              {t.close}
            </button>
            <button
              type="button"
              onClick={onSend}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
            >
              {sending ? t.helpSending : t.helpSend}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SuccessIntake ───────────────────────────────────────────────────────────

function SuccessIntake({
  lang,
  order,
}: {
  lang: Lang;
  order: PaidOrderSnapshot;
}) {
  const t = T[lang];
  const [brief, setBrief] = useState("");
  const [photos, setPhotos] = useState<FileList | null>(null);
  const [docs, setDocs] = useState<FileList | null>(null);
  const [saved, setSaved] = useState(false);

  async function saveIntake() {
    try {
      const formData = new FormData();
      formData.append("order_id", order.orderId);
      formData.append("session_id", order.sessionId);
      formData.append("brief", brief);
      if (photos) {
        Array.from(photos).forEach((file) =>
          formData.append("photos", file as File)
        );
      }
      if (docs) {
        Array.from(docs).forEach((file) =>
          formData.append("docs", file as File)
        );
      }
      try {
        await fetch("/api/intake-upload", { method: "POST", body: formData });
      } catch {
        // preview fallback
      }
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  function openProjectChat() {
    const text = encodeURIComponent(
      `Hi Olya, I just paid for ${order.pathTitle} at ${order.projectAddress}. Order ID: ${order.orderId}.`
    );
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        {t.successTitle}
      </div>
      <h2 className="mt-5 text-3xl font-black text-slate-900">
        {t.successTitle}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{t.successText}</p>
      <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
        {t.uploadWidgetNote}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 rounded-3xl border border-slate-200 p-4">
          <span className="text-sm font-semibold text-slate-700">
            {t.uploadPhotos}
          </span>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            <Upload className="mb-3 h-5 w-5" />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setPhotos(e.target.files)}
            />
          </div>
        </label>
        <label className="grid gap-2 rounded-3xl border border-slate-200 p-4">
          <span className="text-sm font-semibold text-slate-700">
            {t.uploadSurvey}
          </span>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            <Upload className="mb-3 h-5 w-5" />
            <input
              type="file"
              accept=".pdf,image/*"
              multiple
              onChange={(e) => setDocs(e.target.files)}
            />
          </div>
        </label>
      </div>
      <label className="mt-5 grid gap-2">
        <span className="text-sm font-semibold text-slate-700">
          {t.detailedBrief}
        </span>
        <textarea
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          rows={8}
          placeholder={t.detailedBriefPlaceholder}
          className="rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none focus:border-slate-400"
        />
      </label>
      {saved ? (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {t.intakeSaved}
        </div>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={saveIntake}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-black text-white hover:bg-slate-800"
        >
          {t.saveIntake}
        </button>
        <button
          type="button"
          onClick={openProjectChat}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-900 hover:bg-slate-50"
        >
          <MessageCircle className="h-4 w-4" />
          {t.openProjectChat}
        </button>
      </div>
      <div className="mt-5 text-xs leading-6 text-slate-500">
        {t.successNote}
      </div>
    </section>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [view, setView] = useState<ViewState>("MENU");
  const [activePath, setActivePath] = useState<string>("quick-sale");
  const [selectedSize, setSelectedSize] = useState<string>("small");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [contact, setContact] = useState<OrderContact>({
    clientName: "",
    customerEmail: "",
    projectAddress: "",
    notes: "",
  });
  const [copied, setCopied] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [sendingHelp, setSendingHelp] = useState(false);
  const [helpSent, setHelpSent] = useState(false);
  const [helpForm, setHelpForm] = useState<QuickHelpForm>({
    contact: "",
    question: "",
    budgetTimeline: "",
  });
  const [creatingCheckout, setCreatingCheckout] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [paidOrder, setPaidOrder] = useState<PaidOrderSnapshot | null>(null);

  const t = T[lang];
  const selectedPath =
    ENTRY_PATHS.find((path) => path.id === activePath) ?? ENTRY_PATHS[0];

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(timer);
  }, [copied]);

  useEffect(() => {
    if (!cleared) return;
    const timer = window.setTimeout(() => setCleared(false), 1200);
    return () => window.clearTimeout(timer);
  }, [cleared]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (path === "/success") {
      setView("SUCCESS");
      setVerifying(true);
      const verify = async () => {
        try {
          const response = await fetch(
            `/api/checkout-session-status?session_id=${encodeURIComponent(
              sessionId ?? ""
            )}`
          );
          if (!response.ok) throw new Error("verify failed");
          const data = await response.json();
          setPaidOrder({
            sessionId: sessionId ?? "",
            orderId: data.orderId ?? `order_${Date.now()}`,
            pathId: data.pathId ?? "paid-order",
            pathTitle: data.pathTitle ?? "Paid order",
            sizeId: data.sizeId ?? "small",
            sizeLabel: data.sizeLabel ?? "Small",
            clientName: data.clientName ?? "",
            customerEmail: data.customerEmail ?? "",
            projectAddress: data.projectAddress ?? "",
            items: data.items ?? [],
          });
        } catch {
          if (DEMO_MODE) {
            setPaidOrder({
              sessionId: sessionId ?? `demo_session_${Date.now()}`,
              orderId: `demo_${Date.now()}`,
              pathId: "demo",
              pathTitle: "Paid order",
              sizeId: "small",
              sizeLabel: "Small",
              clientName: "Demo Client",
              customerEmail: "client@example.com",
              projectAddress: "Project address",
              items: [],
            });
            setCheckoutNotice(t.previewMode);
          }
        } finally {
          setVerifying(false);
        }
      };
      void verify();
    }
  }, [t.previewMode]);

  const hasLayout = Object.keys(cart).some(
    (id) =>
      DESIGN_DIRECTION_SERVICES.some((service) => service.id === id) ||
      STRUCTURE_SERVICES.some((service) => service.id === id)
  );

  function getNotice(service: Service): {
    kind: NoticeKind;
    text: string | null;
  } {
    if (
      service.hardDependency?.includes("site-visit-start") &&
      !cart["site-visit-start"]
    ) {
      return { kind: "hard", text: t.hardDependencySiteVisit };
    }
    if (
      service.hardDependency?.includes("site-visit-addon") &&
      !cart["site-visit-addon"] &&
      !cart["site-visit-start"]
    ) {
      return { kind: "hard", text: t.hardDependencyOutsideCity };
    }
    if (
      service.softDependency?.includes("master-plan") &&
      !cart["master-plan"] &&
      !hasLayout
    ) {
      return { kind: "soft", text: t.softDependencyMasterPlan };
    }
    if (
      NEXT_PHASE_SERVICES.some((item) => item.id === service.id) &&
      service.id !== "artistic-sheet" &&
      !hasLayout &&
      !cart["master-plan"]
    ) {
      return { kind: "soft", text: t.softDependencyLayout };
    }
    return { kind: null, text: null };
  }

  const pricedItems = useMemo(() => {
    return ALL_SERVICES.filter((service) => cart[service.id]).map((service) => {
      const qty = cart[service.id];
      const base = getBasePrice(service, selectedSize);
      const price =
        service.pricingType === "quote" || base === null
          ? null
          : base * qty;
      const isQuote = service.pricingType === "quote" || base === null;
      return { service, qty, price, isQuote };
    });
  }, [cart, selectedSize]);

  const pricedSubtotal = pricedItems.reduce(
    (sum, item) => sum + (item.price ?? 0),
    0
  );
  const rushFee = cart["rush-fee"] ? Math.round(pricedSubtotal * 0.25) : 0;
  const total = pricedSubtotal + rushFee;
  const deposit = Math.round(total * 0.7);
  const remaining = total - deposit;
  const hasTbd = pricedItems.some((item) => item.isQuote);
  const hasPayableService = pricedItems.some(
    (item) => item.service.stripePriceId && !item.isQuote
  );
  const canCheckout =
    Boolean(contact.clientName.trim()) &&
    Boolean(contact.customerEmail.trim()) &&
    hasPayableService &&
    !hasTbd;

  const summaryLines: SummaryLine[] = pricedItems.map((item) => ({
    title: translateServiceTitle(item.service, lang),
    qty: item.qty,
    price: item.price,
    isQuote: item.isQuote,
  }));

  const summaryText = [
    `Path: ${selectedPath.title}`,
    `Size: ${SIZES.find((size) => size.id === selectedSize)?.label ?? selectedSize}`,
    "",
    ...pricedItems.map(
      (item) =>
        `• ${translateServiceTitle(item.service, lang)} x${item.qty} — ${
          item.isQuote ? t.tbd : formatPrice(item.price)
        }`
    ),
    "",
    `Client: ${contact.clientName || "-"}`,
    `Email: ${contact.customerEmail || "-"}`,
    `Address: ${contact.projectAddress || "-"}`,
    contact.notes ? `Notes: ${contact.notes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  function openHelpWithService(service: Service) {
    setHelpForm((prev) => ({
      ...prev,
      question: `Question about ${translateServiceTitle(service, lang)}: `,
    }));
    setShowHelp(true);
  }

  function toggleService(service: Service) {
    const notice = getNotice(service);
    if (notice.kind === "hard") return;
    setCart((prev) => {
      const next = { ...prev };
      if (next[service.id]) delete next[service.id];
      else next[service.id] = 1;
      return next;
    });
  }

  function updateQty(serviceId: string, qty: number) {
    setCart((prev) => ({ ...prev, [serviceId]: Math.max(1, qty) }));
  }

  function resetCart() {
    if (!window.confirm(t.confirmReset)) return;
    setCart({});
    setSelectedSize("small");
    setContact({ clientName: "", customerEmail: "", projectAddress: "", notes: "" });
    setCleared(true);
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  async function sendQuickHelp() {
    const payload = {
      contact: sanitizeText(helpForm.contact),
      question: sanitizeText(helpForm.question),
      budgetTimeline: sanitizeText(helpForm.budgetTimeline),
    };
    if (!payload.contact || !payload.question) return;
    setSendingHelp(true);
    try {
      await fetch("/api/quick-help", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => undefined);
      setHelpSent(true);
    } finally {
      setSendingHelp(false);
    }
  }

  async function createCheckout() {
    if (!canCheckout) {
      setCheckoutNotice(hasTbd ? t.quoteBlocksCheckout : t.fillRequired);
      return;
    }
    setCreatingCheckout(true);
    setCheckoutNotice(null);
    const orderId = `order_${Date.now()}`;
    const orderDraftPayload = {
      order_id: orderId,
      path_id: activePath,
      path_title: selectedPath.title,
      size_id: selectedSize,
      client_name: sanitizeText(contact.clientName),
      customer_email: sanitizeText(contact.customerEmail),
      project_address: sanitizeText(contact.projectAddress),
      full_notes: contact.notes,
      payment_status: "pending_payment",
      items: pricedItems.map((item) => ({
        id: item.service.id,
        title: translateServiceTitle(item.service, lang),
        quantity: item.qty,
        unit_amount: getBasePrice(item.service, selectedSize),
        stripe_price_id: item.service.stripePriceId,
        pricing_type: item.service.pricingType,
      })),
    };
    try {
      await fetch("/api/order-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderDraftPayload),
      }).catch(() => undefined);
      const payload = {
        customer_email: sanitizeText(contact.customerEmail),
        client_name: sanitizeText(contact.clientName),
        project_address: sanitizeText(contact.projectAddress),
        path_id: activePath,
        size_id: selectedSize,
        items: pricedItems
          .filter((item) => item.service.stripePriceId && !item.isQuote)
          .map((item) => ({
            stripe_price_id: item.service.stripePriceId,
            quantity: item.qty,
            title: translateServiceTitle(item.service, lang),
          })),
        metadata: {
          internal_id: orderId,
          project_address: sanitizeText(contact.projectAddress),
          short_notes: contact.notes.slice(0, 250),
        },
        full_notes: contact.notes,
      };
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("checkout failed");
      const data = await response.json();
      if (!data?.url) throw new Error("missing url");
      window.location.href = data.url;
    } catch {
      if (DEMO_MODE) {
        setPaidOrder({
          sessionId: `demo_session_${Date.now()}`,
          orderId,
          pathId: activePath,
          pathTitle: selectedPath.title,
          sizeId: selectedSize,
          sizeLabel:
            SIZES.find((size) => size.id === selectedSize)?.label ?? selectedSize,
          clientName: contact.clientName,
          customerEmail: contact.customerEmail,
          projectAddress: contact.projectAddress,
          items: pricedItems.map((item) => ({
            id: item.service.id,
            title: translateServiceTitle(item.service, lang),
            qty: item.qty,
          })),
        });
        setCheckoutNotice(t.previewMode);
        setView("SUCCESS");
      } else {
        setCheckoutNotice("Checkout endpoint is not connected yet.");
      }
    } finally {
      setCreatingCheckout(false);
    }
  }

  function renderConfig() {
    switch (activePath) {
      case "quick-sale":
        return (
          <ServiceSection
            title={t.quickSection}
            description={t.quickSectionDesc}
            services={STARTING_POINT_SERVICES.filter(
              (service) => service.id === "photo-concept-start"
            )}
            selectedSize={selectedSize}
            cart={cart}
            lang={lang}
            getNotice={getNotice}
            onToggle={toggleService}
            onQty={updateQty}
            onDiscuss={openHelpWithService}
          />
        );
      case "build-one":
        return (
          <div className="space-y-8">
            <ServiceSection
              title={t.buildSection}
              description={t.buildSectionDesc}
              services={STRUCTURE_SERVICES}
              selectedSize={selectedSize}
              cart={cart}
              lang={lang}
              getNotice={getNotice}
              onToggle={toggleService}
              onQty={updateQty}
              onDiscuss={openHelpWithService}
            />
            <ServiceSection
              title={t.supportSection}
              description={t.supportSectionDesc}
              services={SUPPORT_SERVICES}
              selectedSize={selectedSize}
              cart={cart}
              lang={lang}
              getNotice={getNotice}
              onToggle={toggleService}
              onQty={updateQty}
              onDiscuss={openHelpWithService}
            />
          </div>
        );
      case "full-design":
        return (
          <div className="space-y-8">
            <SizeSelector
              value={selectedSize}
              onChange={setSelectedSize}
              lang={lang}
            />
            <ServiceSection
              title={t.startSection}
              description={t.startSectionDesc}
              services={STARTING_POINT_SERVICES.filter(
                (service) => service.id !== "photo-concept-start"
              )}
              selectedSize={selectedSize}
              cart={cart}
              lang={lang}
              getNotice={getNotice}
              onToggle={toggleService}
              onQty={updateQty}
              onDiscuss={openHelpWithService}
            />
            <ServiceSection
              title={t.ideaSection}
              description={t.ideaSectionDesc}
              services={DESIGN_DIRECTION_SERVICES}
              selectedSize={selectedSize}
              cart={cart}
              lang={lang}
              getNotice={getNotice}
              onToggle={toggleService}
              onQty={updateQty}
              onDiscuss={openHelpWithService}
            />
            <ServiceSection
              title={t.afterLayout}
              description={t.afterLayoutDesc}
              services={NEXT_PHASE_SERVICES}
              selectedSize={selectedSize}
              cart={cart}
              lang={lang}
              getNotice={getNotice}
              onToggle={toggleService}
              onQty={updateQty}
              onDiscuss={openHelpWithService}
            />
          </div>
        );
      case "special-drawings":
        return (
          <div className="space-y-8">
            <SizeSelector
              value={selectedSize}
              onChange={setSelectedSize}
              lang={lang}
            />
            <ServiceSection
              title={t.specialSection}
              description={t.specialSectionDesc}
              services={NEXT_PHASE_SERVICES}
              selectedSize={selectedSize}
              cart={cart}
              lang={lang}
              getNotice={getNotice}
              onToggle={toggleService}
              onQty={updateQty}
              onDiscuss={openHelpWithService}
            />
            <ServiceSection
              title={t.citySection}
              description={t.citySectionDesc}
              services={CITY_SERVICES}
              selectedSize={selectedSize}
              cart={cart}
              lang={lang}
              getNotice={getNotice}
              onToggle={toggleService}
              onQty={updateQty}
              onDiscuss={openHelpWithService}
            />
            <ServiceSection
              title={t.irrigationSection}
              description={t.irrigationSectionDesc}
              services={IRRIGATION_SERVICES}
              selectedSize={selectedSize}
              cart={cart}
              lang={lang}
              getNotice={getNotice}
              onToggle={toggleService}
              onQty={updateQty}
              onDiscuss={openHelpWithService}
            />
            <ServiceSection
              title={t.supportSection}
              description={t.supportSectionDesc}
              services={SUPPORT_SERVICES}
              selectedSize={selectedSize}
              cart={cart}
              lang={lang}
              getNotice={getNotice}
              onToggle={toggleService}
              onQty={updateQty}
              onDiscuss={openHelpWithService}
            />
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 pb-20 text-slate-900">
      <Header
        view={view}
        lang={lang}
        setLang={setLang}
        onBack={() => {
          if (view === "SUCCESS") setView("CONFIG");
          else setView("MENU");
        }}
        onOpenHelp={() => setShowHelp(true)}
      />
      <main className="mx-auto max-w-7xl px-4 pt-8 md:px-10">
        {view === "MENU" ? (
          <div className="space-y-8">
            <LandingShowcase
              lang={lang}
              onTryQuickConcept={() => {
                setActivePath("quick-sale");
                setView("CONFIG");
              }}
            />
            <section
              id="service-groups"
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8"
            >
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                  {t.selectPath}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {t.selectPathHelp}
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {ENTRY_PATHS.map((path) => (
                  <MenuCard
                    key={path.id}
                    lang={lang}
                    path={path}
                    onSelect={(id) => {
                      setActivePath(id);
                      setView("CONFIG");
                    }}
                  />
                ))}
              </div>
            </section>
          </div>
        ) : view === "SUCCESS" ? (
          <div className="space-y-6">
            {checkoutNotice ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                {checkoutNotice}
              </div>
            ) : null}
            {verifying ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-10 shadow-sm">
                <div className="flex items-center gap-3 text-slate-700">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-semibold">
                    {t.verifyingPayment}
                  </span>
                </div>
              </div>
            ) : paidOrder ? (
              <SuccessIntake lang={lang} order={paidOrder} />
            ) : null}
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <div className="min-w-0 space-y-8">
              <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-2 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {t.activeGroup}
                    </div>
                    <h2 className="text-2xl font-black">
                      {lang === "en"
                        ? selectedPath.title
                        : selectedPath.titleEs}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {lang === "en"
                        ? selectedPath.description
                        : selectedPath.descriptionEs}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
                  >
                    {t.reviewOrder}
                  </button>
                </div>
              </section>
              {renderConfig()}
              <ProjectInfoCard
                contact={contact}
                onChange={(patch) =>
                  setContact((prev) => ({ ...prev, ...patch }))
                }
                lang={lang}
              />
              {checkoutNotice ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {checkoutNotice}
                </div>
              ) : null}
            </div>
            <SummarySidebar
              lang={lang}
              items={summaryLines}
              total={total}
              deposit={deposit}
              remaining={remaining}
              rushFee={rushFee}
              hasTbd={hasTbd}
              canCheckout={canCheckout}
              isCreating={creatingCheckout}
              onCopy={copySummary}
              onReset={resetCart}
              onCheckout={createCheckout}
              copied={copied}
              cleared={cleared}
            />
          </div>
        )}
      </main>
      {showHelp ? (
        <QuickHelpModal
          lang={lang}
          form={helpForm}
          setForm={(patch) =>
            setHelpForm((prev) => ({ ...prev, ...patch }))
          }
          onClose={() => setShowHelp(false)}
          onSend={sendQuickHelp}
          sending={sendingHelp}
          sent={helpSent}
        />
      ) : null}
    </div>
  );
}
