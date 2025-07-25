import React from 'react';

/**
 * PiAcHeatDuoStroke icon from the duo-stroke style in appliances category.
 */
interface PiAcHeatDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAcHeatDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'ac-heat icon',
  ...props
}: PiAcHeatDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 4H4a2 2 0 0 0-2 2v6h20V6a2 2 0 0 0-2-2Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 8h-2m1.237 7c1.676 1.532 2.579 2.601 2.579 4.421 0 1.39-1.176 2.579-2.58 2.579-1.403 0-2.578-1.19-2.578-2.579 0-.425.16-.845.368-1.105 1.907 1.315 3.48-1.129 2.21-3.316Z" fill="none"/>
    </svg>
  );
}
