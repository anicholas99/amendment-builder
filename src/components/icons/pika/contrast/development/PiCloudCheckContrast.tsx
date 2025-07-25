import React from 'react';

/**
 * PiCloudCheckContrast icon from the contrast style in development category.
 */
interface PiCloudCheckContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCloudCheckContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'cloud-check icon',
  ...props
}: PiCloudCheckContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M22 14.5a5.5 5.5 0 0 1-5.5 5.5h-10a4.5 4.5 0 0 1-.483-8.974 6.5 6.5 0 0 1 12.651-1.582A5.5 5.5 0 0 1 22 14.5Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 13.597 2.341 2.339A15 15 0 0 1 15.9 11m.601 9a5.5 5.5 0 0 0 2.168-10.556 6.5 6.5 0 0 0-12.651 1.582A4.5 4.5 0 0 0 6.5 20z" fill="none"/>
    </svg>
  );
}
