import React from 'react';

/**
 * PiSendPlaneSlantDuoStroke icon from the duo-stroke style in communication category.
 */
interface PiSendPlaneSlantDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSendPlaneSlantDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'send-plane-slant icon',
  ...props
}: PiSendPlaneSlantDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9.54 14.46-5.477-2.985c-1.429-.78-1.414-2.834.025-3.574a51.4 51.4 0 0 1 12.558-4.507c1.254-.274 2.687-.83 3.739.221 1.052 1.052.495 2.485.221 3.74A51.4 51.4 0 0 1 16.1 19.911c-.74 1.44-2.794 1.454-3.574.025zm0 0 3.308-3.308" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9.54 14.46 3.308-3.308M19.034 13a52 52 0 0 0 1.572-5.646c.273-1.254.83-2.687-.221-3.739-1.052-1.052-2.485-.495-3.74-.221A52 52 0 0 0 11 4.966" fill="none"/>
    </svg>
  );
}
