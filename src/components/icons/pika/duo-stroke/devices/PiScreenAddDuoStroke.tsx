import React from 'react';

/**
 * PiScreenAddDuoStroke icon from the duo-stroke style in devices category.
 */
interface PiScreenAddDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiScreenAddDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'screen-add icon',
  ...props
}: PiScreenAddDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.353 2H4.4c-.84 0-1.26 0-1.581.163a1.5 1.5 0 0 0-.656.656C2 3.139 2 3.559 2 4.4v10.2c0 .84 0 1.26.163 1.581a1.5 1.5 0 0 0 .656.656c.32.163.74.163 1.581.163h15.2c.84 0 1.26 0 1.581-.163a1.5 1.5 0 0 0 .656-.656c.163-.32.163-.74.163-1.581v-3.135" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 8V5m0 0V2m0 3h-3m3 0h3" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20.875V17m0 3.875c-1.75 0-3.5.375-5 1.125m5-1.125c1.75 0 3.5.375 5 1.125" opacity=".28" fill="none"/>
    </svg>
  );
}
