'use client';

import { useEffect, useState } from 'react';
import * as Comlink from 'comlink';
import type { SvgoWorkerAPI } from '../workers/svgoWorker';

export function useSvgoWorker() {
  const [workerApi, setWorkerApi] = useState<Comlink.Remote<SvgoWorkerAPI> | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL('../workers/svgoWorker.ts', import.meta.url), { 
        type: 'module' 
    });
    
    const api = Comlink.wrap<SvgoWorkerAPI>(worker);
    setWorkerApi(api);

    return () => {
      worker.terminate();
    };
  }, []);

  return workerApi;
}
