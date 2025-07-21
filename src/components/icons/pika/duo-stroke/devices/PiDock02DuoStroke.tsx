import React from 'react';

/**
 * PiDock02DuoStroke icon from the duo-stroke style in devices category.
 */
interface PiDock02DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDock02DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'dock-02 icon',
  ...props
}: PiDock02DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15H3" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 9.8c0-.28 0-.42.054-.527a.5.5 0 0 1 .219-.218C5.38 9 5.52 9 5.8 9h.4c.28 0 .42 0 .527.055a.5.5 0 0 1 .218.218C7 9.38 7 9.52 7 9.8v.4c0 .28 0 .42-.054.527a.5.5 0 0 1-.219.218C6.62 11 6.48 11 6.2 11h-.4c-.28 0-.42 0-.527-.055a.5.5 0 0 1-.218-.218C5 10.62 5 10.48 5 10.2z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 9.8c0-.28 0-.42.055-.527a.5.5 0 0 1 .218-.218C11.38 9 11.52 9 11.8 9h.4c.28 0 .42 0 .527.055a.5.5 0 0 1 .218.218C13 9.38 13 9.52 13 9.8v.4c0 .28 0 .42-.055.527a.5.5 0 0 1-.218.218C12.62 11 12.48 11 12.2 11h-.4c-.28 0-.42 0-.527-.055a.5.5 0 0 1-.218-.218C11 10.62 11 10.48 11 10.2z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9.8c0-.28 0-.42.055-.527a.5.5 0 0 1 .218-.218C17.38 9 17.52 9 17.8 9h.4c.28 0 .42 0 .527.055a.5.5 0 0 1 .218.218C19 9.38 19 9.52 19 9.8v.4c0 .28 0 .42-.055.527a.5.5 0 0 1-.218.218C18.62 11 18.48 11 18.2 11h-.4c-.28 0-.42 0-.527-.055a.5.5 0 0 1-.218-.218C17 10.62 17 10.48 17 10.2z" fill="none"/>
    </svg>
  );
}
