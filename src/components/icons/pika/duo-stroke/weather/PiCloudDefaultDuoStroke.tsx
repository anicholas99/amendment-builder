import React from 'react';

/**
 * PiCloudDefaultDuoStroke icon from the duo-stroke style in weather category.
 */
interface PiCloudDefaultDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCloudDefaultDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'cloud-default icon',
  ...props
}: PiCloudDefaultDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.017 11.026a6.5 6.5 0 0 1 12.651-1.582A5.501 5.501 0 0 1 16.5 20h-10a4.5 4.5 0 0 1-.483-8.974Zm0 0A6.6 6.6 0 0 0 6.174 13" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.5 20a5.5 5.5 0 0 0 2.168-10.556A6.5 6.5 0 0 0 6.174 13" fill="none"/>
    </svg>
  );
}
