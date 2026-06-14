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
type TitleBlockOption = "standard-landscape" | "standard-portrait" | "upload";
type TitleBlockSampleOption = "standard-landscape" | "standard-portrait";
type MissingRequirementKey =
  | "selectedService"
  | "partnerName"
  | "partnerEmail"
  | "partnerPhone"
  | "whiteLabelCompany"
  | "projectLabel"
  | "projectDetails"
  | "projectPhotos"
  | "surveyDocs"
  | "references"
  | "sameProject";
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
  clientTitleBlockName: string;
  clientTitleBlockAddress: string;
  notes: string;
  measurementObject: string;
  measurementWidth: string;
  measurementLength: string;
  measurementHeight: string;
  measurementsNotes: string;
  referenceLinks: string;
  partnerProfileMode: PartnerProfileMode;
  whiteLabelCompany: string;
  whiteLabelPhone: string;
  whiteLabelEmail: string;
  whiteLabelWebsite: string;
  desiredDeliveryDate: string;
  clientNameDisplay: ClientNameDisplay;
  addressDisplay: AddressDisplay;
  logoOption: LogoOption;
  titleBlockOption: TitleBlockOption;
  brandingNotes: string;
  sameProjectConfirmed: boolean;
  rememberPartnerInfo: boolean;
}

interface ProjectFileUploads {
  photos: FileList | null;
  surveyDocs: FileList | null;
  titleBlockFiles: FileList | null;
  logoFiles: FileList | null;
  references: FileList | null;
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
  estimatedTotal: number;
  deposit: number;
  remaining: number;
  useDeposit: boolean;
  hasTbd: boolean;
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
const ORDER_REVIEW_ENDPOINT = "https://script.google.com/macros/s/AKfycbxNhc22ZYQ007ljInzF9vxQXL23qfL_r59GqtTjYhucEUBSd-EUBr33Tz8PRC892VoR/exec";
const SOCIAL_LINKS = {
  // Add SiteForm Studio social links later. Leave empty to show the icon as disabled.
  instagram: "https://www.instagram.com/siteform.studio/",
  facebook: "",
  tiktok: "",
  youtube: "",
  email: "mailto:start@siteform.studio",
};

type SampleImages = {
  before: string;
  after: string;
};

function makeSampleSvg(label: string, bg: string, fg: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760"><rect width="1200" height="760" fill="${bg}"/><rect x="70" y="70" width="1060" height="620" rx="42" fill="white" opacity="0.58"/><text x="600" y="352" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="800" fill="${fg}">${label}</text><text x="600" y="420" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="600" fill="${fg}" opacity="0.72">Replace with your project sample image</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const DEFAULT_SAMPLE_IMAGES: SampleImages = {
  before: makeSampleSvg("Before", "#e5e7eb", "#334155"),
  after: makeSampleSvg("After", "#dff4e7", "#166534"),
};

const SAMPLE_IMAGES: Record<string, SampleImages> = {
  "photo-concept-start": {
    before: "/samples/quick-photo-before.jpg",
    after: "/samples/quick-photo-after.jpg",
  },
};

function getSampleImages(serviceId: string): SampleImages {
  return SAMPLE_IMAGES[serviceId] ?? DEFAULT_SAMPLE_IMAGES;
}

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
    clientNamePlaceholder: "Name or company we should contact about this order",
    clientEmail: "Your email",
    clientEmailPlaceholder: "Email for this order",
    clientPhone: "Your phone number",
    clientPhonePlaceholder: "Example: 512-555-0198",
    projectAddress: "Internal project label / job name",
    projectAddressPlaceholder: "Example: Garcia backyard, Oak St deck, Project 24-018",
    projectLabelHelp:
      "Required for order tracking. This does not have to appear on the title block. Everything selected in this order must belong to this one client/project.",
    clientTitleBlockName: "Client name for title block",
    clientTitleBlockNamePlaceholder: "Optional. Leave blank if you do not want a client name shown.",
    clientTitleBlockAddress: "Client address for title block",
    clientTitleBlockAddressPlaceholder: "Optional. Full address, street only, or leave blank.",
    titleBlockSample: "View sample",
    missingRequiredTitle: "Still needed before you submit",
    notes: "Project details",
    notesHelp:
      "Required. Tell us what you need, what the client wants, what area or structure this is, budget/timing concerns, and any site limits.",
    measurementsNotes: "Measurement notes",
    measurementObject: "Object / area measured",
    measurementObjectPlaceholder: "Example: deck, pergola, patio, front entry, side yard",
    measurementWidth: "Width",
    measurementLength: "Length / depth",
    measurementHeight: "Height",
    measurementValuePlaceholder: "Example: 12 ft",
    measurementsNotesPlaceholder:
      "Optional notes: roof/eave-to-ground height, house-to-fence distances, slopes, steps, walls, grade changes, or what each measurement means.",
    measurementsNotesHelp:
      "Measurements are not required to submit, but they are strongly recommended. If there is no site visit, work cannot start until usable dimensions are provided. Written notes are often clearer than arrows on photos.",
    referenceLinks: "Reference links / Pinterest / shared boards",
    referenceLinksPlaceholder:
      "Optional. Paste Pinterest boards, product links, Google Drive links, inspiration links, or notes about references.",
    remoteInfoTitle: "If there is no site visit",
    remoteInfoText:
      "Remote orders must include usable dimensions before work starts. Send a survey, site plan, measured sketch, or marked-up plan/photo with width, depth, height, roof/eave-to-ground height, house-to-fence distances, slopes, steps, walls, and level changes where relevant.",
    projectFilesTitle: "Project files for this order",
    projectFilesHelp:
      "Upload files for this one client/project. References/markups/measurement notes are required. A survey/site plan/measured base is required for all services except Quick Photo Concept. Project photos are required for Quick Photo Concept and helpful for other orders. Keep each file under 12 MB for this first-version uploader; if a phone photo or PDF is larger, upload a reduced/compressed copy and mention that high-resolution files are available. For a different client, start a separate order.",
    uploadPhotosHelp:
      "Required for Quick Photo Concept; optional but helpful for other services. You may upload up to 10 photos for context, but Quick Photo Concept includes work on one selected photo only. Clear photos of the project area, facade, patio, yard, problem spots, slope, roof/eaves, fence lines, or existing conditions.",
    uploadSurveyHelp:
      "Required for all services except Quick Photo Concept. Upload a survey, site plan, measured sketch, marked base plan, PDF, or drawing that gives us the project geometry. Up to 10 files per upload.",
    titleBlockOption: "Title block / sheet template",
    titleBlockStandardLandscape: "Use standard landscape SiteForm title block",
    titleBlockStandardPortrait: "Use standard portrait SiteForm title block",
    titleBlockUpload: "Upload my own title block / sheet template",
    uploadTitleBlock: "Upload title block / sheet template",
    uploadTitleBlockHelp:
      "Choose one standard blank title block, or upload your own PDF border, sheet frame, DWG/PDF template, or title block file.",
    uploadLogoFiles: "Logo / brand files",
    uploadLogoHelp:
      "Optional. Upload a logo or brand file if you want it used. Use PNG, SVG, PDF, AI, or EPS if available. If you do not have one, choose text-only company name.",
    uploadReferences: "References / markups / measurements",
    uploadReferencesHelp:
      "Required. Upload reference images, client markups, screenshots, marked photos, measurement notes, or PDFs showing desired look, key dimensions, and problem areas. Up to 10 files per upload.",
    filesSelected: "file(s) selected",
    reviewOnlyNotice:
      "Submit for review does not request payment. We check the files and selected scope first, then send an invoice/payment link. Quick Photo Concept is due on receipt before the 1-business-day turnaround. Other approved services start after the 50% deposit invoice is paid; the remaining 50% is invoiced after drawings/deliverables are provided.",
    estimatedInvoiceNote:
      "This is an estimate based on the selected services. Final invoice is sent after review.",
    orderIdLabel: "Order ID",
    estimatedTotalLabel: "Estimated total",
    invoiceNext:
      "Next: we review the scope, check the uploaded files, and send an invoice/payment link if everything matches. Quick Photo Concept is paid right away before the 1-business-day turnaround. Other approved services start after the 50% deposit invoice is paid; the remaining 50% is invoiced after drawings/deliverables are provided. Wave handles the invoice due date and reminders. If the scope is different, we will adjust it before invoicing.",
    tbdOnReview: "Some items are TBD and will be priced after review.",
    writtenOnlyNote: "Written communication only. No phone support for production questions.",
    partnerProfileTitle: "Company / white-label information",
    partnerProfileHelp:
      "Tell us how your company information should appear on white-label PDFs and sheets. Repeat partners can ask us to use details already on file.",
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
    desiredDeliveryDate: "Desired delivery date",
    desiredDeliveryDateHelp: "Rush timing still depends on our schedule.",
    quickDeliveryFixed: "Quick Photo Concept turnaround: about 1 business day for usable photo orders.",
    clientNameDisplay: "Client information for title block",
    showClientName: "Client name to show on title block",
    hideClientName: "Leave blank if you do not want it shown",
    addressDisplay: "Client address for title block",
    addressFull: "Client address to show on title block",
    addressStreet: "Leave blank if you do not want it shown",
    addressProject: "Project name only",
    addressHide: "Do not show address",
    logoOption: "Logo option",
    logoUpload: "Use logo — upload a logo/brand file",
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
    totalDueToday: "Estimated invoice total",
    deposit: "Estimated deposit (70%)",
    remaining: "Estimated balance",
    tbd: "TBD",
    currentPricedSubtotal: "Current priced estimate",
    rushFee: "Rush fee",
    tbdHelp:
      "Some selected items need review before final pricing. Fixed-price items show an estimate; the invoice may change if the files or scope do not match the selected package.",
    copySummary: "Copy summary",
    copied: "Copied",
    resetCart: "Reset cart",
    cleared: "Cleared",
    confirmReset: "Reset cart and clear current selection?",
    generateInvoice: "Submit project for review",
    submitForReview: "Submit project for review",
    uploadAfterPaymentNote: "We will review your files and send an invoice/payment link before work starts.",
    reviewSubmitted: "Project submitted for review. We will verify the scope and files, then send an invoice/payment link before work starts.",
    generating: "Submitting...",
    termsLine:
      "All deliverables are design-intent / visualization / coordination support only. They are not sealed, stamped, permit-ready, construction-control, engineering, surveying, or code-compliance documents.",
    safetyTitle: "Scope safety note",
    safetyText:
      "We provide design-intent visuals, concept sheets, drafting cleanup, and white-label presentation support. We do not provide engineering, legal surveying, code review, permit filing, permit approval guarantees, sealed/stamped drawings, structural calculations, utility design, or construction-control documents.",
    fillRequired:
      "Add your name/company, email, phone number, project/client label, project details, required references/markups, required survey/site plan or measured base when needed, confirm this is one client/project, and select at least one service. For first-time white-label setup, add the company name.",
    quoteBlocksCheckout:
      "All orders are reviewed first. We send the invoice/payment link after scope and files are checked.",
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
      "Design-intent yard package: concept plan, planting direction, and presentation visuals for one design area. Built structures, specialty sheets, and professional 3D workflow live in separate sections.",
    startSection: "3D / rendering support",
    startSectionDesc:
      "Choose the base/model path first. Site Visit is an optional add-on if you want us to collect field photos, notes, and rough measurements ourselves. This is existing-conditions setup for design and visualization, not survey or engineering.",
    ideaSection: "Design role",
    ideaSectionDesc:
      "Choose only one: we produce your design direction, or we lead the design brief before modeling/rendering.",
    afterLayout: "After layout",
    afterLayoutDesc:
      "Use these after the design direction is selected and no longer changing. These are design-intent follow-up sheets, not sealed construction documents.",
    buildSection: "Choose outdoor structure",
    buildSectionDesc:
      "You can combine a deck, pergola / cover, and outdoor kitchen when they belong to the same client/project. Choose only one size per structure type. These are concept and presentation packages; structural engineering, code checks, and permits stay with the licensed/local professionals.",
    supportSection: "Site visit and rush timing",
    supportSectionDesc:
      "Add a local site visit if field measurements are needed. If the site is outside city limits, extra travel time may be added to the final invoice at $70/hour. Rush turnaround may be available when the schedule allows.",
    quickSection: "Quick Photo Concept",
    quickSectionDesc:
      "One fast visual to help close the sale.",
    specialSection: "Plans & Sheets",
    specialSectionDesc:
      "Use these when the design already exists and you need a specific clean design-intent sheet for presentation, pricing, or crew discussion.",
    citySection: "HOA / jurisdiction review support",
    citySectionDesc:
      "These use an existing base, usually a clean master plan. They are support exhibits only: we do not file permits, guarantee approvals, or replace licensed professionals.",
    irrigationSection: "Licensed irrigator drafting",
    irrigationSectionDesc:
      "Drafting cleanup only from a licensed irrigator's markups. We do not design irrigation systems, calculate hydraulics, or issue installation specifications.",
    softDependencyMasterPlan:
      "Price assumes there is already a clean master plan or other usable base. If not, extra setup may be needed.",
    softDependencyLayout:
      "Price assumes the main layout is already approved. If layout work is still missing, this may need a different package first.",
    hardDependencySiteVisit: "Choose Site Visit first.",
    hardDependencyOutsideCity: "Add Site Visit first.",
    successTitle: "Project submitted for review",
    successText:
      "We received the project request, selected services, files, and white-label settings. We will review the scope and send an invoice/payment link if the selected package matches the files.",
    uploadPhotos: "Project photos",
    uploadSurvey: "Survey / site plan / PDFs",
    detailedBrief: "Detailed scope",
    detailedBriefPlaceholder:
      "Add the full project brief here. Include budget, client goals, site limits, and any measurements we should trust.",
    saveIntake: "Save intake",
    intakeSaved: "Intake saved",
    openProjectChat: "Open project chat",
    successNote:
      "Written project communication only. Please use the project message/update form when it is connected; no phone support is offered for production questions.",
    verifyingPayment: "Checking project status...",
    previewMode:
      "Preview mode: the order review endpoint is not connected yet. No payment was requested and no invoice was created automatically.",
    uploadWidgetNote:
      "Files are intended to be collected inside this SiteForm intake. Connect this section to your upload storage before launch.",
    showcaseBadge: "Try it on a real job",
    showcaseTitle: "White-label support for outdoor pros.",
    showcaseDesc:
      "SiteForm Studio helps builders, landscape crews, deck builders, designers, and outdoor contractors turn rough site info into clear client-facing design support — under your brand.",
    showcaseWhiteTitle: "What white-label means",
    showcaseWhiteText:
      "We stay behind the scenes. Your company name, logo, sheet style, and project label can appear on the PDF, so your client sees your brand — not another design company.",
    showcaseHowTitle: "How it works",
    showcaseHowText:
      "Choose a service, upload photos, measurements, survey files, references, and white-label details. We review the scope, confirm the estimate, and then you receive an invoice/payment link before work starts.",
    showcaseSafeTitle: "Design-intent support",
    showcaseSafeText:
      "Deliverables are for concept, presentation, coordination, and pricing support. We do not provide engineering, permit filing, stamped drawings, or approval guarantees.",
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
    clientNamePlaceholder: "Nombre o compañía para contactar sobre este pedido",
    clientEmail: "Tu email",
    clientEmailPlaceholder: "Email para este pedido",
    clientPhone: "Tu teléfono",
    clientPhonePlaceholder: "Ejemplo: 512-555-0198",
    projectAddress: "Etiqueta interna de proyecto / trabajo",
    projectAddressPlaceholder: "Ejemplo: patio Garcia, deck Oak St, Proyecto 24-018",
    projectLabelHelp:
      "Requerido para organizar el pedido. No tiene que aparecer en el title block. Todo lo seleccionado en este pedido debe pertenecer a este mismo cliente/proyecto.",
    clientTitleBlockName: "Nombre del cliente para title block",
    clientTitleBlockNamePlaceholder: "Opcional. Déjalo vacío si no quieres mostrar nombre de cliente.",
    clientTitleBlockAddress: "Dirección del cliente para title block",
    clientTitleBlockAddressPlaceholder: "Opcional. Dirección completa, solo calle, o vacío.",
    titleBlockSample: "Ver ejemplo",
    missingRequiredTitle: "Falta antes de enviar",
    notes: "Detalles del proyecto",
    notesHelp:
      "Requerido. Di qué necesitas, qué quiere el cliente, qué área o estructura es, presupuesto/plazos y cualquier límite del sitio.",
    measurementsNotes: "Notas de medidas",
    measurementObject: "Objeto / área medida",
    measurementObjectPlaceholder: "Ejemplo: deck, pérgola, patio, entrada, side yard",
    measurementWidth: "Ancho",
    measurementLength: "Largo / fondo",
    measurementHeight: "Altura",
    measurementValuePlaceholder: "Ejemplo: 12 ft",
    measurementsNotesPlaceholder:
      "Notas opcionales: altura de alero a suelo, distancias de casa a cerca, pendientes, escalones, muros, cambios de nivel o qué significa cada medida.",
    measurementsNotesHelp:
      "Las medidas no son obligatorias para enviar, pero son muy recomendables. Si no hay visita, el trabajo no puede empezar hasta que existan dimensiones utilizables. Las notas escritas suelen ser más claras que flechas en fotos.",
    referenceLinks: "Links de referencia / Pinterest / boards",
    referenceLinksPlaceholder:
      "Opcional. Pega Pinterest boards, links de productos, Google Drive, inspiración o notas sobre referencias.",
    remoteInfoTitle: "Si no hay visita al sitio",
    remoteInfoText:
      "Los pedidos remotos deben incluir medidas utilizables antes de empezar. Sube survey, site plan, sketch medido o plano/foto marcado con ancho, profundidad, altura, roof/eave al piso, distancias a fence, pendientes, escalones, muros y cambios de nivel cuando aplique.",
    projectFilesTitle: "Archivos para este pedido",
    projectFilesHelp:
      "Sube archivos para este cliente/proyecto. Referencias/markups son obligatorios. Survey/site plan/base medida es obligatorio para todos los servicios excepto Quick Photo Concept. Las fotos son útiles para la mayoría de pedidos y obligatorias para Quick Photo Concept. Para otro cliente, inicia un pedido separado.",
    uploadPhotosHelp:
      "Obligatorio para Quick Photo Concept; opcional pero útil para otros servicios. Puedes subir hasta 10 fotos como contexto, pero Quick Photo Concept incluye trabajo en una sola foto seleccionada. Fotos claras del área, fachada, patio, yard, problemas, pendiente, roof/eaves, fence lines o condiciones existentes.",
    uploadSurveyHelp:
      "Obligatorio para todos los servicios excepto Quick Photo Concept. Sube survey, site plan, sketch medido, base marcada, PDF o dibujo que nos dé la geometría del proyecto. Hasta 10 archivos por carga.",
    titleBlockOption: "Title block / plantilla de lámina",
    titleBlockStandardLandscape: "Usar title block horizontal estándar de SiteForm",
    titleBlockStandardPortrait: "Usar title block vertical estándar de SiteForm",
    titleBlockUpload: "Subir mi propio title block / plantilla",
    uploadTitleBlock: "Subir title block / plantilla",
    uploadTitleBlockHelp:
      "Elige un title block estándar en blanco, o sube tu borde PDF, marco de lámina, plantilla DWG/PDF o archivo de title block.",
    uploadLogoFiles: "Logo / archivos de marca",
    uploadLogoHelp:
      "Opcional. Sube logo o archivo de marca si quieres usarlo. Usa PNG, SVG, PDF, AI o EPS si está disponible. Si no tienes logo, elige solo nombre de compañía.",
    uploadReferences: "Referencias / markups / medidas",
    uploadReferencesHelp:
      "Requerido. Sube imágenes de referencia, markups del cliente, screenshots, fotos marcadas, notas de medidas o PDFs que muestren el look deseado, dimensiones clave y áreas problemáticas. Hasta 10 archivos por carga.",
    filesSelected: "archivo(s) seleccionado(s)",
    reviewOnlyNotice:
      "Enviar para revisión no solicita pago. Revisamos los archivos y el alcance seleccionado primero, luego mandamos una factura/link de pago. Quick Photo Concept vence al recibir la factura antes del tiempo de entrega de 1 día hábil. Otros servicios aprobados empiezan después del pago del depósito del 50%; el 50% restante se factura después de entregar los dibujos/entregables.",
    estimatedInvoiceNote:
      "Este es un estimado basado en los servicios seleccionados. La factura final se manda después de la revisión.",
    orderIdLabel: "Order ID",
    estimatedTotalLabel: "Total estimado",
    invoiceNext:
      "Siguiente: revisamos el alcance, los archivos subidos y mandamos una factura/link de pago si todo coincide. Quick Photo Concept se paga de inmediato antes del tiempo de entrega de 1 día hábil. Otros servicios aprobados empiezan después del pago del depósito del 50%; el 50% restante se factura después de entregar los dibujos/entregables. Wave maneja la fecha de vencimiento y los recordatorios de la factura. Si el alcance es diferente, lo ajustamos antes de facturar.",
    tbdOnReview: "Algunas partidas son TBD y se cotizarán después de la revisión.",
    writtenOnlyNote: "Comunicación solo por escrito. No hay soporte telefónico para preguntas de producción.",
    partnerProfileTitle: "Información de compañía / white-label",
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
    desiredDeliveryDate: "Fecha deseada de entrega",
    desiredDeliveryDateHelp: "La entrega urgente todavía depende de nuestra agenda.",
    quickDeliveryFixed: "Quick Photo Concept: normalmente 1 día hábil para pedidos con foto utilizable.",
    clientNameDisplay: "Información del cliente para title block",
    showClientName: "Nombre del cliente para title block",
    hideClientName: "Déjalo vacío si no quieres mostrarlo",
    addressDisplay: "Dirección del cliente para title block",
    addressFull: "Dirección del cliente para title block",
    addressStreet: "Déjalo vacío si no quieres mostrarlo",
    addressProject: "Solo nombre del proyecto",
    addressHide: "No mostrar dirección",
    logoOption: "Opción de logo",
    logoUpload: "Usar logo — subir logo/archivo de marca",
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
    totalDueToday: "Total estimado de factura",
    deposit: "Depósito estimado (70%)",
    remaining: "Balance estimado",
    tbd: "Por definir",
    currentPricedSubtotal: "Estimado actual con precio",
    rushFee: "Cargo urgente",
    tbdHelp:
      "Algunas partidas seleccionadas necesitan revisión antes del precio final. Las partidas con precio fijo muestran un estimado; la factura puede cambiar si los archivos o el alcance no coinciden con el paquete seleccionado.",
    copySummary: "Copiar resumen",
    copied: "Copiado",
    resetCart: "Vaciar carrito",
    cleared: "Vacío",
    confirmReset: "¿Vaciar carrito y borrar la selección actual?",
    generateInvoice: "Enviar proyecto para revisión",
    submitForReview: "Enviar proyecto para revisión",
    uploadAfterPaymentNote: "Revisaremos tus archivos y mandaremos una factura/link de pago antes de empezar.",
    reviewSubmitted: "Proyecto enviado para revisión. Verificaremos el alcance y los archivos, luego mandaremos una factura/link de pago antes de empezar.",
    generating: "Enviando...",
    termsLine:
      "Todos los entregables son solo apoyo de intención de diseño, visualización y coordinación. No son documentos sellados, estampados, listos para permiso, control de construcción, ingeniería, survey legal o cumplimiento de código.",
    safetyTitle: "Nota de alcance",
    safetyText:
      "Ofrecemos visuales de intención de diseño, láminas conceptuales, cleanup de drafting y apoyo de presentación white-label. No ofrecemos ingeniería, survey legal, revisión de código, trámite de permisos, garantía de aprobación, planos sellados/estampados, cálculos estructurales, diseño de utilities o documentos de control de construcción.",
    fillRequired:
      "Completa los campos/archivos requeridos marcados, elige al menos un servicio y confirma un cliente/proyecto antes de enviar.",
    quoteBlocksCheckout:
      "Todos los pedidos se revisan primero. Mandamos la factura/link de pago después de revisar el alcance y los archivos.",
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
      "Paquete de intención de diseño para yard: plano conceptual, dirección de plantación y visuales de presentación para un área de diseño. Estructuras, láminas especiales y workflow profesional 3D están en secciones separadas.",
    startSection: "Apoyo 3D / renders",
    startSectionDesc:
      "Elige primero el camino de base/modelo. Site Visit es un add-on opcional si quieres que recolectemos fotos, notas y medidas aproximadas en sitio. Esto es setup de condiciones existentes para diseño y visualización, no survey ni ingeniería.",
    ideaSection: "Rol de diseño",
    ideaSectionDesc:
      "Elige solo una opción: producimos tu dirección de diseño o lideramos el brief de diseño antes de modelar/renderizar.",
    afterLayout: "Después del layout",
    afterLayoutDesc:
      "Usa esto después de seleccionar la dirección de diseño y cuando ya no esté cambiando. Son láminas de intención de diseño, no planos sellados de construcción.",
    buildSection: "Elige estructura exterior",
    buildSectionDesc:
      "Puedes combinar deck, pérgola / cubierta y cocina exterior cuando pertenecen al mismo cliente/proyecto. Elige solo un tamaño por tipo de estructura. Son paquetes conceptuales y de presentación; ingeniería estructural, revisión de código y permisos quedan con profesionales licenciados/locales.",
    supportSection: "Visita al sitio y urgencia",
    supportSectionDesc:
      "Agrega una visita local si se necesitan medidas de campo. Si el sitio está fuera de los límites de la ciudad, el tiempo extra de traslado puede agregarse a la factura final a $70/hora. La entrega urgente puede estar disponible según agenda.",
    quickSection: "Concepto rápido desde foto",
    quickSectionDesc:
      "Una visual pagada rápida para ayudar a cerrar la venta.",
    specialSection: "Planos y láminas",
    specialSectionDesc:
      "Usa esto cuando el diseño ya existe y necesitas una lámina limpia de intención de diseño para presentación, pricing o conversación con la cuadrilla.",
    citySection: "Apoyo para revisión HOA / jurisdicción",
    citySectionDesc:
      "Usan una base existente, normalmente un master plan limpio. Son exhibits de apoyo solamente: no tramitamos permisos, no garantizamos aprobaciones y no reemplazamos profesionales licenciados.",
    irrigationSection: "Dibujo para irrigadores licenciados",
    irrigationSectionDesc:
      "Cleanup de drafting solo desde markups de un irrigador licenciado. No diseñamos sistemas de irrigación, no calculamos hidráulica y no emitimos especificaciones de instalación.",
    softDependencyMasterPlan:
      "El precio asume que ya existe un master plan limpio u otra base utilizable. Si no, puede hacer falta trabajo extra.",
    softDependencyLayout:
      "El precio asume que el layout principal ya está aprobado. Si todavía falta ese trabajo, primero puede necesitar otro paquete.",
    hardDependencySiteVisit: "Elige primero Visita al sitio.",
    hardDependencyOutsideCity: "Primero agrega Visita al sitio.",
    successTitle: "Proyecto enviado para revisión",
    successText:
      "Recibimos la solicitud del proyecto, servicios seleccionados, archivos y datos white-label. Revisaremos el alcance y mandaremos una factura/link de pago si el paquete seleccionado coincide con los archivos.",
    uploadPhotos: "Fotos del proyecto",
    uploadSurvey: "Survey / site plan / PDFs",
    detailedBrief: "Alcance detallado",
    detailedBriefPlaceholder:
      "Agrega aquí la versión larga del proyecto. Incluye presupuesto, metas del cliente, límites del sitio y cualquier medida que debemos usar.",
    saveIntake: "Guardar intake",
    intakeSaved: "Intake guardado",
    openProjectChat: "Abrir chat del proyecto",
    successNote:
      "Comunicación del proyecto solo por escrito. Usa el formulario de mensajes/updates cuando esté conectado; no ofrecemos soporte por teléfono para preguntas de producción.",
    verifyingPayment: "Verificando el estado del proyecto...",
    previewMode:
      "Modo de vista previa: el endpoint de revisión no está conectado todavía. No se pidió pago y no se creó factura automáticamente.",
    uploadWidgetNote:
      "Los archivos deben recogerse dentro de este intake de SiteForm. Conecta esta sección al storage de uploads antes de lanzar.",
    showcaseBadge: "Pruébalo en un trabajo real",
    showcaseTitle: "Apoyo white-label para profesionales de exterior.",
    showcaseDesc:
      "SiteForm Studio ayuda a builders, equipos de landscape, deck builders, diseñadores y contratistas de exterior a convertir información básica del sitio en apoyo claro para presentar al cliente — bajo tu marca.",
    showcaseWhiteTitle: "Qué significa white-label",
    showcaseWhiteText:
      "Trabajamos detrás de escena. Tu nombre de compañía, logo, estilo de lámina y etiqueta del proyecto pueden aparecer en el PDF, para que tu cliente vea tu marca — no otra compañía de diseño.",
    showcaseHowTitle: "Cómo funciona",
    showcaseHowText:
      "Elige un servicio, sube fotos, medidas, survey, referencias y datos white-label. Revisamos el alcance, confirmamos el estimate y después recibes una factura/link de pago antes de empezar el trabajo.",
    showcaseSafeTitle: "Apoyo de intención de diseño",
    showcaseSafeText:
      "Los entregables son para concepto, presentación, coordinación y apoyo de presupuesto. No hacemos ingeniería, permisos, dibujos sellados/stamped ni garantizamos aprobaciones.",
    showcaseStep1: "Conceptos rápidos desde foto",
    showcaseStep2: "Dibujo + apoyo 3D",
    showcaseStep3: "HOA, cómputos, plantación, hardscape, iluminación",
    showcaseCta: "Nuestros servicios",
    showcaseBrowse: "",
    followTitle: "Seguir / contacto",
    socialInstagram: "Instagram",
    socialFacebook: "Facebook",
    socialTikTok: "TikTok",
    socialYouTube: "YouTube",
    socialEmail: "Email",
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
      "Main plan, planting plan, and presentation renders for one design area.",
    descriptionEs:
      "Plano principal, plano de plantación y renders de presentación para un área de diseño.",
    helper:
      "Best when a contractor needs a yard design under their brand. Structures, extra sheets, and 3D-only work are separate sections.",
    helperEs:
      "Ideal cuando un contractor necesita diseño de patio bajo su marca. Estructuras, láminas extra y trabajo solo 3D van separados.",
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
      "Site visit time, field photos, raw measurements, and field notes for design-intent work.",
    notIncluded:
      "Base plan, 3D model, design work, legal survey, engineering, code review, or travel outside city limits.",
    helper:
      "Choose this together with Base Plan + 3D Model if you want us to build the existing-conditions model from the site visit.",
  },
  {
    id: "onsite-base-model",
    title: "Base Plan + 3D Existing Model with Site Visit",
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
      "Design layout, planting plan, rendering package, legal survey, engineering, code review, permits, or travel outside city limits.",
    helper: "Choose this OR remote base/model OR existing 3D model. It is one starting point, not an add-on.",
  },
  {
    id: "survey-documents-start",
    title: "Base Plan + 3D Existing Model",
    category: "Start",
    icon: Map,
    pricingType: "size",
    prices: { small: 200, medium: 300, large: 450, estate: null },
    stripePriceId: null,
    short:
      "We build a basic 2D base plan and existing-conditions 3D model from your survey, photos, measurements, PDFs, sketches, or field notes.",
    bestFor:
      "Designers and builders who need the site traced into a clean base before design, rendering, or follow-up sheets.",
    youSend:
      "Survey or site plan if available, PDFs, redlines, clear photos, and dimensions marked on photos: width, depth, height, roof/eave-to-ground, house-to-fence distances, and important level changes. If you add Site Visit, we collect the field photos, notes, and rough measurements ourselves.",
    youGet:
      "A basic AutoCAD/DWG-style 2D base plan and a simple 3D existing-conditions model. This is geometry and scale setup, not final materials or detailed render textures.",
    notIncluded:
      "Site visit unless added separately, legal survey work, engineering, code review, permit work, final design, planting plan, detailed render materials, final presentation renders, or construction-control documents.",
    helper: "Choose this OR Your 3D Model, We Render It. Add Site Visit separately if we need to collect the site information.",
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
      "Choose this OR Base Plan + 3D Existing Model. Extra cleanup hours may be discussed and billed only after approval.",
  },
  {
    id: "photo-concept-start",
    title: "One Quick Photo Concept",
    category: "Start",
    icon: Trees,
    pricingType: "flat",
    flatPrice: 99,
    stripePriceId: "price_quickconcept_99",
    short: "Fast concept image to help close the sale.",
    bestFor: "Fast sales before full design work starts.",
    youSend:
      "One clear site photo uploaded with this request, rough dimensions marked on the photo if possible, and a short text about what you want to show.",
    youGet:
      "One concept image and a short list of suggested materials or main features used in the concept.",
    notIncluded:
      "Site visit, accurate site model, construction-ready drawings, engineering, code review, permits, or final design documentation.",
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
    short: "Design-intent plan sheets and 3D visuals for a small deck.",
    bestFor: "Decks under 200 sq.ft that need a clean visual and plan package.",
    youSend:
      "Site plan, preferred location, dimensions, photos, and reference ideas if any.",
    youGet:
      "Deck concept layout, design-intent plan sheets, and 3D visuals for client / HOA discussion.",
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
      "Concept layout, design-intent sheet support, and 3D visuals for a larger deck before licensed engineering or permit work, if required.",
    bestFor:
      "Decks over 200 sq.ft, elevated decks, multi-level decks, or deck scopes that need review before pricing.",
    youSend:
      "Survey, dimensions, preferred layout, photos, and any requirements you already have.",
    youGet:
      "Deck visuals and concept sheets for client, HOA, or licensed professional discussion.",
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
    short: "Design-intent plan sheets and 3D visuals for a small pergola or simple patio cover.",
    bestFor: "Pergolas, patio covers, or shade structures under 200 sq.ft.",
    youSend:
      "Site plan, preferred location, dimensions, roof or shade preference, photos, and reference ideas if any.",
    youGet:
      "Pergola or patio cover concept layout, design-intent plan sheets, and 3D visuals for client / HOA discussion.",
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
      "Concept layout, design-intent sheet support, and 3D visuals for a larger shade or roofed outdoor structure.",
    bestFor:
      "Pergolas, patio covers, attached covers, or larger shade structures over 200 sq.ft that need review before pricing.",
    youSend:
      "Survey, dimensions, photos, roof or cover preferences, attachment notes, and reference images if you have them.",
    youGet:
      "Shade-structure visuals and concept sheets for client, HOA, or licensed professional discussion.",
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
      "Concept layout, design-intent sheet support, and 3D visuals for a small covered parking structure.",
    bestFor:
      "Carports under 200 sq.ft that need a clear concept before licensed engineering or permit work, if required.",
    youSend:
      "Site plan, dimensions, clearance notes, parking needs, photos, and reference images if you have them.",
    youGet:
      "A conceptual carport layout with design-intent sheet support and 3D visuals for review.",
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
      "Concept layout, design-intent sheet support, and 3D visuals for a larger covered parking structure.",
    bestFor:
      "Carports over 200 sq.ft, multi-car covers, attached carports, or scopes that need review before pricing.",
    youSend:
      "Site plan, dimensions, clearance notes, parking needs, photos, and reference images if you have them.",
    youGet:
      "Carport visuals and concept sheets for client, HOA, or licensed professional discussion.",
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
      "Concept layout, design-intent sheet support, approximate appliance zones, working clearances, and 3D visuals.",
    bestFor:
      "You need a clean concept package before detailed utility or shop work.",
    youSend:
      "Site plan, rough wish list, preferred appliance notes, and size limits.",
    youGet:
      "A conceptual outdoor kitchen layout with design-intent sheet support and 3D visuals.",
    notIncluded:
      "Site visit, utility design, gas/electrical/plumbing design, code review, permit documents, appliance specification package, or construction drawings.",
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
      "A manual review and feedback on whether we can help, what design-intent package fits, and what the likely next step or price range should be.",
    notIncluded:
      "Retaining walls, slope-support walls, engineering, code research, permit filing, fabrication details, or final construction documents.",
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
      "Design-intent yard package with a concept plan, planting direction/planting sheet, and presentation visuals for the selected design area.",
    bestFor:
      "Builders or landscape crews who need a clear yard design direction under their brand for a real client budget, without dealing with professional 3D/model workflow details.",
    youSend:
      "Survey or site plan if available, clear photos, marked measurements, budget level, style references, client must-haves, and site constraints. If there is no site visit, dimensions are required: widths, depths, heights, roof/eave-to-ground, house-to-fence distances, and important level changes.",
    youGet:
      "Design-intent concept plan for the selected design area, planting direction / planting sheet, general dimensions where helpful, presentation visuals, and a client-ready PDF.",
    notIncluded:
      "Separate outdoor structures such as decks, pergolas, carports, outdoor kitchens; detailed specialty sheets; lighting design; irrigation design; grading/drainage engineering; permit-ready drawings; sealed/stamped documents; code review; or construction-control drawings.",
    helper:
      "For decks, pergolas, patio covers, carports, kitchens, or custom built structures, use Decks, Covers & Outdoor Structures. For extra sheets after the design, use Plans & Sheets. If you are a designer and want 3D/model/render workflow support, use 3D & Rendering Support.",
  },
];

const DESIGN_DIRECTION_SERVICES: Service[] = [
  {
    id: "draw-your-idea",
    title: "Your Design Direction, Our Production",
    category: "Design role",
    icon: Wrench,
    pricingType: "size",
    prices: { small: 500, medium: 800, large: 1300, estate: null },
    stripePriceId: null,
    short:
      "You bring the idea, references, layout direction, markups, and notes. We turn your direction into clean 3D production and visuals.",
    bestFor:
      "Contractors or designers who already know what should happen and need us to model and present it cleanly.",
    youSend:
      "Your layout idea, sketches, marked photos, reference images, links, notes about what to model, material direction, dimensions, and examples of the look or planning logic you want us to follow.",
    youGet:
      "A clean production model / visual direction based on your instructions, with review visuals ready to move toward presentation rendering.",
    notIncluded:
      "Leading the design from scratch, client design meetings, engineering, permit drawings, detailed production sheets, takeoffs, or separate structure packages unless ordered separately.",
    helper:
      "Use this when the design direction is yours and our job is to execute it cleanly. Decks, pergolas, carports, kitchens, or other built structures may still need the outdoor structures section if they require their own package.",
  },
  {
    id: "help-design-it",
    title: "We Lead the Design",
    category: "Design role",
    icon: Sparkles,
    pricingType: "size",
    prices: { small: 1000, medium: 1500, large: 2200, estate: null },
    stripePriceId: null,
    short:
      "We take the lead on design direction before the model/render stage instead of only drafting a fixed idea.",
    bestFor:
      "Contractors who want us to solve the design direction, but still need the work kept under their brand.",
    youSend:
      "Survey, measurements, photos, style references, must-haves, rough budget level, site constraints, and a remote video brief with the partner or client-side contact present.",
    youGet:
      "Design brief work, reference selection, sketch options, design development, final design direction, and a clear path into modeling/rendering.",
    notIncluded:
      "Engineering, permit packages, sealed/stamped drawings, planting plans, takeoffs, detailed production sheets, code review, or acting as the direct client-facing designer unless agreed separately.",
    helper:
      "A partner or client-side contact must attend the remote design brief so the client discussion does not turn into a broken telephone. We can lead design, but the white-label partner stays connected to the client conversation.",
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
      "A clean 2D design-intent master plan from your documents or from a layout we already produced.",
    bestFor: "You need one clear main plan sheet for presentation, pricing, or crew coordination.",
    youSend:
      "If we already created the layout, no extra files are needed. If not, send your approved plan, model, redlines, or source documents.",
    youGet: "A clean 2D design-intent master plan ready to print and share for coordination.",
    notIncluded: "New concept design, engineering, code review, permit filing, or approval guarantee.",
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
      "Planting design-intent sheet from your documents or from a layout we already produced.",
    bestFor: "Planting is moving forward and the crew needs a clean sheet.",
    youSend:
      "If we already built the layout, no extra base files are needed. If not, send the approved plan and plant direction or list.",
    youGet:
      "A planting plan with schedule and quantities, ready to print and share for coordination.",
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
      "A clean hardscape design-intent sheet showing paving layout, material zones, and pattern logic where needed.",
    bestFor:
      "Hardscape is approved and now needs one dedicated paving and material sheet.",
    youSend:
      "If we already built the layout, no extra base files are needed. If not, send the approved plan, materials, and any paving pattern notes.",
    youGet:
      "A hardscape design-intent sheet showing layout, materials, paving patterns, and tile or paver direction where needed.",
    notIncluded:
      "Engineering, structural base design, drainage engineering, code review, installation details, or construction-control documents.",
    sampleLabel: "See sample",
    softDependency: ["master-plan"],
    allowWithoutDependency: true,
  },
  {
    id: "grading",
    title: "Slope / Drainage Concept Notes",
    category: "After layout",
    icon: DraftingCompass,
    pricingType: "size",
    prices: { small: 500, medium: 700, large: 1000, estate: null },
    stripePriceId: null,
    short:
      "Non-engineered slope and drainage concept notes based on topo or measured elevations.",
    bestFor:
      "The site needs slope or drainage thinking after the main layout is approved.",
    youSend:
      "Topo survey or measured elevations, approved design, and scope of improvements. If no topo exists yet, request a site visit or bring measured data first.",
    youGet:
      "A design-intent slope / drainage concept sheet, ready to discuss with the crew or hand off to a licensed professional if needed.",
    notIncluded:
      "Civil engineering, sealed/stamped grading plans, drainage calculations, final grading design, code review, or work made without usable elevation information.",
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
      "A simple plant watering approach for approved planting areas, for planning discussion only.",
    bestFor:
      "You want clear understanding of sun zones, shade zones, and plant watering needs before a licensed irrigation professional designs the system.",
    youSend:
      "Approved plan, planting direction, and any known notes about shade, sun exposure, or difficult areas.",
    youGet:
      "Sun and shade zone notes, watering logic by area, and general recommendations such as drip or other basic approach where appropriate.",
    notIncluded:
      "Pipe sizing, head layout, irrigation specifications, hydraulic design, installation diagrams, or replacement of a licensed irrigator's work.",
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
      "A conceptual lighting layer for discussion, plus bonus night views when our model already exists.",
    notIncluded:
      "Electrical design, wiring plans, code review, fixture specifications, or installation drawings.",
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
      "Estimated material quantities and dimensions from an approved 3D or 2D design.",
    bestFor: "The scope is clear and you are ready to price the job.",
    youSend:
      "Approved plan or model if it comes from your side. If we built it, no extra files are needed.",
    youGet:
      "Estimated quantities and dimensions based on the approved scope, delivered in Google Sheets. Tell us what format works best for your team.",
    notIncluded: "Purchasing, vendor follow-up, field verification, waste factors, or guarantee that quantities match final field installation.",
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
    title: "HOA / Jurisdiction Review Support Sheet",
    category: "City",
    icon: ShieldCheck,
    pricingType: "size",
    prices: { small: 300, medium: 400, large: 600, estate: null },
    stripePriceId: null,
    short: "Add-on review-support sheet from an approved master plan and survey.",
    bestFor:
      "Jobs that already have a clean master plan and need a design-intent exhibit for HOA or jurisdiction review.",
    youSend:
      "Approved master plan, survey, and any HOA/jurisdiction checklist or notes you already have.",
    youGet:
      "A design-intent review-support sheet, ready to print and include in your own submission package if appropriate.",
    notIncluded:
      "Approval guarantee, permit filing by us, code review, engineering, architecture, landscape-architecture stamp, or legal survey work.",
    sampleLabel: "See sample",
    softDependency: ["master-plan"],
    allowWithoutDependency: true,
  },
  {
    id: "impervious",
    title: "Impervious Cover Exhibit / Estimate",
    category: "City",
    icon: FileText,
    pricingType: "size",
    prices: { small: 300, medium: 450, large: 650, estate: null },
    stripePriceId: null,
    short:
      "Impervious cover exhibit / estimate prepared from a master plan and survey information provided to us.",
    bestFor:
      "Jobs where the team needs a design-support estimate of existing and proposed impervious cover for review.",
    youSend:
      "Survey, existing hardscape information, and approved master plan or improvements.",
    youGet: "Impervious cover exhibit and estimate summary.",
    notIncluded: "Engineering certification, legal survey verification, code determination, permit filing, or approval guarantee.",
    sampleLabel: "See sample",
    softDependency: ["master-plan"],
    allowWithoutDependency: true,
  },
  {
    id: "tree-overlay",
    title: "Tree / CRZ Visual Overlay",
    category: "City",
    icon: Trees,
    pricingType: "size",
    prices: { small: 500, medium: 700, large: 1000, estate: null },
    stripePriceId: null,
    short:
      "Add-on tree / CRZ visual overlay based on certified tree data and a clean master plan.",
    bestFor:
      "Projects where protected trees need to be shown clearly for discussion or review.",
    youSend:
      "Certified tree survey or tree inventory plus approved master plan references.",
    youGet: "A tree preservation / CRZ visual overlay sheet.",
    notIncluded:
      "Arborist report, tree measurements by us, code determination, or legal determination by the jurisdiction.",
    sampleLabel: "See sample",
    softDependency: ["master-plan"],
    allowWithoutDependency: true,
  },
];

const IRRIGATION_SERVICES: Service[] = [
  {
    id: "irrigation-drafting",
    title: "Irrigation Drafting Cleanup from Your Markups",
    category: "Irrigation",
    icon: Droplets,
    pricingType: "size",
    prices: { small: 100, medium: 200, large: 400, estate: null },
    stripePriceId: null,
    quantityEnabled: true,
    quantityLabel: "sheets",
    short: "Drafting cleanup only from irrigation markups or paper layout provided by a licensed irrigator.",
    bestFor:
      "Licensed irrigators who already know the irrigation layout and just need it cleaned up on screen.",
    youSend: "Field markups, hand sketches, redlines, and any base files.",
    youGet:
      "Clean computer-drafted irrigation sheets from your markups, ready to share for coordination.",
    notIncluded:
      "Irrigation design, engineering, hydraulic calculations, code review, installation specifications, or replacement of a licensed irrigator's design work.",
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
      "Jobs that need field photos and rough measurements before concept, structure, or specialty sheet work.",
    youSend:
      "Site address, access details, and what needs to be checked.",
    youGet:
      "Site visit time, field photos, raw measurements, and field notes for design-intent work.",
    notIncluded:
      "Base plan, 3D model, design work, legal survey, engineering, code review, or travel outside city limits.",
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

function formatPhoneInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
}

const PARTNER_STORAGE_KEY = "scopebuilder_partner_profile_v1";

function emptyContact(): OrderContact {
  return {
    clientName: "",
    customerEmail: "",
    customerPhone: "",
    projectAddress: "",
    clientTitleBlockName: "",
    clientTitleBlockAddress: "",
    notes: "",
    measurementObject: "",
    measurementWidth: "",
    measurementLength: "",
    measurementHeight: "",
    measurementsNotes: "",
    referenceLinks: "",
    partnerProfileMode: "new",
    whiteLabelCompany: "",
    whiteLabelPhone: "",
    whiteLabelEmail: "",
    whiteLabelWebsite: "",
    desiredDeliveryDate: "",
    clientNameDisplay: "show",
    addressDisplay: "street",
    logoOption: "upload",
    titleBlockOption: "standard-landscape",
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
      clientTitleBlockName: "",
      clientTitleBlockAddress: "",
      notes: "",
      measurementObject: "",
      measurementWidth: "",
      measurementLength: "",
      measurementHeight: "",
      measurementsNotes: "",
      referenceLinks: "",
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
    titleBlockOption: contact.titleBlockOption,
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
    client_name_for_title_block: sanitizeText(contact.clientTitleBlockName),
    client_address_for_title_block: sanitizeText(contact.clientTitleBlockAddress),
    logo_option: contact.logoOption,
    title_block_option: contact.titleBlockOption,
    branding_notes: sanitizeText(contact.brandingNotes),
    same_client_project_confirmed: contact.sameProjectConfirmed,
    remembered_on_device: contact.rememberPartnerInfo,
  };
}

function emptyProjectFiles(): ProjectFileUploads {
  return {
    photos: null,
    surveyDocs: null,
    titleBlockFiles: null,
    logoFiles: null,
    references: null,
  };
}

function hasAnyProjectFile(files: ProjectFileUploads) {
  return Boolean(
    files.photos?.length ||
      files.surveyDocs?.length ||
      files.titleBlockFiles?.length ||
      files.logoFiles?.length ||
      files.references?.length
  );
}

function hasRequiredProjectFiles(files: ProjectFileUploads, requireSurvey: boolean, requirePhoto: boolean) {
  const hasReferences = Boolean(files.references?.length);
  const hasSurvey = !requireSurvey || Boolean(files.surveyDocs?.length);
  const hasPhoto = !requirePhoto || Boolean(files.photos?.length);
  return hasReferences && hasSurvey && hasPhoto;
}

function summarizeFileList(files: FileList | null) {
  if (!files?.length) return [];
  return Array.from(files).map((file) => ({
    name: file.name,
    size: file.size,
    type: file.type,
  }));
}

function buildFileSummary(files: ProjectFileUploads) {
  return {
    photos: summarizeFileList(files.photos),
    survey_docs: summarizeFileList(files.surveyDocs),
    title_block_files: summarizeFileList(files.titleBlockFiles),
    logo_files: summarizeFileList(files.logoFiles),
    references: summarizeFileList(files.references),
  };
}

function appendFileList(formData: FormData, key: string, files: FileList | null) {
  if (!files?.length) return;
  Array.from(files).forEach((file) => formData.append(key, file as File));
}

function appendProjectFiles(formData: FormData, files: ProjectFileUploads) {
  appendFileList(formData, "photos", files.photos);
  appendFileList(formData, "survey_docs", files.surveyDocs);
  appendFileList(formData, "title_block_files", files.titleBlockFiles);
  appendFileList(formData, "logo_files", files.logoFiles);
  appendFileList(formData, "references", files.references);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error || new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

async function serializeFileList(files: FileList | null) {
  if (!files?.length) return [];
  const maxFileSize = 12 * 1024 * 1024;
  const safeFiles = Array.from(files).slice(0, 10);

  return Promise.all(
    safeFiles.map(async (file) => {
      if (file.size > maxFileSize) {
        throw new Error(
          `${file.name} is too large for this first-version uploader. Please reduce/compress the file and try again. For phone photos, export or send a smaller JPG version. You can note in Project details if high-resolution files are available. Current upload limit: 12 MB per file.`
        );
      }

      return {
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        data: await fileToDataUrl(file),
      };
    })
  );
}

async function buildProjectFilePayload(files: ProjectFileUploads) {
  return {
    photos: await serializeFileList(files.photos),
    survey_docs: await serializeFileList(files.surveyDocs),
    title_block_files: await serializeFileList(files.titleBlockFiles),
    logo_files: await serializeFileList(files.logoFiles),
    references: await serializeFileList(files.references),
  };
}

async function submitOrderForReview(order: Record<string, unknown>, files: ProjectFileUploads) {
  const filePayload = await buildProjectFilePayload(files);

  const response = await fetch(ORDER_REVIEW_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      order,
      files: filePayload,
    }),
  });

  const text = await response.text();
  let data: { ok?: boolean; orderId?: string; folderUrl?: string; error?: string } = {};

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("The order endpoint responded, but the response was not valid JSON.");
  }

  if (!response.ok || !data.ok) {
    throw new Error(data.error || "The order could not be saved. Please try again.");
  }

  return data;
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
    youGet: "Tiempo de visita, fotos de campo, medidas en bruto y notas de campo para trabajo de intención de diseño.",
    notIncluded: "Plano base, modelo 3D, trabajo de diseño, survey legal, ingeniería, revisión de código o traslado fuera de los límites de la ciudad.",
    helper: "Elige esto junto con Plano base + modelo 3D si quieres que construyamos el modelo de condiciones existentes a partir de la visita.",
  },
  "onsite-base-model": {
    title: "Visita al sitio + plano base + modelo 3D",
    category: "Inicio",
    short: "Visitamos el sitio y construimos un plano base 2D y un modelo 3D básico de condiciones existentes, sin agregar diseño todavía.",
    bestFor: "Flujos profesionales donde se necesitan mediciones en campo antes del diseño, render o láminas de seguimiento.",
    youSend: "Dirección o punto de reunión, detalles de acceso y cualquier información ya conocida sobre la propiedad.",
    youGet: "Visita local, fotos/notas de campo, plano base 2D y modelo 3D de condiciones existentes.",
    notIncluded: "Diseño de layout, planting plan, paquete de renders, survey legal, ingeniería, revisión de código, permisos o traslado fuera de los límites de la ciudad.",
    helper: "Elige esto O base remota/modelo O modelo 3D existente. Es un punto de inicio, no un add-on.",
  },
  "survey-documents-start": {
    title: "Plano base + modelo 3D existente",
    category: "Inicio",
    short: "Construimos un plano base 2D y un modelo 3D básico de condiciones existentes desde survey, fotos, medidas, PDFs, sketches o notas de campo.",
    bestFor: "Diseñadores y builders que necesitan una base limpia del sitio antes de diseño, render o láminas de seguimiento.",
    youSend: "Survey o site plan si existe, PDFs, redlines, fotos claras y medidas marcadas en fotos: ancho, profundidad, altura, altura de techo/eave al piso, distancias de casa a fence y cambios de nivel importantes. Si agregas visita al sitio, nosotros recogemos fotos, notas y medidas aproximadas en campo.",
    youGet: "Un plano base 2D estilo AutoCAD/DWG y un modelo 3D simple de condiciones existentes. Esto es geometría y escala, no materiales finales ni texturas detalladas para render.",
    notIncluded: "Visita al sitio salvo que se agregue aparte, survey legal, ingeniería, revisión de código, permisos, diseño final, planting plan, materiales detallados de render, renders finales de presentación o documentos de control de construcción.",
    helper: "Elige esto O Tú mandas el modelo 3D, nosotros lo renderizamos. Agrega visita al sitio aparte si necesitamos recoger la información del sitio.",
  },
  "client-model-start": {
    title: "Tú mandas el modelo 3D, nosotros lo renderizamos",
    category: "Inicio",
    short: "Tú mandas un modelo ya construido; lo revisamos, lo preparamos para render y lo usamos para las visuales.",
    bestFor: "Trabajos donde el modelo ya existe y principalmente necesita preparación de render, materiales y presentación.",
    youSend: "Un modelo 3D listo para render, links o referencias JPG de materiales, notas y cualquier survey o PDF que ayude a revisarlo.",
    youGet: "Revisión del modelo, setup de render, aplicación de materiales desde tus referencias y vistas renderizadas. Cuando el modelo esté listo, se pueden probar materiales sin un límite fijo.",
    notIncluded: "Limpieza pesada del modelo, reconstrucción de geometría faltante, creación de materiales desde cero o diseño que no exista ya en el modelo.",
    helper: "Elige esto O Plano base + modelo 3D existente. Cualquier hora extra de limpieza se conversa y se cobra solo con aprobación.",
  },
  "photo-concept-start": {
    title: "Una imagen conceptual rápida",
    category: "Inicio",
    short: "Imagen conceptual rápida pagada para ayudar a cerrar la venta.",
    bestFor: "Ventas rápidas antes de empezar un diseño completo.",
    youSend: "Una foto clara del sitio después del pago, medidas aproximadas marcadas en la foto si es posible y un texto corto sobre lo que quieres mostrar.",
    youGet: "Una imagen conceptual y una lista corta de materiales sugeridos o elementos principales usados en el concepto.",
    notIncluded: "Visita al sitio, modelo exacto del sitio, planos listos para construcción, ingeniería, revisión de código, permisos o documentación final de diseño.",
    sampleLabel: "Ver ejemplo",
    badgeLabel: "Más pedido",
  },
  "deck-small": {
    title: "Paquete de deck pequeño, menos de 200 pies²",
    category: "Construcción",
    short: "Láminas de intención de diseño y visuales 3D para un deck pequeño.",
    bestFor: "Decks de menos de 200 pies² que necesitan un paquete visual y de planos limpio.",
    youSend: "Site plan, ubicación preferida, dimensiones e ideas de referencia si las tienes.",
    youGet: "Layout conceptual del deck, láminas de intención de diseño y visuales 3D para conversación con cliente / HOA.",
    notIncluded: "Visita al sitio, ingeniería estructural, planos sellados o trámite de permisos por nuestra parte.",
    helper: "Este paquete no incluye visita al sitio. Agrega Visita al sitio si se necesitan mediciones en campo.",
    sampleLabel: "Ver ejemplo",
  },
  "pergola-small": {
    title: "Paquete de pérgola / cubierta pequeña, menos de 200 pies²",
    category: "Construcción",
    short: "Láminas de intención de diseño y visuales 3D para una pérgola pequeña o cubierta sencilla.",
    bestFor: "Pérgolas, patio covers o estructuras de sombra de menos de 200 pies².",
    youSend: "Site plan, ubicación preferida, dimensiones, preferencia de techo o sombra, fotos e ideas de referencia si las tienes.",
    youGet: "Layout conceptual de pérgola o cubierta, láminas de intención de diseño y visuales 3D para conversación con cliente / HOA.",
    notIncluded: "Visita al sitio, ingeniería estructural, planos sellados, detalles de conexión de techo o trámite de permisos por nuestra parte.",
    helper: "Este paquete no incluye visita al sitio. Agrega Visita al sitio si se necesitan mediciones en campo.",
    sampleLabel: "Ver ejemplo",
  },
  "carport-small": {
    title: "Carport pequeño, menos de 200 pies² — revisar primero",
    category: "Construcción",
    short: "Layout conceptual, apoyo de láminas de intención de diseño y visuales 3D para una estructura pequeña de estacionamiento cubierto.",
    bestFor: "Carports de menos de 200 pies² que necesitan un concepto claro antes de ingeniería o permisos.",
    youSend: "Site plan, dimensiones, notas de altura libre, necesidades de estacionamiento, fotos e imágenes de referencia si las tienes.",
    youGet: "Un layout conceptual de carport con apoyo de láminas de intención de diseño y visuales 3D para revisión.",
    notIncluded: "Visita al sitio, ingeniería estructural, planos sellados para permiso, coordinación de utilities o trámite de permisos por nuestra parte.",
    helper: "Revisar primero. Agrega Visita al sitio si se necesitan mediciones en campo.",
    sampleLabel: "Ver ejemplo",
  },
  "carport-large": {
    title: "Carport grande, más de 200 pies² — cotización",
    category: "Construcción",
    short: "Layout conceptual, apoyo de láminas de intención de diseño y visuales 3D para una estructura grande de estacionamiento cubierto.",
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
    short: "Layout conceptual, apoyo de láminas de intención de diseño y visuales 3D para un deck grande antes de ingeniería licenciada o permisos, si hacen falta.",
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
    short: "Layout conceptual, apoyo de láminas de intención de diseño y visuales 3D para una estructura grande de sombra o cubierta exterior.",
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
    short: "Layout conceptual, apoyo de lámina de intención de diseño, zonas aproximadas de appliances, clearances de trabajo y visuales 3D.",
    bestFor: "Cuando necesitas un paquete conceptual limpio antes del trabajo detallado de utilities o shop drawings.",
    youSend: "Site plan, lista general de deseos, notas de appliances preferidos y límites de tamaño.",
    youGet: "Un layout conceptual de cocina exterior con apoyo de lámina de intención de diseño y visuales 3D.",
    notIncluded: "Visita al sitio, diseño de utilities, diseño de gas/electric/plumbing, revisión de código, documentos de permiso, paquete de especificaciones de appliances o planos de construcción.",
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
    notIncluded: "Muros de contención, muros de soporte de pendiente, ingeniería, investigación de código, trámites de permiso, detalles de fabricación o planos finales de construcción.",
    helper: "Elige esto cuando el feature es inusual. Los muros de contención y muros reales de soporte de pendiente pertenecen a un proceso separado de diseño/revisión, no aquí.",
  },
  "full-yard-concept-site": {
    title: "Concepto de landscape para todo el patio — con visita",
    category: "Paquete",
    short: "Paquete inicial sencillo cuando quieres que revisemos el sitio, entendamos el patio y propongamos un concepto de landscape.",
    bestFor: "Constructores o crews de landscape que necesitan dirección clara de diseño bajo su marca para un presupuesto real de cliente, sin meterse en workflow profesional de 3D/modelo.",
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
  "yard-design-package": {
    title: "Paquete de diseño de patio",
    category: "Diseño",
    short: "Paquete de diseño con plano principal, plano de plantación y renders de presentación para el área seleccionada.",
    bestFor: "Constructores o crews de landscape que necesitan un diseño claro bajo su marca para un presupuesto real del cliente, sin elegir pasos técnicos de modelo 3D.",
    youSend: "Survey o site plan si existe, fotos claras, medidas marcadas, nivel de presupuesto, referencias de estilo, must-haves del cliente y restricciones del sitio. Si no hay visita, las dimensiones son requeridas: anchos, profundidades, alturas, altura de techo/eave al piso, distancias de casa a fence y cambios de nivel importantes.",
    youGet: "Plano conceptual principal para el área seleccionada, plano/dirección de plantación, dimensiones simples donde hagan falta, renders de presentación y PDF listo para cliente.",
    notIncluded: "Estructuras separadas como decks, pérgolas, cubiertas, carports o cocinas exteriores; láminas especiales detalladas; diseño de iluminación; diseño de riego; ingeniería de grading/drainage; planos listos para permiso; documentos sellados/estampados; revisión de código; o planos de control de construcción.",
    helper: "Para decks, pérgolas, cubiertas, carports, cocinas o estructuras construidas, usa Decks, cubiertas y estructuras exteriores. Para láminas extra después del diseño, usa Planos y láminas. Si eres diseñador y quieres apoyo de modelo/render/3D, usa Apoyo 3D y renders.",
  },
  "draw-your-idea": {
    title: "Tu dirección de diseño, nuestra producción",
    category: "Rol de diseño",
    short: "Tú traes la idea, referencias, dirección de layout, markups y notas. Nosotros convertimos esa dirección en producción 3D limpia y visuales.",
    bestFor: "Contratistas o diseñadores que ya saben qué debe pasar y necesitan que lo modelemos y presentemos limpiamente.",
    youSend: "Tu idea de layout, sketches, fotos marcadas, imágenes de referencia, links, notas sobre qué modelar, dirección de materiales, dimensiones y ejemplos del look o lógica de planificación que quieres seguir.",
    youGet: "Un modelo / dirección visual limpia basada en tus instrucciones, con visuales de revisión listas para avanzar al render final.",
    notIncluded: "Liderar el diseño desde cero, reuniones de diseño con el cliente, ingeniería, planos de permiso, láminas detalladas, takeoffs o paquetes separados de estructuras salvo que se pidan aparte.",
    helper: "Usa esto cuando la dirección de diseño es tuya y nuestro trabajo es ejecutarla limpiamente. Decks, pérgolas, carports, cocinas u otras estructuras pueden necesitar la sección de estructuras exteriores si requieren su propio paquete.",
  },
  "help-design-it": {
    title: "Nosotros lideramos el diseño",
    category: "Rol de diseño",
    short: "Tomamos la dirección de diseño antes de la etapa de modelo/render, no solo dibujamos una idea fija.",
    bestFor: "Contratistas que quieren que resolvamos la dirección de diseño, pero manteniendo el trabajo bajo su marca.",
    youSend: "Survey, medidas, fotos, referencias de estilo, must-haves, nivel aproximado de presupuesto, restricciones del sitio y un brief remoto por video con el partner o contacto del cliente presente.",
    youGet: "Trabajo de brief, selección de referencias, opciones de sketch, desarrollo de diseño, dirección final y camino claro hacia modelado/render.",
    notIncluded: "Ingeniería, paquete de permisos, planos sellados/estampados, planting plans, takeoffs, láminas detalladas, revisión de código o actuar como diseñador directo frente al cliente salvo acuerdo separado.",
    helper: "Un partner o contacto del cliente debe estar presente en el brief remoto para evitar teléfono descompuesto. Podemos liderar el diseño, pero el partner white-label sigue conectado a la conversación con el cliente.",
  },
  "master-plan": {
    title: "Master plan limpio 2D",
    category: "Después del layout",
    short: "Un master plan 2D limpio de intención de diseño desde tus documentos o desde un layout que ya produjimos.",
    bestFor: "Cuando necesitas una lámina principal clara para presentación, pricing o coordinación con la cuadrilla.",
    youSend: "Si ya creamos el layout, no hacen falta archivos extra. Si no, manda tu plano aprobado, modelo, redlines o documentos fuente.",
    youGet: "Un master plan 2D limpio de intención de diseño, listo para imprimir y compartir para coordinación.",
    notIncluded: "Nuevo diseño conceptual, ingeniería, revisión de código, trámite de permisos o garantía de aprobación.",
    helper: "Si los documentos fuente vienen de fuera de nuestro proceso y necesitan limpieza primero, puede hacer falta tiempo adicional o una cotización aparte.",
    sampleLabel: "Ver ejemplo",
  },
  "planting-plan": {
    title: "Plano de plantación + lista de plantas",
    category: "Después del layout",
    short: "Lámina de intención de diseño de plantación desde tus documentos o desde un layout que ya produjimos.",
    bestFor: "Cuando la plantación va a avanzar y la cuadrilla necesita una lámina limpia de coordinación.",
    youSend: "Si ya construimos el layout, no hacen falta archivos base extra. Si no, manda el plano aprobado y la dirección o lista de plantas.",
    youGet: "Un plano de plantación con schedule y cantidades, listo para imprimir y compartir para coordinación.",
    notIncluded: "Búsqueda en viveros, diseño de irrigación o exploración de un nuevo layout.",
    helper: "Si los documentos base no fueron creados por nosotros y necesitan limpieza antes de documentar la plantación, puede hacer falta tiempo adicional o una cotización aparte.",
    sampleLabel: "Ver ejemplo",
  },
  "paving-plan": {
    title: "Plano de hardscape / patrón de pavimento",
    category: "Después del layout",
    short: "Una lámina limpia de intención de diseño de hardscape que muestra layout de pavimento, zonas de materiales y lógica de patrón donde haga falta.",
    bestFor: "Cuando el hardscape ya está aprobado y ahora necesita una lámina dedicada de pavimento y materiales.",
    youSend: "Si ya construimos el layout, no hacen falta archivos base extra. Si no, manda el plano aprobado, materiales y notas de patrón de pavimento.",
    youGet: "Una lámina de intención de diseño de hardscape con layout, materiales, patrones de pavimento y dirección de tile o pavers donde haga falta.",
    notIncluded: "Ingeniería, diseño de base estructural, ingeniería de drenaje, revisión de código, detalles de instalación o documentos de control de construcción.",
    sampleLabel: "Ver ejemplo",
  },
  "grading": {
    title: "Notas conceptuales de pendiente / drenaje",
    category: "Después del layout",
    short: "Notas conceptuales no ingenieriles de pendiente y drenaje basadas en topo o elevaciones medidas.",
    bestFor: "Cuando el sitio necesita pensar pendiente o drenaje después de aprobar el layout principal.",
    youSend: "Topographic survey o elevaciones medidas, diseño aprobado y alcance de mejoras. Si todavía no hay topo, pide una visita o trae datos medidos primero.",
    youGet: "Una lámina conceptual de intención de diseño de pendiente / drenaje, lista para conversar con la cuadrilla o entregar a un profesional licenciado si hace falta.",
    notIncluded: "Ingeniería civil, planos sellados/estampados de grading, cálculos de drenaje, diseño final de grading, revisión de código o trabajo sin información útil de elevaciones.",
    helper: "No podemos adivinar pendientes. Este servicio necesita topo o elevaciones reales medidas.",
    sampleLabel: "Ver ejemplo",
  },
  "watering-strategy": {
    title: "Estrategia básica de riego",
    category: "Después del layout",
    short: "Enfoque básico de riego de plantas para áreas de plantación aprobadas, solo para discusión de planificación.",
    bestFor: "Cuando quieres entender zonas de sol, sombra y necesidades de agua antes de que un profesional licenciado de irrigación diseñe el sistema.",
    youSend: "Plano aprobado, dirección de plantación y notas conocidas sobre sombra, sol o áreas difíciles.",
    youGet: "Notas de zonas de sol y sombra, lógica general de riego por área y recomendaciones generales como drip u otro enfoque básico donde aplique.",
    notIncluded: "Dimensionamiento de tubería, layout de heads, specs de irrigación, diseño hidráulico, diagramas de instalación o reemplazo del trabajo de un irrigador licenciado.",
    sampleLabel: "Ver ejemplo",
  },
  "lighting": {
    title: "Concepto de iluminación",
    category: "Después del layout",
    short: "Concepto 2D de iluminación. Si ya tenemos el modelo de diseño, las vistas nocturnas van como bonus.",
    bestFor: "Cuando el diseño aprobado necesita agregar una capa de iluminación.",
    youSend: "Si ya construimos el layout, no hacen falta archivos base extra. Si no, manda el plano aprobado, puntos focales y dirección de iluminación si la tienes.",
    youGet: "Una capa conceptual de iluminación para discusión, más vistas nocturnas bonus cuando ya existe nuestro modelo.",
    notIncluded: "Diseño eléctrico, planos de cableado, revisión de código, especificaciones de fixtures o planos de instalación.",
    sampleLabel: "Ver ejemplo",
  },
  "takeoff": {
    title: "Cantidades de materiales / take-off",
    category: "Después del layout",
    short: "Estimado de cantidades y dimensiones de materiales desde un diseño 3D o 2D aprobado.",
    bestFor: "Cuando el alcance está claro y estás listo para poner precio al trabajo.",
    youSend: "Plano o modelo aprobado si viene de tu lado. Si lo construimos nosotros, no hacen falta archivos extra.",
    youGet: "Cantidades y dimensiones estimadas basadas en el alcance aprobado, entregadas en Google Sheets. Dinos qué formato le funciona mejor a tu equipo.",
    notIncluded: "Compras, seguimiento con proveedores, verificación en campo, waste factors o garantía de que las cantidades coinciden con la instalación final.",
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
    title: "Lámina de apoyo para revisión HOA / jurisdicción",
    category: "Ciudad",
    short: "Lámina add-on de apoyo para revisión desde un master plan aprobado y survey.",
    bestFor: "Trabajos que ya tienen un master plan limpio y necesitan un exhibit de intención de diseño para revisión HOA o jurisdicción.",
    youSend: "Master plan aprobado, survey y cualquier checklist o nota de HOA/jurisdicción que ya tengas.",
    youGet: "Una lámina de apoyo para revisión de intención de diseño, lista para imprimir e incluir en tu propio paquete de submission si aplica.",
    notIncluded: "Garantía de aprobación, trámite de permisos por nuestra parte, revisión de código, ingeniería, arquitectura, sello de landscape architecture o survey legal.",
    sampleLabel: "Ver ejemplo",
  },
  "impervious": {
    title: "Exhibit / estimado de cobertura impermeable",
    category: "Ciudad",
    short: "Exhibit / estimado de cobertura impermeable preparado desde master plan y datos de survey proporcionados.",
    bestFor: "Trabajos donde el equipo necesita un estimado de apoyo de cobertura impermeable existente y propuesta para revisión.",
    youSend: "Survey, información de hardscape existente y master plan o mejoras aprobadas.",
    youGet: "Exhibit de cobertura impermeable y resumen estimado.",
    notIncluded: "Certificación de ingeniería, verificación de survey legal, determinación de código, trámite de permisos o garantía de aprobación.",
    sampleLabel: "Ver ejemplo",
  },
  "tree-overlay": {
    title: "Overlay visual de árboles / CRZ",
    category: "Ciudad",
    short: "Overlay visual add-on de árboles / CRZ basado en datos certificados de árboles y un master plan limpio.",
    bestFor: "Proyectos donde árboles protegidos deben mostrarse claramente para conversación o revisión.",
    youSend: "Survey certificado de árboles o inventario de árboles, más referencias de master plan aprobado.",
    youGet: "Una lámina visual de preservación de árboles / overlay de CRZ.",
    notIncluded: "Reporte de arborista, medición de árboles por nuestra parte, determinación de código o determinación legal de la jurisdicción.",
    sampleLabel: "Ver ejemplo",
  },
  "irrigation-drafting": {
    title: "Cleanup de drafting de irrigación desde tus markups",
    category: "Irrigación",
    quantityLabel: "láminas",
    short: "Cleanup de drafting solo desde markups de irrigación o layout en papel proporcionado por un irrigador licenciado.",
    bestFor: "Irrigadores licenciados que ya conocen el layout de irrigación y solo necesitan limpiarlo en pantalla.",
    youSend: "Markups de campo, sketches hechos a mano, redlines y cualquier archivo base.",
    youGet: "Láminas de irrigación limpias dibujadas en computadora desde tus markups, listas para compartir para coordinación.",
    notIncluded: "Diseño de irrigación, ingeniería, cálculos hidráulicos, revisión de código, especificaciones de instalación o reemplazo del trabajo de diseño de un irrigador licenciado.",
    sampleLabel: "Ver ejemplo",
  },
  "site-visit-addon": {
    title: "Visita al sitio",
    category: "Apoyo",
    short: "Visita local básica para traslado, tiempo en el sitio y preparación de mediciones.",
    bestFor: "Trabajos que necesitan fotos de campo y medidas aproximadas antes de conceptos, estructuras o láminas especiales.",
    youSend: "Dirección del sitio, detalles de acceso y qué hay que revisar.",
    youGet: "Tiempo de visita, fotos de campo, medidas en bruto y notas de campo para trabajo de intención de diseño.",
    notIncluded: "Plano base, modelo 3D, trabajo de diseño, survey legal, ingeniería, revisión de código o traslado fuera de los límites de la ciudad.",
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
            draggable={false}
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
          >
            <img
              src={afterImage}
              alt={afterLabel}
              className="absolute inset-0 h-full w-full object-cover"
              draggable={false}
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

function SampleModal({
  service,
  lang,
  onClose,
}: {
  service: Service;
  lang: Lang;
  onClose: () => void;
}) {
  const sample = getSampleImages(service.id);
  const title = translateServiceTitle(service, lang);
  const beforeLabel = lang === "es" ? "Antes" : "Before";
  const afterLabel = lang === "es" ? "Después" : "After";

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white p-4 shadow-2xl md:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
              {lang === "es" ? "Ejemplo" : "Sample"}
            </div>
            <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900 md:text-2xl">
              {title}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {lang === "es"
                ? "Mueve el control para comparar el input inicial con un ejemplo de resultado. Ejemplo solamente; cada proyecto se revisa por separado."
                : "Drag the handle to compare the starting input with a sample result. Sample only; every project is reviewed separately."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            aria-label={lang === "es" ? "Cerrar ejemplo" : "Close sample"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <BeforeAfterSlider
          beforeImage={sample.before}
          afterImage={sample.after}
          beforeLabel={beforeLabel}
          afterLabel={afterLabel}
        />
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
          {lang === "es"
            ? "Ejemplo solamente. Design-intent / presentation support. No es para construcción, permiso, ingeniería ni submittal sellado."
            : "Sample only. Design-intent / presentation support. Not for construction, permit, engineering, or stamped submittal."}
        </div>
      </div>
    </div>
  );
}

function makeTitleBlockSampleSvg(label: string, variant: "landscape" | "portrait") {
  const isPortrait = variant === "portrait";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 760"><rect width="1200" height="760" fill="#f8fafc"/><rect x="70" y="70" width="1060" height="620" rx="34" fill="white" stroke="#cbd5e1" stroke-width="3"/><rect x="90" y="560" width="1020" height="110" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2"/><text x="120" y="620" font-family="Arial" font-size="32" font-weight="800" fill="#0f172a">${label}</text><text x="120" y="650" font-family="Arial" font-size="18" fill="#64748b">Sample blank title block / sheet frame</text>${isPortrait ? '<rect x="930" y="110" width="120" height="500" fill="white" stroke="#cbd5e1" stroke-width="2"/><text x="948" y="360" transform="rotate(-90 948 360)" font-family="Arial" font-size="18" fill="#64748b">Vertical title block</text>' : '<line x1="90" y1="615" x2="1110" y2="615" stroke="#cbd5e1" stroke-width="2"/>'}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function TitleBlockSampleModal({
  option,
  lang,
  onClose,
}: {
  option: TitleBlockSampleOption;
  lang: Lang;
  onClose: () => void;
}) {
  const isLandscape = option === "standard-landscape";
  const title = isLandscape
    ? lang === "es"
      ? "Title block horizontal estándar"
      : "Standard landscape SiteForm title block"
    : lang === "es"
      ? "Title block vertical estándar"
      : "Standard portrait SiteForm title block";
  const image = isLandscape
    ? "/samples/title-block-landscape.jpg"
    : "/samples/title-block-portrait.jpg";
  const fallback = makeTitleBlockSampleSvg(title, isLandscape ? "landscape" : "portrait");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[2rem] bg-white p-4 shadow-2xl md:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">
              {lang === "es" ? "Ejemplo" : "Sample"}
            </div>
            <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900 md:text-2xl">
              {title}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {lang === "es"
                ? "Puedes usar este title block estándar o subir tu propio archivo. Reemplaza esta imagen después con el sample real."
                : "You can use this standard title block or upload your own file. Replace this placeholder with your real sample later."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            aria-label={lang === "es" ? "Cerrar ejemplo" : "Close sample"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-100 p-3">
          <img
            src={image}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = fallback;
            }}
            alt={title}
            className="w-full rounded-2xl bg-white object-contain"
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
        <div className="mt-5 space-y-4 border-l-4 border-emerald-200 pl-4 text-sm leading-6 text-slate-700 md:mt-6 md:max-w-3xl md:text-base md:leading-7">
          <p>
            <span className="font-black text-slate-900">{t.showcaseWhiteTitle}: </span>
            {t.showcaseWhiteText}
          </p>
          <p>
            <span className="font-black text-slate-900">{t.showcaseHowTitle}: </span>
            {t.showcaseHowText}
          </p>
          <p>
            <span className="font-black text-slate-900">{t.showcaseSafeTitle}: </span>
            {t.showcaseSafeText}
          </p>
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
  onSample,
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
  onSample: (service: Service) => void;
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
                        <button
                          type="button"
                          onClick={() => onSample(service)}
                          className={`rounded-full border px-3 py-1 text-xs font-black transition ${
                            selected
                              ? "border-emerald-100 bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                          }`}
                        >
                          {translateServiceField(service, "sampleLabel", lang)}
                        </button>
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

// ─── FilePicker ──────────────────────────────────────────────────────────────

function FilePicker({
  title,
  help,
  accept,
  files,
  onChange,
  lang,
  maxFiles,
  requiredField = false,
  missing = false,
}: {
  title: string;
  help: string;
  accept: string;
  files: FileList | null;
  onChange: (files: FileList | null) => void;
  lang: Lang;
  maxFiles?: number;
  requiredField?: boolean;
  missing?: boolean;
}) {
  const t = T[lang];
  const [error, setError] = useState<string | null>(null);
  const maxHelp = maxFiles
    ? lang === "es"
      ? `Máximo ${maxFiles} archivos por carga.`
      : `Up to ${maxFiles} files per upload.`
    : null;

  return (
    <label className={`grid gap-2 rounded-3xl border p-4 ${missing ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white"}`}>
      <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        {title}
        {requiredField ? (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${missing ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>
            {lang === "es" ? "Requerido" : "Required"}
          </span>
        ) : null}
      </span>
      <span className="text-xs leading-5 text-slate-500">
        {help}
        {maxHelp ? <span className="mt-1 block font-semibold text-slate-600">{maxHelp}</span> : null}
      </span>
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
        <Upload className="mb-3 h-5 w-5" />
        <input
          type="file"
          accept={accept}
          multiple
          onChange={(e) => {
            const nextFiles = e.target.files;
            if (maxFiles && nextFiles && nextFiles.length > maxFiles) {
              setError(
                lang === "es"
                  ? `Sube máximo ${maxFiles} archivos por vez.`
                  : `Please upload no more than ${maxFiles} files at once.`
              );
              e.currentTarget.value = "";
              onChange(null);
              return;
            }
            setError(null);
            onChange(nextFiles);
          }}
          className="block w-full text-xs"
        />
        {error ? (
          <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
            {error}
          </div>
        ) : null}
        {files?.length ? (
          <div className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-emerald-800">
            {files.length} {t.filesSelected}
          </div>
        ) : null}
      </div>
    </label>
  );
}

// ─── ProjectInfoCard ─────────────────────────────────────────────────────────

function ProjectInfoCard({
  contact,
  projectFiles,
  onChange,
  onFilesChange,
  lang,
  pathId,
  missingKeys,
}: {
  contact: OrderContact;
  projectFiles: ProjectFileUploads;
  onChange: (patch: Partial<OrderContact>) => void;
  onFilesChange: (patch: Partial<ProjectFileUploads>) => void;
  lang: Lang;
  pathId: string;
  missingKeys: MissingRequirementKey[];
}) {
  const t = T[lang];
  const isNewPartner = contact.partnerProfileMode === "new";
  const partnerContactTitle =
    lang === "es" ? "Contacto e información de compañía" : "Contact and company information";
  const partnerContactHelp =
    lang === "es"
      ? "Primero dinos quién manda el pedido. Después, si es tu primera vez, dinos qué información de tu compañía debe aparecer en las láminas white-label."
      : "First tell us who is sending the order. Then, if this is your first time, tell us what company information should appear on the white-label sheets.";
  const existingProfileNote =
    lang === "es"
      ? "Usaremos la información de compañía que ya tenemos guardada. Esta sección queda corta para que puedas pasar directo al proyecto."
      : "We will use the company information already on file. This section stays short so you can move straight to the project.";
  const firstProfileNote =
    lang === "es"
      ? "Primer pedido: configura cómo debe aparecer tu compañía. Logo y title block son opcionales: súbelos si quieres que los usemos."
      : "First order: set up how your company should appear. Logo and title block are optional: upload them if you want us to use them.";
  const projectSectionTitle =
    lang === "es" ? "Información del proyecto" : "Project information";
  const projectSectionHelp =
    lang === "es"
      ? "Todo en este pedido debe ser para un solo cliente/proyecto. Aquí va la etiqueta del cliente/proyecto, detalles, medidas, links y archivos."
      : "Everything in this order must be for one client/project. Add the client/project label, details, measurements, links, and files here.";
  const [titleBlockSample, setTitleBlockSample] = useState<TitleBlockSampleOption | null>(null);
  const logoRequired = false;
  const isQuickPhoto = pathId === "quick-sale";
  const isMissing = (key: MissingRequirementKey) => missingKeys.includes(key);
  const inputClass = (missing: boolean, base = "rounded-2xl px-4 py-3 text-sm outline-none") =>
    `${base} border ${missing ? "border-rose-300 bg-rose-50 focus:border-rose-500" : "border-slate-200 bg-white focus:border-slate-400"}`;
  const timelineTitle = lang === "es" ? "Tiempo estimado" : "Estimated production timing";
  const timelineText =
    pathId === "quick-sale"
      ? lang === "es"
        ? "Quick Photo Concept normalmente se entrega en alrededor de 1 día hábil después de review, invoice/payment y una foto utilizable."
        : "Quick Photo Concept is usually delivered in about 1 business day after review, invoice/payment, and a usable photo."
      : pathId === "build-one"
      ? lang === "es"
        ? "Decks, pergolas, patio covers, carports y outdoor structures normalmente toman alrededor de 2 semanas calendario después de review, invoice/payment y archivos utilizables."
        : "Decks, pergolas, patio covers, carports, and outdoor structures usually take about 2 calendar weeks after review, invoice/payment, and usable files."
      : pathId === "full-design"
        ? lang === "es"
          ? "Yard design packages se programan después de revisar todo lo enviado. Normalmente toma desde 2 semanas hasta 1 mes para proyectos más complejos."
          : "Yard design packages are scheduled after we review what was sent. Typical timing is about 2 weeks to 1 month for more complex projects."
        : pathId === "special-drawings" || pathId === "3d-rendering"
          ? lang === "es"
            ? "3D, rendering support y specialty sheets se programan después de review. El tiempo depende del alcance y calidad de los archivos; normalmente 2 semanas a 1 mes."
            : "3D, rendering support, and specialty sheets are scheduled after review. Timing depends on scope and file quality; usually about 2 weeks to 1 month."
          : lang === "es"
            ? "El tiempo final se confirma después de revisar el alcance, archivos y disponibilidad. El trabajo empieza después del invoice/payment."
            : "Final timing is confirmed after we review the scope, files, and schedule. Work starts after invoice/payment.";

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h3 className="text-2xl font-black tracking-tight text-slate-900">
        {t.projectInfo}
      </h3>

      <div className="mt-5 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 md:p-6">
        <div className="flex flex-col gap-2">
          <h4 className="text-lg font-black text-slate-900">
            {partnerContactTitle}
          </h4>
          <p className="text-sm leading-6 text-slate-600">
            {partnerContactHelp}
          </p>
        </div>

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
              className={inputClass(isMissing("partnerName"))}
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
              className={inputClass(isMissing("partnerEmail"))}
            />
          </label>

          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">
              {t.clientPhone}
            </span>
            <input
              type="tel"
              inputMode="numeric"
              required
              maxLength={12}
              value={contact.customerPhone}
              onChange={(e) => onChange({ customerPhone: formatPhoneInput(e.target.value) })}
              placeholder={t.clientPhonePlaceholder}
              className={inputClass(isMissing("partnerPhone"))}
            />
          </label>
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

        {isNewPartner ? (
          <div className="mt-5 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
            {firstProfileNote}
          </div>
        ) : (
          <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-600">
            {existingProfileNote}
          </div>
        )}

        {isNewPartner ? (
          <>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 md:col-span-2">
                <span className="text-sm font-semibold text-slate-700">
                  {t.whiteLabelCompany}
                </span>
                <input
                  required={isNewPartner}
                  value={contact.whiteLabelCompany}
                  onChange={(e) => onChange({ whiteLabelCompany: e.target.value })}
                  placeholder={t.whiteLabelCompanyPlaceholder}
                  className={inputClass(isMissing("whiteLabelCompany"))}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  {t.whiteLabelPhone}
                </span>
                <input
                  value={contact.whiteLabelPhone}
                  inputMode="numeric"
                  maxLength={12}
                  onChange={(e) => onChange({ whiteLabelPhone: formatPhoneInput(e.target.value) })}
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

              <label className="grid gap-2 md:col-span-2">
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
                    checked={contact.logoOption === "text-only"}
                    onChange={() => onChange({ logoOption: "text-only" })}
                  />
                  <span>{t.logoTextOnly}</span>
                </label>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {contact.logoOption === "upload" ? (
                <FilePicker
                  title={t.uploadLogoFiles}
                  help={t.uploadLogoHelp}
                  accept="image/*,.pdf,.ai,.eps,.svg"
                  files={projectFiles.logoFiles}
                  onChange={(files) => onFilesChange({ logoFiles: files })}
                  lang={lang}
                  maxFiles={5}
                  requiredField={logoRequired}
                />
              ) : null}
              <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 md:col-span-2">
                <div className="text-sm font-semibold text-slate-700">{t.titleBlockOption}</div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{t.uploadTitleBlockHelp}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <label onClick={() => setTitleBlockSample("standard-landscape")} className={`cursor-pointer rounded-2xl border p-4 text-sm ${contact.titleBlockOption === "standard-landscape" ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                    <input
                      type="radio"
                      name="titleBlockOption"
                      checked={contact.titleBlockOption === "standard-landscape"}
                      onChange={() => onChange({ titleBlockOption: "standard-landscape" })}
                      className="sr-only"
                    />
                    <span className="block font-black text-slate-900">{t.titleBlockStandardLandscape}</span>
                    <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-800">{t.titleBlockSample}</span>
                    <span className="mt-3 block h-16 rounded-xl border border-slate-200 bg-white p-2">
                      <span className="block h-3 w-28 rounded bg-slate-200" />
                      <span className="mt-6 block h-3 w-full rounded bg-slate-100" />
                    </span>
                  </label>
                  <label onClick={() => setTitleBlockSample("standard-portrait")} className={`cursor-pointer rounded-2xl border p-4 text-sm ${contact.titleBlockOption === "standard-portrait" ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                    <input
                      type="radio"
                      name="titleBlockOption"
                      checked={contact.titleBlockOption === "standard-portrait"}
                      onChange={() => onChange({ titleBlockOption: "standard-portrait" })}
                      className="sr-only"
                    />
                    <span className="block font-black text-slate-900">{t.titleBlockStandardPortrait}</span>
                    <span className="mt-2 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-800">{t.titleBlockSample}</span>
                    <span className="mt-3 grid h-16 grid-cols-[1fr_auto] gap-2 rounded-xl border border-slate-200 bg-white p-2">
                      <span className="space-y-2"><span className="block h-3 w-24 rounded bg-slate-200" /><span className="block h-3 w-36 rounded bg-slate-100" /></span>
                      <span className="h-full w-16 rounded bg-slate-100" />
                    </span>
                  </label>
                  <label className={`cursor-pointer rounded-2xl border p-4 text-sm ${contact.titleBlockOption === "upload" ? "border-emerald-400 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                    <input
                      type="radio"
                      name="titleBlockOption"
                      checked={contact.titleBlockOption === "upload"}
                      onChange={() => onChange({ titleBlockOption: "upload" })}
                      className="sr-only"
                    />
                    <span className="block font-black text-slate-900">{t.titleBlockUpload}</span>
                    <span className="mt-3 flex h-16 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-xs text-slate-500">Upload file</span>
                  </label>
                </div>
              </div>
              {contact.titleBlockOption === "upload" ? (
                <FilePicker
                  title={t.uploadTitleBlock}
                  help={t.uploadTitleBlockHelp}
                  accept=".pdf,image/*,.dwg,.dxf,.ai,.eps,.svg"
                  files={projectFiles.titleBlockFiles}
                  onChange={(files) => onFilesChange({ titleBlockFiles: files })}
                  lang={lang}
                  maxFiles={5}
                />
              ) : null}
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
          </>
        ) : null}
      </div>

      <div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-5 md:p-6">
        <div className="flex flex-col gap-2">
          <h4 className="text-lg font-black text-slate-900">
            {projectSectionTitle}
          </h4>
          <p className="text-sm leading-6 text-slate-600">
            {projectSectionHelp}
          </p>
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-950">
          {t.oneProjectSummary}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">
              {t.projectAddress}
            </span>
            <input
              required
              value={contact.projectAddress}
              onChange={(e) => onChange({ projectAddress: e.target.value })}
              placeholder={t.projectAddressPlaceholder}
              className={inputClass(isMissing("projectLabel"))}
            />
            <div className="text-xs leading-5 text-slate-500">{t.projectLabelHelp}</div>
          </label>


          <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                {t.showClientName}
              </span>
              <input
                value={contact.clientTitleBlockName}
                onChange={(e) => onChange({ clientTitleBlockName: e.target.value })}
                placeholder={t.clientTitleBlockNamePlaceholder}
                className={inputClass(false)}
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                {t.addressFull}
              </span>
              <input
                value={contact.clientTitleBlockAddress}
                onChange={(e) => onChange({ clientTitleBlockAddress: e.target.value })}
                placeholder={t.clientTitleBlockAddressPlaceholder}
                className={inputClass(false)}
              />
            </label>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-950">
            {lang === "es"
              ? "Si dejas el nombre o la dirección vacíos, no los mostraremos en el title block."
              : "If you leave the client name or address blank, we will not show it on the title block."}
          </div>

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
              className={inputClass(isMissing("projectDetails"), "rounded-3xl p-4 text-sm outline-none")}
            />
            <div className="text-right text-xs text-slate-400">
              {contact.notes.length} / {NOTES_LIMIT}
            </div>
            <div className="text-xs text-slate-500">{t.notesHelp}</div>
          </label>

          <div className="grid gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 md:col-span-2 md:grid-cols-4">
            <label className="grid gap-2 md:col-span-4">
              <span className="text-sm font-semibold text-slate-700">{t.measurementObject}</span>
              <input
                value={contact.measurementObject}
                onChange={(e) => onChange({ measurementObject: e.target.value })}
                placeholder={t.measurementObjectPlaceholder}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">{t.measurementWidth}</span>
              <input
                value={contact.measurementWidth}
                onChange={(e) => onChange({ measurementWidth: e.target.value })}
                placeholder={t.measurementValuePlaceholder}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">{t.measurementLength}</span>
              <input
                value={contact.measurementLength}
                onChange={(e) => onChange({ measurementLength: e.target.value })}
                placeholder={t.measurementValuePlaceholder}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">{t.measurementHeight}</span>
              <input
                value={contact.measurementHeight}
                onChange={(e) => onChange({ measurementHeight: e.target.value })}
                placeholder={t.measurementValuePlaceholder}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </label>
            <label className="grid gap-2 md:col-span-4">
              <span className="text-sm font-semibold text-slate-700">{t.measurementsNotes}</span>
              <textarea
                value={contact.measurementsNotes}
                onChange={(e) => onChange({ measurementsNotes: e.target.value })}
                rows={4}
                placeholder={t.measurementsNotesPlaceholder}
                className="rounded-3xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-slate-400"
              />
              <div className="text-xs text-slate-500">{t.measurementsNotesHelp}</div>
            </label>
          </div>

          <label className="grid gap-2 md:col-span-2">
            <span className="text-sm font-semibold text-slate-700">
              {t.referenceLinks}
            </span>
            <textarea
              value={contact.referenceLinks}
              onChange={(e) => onChange({ referenceLinks: e.target.value })}
              rows={3}
              placeholder={t.referenceLinksPlaceholder}
              className="rounded-3xl border border-slate-200 bg-white p-4 text-sm outline-none focus:border-slate-400"
            />
          </label>

          {pathId === "quick-sale" ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950 md:col-span-2">
              <span className="font-black">{lang === "es" ? "Tiempo de entrega" : "Turnaround"}: </span>
              {t.quickDeliveryFixed}
            </div>
          ) : (
            <label className="grid gap-2 md:col-span-2">
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
          )}
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
          <div className="font-black">{timelineTitle}</div>
          <p className="mt-1 leading-6">{timelineText}</p>
        </div>

        {!isQuickPhoto ? (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
            <div className="font-black">{t.remoteInfoTitle}</div>
            <p className="mt-1 leading-6">{t.remoteInfoText}</p>
          </div>
        ) : null}

        <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
          <h5 className="text-base font-black text-slate-900">{t.projectFilesTitle}</h5>
          <p className="mt-2 text-sm leading-6 text-slate-600">{t.projectFilesHelp}</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <FilePicker
              title={t.uploadPhotos}
              help={t.uploadPhotosHelp}
              accept="image/*"
              files={projectFiles.photos}
              onChange={(files) => onFilesChange({ photos: files })}
              lang={lang}
              maxFiles={10}
              requiredField={pathId === "quick-sale"}
              missing={isMissing("projectPhotos")}
            />
            <FilePicker
              title={t.uploadReferences}
              help={t.uploadReferencesHelp}
              accept="image/*,.pdf,.txt,.doc,.docx"
              files={projectFiles.references}
              onChange={(files) => onFilesChange({ references: files })}
              lang={lang}
              maxFiles={10}
              requiredField
              missing={isMissing("references")}
            />
            <FilePicker
              title={t.uploadSurvey}
              help={t.uploadSurveyHelp}
              accept=".pdf,image/*,.dwg,.dxf"
              files={projectFiles.surveyDocs}
              onChange={(files) => onFilesChange({ surveyDocs: files })}
              lang={lang}
              maxFiles={10}
              requiredField={pathId !== "quick-sale"}
              missing={isMissing("surveyDocs")}
            />
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <div className="font-black text-slate-900">{t.safetyTitle}</div>
          <p className="mt-1 leading-6">{t.safetyText}</p>
        </div>

        <label className={`mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border p-4 text-sm ${isMissing("sameProject") ? "border-rose-300 bg-rose-50" : "border-emerald-200 bg-emerald-50"}`}>
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
      </div>
      {titleBlockSample ? (
        <TitleBlockSampleModal
          option={titleBlockSample}
          lang={lang}
          onClose={() => setTitleBlockSample(null)}
        />
      ) : null}
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
  missingRequirementKeys,
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
  missingRequirementKeys: MissingRequirementKey[];
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
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
          <span className="font-black text-slate-800">{t.safetyTitle}: </span>
          {t.termsLine}
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
        {missingRequirementKeys.length ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
            <div className="font-black">{t.missingRequiredTitle}</div>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5">
              {missingRequirementKeys.map((key) => (
                <li key={key}>{getMissingRequirementLabel(key, lang)}</li>
              ))}
            </ul>
          </div>
        ) : null}
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
          {isCreating ? t.generating : t.submitForReview}
        </button>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-950">
          {t.reviewOnlyNotice}
        </div>
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
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <h2 className="text-3xl font-black text-slate-900">{t.successTitle}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{t.successText}</p>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            {t.orderIdLabel}
          </div>
          <div className="mt-1 text-lg font-black text-slate-900">{order.orderId}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
            {t.estimatedTotalLabel}
          </div>
          <div className="mt-1 text-lg font-black text-slate-900">
            {formatPrice(order.estimatedTotal, lang)}{order.hasTbd ? ` + ${t.tbd}` : ""}
          </div>
        </div>
      </div>

      {order.useDeposit ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">{t.deposit}</span>
            <span className="font-bold text-slate-900">{formatPrice(order.deposit, lang)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-slate-500">{t.remaining}</span>
            <span className="font-bold text-slate-900">{formatPrice(order.remaining, lang)}</span>
          </div>
        </div>
      ) : null}

      <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-950">
        {t.invoiceNext}
      </div>
      {order.hasTbd ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
          {t.tbdOnReview}
        </div>
      ) : null}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
        {t.writtenOnlyNote}
      </div>
      <div className="mt-6 space-y-3 rounded-3xl bg-slate-50 p-5">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3 last:border-0 last:pb-0">
            <span className="text-sm font-medium text-slate-900">{item.title}</span>
            <span className="text-xs font-semibold text-slate-500">{t.qty}: {item.qty}</span>
          </div>
        ))}
      </div>
      <div className="mt-5 text-xs leading-6 text-slate-500">{t.successNote}</div>
    </section>
  );
}

// ─── App ─────────────────────────────────────────────────────────────────────

const FULL_DESIGN_PACKAGE_IDS = ["yard-design-package"];
const FULL_DESIGN_STARTING_POINT_IDS = ["survey-documents-start", "client-model-start"];
const FULL_DESIGN_IDEA_IDS = ["draw-your-idea", "help-design-it"];

const STRUCTURE_DECK_IDS = ["deck-small", "deck-large"];
const STRUCTURE_COVER_IDS = ["pergola-small", "shade-large"];
const STRUCTURE_CARPORT_IDS = ["carport-small", "carport-large"];
const STRUCTURE_MAIN_BUILD_IDS = [
  ...STRUCTURE_DECK_IDS,
  ...STRUCTURE_COVER_IDS,
  "outdoor-kitchen",
];

function getPhoneDigitCount(value: string) {
  return value.replace(/\D/g, "").length;
}

function getMissingRequirementKeys(
  contact: OrderContact,
  files: ProjectFileUploads,
  pathId: string,
  selectedItemCount: number
): MissingRequirementKey[] {
  const missing: MissingRequirementKey[] = [];
  const requiresSurveyFiles = pathId !== "quick-sale";
  const requiresPhotoFiles = pathId === "quick-sale";

  if (selectedItemCount <= 0) missing.push("selectedService");
  if (!contact.clientName.trim()) missing.push("partnerName");
  if (!contact.customerEmail.trim()) missing.push("partnerEmail");
  if (getPhoneDigitCount(contact.customerPhone) < 10) missing.push("partnerPhone");
  if (contact.partnerProfileMode === "new" && !contact.whiteLabelCompany.trim()) missing.push("whiteLabelCompany");
  if (!contact.projectAddress.trim()) missing.push("projectLabel");
  if (!contact.notes.trim()) missing.push("projectDetails");
  if (requiresPhotoFiles && !files.photos?.length) missing.push("projectPhotos");
  if (requiresSurveyFiles && !files.surveyDocs?.length) missing.push("surveyDocs");
  if (!files.references?.length) missing.push("references");
  if (!contact.sameProjectConfirmed) missing.push("sameProject");

  return missing;
}

function getMissingRequirementLabel(key: MissingRequirementKey, lang: Lang) {
  const labels: Record<MissingRequirementKey, { en: string; es: string }> = {
    selectedService: { en: "Choose at least one service", es: "Elige al menos un servicio" },
    partnerName: { en: "Your name / company", es: "Tu nombre / compañía" },
    partnerEmail: { en: "Your email", es: "Tu email" },
    partnerPhone: { en: "Your phone number — 10 digits", es: "Tu teléfono — 10 dígitos" },
    whiteLabelCompany: { en: "Company name to show on deliverables", es: "Nombre de compañía para entregables" },
    projectLabel: { en: "Internal project label / job name", es: "Etiqueta interna del proyecto" },
    projectDetails: { en: "Project details", es: "Detalles del proyecto" },
    projectPhotos: { en: "Project photos for Quick Photo Concept", es: "Fotos para Quick Photo Concept" },
    surveyDocs: { en: "Survey / site plan / measured base", es: "Survey / plano del sitio / base medida" },
    references: { en: "References / markups / measurements", es: "Referencias / markups / medidas" },
    sameProject: { en: "Confirm one client/project for this order", es: "Confirma un cliente/proyecto para este pedido" },
  };
  return labels[key][lang];
}

function App() {
  const [lang, setLang] = useState<Lang>("en");
  const [view, setView] = useState<ViewState>("LANDING");
  const [activePath, setActivePath] = useState<string>("quick-sale");
  const [selectedSize, setSelectedSize] = useState<string>("small");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [contact, setContact] = useState<OrderContact>(() => getInitialContact());
  const [projectFiles, setProjectFiles] = useState<ProjectFileUploads>(() => emptyProjectFiles());
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
  const [sampleService, setSampleService] = useState<Service | null>(null);

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
  const missingRequirementKeys = getMissingRequirementKeys(
    contact,
    projectFiles,
    activePath,
    pricedItems.length
  );
  const canProceed = missingRequirementKeys.length === 0;

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

  function openSample(service: Service) {
    setSampleService(service);
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
    setProjectFiles(emptyProjectFiles());
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
    if (!canProceed) {
      setCheckoutNotice(t.fillRequired);
      return;
    }

    setCreatingCheckout(true);
    setCheckoutNotice(null);

    if (contact.rememberPartnerInfo) {
      savePartnerInfo(contact);
    }

    const orderId = `SB-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;
    const effectiveDeliveryDate = activePath === "quick-sale" ? "1 business day after review, invoice/payment, and usable photo/files" : sanitizeText(contact.desiredDeliveryDate);
    const reviewPayload = {
      order_id: orderId,
      path_id: activePath,
      path_title: selectedPathTitle,
      size_id: selectedSize,
      size_label: selectedSizeLabel,
      client_name: sanitizeText(contact.clientName),
      customer_email: sanitizeText(contact.customerEmail),
      customer_phone: sanitizeText(contact.customerPhone),
      project_address: sanitizeText(contact.projectAddress),
      project_client_label: sanitizeText(contact.projectAddress),
        client_name_for_title_block: sanitizeText(contact.clientTitleBlockName),
        client_address_for_title_block: sanitizeText(contact.clientTitleBlockAddress),
      same_client_project_confirmed: contact.sameProjectConfirmed,
      full_notes: sanitizeText(contact.notes),
      measurement_object: sanitizeText(contact.measurementObject),
      measurement_width: sanitizeText(contact.measurementWidth),
      measurement_length_depth: sanitizeText(contact.measurementLength),
      measurement_height: sanitizeText(contact.measurementHeight),
      measurements_site_notes: sanitizeText(contact.measurementsNotes),
      reference_links: sanitizeText(contact.referenceLinks),
      requested_delivery_date: effectiveDeliveryDate,
      white_label_delivery: buildWhiteLabelPayload(contact),
      file_summary: buildFileSummary(projectFiles),
      payment_status: "submitted_for_review_invoice_pending",
      payment_workflow: "manual_invoice_after_review",
      invoice_note: "Review scope and files first, then create/send invoice or payment link manually.",
      estimate: {
        priced_subtotal: pricedSubtotal,
        rush_fee: rushFee,
        estimated_total: total,
        estimated_deposit: useDeposit ? deposit : total,
        estimated_remaining: useDeposit ? remaining : 0,
        has_tbd: hasTbd,
      },
      items: pricedItems.map((item) => ({
        id: item.service.id,
        title: translateServiceTitle(item.service, lang),
        quantity: item.qty,
        unit_amount: getBasePrice(item.service, selectedSize),
        pricing_type: item.service.pricingType,
        estimate_amount: item.price,
        needs_quote: item.isQuote,
      })),
    };

    try {
      const submitResult = await submitOrderForReview(reviewPayload, projectFiles);
      const savedOrderId = submitResult.orderId || orderId;

      setPaidOrder({
        sessionId: `review_${Date.now()}`,
        orderId: savedOrderId,
        pathId: activePath,
        pathTitle: selectedPathTitle,
        sizeId: selectedSize,
        sizeLabel: selectedSizeLabel,
        clientName: contact.clientName,
        customerEmail: contact.customerEmail,
        customerPhone: contact.customerPhone,
        projectAddress: contact.projectAddress,
        estimatedTotal: total,
        deposit,
        remaining,
        useDeposit,
        hasTbd,
        items: pricedItems.map((item) => ({
          id: item.service.id,
          title: translateServiceTitle(item.service, lang),
          qty: item.qty,
        })),
      });
      setCheckoutNotice(t.reviewSubmitted);
      setView("SUCCESS");
    } catch (error) {
      setCheckoutNotice(error instanceof Error ? error.message : "The order could not be saved. Please try again.");
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
            onSample={openSample}
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
              onSample={openSample}
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
              onSample={openSample}
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
              onSample={openSample}
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
              onSample={openSample}
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
              onSample={openSample}
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
              onSample={openSample}
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
              onSample={openSample}
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
              onSample={openSample}
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
              onSample={openSample}
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
              onSample={openSample}
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
              onSample={openSample}
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
                projectFiles={projectFiles}
                onChange={(patch) =>
                  setContact((prev) => ({ ...prev, ...patch }))
                }
                onFilesChange={(patch) =>
                  setProjectFiles((prev) => ({ ...prev, ...patch }))
                }
                lang={lang}
                pathId={activePath}
                missingKeys={missingRequirementKeys}
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
              missingRequirementKeys={missingRequirementKeys}
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
      {sampleService ? (
        <SampleModal
          service={sampleService}
          lang={lang}
          onClose={() => setSampleService(null)}
        />
      ) : null}
    </div>
  );
}

export default App;
