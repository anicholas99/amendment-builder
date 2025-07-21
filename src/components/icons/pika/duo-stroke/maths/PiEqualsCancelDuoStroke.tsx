import React from 'react';

/**
 * PiEqualsCancelDuoStroke icon from the duo-stroke style in maths category.
 */
interface PiEqualsCancelDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEqualsCancelDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'equals-cancel icon',
  ...props
}: PiEqualsCancelDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 9h9.333M15 15h4m-.02-6H19M5 15h4.667" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 21 19 3" fill="none"/>
    </svg>
  );
}
