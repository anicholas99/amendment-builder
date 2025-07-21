import React from 'react';

/**
 * PiAirplayDuoStroke icon from the duo-stroke style in devices category.
 */
interface PiAirplayDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAirplayDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'airplay icon',
  ...props
}: PiAirplayDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14a5 5 0 1 1 8 0m2.233 3.493a9 9 0 1 0-12.466 0M12 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.286 17.343c.9-1.44 1.35-2.16 1.926-2.407a2 2 0 0 1 1.576 0c.576.247 1.026.967 1.926 2.407l.756 1.21c.5.799.749 1.198.722 1.528a1 1 0 0 1-.4.723c-.265.197-.737.197-1.679.197H9.887c-.942 0-1.414 0-1.679-.197a1 1 0 0 1-.4-.723c-.027-.33.223-.73.722-1.528z" fill="none"/>
    </svg>
  );
}
