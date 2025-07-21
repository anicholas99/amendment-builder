import React from 'react';

/**
 * PiKeyTopRight02DuoStroke icon from the duo-stroke style in security category.
 */
interface PiKeyTopRight02DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiKeyTopRight02DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'key-top-right-02 icon',
  ...props
}: PiKeyTopRight02DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9.879 11.293 6.364-6.364h2.828v2.829l-2.121 2.12h-1.621a.5.5 0 0 0-.5.5V12l-2.122 2.122" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9.88 11.293-.33.331a4.5 4.5 0 1 0 2.827 2.829l.33-.331" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.11 17.304 6.697 15.89a1.25 1.25 0 0 0 1.415 1.414z" fill="none"/>
    </svg>
  );
}
