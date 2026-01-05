
import React from 'react';

export const DESIGN_STYLES = [
  { id: 'Modern', name: 'Modern', icon: 'M' },
  { id: 'Minimalist', name: 'Minimalist', icon: 'mi' },
  { id: 'Rustic', name: 'Rustic', icon: 'R' },
  { id: 'Luxury', name: 'Luxury', icon: 'L' },
  { id: 'Bohemian', name: 'Bohemian', icon: 'B' },
  { id: 'Industrial', name: 'Industrial', icon: 'I' },
  { id: 'Coastal', name: 'Coastal', icon: 'C' },
  { id: 'Scandinavian', name: 'Scandinavian', icon: 'S' },
];

export const CORE_DESIGNER_SYSTEM_PROMPT = `
You are an expert AI Interior Designer. Analyze the uploaded room image and generate a complete interior design transformation.
Identify the room type and layout. Output in strict JSON format.
{
  "roomType": "string",
  "detectedLayout": "string",
  "constraints": "string",
  "suggestions": ["string"]
}
`;

export const TRANSFORMATION_PROMPT_TEMPLATE = (style: string) => `
Using the previous analysis of the room, generate a detailed interior redesign transformation for the style: ${style}.
Provide the response in strict JSON format.
{
  "style": "${style}",
  "colorPalette": "string",
  "furnitureRecommendations": ["string"],
  "lightingPlan": "string",
  "summary": "string"
}
`;

export const IMAGE_PROMPT_ENGINEER_PROMPT = `
Generate an ultra-detailed cinematic photorealistic prompt for an interior design render.
Focus on: Preserving layout, realistic lighting, textures, and materials.
`;
