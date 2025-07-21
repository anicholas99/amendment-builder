import React from 'react';

/**
 * PiUserPlusDuoSolid icon from the duo-solid style in users category.
 */
interface PiUserPlusDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserPlusDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'user-plus icon',
  ...props
}: PiUserPlusDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M2 19a5 5 0 0 1 5-5h5.17A3 3 0 0 0 15 18a3 3 0 0 0 4.562 2.562A3 3 0 0 1 17 22H5a3 3 0 0 1-3-3Z" opacity=".28"/><path fill={color || "currentColor"} d="M11 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/><path fill={color || "currentColor"} d="M19 12a1 1 0 1 0-2 0v2h-2a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0-2h-2z"/>
    </svg>
  );
}
