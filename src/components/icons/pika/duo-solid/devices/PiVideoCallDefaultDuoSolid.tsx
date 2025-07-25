import React from 'react';

/**
 * PiVideoCallDefaultDuoSolid icon from the duo-solid style in devices category.
 */
interface PiVideoCallDefaultDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiVideoCallDefaultDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'video-call-default icon',
  ...props
}: PiVideoCallDefaultDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.714 15.4A2 2 0 0 1 17 13.933v-3.875a2 2 0 0 1 .712-1.458l1-.84C20.016 6.668 22 7.593 22 9.29v5.417c0 1.7-1.985 2.624-3.286 1.531z" opacity=".28"/><path fill={color || "currentColor"} d="M6 4a5 5 0 0 0-5 5v6a5 5 0 0 0 5 5h7a5 5 0 0 0 5-5V9a5 5 0 0 0-5-5z"/>
    </svg>
  );
}
