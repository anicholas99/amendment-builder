import React from 'react';

/**
 * PiVisionProDuoStroke icon from the duo-stroke style in ar-&-vr category.
 */
interface PiVisionProDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiVisionProDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'vision-pro icon',
  ...props
}: PiVisionProDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.5c4.088 0 9.909.142 9.977 5.5.032 2.524-1.113 5.172-3.898 5.475-2.575.28-3.685-2.383-6.08-2.381-2.364.001-3.473 2.616-6 2.39-2.822-.255-4.008-2.932-3.976-5.484.068-5.358 5.89-5.5 9.977-5.5Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 7.08c-1.883-.55-4.124-.58-6-.58s-4.118.03-6 .58m3 9.337c.91-.638 1.79-1.323 3-1.323 1.214-.001 2.098.684 3.01 1.323" fill="none"/>
    </svg>
  );
}
