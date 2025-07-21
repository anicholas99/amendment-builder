import React from 'react';

/**
 * PiImacDuoStroke icon from the duo-stroke style in devices category.
 */
interface PiImacDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiImacDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'imac icon',
  ...props
}: PiImacDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 22 .5-5M9 22h6m-6 0H8m1.5-5H4.4c-.84 0-1.26 0-1.581-.163a1.5 1.5 0 0 1-.656-.656C2 15.861 2 15.441 2 14.6V13h20v1.6c0 .84 0 1.26-.163 1.581a1.5 1.5 0 0 1-.656.656c-.32.163-.74.163-1.581.163h-5.1m-5 0h5m0 0 .5 5m0 0h1" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.6 2H4.4c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.656.656C2 3.139 2 3.559 2 4.4V13h20V4.4c0-.84 0-1.26-.163-1.581a1.5 1.5 0 0 0-.656-.656C20.861 2 20.441 2 19.6 2Z" fill="none"/>
    </svg>
  );
}
