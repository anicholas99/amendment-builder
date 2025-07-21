import React from 'react';

/**
 * PiBulbOnDuoStroke icon from the duo-stroke style in appliances category.
 */
interface PiBulbOnDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBulbOnDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'bulb-on icon',
  ...props
}: PiBulbOnDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.994c-3.14 0-5.687 2.45-5.687 5.474 0 1.657.765 3.142 1.974 4.146.51.424.95.95 1.116 1.593l.227.875c.14.537.625.912 1.18.912h2.38c.556 0 1.04-.375 1.18-.912l.227-.875c.167-.643.606-1.17 1.117-1.593 1.209-1.004 1.974-2.489 1.974-4.146 0-3.023-2.547-5.474-5.688-5.474Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.379 21h3.242M12 2V1m7 3.707L19.707 4m-15 .707L4 4m18 7h-1M3 11H2" fill="none"/>
    </svg>
  );
}
