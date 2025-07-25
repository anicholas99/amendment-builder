import React from 'react';

/**
 * PiArrowTurnDownRightDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiArrowTurnDownRightDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowTurnDownRightDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-turn-down-right icon',
  ...props
}: PiArrowTurnDownRightDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.649 15H11c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C3 11.2 3 9.8 3 7V4" opacity=".28"/><path fill={color || "currentColor"} d="M13.156 10.17a1 1 0 0 1 1.58-.974 26.2 26.2 0 0 1 4.87 4.684 1.79 1.79 0 0 1 0 2.24 26.2 26.2 0 0 1-4.87 4.684 1 1 0 0 1-1.58-.973c.162-.942.238-1.388.296-1.831a23 23 0 0 0 0-6 49 49 0 0 0-.296-1.83Z"/>
    </svg>
  );
}
