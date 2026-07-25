import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const STAGE_CONTEXT: Record<string, string> = {
  idea: 'The founder has an idea and aesthetic but nothing designed yet. Focus on brand naming, concept definition, and connecting to design tools.',
  design: 'The founder has a design ready. Skip naming/concept. Focus on mockups, product selection, audience profiling, and store setup.',
  mockup: 'The founder has a product mockup. Skip design steps. Focus on store setup, pricing strategy, platform selection, and marketing plan.',
  sell: 'The founder is ready to launch. Skip all setup. Build a complete launch strategy — platforms, content, timing, and first-week playbook.',
  scaling: 'The founder already has a running brand with sales. Skip all setup and launch basics. Focus entirely on growth: what is working, what is not, how to scale revenue, improve retention, expand reach, and build a stronger brand.',
}

export async function POST(request: Request) {
  try {
    const { stage, description } = await request.json()

    if (!stage || !description) {
      return NextResponse.json({ error: 'Missing stage or description' }, { status: 400 })
    }

    const stageContext = STAGE_CONTEXT[stage] ?? STAGE_CONTEXT.idea

    const prompt = `You are sarti, an AI co-partner for young clothing brand founders (ages 16–25). A founder has just described their brand to you. Generate a complete brand analysis and roadmap for them.

FOUNDER'S STAGE: ${stage}
STAGE CONTEXT: ${stageContext}

FOUNDER'S BRAND DESCRIPTION:
${description}

Generate a JSON response with exactly this structure:
{
  "audienceReport": {
    "summary": "2-3 sentence overview of who this brand is for",
    "ageRange": "e.g. 16–22",
    "platforms": ["platform1", "platform2"],
    "contentStyle": "description of content approach",
    "priceSensitivity": "low/medium/high with brief explanation",
    "competitors": [
      { "name": "Brand Name", "url": "https://www.brandwebsite.com", "instagram": "https://www.instagram.com/brandhandle", "why": "one sentence on why they compete for the same audience" }
    ],
    "positioning": "1 sentence on where this brand fits in the market"
  },
  "roadmap": [
    {
      "phase": "Phase 1 — [name]",
      "timeframe": "e.g. Week 1–2",
      "steps": ["step 1", "step 2", "step 3"],
      "tools": ["tool1", "tool2"]
    }
  ],
  "marketingPlan": {
    "primaryPlatform": "TikTok or Instagram",
    "postingFrequency": "e.g. 3x/week",
    "contentMix": ["content type 1", "content type 2", "content type 3"],
    "firstWeekActions": ["action 1", "action 2", "action 3"],
    "budgetAdvice": "brief note on where to spend first"
  }
}

Make the roadmap 3–4 phases based on their current stage. Skip phases they've already completed. Be specific to their actual brand description — no generic advice. Keep language direct and practical, no fluff.

For competitors: pick 3–4 real existing clothing brands that genuinely target the same niche, aesthetic, and customer as this specific brand. Use real website URLs and real Instagram handles. Do not list huge generic brands like Nike or H&M unless the brand is explicitly in that lane — pick brands that are actually in the same micro-niche.

Respond with only valid JSON, no markdown formatting.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    const raw = content.text.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
    const parsed = JSON.parse(raw)
    return NextResponse.json(parsed)
  } catch (error) {
    console.error('Generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
