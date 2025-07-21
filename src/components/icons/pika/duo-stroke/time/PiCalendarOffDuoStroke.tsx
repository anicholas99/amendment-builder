import React from 'react';

/**
 * PiCalendarOffDuoStroke icon from the duo-stroke style in time category.
 */
interface PiCalendarOffDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCalendarOffDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'calendar-off icon',
  ...props
}: PiCalendarOffDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.96 10c.04.788.04 1.755.04 3 0 2.796 0 4.194-.457 5.296a6 6 0 0 1-3.247 3.247C16.194 22 14.796 22 12 22c-1.955 0-3.227 0-4.191-.156M20.959 10h-1.307m1.308 0c-.023-.45-.06-.84-.116-1.191M3.04 10C3 10.788 3 11.755 3 13c0 2.796 0 4.194.457 5.296.212.513.492.989.83 1.417M3.04 10c.05-.982.163-1.684.417-2.296a6 6 0 0 1 3.247-3.247A5 5 0 0 1 8 4.127M3.04 10H14M8 2v2.128m0 0V6m0-1.872C8.941 4 10.172 4 12 4s3.059 0 4 .128M16 2v2.128m0 0V6m0-1.872c.498.067.915.17 1.296.329.513.212.989.492 1.417.83" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 22 22 2" fill="none"/>
    </svg>
  );
}
