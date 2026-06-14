import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Box,
  Camera,
  Check,
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
type PartnerProfileMode = "new" | "existing";
type ClientNameDisplay = "show" | "hide";
type AddressDisplay = "full" | "street" | "project" | "hide";
type LogoOption = "upload" | "on-file" | "text-only";
type ViewState = "LANDING" | "MENU" | "CONFIG" | "SUCCESS";
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
  cta: string;
  ctaEs: string;
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
  customerPhone: string;
  projectAddress: string;
  notes: string;
  partnerProfileMode: PartnerProfileMode;
  whiteLabelCompany: string;
  whiteLabelPhone: string;
  whiteLabelEmail: string;
  whiteLabelWebsite: string;
  desiredDeliveryDate: string;
  clientNameDisplay: ClientNameDisplay;
  addressDisplay: AddressDisplay;
  logoOption: LogoOption;
  brandingNotes: string;
  sameProjectConfirmed: boolean;
  rememberPartnerInfo: boolean;
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
  customerPhone: string;
  projectAddress: string;
  items: Array<{ id: string; title: string; qty: number }>;
}

interface SummaryLine {
  title: string;
  qty: number;
  price: number | null;
  isQuote: boolean;
}

const DEMO_MODE = false;
const NOTES_LIMIT = 2000;
const WHATSAPP_NUMBER = "15551234567";
const SOCIAL_LINKS = {
  // Add SiteForm Studio social links later. Leave empty to show the icon as disabled.
  instagram: "",
  facebook: "",
  tiktok: "",
  youtube: "",
  email: "",
};

const T = {
  en: {
    header: "Scope Builder",
    subheader: "White-label drafting and visuals for outdoor pros",
    selectPath: "What do you need help with?",
    selectPathHelp:
      "Start with the option closest to your project. You can add site visits, extra sheets, or more detail later.",
    openThisGroup: "Open this group",
    back: "Back to services",
    backHome: "Back to home",
    propertySize: "Design area size",
    projectInfo: "Contact and project details",
    clientName: "Your name / company",
    clientNamePlaceholder: "Name or company we should contact",
    clientEmail: "Your email",
    clientEmailPlaceholder: "Email for this order",
    clientPhone: "Your phone number",
    clientPhonePlaceholder: "Phone or WhatsApp number",
    projectAddress: "Project / client label",
    projectAddressPlaceholder: "Example: Garcia backyard, Oak St deck, Project 24-018, or full address",
    projectLabelHelp:
      "Required. Use a client name, street name, project nickname, or internal job number. Everything selected in this order must belong to this one client/project.",
    notes: "Project details",
    notesHelp:
      "Required. Add what you need, what the feature or yard is, what files/photos you have, and any location notes. Full address is optional at this stage.",
    partnerProfileTitle: "Partner / white-label profile",
    partnerProfileHelp:
      "Tell us how your company info should appear on white-label PDFs and sheets. Repeat partners can ask us to use details already on file.",
    partnerProfileQuestion: "Is this your first order with us?",
    partnerProfileNew: "Yes, set up my white-label info",
    partnerProfileExisting: "No, use my company info already on file",
    whiteLabelCompany: "Company name to show on deliverables",
    whiteLabelCompanyPlaceholder: "Example: Martinez Decks & Outdoor Living",
    whiteLabelPhone: "Phone to show on sheets",
    whiteLabelPhonePlaceholder: "Leave blank if you do not want a phone shown",
    whiteLabelEmail: "Email to show on sheets",
    whiteLabelEmailPlaceholder: "Leave blank if you do not want an email shown",
    whiteLabelWebsite: "Website / social handle",
    whiteLabelWebsitePlaceholder: "Website, Instagram, Facebook, or other public contact",
    desiredDeliveryDate: "Desired delivery date (optional)",
    desiredDeliveryDateHelp: "Rush timing still depends on our schedule.",
    clientNameDisplay: "Client name display",
    showClientName: "Show client name",
    hideClientName: "Do not show client name",
    addressDisplay: "Project/address display",
    addressFull: "Full address",
    addressStreet: "Street only",
    addressProject: "Project name only",
    addressHide: "Do not show address",
    logoOption: "Logo option",
    logoUpload: "Upload a new logo with this order",
    logoOnFile: "Use logo already on file",
    logoTextOnly: "Text-only company name, no logo",
    brandingNotes: "Branding notes",
    brandingNotesPlaceholder:
      "Example: Use my company name only. Do not show my phone. Show client street only.",
    sameProjectConfirm: "I confirm all selected services in this order are for the same client/project.",
    sameProjectHelp:
      "If you have different clients, properties, or unrelated jobs, please submit separate orders.",
    oneProjectSummary:
      "One order = one client/project and one white-label setup. For different clients or properties, submit separate orders.",
    rememberPartnerInfo: "Remember my company info on this device",
    rememberHelp:
      "This is not an account. It only saves these fields in this browser.",
    notesPlaceholder:
      "Example: Addison backyard. Need quick concept from one photo. Client wants a patio cover. Exact address can be shared later if needed.",
    quickHelp: "Need help choosing?",
    quickHelpTitle: "Questions?",
    quickHelpText:
      "Submit your project details or questions below. Leave your email or phone number, and we'll get back to you if it fits our current workflow.",
    helpContact: "Email or phone",
    helpContactPlaceholder: "How should we reach you?",
    helpQuestion: "Your question or project address",
    helpQuestionPlaceholder:
      "Tell us what you need, where the project is, and what feels unclear.",
    helpBudgetTimeline: "Budget / Timeline (optional)",
    helpBudgetTimelinePlaceholder:
      "Example: Need this priced this week, build phase next month.",
    helpSend: "Submit question",
    helpSending: "Sending...",
    helpSent: "Sent",
    close: "Close",
    summary: "Summary",
    nothingSelected: "Nothing selected yet",
    qty: "Qty",
    total: "Total",
    totalDueToday: "Total due today",
    deposit: "Deposit due today (70%)",
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
    generateInvoice: "Continue to payment",
    submitForReview: "Submit for review",
    uploadAfterPaymentNote: "You will upload the project photo after payment.",
    reviewSubmitted: "Request submitted. We will review the scope and follow up with pricing.",
    generating: "Generating...",
    termsLine:
      "Stripe checkout should include Terms of Service consent and the Terms & Rules link.",
    fillRequired:
      "Add your name/company, email, phone number, project/client label, project details, confirm this is one client/project, and select at least one service.",
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
    designPackageSection: "Yard design package",
    designPackageSectionDesc:
      "Best if you want us to handle the landscape concept without choosing technical production pieces.",
    startSection: "3D / rendering support",
    startSectionDesc:
      "For designers and builders who know whether we should build a base model, work from uploaded documents, or render an existing 3D model.",
    ideaSection: "Design input",
    ideaSectionDesc:
      "Choose only one: you bring the layout idea, or we help develop the design direction.",
    afterLayout: "After layout",
    afterLayoutDesc:
      "At this point the layout is approved and treated as locked. From here you can order detailed plans and follow-up sheets.",
    buildSection: "Choose outdoor structure",
    buildSectionDesc:
      "You can combine a deck, pergola / cover, and outdoor kitchen when they belong to the same build. Choose only one size per structure type. Carports are handled as a separate structure package.",
    supportSection: "Site visit and rush timing",
    supportSectionDesc:
      "Add a local site visit if field measurements are needed. If the site is outside city limits, extra travel time may be added to the final invoice at $70/hour. Rush turnaround may be available when the schedule allows.",
    quickSection: "Quick Photo Concept",
    quickSectionDesc:
      "One fast paid visual to help close the sale.",
    specialSection: "Plans & Sheets",
    specialSectionDesc:
      "Use these when the layout already exists and you need a specific clean plan or sheet.",
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
    successTitle: "Project intake",
    successText:
      "Upload photos, survey files, and the full scope after checkout or manual approval.",
    uploadPhotos: "Project photos",
    uploadSurvey: "Survey / PDFs",
    detailedBrief: "Detailed scope",
    detailedBriefPlaceholder:
      "Add the full project brief here. This is the right place for the long version.",
    saveIntake: "Save intake",
    intakeSaved: "Intake saved",
    openProjectChat: "Open project chat",
    successNote:
      "Use project chat for quick text and photo follow-up after payment or manual approval.",
    verifyingPayment: "Checking order status...",
    previewMode:
      "Preview mode: checkout is not connected. No real payment was made. This screen is only for testing the intake form.",
    uploadWidgetNote:
      "Replace these file fields with Uploadcare or Cloudinary widget when backend is connected.",
    showcaseBadge: "Try it on a real job",
    showcaseTitle: "White-label support for outdoor pros.",
    showcaseDesc:
      "SiteForm Studio helps builders, landscape companies, and designers turn rough site info into concepts, simple plan sheets, and presentation visuals — under your brand.",
    showcaseStep1: "Quick photo concepts",
    showcaseStep2: "Drafting + 3D support",
    showcaseStep3: "HOA, takeoffs, planting, hardscape, lighting",
    showcaseCta: "Our services",
    showcaseBrowse: "",
    followTitle: "Follow / contact",
    socialInstagram: "Instagram",
    socialFacebook: "Facebook",
    socialTikTok: "TikTok",
    socialYouTube: "YouTube",
    socialEmail: "Email",
    showcaseNote: "",
  },
  es: {
    header: "Scope Builder",
    subheader: "Dibujo y visuales white-label para profesionales de exterior",
    selectPath: "¿En qué necesitas ayuda?",
    selectPathHelp:
      "Empieza con la opción más cercana a tu proyecto. Después puedes agregar visitas, láminas extra o más detalle.",
    openThisGroup: "Abrir este grupo",
    back: "Volver a servicios",
    backHome: "Volver al inicio",
    propertySize: "Tamaño del área de diseño",
    projectInfo: "Contacto y detalles del proyecto",
    clientName: "Tu nombre / compañía",
    clientNamePlaceholder: "Nombre o compañía para contactar",
    clientEmail: "Tu email",
    clientEmailPlaceholder: "Email para este pedido",
    clientPhone: "Tu teléfono",
    clientPhonePlaceholder: "Teléfono o WhatsApp",
    projectAddress: "Etiqueta de proyecto / cliente",
    projectAddressPlaceholder: "Ejemplo: patio Garcia, deck Oak St, Proyecto 24-018 o dirección completa",
    projectLabelHelp:
      "Requerido. Usa nombre del cliente, calle, apodo del proyecto o número interno. Todo lo seleccionado en este pedido debe pertenecer a este mismo cliente/proyecto.",
    notes: "Detalles del proyecto",
    notesHelp:
      "Requerido. Agrega qué necesitas, qué elemento o área es, qué archivos/fotos tienes y cualquier nota de ubicación. La dirección completa es opcional en esta etapa.",
    partnerProfileTitle: "Perfil de partner / white-label",
    partnerProfileHelp:
      "Dinos cómo debe aparecer la información de tu compañía en PDFs y láminas white-label. Partners repetidos pueden pedir que usemos los datos ya guardados.",
    partnerProfileQuestion: "¿Es tu primer pedido con nosotros?",
    partnerProfileNew: "Sí, configurar mi información white-label",
    partnerProfileExisting: "No, usar mi información de compañía ya guardada",
    whiteLabelCompany: "Nombre de compañía para mostrar en entregables",
    whiteLabelCompanyPlaceholder: "Ejemplo: Martinez Decks & Outdoor Living",
    whiteLabelPhone: "Teléfono para mostrar en láminas",
    whiteLabelPhonePlaceholder: "Déjalo vacío si no quieres mostrar teléfono",
    whiteLabelEmail: "Email para mostrar en láminas",
    whiteLabelEmailPlaceholder: "Déjalo vacío si no quieres mostrar email",
    whiteLabelWebsite: "Website / usuario social",
    whiteLabelWebsitePlaceholder: "Website, Instagram, Facebook u otro contacto público",
    desiredDeliveryDate: "Fecha deseada de entrega (opcional)",
    desiredDeliveryDateHelp: "La entrega urgente todavía depende de nuestra agenda.",
    clientNameDisplay: "Mostrar nombre del cliente",
    showClientName: "Mostrar nombre del cliente",
    hideClientName: "No mostrar nombre del cliente",
    addressDisplay: "Mostrar proyecto / dirección",
    addressFull: "Dirección completa",
    addressStreet: "Solo calle",
    addressProject: "Solo nombre del proyecto",
    addressHide: "No mostrar dirección",
    logoOption: "Opción de logo",
    logoUpload: "Subir un logo nuevo con este pedido",
    logoOnFile: "Usar logo ya guardado",
    logoTextOnly: "Solo nombre de compañía, sin logo",
    brandingNotes: "Notas de branding",
    brandingNotesPlaceholder:
      "Ejemplo: Usar solo mi nombre de compañía. No mostrar mi teléfono. Mostrar solo la calle del cliente.",
    sameProjectConfirm: "Confirmo que todos los servicios seleccionados en este pedido son para el mismo cliente/proyecto.",
    sameProjectHelp:
      "Si tienes clientes, propiedades o trabajos no relacionados, manda pedidos separados.",
    oneProjectSummary:
      "Un pedido = un cliente/proyecto y una configuración white-label. Para diferentes clientes o propiedades, manda pedidos separados.",
    rememberPartnerInfo: "Recordar mi información de compañía en este dispositivo",
    rememberHelp:
      "Esto no es una cuenta. Solo guarda estos campos en este navegador.",
    notesPlaceholder:
      "Ejemplo: Patio trasero Addison. Necesito concepto rápido desde una foto. El cliente quiere una cubierta de patio. La dirección exacta se puede compartir después si hace falta.",
    quickHelp: "¿Necesitas ayuda para elegir?",
    quickHelpTitle: "¿Preguntas?",
    quickHelpText:
      "Manda los detalles del proyecto o tus preguntas. Deja tu email o teléfono y te respondemos si encaja con nuestro flujo de trabajo actual.",
    helpContact: "Email o teléfono",
    helpContactPlaceholder: "¿Cómo te podemos contactar?",
    helpQuestion: "Tu pregunta o dirección del proyecto",
    helpQuestionPlaceholder:
      "Cuéntanos qué necesitas, dónde está el proyecto y qué no está claro.",
    helpBudgetTimeline: "Presupuesto / calendario (opcional)",
    helpBudgetTimelinePlaceholder:
      "Ejemplo: Necesito precio esta semana, construcción el próximo mes.",
    helpSend: "Enviar pregunta",
    helpSending: "Enviando...",
    helpSent: "Enviado",
    close: "Cerrar",
    summary: "Resumen",
    nothingSelected: "Todavía no hay servicios seleccionados",
    qty: "Cant.",
    total: "Total",
    totalDueToday: "Total a pagar hoy",
    deposit: "Depósito a pagar hoy (70%)",
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
    generateInvoice: "Continuar al pago",
    submitForReview: "Enviar para revisión",
    uploadAfterPaymentNote: "Subirás la foto del proyecto después del pago.",
    reviewSubmitted: "Solicitud enviada. Revisaremos el alcance y responderemos con precio.",
    generating: "Generando...",
    termsLine:
      "El pago por Stripe debe incluir aceptación de los Términos de Servicio y enlace a Terms & Rules.",
    fillRequired:
      "Agrega tu nombre/compañía, email, teléfono, etiqueta de proyecto/cliente, detalles del proyecto, confirma que es un solo cliente/proyecto y elige al menos un servicio.",
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
    designPackageSection: "Paquete de diseño de patio",
    designPackageSectionDesc:
      "Ideal si quieres que manejemos el concepto de landscape sin elegir piezas técnicas de producción.",
    startSection: "Apoyo 3D / renders",
    startSectionDesc:
      "Para diseñadores y constructores que saben si debemos crear una base, trabajar con documentos enviados o renderizar un modelo 3D existente.",
    ideaSection: "Apoyo de diseño",
    ideaSectionDesc:
      "Elige solo una opción: tú traes la idea del layout o nosotros ayudamos a desarrollar la dirección de diseño.",
    afterLayout: "Después del layout",
    afterLayoutDesc:
      "En este punto el layout ya está aprobado y se trata como cerrado. Desde aquí puedes pedir planos detallados y láminas de seguimiento.",
    buildSection: "Elige estructura exterior",
    buildSectionDesc:
      "Puedes combinar deck, pérgola / cubierta y cocina exterior cuando pertenecen a la misma obra. Elige solo un tamaño por tipo de estructura. Los carports se manejan como paquete separado.",
    supportSection: "Visita al sitio y urgencia",
    supportSectionDesc:
      "Agrega una visita local si se necesitan medidas de campo. Si el sitio está fuera de los límites de la ciudad, el tiempo extra de traslado puede agregarse a la factura final a $70/hora. La entrega urgente puede estar disponible según agenda.",
    quickSection: "Concepto rápido desde foto",
    quickSectionDesc:
      "Una visual pagada rápida para ayudar a cerrar la venta.",
    specialSection: "Planos y láminas",
    specialSectionDesc:
      "Úsalo cuando el layout ya existe y necesitas un plano o una lámina limpia específica.",
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
    hardDependencySiteVisit: "Elige primero Visita al sitio.",
    hardDependencyOutsideCity: "Primero agrega Visita al sitio.",
    successTitle: "Formulario del proyecto",
    successText:
      "Sube fotos, survey o levantamiento, y el alcance completo después del pago o revisión manual.",
    uploadPhotos: "Fotos del proyecto",
    uploadSurvey: "Survey / levantamiento / PDFs",
    detailedBrief: "Alcance detallado",
    detailedBriefPlaceholder:
      "Agrega aquí la versión larga del proyecto. Este es el lugar correcto para el detalle completo.",
    saveIntake: "Guardar intake",
    intakeSaved: "Intake guardado",
    openProjectChat: "Abrir chat del proyecto",
    successNote:
      "Usa el chat del proyecto para textos rápidos y seguimiento con fotos después del pago o revisión manual.",
    verifyingPayment: "Verificando el estado del pedido...",
    previewMode:
      "Modo de vista previa: el checkout no está conectado. No se hizo ningún pago real. Esta pantalla es solo para probar el formulario.",
    uploadWidgetNote:
      "Sustituye estos campos por un widget de Uploadcare o Cloudinary cuando conectes el backend.",
    showcaseBadge: "Pruébalo en un trabajo real",
    showcaseTitle: "Apoyo white-label para profesionales de exterior.",
    showcaseDesc:
      "SiteForm Studio ayuda a constructores, compañías de landscape y diseñadores a convertir información básica del sitio en visuales claras, planos simples y apoyo de presentación — bajo tu marca y detrás de escena.",
    showcaseStep1: "Conceptos rápidos desde foto",
    showcaseStep2: "Dibujo + apoyo 3D",
    showcaseStep3: "HOA, cómputos, plantación, hardscape, iluminación",
    showcaseCta: "Nuestros servicios",
    showcaseBrowse: "",
    showcaseNote: "Empieza con un concepto rápido o elige el servicio que encaja con el trabajo.",
  },
} as const;

const SIZES: Size[] = [
  { id: "small", label: "Small", sublabel: "compact area / one zone", visual: "🏠" },
  { id: "medium", label: "Medium", sublabel: "typical yard area", visual: "🏡" },
  { id: "large", label: "Large", sublabel: "large area / multiple zones", visual: "🌿" },
  { id: "estate", label: "Estate", sublabel: "estate / complex", visual: "🌳" },
];

const ENTRY_PATHS: EntryPath[] = [
  {
    id: "quick-sale",
    title: "Quick Photo Concept",
    titleEs: "Concepto rápido desde foto",
    description: "One fast concept image from a site photo.",
    descriptionEs:
      "Una imagen conceptual rápida a partir de una foto del sitio.",
    helper: "Best when you need one visual to help the client understand the idea and move forward.",
    helperEs:
      "Ideal cuando necesitas una visual para que el cliente entienda la idea y avance.",
    cta: "Start photo concept",
    ctaEs: "Empezar concepto desde foto",
  },
  {
    id: "build-one",
    title: "Decks, Covers & Outdoor Structures",
    titleEs: "Decks, cubiertas y estructuras exteriores",
    description:
      "Decks, pergolas, patio covers, carports, outdoor kitchens, and custom built features.",
    descriptionEs:
      "Decks, pérgolas, cubiertas, carports, cocinas exteriores y elementos construidos especiales.",
    helper: "Best when the project is one clear structure, not a full yard design.",
    helperEs:
      "Ideal cuando el proyecto es una estructura clara, no un diseño completo del patio.",
    cta: "Choose structure",
    ctaEs: "Elegir estructura",
  },
  {
    id: "full-design",
    title: "Yard Design Package",
    titleEs: "Paquete de diseño de patio",
    description:
      "Planting, layout, and simple design direction for one project area.",
    descriptionEs:
      "Plantación, layout y dirección sencilla de diseño para un área del proyecto.",
    helper:
      "Best when the yard area needs design thinking, not a separate deck, cover, or kitchen package.",
    helperEs:
      "Ideal cuando el área del patio necesita diseño, no un paquete separado de deck, cubierta o cocina.",
    cta: "Build yard package",
    ctaEs: "Armar paquete de patio",
  },
  {
    id: "3d-rendering",
    title: "3D & Rendering Support",
    titleEs: "Apoyo 3D y renders",
    description:
      "Base models, SketchUp cleanup, and render support for designers and builders.",
    descriptionEs:
      "Modelos base, limpieza de SketchUp y apoyo de renders para diseñadores y builders.",
    helper:
      "Best when your team understands models, render files, or professional production workflow.",
    helperEs:
      "Ideal cuando tu equipo entiende modelos, archivos de render o workflow profesional de producción.",
    cta: "Choose 3D support",
    ctaEs: "Elegir apoyo 3D",
  },
  {
    id: "special-drawings",
    title: "Plans & Sheets",
    titleEs: "Planos y láminas",
    description:
      "Planting plans, hardscape sheets, HOA sheets, takeoffs, lighting, and other follow-up documents.",
    descriptionEs:
      "Planos de plantación, láminas de hardscape, HOA, cómputos, iluminación y otros documentos de seguimiento.",
    helper:
      "Best when the layout already exists and you need one clean deliverable.",
    helperEs:
      "Ideal cuando el layout ya existe y necesitas una entrega limpia.",
    cta: "Choose plan type",
    ctaEs: "Elegir tipo de plano",
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
    title: "Site Visit + Base Plan + 3D Model",
    category: "Start",
    icon: Map,
    pricingType: "size",
    prices: { small: 300, medium: 400, large: 550, estate: null },
    stripePriceId: null,
    short:
      "We visit the site and build a basic 2D base plan and 3D existing-conditions model, with no design added yet.",
    bestFor:
      "Professional workflows where field measuring is needed before design, rendering, or follow-up sheets.",
    youSend: "Site address or meeting location, access details, and anything already known about the property.",
    youGet:
      "Local site visit, field photos/notes, a base 2D plan, and a 3D existing-conditions model.",
    notIncluded:
      "Design layout, planting plan, rendering package, engineering, or travel outside city limits.",
    helper: "Choose this OR remote base/model OR existing 3D model. It is one starting point, not an add-on.",
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
    helper: "Choose this OR site visit base/model OR existing 3D model. It is one starting point, not an add-on.",
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
      "Choose this OR site visit base/model OR remote base/model. Extra cleanup hours may be discussed and billed only after approval.",
  },
  {
    id: "photo-concept-start",
    title: "One Quick Photo Concept",
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
    bestFor: "Decks under 200 sq.ft that need a clean visual and plan package.",
    youSend:
      "Site plan, preferred location, dimensions, photos, and reference ideas if any.",
    youGet:
      "Deck layout, AutoCAD plans, and 3D visuals. HOA-ready plan set by default.",
    notIncluded:
      "Site visit, structural engineering, stamped drawings, or permit filing by us.",
    helper:
      "This package is without site visit. Add Site Visit if field measuring is needed.",
    sampleLabel: "See sample",
  },
  {
    id: "deck-large",
    title: "Large Deck Package over 200 sq.ft — Custom Quote",
    category: "Build",
    icon: ShieldCheck,
    pricingType: "quote",
    stripePriceId: null,
    short:
      "Concept layout, plan support, and 3D visuals for a larger deck before engineering or permit work.",
    bestFor:
      "Decks over 200 sq.ft, elevated decks, multi-level decks, or deck scopes that need review before pricing.",
    youSend:
      "Survey, dimensions, preferred layout, photos, and any requirements you already have.",
    youGet:
      "Deck visuals and plans prepared for client, HOA, or engineer review.",
    notIncluded:
      "Site visit, structural engineering, stamped permit drawings, permit fees, or permit filing by us.",
    helper:
      "Custom quote. Add Site Visit if field measuring is needed.",
    sampleLabel: "See sample",
  },
  {
    id: "pergola-small",
    title: "Small Pergola / Patio Cover under 200 sq.ft",
    category: "Build",
    icon: Box,
    pricingType: "flat",
    flatPrice: 1000,
    stripePriceId: "price_pergolasmall_1000",
    short: "Layout, AutoCAD plan set, and 3D visuals for a small pergola or simple patio cover.",
    bestFor: "Pergolas, patio covers, or shade structures under 200 sq.ft.",
    youSend:
      "Site plan, preferred location, dimensions, roof or shade preference, photos, and reference ideas if any.",
    youGet:
      "Pergola or patio cover layout, AutoCAD plans, and 3D visuals. HOA-ready plan set by default.",
    notIncluded:
      "Site visit, structural engineering, stamped drawings, roof tie-in details, or permit filing by us.",
    helper:
      "This package is without site visit. Add Site Visit if field measuring is needed.",
    sampleLabel: "See sample",
  },
  {
    id: "shade-large",
    title: "Large Pergola / Patio Cover over 200 sq.ft — Custom Quote",
    category: "Build",
    icon: ShieldCheck,
    pricingType: "quote",
    stripePriceId: null,
    short:
      "Concept layout, plan support, and 3D visuals for a larger shade or roofed outdoor structure.",
    bestFor:
      "Pergolas, patio covers, attached covers, or larger shade structures over 200 sq.ft that need review before pricing.",
    youSend:
      "Survey, dimensions, photos, roof or cover preferences, attachment notes, and reference images if you have them.",
    youGet:
      "Shade-structure visuals and plans prepared for client, HOA, or engineer review.",
    notIncluded:
      "Site visit, structural engineering, stamped permit drawings, roof tie-in details, permit fees, or permit filing by us.",
    helper:
      "Custom quote. Add Site Visit if field measuring is needed.",
    sampleLabel: "See sample",
  },
  {
    id: "carport-small",
    title: "Small Carport under 200 sq.ft — Review First",
    category: "Build",
    icon: ShieldCheck,
    pricingType: "quote",
    stripePriceId: null,
    short:
      "Concept layout, plan support, and 3D visuals for a small covered parking structure.",
    bestFor:
      "Carports under 200 sq.ft that need a clear concept before engineering or permit work.",
    youSend:
      "Site plan, dimensions, clearance notes, parking needs, photos, and reference images if you have them.",
    youGet:
      "A conceptual carport layout with plan support and 3D visuals for review.",
    notIncluded:
      "Site visit, structural engineering, stamped permit drawings, utility coordination, or permit filing by us.",
    helper:
      "Review first. Add Site Visit if field measuring is needed.",
    sampleLabel: "See sample",
  },
  {
    id: "carport-large",
    title: "Large Carport over 200 sq.ft — Custom Quote",
    category: "Build",
    icon: ShieldCheck,
    pricingType: "quote",
    stripePriceId: null,
    short:
      "Concept layout, plan support, and 3D visuals for a larger covered parking structure.",
    bestFor:
      "Carports over 200 sq.ft, multi-car covers, attached carports, or scopes that need review before pricing.",
    youSend:
      "Site plan, dimensions, clearance notes, parking needs, photos, and reference images if you have them.",
    youGet:
      "Carport visuals and plans prepared for client, HOA, or engineer review.",
    notIncluded:
      "Site visit, structural engineering, stamped permit drawings, utility coordination, permit fees, or permit filing by us.",
    helper:
      "Custom quote. Add Site Visit if field measuring is needed.",
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
    id: "custom-feature",
    title: "Misc Custom Outdoor Feature — Review First",
    category: "Build",
    icon: Sparkles,
    pricingType: "quote",
    stripePriceId: null,
    short:
      "Use this for an unusual outdoor element that does not fit the standard deck, shade, carport, or kitchen packages.",
    bestFor:
      "Ponds, special planters, swings, small custom shades, decorative screens, low decorative dividers under 3 ft, or other one-off features that need review before pricing.",
    youSend:
      "Photos, a short description, rough size, location, and reference links or inspiration images.",
    youGet:
      "A manual review and feedback on whether we can help, what package fits, and what the likely next step or price range should be.",
    notIncluded:
      "Retaining walls, slope support, engineering, code research, permit filing, fabrication details, or final construction documents.",
    helper:
      "Choose this when the feature is unusual. Retaining walls and real slope-support walls belong in a separate design/review process, not here.",
  },
];

const FULL_YARD_PACKAGE_SERVICES: Service[] = [
  {
    id: "yard-design-package",
    title: "Yard Design Package",
    category: "Design",
    icon: Sparkles,
    pricingType: "size",
    prices: { small: 1000, medium: 1500, large: 2200, estate: null },
    stripePriceId: null,
    short:
      "Planting, layout, and simple design direction for the selected yard area.",
    bestFor:
      "Builders or landscape crews who need a clear landscape design under their brand, without dealing with 3D/model workflow details.",
    youSend:
      "Photos, rough measurements or survey if available, budget level, style references, client must-haves, and any site constraints.",
    youGet:
      "A concept layout for the selected area, planting direction, general material direction, simple dimensions where needed, and a client-ready PDF.",
    notIncluded:
      "Separate outdoor structures such as decks, pergolas, carports, outdoor kitchens, structural engineering, irrigation design, lighting plan, permit-ready drawings, or stamped documents.",
    helper:
      "If the design includes a deck, pergola, carport, outdoor kitchen, or other built structure, order that separately under Decks, Covers & Outdoor Structures. Add Site Visit below if field measuring is needed.",
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
    helper:
      "If the site is outside city limits, extra travel time may be added to the final invoice at $70/hour after we review the address.",
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
  ...FULL_YARD_PACKAGE_SERVICES,
  ...DESIGN_DIRECTION_SERVICES,
  ...NEXT_PHASE_SERVICES,
  ...CITY_SERVICES,
  ...IRRIGATION_SERVICES,
  ...SUPPORT_SERVICES,
];

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

const PARTNER_STORAGE_KEY = "scopebuilder_partner_profile_v1";

function emptyContact(): OrderContact {
  return {
    clientName: "",
    customerEmail: "",
    customerPhone: "",
    projectAddress: "",
    notes: "",
    partnerProfileMode: "new",
    whiteLabelCompany: "",
    whiteLabelPhone: "",
    whiteLabelEmail: "",
    whiteLabelWebsite: "",
    desiredDeliveryDate: "",
    clientNameDisplay: "show",
    addressDisplay: "street",
    logoOption: "upload",
    brandingNotes: "",
    sameProjectConfirmed: false,
    rememberPartnerInfo: false,
  };
}

function getInitialContact(): OrderContact {
  const base = emptyContact();
  if (typeof window === "undefined") return base;
  try {
    const raw = window.localStorage.getItem(PARTNER_STORAGE_KEY);
    if (!raw) return base;
    const saved = JSON.parse(raw) as Partial<OrderContact>;
    return {
      ...base,
      ...saved,
      projectAddress: "",
      notes: "",
      desiredDeliveryDate: "",
      sameProjectConfirmed: false,
      partnerProfileMode: "existing",
      logoOption: saved.logoOption ?? "on-file",
      rememberPartnerInfo: true,
    };
  } catch {
    return base;
  }
}

function savePartnerInfo(contact: OrderContact) {
  if (typeof window === "undefined") return;
  const saved: Partial<OrderContact> = {
    clientName: contact.clientName,
    customerEmail: contact.customerEmail,
    customerPhone: contact.customerPhone,
    whiteLabelCompany: contact.whiteLabelCompany,
    whiteLabelPhone: contact.whiteLabelPhone,
    whiteLabelEmail: contact.whiteLabelEmail,
    whiteLabelWebsite: contact.whiteLabelWebsite,
    clientNameDisplay: contact.clientNameDisplay,
    addressDisplay: contact.addressDisplay,
    logoOption: contact.logoOption,
    brandingNotes: contact.brandingNotes,
  };
  window.localStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(saved));
}

function buildWhiteLabelPayload(contact: OrderContact) {
  return {
    profile_mode: contact.partnerProfileMode,
    company_name: sanitizeText(contact.whiteLabelCompany || contact.clientName),
    phone_on_sheets: sanitizeText(contact.whiteLabelPhone),
    email_on_sheets: sanitizeText(contact.whiteLabelEmail),
    website_or_social: sanitizeText(contact.whiteLabelWebsite),
    desired_delivery_date: sanitizeText(contact.desiredDeliveryDate),
    client_name_display: contact.clientNameDisplay,
    address_display: contact.addressDisplay,
    logo_option: contact.logoOption,
    branding_notes: sanitizeText(contact.brandingNotes),
    same_client_project_confirmed: contact.sameProjectConfirmed,
    remembered_on_device: contact.rememberPartnerInfo,
  };
}

type ServiceCopyField =
  | "title"
  | "category"
  | "short"
  | "bestFor"
  | "youSend"
  | "youGet"
  | "notIncluded"
  | "helper"
  | "sampleLabel"
  | "badgeLabel"
  | "quantityLabel";

const SERVICE_ES: Record<string, Partial<Record<ServiceCopyField, string>>> = {
  "site-visit-start": {
    title: "Visita al sitio",
    category: "Inicio",
    short: "Visita local básica para traslado, tiempo en el sitio y preparación de mediciones.",
    bestFor: "Trabajos locales que todavía no tienen medidas útiles suficientes.",
    youSend: "Dirección del sitio, detalles de acceso y cualquier información que ya tengas sobre la propiedad.",
    youGet: "Tiempo de visita, medidas en bruto, fotos y notas de campo.",
    notIncluded: "Plano base, modelo 3D, trabajo de diseño o traslado fuera de los límites de la ciudad.",
    helper: "Elige esto junto con Plano base + modelo 3D si quieres que construyamos el modelo de condiciones existentes a partir de la visita.",
  },
  "onsite-base-model": {
    title: "Visita al sitio + plano base + modelo 3D",
    category: "Inicio",
    short: "Visitamos el sitio y construimos un plano base 2D y un modelo 3D básico de condiciones existentes, sin agregar diseño todavía.",
    bestFor: "Flujos profesionales donde se necesitan mediciones en campo antes del diseño, render o láminas de seguimiento.",
    youSend: "Dirección o punto de reunión, detalles de acceso y cualquier información ya conocida sobre la propiedad.",
    youGet: "Visita local, fotos/notas de campo, plano base 2D y modelo 3D de condiciones existentes.",
    notIncluded: "Diseño de layout, planting plan, paquete de renders, ingeniería o traslado fuera de los límites de la ciudad.",
    helper: "Elige esto O base remota/modelo O modelo 3D existente. Es un punto de inicio, no un add-on.",
  },
  "survey-documents-start": {
    title: "Plano base + modelo 3D remoto",
    category: "Inicio",
    short: "Sin visita al sitio. Tú mandas survey, fotos, PDFs, sketches o medidas, y construimos el plano base 2D y el modelo 3D.",
    bestFor: "Trabajos fuera de la ciudad o trabajos donde ya existe suficiente información.",
    youSend: "Survey, fotos, PDFs, redlines, dimensiones o incluso un sketch hecho a mano.",
    youGet: "Un plano base 2D y un modelo 3D de condiciones existentes construido desde tus documentos.",
    notIncluded: "Visita al sitio, survey legal, ingeniería, permisos o diseño final.",
    helper: "Elige esto O visita/base/modelo O modelo 3D existente. Es un punto de inicio, no un add-on.",
  },
  "client-model-start": {
    title: "Tú mandas el modelo 3D, nosotros lo renderizamos",
    category: "Inicio",
    short: "Tú mandas un modelo ya construido; lo revisamos, lo preparamos para render y lo usamos para las visuales.",
    bestFor: "Trabajos donde el modelo ya existe y principalmente necesita preparación de render, materiales y presentación.",
    youSend: "Un modelo 3D listo para render, links o referencias JPG de materiales, notas y cualquier survey o PDF que ayude a revisarlo.",
    youGet: "Revisión del modelo, setup de render, aplicación de materiales desde tus referencias y vistas renderizadas. Cuando el modelo esté listo, se pueden probar materiales sin un límite fijo.",
    notIncluded: "Limpieza pesada del modelo, reconstrucción de geometría faltante, creación de materiales desde cero o diseño que no exista ya en el modelo.",
    helper: "Elige esto O visita/base/modelo O base remota/modelo. Cualquier hora extra de limpieza se conversa y se cobra solo con aprobación.",
  },
  "photo-concept-start": {
    title: "Una imagen conceptual rápida",
    category: "Inicio",
    short: "Imagen conceptual rápida pagada para ayudar a cerrar la venta.",
    bestFor: "Ventas rápidas antes de empezar un diseño completo.",
    youSend: "Una foto del sitio después del pago, medidas aproximadas si las tienes y un texto corto sobre lo que quieres mostrar.",
    youGet: "Una imagen conceptual y una lista corta de materiales sugeridos o elementos principales usados en el concepto.",
    notIncluded: "Visita al sitio, modelo exacto del sitio, planos listos para construcción, ingeniería, permisos o documentación final de diseño.",
    sampleLabel: "Ver ejemplo",
    badgeLabel: "Más pedido",
  },
  "deck-small": {
    title: "Paquete de deck pequeño, menos de 200 pies²",
    category: "Construcción",
    short: "Layout, set de planos en AutoCAD y visuales 3D para un deck pequeño.",
    bestFor: "Decks de menos de 200 pies² que necesitan un paquete visual y de planos limpio.",
    youSend: "Site plan, ubicación preferida, dimensiones e ideas de referencia si las tienes.",
    youGet: "Layout del deck, planos en AutoCAD y visuales 3D. Set listo para HOA por defecto.",
    notIncluded: "Visita al sitio, ingeniería estructural, planos sellados o trámite de permisos por nuestra parte.",
    helper: "Este paquete no incluye visita al sitio. Agrega Visita al sitio si se necesitan mediciones en campo.",
    sampleLabel: "Ver ejemplo",
  },
  "pergola-small": {
    title: "Paquete de pérgola / cubierta pequeña, menos de 200 pies²",
    category: "Construcción",
    short: "Layout, set de planos en AutoCAD y visuales 3D para una pérgola pequeña o cubierta sencilla.",
    bestFor: "Pérgolas, patio covers o estructuras de sombra de menos de 200 pies².",
    youSend: "Site plan, ubicación preferida, dimensiones, preferencia de techo o sombra, fotos e ideas de referencia si las tienes.",
    youGet: "Layout de pérgola o cubierta, planos en AutoCAD y visuales 3D. Set listo para HOA por defecto.",
    notIncluded: "Visita al sitio, ingeniería estructural, planos sellados, detalles de conexión de techo o trámite de permisos por nuestra parte.",
    helper: "Este paquete no incluye visita al sitio. Agrega Visita al sitio si se necesitan mediciones en campo.",
    sampleLabel: "Ver ejemplo",
  },
  "carport-small": {
    title: "Carport pequeño, menos de 200 pies² — revisar primero",
    category: "Construcción",
    short: "Layout conceptual, apoyo de planos y visuales 3D para una estructura pequeña de estacionamiento cubierto.",
    bestFor: "Carports de menos de 200 pies² que necesitan un concepto claro antes de ingeniería o permisos.",
    youSend: "Site plan, dimensiones, notas de altura libre, necesidades de estacionamiento, fotos e imágenes de referencia si las tienes.",
    youGet: "Un layout conceptual de carport con apoyo de planos y visuales 3D para revisión.",
    notIncluded: "Visita al sitio, ingeniería estructural, planos sellados para permiso, coordinación de utilities o trámite de permisos por nuestra parte.",
    helper: "Revisar primero. Agrega Visita al sitio si se necesitan mediciones en campo.",
    sampleLabel: "Ver ejemplo",
  },
  "carport-large": {
    title: "Carport grande, más de 200 pies² — cotización",
    category: "Construcción",
    short: "Layout conceptual, apoyo de planos y visuales 3D para una estructura grande de estacionamiento cubierto.",
    bestFor: "Carports de más de 200 pies², cubiertas para varios autos, carports adjuntos o alcances que necesitan revisión antes de precio.",
    youSend: "Site plan, dimensiones, notas de altura libre, necesidades de estacionamiento, fotos e imágenes de referencia si las tienes.",
    youGet: "Visuales y planos de carport preparados para revisión del cliente, HOA o ingeniero.",
    notIncluded: "Visita al sitio, ingeniería estructural, planos sellados para permiso, coordinación de utilities, fees de permisos o trámite de permisos por nuestra parte.",
    helper: "Cotización personalizada. Agrega Visita al sitio si se necesitan mediciones en campo.",
    sampleLabel: "Ver ejemplo",
  },
  "deck-large": {
    title: "Paquete de deck grande, más de 200 pies² — cotización",
    category: "Construcción",
    short: "Layout conceptual, apoyo de planos y visuales 3D para un deck grande antes de ingeniería o permisos.",
    bestFor: "Decks de más de 200 pies², decks elevados o alcances que necesitan revisión antes de precio.",
    youSend: "Survey, dimensiones, layout preferido, fotos y cualquier requisito que ya tengas.",
    youGet: "Visuales y planos del deck preparados para revisión del cliente, HOA o ingeniero.",
    notIncluded: "Visita al sitio, ingeniería estructural, planos sellados para permiso, fees de permisos o trámite de permisos por nuestra parte.",
    helper: "Cotización personalizada. Agrega Visita al sitio si se necesitan mediciones en campo.",
    sampleLabel: "Ver ejemplo",
  },
  "shade-large": {
    title: "Paquete de pérgola / cubierta grande, más de 200 pies² — cotización",
    category: "Construcción",
    short: "Layout conceptual, apoyo de planos y visuales 3D para una estructura grande de sombra o cubierta exterior.",
    bestFor: "Pérgolas, patio covers, cubiertas adjuntas o estructuras de sombra de más de 200 pies² que necesitan revisión antes de precio.",
    youSend: "Survey, dimensiones, fotos, preferencias de techo o cubierta, notas de conexión a la casa e imágenes de referencia si las tienes.",
    youGet: "Visuales y planos de la estructura de sombra preparados para revisión del cliente, HOA o ingeniero.",
    notIncluded: "Visita al sitio, ingeniería estructural, planos sellados para permiso, detalles de conexión de techo, fees de permisos o trámite de permisos por nuestra parte.",
    helper: "Cotización personalizada. Agrega Visita al sitio si se necesitan mediciones en campo.",
    sampleLabel: "Ver ejemplo",
  },
  "outdoor-kitchen": {
    title: "Paquete de cocina exterior",
    category: "Construcción",
    short: "Layout conceptual, apoyo de plano en AutoCAD, zonas de appliances, clearances y visuales 3D.",
    bestFor: "Cuando necesitas un paquete conceptual limpio antes del trabajo detallado de utilities o shop drawings.",
    youSend: "Site plan, lista general de deseos, notas de appliances preferidos y límites de tamaño.",
    youGet: "Un layout conceptual de cocina exterior con apoyo de plano y visuales 3D.",
    notIncluded: "Visita al sitio, diseño de utilities, documentos de permiso, paquete de especificaciones de appliances o planos de construcción.",
    helper: "Este paquete no incluye visita al sitio. Agrega Visita al sitio si se necesitan mediciones en campo.",
    sampleLabel: "Ver ejemplo",
  },
  "custom-feature": {
    title: "Pieza exterior personalizada — revisar primero",
    category: "Construcción",
    short: "Usa esto para un elemento exterior inusual que no encaja en los paquetes estándar de deck, sombra, carport o cocina.",
    bestFor: "Ponds, maceteros especiales, columpios, sombras pequeñas personalizadas, pantallas decorativas, divisores bajos decorativos de menos de 3 pies u otros elementos únicos que necesitan revisión antes de precio.",
    youSend: "Fotos, descripción corta, tamaño aproximado, ubicación y links de referencia o imágenes de inspiración.",
    youGet: "Una revisión manual y feedback sobre si podemos ayudar, qué paquete encaja y cuál sería el siguiente paso o rango de precio probable.",
    notIncluded: "Muros de contención, soporte de pendientes, ingeniería, investigación de código, trámites de permiso, detalles de fabricación o planos finales de construcción.",
    helper: "Elige esto cuando el feature es inusual. Los muros de contención y muros reales de soporte de pendiente pertenecen a un proceso separado de diseño/revisión, no aquí.",
  },
  "full-yard-concept-site": {
    title: "Concepto de landscape para todo el patio — con visita",
    category: "Paquete",
    short: "Paquete inicial sencillo cuando quieres que revisemos el sitio, entendamos el patio y propongamos un concepto de landscape.",
    bestFor: "Constructores, compañías de landscape o clientes que no quieren elegir piezas técnicas como modelo base, dirección de layout y setup de render.",
    youSend: "Nombre o dirección del proyecto, fotos si las tienes, must-haves, referencias de estilo, nivel aproximado de presupuesto y restricciones de HOA o del sitio.",
    youGet: "Revisión manual del alcance, recomendación del camino de diseño, dirección conceptual basada en visita y una cotización personalizada para el paquete correcto.",
    notIncluded: "Ingeniería, trámite de permisos, planos sellados, documentos finales de construcción o rondas ilimitadas de rediseño.",
    helper: "Elige esto si quieres un camino de diseño completo y no quieres armar tú el flujo técnico.",
  },
  "full-yard-concept-remote": {
    title: "Concepto de landscape para todo el patio — desde archivos",
    category: "Paquete",
    short: "Paquete inicial sencillo cuando tienes fotos, survey, sketches o notas y quieres que propongamos el concepto remotamente.",
    bestFor: "Trabajos fuera de la ciudad o equipos que pueden mandar suficiente información del sitio sin visita.",
    youSend: "Fotos, survey o site plan si existe, medidas aproximadas, wish list, referencias de estilo y restricciones del proyecto.",
    youGet: "Revisión manual del alcance, recomendación del camino de diseño, dirección conceptual remota y una cotización personalizada para el paquete correcto.",
    notIncluded: "Visita al sitio, survey legal, ingeniería, trámite de permisos, planos sellados o documentos finales de construcción.",
    helper: "Elige esto si quieres un camino de diseño completo, pero prefieres empezar desde información enviada.",
  },
  "draw-your-idea": {
    title: "Tú traes la idea, nosotros la dibujamos",
    category: "Idea",
    short: "Tú decides dónde van los elementos, niveles, features, decor y transiciones; nosotros lo convertimos en un modelo listo para render con layout cerrado.",
    bestFor: "Contratistas que ya entienden el layout y necesitan formalizarlo en un modelo limpio y un paquete de presentación.",
    youSend: "Tu idea de layout, markups, sketches, imágenes de referencia, dimensiones, links de materiales y fotos que muestren los elementos que quieres en el modelo.",
    youGet: "Un modelo diseñado con layout cerrado, dirección de materiales aplicada y visuales de revisión listas para avanzar a render.",
    notIncluded: "Ingeniería, planos de permiso, láminas detalladas de producción o takeoffs, salvo que se agreguen después.",
    helper: "Apoya tus ideas con imágenes y links de materiales para que podamos modelar correctamente los elementos y texturas.",
  },
  "help-design-it": {
    title: "Te ayudamos a diseñarlo",
    category: "Idea",
    short: "Ayudamos a formar el brief de diseño, elegir referencias, probar opciones de sketch y mover el trabajo hacia una dirección final lista para render.",
    bestFor: "Contratistas que tienen el lead, pero no quieren resolver solos el proceso de diseño.",
    youSend: "Survey, medidas, fotos, referencias de estilo, must-haves, nivel aproximado de presupuesto y restricciones del sitio.",
    youGet: "Trabajo de brief, selección de referencias, opciones intermedias de sketch, desarrollo de diseño y dirección final lista para render.",
    notIncluded: "Ingeniería, paquete de permisos, planos sellados, planting plans, takeoffs o láminas detalladas de producción, salvo que se agreguen después.",
    helper: "Esto es desarrollo de diseño antes del render final, no solo dibujo de una idea fija.",
  },
  "master-plan": {
    title: "Master plan limpio 2D",
    category: "Después del layout",
    short: "Un master plan 2D limpio desde tus documentos o desde un layout que ya produjimos.",
    bestFor: "Cuando necesitas una lámina principal clara que la cuadrilla pueda leer.",
    youSend: "Si ya creamos el layout, no hacen falta archivos extra. Si no, manda tu plano aprobado, modelo, redlines o documentos fuente.",
    youGet: "Un master plan 2D limpio, listo para imprimir y mostrar a la cuadrilla.",
    notIncluded: "Nuevo diseño conceptual, ingeniería o aprobación de permisos.",
    helper: "Si los documentos fuente vienen de fuera de nuestro proceso y necesitan limpieza primero, puede hacer falta tiempo adicional o una cotización aparte.",
    sampleLabel: "Ver ejemplo",
  },
  "planting-plan": {
    title: "Plano de plantación + lista de plantas",
    category: "Después del layout",
    short: "Lámina técnica de plantación desde tus documentos o desde un layout que ya produjimos.",
    bestFor: "Cuando la plantación va a avanzar y la cuadrilla necesita una lámina limpia.",
    youSend: "Si ya construimos el layout, no hacen falta archivos base extra. Si no, manda el plano aprobado y la dirección o lista de plantas.",
    youGet: "Un plano de plantación con schedule y cantidades, listo para imprimir y mostrar a la cuadrilla.",
    notIncluded: "Búsqueda en viveros, diseño de irrigación o exploración de un nuevo layout.",
    helper: "Si los documentos base no fueron creados por nosotros y necesitan limpieza antes de documentar la plantación, puede hacer falta tiempo adicional o una cotización aparte.",
    sampleLabel: "Ver ejemplo",
  },
  "paving-plan": {
    title: "Plano de hardscape / patrón de pavimento",
    category: "Después del layout",
    short: "Una lámina limpia de hardscape que muestra layout de pavimento, zonas de materiales y lógica de patrón donde haga falta.",
    bestFor: "Cuando el hardscape ya está aprobado y ahora necesita una lámina dedicada de pavimento y materiales.",
    youSend: "Si ya construimos el layout, no hacen falta archivos base extra. Si no, manda el plano aprobado, materiales y notas de patrón de pavimento.",
    youGet: "Un plano de hardscape con layout, materiales, patrones de pavimento y dirección de tile o pavers donde haga falta.",
    notIncluded: "Ingeniería, diseño de base estructural, ingeniería de drenaje o detalles constructivos, salvo que se agreguen aparte.",
    sampleLabel: "Ver ejemplo",
  },
  "grading": {
    title: "Concepto de nivelación + drenaje",
    category: "Después del layout",
    short: "Concepto no ingenieril de nivelación y drenaje basado en topo o elevaciones medidas.",
    bestFor: "Cuando el sitio necesita pensar pendiente o drenaje después de aprobar el layout principal.",
    youSend: "Topographic survey o elevaciones medidas, diseño aprobado y alcance de mejoras. Si todavía no hay topo, pide una visita o trae datos medidos primero.",
    youGet: "Una lámina conceptual de nivelación y drenaje, lista para imprimir y discutir con la cuadrilla.",
    notIncluded: "Ingeniería civil, planos sellados de grading, cálculos de drenaje o grading hecho sin información útil de elevaciones.",
    helper: "No podemos adivinar pendientes. Este servicio necesita topo o elevaciones reales medidas.",
    sampleLabel: "Ver ejemplo",
  },
  "watering-strategy": {
    title: "Estrategia básica de riego",
    category: "Después del layout",
    short: "Estrategia sencilla no ingenieril de riego para las áreas de plantación aprobadas.",
    bestFor: "Cuando quieres entender zonas de sol, sombra y necesidades de agua de las plantas antes del trabajo detallado de irrigación.",
    youSend: "Plano aprobado, dirección de plantación y notas conocidas sobre sombra, sol o áreas difíciles.",
    youGet: "Notas de zonas de sol y sombra, lógica de riego por área y recomendaciones como drip u otro enfoque básico donde aplique.",
    notIncluded: "Dimensionamiento de tubería, layout de heads, specs de irrigación, diseño hidráulico o diagramas de instalación.",
    sampleLabel: "Ver ejemplo",
  },
  "lighting": {
    title: "Concepto de iluminación",
    category: "Después del layout",
    short: "Concepto 2D de iluminación. Si ya tenemos el modelo de diseño, las vistas nocturnas van como bonus.",
    bestFor: "Cuando el diseño aprobado necesita agregar una capa de iluminación.",
    youSend: "Si ya construimos el layout, no hacen falta archivos base extra. Si no, manda el plano aprobado, puntos focales y dirección de iluminación si la tienes.",
    youGet: "Un layout conceptual de iluminación, listo para imprimir y mostrar a la cuadrilla, más vistas nocturnas bonus cuando ya existe nuestro modelo.",
    notIncluded: "Diseño eléctrico, planos de cableado o planos de instalación.",
    sampleLabel: "Ver ejemplo",
  },
  "takeoff": {
    title: "Cantidades de materiales / take-off",
    category: "Después del layout",
    short: "Cantidades y dimensiones de materiales desde un diseño 3D o 2D aprobado.",
    bestFor: "Cuando el alcance está claro y estás listo para poner precio al trabajo.",
    youSend: "Plano o modelo aprobado si viene de tu lado. Si lo construimos nosotros, no hacen falta archivos extra.",
    youGet: "Cantidades y dimensiones basadas en el alcance aprobado, entregadas en Google Sheets. Dinos qué formato le funciona mejor a tu equipo.",
    notIncluded: "Compras, seguimiento con proveedores o verificación en campo.",
    sampleLabel: "Ver ejemplo",
  },
  "artistic-sheet": {
    title: "Lámina artística renderizada",
    category: "Después del layout",
    quantityLabel: "láminas",
    short: "Lámina artística de presentación desde un plano CAD, master plan o base de render.",
    bestFor: "Cuando ya tienes un plano o vista y quieres una lámina más bonita para presentar al cliente.",
    youSend: "Plano CAD, master plan o render base. También puedes mostrar el estilo que quieres, por ejemplo acuarela o ink sketch.",
    youGet: "Una lámina artística en alta resolución en el estilo elegido, como acuarela o ink sketch. El precio es por lámina, no por todo el proyecto.",
    notIncluded: "Revisiones de diseño o nuevo trabajo CAD.",
    helper: "Puede ser una lámina de master plan o un tratamiento artístico de vistas renderizadas.",
    sampleLabel: "Ver ejemplo",
  },
  "hoa-city": {
    title: "Lámina para HOA / ciudad",
    category: "Ciudad",
    short: "Lámina add-on de submittal desde un master plan aprobado y survey.",
    bestFor: "Trabajos que ya tienen un master plan limpio y ahora necesitan una lámina de submittal.",
    youSend: "Master plan aprobado, survey y cualquier checklist o nota que ya tengas.",
    youGet: "Una lámina de submittal de intención de diseño, lista para imprimir y mostrar si hace falta.",
    notIncluded: "Garantía de aprobación, ingeniería o survey legal.",
    sampleLabel: "Ver ejemplo",
  },
  "impervious": {
    title: "Cálculo de cobertura impermeable",
    category: "Ciudad",
    short: "Lámina de cálculo de cobertura impermeable en formato tipo ciudad, desde un master plan y survey.",
    bestFor: "Trabajos donde la jurisdicción revisa cuánta cobertura impermeable existe y cuánto se agrega.",
    youSend: "Survey, información de hardscape existente y master plan o mejoras aprobadas.",
    youGet: "Lámina de cobertura impermeable y resumen de cálculo.",
    notIncluded: "Certificación de ingeniería o garantía de aprobación.",
    sampleLabel: "Ver ejemplo",
  },
  "tree-overlay": {
    title: "Overlay de árboles / CRZ",
    category: "Ciudad",
    short: "Overlay add-on de árboles / CRZ basado en datos certificados de árboles y un master plan limpio.",
    bestFor: "Proyectos donde árboles protegidos deben mostrarse claramente para revisión.",
    youSend: "Survey certificado de árboles o inventario de árboles, más referencias de master plan aprobado.",
    youGet: "Una lámina de preservación de árboles o overlay de CRZ.",
    notIncluded: "Reporte de arborista o determinación legal de la jurisdicción.",
    sampleLabel: "Ver ejemplo",
  },
  "irrigation-drafting": {
    title: "Dibujo de irrigación desde tus markups",
    category: "Irrigación",
    quantityLabel: "láminas",
    short: "Solo drafting desde markups de irrigación o layout en papel.",
    bestFor: "Irrigadores licenciados que ya conocen el layout de irrigación y solo necesitan limpiarlo en pantalla.",
    youSend: "Markups de campo, sketches hechos a mano, redlines y cualquier archivo base.",
    youGet: "Láminas de irrigación limpias dibujadas en computadora, listas para imprimir y mostrar a la cuadrilla.",
    notIncluded: "Diseño de irrigación, ingeniería, cálculos hidráulicos o especificaciones de instalación.",
    sampleLabel: "Ver ejemplo",
  },
  "site-visit-addon": {
    title: "Visita al sitio",
    category: "Apoyo",
    short: "Visita local básica para traslado, tiempo en el sitio y preparación de mediciones.",
    bestFor: "Trabajos que necesitan medición en campo antes de estructuras o planos especiales.",
    youSend: "Dirección del sitio, detalles de acceso y qué hay que revisar.",
    youGet: "Tiempo de visita, medidas en bruto, fotos y notas de campo.",
    notIncluded: "Plano base, modelo 3D, trabajo de diseño o traslado fuera de los límites de la ciudad.",
    helper: "Si el sitio está fuera de los límites de la ciudad, el tiempo extra de traslado puede agregarse a la factura final a $70/hora después de revisar la dirección.",
  },
  "travel-outside-city": {
    title: "Traslado fuera de los límites de la ciudad",
    category: "Apoyo",
    quantityLabel: "horas",
    short: "Tiempo extra de traslado cuando el sitio está fuera de los límites de la ciudad.",
    bestFor: "Visitas fuera de la ciudad.",
    youSend: "Ubicación del trabajo y distancia estimada de traslado.",
    youGet: "Tiempo extra de traslado aprobado, cobrado por hora.",
    notIncluded: "La visita local al sitio en sí.",
    helper: "Usa esto solo junto con Visita al sitio.",
  },
  "revision-redesign": {
    title: "Tiempo adicional de revisión / rediseño",
    category: "Apoyo",
    short: "Se usa solo cuando el tiempo de revisión todavía es menor que empezar una nueva ronda de diseño.",
    bestFor: "Cambios después de aprobación que son demasiado grandes para una revisión normal, pero todavía menores que reiniciar todo.",
    youSend: "Notas claras de revisión y dirección actualizada.",
    youGet: "Conversación de rediseño con alcance definido y estimado por hora aprobado por escrito.",
    notIncluded: "Revisiones ilimitadas o rediseño escondido sin aprobación.",
    helper: "Si el redibujo se vuelve demasiado grande, normalmente conviene comprar un nuevo paquete de layout.",
  },
  "rush-fee": {
    title: "Cargo urgente",
    category: "Apoyo",
    short: "Cargo por entrega urgente agregado al trabajo con precio en el carrito.",
    bestFor: "Fechas apretadas que necesitan prioridad de agenda.",
    youSend: "Fecha requerida y expectativas de entrega.",
    youGet: "Prioridad de agenda cuando esté disponible.",
    notIncluded: "Garantía de aceptar fechas imposibles.",
  },
};

function translateServiceField(
  service: Service,
  field: ServiceCopyField,
  lang: Lang
): string | undefined {
  if (lang === "es") return SERVICE_ES[service.id]?.[field] ?? service[field];
  return service[field];
}

function translateServiceTitle(service: Service, lang: Lang) {
  return translateServiceField(service, "title", lang) ?? service.title;
}

function translateServiceCategory(service: Service, lang: Lang) {
  return translateServiceField(service, "category", lang) ?? service.category;
}

function translateSizeLabel(size: Size | undefined, lang: Lang) {
  if (!size) return "";
  if (lang === "es") {
    const labels: Record<string, string> = {
      small: "Pequeño",
      medium: "Mediano",
      large: "Grande",
      estate: "Estate",
    };
    return labels[size.id] ?? size.label;
  }
  return size.label;
}

function translateSizeSublabel(size: Size, lang: Lang) {
  if (lang === "es") {
    const sublabels: Record<string, string> = {
      small: "área compacta / una zona",
      medium: "área típica de patio",
      large: "área grande / varias zonas",
      estate: "estate / complejo",
    };
    return sublabels[size.id] ?? size.sublabel;
  }
  return size.sublabel;
}

function formatPrice(value: number | null | undefined, lang: Lang = "en") {
  if (value === null || value === undefined) return lang === "es" ? "Cotización" : "Quote";
  return `$${value.toLocaleString("en-US")}`;
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
          <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full bg-slate-900 px-3 py-1 text-xs font-black tracking-wide text-white shadow">
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

function InstagramIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.25" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M14.5 8.2V6.7c0-.7.5-1.1 1.2-1.1h1.7V2.8c-.8-.1-1.7-.2-2.5-.2-2.6 0-4.4 1.6-4.4 4.5v1.1H7.8v3.2h2.7v8h3.4v-8h2.8l.5-3.2h-3.3Z" />
    </svg>
  );
}

function TikTokIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M15.5 3c.4 2.6 1.9 4.2 4.5 4.4v3.2c-1.6.1-3.1-.4-4.4-1.2v5.8c0 3.2-2.2 5.6-5.5 5.6-3.1 0-5.4-2.1-5.4-5.1 0-3.2 2.5-5.3 5.8-5.1.3 0 .6.1.9.1V14c-.4-.1-.7-.2-1.1-.2-1.4 0-2.3.8-2.3 2 0 1.1.8 1.9 2 1.9 1.3 0 2.1-.8 2.1-2.4V3h3.4Z" />
    </svg>
  );
}

function YouTubeIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M21.6 7.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C15.8 4 12 4 12 4s-3.8 0-6.7.2c-.4.1-1.3.1-2.1.9-.6.6-.8 2.1-.8 2.1S2.2 9 2.2 10.8v1.7c0 1.8.2 3.6.2 3.6s.2 1.5.8 2.1c.8.8 1.9.8 2.4.9 1.7.2 6.4.2 6.4.2s3.8 0 6.7-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.8.2-3.6v-1.7c0-1.8-.2-3.6-.2-3.6ZM10.2 14.8V8.6l5.8 3.1-5.8 3.1Z" />
    </svg>
  );
}

function EmailIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <rect x="3" y="5" width="18" height="14" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="m5 8 7 5 7-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SocialIconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  const enabled = Boolean(href);

  const className = enabled
    ? "inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
    : "inline-flex h-11 w-11 cursor-default items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-400";

  if (!enabled) {
    return (
      <span className={className} aria-label={label} aria-disabled="true" title={`${label} link will be added later`}>
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noreferrer" : undefined}
      className={className}
      aria-label={label}
      title={label}
    >
      {children}
    </a>
  );
}

function LandingShowcase({
  lang,
  onOpenServices,
}: {
  lang: Lang;
  onOpenServices: () => void;
}) {
  const t = T[lang];
  return (
    <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm md:rounded-[2rem] md:p-8">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-3xl font-black leading-tight tracking-tight text-slate-900 md:text-6xl">
          {t.showcaseTitle}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 md:text-lg md:leading-8">
          {t.showcaseDesc}
        </p>
        <div className="mt-4 grid gap-2 text-sm text-slate-700 md:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2 leading-5 md:block md:p-4 md:leading-6">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500 md:mb-2 md:block">
              01
            </span>
            <span>{t.showcaseStep1}</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2 leading-5 md:block md:p-4 md:leading-6">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500 md:mb-2 md:block">
              02
            </span>
            <span>{t.showcaseStep2}</span>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-2 leading-5 md:block md:p-4 md:leading-6">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500 md:mb-2 md:block">
              03
            </span>
            <span>{t.showcaseStep3}</span>
          </div>
        </div>
        <div className="mt-5 flex md:mt-8">
          <button
            type="button"
            onClick={onOpenServices}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white shadow-lg transition hover:bg-emerald-700 sm:w-auto md:px-6 md:py-4 md:text-base"
          >
            {t.showcaseCta}
          </button>
        </div>
        <div className="mt-5 border-t border-slate-100 pt-4 md:mt-6">
          <div className="flex items-center justify-center gap-3">
            <SocialIconLink href={SOCIAL_LINKS.instagram} label={t.socialInstagram}>
              <InstagramIcon />
            </SocialIconLink>
            <SocialIconLink href={SOCIAL_LINKS.facebook} label={t.socialFacebook}>
              <FacebookIcon />
            </SocialIconLink>
            <SocialIconLink href={SOCIAL_LINKS.tiktok} label={t.socialTikTok}>
              <TikTokIcon />
            </SocialIconLink>
            <SocialIconLink href={SOCIAL_LINKS.youtube} label={t.socialYouTube}>
              <YouTubeIcon />
            </SocialIconLink>
            <SocialIconLink href={SOCIAL_LINKS.email} label={t.socialEmail}>
              <EmailIcon />
            </SocialIconLink>
          </div>
        </div>
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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur md:px-10 md:py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
        <div>
          <h1 className="whitespace-nowrap text-xl font-black md:text-2xl">{t.header}</h1>
          <p className="hidden text-xs text-slate-500 md:block">
            {t.subheader}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {view !== "SUCCESS" ? (
            <button
              type="button"
              onClick={onOpenHelp}
              className="hidden rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 hover:border-slate-900 md:inline-flex"
            >
              {t.quickHelp}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "es" : "en")}
            className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-900 hover:border-slate-900"
          >
            {lang === "en" ? "Español" : "English"}
          </button>
          {view !== "LANDING" ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              {view === "MENU" ? t.backHome : t.back}
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
        {lang === "en" ? path.cta : path.ctaEs} →
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
              <div className="mt-4 text-lg font-black">{translateSizeLabel(size, lang)}</div>
              <div
                className={`text-sm ${
                  active ? "text-slate-200" : "text-slate-500"
                }`}
              >
                {translateSizeSublabel(size, lang)}
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
      <div className="mb-6">
        <div>
          <h3 className="text-2xl font-black tracking-tight text-slate-900">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
        </div>

      </div>
      <div className="grid gap-5">
        {services.map((service) => {
          const selected = Boolean(cart[service.id]);
          const notice = getNotice(service);
          const priceLabel =
            service.pricingType === "percentage"
              ? service.displayPriceLabel ?? "+25%"
              : formatPrice(getBasePrice(service, selectedSize), lang);
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
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-lg font-black leading-tight">
                        {translateServiceTitle(service, lang)}
                      </h4>
                      {translateServiceField(service, "sampleLabel", lang) ? (
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {translateServiceField(service, "sampleLabel", lang)}
                        </span>
                      ) : null}
                    </div>
                    <p
                      className={`mt-2 text-sm leading-6 ${
                        selected ? "text-slate-200" : "text-slate-600"
                      }`}
                    >
                      {translateServiceField(service, "short", lang)}
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
                    {translateServiceCategory(service, lang)}
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
                  <p className="mt-2 text-sm leading-6">{translateServiceField(service, "bestFor", lang)}</p>
                </div>
                <div
                  className={`rounded-2xl p-4 ${
                    selected ? "bg-white/10" : "bg-slate-50"
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-wide opacity-70">
                    {t.youSend}
                  </div>
                  <p className="mt-2 text-sm leading-6">{translateServiceField(service, "youSend", lang)}</p>
                </div>
                <div
                  className={`rounded-2xl p-4 ${
                    selected ? "bg-white/10" : "bg-slate-50"
                  }`}
                >
                  <div className="text-xs font-bold uppercase tracking-wide opacity-70">
                    {t.youGet}
                  </div>
                  <p className="mt-2 text-sm leading-6">{translateServiceField(service, "youGet", lang)}</p>
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
                    {translateServiceField(service, "notIncluded", lang)}
                  </p>
                </div>
              </div>
              {translateServiceField(service, "helper", lang) ? (
                <div
                  className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                    selected
                      ? "border-white/15 bg-white/5 text-slate-200"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  {translateServiceField(service, "helper", lang)}
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
                    label={translateServiceField(service, "quantityLabel", lang) ?? t.qty.toLowerCase()}
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
            required
            value={contact.clientName}
            onChange={(e) => onChange({ clientName: e.target.value })}
            placeholder={t.clientNamePlaceholder}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-slate-700">
            {t.clientEmail}
          </span>
          <input
            type="email"
            required
            value={contact.customerEmail}
            onChange={(e) => onChange({ customerEmail: e.target.value })}
            placeholder={t.clientEmailPlaceholder}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
          />
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">
            {t.clientPhone}
          </span>
          <input
            type="tel"
            required
            value={contact.customerPhone}
            onChange={(e) => onChange({ customerPhone: e.target.value })}
            placeholder={t.clientPhonePlaceholder}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
          />
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">
            {t.projectAddress}
          </span>
          <input
            required
            value={contact.projectAddress}
            onChange={(e) => onChange({ projectAddress: e.target.value })}
            placeholder={t.projectAddressPlaceholder}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
          />
          <div className="text-xs leading-5 text-slate-500">{t.projectLabelHelp}</div>
        </label>
        <label className="grid gap-2 md:col-span-2">
          <span className="text-sm font-semibold text-slate-700">
            {t.notes}
          </span>
          <textarea
            required
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

      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm">
        <input
          type="checkbox"
          required
          checked={contact.sameProjectConfirmed}
          onChange={(e) => onChange({ sameProjectConfirmed: e.target.checked })}
          className="mt-1"
        />
        <span>
          <span className="block font-black text-slate-900">
            {t.sameProjectConfirm}
          </span>
          <span className="mt-1 block text-xs leading-5 text-slate-600">
            {t.sameProjectHelp}
          </span>
        </span>
      </label>

      <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 md:p-6">
        <div className="flex flex-col gap-2">
          <h4 className="text-lg font-black text-slate-900">
            {t.partnerProfileTitle}
          </h4>
          <p className="text-sm leading-6 text-slate-600">
            {t.partnerProfileHelp}
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          <div className="text-sm font-semibold text-slate-700">
            {t.partnerProfileQuestion}
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            <input
              type="radio"
              name="partnerProfileMode"
              checked={contact.partnerProfileMode === "new"}
              onChange={() => onChange({ partnerProfileMode: "new", logoOption: "upload" })}
              className="mt-1"
            />
            <span>{t.partnerProfileNew}</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
            <input
              type="radio"
              name="partnerProfileMode"
              checked={contact.partnerProfileMode === "existing"}
              onChange={() => onChange({ partnerProfileMode: "existing", logoOption: "on-file" })}
              className="mt-1"
            />
            <span>{t.partnerProfileExisting}</span>
          </label>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">
              {t.whiteLabelCompany}
            </span>
            <input
              value={contact.whiteLabelCompany}
              onChange={(e) => onChange({ whiteLabelCompany: e.target.value })}
              placeholder={t.whiteLabelCompanyPlaceholder}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              {t.whiteLabelPhone}
            </span>
            <input
              value={contact.whiteLabelPhone}
              onChange={(e) => onChange({ whiteLabelPhone: e.target.value })}
              placeholder={t.whiteLabelPhonePlaceholder}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              {t.whiteLabelEmail}
            </span>
            <input
              type="email"
              value={contact.whiteLabelEmail}
              onChange={(e) => onChange({ whiteLabelEmail: e.target.value })}
              placeholder={t.whiteLabelEmailPlaceholder}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              {t.whiteLabelWebsite}
            </span>
            <input
              value={contact.whiteLabelWebsite}
              onChange={(e) => onChange({ whiteLabelWebsite: e.target.value })}
              placeholder={t.whiteLabelWebsitePlaceholder}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              {t.desiredDeliveryDate}
            </span>
            <input
              type="date"
              value={contact.desiredDeliveryDate}
              onChange={(e) => onChange({ desiredDeliveryDate: e.target.value })}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
            />
            <span className="text-xs text-slate-500">{t.desiredDeliveryDateHelp}</span>
          </label>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-700">
              {t.clientNameDisplay}
            </div>
            <div className="mt-3 grid gap-2 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="clientNameDisplay"
                  checked={contact.clientNameDisplay === "show"}
                  onChange={() => onChange({ clientNameDisplay: "show" })}
                />
                <span>{t.showClientName}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="clientNameDisplay"
                  checked={contact.clientNameDisplay === "hide"}
                  onChange={() => onChange({ clientNameDisplay: "hide" })}
                />
                <span>{t.hideClientName}</span>
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-sm font-semibold text-slate-700">
              {t.addressDisplay}
            </div>
            <div className="mt-3 grid gap-2 text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="addressDisplay"
                  checked={contact.addressDisplay === "full"}
                  onChange={() => onChange({ addressDisplay: "full" })}
                />
                <span>{t.addressFull}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="addressDisplay"
                  checked={contact.addressDisplay === "street"}
                  onChange={() => onChange({ addressDisplay: "street" })}
                />
                <span>{t.addressStreet}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="addressDisplay"
                  checked={contact.addressDisplay === "project"}
                  onChange={() => onChange({ addressDisplay: "project" })}
                />
                <span>{t.addressProject}</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="addressDisplay"
                  checked={contact.addressDisplay === "hide"}
                  onChange={() => onChange({ addressDisplay: "hide" })}
                />
                <span>{t.addressHide}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold text-slate-700">
            {t.logoOption}
          </div>
          <div className="mt-3 grid gap-2 text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="logoOption"
                checked={contact.logoOption === "upload"}
                onChange={() => onChange({ logoOption: "upload" })}
              />
              <span>{t.logoUpload}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="logoOption"
                checked={contact.logoOption === "on-file"}
                onChange={() => onChange({ logoOption: "on-file" })}
              />
              <span>{t.logoOnFile}</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="radio"
                name="logoOption"
                checked={contact.logoOption === "text-only"}
                onChange={() => onChange({ logoOption: "text-only" })}
              />
              <span>{t.logoTextOnly}</span>
            </label>
          </div>
        </div>

        <label className="mt-5 grid gap-2">
          <span className="text-sm font-semibold text-slate-700">
            {t.brandingNotes}
          </span>
          <textarea
            value={contact.brandingNotes}
            onChange={(e) => onChange({ brandingNotes: e.target.value })}
            rows={3}
            placeholder={t.brandingNotesPlaceholder}
            className="rounded-3xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-slate-400"
          />
        </label>

        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
          <input
            type="checkbox"
            checked={contact.rememberPartnerInfo}
            onChange={(e) => onChange({ rememberPartnerInfo: e.target.checked })}
            className="mt-1"
          />
          <span>
            <span className="block font-semibold text-slate-800">
              {t.rememberPartnerInfo}
            </span>
            <span className="mt-1 block text-xs leading-5 text-slate-500">
              {t.rememberHelp}
            </span>
          </span>
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
  useDeposit,
  isQuickConceptOnly,
  canCheckout,
  isCreating,
  onReset,
  onCheckout,
  cleared,
}: {
  lang: Lang;
  items: SummaryLine[];
  total: number;
  deposit: number;
  remaining: number;
  rushFee: number;
  hasTbd: boolean;
  useDeposit: boolean;
  isQuickConceptOnly: boolean;
  canCheckout: boolean;
  isCreating: boolean;
  onReset: () => void;
  onCheckout: () => void;
  cleared: boolean;
}) {
  const t = T[lang];
  return (
    <aside className="h-fit lg:sticky lg:top-24">
      <div className="space-y-6 rounded-[2.5rem] border-2 border-slate-900 bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">{t.summary}</h2>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-950">
          {t.oneProjectSummary}
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
                    : formatPrice(item.price, lang)}
                </div>
              </div>
            ))
          )}
        </div>
        {rushFee ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {t.rushFee}: {formatPrice(rushFee, lang)}
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
                  {formatPrice(total, lang)}
                </span>
              </div>
              <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
                {t.tbdHelp}
              </div>
            </>
          ) : useDeposit ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">{t.total}</span>
                <span className="font-bold text-slate-900">
                  {formatPrice(total, lang)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-slate-500">{t.deposit}</span>
                <span className="font-bold text-slate-900">
                  {formatPrice(deposit, lang)}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-slate-500">{t.remaining}</span>
                <span className="font-bold text-slate-900">
                  {formatPrice(remaining, lang)}
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">{t.totalDueToday}</span>
              <span className="font-bold text-slate-900">
                {formatPrice(total, lang)}
              </span>
            </div>
          )}
        </div>
        <div className="grid gap-3">
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
          {isCreating ? t.generating : hasTbd ? t.submitForReview : t.generateInvoice}
        </button>
        {isQuickConceptOnly ? (
          <div className="text-xs leading-6 text-slate-500">
            {t.uploadAfterPaymentNote}
          </div>
        ) : null}
        {!hasTbd ? (
          <div className="text-xs leading-6 text-slate-500">{t.termsLine}</div>
        ) : null}
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
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
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
      `Hi Olya, I just submitted intake for ${order.pathTitle} at ${order.projectAddress}. Order ID: ${order.orderId}.`
    );
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-3xl font-black text-slate-900">
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
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
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

const FULL_DESIGN_PACKAGE_IDS = ["yard-design-package"];
const FULL_DESIGN_STARTING_POINT_IDS = ["onsite-base-model", "survey-documents-start", "client-model-start"];
const FULL_DESIGN_IDEA_IDS = ["draw-your-idea", "help-design-it"];

const STRUCTURE_DECK_IDS = ["deck-small", "deck-large"];
const STRUCTURE_COVER_IDS = ["pergola-small", "shade-large"];
const STRUCTURE_CARPORT_IDS = ["carport-small", "carport-large"];
const STRUCTURE_MAIN_BUILD_IDS = [
  ...STRUCTURE_DECK_IDS,
  ...STRUCTURE_COVER_IDS,
  "outdoor-kitchen",
];

export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [view, setView] = useState<ViewState>("LANDING");
  const [activePath, setActivePath] = useState<string>("quick-sale");
  const [selectedSize, setSelectedSize] = useState<string>("small");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [contact, setContact] = useState<OrderContact>(() => getInitialContact());
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
  const selectedPathTitle =
    lang === "en" ? selectedPath.title : selectedPath.titleEs;
  const selectedSizeObj = SIZES.find((size) => size.id === selectedSize);
  const selectedSizeLabel =
    translateSizeLabel(selectedSizeObj, lang) || selectedSize;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (contact.rememberPartnerInfo) {
      savePartnerInfo(contact);
    } else {
      window.localStorage.removeItem(PARTNER_STORAGE_KEY);
    }
  }, [contact]);

  function navigateTo(nextView: ViewState, nextPath = activePath, historyMode: "push" | "replace" = "push") {
    setActivePath(nextPath);
    setView(nextView);
    if (typeof window !== "undefined" && window.location.pathname !== "/success") {
      const state = { scopeBuilderView: nextView, scopeBuilderActivePath: nextPath };
      const url = `${window.location.pathname}${window.location.search}`;
      if (historyMode === "replace") window.history.replaceState(state, "", url);
      else window.history.pushState(state, "", url);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  useEffect(() => {
    if (typeof window === "undefined" || window.location.pathname === "/success") return;
    const currentState = window.history.state as { scopeBuilderView?: ViewState; scopeBuilderActivePath?: string } | null;
    if (!currentState?.scopeBuilderView) {
      window.history.replaceState(
        { scopeBuilderView: "LANDING", scopeBuilderActivePath: activePath },
        "",
        `${window.location.pathname}${window.location.search}`
      );
    }
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as { scopeBuilderView?: ViewState; scopeBuilderActivePath?: string } | null;
      if (state?.scopeBuilderView) {
        setView(state.scopeBuilderView);
        if (state.scopeBuilderActivePath) setActivePath(state.scopeBuilderActivePath);
        window.scrollTo({ top: 0, behavior: "auto" });
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

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
            customerPhone: data.customerPhone ?? "",
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
              customerPhone: "",
              projectAddress: "Project name or address (optional)",
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
      FULL_YARD_PACKAGE_SERVICES.some((service) => service.id === id) ||
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
  const useDeposit = !hasTbd && total >= 500;
  const isQuickConceptOnly =
    pricedItems.length === 1 && pricedItems[0]?.service.id === "photo-concept-start";
  const hasPayableService = pricedItems.some(
    (item) => item.service.stripePriceId && !item.isQuote
  );
  const hasRequiredContact =
    Boolean(contact.clientName.trim()) &&
    Boolean(contact.customerEmail.trim()) &&
    Boolean(contact.customerPhone.trim()) &&
    Boolean(contact.projectAddress.trim()) &&
    Boolean(contact.notes.trim()) &&
    contact.sameProjectConfirmed;
  const canSubmitReview = hasRequiredContact && pricedItems.length > 0 && hasTbd;
  const canCheckout = hasRequiredContact && hasPayableService && !hasTbd;
  const canProceed = canCheckout || canSubmitReview;

  const summaryLines: SummaryLine[] = pricedItems.map((item) => ({
    title: translateServiceTitle(item.service, lang),
    qty: item.qty,
    price: item.price,
    isQuote: item.isQuote,
  }));


  function openHelpWithService(service: Service) {
    setHelpForm((prev) => ({
      ...prev,
      question: `${lang === "es" ? "Pregunta sobre" : "Question about"} ${translateServiceTitle(service, lang)}: `,
    }));
    setShowHelp(true);
  }

  function toggleService(service: Service) {
    const notice = getNotice(service);
    if (notice.kind === "hard") return;
    setCart((prev) => {
      const next = { ...prev };
      if (next[service.id]) {
        delete next[service.id];
        return next;
      }

      if (FULL_DESIGN_PACKAGE_IDS.includes(service.id)) {
        [...FULL_DESIGN_PACKAGE_IDS, ...FULL_DESIGN_STARTING_POINT_IDS, ...FULL_DESIGN_IDEA_IDS].forEach((id) => delete next[id]);
      }

      if (FULL_DESIGN_STARTING_POINT_IDS.includes(service.id)) {
        FULL_DESIGN_PACKAGE_IDS.forEach((id) => delete next[id]);
        FULL_DESIGN_STARTING_POINT_IDS.forEach((id) => delete next[id]);
      }

      if (FULL_DESIGN_IDEA_IDS.includes(service.id)) {
        FULL_DESIGN_PACKAGE_IDS.forEach((id) => delete next[id]);
        FULL_DESIGN_IDEA_IDS.forEach((id) => delete next[id]);
      }

      if (STRUCTURE_DECK_IDS.includes(service.id)) {
        STRUCTURE_DECK_IDS.forEach((id) => delete next[id]);
        STRUCTURE_CARPORT_IDS.forEach((id) => delete next[id]);
      }

      if (STRUCTURE_COVER_IDS.includes(service.id)) {
        STRUCTURE_COVER_IDS.forEach((id) => delete next[id]);
        STRUCTURE_CARPORT_IDS.forEach((id) => delete next[id]);
      }

      if (service.id === "outdoor-kitchen") {
        STRUCTURE_CARPORT_IDS.forEach((id) => delete next[id]);
      }

      if (STRUCTURE_CARPORT_IDS.includes(service.id)) {
        STRUCTURE_CARPORT_IDS.forEach((id) => delete next[id]);
        STRUCTURE_MAIN_BUILD_IDS.forEach((id) => delete next[id]);
      }

      next[service.id] = 1;
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
    setContact(getInitialContact());
    setCleared(true);
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
    if (hasTbd) {
      if (!canSubmitReview) {
        setCheckoutNotice(t.fillRequired);
        return;
      }
      setCreatingCheckout(true);
      setCheckoutNotice(null);
      const orderId = `review_${Date.now()}`;
      const reviewPayload = {
        order_id: orderId,
        path_id: activePath,
        path_title: selectedPathTitle,
        size_id: selectedSize,
        client_name: sanitizeText(contact.clientName),
        customer_email: sanitizeText(contact.customerEmail),
        customer_phone: sanitizeText(contact.customerPhone),
        project_address: sanitizeText(contact.projectAddress),
        project_client_label: sanitizeText(contact.projectAddress),
        same_client_project_confirmed: contact.sameProjectConfirmed,
        full_notes: contact.notes,
        white_label_delivery: buildWhiteLabelPayload(contact),
        payment_status: "needs_manual_review",
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
          body: JSON.stringify(reviewPayload),
        }).catch(() => undefined);
        setCheckoutNotice(t.reviewSubmitted);
      } finally {
        setCreatingCheckout(false);
      }
      return;
    }

    if (!canCheckout) {
      setCheckoutNotice(t.fillRequired);
      return;
    }
    setCreatingCheckout(true);
    setCheckoutNotice(null);
    const orderId = `order_${Date.now()}`;
    const orderDraftPayload = {
      order_id: orderId,
      path_id: activePath,
      path_title: selectedPathTitle,
      size_id: selectedSize,
      client_name: sanitizeText(contact.clientName),
      customer_email: sanitizeText(contact.customerEmail),
      customer_phone: sanitizeText(contact.customerPhone),
      project_address: sanitizeText(contact.projectAddress),
      project_client_label: sanitizeText(contact.projectAddress),
      same_client_project_confirmed: contact.sameProjectConfirmed,
      full_notes: contact.notes,
      white_label_delivery: buildWhiteLabelPayload(contact),
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
        customer_phone: sanitizeText(contact.customerPhone),
        client_name: sanitizeText(contact.clientName),
        project_address: sanitizeText(contact.projectAddress),
        project_client_label: sanitizeText(contact.projectAddress),
        same_client_project_confirmed: contact.sameProjectConfirmed,
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
          project_client_label: sanitizeText(contact.projectAddress),
          same_client_project_confirmed: String(contact.sameProjectConfirmed),
          short_notes: contact.notes.slice(0, 250),
          logo_option: contact.logoOption,
          white_label_company: sanitizeText(contact.whiteLabelCompany || contact.clientName),
        },
        full_notes: contact.notes,
        white_label_delivery: buildWhiteLabelPayload(contact),
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
          pathTitle: selectedPathTitle,
          sizeId: selectedSize,
          sizeLabel: selectedSizeLabel,
          clientName: contact.clientName,
          customerEmail: contact.customerEmail,
          customerPhone: contact.customerPhone,
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
        setCheckoutNotice(lang === "es" ? "El pago en línea todavía no está conectado. No se hizo ningún pago. Contáctanos para terminar este pedido." : "Online payment is not connected yet. No payment was made. Please contact us to finish this order.");
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
          <div className="space-y-5 md:space-y-8">
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
              services={SUPPORT_SERVICES.filter((service) =>
                ["site-visit-addon", "rush-fee"].includes(service.id)
              )}
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
              title={t.designPackageSection}
              description={t.designPackageSectionDesc}
              services={FULL_YARD_PACKAGE_SERVICES}
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
              services={SUPPORT_SERVICES.filter((service) =>
                ["site-visit-addon", "rush-fee"].includes(service.id)
              )}
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
      case "3d-rendering":
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
              services={STARTING_POINT_SERVICES.filter((service) =>
                FULL_DESIGN_STARTING_POINT_IDS.includes(service.id)
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
              title={t.supportSection}
              description={t.supportSectionDesc}
              services={SUPPORT_SERVICES.filter((service) =>
                ["site-visit-addon", "rush-fee"].includes(service.id)
              )}
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
          if (view === "SUCCESS") navigateTo("CONFIG", activePath, "replace");
          else if (view === "CONFIG") navigateTo("MENU", activePath, "replace");
          else navigateTo("LANDING", activePath, "replace");
        }}
        onOpenHelp={() => setShowHelp(true)}
      />
      <main className="mx-auto max-w-7xl px-4 pt-4 md:px-10 md:pt-8">
        {view === "LANDING" ? (
          <div className="space-y-8">
            <LandingShowcase
              lang={lang}
              onOpenServices={() => navigateTo("MENU")}
            />
          </div>
        ) : view === "MENU" ? (
          <div className="space-y-8">
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
                      navigateTo("CONFIG", id);
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
              useDeposit={useDeposit}
              isQuickConceptOnly={isQuickConceptOnly}
              canCheckout={canProceed}
              isCreating={creatingCheckout}
              onReset={resetCart}
              onCheckout={createCheckout}
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
