import React, { useState, useCallback, useRef } from 'react';
import { UploadIcon, ClipboardIcon, OctopusLogo, SpinnerIcon, BriefcaseIcon } from './Icons';
import Button from './Button';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.3.136/build/pdf.worker.min.mjs`;

declare global {
  interface Window {
    mammoth: any;
  }
}

interface HeroProps {
  onAnalyze: (resumeText: string, jobDescription: string) => void;
  error: string | null;
}

const SAMPLE_RESUME = `
Jane Archer
Senior Product Manager
(123) 456-7890 | jane.archer@email.com | linkedin.com/in/janearcher | portfolio.com/janearcher

---

**Summary**

Innovative Senior Product Manager with over 8 years of experience leading cross-functional teams to deliver market-leading SaaS products. Expert in Agile methodologies, user-centric design, and data-driven decision-making. Successfully launched three major products from concept to market, resulting in a 40% increase in monthly recurring revenue (MRR). Passionate about building intuitive products that solve complex user problems.

---

**Experience**

**Senior Product Manager** | CloudInnovate Solutions | San Francisco, CA | Feb 2020 - Present
- Own the product roadmap and strategy for the flagship B2B analytics platform, aligning with company goals to grow enterprise accounts.
- Led a team of 10 (engineers, designers, QA) to launch a predictive analytics module, which increased user engagement by 25% and was featured in TechCrunch.
- Implemented a new user feedback loop using Pendo and Jira, decreasing the average time to resolve critical customer issues by 60%.
- Conducted comprehensive market analysis and competitor research to identify and prioritize new features, leading to a 15% uplift in customer retention.

**Product Manager** | DataStream Analytics | Boston, MA | Jul 2016 - Jan 2020
- Managed the entire lifecycle of a real-time data visualization tool, from ideation and wireframing to launch and post-launch optimization.
- Collaborated with the engineering team to refactor the main application API, improving system performance and reliability by 30%.
- Authored detailed product requirements documents (PRDs) and user stories, ensuring clear communication and alignment across all stakeholder teams.

---

**Skills**

- **Product Management:** Agile/Scrum, Product Roadmap, JIRA, Confluence, Pendo, A/B Testing, User Research, Market Analysis
- **Technical:** SQL, API Integration, Basic knowledge of HTML/CSS, Looker, Tableau
- **Methodologies:** Lean Startup, User-Centered Design, A/B Testing
- **Soft Skills:** Leadership, Communication, Stakeholder Management, Problem-Solving

---

**Education**

**Master of Business Administration (MBA)**
MIT Sloan School of Management | Cambridge, MA | Graduated: May 2016

**Bachelor of Science in Economics**
Stanford University | Stanford, CA | Graduated: June 2014
- Graduated with Honors
`;


const parseFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onerror = () => {
            reader.abort();
            reject(new Error("Failed to read the file."));
        };

        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target?.result as ArrayBuffer;
                if (!arrayBuffer) {
                    throw new Error("File content is empty or could not be read.");
                }

                if (file.type === 'text/plain') {
                    const textReader = new FileReader();
                    textReader.onload = (e) => resolve(e.target?.result as string);
                    textReader.onerror = () => reject(new Error("Failed to read text file."));
                    textReader.readAsText(file);
                    return;
                }

                if (file.type === 'application/pdf') {
                    const typedArray = new Uint8Array(arrayBuffer);
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
                        fullText += pageText + '\n';
                    }
                    resolve(fullText.trim());
                } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.name.endsWith('.docx')) {
                    if (!window.mammoth) {
                        return reject(new Error("DOCX parser is not available. Please try another format."));
                    }
                    const result = await window.mammoth.extractRawText({ arrayBuffer });
                    resolve(result.value);
                } else {
                    reject(new Error("Unsupported file type. Please upload a .pdf, .txt, or .docx file."));
                }
            } catch (err) {
                console.error("Internal parsing error:", err);
                reject(new Error(`Failed to parse ${file.name}. The file might be corrupted or in an unsupported format.`));
            }
        };

        reader.readAsArrayBuffer(file);
    });
};


const Hero: React.FC<HeroProps> = ({ onAnalyze, error }) => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (event.target) {
        event.target.value = ''; // Reset input to allow re-uploading the same file
    }
    if (!file) return;

    setIsParsing(true);
    setFileError(null);
    setFileName(file.name);
    setResumeText('');

    try {
        const fileContent = await parseFile(file);
        setResumeText(fileContent);
    } catch (err: any) {
        console.error("File parsing error:", err);
        setFileError(err.message);
        setFileName('');
    } finally {
        setIsParsing(false);
    }
  }, []);

  const handleAnalyzeClick = useCallback(() => {
    onAnalyze(resumeText, jobDescription);
  }, [onAnalyze, resumeText, jobDescription]);
  
  const handleSampleClick = useCallback(() => {
    setFileName('SampleResume.txt');
    setFileError(null);
    setResumeText(SAMPLE_RESUME);
  }, []);

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div className="flex flex-col items-center text-center">
      <OctopusLogo className="w-24 h-24 text-cyan-400 mb-4" />
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-500 mb-4">
        Octopus Resume Engine
      </h1>
      <p className="text-lg md:text-xl max-w-3xl text-slate-400 mb-8">
        Is your resume ready for modern Applicant Tracking Systems? Get a free, instant analysis from our AI. For best results, paste the job description you're applying for.
      </p>

      <div className="w-full max-w-6xl p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-2xl shadow-black/20">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".txt,.pdf,.docx"
                onChange={handleFileChange}
            />
            <button
                onClick={triggerFileSelect}
                disabled={isParsing}
                className="flex-1 flex items-center justify-center gap-3 text-lg font-semibold py-4 px-6 bg-slate-700/50 border-2 border-dashed border-slate-600 rounded-lg hover:bg-slate-700 hover:border-cyan-400 transition-all duration-300 disabled:opacity-70 disabled:cursor-wait"
            >
                {isParsing ? (
                    <>
                        <SpinnerIcon className="w-6 h-6 animate-spin"/>
                        <span>Processing...</span>
                    </>
                ) : (
                    <>
                        <UploadIcon className="w-6 h-6"/>
                        <span>{fileName || 'Upload Resume (.pdf, .txt, .docx)'}</span>
                    </>
                )}
            </button>
        </div>
        {fileError && <p className="text-red-400 my-2 text-center">{fileError}</p>}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="relative">
                <ClipboardIcon className="w-5 h-5 absolute top-4 left-4 text-slate-500" />
                <textarea
                    value={resumeText}
                    onChange={(e) => {
                        setResumeText(e.target.value);
                        if(fileName) setFileName('');
                        if(fileError) setFileError(null);
                    }}
                    placeholder="Paste your resume text here..."
                    className="w-full h-80 p-4 pl-12 bg-slate-900/70 border border-slate-700 rounded-lg resize-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-300"
                />
            </div>
            <div className="relative">
                <BriefcaseIcon className="w-5 h-5 absolute top-4 left-4 text-slate-500" />
                <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste job description here (optional, but recommended for best results)"
                    className="w-full h-80 p-4 pl-12 bg-slate-900/70 border border-slate-700 rounded-lg resize-none focus:ring-2 focus:ring-fuchsia-500 focus:border-fuchsia-500 transition-colors duration-300"
                />
            </div>
        </div>

        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button onClick={handleAnalyzeClick} disabled={!resumeText.trim()}>
                Analyze My Resume
            </Button>
            <Button onClick={handleSampleClick} variant="secondary">
                View a High-Scoring Sample
            </Button>
        </div>
      </div>
    </div>
  );
};

export default Hero;