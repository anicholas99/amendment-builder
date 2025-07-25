import React from 'react';

/**
 * PiArrowTurnRightUpContrast icon from the contrast style in arrows-&-chevrons category.
 */
interface PiArrowTurnRightUpContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowTurnRightUpContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-turn-right-up icon',
  ...props
}: PiArrowTurnRightUpContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M20 8.859a25.2 25.2 0 0 0-4.505-4.684.79.79 0 0 0-.99 0A25.2 25.2 0 0 0 10 8.859c.935-.16 1.402-.241 1.87-.303a24 24 0 0 1 6.26 0c.468.062.935.142 1.87.303Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 8.351V12c0 2.8 0 4.2-.545 5.27a5 5 0 0 1-2.185 2.185C11.2 20 9.8 20 7 20H4M15 8.351a24 24 0 0 1 3.13.205c.468.062.935.142 1.87.303a25.2 25.2 0 0 0-4.505-4.684.79.79 0 0 0-.99 0A25.2 25.2 0 0 0 10 8.859c.935-.16 1.402-.241 1.87-.303A24 24 0 0 1 15 8.351Z" fill="none"/>
    </svg>
  );
}
