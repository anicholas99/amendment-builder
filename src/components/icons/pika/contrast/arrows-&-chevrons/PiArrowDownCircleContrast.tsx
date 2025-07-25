import React from 'react';

/**
 * PiArrowDownCircleContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiArrowDownCircleContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowDownCircleContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-down-circle icon',
  ...props
}: PiArrowDownCircleContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M12 2.85a9.15 9.15 0 1 0 0 18.3 9.15 9.15 0 0 0 0-18.3Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12.051a20.3 20.3 0 0 1-3.604 3.807A.63.63 0 0 1 12 16m-4-3.95a20.3 20.3 0 0 0 3.604 3.807A.63.63 0 0 0 12 16m0 0V8m-9.15 4a9.15 9.15 0 1 1 18.3 0 9.15 9.15 0 0 1-18.3 0Z" fill="none"/>
    </svg>
  );
}
