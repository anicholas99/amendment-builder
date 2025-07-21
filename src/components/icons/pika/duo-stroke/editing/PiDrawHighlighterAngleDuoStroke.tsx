import React from 'react';

/**
 * PiDrawHighlighterAngleDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiDrawHighlighterAngleDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDrawHighlighterAngleDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'draw-highlighter-angle icon',
  ...props
}: PiDrawHighlighterAngleDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m17.164 15.907-1.45 1.45a1 1 0 0 1-1.414 0L8.643 11.7a1 1 0 0 1 0-1.414l1.45-1.45m7.07 7.071a2.5 2.5 0 0 0 3.148-.318l2.474-2.475m-5.621 2.793a2.5 2.5 0 0 1-.389-.318l-6.364-6.364a2.5 2.5 0 0 1-.318-.389m0 0a2.5 2.5 0 0 1 .318-3.146l2.475-2.475" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7.07 12.93-3.484 3.485A2 2 0 0 0 3 17.829V19a1 1 0 0 0 1 1h7.586a1 1 0 0 0 .707-.293l.778-.777" fill="none"/>
    </svg>
  );
}
