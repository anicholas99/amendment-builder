import React from 'react';

/**
 * PiMessageSearchDuoStroke icon from the duo-stroke style in communication category.
 */
interface PiMessageSearchDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMessageSearchDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'message-search icon',
  ...props
}: PiMessageSearchDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.2 3H7.8c-1.68 0-2.52 0-3.162.327a3 3 0 0 0-1.311 1.311C3 5.28 3 6.12 3 7.8v4.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C5.28 17 6.12 17 7.8 17H8v4l5-4h3.2c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C21 14.72 21 13.88 21 12.2V7.8c0-1.68 0-2.52-.327-3.162a3 3 0 0 0-1.311-1.311C18.72 3 17.88 3 16.2 3Z" opacity=".2" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.107 13.247 13.44 11.58m0 0a2.663 2.663 0 1 0-3.766-3.766 2.663 2.663 0 0 0 3.766 3.766Z" fill="none"/>
    </svg>
  );
}
