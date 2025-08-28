import React, { useState, useCallback, useEffect } from 'react';
import type { LogEntry, BacktestResults } from './types';
import { generateEACode } from './services/geminiService';

// --- HELPER COMPONENTS (Even More Modern UI) ---

// Icons
const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>
);

const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>
);

const FolderIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path></svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
);

const WandIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.042 4.042 7.5 11.584"/><path d="m21.5 2.5-6 6"/><path d="M12.5 21.5 2 11"/><path d="M9.5 2.5 4 8"/><path d="M16 14h.01"/><path d="M13 17h.01"/><path d="M10 20h.01"/></svg>
);

// Modern Glassmorphism Section Component
const Section: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className }) => (
  <div className={`bg-slate-900/50 backdrop-blur-sm border border-slate-700/80 shadow-2xl shadow-black/20 rounded-xl p-6 ${className}`}>
    <h2 className="text-base font-semibold text-slate-100 mb-4">{title}</h2>
    {children}
  </div>
);

// Form Element Styles
const inputStyles = "block w-full rounded-md border-0 bg-slate-800/50 py-1.5 text-slate-200 shadow-sm ring-1 ring-inset ring-slate-700 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-fuchsia-500 sm:text-sm sm:leading-6 transition-all duration-200";
const primaryButtonStyles = "inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-fuchsia-600 to-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-lg shadow-black/20 hover:from-fuchsia-500 hover:to-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200";
const secondaryButtonStyles = "inline-flex items-center gap-2 rounded-md bg-white/5 px-3.5 py-2 text-sm font-semibold text-slate-200 shadow-sm ring-1 ring-inset ring-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200";
const checkboxLabelStyles = "flex items-center gap-2 text-sm text-slate-300 select-none";
const checkboxStyles = "h-4 w-4 rounded border-slate-600 bg-slate-800/50 text-fuchsia-500 focus:ring-fuchsia-600 focus:ring-offset-slate-900 accent-fuchsia-500 transition-all duration-200";
const labelStyles = "block text-sm font-medium leading-6 text-slate-300";

// Helper to simulate async operations
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


// --- VIEW COMPONENTS (Even More Modern UI) ---

const EAGeneratorView: React.FC<any> = ({
    symbol, setSymbol, timeframe, setTimeframe, eaName, setEaName, useRandomPrompt, setUseRandomPrompt,
    strategy, setStrategy, provider, setProvider, company, setCompany, model, setModel, customModelId,
    setCustomModelId, fullAutomation, setFullAutomation, autoGenPrompts, setAutoGenPrompts, trackUsedPrompts,
    setTrackUsedPrompts, autoCompile, setAutoCompile, autoFixErrors, setAutoFixErrors, maxFixAttempts,
    setMaxFixAttempts, autoBacktest, setAutoBacktest, testAllPeriods, setTestAllPeriods, handleGenerate,
    isGenerating, logs, renderLogMessage, eaFilePath, compiledEaPath, handleCompile, isCompiling,
    handleBacktest, isBacktesting
}) => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        <div className="lg:col-span-7 flex flex-col gap-6">
            <Section title="Generation Settings">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
                    <div><label className={labelStyles}>Symbol:</label><select value={symbol} onChange={e => setSymbol(e.target.value)} className={`${inputStyles} mt-1`}><option>XAUUSD</option><option>EURUSD</option><option>GBPUSD</option><option>USDJPY</option></select></div>
                    <div><label className={labelStyles}>Timeframe:</label><select value={timeframe} onChange={e => setTimeframe(e.target.value)} className={`${inputStyles} mt-1`}><option>M1</option><option>M5</option><option>M15</option><option>H1</option><option>H4</option></select></div>
                    <div className="md:col-span-2"><label className={labelStyles}>EA Name (optional):</label><input type="text" value={eaName} onChange={e => setEaName(e.target.value)} placeholder="e.g. MyAwesomeEA" className={`${inputStyles} mt-1`} /></div>
                </div>
                 <div className="mt-4 flex items-center gap-4"><label className={checkboxLabelStyles}><input type="checkbox" className={checkboxStyles} checked={useRandomPrompt} onChange={e => setUseRandomPrompt(e.target.checked)} /> Use Random Strategy Prompt</label><span className="text-slate-400 text-xs">Available prompts: 1</span></div>
                <label className={`${labelStyles} mt-4`}>Strategy Description:</label>
                <textarea value={strategy} onChange={e => setStrategy(e.target.value)} className={`${inputStyles} mt-1 min-h-[120px] font-mono text-xs`} placeholder="e.g., A simple moving average crossover strategy..."/>
            </Section>

            <Section title="AI Model Selection">
                <div className="flex items-center gap-4 text-sm flex-wrap">
                    <span className="text-slate-300">Provider:</span>
                    <label className={checkboxLabelStyles}><input type="radio" name="provider" value="OpenAI" checked={provider === 'OpenAI'} onChange={e => setProvider(e.target.value)} className={checkboxStyles} /> OpenAI</label>
                    <label className={checkboxLabelStyles}><input type="radio" name="provider" value="OpenRouter" checked={provider === 'OpenRouter'} onChange={e => setProvider(e.target.value)} className={checkboxStyles} /> OpenRouter</label>
                    <label className={checkboxLabelStyles}><input type="radio" name="provider" value="Gemini" checked={provider === 'Gemini'} onChange={e => setProvider(e.target.value)} className={checkboxStyles} /> Gemini</label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mt-4">
                    <div><label className={labelStyles}>Company:</label><select value={company} onChange={e => setCompany(e.target.value)} className={`${inputStyles} mt-1`}><option>All</option></select></div>
                    <div><label className={labelStyles}>Model:</label><select value={model} onChange={e => setModel(e.target.value)} className={`${inputStyles} mt-1`}><option>mistralai/mistral-7b-instruct</option><option>gemini-2.5-flash</option></select></div>
                    <button className={secondaryButtonStyles}>Fetch Models</button>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mt-4">
                    <div className="md:col-span-2"><label className={labelStyles}>Custom Model ID:</label><input type="text" value={customModelId} onChange={e => setCustomModelId(e.target.value)} className={`${inputStyles} mt-1`} /></div>
                    <button className={secondaryButtonStyles}>Use Custom</button>
                </div>
            </Section>

            <Section title="Automation Options">
                <div className="space-y-3"><label className={checkboxLabelStyles}><input type="checkbox" className={checkboxStyles} checked={fullAutomation} onChange={e => setFullAutomation(e.target.checked)} /> Enable Full Automation Pipeline</label><label className={checkboxLabelStyles}><input type="checkbox" className={checkboxStyles} checked={autoGenPrompts} onChange={e => setAutoGenPrompts(e.target.checked)} /> Auto-generate new prompts when all used</label><label className={checkboxLabelStyles}><input type="checkbox" className={checkboxStyles} checked={trackUsedPrompts} onChange={e => setTrackUsedPrompts(e.target.checked)} /> Track used prompts</label></div>
                <hr className="my-4 border-slate-700" />
                <div className="flex items-center gap-x-4 gap-y-2 flex-wrap">
                    <label className={checkboxLabelStyles}><input type="checkbox" className={checkboxStyles} checked={autoCompile} onChange={e => setAutoCompile(e.target.checked)} /> Auto-compile</label>
                    <label className={checkboxLabelStyles}><input type="checkbox" className={checkboxStyles} checked={autoFixErrors} onChange={e => setAutoFixErrors(e.target.checked)} /> Auto-fix errors</label>
                    <label className={checkboxLabelStyles}>Max fix attempts: <input type="number" value={maxFixAttempts} onChange={e => setMaxFixAttempts(parseInt(e.target.value))} className={`${inputStyles} w-16 inline-block ml-1`} /></label>
                    <label className={checkboxLabelStyles}><input type="checkbox" className={checkboxStyles} checked={autoBacktest} onChange={e => setAutoBacktest(e.target.checked)} /> Auto-backtest</label>
                    <label className={checkboxLabelStyles}><input type="checkbox" className={checkboxStyles} checked={testAllPeriods} onChange={e => setTestAllPeriods(e.target.checked)} /> Test all periods</label>
                </div>
            </Section>
            
            <div className="mt-auto flex justify-end"><button onClick={handleGenerate} disabled={isGenerating} className={primaryButtonStyles}><WandIcon className="w-4 h-4" /> {isGenerating ? 'Generating...' : 'Generate EA'}</button></div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
            <Section title="Output Log" className="flex-grow flex flex-col"><div id="output-log" className="flex-grow bg-black/30 rounded-lg p-3 text-xs overflow-y-auto font-mono ring-1 ring-slate-800">{logs.length === 0 ? <span className="text-slate-500">Logs will appear here...</span> : logs.map(renderLogMessage)}</div></Section>
            <Section title="Generated EA Information">
                 <div className="grid grid-cols-1 gap-y-3"><label className={labelStyles}>EA File Path:</label> <input type="text" readOnly value={eaFilePath} className={`${inputStyles} bg-black/20`} /><label className={labelStyles}>Compiled EA:</label> <input type="text" readOnly value={compiledEaPath} className={`${inputStyles} bg-black/20`} /></div>
                <div className="flex justify-start gap-2 mt-4 flex-wrap">
                    <button className={secondaryButtonStyles}>Open File</button>
                    <button className={secondaryButtonStyles}><FolderIcon/> Open Directory</button>
                    <button onClick={handleCompile} disabled={isCompiling || !eaFilePath} className={secondaryButtonStyles}>{isCompiling ? 'Compiling...' : 'Compile'}</button>
                    <button onClick={handleBacktest} disabled={isBacktesting || !compiledEaPath} className={secondaryButtonStyles}>{isBacktesting ? 'Backtesting...' : 'Backtest'}</button>
                </div>
            </Section>
        </div>
    </div>
);

const BacktestingView: React.FC<any> = ({ symbol, setSymbol }) => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        <div className="lg:col-span-7 flex flex-col gap-6">
            <Section title="Backtest Settings">
                <div className="grid grid-cols-1 gap-y-4">
                    <div>
                        <label className={labelStyles}>EA File Path:</label>
                        <div className="flex mt-1"><input type="text" defaultValue="ss" className={`${inputStyles} rounded-r-none`} /><button className={`${secondaryButtonStyles} rounded-l-none`}><FolderIcon/> Browse</button></div>
                    </div>
                    <div><label className={labelStyles}>Compiled EA Name:</label><input type="text" className={`${inputStyles} mt-1`} /></div>
                    <div><label className={labelStyles}>Symbol:</label><select value={symbol} onChange={e => setSymbol(e.target.value)} className={`${inputStyles} mt-1`}><option>XAUUSD</option><option>EURUSD</option><option>GBPUSD</option><option>USDJPY</option></select></div>
                </div>
                <div className="mt-4">
                    <label className={labelStyles}>Time Periods:</label>
                    <div className="flex gap-4 mt-2 flex-wrap">
                        <label className={checkboxLabelStyles}><input type="checkbox" className={checkboxStyles}/> Test All Periods</label>
                        <label className={checkboxLabelStyles}><input type="checkbox" className={checkboxStyles}/> Last Day</label>
                        <label className={checkboxLabelStyles}><input type="checkbox" className={checkboxStyles}/> Last Week</label>
                        <label className={checkboxLabelStyles}><input type="checkbox" className={checkboxStyles} defaultChecked /> Last Month</label>
                        <label className={checkboxLabelStyles}><input type="checkbox" className={checkboxStyles} defaultChecked /> Last Year</label>
                    </div>
                </div>
                <div className="mt-6 flex gap-2"><button className={primaryButtonStyles}>Run Backtest</button><button className={secondaryButtonStyles}>Compile EA</button></div>
            </Section>
            <Section title="UI Image Testing">
                <div className="flex gap-2"><button className={secondaryButtonStyles}>Verify UI Images</button><button className={secondaryButtonStyles}>Calibrate Screen Positions</button></div>
            </Section>
        </div>
        <div className="lg:col-span-5 flex flex-col">
            <Section title="Backtest Results" className="flex-grow">
                 <div className="h-full border border-dashed border-slate-700 rounded-lg flex items-center justify-center p-6">
                    <p className="text-slate-500">No backtest data available</p>
                </div>
            </Section>
        </div>
    </div>
);

const PromptsManagementView: React.FC<any> = () => (
    <div className="flex flex-col gap-6">
        <Section title="Prompts Management">
            <div className="grid grid-cols-[auto,1fr,auto] gap-x-4 gap-y-4 items-center">
                <label className={labelStyles}>Current Prompts File:</label>
                <input type="text" readOnly defaultValue="e:\noah\ea_pipeline\prompts\..." className={`${inputStyles} bg-black/20`}/>
                <div className="flex gap-2">
                  <button className={secondaryButtonStyles}><FolderIcon/> Browse</button>
                  <button className={secondaryButtonStyles}><PlusIcon/> Create New</button>
                </div>

                <label className={labelStyles}>Loaded Prompts:</label>
                <p>20 prompts loaded</p>
                <span/>

                <label className={labelStyles}>Used Prompts:</label>
                <p>5 prompts used</p>
                <button className={secondaryButtonStyles}>Reset Used Prompts</button>

                <label className={labelStyles}>Generate Prompts:</label>
                <div className="flex items-center gap-2">
                    <label className={checkboxLabelStyles}>Count: <input type="number" defaultValue={20} className={`${inputStyles} w-20 inline-block ml-1`} /></label>
                </div>
                <button className={primaryButtonStyles}><WandIcon className="w-4 h-4"/> Generate New</button>
            </div>
        </Section>
        <Section title="Prompts List" className="flex-grow flex flex-col">
            <div className="bg-black/30 ring-1 ring-slate-800 rounded-lg h-64 p-2">
                {/* Prompt list would go here */}
            </div>
             <div className="flex justify-end gap-2 mt-4">
                <button className={secondaryButtonStyles}>Reload Prompts</button>
                <button className={secondaryButtonStyles}>Save Changes</button>
                <button className={secondaryButtonStyles}>Set as Default</button>
            </div>
        </Section>
    </div>
);

const SettingsView: React.FC<any> = ({ provider, setProvider, symbol, setSymbol, timeframe, setTimeframe, maxFixAttempts, setMaxFixAttempts }) => (
    <div className="flex flex-col gap-6 overflow-y-auto max-w-4xl mx-auto w-full">
        <Section title="API Settings">
             <div className="flex items-center gap-4 text-sm flex-wrap">
                <span className="text-slate-300">API Provider:</span>
                <label className={checkboxLabelStyles}><input type="radio" name="provider-settings" value="OpenAI" checked={provider === 'OpenAI'} onChange={e => setProvider(e.target.value)} className={checkboxStyles}/> OpenAI</label>
                <label className={checkboxLabelStyles}><input type="radio" name="provider-settings" value="OpenRouter" checked={provider === 'OpenRouter'} onChange={e => setProvider(e.target.value)} className={checkboxStyles}/> OpenRouter</label>
                <label className={checkboxLabelStyles}><input type="radio" name="provider-settings" value="Gemini" checked={provider === 'Gemini'} onChange={e => setProvider(e.target.value)} className={checkboxStyles}/> Gemini</label>
             </div>
            <div className="grid grid-cols-1 gap-y-4 mt-4">
                <div><label className={labelStyles}>OpenAI API Key:</label><div className="mt-1 rounded-md bg-slate-800/50 px-3 py-2 text-sm text-slate-400 ring-1 ring-inset ring-slate-700">Handled by environment variables</div></div>
                <div><label className={labelStyles}>OpenRouter API Key:</label><input type="password" defaultValue="********************************" readOnly className={`${inputStyles} mt-1 bg-black/20 font-mono`} /></div>
                <div><label className={labelStyles}>Gemini API Key:</label><div className="mt-1 rounded-md bg-slate-800/50 px-3 py-2 text-sm text-slate-400 ring-1 ring-inset ring-slate-700">Handled by environment variables</div></div>
            </div>
        </Section>
        <Section title="Paths & Directories">
             <div className="grid grid-cols-[auto,1fr,auto] gap-x-4 gap-y-4 items-center">
                <label className={labelStyles}>MT5 Terminal Path:</label>
                <input type="text" readOnly defaultValue="C:\...\terminal64.exe" className={`${inputStyles} bg-black/20`}/>
                <button className={secondaryButtonStyles}><FolderIcon/> Browse</button>

                <label className={labelStyles}>MT5 MetaEditor Path:</label>
                <input type="text" readOnly defaultValue="C:\...\metaeditor64.exe" className={`${inputStyles} bg-black/20`}/>
                <button className={secondaryButtonStyles}><FolderIcon/> Browse</button>

                <label className={labelStyles}>MT5 Experts Path:</label>
                <input type="text" readOnly defaultValue="C:\Users\...\Experts" className={`${inputStyles} bg-black/20`}/>
                <button className={secondaryButtonStyles}><FolderIcon/> Browse</button>

                <label className={labelStyles}>Ref Images Directory:</label>
                <input type="text" readOnly defaultValue="e:\...\Images2" className={`${inputStyles} bg-black/20`}/>
                <button className={secondaryButtonStyles}><FolderIcon/> Open Folder</button>
             </div>
        </Section>
        <Section title="Default Values">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-center">
                <div><label className={labelStyles}>Default Symbol:</label><select value={symbol} onChange={e => setSymbol(e.target.value)} className={`${inputStyles} mt-1`}><option>XAUUSD</option><option>EURUSD</option></select></div>
                <div><label className={labelStyles}>Default Timeframe:</label><select value={timeframe} onChange={e => setTimeframe(e.target.value)} className={`${inputStyles} mt-1`}><option>M1</option><option>M5</option></select></div>
                <div><label className={labelStyles}>Default Max Fix Attempts:</label><input type="number" value={maxFixAttempts} onChange={e => setMaxFixAttempts(parseInt(e.target.value))} className={`${inputStyles} mt-1 w-24`} /></div>
            </div>
        </Section>
    </div>
);


const App: React.FC = () => {
    // State from old app
    const [generatedCode, setGeneratedCode] = useState<string>('');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [backtestResults, setBacktestResults] = useState<BacktestResults | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [isCompiling, setIsCompiling] = useState<boolean>(false);
    const [isBacktesting, setIsBacktesting] = useState<boolean>(false);
    
    // UI state
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');
    const [activeTab, setActiveTab] = useState('EA Generator');
    
    // Generation Settings state
    const [symbol, setSymbol] = useState('XAUUSD');
    const [timeframe, setTimeframe] = useState('M1');
    const [eaName, setEaName] = useState('');
    const [useRandomPrompt, setUseRandomPrompt] = useState(true);
    const [strategy, setStrategy] = useState('');

    // AI Model Selection state
    const [provider, setProvider] = useState('OpenRouter');
    const [company, setCompany] = useState('All');
    const [model, setModel] = useState('mistralai/mistral-7b-instruct');
    const [customModelId, setCustomModelId] = useState('');

    // Automation Options state
    const [fullAutomation, setFullAutomation] = useState(false);
    const [autoGenPrompts, setAutoGenPrompts] = useState(false);
    const [trackUsedPrompts, setTrackUsedPrompts] = useState(true);
    const [autoCompile, setAutoCompile] = useState(true);
    const [autoFixErrors, setAutoFixErrors] = useState(true);
    const [maxFixAttempts, setMaxFixAttempts] = useState(3);
    const [autoBacktest, setAutoBacktest] = useState(false);
    const [testAllPeriods, setTestAllPeriods] = useState(false);
    
    // Generated EA info state
    const [eaFilePath, setEaFilePath] = useState('');
    const [compiledEaPath, setCompiledEaPath] = useState('');

    const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
        setLogs(prevLogs => [
            ...prevLogs,
            { id: Date.now() + Math.random(), timestamp: new Date().toLocaleTimeString(), message, type },
        ]);
    }, []);

    useEffect(() => {
        const logOutput = document.getElementById('output-log');
        if (logOutput) {
            logOutput.scrollTop = logOutput.scrollHeight;
        }
    }, [logs]);

    const handleGenerate = useCallback(async () => {
        setIsGenerating(true);
        setGeneratedCode('');
        setBacktestResults(null);
        setEaFilePath('');
        setCompiledEaPath('');
        setLogs([]);
        addLog(`Generating EA for ${symbol} on ${timeframe}...`, 'info');
        
        const strategyToUse = strategy.trim() === '' ? 'a simple moving average crossover strategy' : strategy;

        try {
            const code = await generateEACode(strategyToUse, symbol, timeframe);
            setGeneratedCode(code);
            const generatedEaName = eaName || `EA_${symbol}_${timeframe}_${Date.now()}`;
            const path = `C:\\MQL5\\Experts\\${generatedEaName}.mq5`;
            setEaFilePath(path);
            addLog('EA code generated successfully!', 'success');
            addLog(`File path set to: ${path}`, 'info');
            addLog('Ready for compilation.', 'info');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
            addLog(errorMessage, 'error');
        } finally {
            setIsGenerating(false);
        }
    }, [addLog, strategy, symbol, timeframe, eaName]);

    const handleCompile = useCallback(async () => {
        if (!generatedCode) {
            addLog('No generated code to compile.', 'warning');
            return;
        }
        setIsCompiling(true);
        setCompiledEaPath('');
        addLog('Starting compilation...', 'info');
        await sleep(1500);
        
        if (Math.random() > 0.8) {
            addLog('Compilation failed: Syntax error (simulated).', 'error');
        } else {
            const compiledPath = eaFilePath.replace('.mq5', '.ex5');
            setCompiledEaPath(compiledPath);
            addLog('Compilation successful!', 'success');
            addLog(`Compiled EA: ${compiledPath}`, 'info');
            addLog('Ready for backtesting.', 'info');
        }
        setIsCompiling(false);
    }, [generatedCode, addLog, eaFilePath]);

    const handleBacktest = useCallback(async () => {
        if (!compiledEaPath) {
            addLog('No compiled EA to backtest.', 'warning');
            return;
        }
        setIsBacktesting(true);
        addLog('Starting backtest...', 'info');
        await sleep(3000);
        
        const randomProfit = (Math.random() * 2000 - 500).toFixed(2);
        const profitFactor = (Math.random() * 1.5 + 0.8).toFixed(2);
        const drawdown = (Math.random() * 15 + 5).toFixed(2);
        const trades = Math.floor(Math.random() * 150 + 20);

        const results: BacktestResults = {
            netProfit: `$${randomProfit}`, profitFactor, drawdown: `${drawdown}%`, totalTrades: trades,
        };
        
        setBacktestResults(results);
        addLog('Backtest finished.', 'success');
        addLog(`  - Net Profit: ${results.netProfit}`, 'info');
        addLog(`  - Profit Factor: ${results.profitFactor}`, 'info');
        addLog(`  - Max Drawdown: ${results.drawdown}`, 'info');
        addLog(`  - Total Trades: ${results.totalTrades}`, 'info');
        setIsBacktesting(false);
    }, [compiledEaPath, addLog]);

    const renderLogMessage = (log: LogEntry) => {
        const color = {
            info: 'text-slate-400',
            success: 'text-emerald-400',
            error: 'text-red-400',
            warning: 'text-amber-400',
        }[log.type];
        return <p key={log.id} className={`whitespace-pre-wrap ${color}`}><span className="mr-2 text-slate-500">{log.timestamp}</span>{log.message}</p>;
    };
    
    const sharedProps = {
        symbol, setSymbol, timeframe, setTimeframe, eaName, setEaName, useRandomPrompt, setUseRandomPrompt,
        strategy, setStrategy, provider, setProvider, company, setCompany, model, setModel, customModelId,
        setCustomModelId, fullAutomation, setFullAutomation, autoGenPrompts, setAutoGenPrompts, trackUsedPrompts,
        setTrackUsedPrompts, autoCompile, setAutoCompile, autoFixErrors, setAutoFixErrors, maxFixAttempts,
        setMaxFixAttempts, autoBacktest, setAutoBacktest, testAllPeriods, setTestAllPeriods, handleGenerate,
        isGenerating, logs, renderLogMessage, eaFilePath, compiledEaPath, handleCompile, isCompiling,
        handleBacktest, isBacktesting
    };

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'EA Generator': return <EAGeneratorView {...sharedProps} />;
            case 'Backtesting': return <BacktestingView {...sharedProps} />;
            case 'Prompts Management': return <PromptsManagementView {...sharedProps} />;
            case 'Settings': return <SettingsView {...sharedProps} />;
            default: return null;
        }
    };
    
    const tabs = ['EA Generator', 'Backtesting', 'Prompts Management', 'Settings'];

    return (
        <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto w-full">
            <header className="px-4 flex justify-between items-center mb-4">
                <h1 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">MetaTrader 5 EA Generator</h1>
                <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                    {theme === 'dark' ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
                </button>
            </header>

            <main className="flex-grow flex flex-col">
                <div className="flex items-center space-x-2 rounded-full bg-slate-800/80 p-1 mb-6 self-start">
                    {tabs.map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300 ${activeTab === tab ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {renderActiveTab()}
            </main>
            <footer className="px-4 py-2 mt-6 text-xs text-slate-500 flex justify-between items-center">
                <span>Current Time: {new Date().toLocaleTimeString()} | User: Noah</span>
                <div className="flex items-center gap-2">
                    <span>Failed after 3 attempts</span>
                    <div className="w-24 h-2 bg-slate-700 rounded-full"><div className="h-2 bg-fuchsia-500 rounded-full" style={{width: '100%'}}></div></div>
                </div>
            </footer>
        </div>
    );
};

export default App;