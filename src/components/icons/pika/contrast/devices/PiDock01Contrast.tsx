import React from 'react';

/**
 * PiDock01Contrast icon from the contrast style in devices category.
 */
interface PiDock01ContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDock01Contrast({
  size = 24,
  color,
  className,
  ariaLabel = 'dock-01 icon',
  ...props
}: PiDock01ContrastProps): JSX.Element {
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
      <path fill="currentColor" d="M2 12c0-.93 0-1.394.077-1.78A4 4 0 0 1 5.22 7.077C5.606 7 6.07 7 7 7h10c.93 0 1.394 0 1.78.077a4 4 0 0 1 3.143 3.143c.077.386.077.85.077 1.78s0 1.394-.077 1.78a4 4 0 0 1-3.143 3.143C18.394 17 17.93 17 17 17H7c-.93 0-1.394 0-1.78-.077a4 4 0 0 1-3.143-3.143C2 13.394 2 12.93 2 12Z" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 12c0-.93 0-1.394.077-1.78A4 4 0 0 1 5.22 7.077C5.606 7 6.07 7 7 7h10c.93 0 1.394 0 1.78.077a4 4 0 0 1 3.143 3.143c.077.386.077.85.077 1.78s0 1.394-.077 1.78a4 4 0 0 1-3.143 3.143C18.394 17 17.93 17 17 17H7c-.93 0-1.394 0-1.78-.077a4 4 0 0 1-3.143-3.143C2 13.394 2 12.93 2 12Z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 11.8c0-.28 0-.42.054-.527a.5.5 0 0 1 .219-.218C6.38 11 6.52 11 6.8 11h.4c.28 0 .42 0 .527.055a.5.5 0 0 1 .218.218C8 11.38 8 11.52 8 11.8v.4c0 .28 0 .42-.054.527a.5.5 0 0 1-.219.218C7.62 13 7.48 13 7.2 13h-.4c-.28 0-.42 0-.527-.055a.5.5 0 0 1-.218-.218C6 12.62 6 12.48 6 12.2z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 11.8c0-.28 0-.42.055-.527a.5.5 0 0 1 .218-.218C11.38 11 11.52 11 11.8 11h.4c.28 0 .42 0 .527.055a.5.5 0 0 1 .218.218c.055.107.055.247.055.527v.4c0 .28 0 .42-.055.527a.5.5 0 0 1-.218.218C12.62 13 12.48 13 12.2 13h-.4c-.28 0-.42 0-.527-.055a.5.5 0 0 1-.218-.218C11 12.62 11 12.48 11 12.2z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11.8c0-.28 0-.42.055-.527a.5.5 0 0 1 .218-.218C16.38 11 16.52 11 16.8 11h.4c.28 0 .42 0 .527.055a.5.5 0 0 1 .218.218c.055.107.055.247.055.527v.4c0 .28 0 .42-.055.527a.5.5 0 0 1-.218.218C17.62 13 17.48 13 17.2 13h-.4c-.28 0-.42 0-.527-.055a.5.5 0 0 1-.218-.218C16 12.62 16 12.48 16 12.2z" fill="none"/>
    </svg>
  );
}
