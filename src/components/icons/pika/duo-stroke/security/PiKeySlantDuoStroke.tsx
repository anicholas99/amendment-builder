import React from 'react';

/**
 * PiKeySlantDuoStroke icon from the duo-stroke style in security category.
 */
interface PiKeySlantDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiKeySlantDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'key-slant icon',
  ...props
}: PiKeySlantDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m15.768 7.171 2.829-2.828 2.12 2.121m-4.949.707-5.657 5.657m5.657-5.657 1.414 1.415" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.454 18.485a4 4 0 1 0 5.657-5.657 4 4 0 0 0-5.657 5.657Z" fill="none"/>
    </svg>
  );
}
