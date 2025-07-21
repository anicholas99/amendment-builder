import React from 'react';

/**
 * PiVideoRecordingDuoStroke icon from the duo-stroke style in media category.
 */
interface PiVideoRecordingDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiVideoRecordingDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'video-recording icon',
  ...props
}: PiVideoRecordingDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 15.604c-.027 1.387-.124 2.245-.481 2.946a4.5 4.5 0 0 1-1.969 1.969c-.7.357-1.56.454-2.946.481M21 8.396c-.027-1.387-.124-2.245-.481-2.946a4.5 4.5 0 0 0-1.969-1.97c-.7-.357-1.56-.454-2.946-.481M8.396 3c-1.387.027-2.245.124-2.946.481A4.5 4.5 0 0 0 3.48 5.45c-.357.7-.454 1.56-.481 2.946m0 7.208c.027 1.387.124 2.245.481 2.946a4.5 4.5 0 0 0 1.97 1.97c.7.357 1.56.454 2.946.481" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.703 10.991a.9.9 0 0 1 .338-.703l.9-.72a.901.901 0 0 1 1.465.703v3.458a.901.901 0 0 1-1.464.704l-.901-.72a.9.9 0 0 1-.338-.704z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6.594 12c0-1.261 0-1.892.245-2.374.216-.424.56-.769.985-.984.481-.246 1.112-.246 2.374-.246h.9c1.262 0 1.893 0 2.375.245.424.216.768.561.984.985.246.482.246 1.113.246 2.374s0 1.892-.246 2.374a2.25 2.25 0 0 1-.984.984c-.482.246-1.113.246-2.374.246h-.901c-1.262 0-1.893 0-2.374-.245a2.25 2.25 0 0 1-.985-.985c-.245-.482-.245-1.113-.245-2.374Z" fill="none"/>
    </svg>
  );
}
