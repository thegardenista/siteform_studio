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

type PricingType = "size" | "unit" | "flat" | "hourly" | "quote" | "tiered-unit" | "percentage";
type Locale = "en" | "es";
type SampleKey = "render" | "hoa" | "takeoff" | "plan";
type Mode = "sales" | "build" | "full";
type SectionKey = "sales" | "bundle" | "start" | "build" | "idea" | "after" | "city" | "help";

interface Size { id: string; label: string; sublabel: string; labelEs: string; sublabelEs: string; }
interface Service {
  id: string; title: string; titleEs?: string; proTitle?: string; proTitleEs?: string;
  category: string; icon: LucideIcon; pricingType: PricingType;
  prices?: Record<string, number | null>; unitPrice?: number; flatPrice?: number;
  hourlyRate?: number; unitPrices?: Record<string, number | null>;
  percentRate?: number; displayPriceLabel?: string; quantityEnabled?: boolean;
  quantityLabel?: string; quantityLabelEs?: string; short: string; shortEs?: string;
  bestFor: string; bestForEs?: string; youSend: string; youSendEs?: string;
  youGet: string; youGetEs?: string; notIncluded: string; notIncludedEs?: string;
  helper?: string; helperEs?: string; sampleLabel?: string; sampleLabelEs?: string;
  badgeLabel?: string; badgeLabelEs?: string; sampleKey?: SampleKey;
}

const WHATSAPP_NUMBER = "15551234567";
const TEXT_NUMBER = "15551234567";

const ui = {
  en: {
    language: "Language", headerTitle: "Partner Configurator",
    headerSub: "siteform.studio • white-label drafting and visuals",
    sizeStep: "1. Property size", guidedEntryTitle: "2. What do you need to do?",
    guidedEntryDesc: "Pick the fastest path. This cuts down the scroll and makes the page easier for contractors on a phone.",
    modeSalesTitle: "Just close the sale", modeSalesDesc: "I need a quick visual to help sell the job.",
    modeBuildTitle: "Build one thing", modeBuildDesc: "I am building a deck, patio, pergola, wall, or porch.",
    modeFullTitle: "Design the whole yard", modeFullDesc: "I need the full backyard design path and support for paperwork.",
    activePath: "Active path", online: "Buy online", mixed: "Mixed pricing", quote: "Quote",
    selected: "Selected", addProject: "Add to Project", addQuote: "Add to quote",
    hideDetails: "Hide details", showDetails: "What this includes", bestFor: "Best for",
    youSend: "You send", youGet: "You get", notIncluded: "Not included", proTerm: "Pro term",
    bundleTitle: "Quick bundles", bundleDesc: "For contractors who do not want to stack 3 separate services by hand.",
    bundleButton: "Use this bundle", bundleActive: "Bundle active", bundleSavings: "Bundle savings",
    bundleHoaTitle: "HOA Ready Package", bundleHoaDesc: "Remote yard map + deck build package + HOA / city paperwork with one click.",
    sectionSalesTitle: "Fastest way to sell the job", sectionSalesDesc: "This is the low-friction sales path. Phone photo in, one sellable image out.",
    sectionBuildTitle: "Build packages", sectionBuildDesc: "Detailed object packages for people actually building something.",
    sectionStartTitle: "Start the base", sectionStartDesc: "Use one of these when the project needs a yard map, field visit, or 3D starting point.",
    sectionIdeaTitle: "Drawing your idea", sectionIdeaDesc: "Use this when you already know the layout or want help shaping it.",
    sectionAfterTitle: "Plans and materials after layout", sectionAfterDesc: "These come after the layout is decided. Think yard map, shopping list, and watering layout.",
    sectionCityTitle: "HOA / city paperwork", sectionCityDesc: "Use these when the city or HOA wants extra paperwork.",
    sectionHelpTitle: "Need help or extra time?", sectionHelpDesc: "Calls, rush work, or travel time.",
    salesModeNote: "Sales mode auto-picks the quick sales image. Everything else moves out of the way.",
    buildModeNote: "Build mode brings object packages and HOA paperwork to the front.",
    fullModeNote: "Full design mode shows the full yard workflow.",
    contractorHint: "Do not know what to pick? Write: 'I need this porch approved by HOA' in Project Notes and I will sort the right package after you hit WhatsApp.",
    nonStampedNote: "Prices are for non-stamped drawings.",
    travelRuleNote: "For site visits beyond 20 miles, add Travel Time.",
    notesTitle: "Project notes", notesDesc: "Photos and files still go through WhatsApp or text.",
    notesPlaceholder: "Example: I need this porch approved by HOA. Homeowner only has phone photos.",
    confusedTitle: "Need help? Text me", confusedDesc: "I prefer text or WhatsApp.",
    freeCall: "Text me", freeCallAdded: "Text request added to your notes.",
    summaryTitle: "Summary", summaryDesc: "Full total is shown here. Only the 70% deposit is charged now.",
    noServices: "No services selected", totalProject: "Total Project", deposit: "Deposit (70%)",
    balance: "Balance after completion", quoteNotice: "One or more selected items need project-specific review.",
    requestQuote: "Request Quote", payDeposit: "Pay 70% Deposit",
    step2Title: "Step 2: Send photos", step2Desc: "After this, open WhatsApp or text and attach site photos.",
    sendWhatsapp: "Send to WhatsApp", sendText: "Send by Text", copied: "Copied",
    copyRequest: "Copy request", agreement: "I understand I am ordering work for my company...",
    agreementError: "Please check the agreement box before continuing.", requestSummary: "Request Summary",
    phoneNote: "Replace numbers before publishing.", currentTotal: "Current total",
    checkSummary: "Check Summary", property: "PROPERTY", services: "SERVICES", noneSelected: "None selected",
    photosFiles: "PHOTOS / FILES", sentVia: "Will be sent via WhatsApp or text chat",
    total: "TOTAL", notes: "NOTES", quoteWord: "QUOTE", consultationNote: "Sandbox preview mode.",
    sample: "See sample", bestSeller: "Best seller", hours: "hours", sheets: "sheets",
    visualHookRender: "Phone → visual", visualHookPlan: "Yard map", visualHookHoa: "HOA sheet",
    visualHookTakeoff: "Materials list", masterPlanNote: "Master Plan = The Big Picture.",
  },
  es: {
    language: "Idioma", headerTitle: "Configurador para contratistas",
    headerSub: "siteform.studio • dibujo и visuales white-label",
    sizeStep: "1. Tamaño de la propiedad", guidedEntryTitle: "2. ¿Qué necesita hacer?",
    guidedEntryDesc: "Escoja la ruta más rápida. Así evitamos un scroll eterno.",
    modeSalesTitle: "Solo cerrar la venta", modeSalesDesc: "Necesito una imagen rápida.",
    modeBuildTitle: "Construir una cosa", modeBuildDesc: "Deck, patio, pérgola, muro o porch.",
    modeFullTitle: "Diseñar todo el jardín", modeFullDesc: "Ruta completa de diseño y papeles.",
    activePath: "Ruta activa", online: "Compra en línea", mixed: "Precios mixtos", quote: "Cotización",
    selected: "Seleccionado", addProject: "Agregar al proyecto", addQuote: "Pedir cotización",
    hideDetails: "Ocultar detalles", showDetails: "Qué incluye", bestFor: "Ideal para",
    youSend: "Usted me envía", youGet: "Usted recibe", notIncluded: "No incluye", proTerm: "Término pro",
    bundleTitle: "Paquetes rápidos", bundleDesc: "Para contratistas que no quieren juntar servicios.",
    bundleButton: "Usar este paquete", bundleActive: "Paquete activo", bundleSavings: "Ahorro del paquete",
    bundleHoaTitle: "Paquete listo para HOA", bundleHoaDesc: "Mapa remoto + deck + papeles HOA.",
    sectionSalesTitle: "Venta rápida", sectionSalesDesc: "Foto del celular adentro, imagen afuera.",
    sectionBuildTitle: "Paquetes para construir", sectionBuildDesc: "Paquetes detallados de construcción.",
    sectionStartTitle: "Empezar la base", sectionStartDesc: "Mapa del terreno o visita al sitio.",
    sectionIdeaTitle: "Dibujamos su idea", sectionIdeaDesc: "Usted trae el layout, nosotros lo dibujamos.",
    sectionAfterTitle: "Planos después del layout", sectionAfterDesc: "Lista de materiales y riego.",
    sectionCityTitle: "Papeles para HOA", sectionCityDesc: "Cuando la ciudad pide papeles extra.",
    sectionHelpTitle: "¿Necesita ayuda?", sectionHelpDesc: "Llamadas o urgencias.",
    salesModeNote: "Modo ventas: Imagen rápida.", buildModeNote: "Modo construcción: Paquetes y HOA.",
    fullModeNote: "Modo diseño: Todo el jardín.",
    contractorHint: "Escriba sus dudas en las notas.",
    nonStampedNote: "Dibujos no sellados.",
    travelRuleNote: "Más de 20 millas requiere Travel Time.",
    notesTitle: "Notas del proyecto", notesDesc: "Fotos por WhatsApp.",
    notesPlaceholder: "Ejemplo: Necesito aprobar este porch con HOA.",
    confusedTitle: "¿Necesita ayuda?", confusedDesc: "Mándeme texto.",
    freeCall: "Mándeme texto", freeCallAdded: "Solicitud agregada.",
    summaryTitle: "Resumen", summaryDesc: "Total completo. 70% anticipo.",
    noServices: "Nada seleccionado", totalProject: "Proyecto total", deposit: "Anticipo (70%)",
    balance: "Saldo al terminar", quoteNotice: "Requiere revisión.",
    requestQuote: "Pedir cotización", payDeposit: "Pagar anticipo",
    step2Title: "Paso 2: Fotos", step2Desc: "Mande fotos por WhatsApp.",
    sendWhatsapp: "WhatsApp", sendText: "Texto", copied: "Copiado",
    copyRequest: "Copiar", agreement: "Entiendo los términos...",
    agreementError: "Marque la casilla.", requestSummary: "Resumen",
    phoneNote: "Cambie los números.", currentTotal: "Total actual",
    checkSummary: "Ver resumen", property: "PROPIEDAD", services: "SERVICIOS", noneSelected: "Nada",
    photosFiles: "FOTOS", sentVia: "Vía WhatsApp",
    total: "TOTAL", notes: "NOTAS", quoteWord: "COTIZAR", consultationNote: "Vista previa.",
    sample: "Ver muestra", bestSeller: "Más pedido", hours: "horas", sheets: "planos",
    visualHookRender: "Imagen", visualHookPlan: "Mapa", visualHookHoa: "HOA",
    visualHookTakeoff: "Materiales", masterPlanNote: "Plan Maestro = Visión General.",
  },
} as const;

const SIZES: Size[] = [
  { id: "small", label: "Small", sublabel: "under 1/4 ac", labelEs: "Pequeño", sublabelEs: "menos de 1/4 ac" },
  { id: "medium", label: "Medium", sublabel: "around 1/2 ac", labelEs: "Mediano", sublabelEs: "alrededor de 1/2 ac" },
  { id: "large", label: "Large", sublabel: "1/2-1 ac", labelEs: "Grande", sublabelEs: "de 1/2 a 1 ac" },
  { id: "estate", label: "Estate", sublabel: "1-2 ac", labelEs: "Estate", sublabelEs: "de 1 a 2 ac" },
];

const STARTING_POINT_SERVICES: Service[] = [
  { id: "on-site-start", title: "Visit + Yard Map + 3D", category: "Start", icon: Camera, pricingType: "size", prices: { small: 300, medium: 400, large: 550, estate: null }, short: "We come out, measure, and build the base.", bestFor: "Local jobs.", youSend: "Address.", youGet: "3D model.", notIncluded: "Permits.", sampleKey: "plan" },
  { id: "survey-documents-start", title: "Remote Yard Map + 3D", category: "Start", icon: Map, pricingType: "size", prices: { small: 200, medium: 300, large: 450, estate: null }, short: "We build the base from your files.", bestFor: "Out-of-town jobs.", youSend: "Survey/Photos.", youGet: "Base plan.", notIncluded: "Site visit.", sampleKey: "plan" },
  { id: "photo-concept-start", title: "Quick sales image", category: "Start", icon: Trees, pricingType: "size", prices: { small: 150, medium: 150, large: 150, estate: null }, short: "Send one photo. We send back one concept.", bestFor: "Fast sales.", youSend: "Phone photo.", youGet: "Render.", notIncluded: "Plans.", sampleKey: "render", badgeLabel: "Best seller" }
];

const STRUCTURE_SERVICES: Service[] = [
  { id: "deck-small", title: "Deck build package", category: "Build", icon: Box, pricingType: "flat", flatPrice: 1000, short: "Detailed deck plans and 3D.", bestFor: "Small decks.", youSend: "Dimensions.", youGet: "AutoCAD plans.", notIncluded: "Engineering.", sampleKey: "hoa" },
  { id: "pergola-small", title: "Pergola build package", category: "Build", icon: Box, pricingType: "flat", flatPrice: 1000, short: "Detailed pergola plans.", bestFor: "Pergolas.", youSend: "Location.", youGet: "3D visuals.", notIncluded: "Engineering.", sampleKey: "hoa" }
];

const DESIGN_DIRECTION_SERVICES: Service[] = [
  { id: "design-execution", title: "Drawing your idea", category: "Idea", icon: Wrench, pricingType: "size", prices: { small: 500, medium: 800, large: 1300, estate: null }, short: "You know the layout. We draw it.", bestFor: "Contractors.", youSend: "Sketches.", youGet: "3D model.", notIncluded: "Design thinking.", sampleKey: "render" }
];

const NEXT_PHASE_SERVICES: Service[] = [
  { id: "master-plan", title: "Yard map of project", category: "After", icon: DraftingCompass, pricingType: "size", prices: { small: 200, medium: 350, large: 700, estate: null }, short: "The big-picture map.", bestFor: "General layout.", youSend: "Approved idea.", youGet: "2D map.", notIncluded: "Build details.", sampleKey: "plan" }
];

const RARE_TECHNICAL_SERVICES: Service[] = [
  { id: "hoa-city", title: "HOA / City Paperwork", category: "City", icon: ShieldCheck, pricingType: "size", prices: { small: 300, medium: 400, large: 600, estate: null }, short: "Extra submittal paperwork.", bestFor: "Approvals.", youSend: "Survey.", youGet: "Submittal sheet.", notIncluded: "Guarantees.", sampleKey: "hoa" }
];

const HOURLY_SERVICES: Service[] = [
  { id: "rush-fee", title: "Rush fee", category: "Help", icon: Zap, pricingType: "percentage", percentRate: 0.25, displayPriceLabel: "+25%", short: "Faster turnaround.", bestFor: "Deadlines.", youSend: "Due date.", youGet: "Priority.", notIncluded: "Miracles." }
];

const BUNDLES = [
  { id: "hoa-ready", title: "HOA Ready Package", titleEs: "Paquete HOA", desc: "Remote map + Deck + Paperwork.", descEs: "Mapa + Deck + Papeles.", discountRate: 0.1, items: { "survey-documents-start": 1, "deck-small": 1, "hoa-city": 1 } }
];

function formatPrice(v: number | null) {
  if (v === null) return "Quote";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
}

const App: React.FC = () => {
  const [locale, setLocale] = useState<Locale>("en");
  const [sizeId, setSizeId] = useState("small");
  const [mode, setMode] = useState<Mode>("sales");
  const [cart, setCart] = useState<Record<string, number>>({ "photo-concept-start": 1 });
  const [notes, setNotes] = useState("");
  const t = ui[locale];

  const summary = useMemo(() => {
    let total = 0;
    const items: any[] = [];
    const all = [...STARTING_POINT_SERVICES, ...STRUCTURE_SERVICES, ...DESIGN_DIRECTION_SERVICES, ...NEXT_PHASE_SERVICES, ...RARE_TECHNICAL_SERVICES, ...HOURLY_SERVICES];
    
    Object.keys(cart).forEach(id => {
      const s = all.find(x => x.id === id);
      if (!s) return;
      let p = s.pricingType === "flat" ? s.flatPrice : s.prices?.[sizeId];
      if (p) { total += p; items.push({ title: locale === 'es' ? (s.titleEs || s.title) : s.title, price: p }); }
    });
    return { items, total, deposit: total * 0.7 };
  }, [cart, sizeId, locale]);

  return (
    <div className="p-4 md:p-10 max-w-6xl mx-auto space-y-10 font-sans">
      <header className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
        <h1 className="text-4xl font-black">{t.headerTitle}</h1>
        <p className="text-slate-500">{t.headerSub}</p>
        <div className="mt-4 flex gap-2">
          <button onClick={() => setLocale("en")} className={`px-4 py-2 rounded-xl font-bold ${locale==='en'?'bg-slate-900 text-white':'bg-slate-100'}`}>EN</button>
          <button onClick={() => setLocale("es")} className={`px-4 py-2 rounded-xl font-bold ${locale==='es'?'bg-slate-900 text-white':'bg-slate-100'}`}>ES</button>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-8">
          <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4">{t.sizeStep}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SIZES.map(s => (
                <button key={s.id} onClick={() => setSizeId(s.id)} className={`p-4 rounded-2xl text-left border-2 transition ${sizeId===s.id?'border-slate-900 bg-slate-900 text-white':'border-slate-100 bg-slate-50'}`}>
                  <div className="font-bold">{locale==='es'?s.labelEs:s.label}</div>
                  <div className="text-xs opacity-60">{locale==='es'?s.sublabelEs:s.sublabel}</div>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-6">
             <h2 className="text-2xl font-black">Services</h2>
             <div className="grid md:grid-cols-2 gap-4">
               {[...STARTING_POINT_SERVICES, ...STRUCTURE_SERVICES].map(s => (
                 <div key={s.id} className={`p-5 rounded-3xl border-2 transition ${cart[s.id]?'border-slate-900 bg-white':'border-slate-100 bg-white'}`}>
                   <h3 className="font-bold text-lg">{locale==='es'?(s.titleEs||s.title):s.title}</h3>
                   <p className="text-sm text-slate-500 mb-4">{s.short}</p>
                   <button onClick={() => setCart(p => ({...p, [s.id]: p[s.id]?0:1}))} className={`w-full py-3 rounded-xl font-bold ${cart[s.id]?'bg-slate-900 text-white':'bg-slate-100 text-slate-600'}`}>
                     {cart[s.id] ? t.selected : t.addProject}
                   </button>
                 </div>
               ))}
             </div>
          </section>

          <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold mb-4">{t.notesTitle}</h2>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} placeholder={t.notesPlaceholder} className="w-full h-32 p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-slate-900" />
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl sticky top-10">
            <h2 className="text-2xl font-black mb-4">{t.summaryTitle}</h2>
            <div className="space-y-4 mb-8">
              {summary.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="opacity-70">{item.title}</span>
                  <span className="font-bold">{formatPrice(item.price)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-white/10 pt-4 mb-6">
               <div className="flex justify-between items-end">
                 <span className="text-xs uppercase font-bold opacity-50">{t.totalProject}</span>
                 <span className="text-3xl font-black">{formatPrice(summary.total)}</span>
               </div>
            </div>
            <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-bold hover:bg-slate-100 transition">
              {t.payDeposit}
            </button>
            <p className="mt-4 text-[10px] opacity-40 text-center uppercase tracking-widest">{t.phoneNote}</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default App;
