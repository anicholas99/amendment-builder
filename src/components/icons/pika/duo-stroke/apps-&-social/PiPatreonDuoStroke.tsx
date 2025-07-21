import React from 'react';

/**
 * PiPatreonDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiPatreonDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPatreonDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'patreon icon',
  ...props
}: PiPatreonDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21.13 8.008c-.003-2.553-1.992-4.647-4.325-5.402-2.899-.937-6.72-.801-9.487.504-3.354 1.582-4.407 5.049-4.446 8.506-.033 2.843.251 10.33 4.474 10.384 3.137.039 3.605-4.004 5.056-5.951 1.034-1.385 2.364-1.777 4.001-2.182 2.814-.696 4.732-2.917 4.728-5.859Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.872 11.616C2.91 8.16 3.964 4.692 7.318 3.11c2.767-1.305 6.589-1.441 9.487-.504 2.333.755 4.322 2.849 4.326 5.402.004 2.942-1.914 5.163-4.728 5.86" fill="none"/>
    </svg>
  );
}
