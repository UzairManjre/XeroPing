'use client';

import { useEffect, useState } from 'react';
import * as Comlink from 'comlink';
import type { WorkerFunctions } from '../workers/mockWorker';

export function useWorker() {
  const [workerApi, setWorkerApi] = useState<Comlink.Remote<WorkerFunctions> | null>(null);

  useEffect(() => {
    // 1. Instantiate the native Web Worker
    // The Next.js Webpack/Turbopack compiler automatically handles this URL syntax
    const worker = new Worker(new URL('../workers/mockWorker.ts', import.meta.url), { 
        type: 'module' 
    });
    
    // 2. Wrap it with Comlink to create the proxy
    const api = Comlink.wrap<WorkerFunctions>(worker);
    setWorkerApi(api);

    // 3. Cleanup function to terminate the worker when the component unmounts
    return () => {
      worker.terminate();
    };
  }, []);

  return workerApi;
}
