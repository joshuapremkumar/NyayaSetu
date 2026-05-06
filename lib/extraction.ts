import pdfParse from 'pdf-parse';
import OpenAI from 'openai';
import { z } from 'zod';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = process.env.OPENAI_MODEL || 'gpt-4.1-mini';

export const SourceReferenceSchema = z.object({
  page: z.number(),
  paragraph: z.number(),
  snippet: z.string(),
});

export const DirectiveSchema = z.object({
  type: z.enum([
    'compliance',
    'appeal',
    'review',
    'reinstatement',
    'compensation',
    'policy_amendment',
    'administrative_action',
    'escalation',
    'stay_order',
  ]),
  content: z.string(),
  confidenceScore: z.number().min(0).max(100),
  riskLevel: z.enum(['low', 'medium', 'high']),
  responsibleDepartment: z.string(),
});

export const DeadlineSchema = z.object({
  type: z.enum(['compliance', 'appeal', 'escalation']),
  dueDate: z.string(),
  daysRemaining: z.number(),
  urgency: z.enum(['critical', 'warning', 'normal']),
});

export const ExtractionResultSchema = z.object({
  caseNumber: z.string(),
  court: z.string(),
  department: z.string(),
  filingDate: z.string(),
  directive: DirectiveSchema,
  deadlines: z.array(DeadlineSchema),
  sourceReferences: z.array(SourceReferenceSchema),
});

export type ExtractionResult = z.infer<typeof ExtractionResultSchema>;

export async function extractFromPdf(pdfBuffer: Buffer): Promise<ExtractionResult> {
  const pdfData = await pdfParse(pdfBuffer);
  const text = pdfData.text;

  const prompt = `You are a legal document analysis AI. Extract the following structured information from this court document:

1. caseNumber - the case number/identifier
2. court - the name of the court
3. department - the relevant government department
4. filingDate - the date the case was filed (ISO format: YYYY-MM-DD)
5. directive - the main judicial directive with:
   - type: one of [compliance, appeal, review, reinstatement, compensation, policy_amendment, administrative_action, escalation, stay_order]
   - content: the directive text
   - confidenceScore: 0-100
   - riskLevel: low, medium, or high
   - responsibleDepartment: which department must act
6. deadlines - array of deadlines with:
   - type: compliance, appeal, or escalation
   - dueDate: ISO format YYYY-MM-DD
   - daysRemaining: number of days from today
   - urgency: critical, warning, or normal
7. sourceReferences - array of references to where in the document this info was found:
   - page: page number
   - paragraph: paragraph number
   - snippet: exact text snippet

Return ONLY valid JSON matching this schema. Do not include any explanation or markdown formatting.

Document text:
${text.slice(0, 15000)}
`;

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: 'You are a precise legal document analyzer. Return only valid JSON.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0.1,
    max_tokens: 4000,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  const parsed = JSON.parse(content);
  return ExtractionResultSchema.parse(parsed);
}
