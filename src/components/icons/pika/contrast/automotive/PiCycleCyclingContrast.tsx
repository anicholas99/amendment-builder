import React from 'react';

/**
 * PiCycleCyclingContrast icon from the contrast style in automotive category.
 */
interface PiCycleCyclingContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCycleCyclingContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'cycle-cycling icon',
  ...props
}: PiCycleCyclingContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M17.5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" fill="none" stroke="currentColor"/><path d="M5.5 20.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="none" stroke="currentColor"/><path d="M21.5 17.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m11.5 19.5 1.031-4.123a2 2 0 0 0-1.39-2.409l-1.363-.389c-1.572-.449-1.947-2.51-.66-3.516a3.02 3.02 0 0 1 3.871.124l1.143 1.03a4 4 0 0 0 2.021.975L18 11.5M17.5 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm1 12.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-13 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="none"/>
    </svg>
  );
}
