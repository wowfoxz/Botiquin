'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  data?: any;
}

export class MobileDebugger {
  private static logs: LogEntry[] = [];
  private static listeners: ((logs: LogEntry[]) => void)[] = [];
  private static maxLogs = 100;

  static log(category: string, message: string, data?: any) {
    this.addLog('info', category, message, data);
  }

  static warn(category: string, message: string, data?: any) {
    this.addLog('warn', category, message, data);
  }

  static error(category: string, message: string, data?: any) {
    this.addLog('error', category, message, data);
  }

  static debug(category: string, message: string, data?: any) {
    this.addLog('debug', category, message, data);
  }

  private static addLog(level: LogEntry['level'], category: string, message: string, data?: any) {
    const log: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      category,
      message,
      data: data ? JSON.stringify(data, null, 2) : undefined,
    };

    this.logs.unshift(log);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    // Notificar a todos los listeners
    this.listeners.forEach(listener => listener([...this.logs]));

    // También loguear en console para debugging en desktop
    const emoji = {
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
      debug: '🔍',
    }[level];

    console.log(`${emoji} [${category}] ${message}`, data || '');
  }

  static subscribe(listener: (logs: LogEntry[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  static getLogs() {
    return [...this.logs];
  }

  static clearLogs() {
    this.logs = [];
    this.listeners.forEach(listener => listener([]));
  }
}

export const MobileDebugPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    // Suscribirse a los logs
    const unsubscribe = MobileDebugger.subscribe(setLogs);

    // Activar con 5 taps rápidos en la esquina superior derecha
    let tapTimeout: NodeJS.Timeout;
    const handleTap = () => {
      setTapCount(prev => prev + 1);
      clearTimeout(tapTimeout);
      tapTimeout = setTimeout(() => {
        if (tapCount >= 4) {
          setIsOpen(true);
          toast.success('Panel de debug activado');
        }
        setTapCount(0);
      }, 500);
    };

    // Agregar listener a la esquina superior derecha (área invisible)
    const tapArea = document.createElement('div');
    tapArea.style.position = 'fixed';
    tapArea.style.top = '0';
    tapArea.style.right = '0';
    tapArea.style.width = '80px';
    tapArea.style.height = '80px';
    tapArea.style.zIndex = '9998';
    tapArea.addEventListener('click', handleTap);
    document.body.appendChild(tapArea);

    return () => {
      unsubscribe();
      clearTimeout(tapTimeout);
      document.body.removeChild(tapArea);
    };
  }, [tapCount]);

  const copyLogs = () => {
    const text = logs.map(log => 
      `[${log.timestamp}] [${log.level.toUpperCase()}] [${log.category}] ${log.message}${log.data ? '\n' + log.data : ''}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Logs copiados al portapapeles');
    }).catch(() => {
      toast.error('Error al copiar logs');
    });
  };

  const clearLogs = () => {
    MobileDebugger.clearLogs();
    toast.success('Logs eliminados');
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return 'text-blue-500';
      case 'warn': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      case 'debug': return 'text-gray-500';
    }
  };

  const getLevelEmoji = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return 'ℹ️';
      case 'warn': return '⚠️';
      case 'error': return '❌';
      case 'debug': return '🔍';
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-black/95 text-white z-[9999] shadow-2xl"
      style={{ 
        maxHeight: isMinimized ? '60px' : '50vh',
        transition: 'max-height 0.3s ease',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">🐛 Debug Panel</span>
          <span className="text-xs text-gray-400">({logs.length} logs)</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-7 w-7 p-0 text-white hover:bg-gray-800"
          >
            {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={copyLogs}
            className="h-7 w-7 p-0 text-white hover:bg-gray-800"
            disabled={logs.length === 0}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearLogs}
            className="h-7 w-7 p-0 text-white hover:bg-gray-800"
            disabled={logs.length === 0}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsOpen(false)}
            className="h-7 w-7 p-0 text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Logs */}
      {!isMinimized && (
        <div className="overflow-y-auto p-3 space-y-2" style={{ maxHeight: 'calc(50vh - 60px)' }}>
          {logs.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No hay logs todavía</p>
              <p className="text-xs mt-2">Los logs aparecerán aquí cuando uses la app</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div 
                key={index} 
                className="bg-gray-900 rounded p-2 text-xs font-mono border-l-4"
                style={{ 
                  borderLeftColor: {
                    info: '#3b82f6',
                    warn: '#eab308',
                    error: '#ef4444',
                    debug: '#6b7280',
                  }[log.level]
                }}
              >
                <div className="flex items-start gap-2">
                  <span className="text-gray-500">{log.timestamp}</span>
                  <span className={getLevelColor(log.level)}>{getLevelEmoji(log.level)}</span>
                  <span className="text-purple-400">[{log.category}]</span>
                </div>
                <div className="mt-1 text-gray-200">{log.message}</div>
                {log.data && (
                  <pre className="mt-1 text-xs text-gray-400 overflow-x-auto whitespace-pre-wrap">
                    {log.data}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Footer con instrucciones */}
      {!isMinimized && (
        <div className="border-t border-gray-700 p-2 text-xs text-gray-400 text-center">
          💡 Tip: Tap 5 veces en la esquina superior derecha para abrir este panel
        </div>
      )}
    </div>
  );
};

export default MobileDebugPanel;

