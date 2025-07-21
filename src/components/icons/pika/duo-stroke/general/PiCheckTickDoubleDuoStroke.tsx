import React from 'react';

/**
 * PiCheckTickDoubleDuoStroke icon from the duo-stroke style in general category.
 */
interface PiCheckTickDoubleDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCheckTickDoubleDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'check-tick-double icon',
  ...props
}: PiCheckTickDoubleDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21.553 7.609-.87.491a26.7 26.7 0 0 0-8.837 8.07l-.428.62-.298-.353" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m2.605 11.781 4.524 5.224.374-.654a26.7 26.7 0 0 1 8.119-8.793l.825-.563" fill="none"/>
    </svg>
  );
}
