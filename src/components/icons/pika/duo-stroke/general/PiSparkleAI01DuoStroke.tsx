import React from 'react';

/**
 * PiSparkleAI01DuoStroke icon from the duo-stroke style in general category.
 */
interface PiSparkleAI01DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSparkleAI01DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'sparkle-ai-01 icon',
  ...props
}: PiSparkleAI01DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 17.65V19m0 0v1.35M5 19h1.35M5 19H3.65M5.7 3c.248 1.506 1.151 2.445 2.7 2.7-1.549.255-2.452 1.194-2.7 2.7C5.452 6.894 4.548 5.955 3 5.7 4.506 5.452 5.445 4.548 5.7 3Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.9 3c.64 5.037 2.63 8.142 8.1 9-5.19.814-7.43 3.728-8.1 9-.67-5.272-2.91-8.186-8.1-9 5.19-.814 7.43-3.728 8.1-9Z" fill="none"/>
    </svg>
  );
}
