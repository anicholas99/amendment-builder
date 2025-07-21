import React from 'react';

/**
 * PiStrikeThroughDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiStrikeThroughDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiStrikeThroughDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'strike-through icon',
  ...props
}: PiStrikeThroughDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12c2.271 0 5 .435 5 3.868 0 5.07-8.67 5.506-9.854 1.132M7 8.132C7 3.062 15.67 2.626 16.854 7" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12H3" fill="none"/>
    </svg>
  );
}
