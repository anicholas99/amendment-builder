import React from 'react';

/**
 * PiFingerprintAltDuoStroke icon from the duo-stroke style in security category.
 */
interface PiFingerprintAltDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFingerprintAltDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'fingerprint-alt icon',
  ...props
}: PiFingerprintAltDuoStrokeProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeWidth="2" d="M17.5 3.647A9.95 9.95 0 0 0 12 2a9.95 9.95 0 0 0-5.5 1.647M17 20.662A9.96 9.96 0 0 1 12 22a9.96 9.96 0 0 1-5-1.338" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeWidth="2" d="M11.988 22a10.8 10.8 0 0 1-5.238-1.338M11.988 2c2.129 0 4.109.606 5.762 1.647" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeWidth="2" d="M4 8.692c2.006-1.931 4.848-3.136 8-3.136 1.04 0 2.046.13 3 .376 1.937.498 3.656 1.466 5 2.76" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeWidth="2" d="M4 8.692c2.006-1.931 4.848-3.136 8-3.136 1.04 0 2.046.13 3 .376" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeWidth="2" d="M5.071 17c-.95-5.261 2.72-8 6.93-8a6.99 6.99 0 0 1 5.553 2.739c2.43 3.161-1.613 6.435-3.997 2.602-1.099-1.766-3.495-1.596-4.527-.495C7.934 15.015 8.015 17.9 11 18.5" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeWidth="2" d="M5.071 17c-.781-4.328 1.564-6.949 4.763-7.743" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeWidth="2" d="M17.554 11.74c2.43 3.16-1.613 6.434-3.997 2.602-1.1-1.767-3.495-1.597-4.527-.496C7.934 15.015 8.015 17.901 11 18.5" fill="none"/>
    </svg>
  );
}
