import React from 'react';

/**
 * PiUserCancelDuoStroke icon from the duo-stroke style in users category.
 */
interface PiUserCancelDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserCancelDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'user-cancel icon',
  ...props
}: PiUserCancelDuoStrokeProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.53 15H7a4 4 0 0 0-4 4 2 2 0 0 0 2 2h8.354" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 13-2.5 2.5m0 0L16 18m2.5-2.5L21 18m-2.5-2.5L16 13m-1-6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" fill="none"/>
    </svg>
  );
}
