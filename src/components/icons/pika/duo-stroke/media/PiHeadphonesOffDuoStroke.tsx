import React from 'react';

/**
 * PiHeadphonesOffDuoStroke icon from the duo-stroke style in media category.
 */
interface PiHeadphonesOffDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiHeadphonesOffDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'headphones-off icon',
  ...props
}: PiHeadphonesOffDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.993 15.618a2.378 2.378 0 0 0-4.572-1.31l-1.049 3.658a2.378 2.378 0 1 0 4.572 1.31zm0 0a9.5 9.5 0 0 0 .519-3.106 9.5 9.5 0 0 0-.722-3.643m.203 6.749-.007.022m-17.98-.023a2.378 2.378 0 0 1 4.573-1.309l.47 1.643m-5.043-.334.018.052m-.018-.052a9.5 9.5 0 0 1-.518-3.105A9.51 9.51 0 0 1 12 3a9.48 9.48 0 0 1 6.465 2.535M3.006 15.617l1.05 3.66q.072.253.193.474" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 22 22 2" fill="none"/>
    </svg>
  );
}
