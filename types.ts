
export type DesignStyle = 'Modern' | 'Minimalist' | 'Rustic' | 'Luxury' | 'Bohemian' | 'Industrial' | 'Coastal' | 'Scandinavian';
export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';

export interface RoomAnalysis {
  roomType: string;
  detectedLayout: string;
  constraints: string;
  suggestions: string[];
}

export interface DesignTransformation {
  style: DesignStyle;
  colorPalette: string;
  furnitureRecommendations: string[];
  lightingPlan: string;
  summary: string;
  generatedImageBase64?: string;
}

export enum AppStep {
  IDLE = 'idle',
  EDITING = 'editing',
  GENERATING = 'generating',
  RESULT = 'result'
}
