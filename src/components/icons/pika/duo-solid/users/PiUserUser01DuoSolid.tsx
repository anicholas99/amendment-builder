import React from 'react';

/**
 * PiUserUser01DuoSolid icon from the duo-solid style in users category.
 */
interface PiUserUser01DuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserUser01DuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'user-user-01 icon',
  ...props
}: PiUserUser01DuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M7 14a4 4 0 0 0 0 8h10a4 4 0 0 0 0-8z" opacity=".28"/><path fill={color || "currentColor"} d="M12 2.25a4.75 4.75 0 1 0 0 9.5 4.75 4.75 0 0 0 0-9.5Z"/>
    </svg>
  );
}
