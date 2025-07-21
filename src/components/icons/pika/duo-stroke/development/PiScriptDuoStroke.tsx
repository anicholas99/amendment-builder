import React from 'react';

/**
 * PiScriptDuoStroke icon from the duo-stroke style in development category.
 */
interface PiScriptDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiScriptDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'script icon',
  ...props
}: PiScriptDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.643 20.979A3 3 0 0 1 16 15H6c-.35 0-.687.06-1 .17m10.643 5.809c.978-.037 1.629-.138 2.173-.415a4 4 0 0 0 1.748-1.748C20 17.96 20 16.84 20 14.6V9.4c0-2.24 0-3.36-.436-4.216a4 4 0 0 0-1.748-1.748C16.96 3 15.84 3 13.6 3h-2.2c-2.24 0-3.36 0-4.216.436a4 4 0 0 0-1.748 1.748C5 6.04 5 7.16 5 9.4v5.77m10.643 5.809C15.083 21 14.416 21 13.6 21H6a3 3 0 0 1-1-5.83" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 11 2-2-2-2m5 4h2" fill="none"/>
    </svg>
  );
}
