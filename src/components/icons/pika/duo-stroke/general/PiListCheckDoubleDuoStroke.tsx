import React from 'react';

/**
 * PiListCheckDoubleDuoStroke icon from the duo-stroke style in general category.
 */
interface PiListCheckDoubleDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiListCheckDoubleDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'list-check-double icon',
  ...props
}: PiListCheckDoubleDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12h9m-9 6h9M12 6h9" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8.105 4.897 10a12.14 12.14 0 0 1 3.694-4M3 16.105 4.897 18a12.14 12.14 0 0 1 3.694-4" fill="none"/>
    </svg>
  );
}
