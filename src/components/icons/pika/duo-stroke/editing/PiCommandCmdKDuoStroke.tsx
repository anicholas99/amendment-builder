import React from 'react';

/**
 * PiCommandCmdKDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiCommandCmdKDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCommandCmdKDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'command-cmd-k icon',
  ...props
}: PiCommandCmdKDuoStrokeProps): JSX.Element {
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
      <g opacity=".28"><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.667 13.833H2.833a1.833 1.833 0 1 0 1.834 1.834z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.167 13.833H8.333v1.834a1.833 1.833 0 1 0 1.834-1.834Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.333 8.333v1.834h1.834a1.833 1.833 0 1 0-1.834-1.834Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.833 10.167h1.834V8.333a1.833 1.833 0 1 0-1.834 1.834Z" fill="none"/></g><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 6.5V14m0 0v3.5m0-3.5 2.041-2.041m0 0L22.922 6.5m-4.88 5.459a8.86 8.86 0 0 1 4.84 5.201l.118.34M4.667 13.833h3.666v-3.666H4.667z" fill="none"/>
    </svg>
  );
}
