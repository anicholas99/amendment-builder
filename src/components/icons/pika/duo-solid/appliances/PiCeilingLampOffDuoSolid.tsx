import React from 'react';

/**
 * PiCeilingLampOffDuoSolid icon from the duo-solid style in appliances category.
 */
interface PiCeilingLampOffDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCeilingLampOffDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'ceiling-lamp-off icon',
  ...props
}: PiCeilingLampOffDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M3 17h18a1 1 0 0 0 1-1c0-5.523-4.477-10-10-10S2 10.477 2 16a1 1 0 0 0 1 1Z" opacity=".28"/><path fill={color || "currentColor"} d="M13 4a1 1 0 0 0-2 0v2.05a10 10 0 0 1 2 0z"/><path fill={color || "currentColor"} d="M8.126 17a4.002 4.002 0 0 0 7.748 0h-2.142a2 2 0 0 1-3.464 0z"/>
    </svg>
  );
}
