// src/types/quagga.d.ts

declare module 'quagga' {
  interface QuaggaJSStatic {
    init: (options: QuaggaJSConfigObject, callback?: (err: any) => void) => void;
    start: () => void;
    stop: () => void;
    onDetected: (callback: (data: QuaggaJSResultObject) => void) => void;
    offDetected: (callback: (data: QuaggaJSResultObject) => void) => void;
    onProcessed: (callback: (data: QuaggaJSProcessedObject) => void) => void;
    offProcessed: (callback: (data: QuaggaJSProcessedObject) => void) => void;
    canvas: {
      ctx: {
        overlay: CanvasRenderingContext2D;
        image: CanvasRenderingContext2D;
      };
      dom: {
        overlay: HTMLCanvasElement;
        image: HTMLCanvasElement;
      };
    };
    CameraAccess: {
      getActiveTrack: () => MediaStreamTrack | null;
      release: () => void;
      request: (camera: any, constraints: any) => Promise<MediaStream>;
    };
    ImageDebug: {
      drawPath: (path: any, def: any, ctx: any, style: any) => void;
      drawRect: (pos: any, size: any, ctx: any, style: any) => void;
    };
    ImageWrapper: any;
    ResultCollector: any;
  }

  interface QuaggaJSResultObject {
    codeResult?: {
      code?: string;
      format?: string;
      codeset?: string;
      startInfo?: any;
      decodedCodes?: any[];
      end?: number;
      direction?: number;
      start?: number;
    };
    box?: [
      [number, number],
      [number, number],
      [number, number],
      [number, number]
    ];
    line?: [[number, number], [number, number]];
    angle?: number;
    pattern?: number[];
    threshold?: number;
  }

  interface QuaggaJSProcessedObject {
    boxes?: [
      [number, number],
      [number, number],
      [number, number],
      [number, number]
    ][];
    line?: [[number, number], [number, number]];
    codeResult?: {
      code?: string;
      format?: string;
    };
    box?: [
      [number, number],
      [number, number],
      [number, number],
      [number, number]
    ];
  }

  interface QuaggaJSConfigObject {
    numOfWorkers?: number;
    locate?: boolean;
    frequency?: number;
    inputStream?: {
      name?: string;
      type?: string;
      target?: any;
      constraints?: {
        width?: number | { min: number, ideal?: number, max?: number };
        height?: number | { min: number, ideal?: number, max?: number };
        facingMode?: string;
        aspectRatio?: { min: number, max: number };
        deviceId?: string;
      };
      area?: {
        top?: string;
        right?: string;
        bottom?: string;
        left?: string;
      };
      singleChannel?: boolean;
    };
    decoder?: {
      readers?: string[];
      debug?: {
        drawBoundingBox?: boolean;
        showFrequency?: boolean;
        drawScanline?: boolean;
        showPattern?: boolean;
      };
      multiple?: boolean;
    };
    locator?: {
      halfSample?: boolean;
      patchSize?: string;
      debug?: {
        showCanvas?: boolean;
        showPatches?: boolean;
        showFoundPatches?: boolean;
        showSkeleton?: boolean;
        showLabels?: boolean;
        showPatchLabels?: boolean;
        showRemainingPatchLabels?: boolean;
        boxFromPatches?: {
          showTransformed?: boolean;
          showTransformedBox?: boolean;
          showBB?: boolean;
        };
      };
    };
  }

  const Quagga: QuaggaJSStatic;
  export default Quagga;
}

// Since we're using the wrapper file in our code
declare module '../quagga' {
  import Quagga from 'quagga';
  export default Quagga;
}