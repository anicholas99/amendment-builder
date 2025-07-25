import React from 'react';

/**
 * PiBinanceDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiBinanceDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBinanceDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'binance icon',
  ...props
}: PiBinanceDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m3.411 13.718-.341-.342a1.947 1.947 0 0 1 0-2.753l.341-.34m17.177 0 .342.34c.76.76.76 1.993 0 2.753l-.342.341m-3.435 3.436-3.534 3.534a2.29 2.29 0 0 1-3.239 0l-3.533-3.534M17.153 6.847l-3.534-3.534a2.29 2.29 0 0 0-3.239 0L6.847 6.847" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.374 12.81a1.145 1.145 0 0 1 0-1.62l1.815-1.815a1.145 1.145 0 0 1 1.62 0l1.814 1.815a1.145 1.145 0 0 1 0 1.62l-1.814 1.814a1.145 1.145 0 0 1-1.62 0z" fill="none"/>
    </svg>
  );
}
