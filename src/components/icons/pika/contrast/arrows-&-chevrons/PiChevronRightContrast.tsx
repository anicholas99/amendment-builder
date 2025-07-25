import React from 'react';

/**
 * PiChevronRightContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiChevronRightContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiChevronRightContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'chevron-right icon',
  ...props
}: PiChevronRightContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M13.894 11.702A20.4 20.4 0 0 0 10 8l.304 4L10 16a20.4 20.4 0 0 0 3.894-3.702.47.47 0 0 0 0-.596Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.894 11.702A20.4 20.4 0 0 0 10 8a53 53 0 0 1 0 8 20.4 20.4 0 0 0 3.894-3.702.47.47 0 0 0 0-.596Z" fill="none"/>
    </svg>
  );
}
