import React from 'react';

/**
 * PiPlaystationContrast icon from the contrast style in apps-&-social category.
 */
interface PiPlaystationContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPlaystationContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'playstation icon',
  ...props
}: PiPlaystationContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M11 2v7.53l1 .329V5a1 1 0 1 1 2 0v5.84h.995l1.582.518c4.554 1.246 4.677-6.172 0-7.575z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8.04 13.872-4.2 1.903c-4.052 1.55-.695 5.323 3.165 4.075l1.035-.421m5.958-3.266 2.951-1.079c3.686-1.303 7.362 2.608 3.22 4.076L14 21.126m1-10.285 1.577.517c4.554 1.246 4.677-6.172 0-7.575L11 2v20" fill="none"/>
    </svg>
  );
}
