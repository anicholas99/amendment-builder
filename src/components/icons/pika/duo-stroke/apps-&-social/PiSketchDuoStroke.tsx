import React from 'react';

/**
 * PiSketchDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiSketchDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSketchDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'sketch icon',
  ...props
}: PiSketchDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22.126 7.908 19.224 3.84A2 2 0 0 0 17.591 3H6.409c-.648 0-1.256.313-1.633.841L1.874 7.908a2.005 2.005 0 0 0 .109 2.474l8.493 9.916c.4.468.962.702 1.524.702s1.124-.234 1.524-.702l8.493-9.916a2.006 2.006 0 0 0 .11-2.474Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6.48 9.025 4.142 9.418L12 21l1.378-2.557 4.142-9.418m-11.04 0h11.04m-11.04 0H1.5m4.98 0L12 3l5.52 6.025m0 0h4.98" fill="none"/>
    </svg>
  );
}
