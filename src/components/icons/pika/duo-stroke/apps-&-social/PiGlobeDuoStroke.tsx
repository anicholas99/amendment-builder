import React from 'react';

/**
 * PiGlobeDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiGlobeDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGlobeDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'globe icon',
  ...props
}: PiGlobeDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.15a9.15 9.15 0 1 0 0-18.3 9.15 9.15 0 0 0 0 18.3Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.85 12h18.3M12 2.85A14 14 0 0 1 15.66 12 14 14 0 0 1 12 21.15 14 14 0 0 1 8.34 12 14 14 0 0 1 12 2.85Z" fill="none"/>
    </svg>
  );
}
