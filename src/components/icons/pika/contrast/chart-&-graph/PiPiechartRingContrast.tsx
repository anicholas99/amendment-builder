import React from 'react';

/**
 * PiPiechartRingContrast icon from the contrast style in chart-&-graph category.
 */
interface PiPiechartRingContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPiechartRingContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'piechart-ring icon',
  ...props
}: PiPiechartRingContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M21.15 12a9.15 9.15 0 1 1-18.3 0 9.15 9.15 0 0 1 18.3 0Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.15a9.15 9.15 0 0 0 6.698-15.384M12 21.15V15m0 6.15A9.15 9.15 0 0 1 2.85 12m0 0a9.15 9.15 0 0 1 15.848-6.234M2.85 12H9m3 3a3 3 0 0 0 2.34-4.876M12 15a3 3 0 0 1-3-3m0 0a3 3 0 0 1 5.34-1.876m0 0 4.358-4.358" fill="none"/>
    </svg>
  );
}
