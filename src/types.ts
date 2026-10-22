export interface ARPointOfInterest {
  id: string;
  title: string;
  category: 'Architecture' | 'Engineering' | 'History' | 'Mystery' | 'Art';
  x: number; // 0 - 100 percentage
  y: number; // 0 - 100 percentage
  description: string;
}

export interface LandmarkData {
  name: string;
  alternateNames: string[];
  city: string;
  country: string;
  neighborhoodOrArea: string;
  yearBuiltOrInaugurated: string;
  architecturalStyle: string;
  architectOrBuilders: string;
  visualCharacteristics: string;
  approximateCoordinates: {
    latitude: number;
    longitude: number;
  };
  confidence: number;
  briefSummary: string;
  arPointsOfInterest: ARPointOfInterest[];
  primaryColorPalette: string[];
  keyDimensionsOrFacts: string[];
  modelUsed?: string;
  capturedImage: string; // base64 or sample URL
  capturedAt: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface HistoryData {
  landmarkName: string;
  historyMarkdown: string;
  sources: GroundingSource[];
  searchQueries: string[];
}

export interface ARClipScene {
  id: string;
  title: string;
  startTime: number;
  endTime: number;
  zoom: number;
  focalTarget: { x: number; y: number };
  arEffect: string;
  caption: string;
}

export interface NarrationData {
  audioBase64: string;
  mimeType: string;
  script: string;
  speakerName: string;
  voiceName: string;
  scenes: ARClipScene[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface PassportEntry {
  id: string;
  landmark: LandmarkData;
  history?: HistoryData;
  narration?: NarrationData;
  visitDate: string;
  stampDesign: 'gold' | 'neon' | 'vintage' | 'emerald';
}
