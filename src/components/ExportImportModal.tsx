import React, { useState, useEffect } from 'react';
import { Download, Upload, RotateCcw, CheckCircle2, AlertCircle, Shield, FileSpreadsheet, Database, Cloud, Key, Copy, Check } from 'lucide-react';
import { generateSeedData, saveHabits, saveHistory } from '../utils/storage';
import { 
  exportToJSON, 
  exportToCSV, 
  parseAndValidateJSONImport, 
  parseHabitsCSV, 
  persistHabits, 
  persistHistory 
} from '../core/db';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  testSupabaseConnection, 
  syncLocalToSupabase, 
  syncSupabaseToLocal, 
  SUPABASE_SCHEMA_SQL,
  isSupabaseConfigured 
} from '../core/supabase';
import { Habit, DayActivity } from '../types';
import { sound } from '../utils/audio';
import { Sheet } from './ui/Sheet';
import { Button } from './ui/Button';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataReload: () => void;
  habits?: Habit[];
  history?: Record<string, DayActivity>;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  onDataReload,
  habits = [],
  history = {},
}) => {
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Supabase Cloud Sync state
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'testing' | 'syncing' | 'success' | 'error'>('idle');
  const [supabaseMessage, setSupabaseMessage] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const creds = getSupabaseCredentials();
      setSupabaseUrl(creds.url);
      setSupabaseKey(creds.key);
      setSupabaseStatus('idle');
      setSupabaseMessage('');
    }
  }, [isOpen]);

  const handleSaveCredentials = () => {
    saveSupabaseCredentials(supabaseUrl, supabaseKey);
  };

  const handleTestSupabase = async () => {
    handleSaveCredentials();
    setSupabaseStatus('testing');
    setSupabaseMessage('Testing connection to Supabase...');
    const res = await testSupabaseConnection();
    if (res.success) {
      sound.playCheck();
      setSupabaseStatus('success');
      setSupabaseMessage(res.message);
    } else {
      setSupabaseStatus('error');
      setSupabaseMessage(res.message);
    }
  };

  const handlePushSupabase = async () => {
    handleSaveCredentials();
    setSupabaseStatus('syncing');
    setSupabaseMessage('Pushing local data to Supabase...');
    const res = await syncLocalToSupabase();
    if (res.success) {
      sound.playCelebration();
      setSupabaseStatus('success');
      setSupabaseMessage(res.message || 'Successfully synced local data to Supabase!');
    } else {
      setSupabaseStatus('error');
      setSupabaseMessage(res.message || 'Push failed.');
    }
  };

  const handlePullSupabase = async () => {
    handleSaveCredentials();
    setSupabaseStatus('syncing');
    setSupabaseMessage('Pulling cloud data from Supabase...');
    const res = await syncSupabaseToLocal();
    if (res.success) {
      sound.playCelebration();
      setSupabaseStatus('success');
      setSupabaseMessage(res.message || 'Successfully pulled data!');
      onDataReload();
    } else {
      setSupabaseStatus('error');
      setSupabaseMessage(res.message || 'Pull failed.');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SCHEMA_SQL);
    sound.playStep();
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleExportJSON = () => {
    sound.playStep();
    const jsonStr = exportToJSON(habits, history);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `upGrade-v2-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    sound.playStep();
    const { habitsCSV, historyCSV } = exportToCSV(habits, history);
    
    // Download habits CSV
    const blobH = new Blob([habitsCSV], { type: 'text/csv' });
    const urlH = URL.createObjectURL(blobH);
    const aH = document.createElement('a');
    aH.href = urlH;
    aH.download = `upGrade-habits-${new Date().toISOString().split('T')[0]}.csv`;
    aH.click();
    URL.revokeObjectURL(urlH);

    // Download history CSV
    setTimeout(() => {
      const blobD = new Blob([historyCSV], { type: 'text/csv' });
      const urlD = URL.createObjectURL(blobD);
      const aD = document.createElement('a');
      aD.href = urlD;
      aD.download = `upGrade-history-${new Date().toISOString().split('T')[0]}.csv`;
      aD.click();
      URL.revokeObjectURL(urlD);
    }, 200);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const isCSV = file.name.endsWith('.csv');

      if (isCSV) {
        try {
          const parsedHabits = parseHabitsCSV(content);
          if (parsedHabits.length > 0) {
            await persistHabits(parsedHabits);
            sound.playCelebration();
            setImportStatus('success');
            setTimeout(() => {
              onDataReload();
              onClose();
            }, 1000);
            return;
          } else {
            setImportStatus('error');
            setErrorMessage('Could not find valid habit rows in CSV.');
          }
        } catch {
          setImportStatus('error');
          setErrorMessage('Failed to parse CSV file.');
        }
      } else {
        const res = parseAndValidateJSONImport(content);
        if (res.success && res.habits) {
          await persistHabits(res.habits);
          if (res.history) {
            await persistHistory(res.history);
          }
          sound.playCelebration();
          setImportStatus('success');
          setTimeout(() => {
            onDataReload();
            onClose();
          }, 1000);
        } else {
          setImportStatus('error');
          setErrorMessage(res.error || 'Failed to parse JSON backup.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetToZero = async () => {
    if (window.confirm('Reset upGrade to a clean fresh start from zero? All current habits and logs will be reset to 0.')) {
      sound.playCheck();
      const { resetDatabaseToZero } = await import('../core/db');
      await resetDatabaseToZero();
      onDataReload();
      onClose();
    }
  };

  const handleLoadDemoData = async () => {
    if (window.confirm('Load 180-day demo sample tracking dataset for testing?')) {
      sound.playCelebration();
      const { loadDemoSampleData } = await import('../core/db');
      await loadDemoSampleData();
      onDataReload();
      onClose();
    }
  };

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="Storage & Backup"
      subtitle="Local-first IndexedDB storage with JSON and CSV exports"
    >
      <div className="space-y-4">
        
        {/* Storage engine status */}
        <div className="p-3.5 rounded-[12px] bg-[var(--fill)] flex items-center justify-between text-[13px]">
          <div className="flex items-center gap-2 text-[var(--label)]">
            <Database className="w-4 h-4 text-[var(--system-green)]" />
            <span className="font-medium">IndexedDB (Dexie v2) Active</span>
          </div>
          <span className="text-[var(--label-2)] font-medium">Autosave on</span>
        </div>

        {/* Export Buttons */}
        <div className="p-4 rounded-[14px] bg-[var(--surface-2)] space-y-3 border border-[var(--separator)]">
          <div className="text-[15px] font-medium text-[var(--label)] flex items-center gap-2">
            <Download className="w-4 h-4 text-[var(--accent)]" />
            <span>Export Data</span>
          </div>
          <p className="text-[13px] text-[var(--label-2)]">
            Export your rituals and tracking history for backups or analysis.
          </p>

          <div className="flex gap-2">
            <Button type="button" variant="tinted" size="sm" onClick={handleExportJSON} className="flex-1">
              Export JSON
            </Button>
            <Button type="button" variant="tinted" size="sm" onClick={handleExportCSV} className="flex-1">
              <FileSpreadsheet className="w-3.5 h-3.5 mr-1" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Import Row */}
        <div className="p-4 rounded-[14px] bg-[var(--surface-2)] space-y-3 border border-[var(--separator)]">
          <div className="flex items-center gap-2 text-[15px] font-medium text-[var(--label)]">
            <Upload className="w-4 h-4 text-[var(--system-green)]" />
            <span>Restore from File</span>
          </div>
          <p className="text-[13px] text-[var(--label-2)]">
            Select a JSON backup or CSV habit list to restore your records.
          </p>

          <label className="block w-full py-2.5 px-4 border border-dashed border-[var(--separator)] rounded-[12px] text-center text-[13px] font-medium text-[var(--accent)] hover:bg-[var(--surface)] cursor-pointer transition">
            <span>Choose JSON or CSV File...</span>
            <input
              type="file"
              accept=".json,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {importStatus === 'success' && (
            <div className="flex items-center gap-1.5 text-[13px] text-[var(--system-green)] font-medium">
              <CheckCircle2 className="w-4 h-4" />
              <span>Restored successfully. Refreshing...</span>
            </div>
          )}

          {importStatus === 'error' && (
            <div className="flex items-center gap-1.5 text-[13px] text-[var(--system-red)] font-medium">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Supabase Cloud Sync */}
        <div className="p-4 rounded-[14px] bg-[var(--surface-2)] space-y-3.5 border border-[var(--separator)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[15px] font-medium text-[var(--label)]">
              <Cloud className="w-4 h-4 text-[var(--accent)]" />
              <span>Cloud Sync (Supabase)</span>
            </div>
            {isSupabaseConfigured() ? (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[rgba(52,199,89,0.15)] text-[var(--system-green)] font-medium">
                Configured
              </span>
            ) : (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[var(--fill)] text-[var(--label-3)] font-medium">
                URL Required
              </span>
            )}
          </div>

          <p className="text-[13px] text-[var(--label-2)] leading-relaxed">
            Connect your own Supabase project for real-time backup and syncing across your devices.
          </p>

          <div className="space-y-2">
            <div>
              <label className="block text-[12px] font-medium text-[var(--label-2)] mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://your-project-id.supabase.co"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                onBlur={handleSaveCredentials}
                className="w-full px-3 py-2 text-[13px] rounded-[10px] bg-[var(--surface)] border border-[var(--separator)] text-[var(--label)] placeholder:text-[var(--label-3)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[var(--label-2)] mb-1 flex items-center justify-between">
                <span>Publishable / Anon API Key</span>
                <span className="text-[11px] text-[var(--system-green)] font-medium">Key loaded</span>
              </label>
              <input
                type="password"
                placeholder="sb_publishable_..."
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                onBlur={handleSaveCredentials}
                className="w-full px-3 py-2 text-[13px] rounded-[10px] bg-[var(--surface)] border border-[var(--separator)] text-[var(--label)] placeholder:text-[var(--label-3)] focus:outline-none focus:border-[var(--accent)] font-mono text-[11px]"
              />
            </div>
          </div>

          {supabaseMessage && (
            <div className={`p-2.5 rounded-[10px] text-[12px] flex items-center gap-2 ${
              supabaseStatus === 'error'
                ? 'bg-[rgba(255,59,48,0.1)] text-[var(--system-red)]'
                : supabaseStatus === 'success'
                ? 'bg-[rgba(52,199,89,0.1)] text-[var(--system-green)]'
                : 'bg-[var(--fill)] text-[var(--label-2)]'
            }`}>
              {supabaseStatus === 'error' && <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
              {supabaseStatus === 'success' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
              <span>{supabaseMessage}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button
              type="button"
              variant="tinted"
              size="sm"
              onClick={handleTestSupabase}
              disabled={supabaseStatus === 'testing' || supabaseStatus === 'syncing'}
              className="flex-1"
            >
              Test Connection
            </Button>
            <Button
              type="button"
              variant="tinted"
              size="sm"
              onClick={handlePushSupabase}
              disabled={!supabaseUrl || supabaseStatus === 'syncing'}
              className="flex-1"
            >
              Push to Cloud
            </Button>
            <Button
              type="button"
              variant="tinted"
              size="sm"
              onClick={handlePullSupabase}
              disabled={!supabaseUrl || supabaseStatus === 'syncing'}
              className="flex-1"
            >
              Pull from Cloud
            </Button>
          </div>

          <div className="pt-2 border-t border-[var(--separator)] flex items-center justify-between text-[12px]">
            <span className="text-[var(--label-3)]">Need database tables?</span>
            <button
              type="button"
              onClick={handleCopySql}
              className="flex items-center gap-1.5 text-[var(--accent)] hover:opacity-80 font-medium transition cursor-pointer"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'SQL Copied!' : 'Copy SQL Schema'}</span>
            </button>
          </div>
        </div>

        {/* Fresh Start from Zero */}
        <div className="p-4 rounded-[14px] bg-[var(--surface-2)] border border-[var(--separator)] flex items-center justify-between">
          <div className="pr-3">
            <div className="text-[15px] font-medium text-[var(--label)] flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[var(--accent)]" />
              <span>Start Fresh from Zero</span>
            </div>
            <p className="text-[13px] text-[var(--label-2)] mt-0.5">
              Wipe all past history and start clean from Day 1 at Level 1.
            </p>
          </div>
          <Button type="button" variant="tinted" size="sm" onClick={handleResetToZero}>
            Fresh Start
          </Button>
        </div>

        {/* Load Demo Data */}
        <div className="p-4 rounded-[14px] bg-[var(--fill)] flex items-center justify-between">
          <div className="pr-3">
            <div className="text-[15px] font-medium text-[var(--label)] flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[var(--system-orange)]" />
              <span>Load Demo Sample Data</span>
            </div>
            <p className="text-[13px] text-[var(--label-2)] mt-0.5">
              Populate with 180 days of sample tracking for testing charts.
            </p>
          </div>
          <Button type="button" variant="plain" size="sm" onClick={handleLoadDemoData}>
            Load Demo
          </Button>
        </div>

        {/* Footer info */}
        <div className="pt-2 flex items-center justify-between text-[13px] text-[var(--label-3)]">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[var(--system-green)]" />
            <span>Local and offline-first</span>
          </span>
          <Button type="button" variant="filled" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>

      </div>
    </Sheet>
  );
};
