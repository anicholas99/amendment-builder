import React from 'react';

/**
 * PiAlarmRemoveDuoSolid icon from the duo-solid style in time category.
 */
interface PiAlarmRemoveDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAlarmRemoveDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'alarm-remove icon',
  ...props
}: PiAlarmRemoveDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path fill={color || "currentColor"} d="M12 4a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z" opacity=".28"/><path fill={color || "currentColor"} d="M5.707 3.707a1 1 0 0 0-1.414-1.414l-3 3a1 1 0 0 0 1.414 1.414z"/><path fill={color || "currentColor"} d="M19.707 2.293a1 1 0 1 0-1.414 1.414l3 3a1 1 0 1 0 1.414-1.414z"/><path fill={color || "currentColor"} d="M8.9 12a1 1 0 1 0 0 2h6.2a1 1 0 1 0 0-2z"/>
    </svg>
  );
}
