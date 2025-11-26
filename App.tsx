
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import TerminalLog from './components/TerminalLog';
import DashboardStats from './components/DashboardStats';
import VulnerabilityList from './components/VulnerabilityList';
import AuthPage from './components/AuthPage';
import { generateRemediationReport, analyzeTargetSurface } from './services/geminiService';
import { db } from './services/database';
import { EngineStatus, LogEntry, ScanConfig, ScanStats, Severity, Vulnerability, User } from './types';
import { Play, Square, Settings2, Search, AlertTriangle, ChevronRight, Download, FileText, ArrowLeft, Shield, History, CheckCircle2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const App: React.FC = () => {
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // --- App State ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [status, setStatus] = useState<EngineStatus>(EngineStatus.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [vulns, setVulns] = useState<Vulnerability[]>([]);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [reportCache, setReportCache] = useState<Record<string, string>>({});
  const [selectedVulnId, setSelectedVulnId] = useState<string | null>(null);
  
  const [config, setConfig] = useState<ScanConfig>({
    targetUrl: 'https://example-target.com',
    engines: {
      recon: true,
      fuzzing: true,
      custom: false,
      reporting: true
    },
    aggressionLevel: 'standard'
  });

  const [stats, setStats] = useState<ScanStats>({
    requests: 0,
    duration: 0,
    vulnsFound: 0,
    criticalCount: 0,
    highCount: 0,
    subdomains: 0,
  });

  // --- Refs for Interval Management ---
  const statsIntervalRef = useRef<number | null>(null);
  const logIntervalRef = useRef<number | null>(null);

  // --- Initialization & Auth Check ---
  useEffect(() => {
    // Initialize DB (seed admin if needed)
    db.init();
    
    // Check for active session
    const session = db.getSession();
    if (session) {
      setUser(session);
    }
    setAuthLoading(false);
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await db.logout();
    setUser(null);
    setStatus(EngineStatus.IDLE);
    setActiveTab('dashboard');
    // Clear simulation intervals if running
    if (statsIntervalRef.current) window.clearInterval(statsIntervalRef.current);
    if (logIntervalRef.current) window.clearInterval(logIntervalRef.current);
  };

  // --- Simulation Logic ---
  const addLog = useCallback((msg: string, type: LogEntry['type'] = 'info', module: string = 'SYSTEM') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString().split('T')[1].split('.')[0],
      message: msg,
      type,
      module
    }]);
  }, []);

  const stopScan = useCallback(() => {
    setStatus(EngineStatus.COMPLETED);
    if (statsIntervalRef.current) window.clearInterval(statsIntervalRef.current);
    if (logIntervalRef.current) window.clearInterval(logIntervalRef.current);
    addLog('Scan process terminated by user or completion.', 'warning', 'CORE');
  }, [addLog]);

  const startScan = useCallback(() => {
    setStatus(EngineStatus.RUNNING);
    setLogs([]);
    setVulns([]);
    setAiReport(null);
    setReportCache({});
    setSelectedVulnId(null);
    setStats({ requests: 0, duration: 0, vulnsFound: 0, criticalCount: 0, highCount: 0, subdomains: 0 });
    setActiveTab('scan');

    addLog(`Initializing SentinelFuzz Pro v2.5.0`, 'info', 'CORE');
    addLog(`Target locked: ${config.targetUrl}`, 'info', 'CORE');
    
    if (config.engines.recon) {
      addLog('Engine A (Recon) initialized. Enumerating subdomains...', 'info', 'RECON');
    }

    // Simulate Stats Ticking
    statsIntervalRef.current = window.setInterval(() => {
      setStats(prev => ({
        ...prev,
        requests: prev.requests + Math.floor(Math.random() * 50) + 10,
        duration: prev.duration + 1
      }));
    }, 1000);

    // Simulate Logs and Findings Sequence
    let step = 0;
    const subdomains = ['api', 'dev', 'staging', 'admin-portal', 'legacy'];
    
    logIntervalRef.current = window.setInterval(() => {
      step++;
      
      // RECON PHASE
      if (step < 10 && config.engines.recon) {
        if (Math.random() > 0.6) {
          const sub = subdomains[Math.floor(Math.random() * subdomains.length)];
          addLog(`Discovered subdomain: ${sub}.${config.targetUrl.replace('https://', '')}`, 'success', 'RECON');
          setStats(prev => ({ ...prev, subdomains: prev.subdomains + 1 }));
        }
      }

      // TRANSITION TO FUZZING
      if (step === 12) {
        addLog('Recon complete. Map built. Initializing Engine B (Fuzzing)...', 'info', 'CORE');
      }

      // FUZZING PHASE
      if (step > 15 && step < 40 && config.engines.fuzzing) {
        addLog(`Injecting payloads into param 'q' at /search...`, 'info', 'FUZZ');
        
        // Random Vulnerability Discovery
        if (Math.random() > 0.85) {
          const isCrit = Math.random() > 0.5;
          const newVuln: Vulnerability = {
            id: Math.random().toString(),
            title: isCrit ? 'SQL Injection (Union Based)' : 'Reflected XSS',
            description: 'Input parameter was reflected without sanitization',
            severity: isCrit ? Severity.CRITICAL : Severity.MEDIUM,
            endpoint: isCrit ? '/api/v1/login' : '/search?q=',
            payload: isCrit ? "' OR 1=1 --" : "<script>alert(1)</script>",
            timestamp: Date.now()
          };
          
          setVulns(prev => [...prev, newVuln]);
          setStats(prev => ({
            ...prev,
            vulnsFound: prev.vulnsFound + 1,
            criticalCount: isCrit ? prev.criticalCount + 1 : prev.criticalCount,
            highCount: !isCrit && isCrit ? prev.highCount + 1 : prev.highCount 
          }));
          addLog(`VULNERABILITY DETECTED: ${newVuln.title}`, 'error', 'FUZZ');
        }
      }

      // COMPLETION
      if (step > 45) {
        stopScan();
        addLog('Scan cycle complete. Generating summary report...', 'success', 'REPORT');
        if (config.engines.reporting) {
            // Auto analyze surface if report engine is on
            analyzeTargetSurface(config.targetUrl, subdomains).then(res => {
                // Just logging it for simulation feel, actual report is on demand
                addLog('Surface analysis complete.', 'info', 'AI-AGENT');
            });
        }
      }

    }, 800);
  }, [config, addLog, stopScan]);


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statsIntervalRef.current) window.clearInterval(statsIntervalRef.current);
      if (logIntervalRef.current) window.clearInterval(logIntervalRef.current);
    };
  }, []);

  // --- Handlers ---
  const handleAIAnalysis = async (vuln: Vulnerability) => {
    setActiveTab('reports');
    setSelectedVulnId(vuln.id);
    
    // Check cache first
    if (reportCache[vuln.id]) {
      setAiReport(reportCache[vuln.id]);
      return;
    }

    setAiLoading(true);
    setAiReport(null);
    const report = await generateRemediationReport(vuln);
    setReportCache(prev => ({ ...prev, [vuln.id]: report }));
    setAiReport(report);
    setAiLoading(false);
  };

  const handleBackToReports = () => {
    setSelectedVulnId(null);
    setAiReport(null);
  };

  const generatedReports = vulns.filter(v => reportCache[v.id]);
  const pendingReports = vulns.filter(v => !reportCache[v.id]);

  if (authLoading) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="flex h-screen bg-background text-text font-sans selection:bg-primary/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
      
      <main className="flex-1 lg:ml-64 p-6 overflow-y-auto relative">
        {/* Header Bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              {activeTab === 'dashboard' && 'Mission Control'}
              {activeTab === 'scan' && 'Live Operations'}
              {activeTab === 'vulns' && 'Vulnerability Matrix'}
              {activeTab === 'reports' && 'Intelligence Reports'}
              {activeTab === 'config' && 'System Configuration'}
            </h1>
            <p className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Operator: <span className="text-white font-mono">{user.name}</span> 
              <span className="text-zinc-600">|</span> 
              ID: {user.id.split('_')[1]}
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-surface p-2 rounded-lg border border-zinc-800">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
               <input 
                 type="text" 
                 value={config.targetUrl}
                 onChange={(e) => setConfig({...config, targetUrl: e.target.value})}
                 disabled={status === EngineStatus.RUNNING}
                 className="bg-black/30 border-none rounded pl-9 pr-4 py-2 text-sm w-64 focus:ring-1 focus:ring-primary outline-none"
                 placeholder="Enter Target URL"
               />
             </div>
             {status === EngineStatus.RUNNING ? (
               <button onClick={stopScan} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded border border-red-500/20 transition-colors">
                 <Square className="w-5 h-5 fill-current" />
               </button>
             ) : (
               <button onClick={startScan} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-emerald-400 text-black font-bold rounded transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                 <Play className="w-4 h-4 fill-current" />
                 START SCAN
               </button>
             )}
          </div>
        </header>

        {/* Content Area */}
        <div className="min-h-[calc(100vh-200px)]">
          
          {activeTab === 'dashboard' && (
            <DashboardStats stats={stats} />
          )}

          {activeTab === 'scan' && (
             <div className="h-[70vh] grid grid-cols-1 lg:grid-cols-3 gap-6">
               <div className="lg:col-span-2 h-full">
                 <TerminalLog logs={logs} />
               </div>
               <div className="space-y-6 h-full overflow-y-auto">
                 <div className="bg-surface p-4 rounded-xl border border-zinc-800">
                   <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Live Metrics</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-500">Status</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${status === EngineStatus.RUNNING ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-700 text-zinc-300'}`}>
                          {status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm text-zinc-500">Duration</span>
                         <span className="font-mono text-white">{stats.duration}s</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full animate-[pulse_2s_infinite]" style={{width: status === EngineStatus.RUNNING ? '100%' : '0%'}}></div>
                      </div>
                   </div>
                 </div>

                 <div className="bg-surface p-4 rounded-xl border border-zinc-800">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Active Engines</h3>
                    <div className="space-y-2">
                      {Object.entries(config.engines).map(([key, active]) => (
                        <div key={key} className="flex items-center justify-between p-2 rounded bg-black/20">
                          <span className="capitalize text-sm text-zinc-300">{key}</span>
                          <div className={`w-2 h-2 rounded-full ${active ? (status === EngineStatus.RUNNING ? 'bg-emerald-500 animate-pulse' : 'bg-emerald-500') : 'bg-zinc-700'}`} />
                        </div>
                      ))}
                    </div>
                 </div>
               </div>
             </div>
          )}

          {activeTab === 'vulns' && (
            <VulnerabilityList vulns={vulns} onAnalyze={handleAIAnalysis} />
          )}

          {activeTab === 'reports' && (
            <div className="bg-surface rounded-xl border border-zinc-800 min-h-[600px] flex flex-col">
              
              {/* No vulnerability selected state - Show Selection List */}
              {!selectedVulnId && (
                <div className="p-8">
                  <div className="flex flex-col items-center justify-center text-center mb-8">
                    <FileText className="w-12 h-12 mb-3 text-zinc-600" />
                    <h3 className="text-xl font-semibold text-white">Security Intelligence Center</h3>
                    <p className="text-zinc-500 max-w-md">Select a detected vulnerability below to generate a comprehensive AI-driven remediation report.</p>
                  </div>

                  {vulns.length === 0 ? (
                     <div className="bg-black/20 rounded-lg p-6 text-center border border-dashed border-zinc-800">
                       <Shield className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                       <p className="text-zinc-500">No vulnerabilities detected to analyze.</p>
                       <button onClick={() => setActiveTab('scan')} className="mt-3 text-primary hover:underline text-sm">
                         Start a scan first
                       </button>
                     </div>
                  ) : (
                    <div className="space-y-10">
                      
                      {/* Generated Reports History */}
                      {generatedReports.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                          <h4 className="text-emerald-500 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                            <History className="w-4 h-4" /> Generated Reports History
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {generatedReports.map((vuln) => (
                              <button 
                                key={vuln.id}
                                onClick={() => handleAIAnalysis(vuln)}
                                className="group relative flex flex-col items-start p-5 bg-emerald-900/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-900/20 hover:border-emerald-500/40 transition-all text-left"
                              >
                                <div className="absolute top-4 right-4 text-emerald-500">
                                  <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <h4 className="font-semibold text-emerald-100 mb-1 line-clamp-1 pr-8">{vuln.title}</h4>
                                <code className="text-xs text-emerald-500/70 font-mono mb-3 max-w-full truncate">
                                  {vuln.endpoint}
                                </code>
                                <div className="mt-auto w-full flex items-center justify-between text-xs text-emerald-400">
                                  <span>View Cached Report</span>
                                  <ChevronRight className="w-3 h-3" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Pending Analysis */}
                      {pendingReports.length > 0 && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                          <h4 className="text-zinc-400 text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                             <Shield className="w-4 h-4" /> Pending Analysis
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {pendingReports.map((vuln) => (
                              <button 
                                key={vuln.id}
                                onClick={() => handleAIAnalysis(vuln)}
                                className="group relative flex flex-col items-start p-5 bg-black/20 border border-zinc-800 rounded-xl hover:bg-zinc-800/50 hover:border-primary/30 transition-all text-left"
                              >
                                <div className={`absolute top-4 right-4 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${
                                  vuln.severity === Severity.CRITICAL ? 'text-red-500 bg-red-500/10 border-red-500/20' : 
                                  vuln.severity === Severity.HIGH ? 'text-orange-500 bg-orange-500/10 border-orange-500/20' :
                                  'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
                                }`}>
                                  {vuln.severity}
                                </div>
                                
                                <div className="mb-3 p-2 bg-zinc-900 rounded-lg group-hover:bg-zinc-800 transition-colors">
                                  <Shield className={`w-5 h-5 ${
                                    vuln.severity === Severity.CRITICAL ? 'text-red-500' : 'text-orange-400'
                                  }`} />
                                </div>
                                
                                <h4 className="font-semibold text-zinc-200 group-hover:text-white mb-1 line-clamp-1">{vuln.title}</h4>
                                <code className="text-xs text-zinc-500 font-mono bg-black/30 px-1.5 py-0.5 rounded mb-3 max-w-full truncate">
                                  {vuln.endpoint}
                                </code>
                                
                                <div className="mt-auto w-full flex items-center justify-between text-xs text-zinc-600 group-hover:text-primary transition-colors">
                                  <span>Generate Report</span>
                                  <ChevronRight className="w-3 h-3" />
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Loading State */}
              {selectedVulnId && aiLoading && (
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                   <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-6"></div>
                   <h3 className="text-xl font-bold text-white animate-pulse">Analyzing Vector...</h3>
                   <div className="text-zinc-500 mt-2 text-sm flex flex-col items-center gap-1">
                     <span>Querying Gemini 2.5 Flash Security Model</span>
                     <span className="font-mono text-xs opacity-50">Context: {vulns.find(v => v.id === selectedVulnId)?.title}</span>
                   </div>
                </div>
              )}

              {/* Report Display */}
              {selectedVulnId && aiReport && !aiLoading && (
                <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/30">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={handleBackToReports}
                        className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-zinc-700"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div>
                        <h2 className="text-xl font-bold text-white">Vulnerability Analysis</h2>
                        <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono mt-0.5">
                           <span>ID: {selectedVulnId.split('-')[0]}...</span>
                           <span>•</span>
                           <span className="text-emerald-500">AI Generated</span>
                           {reportCache[selectedVulnId] && <span className="text-zinc-600">(Cached)</span>}
                        </div>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 text-sm bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-lg border border-primary/20 transition-colors">
                      <Download className="w-4 h-4" />
                      Export Report
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-8">
                    <article className="prose prose-invert prose-headings:text-emerald-400 prose-p:text-zinc-300 prose-a:text-blue-400 prose-code:text-orange-300 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-800 max-w-4xl mx-auto">
                      <ReactMarkdown>{aiReport}</ReactMarkdown>
                    </article>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'config' && (
             <div className="grid md:grid-cols-2 gap-8">
               <div className="bg-surface p-6 rounded-xl border border-zinc-800">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Settings2 className="w-5 h-5" /> Engine Configuration
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(config.engines).map(([key, value]) => (
                      <label key={key} className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-all">
                        <div className="flex flex-col">
                           <span className="capitalize font-medium text-zinc-200">{key} Engine</span>
                           <span className="text-xs text-zinc-500">
                             {key === 'recon' && 'Subdomains, VHosts, Directory Enumeration'}
                             {key === 'fuzzing' && 'Payload Injection (SQLi, XSS, RCE)'}
                             {key === 'custom' && 'User-defined wordlists and scenarios'}
                             {key === 'reporting' && 'AI-driven analysis and PDF generation'}
                           </span>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors ${value ? 'bg-primary' : 'bg-zinc-700'}`}
                             onClick={() => setConfig(p => ({...p, engines: {...p.engines, [key]: !value}}))}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${value ? 'translate-x-6' : 'translate-x-0'}`} />
                        </div>
                      </label>
                    ))}
                  </div>
               </div>

               <div className="bg-surface p-6 rounded-xl border border-zinc-800">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Aggression Profile
                  </h3>
                  <div className="space-y-4">
                    {['stealth', 'standard', 'aggressive'].map((level) => (
                      <button
                        key={level}
                        onClick={() => setConfig(prev => ({ ...prev, aggressionLevel: level as any }))}
                        className={`w-full text-left p-4 rounded-lg border transition-all flex items-center justify-between ${
                          config.aggressionLevel === level 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'bg-black/20 border-zinc-800 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        <span className="capitalize font-medium">{level} Mode</span>
                        {config.aggressionLevel === level && <ChevronRight className="w-5 h-5" />}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded text-sm text-yellow-500">
                    <strong>Warning:</strong> Aggressive mode generates high traffic and may trigger WAF IP bans. Use only on authorized targets.
                  </div>
               </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
