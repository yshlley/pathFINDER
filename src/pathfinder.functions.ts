import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { generateText } from "ai";
import { z } from "zod";

export const IntakeSchema = z.object({
  status: z.string().min(1),
  skills: z.string().min(1),
  hobbies: z.string().min(1),
  plan: z.string().min(1),
  target: z.string().default(""),
  mode: z.string().min(1),
  budget: z.string().min(1),
  region: z.string().min(1),
  province: z.string().min(1),
  city: z.string().min(1),
});
export type Intake = z.infer<typeof IntakeSchema>;

const SYSTEM = `You are PathFinder AI, a career and education guidance assistant for students and youth in the Philippines.

CORE RULES:
- Always ground guidance in verified Philippine sources: CAAP, CHED, TESDA, DOLE, PRC, UniFAST, PSA, MARINA, DepEd, PAASCU, FAAP, AACCUP, PhilSCA, PAL, Cebu Pacific, PhilJobNet.
- Never say "no information". If official data is limited, say: "Official data limited; estimate based on industry averages."
- Salaries as RANGES only. If exact number requested: "Exact amounts are not publicly disclosed; the range is based on verified DOLE/industry data. Actual pay depends on employer, experience, and contract."
- Never conflate roles and degrees (e.g. Airline Pilot vs Aeronautical Engineer are different).
- Location: if the specific city isn't a match for schools, list nearest and note: "Exact location not found; here are nearby options."

OUTPUT: Return ONLY valid JSON matching the schema. No prose outside JSON, no markdown fences.

Schema:
{
  "eligibility": { "status": "Eligible" | "Conditional" | "Not Eligible", "reason": string, "how_to_qualify": string[] },
  "paths": [ // exactly 3
    {
      "title": string,
      "description": string,
      "duration": string,
      "cost_range_php": string,
      "scholarships": string[],
      "requirements": string[],
      "timeline": string[],
      "salary_range_php": string,
      "schools": [{ "name": string, "location": string, "type": "Public"|"Private"|"TESDA"|"State University"|"Other" }],
      "next_steps": string[],
      "sources": string[]
    }
  ],
  "comparison": [ { "criterion": string, "path1": string, "path2": string, "path3": string } ],
  "deadlines": [ { "program": string, "when": string, "notes": string } ]
}`;

export const generatePaths = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => IntakeSchema.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const userPrompt = `Learner profile:
- Current status: ${data.status}
- Skills & strengths: ${data.skills}
- Hobbies & talents: ${data.hobbies}
- Next plan / goal: ${data.plan}
- Target career / field: ${data.target || "(open)"}
- Study/work mode preference: ${data.mode}
- Budget range: ${data.budget}
- Location: ${data.city}, ${data.province}, ${data.region}

Generate the JSON with 3 distinct realistic Philippine paths (mix of college, TESDA/short-course, and direct-employment or apprenticeship when applicable). Cite specific accredited schools/centers near the learner's location. Include realistic salary ranges from DOLE/industry data. Include scholarship options (UniFAST, TES, CHED, TESDA TWSP, private).`;

    const result = await generateText({
      model,
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt },
      ],
    });

    let text = result.text.trim();
    // strip markdown fences if the model added them
    if (text.startsWith("```")) text = text.replace(/^```(?:json)?\n?/, "").replace(/```\s*$/, "");
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      const first = text.indexOf("{");
      const last = text.lastIndexOf("}");
      if (first >= 0 && last > first) parsed = JSON.parse(text.slice(first, last + 1));
      else throw new Error("Model returned invalid JSON");
    }
    return parsed as PathResult;
  });

export type PathResult = {
  eligibility: { status: string; reason: string; how_to_qualify: string[] };
  paths: Array<{
    title: string;
    description: string;
    duration: string;
    cost_range_php: string;
    scholarships: string[];
    requirements: string[];
    timeline: string[];
    salary_range_php: string;
    schools: Array<{ name: string; location: string; type: string }>;
    next_steps: string[];
    sources: string[];
  }>;
  comparison: Array<{ criterion: string; path1: string; path2: string; path3: string }>;
  deadlines: Array<{ program: string; when: string; notes: string }>;
};

// Simple chat for the assistant sidebar
export const chatAsk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })) }).parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");
    const result = await generateText({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are PathFinder AI, a Philippine career & education guide. Always cite CHED, TESDA, DOLE, PRC, CAAP, UniFAST, PSA when relevant. Salaries as ranges. Never say 'no information' — if data is limited, say 'Official data limited; estimate based on industry averages.' Be concise, warm, and use bullet points.",
        },
        ...data.messages,
      ],
    });
    return { text: result.text };
  });