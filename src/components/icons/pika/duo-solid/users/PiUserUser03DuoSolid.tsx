import React from 'react';

/**
 * PiUserUser03DuoSolid icon from the duo-solid style in users category.
 */
interface PiUserUser03DuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserUser03DuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'user-user-03 icon',
  ...props
}: PiUserUser03DuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M10.178 13.675C6.57 12.675 3 15.39 3 19.135A2.866 2.866 0 0 0 5.866 22h12.268A2.866 2.866 0 0 0 21 19.134c0-3.745-3.57-6.46-7.178-5.459l-.696.193a4.2 4.2 0 0 1-2.252 0z" opacity=".28"/><path fill={color || "currentColor"} d="M12 2.25a4.75 4.75 0 1 0 0 9.5 4.75 4.75 0 0 0 0-9.5Z"/>
    </svg>
  );
}
