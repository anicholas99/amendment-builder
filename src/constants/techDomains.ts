export const KNOWN_TECH_DOMAINS = [
  'Mechanical_Electrical',
  'Software_Computer',
  'Chemical_Biological',
  'Medical_Device',
  'Renewable_Energy',
  'Agricultural',
  'Environmental_Energy',
  'Default',
] as const;

export type TechDomain = (typeof KNOWN_TECH_DOMAINS)[number];
