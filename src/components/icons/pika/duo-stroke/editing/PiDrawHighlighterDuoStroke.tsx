import React from 'react';

/**
 * PiDrawHighlighterDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiDrawHighlighterDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDrawHighlighterDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'draw-highlighter icon',
  ...props
}: PiDrawHighlighterDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.85 12a9.15 9.15 0 1 1 18.3 0 9.15 9.15 0 0 1-18.3 0Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 17.935V15a2 2 0 0 0-2-2m-6 4.935V15a2 2 0 0 1 2-2m4 0h-4m4 0V9l-1-1-3 2v3" fill="none"/>
    </svg>
  );
}
