import React from 'react';

/**
 * PiRiveDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiRiveDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiRiveDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'rive icon',
  ...props
}: PiRiveDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.947 12.91 20 21" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 3h10a5 5 0 0 1 0 10H9" fill="none"/>
    </svg>
  );
}
