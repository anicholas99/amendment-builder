import React from 'react';

/**
 * PiArrowTurnDownLeftContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiArrowTurnDownLeftContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowTurnDownLeftContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-turn-down-left icon',
  ...props
}: PiArrowTurnDownLeftContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M8.859 20a25.2 25.2 0 0 1-4.684-4.505.79.79 0 0 1 0-.99A25.2 25.2 0 0 1 8.859 10c-.16.935-.241 1.402-.303 1.87a24 24 0 0 0 0 6.26c.062.468.142.935.303 1.87Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.351 15H12c2.8 0 4.2 0 5.27-.545a5 5 0 0 0 2.185-2.185C20 11.2 20 9.8 20 7V4M8.351 15a24 24 0 0 0 .205 3.13c.062.468.142.935.303 1.87a25.2 25.2 0 0 1-4.684-4.505.79.79 0 0 1 0-.99A25.2 25.2 0 0 1 8.859 10c-.16.935-.241 1.402-.303 1.87A24 24 0 0 0 8.351 15Z" fill="none"/>
    </svg>
  );
}
