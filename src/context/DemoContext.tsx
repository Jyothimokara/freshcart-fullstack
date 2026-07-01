import React, { createContext, useContext, useState, useEffect } from 'react';

export interface DemoLog {
  id: string;
  timestamp: string;
  action: string;
  payload?: any;
}

interface DemoContextType {
  latency: number;
  setLatency: (ms: number) => void;
  logs: DemoLog[];
  addLog: (action: string, payload?: any) => void;
  clearLogs: () => void;
  simulateNetwork: <T>(callback: () => Promise<T> | T) => Promise<T>;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [latency, setLatencyState] = useState<number>(() => {
    const saved = localStorage.getItem('freshcart_demo_latency');
    return saved ? parseInt(saved, 10) : 0; // default 0ms (no latency)
  });

  const [logs, setLogs] = useState<DemoLog[]>([]);

  const setLatency = (ms: number) => {
    setLatencyState(ms);
    localStorage.setItem('freshcart_demo_latency', ms.toString());
    addLog('LATENCY_SPEED_CHANGE', { latencyMs: ms });
  };

  const addLog = (action: string, payload?: any) => {
    const newLog: DemoLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toLocaleTimeString(),
      action,
      payload
    };
    setLogs((prev) => [newLog, ...prev.slice(0, 49)]); // Keep latest 50 logs
  };

  const clearLogs = () => {
    setLogs([]);
  };

  // Helper utility to wrap database fetches in mock network delay
  async function simulateNetwork<T>(callback: () => Promise<T> | T): Promise<T> {
    if (latency > 0) {
      await new Promise((resolve) => setTimeout(resolve, latency));
    }
    return callback();
  }

  // Add initial log
  useEffect(() => {
    addLog('APPLICATION_BOOTSTRAPPED', { time: new Date().toISOString() });
  }, []);

  return (
    <DemoContext.Provider
      value={{
        latency,
        setLatency,
        logs,
        addLog,
        clearLogs,
        simulateNetwork
      }}
    >
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
};
