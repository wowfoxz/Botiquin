'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Copy, Trash2, ChevronDown, ChevronUp, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  category: string;
  message: string;
  data?: string;
}

/**
 * MobileDebugger - Sistema de logging visible para debugging en móviles
 * 
 * Uso:
 *   import { MobileDebugger } from '@/components/mobile-debug-panel';
 *   MobileDebugger.log('info', 'CATEGORY', 'mensaje', { data: 'opcional' });
 */
export class MobileDebugger {
  private static logs: LogEntry[] = [];
  private static listeners: Array<(logs: LogEntry[]) => void> = [];

  static log(level: 'info' | 'warn' | 'error' | 'debug', category: string, message: string, data?: any) {
    const logEntry: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      level,
      category,
      message,
      data: data ? (typeof data === 'string' ? data : JSON.stringify(data, null, 2)) : undefined,
    };

    // Limitar a 50 logs para no saturar la memoria
    if (this.logs.length >= 50) {
      this.logs.shift();
    }

    this.logs.push(logEntry);

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

  useEffect(() => {
    // Suscribirse a los logs
    const unsubscribe = MobileDebugger.subscribe(setLogs);
    return unsubscribe;
  }, []);

  const copyLogs = () => {
    const logsText = logs
      .map(log => {
        let text = `[${log.timestamp}] [${log.level}] [${log.category}] ${log.message}`;
        if (log.data) {
          text += `\n${log.data}`;
        }
        return text;
      })
      .join('\n\n');

    navigator.clipboard.writeText(logsText).then(() => {
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
      case 'info':
        return 'text-blue-400';
      case 'warn':
        return 'text-yellow-400';
      case 'error':
        return 'text-red-400';
      case 'debug':
        return 'text-gray-400';
      default:
        return 'text-gray-400';
    }
  };

  const getLevelEmoji = (level: LogEntry['level']) => {
    switch (level) {
      case 'info':
        return 'ℹ️';
      case 'warn':
        return '⚠️';
      case 'error':
        return '❌';
      case 'debug':
        return '🔍';
      default:
        return '📝';
    }
  };

  return (
    <>
      {/* Botón flotante visible (NO bloquea otros botones) */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 left-4 z-[9998] rounded-full w-14 h-14 shadow-lg bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center"
          aria-label="Abrir panel de debug"
        >
          <Bug className="w-6 h-6" />
          {logs.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {logs.length}
            </span>
          )}
        </Button>
      )}

      {/* Panel deslizable */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white z-[9999] rounded-t-2xl shadow-2xl overflow-hidden"
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
                💡 Tip: Copia los logs y envíalos para debugging
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileDebugPanel;
