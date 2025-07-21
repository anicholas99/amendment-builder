import React from 'react';

/**
 * PiNpmLogoSymbolDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiNpmLogoSymbolDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNpmLogoSymbolDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'npm-logo-symbol icon',
  ...props
}: PiNpmLogoSymbolDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.4 20h3.2c2.24 0 3.36 0 4.216-.436a4 4 0 0 0 1.748-1.748C20 16.96 20 15.84 20 13.6v-3.2c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C16.96 4 15.84 4 13.6 4h-3.2c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C4 7.04 4 8.16 4 10.4v3.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C7.04 20 8.16 20 10.4 20Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 11v9" fill="none"/>
    </svg>
  );
}
