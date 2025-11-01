
import React from 'react';
import { SparklesIcon } from './Icons';

const Loader: React.FC = () => {
  const shimmerClass = 'bg-slate-700/50 animate-pulse rounded-md';

  return (
    <div className="flex flex-col items-center justify-center text-center animate-fade-in">
        <SparklesIcon className="w-16 h-16 text-cyan-400 animate-spin-slow mb-6" />
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500">
            Analyzing Your Resume...
        </h2>
        <p className="text-slate-400 mt-2">Our AI is scanning your resume for keywords, formatting, and more.</p>
        
        <div className="w-full max-w-4xl mt-12 space-y-6">
            <div className={`h-24 w-full ${shimmerClass}`}></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`h-40 w-full ${shimmerClass}`}></div>
                <div className={`h-40 w-full ${shimmerClass}`}></div>
            </div>
            <div className={`h-64 w-full ${shimmerClass}`}></div>
        </div>
    </div>
  );
};

export default Loader;
