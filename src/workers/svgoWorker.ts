import * as Comlink from 'comlink';

// We import the browser bundle of svgo
import { optimize } from 'svgo/browser';

const svgoWorkerAPI = {
  async optimizeSvg(svgString: string): Promise<{ data: string; originalSize: number; newSize: number }> {
    try {
      const originalSize = new Blob([svgString]).size;
      
      const result = optimize(svgString, {
        multipass: true,
        plugins: [
          'preset-default',
          'removeDimensions',
        ],
      });
      
      const newSize = new Blob([result.data]).size;
      
      return {
        data: result.data,
        originalSize,
        newSize
      };
    } catch (e: any) {
      console.error("SVGO optimization error", e);
      throw new Error(e.message || "Failed to optimize SVG");
    }
  }
};

Comlink.expose(svgoWorkerAPI);
export type SvgoWorkerAPI = typeof svgoWorkerAPI;
