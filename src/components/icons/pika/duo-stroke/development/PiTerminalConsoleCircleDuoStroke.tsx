import React from 'react';

/**
 * PiTerminalConsoleCircleDuoStroke icon from the duo-stroke style in development category.
 */
interface PiTerminalConsoleCircleDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTerminalConsoleCircleDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'terminal-console-circle icon',
  ...props
}: PiTerminalConsoleCircleDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m8 13 2-2-2-2m5 4h3" fill="none"/>
    </svg>
  );
}
