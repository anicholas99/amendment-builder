import React from 'react';

/**
 * PiListCheckBoxDuoSolid icon from the duo-solid style in general category.
 */
interface PiListCheckBoxDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiListCheckBoxDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'list-check-box icon',
  ...props
}: PiListCheckBoxDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12h9m-9 6h9M12 6h9" opacity=".28"/><path fill={color || "currentColor"} d="M4 4a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/><path fill={color || "currentColor"} d="M9.155 14.826a1 1 0 1 0-1.128-1.652 13.1 13.1 0 0 0-3.302 3.24l-1.018-1.017a1 1 0 0 0-1.414 1.415l1.898 1.895a1 1 0 0 0 1.574-.21 11.15 11.15 0 0 1 3.39-3.671Z"/>
    </svg>
  );
}
