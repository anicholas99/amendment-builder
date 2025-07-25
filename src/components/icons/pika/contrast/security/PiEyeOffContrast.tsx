import React from 'react';

/**
 * PiEyeOffContrast icon from the contrast style in security category.
 */
interface PiEyeOffContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEyeOffContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'eye-off icon',
  ...props
}: PiEyeOffContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M3 12c0-2 3.5-7 9-7 2.076 0 3.867.712 5.293 1.707L6.707 17.293C4.357 15.653 3 13.245 3 12Z" fill="none" stroke="currentColor"/><path d="m10.038 18.205 2.212-2.213a4 4 0 0 0 3.742-3.742l3.379-3.379a1 1 0 0 1 1.548.166C21.561 10.035 22 11.112 22 12c0 .743-.307 1.606-.757 2.42a11 11 0 0 1-1.988 2.551C17.555 18.604 15.068 20 12 20a10 10 0 0 1-1.396-.098 1 1 0 0 1-.566-1.697Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.078 9.578c.6.935.922 1.816.922 2.422 0 2-3.5 7-9 7q-.647 0-1.255-.088m6.548-12.205C15.867 5.712 14.076 5 12 5c-5.5 0-9 5-9 7 0 1.245 1.356 3.653 3.707 5.293M17.293 6.707 22 2m-4.707 4.707L14.12 9.88m-7.414 7.414L2 22m4.707-4.707L9.88 14.12m0 0a3 3 0 1 1 4.243-4.243M9.88 14.12l4.24-4.24" fill="none"/>
    </svg>
  );
}
