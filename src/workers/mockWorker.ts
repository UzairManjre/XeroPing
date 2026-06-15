import * as Comlink from 'comlink';

const workerFunctions = {
  // Simulating a heavy task that takes 2 seconds
  processPayload: async (data: string) => {
    console.log(`[Worker] Received payload: ${data}`);
    
    // Fake the heavy computation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    return {
      success: true,
      result: `Processed "${data}" entirely locally in the background thread.`,
      timestamp: new Date().toISOString()
    };
  }
};

// Expose the API to Comlink
Comlink.expose(workerFunctions);

// Export the type so our React components get full TypeScript autocomplete
export type WorkerFunctions = typeof workerFunctions;
