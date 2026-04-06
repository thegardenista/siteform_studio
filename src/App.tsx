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
  RefreshCcw,
  Zap,
  MessageCircle,
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

interface SummaryItem {
  title: string;
  price: number | null;
  qty: number;
}

const WHATSAPP_NUMBER = "15551234567";

const SIZES: Size[] = [
  { id: "small", label: "Small", sublabel: "under 1/4 ac", visual: "🏠" },
  { id: "medium", label: "Medium", sublabel: "around 1/2 ac", visual: "🏡" },
  { id: "large", label: "Large", sublabel: "1/2-1 ac", visual: "🌿" },
  { id: "estate", label: "Estate", sublabel: "1-2 ac", visual: "🌳" },
];

const STARTING_POINT_SERVICES: Service[] = [
  {
    id: "on-site-start",
    title: "Site Visit + Base Plan + 3D Model",
    category: "Start",
    icon: Camera,
    pricingType: "size",
    prices: { small: 300, medium: 400, large: 550, estate: null },
    short: "We come out, collect measurements, photos, and video, and build the project base. We make the map of the yard as it is now.",
    bestFor: "Local jobs where you need real site information before anything else starts.",
    youSend: "Site address, access details, and any survey or plans you already have.",
    youGet: "Site measurements, photos, video, a 2D base plan, and a 3D model of existing conditions.",
    notIncluded: "Boundary survey, legal survey work, engineering, permits, or final design.",
  },
  {
    id: "survey-documents-start",
    title: "Remote Base Plan + 3D Model",
    category: "Start",
    icon: Map,
    pricingType: "size",
    prices: { small: 200, medium: 300, large: 450, estate: null },
    short: "No site visit. You send survey, photos, PDFs, or sketches, and we build the base remotely. This is the map of the yard based on the information you send.",
    bestFor: "Out-of-town jobs or jobs where you already have enough information to get started.",
    youSend: "Survey, photos, PDFs, redlines, measurements, or even a hand-drawn sketch on a napkin.",
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
    short: "You send your 3D model, and we clean and prep it so we can render it and make it useful.",
    bestFor: "Jobs where you already have a model and just need it cleaned up and presented properly.",
    youSend: "Your 3D model, notes, survey, PDFs, sketches, and material list.",
    youGet: "A cleaned-up model ready for rendering plus rendered views for review or presentation.",
    notIncluded: "Full redesign, engineering, permits, or rebuilding the whole job from scratch unless added separately.",
  },
  {
    id: "photo-concept-start",
    title: "One Quick Concept Image",
    category: "Start",
    icon: Trees,
    pricingType: "size",
    prices: { small: 150, medium: 150, large: 150, estate: null },
    short: "Take a site photo, send it to us, and for $150 we create one quick concept image plus a short list of suggested materials or key features.",
    bestFor: "Fast sales. This is the easiest way to show a homeowner an idea before full design work starts.",
    youSend: "Site photos, rough dimensions if you have them, and a few notes about what you want to show.",
    youGet: "One concept image and a short list of suggested materials or main features used in the concept.",
    notIncluded: "Accurate site model, construction-ready drawings, engineering, permits, or final design documentation.",
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
    id: "deck-pergola-permit",
    title: "Large Deck / Pergola Package",
    category: "Build",
    icon: ShieldCheck,
    pricingType: "quote",
    short: "3D visuals and plan set prepared so an engineer can understand the job and take it from there.",
    bestFor: "Larger deck or pergola jobs that need a clearer package before engineering.",
    youSend: "Survey, dimensions, preferred layout, and any requirements you already have.",
    youGet: "3D visuals and plans prepared for engineer review and structural follow-up.",
    notIncluded: "Structural engineering, stamped permit drawings, permit fees, or permit filing by us.",
    sampleLabel: "See sample",
  },
  {
    id: "outdoor-kitchen",
    title: "Outdoor Kitchen Package",
    category: "Build",
    icon: Box,
    pricingType: "flat",
    flatPrice: 750,
    short: "Concept layout, AutoCAD plan support, appliance zones, clearances, and 3D visuals.",
    bestFor: "You need a clean concept package before detailed utility or shop work.",
    youSend: "Site plan, rough wish list, preferred appliance notes, and size limits.",
    youGet: "A conceptual outdoor kitchen layout with plan support and 3D visuals.",
    notIncluded: "Utility design, permit documents, appliance specification package, or construction drawings.",
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
    short: "You already know what you want. We turn your idea, sketch, or markup into a clean model and presentation.",
    bestFor: "Contractors who already have the idea but need help making it look clear and sellable.",
    youSend: "Markups, sketches, references, dimensions, material list, revisions, or even a hand-drawn sketch on a napkin.",
    youGet: "A developed 3D model, review visuals, and layout support so the idea is clear before the next step.",
    notIncluded: "Engineering, permit drawings, detailed production sheets, or takeoffs unless added later.",
    helper: "This is the right choice when you are the one driving the layout.",
  },
  {
    id: "we-handle-the-design",
    title: "We Help Design It",
    category: "Idea",
    icon: Sparkles,
    pricingType: "size",
    prices: { small: 1000, medium: 1500, large: 2200, estate: null },
    short: "You send the site information and goals, and we help figure out the layout, model it, and show it clearly.",
    bestFor: "Contractors who have the lead but do not want to solve the layout alone.",
    youSend: "Survey, measurements, photos, style references, must-haves, rough budget level, and site constraints.",
    youGet: "Layout help, 3D design modeling, and review visuals.",
    notIncluded: "Engineering, permit package, stamped drawings, planting plans, takeoffs, or detailed production sheets unless added later.",
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
    youGet: "A hardscape plan showing layout, materials, and main paved areas, ready to print and show to the crew.",
    notIncluded: "Engineering, structural base design, drainage engineering, or construction details unless added separately.",
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
    bestFor: "Guys who already know the irrigation layout and just need it cleaned up on screen.",
    youSend: "Field markups, hand sketches, redlines, and any base files.",
    youGet: "Clean computer-drafted irrigation sheets, ready to print and show to the crew.",
    notIncluded: "Irrigation design, engineering, hydraulic calculations, or installation specifications.",
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
    bestFor: "You want a simple watering strategy shown before full irrigation work happens.",
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
    short: "A rough project cost built from the approved take-off using your rates, crew hours, and pricing rules.",
    bestFor: "Teams that want a working budget based on their own numbers before sending a final quote.",
    youSend: "Approved take-off, labor rates, crew hours or production assumptions, markups, equipment rates, and any material pricing you want used.",
    youGet: "A preliminary cost breakdown based on the approved scope and the pricing information you provide.",
    notIncluded: "Final bid, vendor-confirmed pricing, purchasing, or guaranteed job cost.",
    helper: "This is a planning number only. Final pricing depends on actual contractor rates, vendor quotes, site conditions, and field verification.",
    sampleLabel: "See sample",
  },
  {
    id: "budget-range",
    title: "Ballpark Budget Range",
    category: "After layout",
    icon: Calculator,
    pricingType: "size",
    prices: { small: 200, medium: 300, large: 450, estate: null },
    short: "A rough budget range based on the approved take-off and typical market pricing assumptions.",
    bestFor: "Teams that need a ballpark number before building a real estimate.",
    youSend: "Approved take-off, project location, and any notes about materials, quality level, or build expectations.",
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
    bestFor: "Best when the base and layout already exist and you now need something to send to HOA or the city.",
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
    short: "Add-on tree / CRZ overlay based on certified tree data and an approved layout.",
    bestFor: "Best when protected trees now need to be shown clearly on top of the job.",
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
    short: "Extra changes after the included round or after the layout is already locked.",
    bestFor: "When someone changes direction after approval or wants a new version.",
    youSend: "Clear revision notes and updated direction.",
    youGet: "Additional redesign time.",
    notIncluded: "A full new package unless enough hours are purchased or separately quoted.",
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
      STRUCTURE_SERVICES.some((service) => service.id === id)
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

runSelfTests();

function Pill({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "green" | "amber" }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  } as const;

  return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

function QtyControl({ value, onChange, label }: { value: number; onChange: (q: number) => void; label?: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <div className="inline-flex items-center overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, value - 1))}
          className="min-h-12 min-w-12 px-4 py-3 text-base font-bold text-slate-700 hover:bg-slate-50"
        >
          −
        </button>
        <div className="min-w-12 text-center text-sm font-bold">{value}</div>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="min-h-12 min-w-12 px-4 py-3 text-base font-bold text-slate-700 hover:bg-slate-50"
        >
          +
        </button>
      </div>
      {label ? <span className="text-xs text-slate-500">{label}</span> : null}
    </div>
  );
}

function getCardPriceLabel(service: Service, sizeId: string, quantity: number): string {
  if (service.pricingType === "quote") return "Quote";
  if (service.pricingType === "percentage") return service.displayPriceLabel ?? "+25%";
  return formatPrice(getLinePrice(service, sizeId, quantity));
}

function ServiceCard({
  service,
  selected,
  onToggle,
  sizeId,
  quantity,
  onQuantityChange,
}: {
  service: Service;
  selected: boolean;
  onToggle: () => void;
  sizeId: string;
  quantity: number;
  onQuantityChange: (q: number) => void;
}) {
  const Icon = service.icon;
  const [open, setOpen] = useState(false);
  const priceLabel = getCardPriceLabel(service, sizeId, quantity);

  return (
    <div
      className={`rounded-3xl border p-5 transition-all ${
        selected
          ? "border-slate-900 bg-slate-50 shadow-sm"
          : service.badgeLabel
          ? "border-emerald-200 bg-emerald-50/40"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-4">
          <div className={`rounded-2xl p-3 ${selected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}>
            <Icon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">{service.title}</h3>
              <Pill tone={service.pricingType === "quote" ? "amber" : "green"}>{service.pricingType === "quote" ? "Quote" : "Online"}</Pill>
              {service.badgeLabel ? <Pill tone="green">{service.badgeLabel}</Pill> : null}
            </div>
            <p className="mt-1 text-sm text-slate-500">{service.short}</p>
          </div>
          <div className="text-right font-bold text-slate-900">{priceLabel}</div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onToggle}
            className={`rounded-xl px-5 py-3 text-sm font-bold transition ${selected ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            {selected ? "Selected" : service.pricingType === "quote" ? "Add to quote" : "Add to Project"}
          </button>

          {service.quantityEnabled && selected ? <QtyControl value={quantity} onChange={onQuantityChange} label={service.quantityLabel} /> : null}

          <button type="button" onClick={() => setOpen((v) => !v)} className="rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100">
            {open ? "Hide details" : "What this includes"}
          </button>

          {service.sampleLabel ? (
            <button
              type="button"
              onClick={() => alert("Sample placeholder. Add your real PDF, image, gallery link, or Excel screenshot here.")}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              {service.sampleLabel}
            </button>
          ) : null}
        </div>

        {open ? (
          <div className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-slate-200 md:grid-cols-2">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Best for</div>
              <p className="mt-1 text-sm text-slate-700">{service.bestFor}</p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">You send</div>
              <p className="mt-1 text-sm text-slate-700">{service.youSend}</p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">You get</div>
              <p className="mt-1 text-sm text-slate-700">{service.youGet}</p>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Not included</div>
              <p className="mt-1 text-sm text-slate-700">{service.notIncluded}</p>
            </div>
            {service.helper ? <div className="md:col-span-2 rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">{service.helper}</div> : null}
          </div>
        ) : null}
      </div>
    </div>
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
  tone = "green",
}: {
  title: string;
  description: string;
  services: Service[];
  selected: Record<string, number>;
  onToggle: (id: string) => void;
  onQuantityChange: (id: string, q: number) => void;
  sizeId: string;
  tone?: "green" | "amber" | "slate";
}) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Pill tone={tone}>{tone === "amber" ? "Mixed pricing" : "Buy online"}</Pill>
      </div>
      <p className="mb-6 text-sm leading-6 text-slate-600">{description}</p>
      <div className="grid gap-4">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            selected={!!selected[service.id]}
            onToggle={() => onToggle(service.id)}
            sizeId={sizeId}
            quantity={selected[service.id] || 1}
            onQuantityChange={(q) => onQuantityChange(service.id, q)}
          />
        ))}
      </div>
    </section>
  );
}

export default function B2BPartnerConfigurator() {
  const [selectedSize, setSelectedSize] = useState<string>("small");
  const [cart, setCart] = useState<Record<string, number>>({});
  const [agreed, setAgreed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [projectNotes, setProjectNotes] = useState("");
  const [showIdeaHint, setShowIdeaHint] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [freeCallAdded, setFreeCallAdded] = useState(false);
  const summaryRef = useRef<HTMLDivElement | null>(null);

  const allServices = useMemo(
    () => [
      ...STARTING_POINT_SERVICES,
      ...STRUCTURE_SERVICES,
      ...DESIGN_DIRECTION_SERVICES,
      ...NEXT_PHASE_SERVICES,
      ...RARE_TECHNICAL_SERVICES,
      ...HOURLY_SERVICES,
    ],
    []
  );

  const summary = useMemo(() => {
    const selectedServices = allServices.filter((service) => cart[service.id]);

    let baseTotal = 0;
    let needsQuote = false;

    selectedServices.forEach((service) => {
      const qty = cart[service.id] || 1;
      if (service.pricingType === "quote") {
        needsQuote = true;
        return;
      }
      if (service.pricingType === "percentage") return;
      const price = getLinePrice(service, selectedSize, qty);
      if (price !== null) baseTotal += price;
    });

    const items: SummaryItem[] = selectedServices.map((service) => {
      const qty = cart[service.id] || 1;
      if (service.pricingType === "quote") return { title: service.title, price: null, qty };
      if (service.pricingType === "percentage") {
        const price = Math.round(baseTotal * (service.percentRate ?? 0));
        return { title: service.title, price, qty };
      }
      return { title: service.title, price: getLinePrice(service, selectedSize, qty), qty };
    });

    const total = items.reduce((sum, item) => (item.price === null ? sum : sum + item.price), 0);
    const deposit = Math.round(total * 0.7);
    const remaining = total - deposit;

    return { items, total, deposit, remaining, needsQuote };
  }, [allServices, cart, selectedSize]);

  const requestBody = useMemo(() => {
    const size = SIZES.find((s) => s.id === selectedSize);
    const lines = [`PROPERTY: ${size?.label} (${size?.sublabel})`, `---`, `SERVICES:`];

    if (summary.items.length === 0) {
      lines.push(`- None selected`);
    } else {
      summary.items.forEach((item) => {
        const priceText = item.price === null ? "QUOTE" : formatPrice(item.price);
        lines.push(`- ${item.title}${item.qty > 1 ? ` (x${item.qty})` : ""}: ${priceText}`);
      });
    }

    lines.push(`---`);
    lines.push(`PHOTOS / FILES: Will be sent via WhatsApp chat`);

    if (!summary.needsQuote && summary.total > 0) {
      lines.push(`---`);
      lines.push(`TOTAL: ${formatPrice(summary.total)}`);
      lines.push(`DEPOSIT (70%): ${formatPrice(summary.deposit)}`);
      lines.push(`BALANCE AFTER COMPLETION: ${formatPrice(summary.remaining)}`);
    }

    if (projectNotes.trim()) {
      lines.push(`---`);
      lines.push(`NOTES:`);
      lines.push(projectNotes.trim());
    }

    return lines.join("\n");
  }, [projectNotes, selectedSize, summary]);

  const whatsappHref = useMemo(
    () => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(requestBody)}`,
    [requestBody]
  );

  const scrollToSummary = () => {
    summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const toggleService = (id: string) => {
    setCart((prev) => {
      const next = { ...prev };
      const isStarting = STARTING_POINT_SERVICES.some((s) => s.id === id);
      const isDesign = DESIGN_DIRECTION_SERVICES.some((s) => s.id === id);
      const isLaterPhase = NEXT_PHASE_SERVICES.some((s) => s.id === id) || RARE_TECHNICAL_SERVICES.some((s) => s.id === id);

      if (isLaterPhase && !hasLayoutSourceSelection(Object.keys(prev))) {
        setShowIdeaHint(true);
        return prev;
      }

      setShowIdeaHint(false);

      if (isStarting) {
        STARTING_POINT_SERVICES.forEach((s) => delete next[s.id]);
      }

      if (isDesign) {
        DESIGN_DIRECTION_SERVICES.forEach((s) => delete next[s.id]);
      }

      if (next[id]) delete next[id];
      else next[id] = 1;

      return next;
    });
  };

  const changeQty = (id: string, qty: number) => {
    setCart((prev) => ({ ...prev, [id]: qty }));
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(requestBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFreeCall = () => {
    setFreeCallAdded(true);
    setProjectNotes((prev) =>
      prev.trim()
        ? prev
        : "Please call me first. I am not sure which option fits this job and want help choosing the right path."
    );
    scrollToSummary();
    setTimeout(() => setFreeCallAdded(false), 2200);
  };

  const handlePrimaryAction = () => {
    if (summary.items.length === 0) return;
    if (!agreed) {
      setAttemptedSubmit(true);
      scrollToSummary();
      return;
    }
    alert(summary.needsQuote ? "Quote request placeholder." : "Deposit checkout placeholder.");
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 md:pb-10 p-4 font-sans text-slate-900 md:p-10">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <header>
            <h1 className="text-3xl font-black tracking-tight">Partner Configurator</h1>
            <p className="mt-1 text-sm text-slate-500">The Gardenista LLC • White-label Drafting & Production</p>
          </header>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-400">1. Property size</h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {SIZES.map((size) => (
                <button
                  key={size.id}
                  type="button"
                  onClick={() => setSelectedSize(size.id)}
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    selectedSize === size.id
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-100 bg-slate-50 hover:border-slate-200"
                  }`}
                >
                  <div className="mb-2 text-2xl leading-none">{size.visual}</div>
                  <div className="text-sm font-bold">{size.label}</div>
                  <div className="text-[10px] opacity-70">{size.sublabel}</div>
                </button>
              ))}
            </div>
          </section>

          <ServiceSection
            title="2. Fastest way to sell the job"
            description="If you just need something quick to show the homeowner, start here. This is the easiest low-cost way to turn a phone photo into something sellable."
            services={STARTING_POINT_SERVICES.filter((service) => service.id === "photo-concept-start")}
            selected={cart}
            onToggle={toggleService}
            onQuantityChange={changeQty}
            sizeId={selectedSize}
            tone="green"
          />

          <ServiceSection
            title="3. What are you trying to build?"
            description="Pick the thing you are actually trying to sell or build: deck, pergola, outdoor kitchen, wall, or another small feature."
            services={STRUCTURE_SERVICES}
            selected={cart}
            onToggle={toggleService}
            onQuantityChange={changeQty}
            sizeId={selectedSize}
            tone="amber"
          />

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-3 flex items-center gap-3">
              <h2 className="text-2xl font-bold">4. Need the whole project designed?</h2>
              <Pill tone="green">Full design path</Pill>
            </div>
            <p className="text-sm leading-6 text-slate-600">
              If this job is bigger than one structure and you need the whole space laid out, this is where the full design path starts.
              First we choose how we are starting the job, then we choose whether you already have the idea or want us to help shape it.
            </p>
          </section>

          <ServiceSection
            title="5. How are we starting this job?"
            description="Pick one real starting point. Site visit, remote base from files, or your own 3D model."
            services={STARTING_POINT_SERVICES.filter((service) => service.id !== "photo-concept-start")}
            selected={cart}
            onToggle={toggleService}
            onQuantityChange={changeQty}
            sizeId={selectedSize}
            tone="green"
          />

          {showIdeaHint ? (
            <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900 shadow-sm">
              Before we draw plans, run quantities, or price from the layout, we need to know who owns the idea. Pick one option below: either you bring the idea and we draw it, or we help shape the layout with you.
            </div>
          ) : null}

          <ServiceSection
            title="6. Who has the idea?"
            description="To order plans and pricing work, we need to know whether you already have the layout in your head or want help shaping it."
            services={DESIGN_DIRECTION_SERVICES}
            selected={cart}
            onToggle={toggleService}
            onQuantityChange={changeQty}
            sizeId={selectedSize}
            tone="green"
          />

          <ServiceSection
            title="7. Plans, quantities, and pricing after layout is approved"
            description="Use these only after the layout is locked on your side. If your client changes their mind later, that counts as redesign and is extra paid work."
            services={NEXT_PHASE_SERVICES}
            selected={cart}
            onToggle={toggleService}
            onQuantityChange={changeQty}
            sizeId={selectedSize}
            tone="green"
          />

          <ServiceSection
            title="8. City / HOA add-ons"
            description="Use these only when the city, HOA, or tree rules force extra paperwork. Prices shown here assume we already have the base and locked layout."
            services={RARE_TECHNICAL_SERVICES}
            selected={cart}
            onToggle={toggleService}
            onQuantityChange={changeQty}
            sizeId={selectedSize}
            tone="amber"
          />

          <ServiceSection
            title="9. Need help or extra time?"
            description="Add these for calls, extra site time, travel, redesign, or rush scheduling."
            services={HOURLY_SERVICES}
            selected={cart}
            onToggle={toggleService}
            onQuantityChange={changeQty}
            sizeId={selectedSize}
            tone="amber"
          />

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-bold">10. Project notes</h2>
            <p className="mt-2 text-sm text-slate-500">
              Add anything useful here: where the files are messy, what the client is asking for, whether the job is local or remote, or what part is still unclear. Do not worry about uploading photos here. You can send photos, sketches, and videos directly in WhatsApp after you hit the button below.
            </p>
            <textarea
              value={projectNotes}
              onChange={(e) => setProjectNotes(e.target.value)}
              rows={6}
              placeholder="Don't worry about photos here. You can send them directly in the chat after you hit the button below. Example: Need a small deck package for HOA first. Homeowner only has phone photos and a rough sketch. If they like it, we will add patio plan and material quantities next."
              className="mt-5 w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400"
            />
          </section>
        </div>

        <aside ref={summaryRef} className="h-fit lg:sticky lg:top-8">
          <div className="space-y-6 rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-xl">
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-white p-3 text-emerald-700 ring-1 ring-emerald-200">
                  <Phone size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900">I’m confused, just call me</h3>
                  <p className="mt-1 text-sm text-slate-600">Free first call. Good if you are not sure which path fits this job yet.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleFreeCall}
                className="mt-4 w-full rounded-2xl bg-emerald-600 px-4 py-4 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Request free call
              </button>
              {freeCallAdded ? <p className="mt-3 text-xs font-medium text-emerald-800">Free call request added to your notes.</p> : null}
            </div>

            <div>
              <h2 className="text-xl font-black tracking-tight">Summary</h2>
              <p className="mt-1 text-sm text-slate-500">
                Full total is shown here. Only the 70% deposit is charged now for priced items so the work can be scheduled.
              </p>
            </div>

            <div className="space-y-3">
              {summary.items.length === 0 ? (
                <p className="text-sm italic text-slate-400">No services selected</p>
              ) : (
                summary.items.map((item, idx) => (
                  <div key={`${item.title}-${idx}`} className="flex justify-between gap-4 text-sm">
                    <span className="text-slate-500">
                      {item.title}
                      {item.qty > 1 ? ` (x${item.qty})` : ""}
                    </span>
                    <span className="font-bold text-slate-900">{formatPrice(item.price)}</span>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 pt-6">
              <div className="mb-4 flex items-end justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Project</span>
                <span className="text-3xl font-black">{formatPrice(summary.total)}</span>
              </div>

              {!summary.needsQuote && summary.total > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <span className="text-[10px] font-black uppercase text-emerald-700">Deposit (70%)</span>
                    <span className="text-lg font-black text-emerald-700">{formatPrice(summary.deposit)}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-slate-100 p-4">
                    <span className="text-[10px] font-black uppercase text-slate-600">Balance after completion</span>
                    <span className="text-lg font-black text-slate-700">{formatPrice(summary.remaining)}</span>
                  </div>
                </div>
              ) : null}

              {summary.needsQuote ? (
                <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
                  One or more selected items need project-specific review before final pricing.
                </div>
              ) : null}
            </div>

            <button
              type="button"
              disabled={summary.items.length === 0}
              onClick={handlePrimaryAction}
              className="w-full rounded-2xl bg-slate-900 py-4 font-bold text-white transition hover:bg-black disabled:bg-slate-200 disabled:text-slate-400"
            >
              {summary.needsQuote ? "Request Quote" : "Pay 70% Deposit"}
            </button>

            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-900">
              <div className="font-bold">Step 2: Send photos via WhatsApp</div>
              <p className="mt-1">
                Once you submit this request, the WhatsApp chat will open. Just attach your site photos, sketches, or videos there. It is the fastest way for us to see what you see.
              </p>
            </div>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              <MessageCircle size={18} />
              Send to WhatsApp
            </a>

            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 transition hover:text-slate-900"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy request"}
            </button>

            <label
              className={`flex gap-3 rounded-2xl border p-4 text-[12px] leading-relaxed ${
                attemptedSubmit && !agreed
                  ? "border-red-300 bg-red-50 text-red-800"
                  : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (e.target.checked) setAttemptedSubmit(false);
                }}
                className="mt-1 h-5 w-5 rounded border-slate-300 accent-slate-900"
              />
              <span>
                I understand you are ordering work for your company. Once the layout is locked on your side, later layout changes count as redesign and require extra paid redesign time or a new design purchase.
              </span>
            </label>
            {attemptedSubmit && !agreed ? (
              <p className="text-sm font-medium text-red-600">Please check the agreement box before continuing.</p>
            ) : null}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Request Summary</div>
              <textarea
                readOnly
                value={requestBody}
                className="mt-3 h-56 w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700"
              />
            </div>

            <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-500">
              Replace the placeholder WhatsApp number in the code with your real business number before publishing.
            </div>
          </div>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-3 backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current total</div>
            <div className="text-lg font-black text-slate-900">{formatPrice(summary.total)}</div>
          </div>
          <button
            type="button"
            onClick={scrollToSummary}
            className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
          >
            Check Summary
          </button>
        </div>
      </div>
    </div>
  );
}
