import React from 'react';

/**
 * PiCampFireContrast icon from the contrast style in general category.
 */
interface PiCampFireContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCampFireContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'camp-fire icon',
  ...props
}: PiCampFireContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M11 17c.593 0 1.34-1.514 1.616-2.809.94.57 2.384 2.09 2.384 3.84 0 1.484-1 2.967-3 2.967s-3-1.483-3-2.966c0-.885.369-1.711.855-2.386C10.324 16.314 11 17 11 17Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 21 12 5.167m0 0L14 2m-2 3.167L22 21M12 5.167 10 2m1 15c.593 0 1.34-1.514 1.616-2.808.94.57 2.384 2.09 2.384 3.84C15 19.516 14 21 12 21s-3-1.483-3-2.967c0-.884.369-1.71.855-2.385C10.324 16.314 11 17 11 17Z" fill="none"/>
    </svg>
  );
}
