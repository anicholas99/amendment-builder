import React from 'react';

/**
 * PiChevronBigUpContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiChevronBigUpContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiChevronBigUpContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'chevron-big-up icon',
  ...props
}: PiChevronBigUpContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M12.51 9.183A30.6 30.6 0 0 1 18 15a72 72 0 0 0-12 0 30.6 30.6 0 0 1 5.49-5.817.8.8 0 0 1 1.02 0Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.51 9.183A30.6 30.6 0 0 1 18 15a72 72 0 0 0-12 0 30.6 30.6 0 0 1 5.49-5.817.8.8 0 0 1 1.02 0Z" fill="none"/>
    </svg>
  );
}
