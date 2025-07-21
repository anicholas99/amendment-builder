import React from 'react';

/**
 * PiSunriseUpDuoStroke icon from the duo-stroke style in weather category.
 */
interface PiSunriseUpDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSunriseUpDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'sunrise-up icon',
  ...props
}: PiSunriseUpDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 17h1m18 0h1M4.472 10.422l.753.658m14.31-.658-.754.658" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.004 20.996a5 5 0 1 0-8.012-.007m8.012.007-8.013-.007m8.013.007L21 21m-13.009-.011L3 20.984M9.557 5.29a12.2 12.2 0 0 1 2.082-2.162A.57.57 0 0 1 12 3m2.444 2.29a12.2 12.2 0 0 0-2.083-2.162.57.57 0 0 0-.36-.128m0 0v6" fill="none"/>
    </svg>
  );
}
