import React, { useState, useCallback } from 'react';
import type { AnalysisResult } from './types';
import { analyzeResume } from './services/geminiService';
import Hero from './components/Hero';
import Results from './components/Results';
import Loader from './components/Loader';
import { OctopusLogo } from './components/Icons';

const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = useCallback(async (resumeText: string, jobDescription: string) => {
    if (!resumeText.trim()) {
      setError("Resume text cannot be empty.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const result = await analyzeResume(resumeText, jobDescription);
      setAnalysisResult(result);
    } catch (err) {
      console.error("Analysis Error:", err);
      setError("Failed to analyze the resume. The AI might be overloaded. Please try again in a moment.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setAnalysisResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }
    if (analysisResult) {
      return <Results result={analysisResult} onReset={handleReset} />;
    }
    return <Hero onAnalyze={handleAnalyze} error={error} />;
  };

  return (
    <div className="min-h-screen bg-slate-900 bg-gradient-to-br from-slate-900 to-slate-800 text-slate-200 flex flex-col">
      <main className="container mx-auto px-4 py-8 md:py-16 flex-grow">
        {renderContent()}
      </main>
      <footer className="text-center py-8 text-slate-400 border-t border-slate-800 mt-16">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6 px-4">
            <div className="flex items-center gap-3">
                <OctopusLogo className="w-8 h-8 text-cyan-400" />
                <span className="font-semibold">Octopus Resume Engine</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                <a href="#" className="hover:text-cyan-400 transition-colors">About Us</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">How It Works</a>
                <a href="#" className="hover:text-cyan-400 transition-colors">FAQ</a>
            </nav>
            <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()}. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;