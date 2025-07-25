import React from 'react';

/**
 * PiTimerOffContrast icon from the contrast style in time category.
 */
interface PiTimerOffContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTimerOffContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'timer-off icon',
  ...props
}: PiTimerOffContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M12 5a9 9 0 0 0-7.389 14.14 1 1 0 0 0 1.528.135L17.275 8.14a1 1 0 0 0-.135-1.528A8.96 8.96 0 0 0 12 5Z" fill="none" stroke="currentColor"/><path d="M20.08 10.03a1 1 0 0 0-1.605-.265l-10.71 10.71a1 1 0 0 0 .265 1.604A9 9 0 0 0 20.08 10.03Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2v4m0-4h-2m2 0h2m-2 4a8 8 0 0 0-6.568 12.568M12 6c1.698 0 3.273.53 4.568 1.432m2.614 3.04a8 8 0 0 1-10.71 10.71m8.096-13.75L22 2m-5.432 5.432L5.432 18.568m0 0L2 22" fill="none"/>
    </svg>
  );
}
