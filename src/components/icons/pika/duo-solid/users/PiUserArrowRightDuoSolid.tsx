import React from 'react';

/**
 * PiUserArrowRightDuoSolid icon from the duo-solid style in users category.
 */
interface PiUserArrowRightDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserArrowRightDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'user-arrow-right icon',
  ...props
}: PiUserArrowRightDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M16.355 14.012A5 5 0 0 0 16 14H8a5 5 0 0 0-5 5 3 3 0 0 0 3 3h10.36a3 3 0 0 1-.172-1H15a3 3 0 1 1 0-6h1.188c0-.332.055-.667.167-.988Z" opacity=".28"/><path fill={color || "currentColor"} d="M7 7a5 5 0 1 1 10 0A5 5 0 0 1 7 7Z"/><path fill={color || "currentColor"} d="M22.62 16.927a1.7 1.7 0 0 1 0 2.146 16 16 0 0 1-2.832 2.727 1 1 0 1 1-1.2-1.6q.74-.555 1.398-1.2H15a1 1 0 1 1 0-2h4.986q-.658-.645-1.398-1.2a1 1 0 1 1 1.2-1.6 16 16 0 0 1 2.831 2.727Z"/>
    </svg>
  );
}
