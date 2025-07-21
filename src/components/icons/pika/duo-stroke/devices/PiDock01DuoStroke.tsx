import React from 'react';

/**
 * PiDock01DuoStroke icon from the duo-stroke style in devices category.
 */
interface PiDock01DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDock01DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'dock-01 icon',
  ...props
}: PiDock01DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 7H7c-.93 0-1.394 0-1.78.077a4 4 0 0 0-3.143 3.143C2 10.606 2 11.07 2 12s0 1.394.077 1.78a4 4 0 0 0 3.143 3.143C5.606 17 6.07 17 7 17h10c.93 0 1.394 0 1.78-.077a4 4 0 0 0 3.143-3.143C22 13.394 22 12.93 22 12s0-1.394-.077-1.78a4 4 0 0 0-3.143-3.143C18.394 7 17.93 7 17 7Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 11.8c0-.28 0-.42.054-.527a.5.5 0 0 1 .219-.218C6.38 11 6.52 11 6.8 11h.4c.28 0 .42 0 .527.055a.5.5 0 0 1 .218.218C8 11.38 8 11.52 8 11.8v.4c0 .28 0 .42-.054.527a.5.5 0 0 1-.219.218C7.62 13 7.48 13 7.2 13h-.4c-.28 0-.42 0-.527-.055a.5.5 0 0 1-.218-.218C6 12.62 6 12.48 6 12.2z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 11.8c0-.28 0-.42.055-.527a.5.5 0 0 1 .218-.218C11.38 11 11.52 11 11.8 11h.4c.28 0 .42 0 .527.055a.5.5 0 0 1 .218.218c.055.107.055.247.055.527v.4c0 .28 0 .42-.055.527a.5.5 0 0 1-.218.218C12.62 13 12.48 13 12.2 13h-.4c-.28 0-.42 0-.527-.055a.5.5 0 0 1-.218-.218C11 12.62 11 12.48 11 12.2z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11.8c0-.28 0-.42.055-.527a.5.5 0 0 1 .218-.218C16.38 11 16.52 11 16.8 11h.4c.28 0 .42 0 .527.055a.5.5 0 0 1 .218.218c.055.107.055.247.055.527v.4c0 .28 0 .42-.055.527a.5.5 0 0 1-.218.218C17.62 13 17.48 13 17.2 13h-.4c-.28 0-.42 0-.527-.055a.5.5 0 0 1-.218-.218C16 12.62 16 12.48 16 12.2z" fill="none"/>
    </svg>
  );
}
