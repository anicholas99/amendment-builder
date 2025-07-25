import React from 'react';

/**
 * PiChevronSortHorizontalContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiChevronSortHorizontalContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiChevronSortHorizontalContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'chevron-sort-horizontal icon',
  ...props
}: PiChevronSortHorizontalContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M18.894 12.298A20.4 20.4 0 0 1 15 16c.2-2.663.2-5.337 0-8a20.4 20.4 0 0 1 3.894 3.702.47.47 0 0 1 0 .596Z" fill="none" stroke="currentColor"/><path d="M5.106 11.702A20.4 20.4 0 0 1 9 8c-.2 2.663-.2 5.337 0 8a20.4 20.4 0 0 1-3.894-3.702.47.47 0 0 1 0-.596Z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.894 12.298A20.4 20.4 0 0 1 15 16c.2-2.663.2-5.337 0-8a20.4 20.4 0 0 1 3.894 3.702.47.47 0 0 1 0 .596Z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.106 11.702A20.4 20.4 0 0 1 9 8c-.2 2.663-.2 5.337 0 8a20.4 20.4 0 0 1-3.894-3.702.47.47 0 0 1 0-.596Z" fill="none"/>
    </svg>
  );
}
