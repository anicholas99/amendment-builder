import React from 'react';

/**
 * PiUserBotDuoSolid icon from the duo-solid style in users category.
 */
interface PiUserBotDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserBotDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'user-bot icon',
  ...props
}: PiUserBotDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M8 14a5 5 0 0 0-5 5 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 5 5 0 0 0-5-5z" opacity=".28"/><path fill={color || "currentColor"} d="M13 3a1 1 0 1 0-2 0v1h-1a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3h-1z"/>
    </svg>
  );
}
