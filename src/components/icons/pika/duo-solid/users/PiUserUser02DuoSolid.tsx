import React from 'react';

/**
 * PiUserUser02DuoSolid icon from the duo-solid style in users category.
 */
interface PiUserUser02DuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserUser02DuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'user-user-02 icon',
  ...props
}: PiUserUser02DuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M15.224 13.723C18.02 12.675 21 14.74 21 17.725A4.275 4.275 0 0 1 16.725 22h-9.45A4.275 4.275 0 0 1 3 17.725c0-2.984 2.981-5.05 5.776-4.002l1.925.722a3.7 3.7 0 0 0 2.598 0z" opacity=".28"/><path fill={color || "currentColor"} d="M12 2.25a4.75 4.75 0 1 0 0 9.5 4.75 4.75 0 0 0 0-9.5Z"/>
    </svg>
  );
}
