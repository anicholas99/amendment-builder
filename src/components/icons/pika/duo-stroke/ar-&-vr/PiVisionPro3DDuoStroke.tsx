import React from 'react';

/**
 * PiVisionPro3DDuoStroke icon from the duo-stroke style in ar-&-vr category.
 */
interface PiVisionPro3DDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiVisionPro3DDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'vision-pro-3-d icon',
  ...props
}: PiVisionPro3DDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.413 14.5a7.3 7.3 0 0 1-.39-2.5C2.091 6.642 7.913 6.5 12 6.5s9.909.142 9.977 5.5c.01.85-.112 1.716-.387 2.5" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.022 16.5a1.2 1.2 0 0 0 1.184 1h1.807c.825 0 1.493-.668 1.493-1.493 0-1.044-1-1.507-2-1.507 1 0 2-.462 2-1.506 0-.825-.669-1.494-1.494-1.494H7.206a1.2 1.2 0 0 0-1.184 1m7.484-.1v4.2a.9.9 0 0 0 .9.9h1.35a2.25 2.25 0 0 0 2.25-2.25v-1.5a2.25 2.25 0 0 0-2.25-2.25h-1.35a.9.9 0 0 0-.9.9Z" fill="none"/>
    </svg>
  );
}
