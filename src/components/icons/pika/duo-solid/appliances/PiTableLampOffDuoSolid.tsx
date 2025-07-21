import React from 'react';

/**
 * PiTableLampOffDuoSolid icon from the duo-solid style in appliances category.
 */
interface PiTableLampOffDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTableLampOffDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'table-lamp-off icon',
  ...props
}: PiTableLampOffDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M13 12a1 1 0 1 0-2 0v5h-1a3 3 0 0 0-3 3v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-1z" opacity=".28"/><path fill={color || "currentColor"} d="M8.612 2a3 3 0 0 0-2.827 1.995l-2.727 7.67A1 1 0 0 0 4 13h16a1 1 0 0 0 .942-1.335l-2.727-7.67A3 3 0 0 0 15.39 2z"/>
    </svg>
  );
}
