import React from 'react';

/**
 * PiUserArrowUpDuoSolid icon from the duo-solid style in users category.
 */
interface PiUserArrowUpDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserArrowUpDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'user-arrow-up icon',
  ...props
}: PiUserArrowUpDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M14.417 14H7a5 5 0 0 0-5 5 3 3 0 0 0 3 3h11v-2.188a3 3 0 0 1-2.4-4.8q.39-.522.817-1.012Z" opacity=".28"/><path fill={color || "currentColor"} d="M6 7a5 5 0 1 1 10 0A5 5 0 0 1 6 7Z"/><path fill={color || "currentColor"} d="M19 13c-.38 0-.76.127-1.073.38a16 16 0 0 0-2.727 2.832 1 1 0 1 0 1.6 1.2q.555-.74 1.2-1.398V21a1 1 0 1 0 2 0v-4.986q.645.658 1.2 1.398a1 1 0 1 0 1.6-1.2 16 16 0 0 0-2.727-2.832A1.7 1.7 0 0 0 19 13Z"/>
    </svg>
  );
}
