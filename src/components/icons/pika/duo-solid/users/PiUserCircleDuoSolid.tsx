import React from 'react';

/**
 * PiUserCircleDuoSolid icon from the duo-solid style in users category.
 */
interface PiUserCircleDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserCircleDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'user-circle icon',
  ...props
}: PiUserCircleDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1Z" opacity=".28"/><path fill={color || "currentColor"} d="M19.386 17.144C18.598 15.85 17.135 15 15.5 15h-7c-1.634 0-3.097.85-3.886 2.144A8.99 8.99 0 0 0 12 21a8.99 8.99 0 0 0 7.386-3.856Z"/><path fill={color || "currentColor"} d="M12 6.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z"/>
    </svg>
  );
}
