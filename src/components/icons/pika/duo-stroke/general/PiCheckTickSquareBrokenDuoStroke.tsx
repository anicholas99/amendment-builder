import React from 'react';

/**
 * PiCheckTickSquareBrokenDuoStroke icon from the duo-stroke style in general category.
 */
interface PiCheckTickSquareBrokenDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCheckTickSquareBrokenDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'check-tick-square-broken icon',
  ...props
}: PiCheckTickSquareBrokenDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.995 10.34C21 10.833 21 11.382 21 12c0 2.796 0 4.194-.457 5.296a6 6 0 0 1-3.247 3.247C16.194 21 14.796 21 12 21s-4.193 0-5.296-.457a6 6 0 0 1-3.247-3.247C3 16.194 3 14.796 3 12s0-4.193.457-5.296a6 6 0 0 1 3.247-3.247C7.807 3 9.204 3 12 3c2.552 0 3.939 0 5 .347" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21.035 5.403-.793.541a25.64 25.64 0 0 0-7.799 8.447l-.359.629L8.61 11" fill="none"/>
    </svg>
  );
}
