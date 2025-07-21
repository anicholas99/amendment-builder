import React from 'react';

/**
 * PiCommandCmdDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiCommandCmdDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCommandCmdDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'command-cmd icon',
  ...props
}: PiCommandCmdDuoStrokeProps): JSX.Element {
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
      <g opacity=".28"><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.333 14.667H6.667a2.667 2.667 0 1 0 2.666 2.666z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.333 14.667h-2.666v2.666a2.667 2.667 0 1 0 2.666-2.666Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.667 6.667v2.666h2.666a2.667 2.667 0 1 0-2.666-2.666Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.667 9.333h2.666V6.667a2.667 2.667 0 1 0-2.666 2.666Z" fill="none"/></g><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.667 14.667H9.334V9.333h5.333z" fill="none"/>
    </svg>
  );
}
