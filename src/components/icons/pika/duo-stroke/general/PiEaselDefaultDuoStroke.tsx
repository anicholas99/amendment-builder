import React from 'react';

/**
 * PiEaselDefaultDuoStroke icon from the duo-stroke style in general category.
 */
interface PiEaselDefaultDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEaselDefaultDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'easel-default icon',
  ...props
}: PiEaselDefaultDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3H8.4c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C2 6.04 2 7.16 2 9.4v2.2c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748c.803.41 1.84.434 3.816.436a5926 5926 0 0 0 8.03 0c1.957-.002 2.987-.029 3.786-.436a4 4 0 0 0 1.748-1.748C22 14.96 22 13.84 22 11.6V9.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C18.96 3 17.84 3 15.6 3z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3V2M6 22l2-4m10 4-1.97-4M12 21v-2.998" opacity=".28" fill="none"/>
    </svg>
  );
}
