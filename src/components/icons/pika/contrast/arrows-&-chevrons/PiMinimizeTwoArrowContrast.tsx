import React from 'react';

/**
 * PiMinimizeTwoArrowContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiMinimizeTwoArrowContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMinimizeTwoArrowContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'minimize-two-arrow icon',
  ...props
}: PiMinimizeTwoArrowContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M10.347 13.087A20.8 20.8 0 0 0 5 13.29l1.73 1.493a24 24 0 0 1 2.488 2.487L10.71 19c.298-1.779.366-3.576.202-5.347a.625.625 0 0 0-.566-.566Z" fill="none" stroke="currentColor"/><path d="M13.653 10.913c1.771.164 3.568.096 5.347-.202l-1.73-1.493a24 24 0 0 1-2.488-2.487L13.29 5a20.8 20.8 0 0 0-.202 5.347.625.625 0 0 0 .566.566Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.347 13.087A20.8 20.8 0 0 0 5 13.29l1.73 1.493a24 24 0 0 1 2.488 2.487L10.71 19c.298-1.779.366-3.576.202-5.347a.625.625 0 0 0-.566-.566Z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.653 10.913c1.771.164 3.568.096 5.347-.202l-1.73-1.493a24 24 0 0 1-2.488-2.487L13.29 5a20.8 20.8 0 0 0-.202 5.347.625.625 0 0 0 .566.566Z" fill="none"/>
    </svg>
  );
}
