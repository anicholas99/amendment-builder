import React from 'react';

/**
 * PiTableLampOnDuoSolid icon from the duo-solid style in appliances category.
 */
interface PiTableLampOnDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTableLampOnDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'table-lamp-on icon',
  ...props
}: PiTableLampOnDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M13 12a1 1 0 1 0-2 0v5h-1a3 3 0 0 0-3 3v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-1z" opacity=".28"/><path fill={color || "currentColor"} d="M8.612 2a3 3 0 0 0-2.827 1.995l-2.727 7.67A1 1 0 0 0 4 13h16a1 1 0 0 0 .942-1.335l-2.727-7.67A3 3 0 0 0 15.39 2z"/><path fill={color || "currentColor"} d="M6.894 15.447a1 1 0 1 0-1.788-.894l-1 2a1 1 0 1 0 1.788.894z"/><path fill={color || "currentColor"} d="M18.894 14.553a1 1 0 1 0-1.788.894l1 2a1 1 0 1 0 1.788-.894z"/>
    </svg>
  );
}
