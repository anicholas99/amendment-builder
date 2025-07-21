import React from 'react';

/**
 * PiAlarmRemoveDuoStroke icon from the duo-stroke style in time category.
 */
interface PiAlarmRemoveDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAlarmRemoveDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'alarm-remove icon',
  ...props
}: PiAlarmRemoveDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3 2 6m17-3 3 3M9 13h6" fill="none"/>
    </svg>
  );
}
