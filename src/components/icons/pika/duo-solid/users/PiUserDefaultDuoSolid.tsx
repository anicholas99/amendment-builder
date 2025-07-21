import React from 'react';

/**
 * PiUserDefaultDuoSolid icon from the duo-solid style in users category.
 */
interface PiUserDefaultDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserDefaultDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'user-default icon',
  ...props
}: PiUserDefaultDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M8 14a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5z" opacity=".28"/><path fill={color || "currentColor"} d="M12 2a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z"/>
    </svg>
  );
}
