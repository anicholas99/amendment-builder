import React from 'react';

/**
 * PiEnvelopeArrowLeftDuoStroke icon from the duo-stroke style in communication category.
 */
interface PiEnvelopeArrowLeftDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEnvelopeArrowLeftDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'envelope-arrow-left icon',
  ...props
}: PiEnvelopeArrowLeftDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 20h-2c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C2 16.2 2 14.8 2 12c0-1.994 0-3.278.197-4.238m19.606 0C22 8.722 22 10.006 22 12c0 1.524 0 2.633-.088 3.5" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.41 22.573a13 13 0 0 1-2.275-2.191.6.6 0 0 1-.135-.38m2.41-2.572c-.846.634-1.61 1.37-2.275 2.191a.6.6 0 0 0-.135.38m0 0h6M10 4h4c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185c.157.308.269.643.348 1.032l-5.508 3.505c-1.557.99-2.335 1.486-3.171 1.678a5 5 0 0 1-2.248 0c-.836-.192-1.614-.688-3.171-1.678L2.197 7.762c.08-.389.191-.724.348-1.032A5 5 0 0 1 4.73 4.545C5.8 4 7.2 4 10 4Z" fill="none"/>
    </svg>
  );
}
