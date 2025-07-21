import React from 'react';

/**
 * PiTableLampOffDuoStroke icon from the duo-stroke style in appliances category.
 */
interface PiTableLampOffDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTableLampOffDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'table-lamp-off icon',
  ...props
}: PiTableLampOffDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18v-6m-3 9h6m1 0v-1a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.727 4.33A2 2 0 0 1 8.612 3h6.777a2 2 0 0 1 1.884 1.33L20 12H4z" fill="none"/>
    </svg>
  );
}
