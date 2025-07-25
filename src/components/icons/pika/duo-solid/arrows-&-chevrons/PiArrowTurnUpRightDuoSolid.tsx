import React from 'react';

/**
 * PiArrowTurnUpRightDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiArrowTurnUpRightDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowTurnUpRightDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-turn-up-right icon',
  ...props
}: PiArrowTurnUpRightDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.649 9H11c-2.8 0-4.2 0-5.27.545a5 5 0 0 0-2.185 2.185C3 12.8 3 14.2 3 17v3" opacity=".28"/><path fill={color || "currentColor"} d="M13.156 13.83a1 1 0 0 0 1.58.974 26.2 26.2 0 0 0 4.87-4.684 1.79 1.79 0 0 0 0-2.24 26.2 26.2 0 0 0-4.87-4.684 1 1 0 0 0-1.58.973c.162.942.238 1.388.296 1.831a23 23 0 0 1 0 6 49 49 0 0 1-.296 1.83Z"/>
    </svg>
  );
}
