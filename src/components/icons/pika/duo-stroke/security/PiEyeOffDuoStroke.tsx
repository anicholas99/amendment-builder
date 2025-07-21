import React from 'react';

/**
 * PiEyeOffDuoStroke icon from the duo-stroke style in security category.
 */
interface PiEyeOffDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEyeOffDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'eye-off icon',
  ...props
}: PiEyeOffDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.078 9.578c.6.935.922 1.816.922 2.422 0 2-3.5 7-9 7q-.647 0-1.255-.088m6.548-12.205C15.867 5.712 14.076 5 12 5c-5.5 0-9 5-9 7 0 1.245 1.356 3.653 3.707 5.293M9.88 14.12a3 3 0 1 1 4.243-4.243" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 2 2 22" fill="none"/>
    </svg>
  );
}
