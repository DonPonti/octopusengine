import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult } from '../types';

const GEMINI_MODEL = 'gemini-2.5-flash';

const resumeSchema = {
    type: Type.OBJECT,
    properties: {
        verdict: {
            type: Type.STRING,
            enum: ['Pass', 'Needs Improvement', 'Fail'],
            description: "The final ATS verdict for the resume."
        },
        score: {
            type: Type.INTEGER,
            description: "A score from 0 to 100 representing the resume's ATS compatibility."
        },
        strengths: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 2-4 key strengths of the resume."
        },
        weaknesses: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of 2-4 key weaknesses or areas for improvement."
        },
        highlightedText: {
            type: Type.STRING,
            description: "The full resume text, rewritten as an HTML string. Wrap strong, job-relevant keywords in `<span class='text-green-400 font-semibold'>`. Wrap average or potentially weak phrases in `<span class='text-yellow-400'>`. Do not highlight entire sentences, only keywords and short phrases."
        },
        suggestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of actionable suggestions to improve the resume for better ATS ranking. Mention critical missing keywords if any."
        }
    },
    required: ['verdict', 'score', 'strengths', 'weaknesses', 'highlightedText', 'suggestions']
};


export const analyzeResume = async (resumeText: string, jobDescription?: string): Promise<AnalysisResult> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const instructions = jobDescription ? `
**Target Job Description:**
---
${jobDescription}
---

**Instructions (Job Description Provided):**
Analyze the resume **against the provided job description**.
1.  **ATS Verdict & Score:** Determine the verdict and score based on how well the resume matches the job description's requirements, keywords, and qualifications. A score below 60 is a 'Fail'. A score between 60-80 is 'Needs Improvement'. A score above 80 is a 'Pass'.
2.  **Strengths:** List 2-4 key strengths showing strong alignment with the job description (e.g., "Contains 5 of 7 key skills listed", "Quantifiable results match role's focus on growth").
3.  **Weaknesses:** List 2-4 key weaknesses showing misalignment (e.g., "Missing critical keywords like 'SaaS' and 'Agile'", "Lacks experience in B2B markets mentioned in the job description").
4.  **Keyword Highlighting:** In the 'highlightedText', return the full resume text.
    - Wrap keywords that are present in **both** the resume and the job description in \`<span class='text-green-400 font-semibold'>\`. This is crucial.
    - Wrap generally good keywords that are not in the job description in \`<span class='text-yellow-400'>\`.
5.  **AI Suggestions:** Provide highly specific, actionable advice on how to tailor the resume to **this specific job description**. Suggest exact keywords from the job description that are missing.
` : `
**Instructions (No Job Description):**
1.  **ATS Verdict:** Determine if the resume would pass a typical ATS for a general corporate/tech role. Verdicts are 'Pass', 'Needs Improvement', or 'Fail'.
2.  **Resume Score:** Provide a score from 0 to 100 based on general keyword relevance, formatting, clarity, and overall ATS compatibility.
3.  **Strengths:** Identify the strongest sections and elements (e.g., clear action verbs, quantifiable achievements, relevant skills). List 2-4 bullet points.
4.  **Weaknesses:** Identify areas needing improvement (e.g., missing keywords, vague descriptions, poor formatting, lack of quantifiable results). List 2-4 bullet points.
5.  **Keyword Highlighting:** Return the entire resume text as an HTML string in the 'highlightedText' field. In this string:
    - Wrap strong, job-relevant keywords (like specific technologies, skills, action verbs) in \`<span class='text-green-400 font-semibold'>\`.
    - Wrap weaker phrases or buzzwords (like 'team player', 'hardworking') in \`<span class='text-yellow-400'>\`.
6.  **AI Suggestions:** Provide concrete, actionable advice for improving the resume's ATS ranking for a general audience.
`;

    const prompt = `
You are an expert ATS (Applicant Tracking System) simulator and a professional resume reviewer for top tech companies.
Your task is to analyze the provided resume text and return a structured JSON object with a detailed evaluation.
The evaluation should be strict, realistic, and helpful for a job seeker.

**Resume Text to Analyze:**
---
${resumeText}
---

${instructions}

Your entire output must be a single, valid JSON object that conforms to the specified schema.
`;

    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: resumeSchema,
                temperature: 0.2,
            },
        });
        
        const jsonText = response.text.trim();
        const result = JSON.parse(jsonText);
        return result as AnalysisResult;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get a valid response from the AI model.");
    }
};