'use client';

import { useEffect, useState } from 'react';
import * as Comlink from 'comlink';
import type { ExifWorkerAPI } from '../workers/exifWorker';

export function useExifWorker() {
  const [workerApi, setWorkerApi] = useState<Comlink.Remote<ExifWorkerAPI> | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL('../workers/exifWorker.ts', import.meta.url), { 
        type: 'module' 
    });
    
    const api = Comlink.wrap<ExifWorkerAPI>(worker);
    setWorkerApi(api);

    return () => {
      worker.terminate();
    };
  }, []);

  return workerApi;
}
