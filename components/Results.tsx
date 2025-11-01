import React from 'react';
import type { AnalysisResult, Verdict } from '../types';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, SparklesIcon, LightBulbIcon, DocumentTextIcon, ArrowPathIcon } from './Icons';
import Button from './Button';

interface ResultsProps {
  result: AnalysisResult;
  onReset: () => void;
}

const verdictConfig: { [key in Verdict]: { color: string; icon: React.ReactNode; text: string } } = {
  'Pass': { color: 'text-green-400', icon: <CheckCircleIcon className="w-10 h-10" />, text: 'ATS Compliant' },
  'Needs Improvement': { color: 'text-yellow-400', icon: <ExclamationTriangleIcon className="w-10 h-10" />, text: 'Needs Improvement' },
  'Fail': { color: 'text-red-400', icon: <XCircleIcon className="w-10 h-10" />, text: 'Likely to be Filtered' }
};

const Card: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 h-full">
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h3 className="text-xl font-bold text-slate-200">{title}</h3>
    </div>
    {children}
  </div>
);


const ScoreCircle: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (score / 100) * circumference;
    const colorClass = score > 80 ? 'stroke-green-400' : score > 60 ? 'stroke-yellow-400' : 'stroke-red-400';

    return (
        <div className="relative w-32 h-32 md:w-40 md:h-40">
            <svg className="w-full h-full" viewBox="0 0 120 120">
                <circle className="stroke-slate-700" strokeWidth="8" fill="transparent" r="52" cx="60" cy="60" />
                <circle
                    className={`transform -rotate-90 origin-center transition-all duration-1000 ease-out ${colorClass}`}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r="52"
                    cx="60"
                    cy="60"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl md:text-5xl font-bold ${verdictConfig[score > 80 ? 'Pass' : score > 60 ? 'Needs Improvement' : 'Fail'].color}`}>{score}</span>
                <span className="text-sm text-slate-400">/ 100</span>
            </div>
        </div>
    );
};


const Results: React.FC<ResultsProps> = ({ result, onReset }) => {
  const { verdict, score, strengths, weaknesses, highlightedText, suggestions } = result;
  const currentVerdict = verdictConfig[verdict];

  return (
    <div className="animate-fade-in space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-2">
          Octopus Analysis Complete
        </h2>
        <p className="text-lg text-slate-400">Here's how your resume stacks up against ATS filters.</p>
      </div>

      <div className="p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl flex flex-col md:flex-row items-center justify-around gap-8">
         <ScoreCircle score={score} />
         <div className="text-center md:text-left">
            <div className={`flex items-center justify-center md:justify-start gap-3 ${currentVerdict.color}`}>
                {currentVerdict.icon}
                <span className="text-3xl font-bold">{currentVerdict.text}</span>
            </div>
            <p className="text-slate-400 mt-2 max-w-md">Your resume scored {score}/100. This score reflects its compatibility with standard Applicant Tracking Systems.</p>
         </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Strong Areas" icon={<SparklesIcon className="w-6 h-6 text-green-400" />}>
          <ul className="space-y-3 text-slate-300 list-disc list-inside">
            {strengths.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </Card>

        <Card title="Areas for Improvement" icon={<ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />}>
          <ul className="space-y-3 text-slate-300 list-disc list-inside">
            {weaknesses.map((item, i) => <li key={i}>{item}</li>)}
          </ul>
        </card>
      </div>

      <Card title="Keyword Analysis" icon={<DocumentTextIcon className="w-6 h-6 text-cyan-400"/>}>
        <div 
          className="prose prose-invert prose-sm max-h-96 overflow-y-auto p-4 bg-slate-900/70 rounded-lg border border-slate-700 whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: highlightedText }}
        />
         <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-400"></span> Strong Keywords</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Average/Weak Phrases</div>
        </div>
      </Card>

      <Card title="AI Improvement Suggestions" icon={<LightBulbIcon className="w-6 h-6 text-fuchsia-400" />}>
        <ul className="space-y-3 text-slate-300 list-disc list-inside">
          {suggestions.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </Card>

      <div className="text-center pt-8">
        <Button onClick={onReset} variant="secondary">
          <ArrowPathIcon className="w-5 h-5 mr-2" />
          Analyze Another Resume
        </Button>
      </div>
    </div>
  );
};

export default Results;