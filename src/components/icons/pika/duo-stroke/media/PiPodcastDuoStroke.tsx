import React from 'react';

/**
 * PiPodcastDuoStroke icon from the duo-stroke style in media category.
 */
interface PiPodcastDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPodcastDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'podcast icon',
  ...props
}: PiPodcastDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14a5 5 0 1 1 8 0m1 4.483a9 9 0 1 0-10 0" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.633 17.897a1.442 1.442 0 1 1 2.735 0L12 22z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0Z" fill="none"/>
    </svg>
  );
}
