import React from 'react';

/**
 * PiVolumeOffDuoStroke icon from the duo-stroke style in media category.
 */
interface PiVolumeOffDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiVolumeOffDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'volume-off icon',
  ...props
}: PiVolumeOffDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 7V5.107c0-1.71-1.934-2.706-3.326-1.711L10.86 5.405a4.9 4.9 0 0 1-1.898.822A4.93 4.93 0 0 0 5 11.061v1.918a4.93 4.93 0 0 0 2.032 3.989M17 12.648v6.284c0 1.711-1.934 2.706-3.326 1.712l-2.724-1.946" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M22 2 2 22" fill="none"/>
    </svg>
  );
}
