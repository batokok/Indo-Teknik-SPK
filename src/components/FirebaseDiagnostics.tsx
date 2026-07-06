import React, { useState } from 'react';
import { db, auth } from '../firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, limit, query } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { ShieldCheck, Play, Server, AlertTriangle, CheckCircle, XCircle, Database, Terminal, RefreshCw, X } from 'lucide-react';
import config from '../../firebase-applet-config.json';

interface LogLine {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export default function FirebaseDiagnostics() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [checks, setChecks] = useState({
    configValid: null as boolean | null,
    authAccessible: null as boolean | null,
    dbReachable: null as boolean | null,
    usersRead: null as boolean | null,
    woRead: null as boolean | null,
    woWrite: null as boolean | null,
  });

  const addLog = (message: string, type: LogLine['type'] = 'info') => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString(),
        type,
        message,
      },
    ]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    setLogs([]);
    setChecks({
      configValid: null,
      authAccessible: null,
      dbReachable: null,
      usersRead: null,
      woRead: null,
      woWrite: null,
    });

    addLog('Starting Firebase & Firestore Connection Diagnostics...', 'info');
    addLog(`Project ID: ${config.projectId}`, 'info');
    addLog(`Database ID: ${config.firestoreDatabaseId || '(default)'}`, 'info');

    // 1. Verify Config
    let isConfigValid = true;
    if (!config.projectId || !config.apiKey || !config.appId) {
      isConfigValid = false;
      addLog('Error: Invalid firebase-applet-config.json. Missing required fields.', 'error');
    } else {
      addLog('firebase-applet-config.json structure verified successfully.', 'success');
    }
    setChecks((prev) => ({ ...prev, configValid: isConfigValid }));
    if (!isConfigValid) {
      setIsRunning(false);
      return;
    }

    // 2. Auth State Check
    let authOk = false;
    try {
      addLog('Verifying Firebase Authentication reachability...', 'info');
      const userCredential = await signInAnonymously(auth);
      addLog(`Authenticated anonymously as UID: ${userCredential.user.uid}`, 'success');
      authOk = true;
    } catch (err: any) {
      addLog(`Warning: Anonymous authentication failed or restricted: ${err.message}`, 'warning');
      addLog('Proceeding to check Firestore access permissions using public rules fallback...', 'info');
      authOk = false;
    }
    setChecks((prev) => ({ ...prev, authAccessible: authOk }));

    // 3. Firestore Connection / Reachability & Collection Reads
    let usersReadOk = false;
    try {
      addLog('Testing reachability on "users" collection...', 'info');
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef, limit(1));
      const usersSnapshot = await getDocs(usersQuery);
      addLog(`Success: "users" collection is reachable. Found ${usersSnapshot.size} documents in preview.`, 'success');
      usersReadOk = true;
    } catch (err: any) {
      addLog(`Error reading "users" collection: ${err.message}`, 'error');
      if (err.code === 'permission-denied') {
        addLog('Diagnosis: Permission Denied. Your Firestore security rules do not allow this read request. Check if rules require auth or if custom DB instance is fully provisioned.', 'warning');
      }
    }
    setChecks((prev) => ({ ...prev, usersRead: usersReadOk }));

    let woReadOk = false;
    try {
      addLog('Testing reachability on "workOrders" collection...', 'info');
      const woRef = collection(db, 'workOrders');
      const woQuery = query(woRef, limit(1));
      const woSnapshot = await getDocs(woQuery);
      addLog(`Success: "workOrders" collection is reachable. Found ${woSnapshot.size} documents in preview.`, 'success');
      woReadOk = true;
    } catch (err: any) {
      addLog(`Error reading "workOrders" collection: ${err.message}`, 'error');
      if (err.code === 'permission-denied') {
        addLog('Diagnosis: Permission Denied. Firestore security rules blocking read operation.', 'warning');
      }
    }
    setChecks((prev) => ({ ...prev, woRead: woReadOk }));

    // 4. Firestore Write Permission Checks
    let woWriteOk = false;
    try {
      addLog('Testing write access on "workOrders" collection...', 'info');
      const tempDocRef = doc(collection(db, 'workOrders'), 'WO-DIAGNOSTIC-TEST');
      await setDoc(tempDocRef, {
        customerName: 'DIAGNOSTIC_TEST_ENTRY',
        createdAt: new Date().toISOString(),
        status: 'QUEUE',
        priority: 1,
        customerEmail: 'test@example.com',
        customerPhone: '0000',
        isArchived: false,
        testFlag: true,
      });
      addLog('Write operation to "workOrders" completed successfully.', 'success');
      
      addLog('Cleaning up diagnostic test document...', 'info');
      await deleteDoc(tempDocRef);
      addLog('Cleanup completed successfully.', 'success');
      woWriteOk = true;
    } catch (err: any) {
      addLog(`Error writing to "workOrders" collection: ${err.message}`, 'error');
      if (err.code === 'permission-denied') {
        addLog('Diagnosis: Permission Denied on Write. Your security rules block this write or require dynamic variables.', 'warning');
      }
    }
    setChecks((prev) => ({ ...prev, woWrite: woWriteOk }));

    // Summary of entire connection
    const isDbFullyFunctional = usersReadOk && woReadOk && woWriteOk;
    setChecks((prev) => ({ ...prev, dbReachable: isDbFullyFunctional }));

    if (isDbFullyFunctional) {
      addLog('ALL CHECKS PASSED: App is perfectly synchronized with Firestore!', 'success');
    } else {
      addLog('DIAGNOSTICS COMPLETED: Connection issues detected. Please check logs for detailed recommendations.', 'warning');
    }

    setIsRunning(false);
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <div className="fixed bottom-12 right-6 z-50 print:hidden">
        <button
          onClick={() => {
            setIsOpen(true);
            if (logs.length === 0) runDiagnostics();
          }}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full shadow-lg border border-slate-700 font-medium text-xs tracking-wider uppercase transition-all duration-200"
        >
          <Terminal className="w-4 h-4 text-emerald-400 animate-pulse" />
          Diagnose Database
        </button>
      </div>

      {/* Diagnostics Panel Overlay / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col h-[520px]">
            {/* Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-blue-400" />
                <div>
                  <h3 className="text-white font-bold text-sm tracking-wide">ITech Firebase Diagnostics Dashboard</h3>
                  <p className="text-slate-400 text-xs mt-0.5">Real-time connection verification for database ID: <code className="text-emerald-400 font-mono text-[10px]">{config.firestoreDatabaseId}</code></p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Diagnostic Metrics */}
            <div className="p-6 bg-slate-900 grid grid-cols-3 gap-4 shrink-0">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-300 text-xs">Configuration</span>
                </div>
                {checks.configValid === null ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700 animate-pulse"></span>
                ) : checks.configValid ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-300 text-xs">Auth Connection</span>
                </div>
                {checks.authAccessible === null ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700 animate-pulse"></span>
                ) : checks.authAccessible ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                )}
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-300 text-xs">Overall Reachability</span>
                </div>
                {checks.dbReachable === null ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700 animate-pulse"></span>
                ) : checks.dbReachable ? (
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>

            {/* Live Output Terminal */}
            <div className="flex-1 bg-slate-950 px-6 py-4 overflow-y-auto font-mono text-xs flex flex-col gap-1.5 border-t border-b border-slate-800">
              {logs.length === 0 ? (
                <div className="text-slate-500 italic h-full flex items-center justify-center">
                  Click 'Run Diagnostics' to test active Firestore connection state.
                </div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex gap-3 leading-relaxed">
                    <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
                    <span className={
                      log.type === 'success' ? 'text-emerald-400' :
                      log.type === 'error' ? 'text-red-400 font-bold' :
                      log.type === 'warning' ? 'text-amber-400' : 'text-slate-300'
                    }>
                      {log.type === 'success' && '✓ '}
                      {log.type === 'error' && '✗ '}
                      {log.type === 'warning' && '⚠ '}
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>

            {/* Footer Actions & Guides */}
            <div className="bg-slate-950 px-6 py-4 flex items-center justify-between border-t border-slate-800">
              <div className="text-slate-400 text-[11px] leading-relaxed max-w-md">
                {!checks.dbReachable && checks.dbReachable !== null ? (
                  <div className="text-amber-400">
                    <strong>Suggestion:</strong> Ensure Firestore is created in your Firebase Console, configured under database ID <code className="bg-slate-900 px-1 rounded">ai-studio-itindoteknikerp-61e7abcb-3d94-45ac-9f89-1b5eac101f5f</code>, and Security Rules allow read/write.
                  </div>
                ) : (
                  <span>Click to run a live connection audit directly against your Google Cloud project config.</span>
                )}
              </div>
              <button
                disabled={isRunning}
                onClick={runDiagnostics}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-semibold text-xs py-2.5 px-4 rounded-lg tracking-wider uppercase transition-colors"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Run Diagnostics
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
