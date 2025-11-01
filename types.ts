
export type Verdict = 'Pass' | 'Needs Improvement' | 'Fail';

export interface AnalysisResult {
  verdict: Verdict;
  score: number;
  strengths: string[];
  weaknesses: string[];
  highlightedText: string;
  suggestions: string[];
}
