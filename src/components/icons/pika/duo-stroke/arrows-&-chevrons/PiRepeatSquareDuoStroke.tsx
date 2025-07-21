import React from 'react';

/**
 * PiRepeatSquareDuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiRepeatSquareDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiRepeatSquareDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'repeat-square icon',
  ...props
}: PiRepeatSquareDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5.002Q14.551 5 14 5h-4c-1.861 0-2.792 0-3.545.245a5 5 0 0 0-3.21 3.21C3 9.208 3 10.139 3 12s0 2.792.245 3.545A5 5 0 0 0 5 18m4 .998Q9.45 19 10 19h4c1.861 0 2.792 0 3.545-.245a5 5 0 0 0 3.21-3.21C21 14.792 21 13.861 21 12s0-2.792-.245-3.545A5 5 0 0 0 19 6" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2a15.3 15.3 0 0 1 2.92 2.777.356.356 0 0 1 0 .446A15.3 15.3 0 0 1 12 8m0 8a15.3 15.3 0 0 0-2.92 2.777.355.355 0 0 0 0 .446A15.3 15.3 0 0 0 12 22" fill="none"/>
    </svg>
  );
}
