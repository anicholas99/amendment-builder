import React from 'react';

/**
 * PiChevronBigRightContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiChevronBigRightContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiChevronBigRightContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'chevron-big-right icon',
  ...props
}: PiChevronBigRightContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M14.817 12.51A30.6 30.6 0 0 1 9 18 72 72 0 0 0 9 6a30.6 30.6 0 0 1 5.817 5.49c.244.3.244.72 0 1.02Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.817 12.51A30.6 30.6 0 0 1 9 18 72 72 0 0 0 9 6a30.6 30.6 0 0 1 5.817 5.49c.244.3.244.72 0 1.02Z" fill="none"/>
    </svg>
  );
}
