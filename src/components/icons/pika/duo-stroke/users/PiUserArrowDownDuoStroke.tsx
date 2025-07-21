import React from 'react';

/**
 * PiUserArrowDownDuoStroke icon from the duo-stroke style in users category.
 */
interface PiUserArrowDownDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserArrowDownDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'user-arrow-down icon',
  ...props
}: PiUserArrowDownDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.431 21H5a2 2 0 0 1-2-2 4 4 0 0 1 4-4h8" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 19.189a15 15 0 0 1-2.556 2.654A.7.7 0 0 1 19 22m-3-2.811c.74.986 1.599 1.878 2.556 2.654.13.105.287.157.444.157m0 0v-7m-4-8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" fill="none"/>
    </svg>
  );
}
