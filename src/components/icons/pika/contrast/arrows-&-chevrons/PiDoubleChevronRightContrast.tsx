import React from 'react';

/**
 * PiDoubleChevronRightContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiDoubleChevronRightContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDoubleChevronRightContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'double-chevron-right icon',
  ...props
}: PiDoubleChevronRightContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M16.894 11.702A20.4 20.4 0 0 0 13 8l.165 2.205a24 24 0 0 1 0 3.59L13 16a20.4 20.4 0 0 0 3.894-3.702.47.47 0 0 0 0-.596Z" fill="none" stroke="currentColor"/><path d="M10.894 11.702A20.4 20.4 0 0 0 7 8l.165 2.205a24 24 0 0 1 0 3.59L7 16a20.4 20.4 0 0 0 3.894-3.702.47.47 0 0 0 0-.596Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.894 11.702A20.4 20.4 0 0 0 13 8l.165 2.205a24 24 0 0 1 0 3.59L13 16a20.4 20.4 0 0 0 3.894-3.702.47.47 0 0 0 0-.596Z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.894 11.702A20.4 20.4 0 0 0 7 8l.165 2.205a24 24 0 0 1 0 3.59L7 16a20.4 20.4 0 0 0 3.894-3.702.47.47 0 0 0 0-.596Z" fill="none"/>
    </svg>
  );
}
