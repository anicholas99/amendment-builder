import React from 'react';

/**
 * PiPiechartRoseDuoSolid icon from the duo-solid style in chart-&-graph category.
 */
interface PiPiechartRoseDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPiechartRoseDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'piechart-rose icon',
  ...props
}: PiPiechartRoseDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M9.995 6.66a1 1 0 0 0-1.3-.954A7.66 7.66 0 0 0 3.7 10.7a1 1 0 0 0 .954 1.3h4.34a1 1 0 0 0 1-1zM19.63 14h-6.636a1 1 0 0 0-1 1v6.637a1 1 0 0 0 1.225.974 9.88 9.88 0 0 0 7.386-7.386A1 1 0 0 0 19.63 14ZM3.5 14a1 1 0 0 0-.967 1.257 8.77 8.77 0 0 0 6.204 6.205 1 1 0 0 0 1.257-.966V15a1 1 0 0 0-1-1z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M12.361 2.288a1 1 0 0 1 .83-.208 11.15 11.15 0 0 1 8.724 8.724 1 1 0 0 1-.98 1.196h-7.94a1 1 0 0 1-1-1V3.062a1 1 0 0 1 .366-.773Z"/>
    </svg>
  );
}
