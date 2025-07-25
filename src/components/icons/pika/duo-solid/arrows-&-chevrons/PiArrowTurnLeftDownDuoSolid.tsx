import React from 'react';

/**
 * PiArrowTurnLeftDownDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiArrowTurnLeftDownDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowTurnLeftDownDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-turn-left-down icon',
  ...props
}: PiArrowTurnLeftDownDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 15.649V12c0-2.8 0-4.2.545-5.27a5 5 0 0 1 2.185-2.185C12.8 4 14.2 4 17 4h3" opacity=".28"/><path fill={color || "currentColor"} d="M13.83 14.156a1 1 0 0 1 .974 1.58 26.2 26.2 0 0 1-4.684 4.87 1.79 1.79 0 0 1-2.24 0 26.2 26.2 0 0 1-4.684-4.87 1 1 0 0 1 .973-1.58c.942.162 1.388.238 1.831.297a23 23 0 0 0 6 0 49 49 0 0 0 1.83-.297Z"/>
    </svg>
  );
}
