import { MaterialIcon } from "@/components/marketing/MaterialIcon";

import { GlassCard } from "@/components/ui";



export interface ExampleBrief {

  id: string;

  title: string;

  description: string;

  accent: "primary" | "secondary";

  offer: string;

  targetLocation: string;

  leadGoal: number;

  decisionMakerRoles: string[];

  requiredContactFields: string[];

  researchDepth: "basic" | "medium" | "advanced";

  buyingSignals: string;

}



export const EXAMPLE_BRIEFS: ExampleBrief[] = [

  {

    id: "bedsheets-dubai",

    title: "Bedsheets in Dubai",

    description:

      "Find hotel and clinic procurement managers buying wholesale linens in Dubai.",

    accent: "primary",

    offer: "Wholesale bedsheets, linens, and hospitality textiles",

    targetLocation: "Dubai, UAE",

    leadGoal: 15,

    decisionMakerRoles: [

      "Owner",

      "General Manager",

      "Procurement Manager",

      "Operations Manager",

    ],

    requiredContactFields: ["email", "phone", "whatsapp", "linkedin"],

    researchDepth: "medium",

    buyingSignals:

      "Include newly opened businesses with public contact pages where possible.",

  },

  {

    id: "software-outsourcing",

    title: "Software Outsourcing",

    description:

      "CTOs and engineering leaders at mid-size companies seeking offshore dev teams.",

    accent: "secondary",

    offer: "Custom software development and dedicated engineering teams",

    targetLocation: "Europe",

    leadGoal: 15,

    decisionMakerRoles: ["CTO", "VP Engineering", "Head of Technology"],

    requiredContactFields: ["email", "linkedin"],

    researchDepth: "advanced",

    buyingSignals:

      "Companies hiring developers or posting RFPs for software projects in 2025-2026.",

  },

  {

    id: "packaging-manufacturing",

    title: "Industrial Packaging",

    description:

      "Operations and procurement leads at manufacturers needing custom packaging.",

    accent: "primary",

    offer: "Custom corrugated boxes and industrial packaging solutions",

    targetLocation: "Germany",

    leadGoal: 15,

    decisionMakerRoles: [

      "Procurement Manager",

      "Operations Director",

      "Plant Manager",

    ],

    requiredContactFields: ["email", "phone", "linkedin"],

    researchDepth: "medium",

    buyingSignals:

      "Manufacturing companies with active production facilities and supplier directories.",

  },

];



interface ExampleBriefsPanelProps {

  onSelect: (brief: ExampleBrief) => void;

}



/**

 * Right-rail example brief templates for any product/market.

 */

export function ExampleBriefsPanel({ onSelect }: ExampleBriefsPanelProps) {

  return (

    <aside className="flex w-full flex-col gap-6 xl:w-80">

      <GlassCard className="relative overflow-hidden rounded-xl border-white/5 bg-surface-container-low/60 p-6 shadow-xl backdrop-blur-md">

        <div className="pointer-events-none absolute top-0 right-0 size-24 rounded-bl-[100px] bg-tertiary/10 transition-transform group-hover:scale-110" />

        <div className="relative mb-2 flex items-center gap-3">

          <MaterialIcon name="travel_explore" className="text-tertiary" />

          <h3 className="text-body-base font-semibold text-on-surface">

            Deep Research Engine

          </h3>

        </div>

        <p className="relative text-body-sm text-on-surface-variant">

          Gemini Deep Research searches the live web for named decision-makers

          with cited contact details.

        </p>

      </GlassCard>



      <GlassCard className="flex-1 rounded-xl border-white/5 bg-surface-container/40 p-6 shadow-xl backdrop-blur-md">

        <h3 className="mb-4 flex items-center gap-2 font-mono text-label-mono tracking-wider text-on-surface-variant uppercase">

          <MaterialIcon name="library_books" className="text-base" />

          Example Briefs

        </h3>

        <div className="space-y-3">

          {EXAMPLE_BRIEFS.map((brief) => (

            <button

              key={brief.id}

              type="button"

              onClick={() => onSelect(brief)}

              className="group flex w-full flex-col gap-2 rounded-lg border border-transparent bg-white/5 p-4 text-left transition-all hover:border-white/10 hover:bg-white/10"

            >

              <div className="flex items-start justify-between gap-2">

                <span

                  className={`text-body-base font-medium text-on-surface transition-colors ${

                    brief.accent === "secondary"

                      ? "group-hover:text-secondary"

                      : "group-hover:text-primary"

                  }`}

                >

                  {brief.title}

                </span>

                <MaterialIcon

                  name="arrow_forward"

                  className="text-lg text-on-surface-variant opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100"

                />

              </div>

              <span className="line-clamp-2 text-body-sm text-on-surface-variant">

                {brief.description}

              </span>

            </button>

          ))}

        </div>

      </GlassCard>

    </aside>

  );

}

