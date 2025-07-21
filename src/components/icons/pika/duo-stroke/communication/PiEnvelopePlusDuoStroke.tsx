import React from 'react';

/**
 * PiEnvelopePlusDuoStroke icon from the duo-stroke style in communication category.
 */
interface PiEnvelopePlusDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEnvelopePlusDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'envelope-plus icon',
  ...props
}: PiEnvelopePlusDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.004 20H10c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C2 16.2 2 14.8 2 12c0-1.994 0-3.278.197-4.239m19.606 0C22 8.721 22 10.006 22 12c0 .916 0 1.682-.02 2.336" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 20h3m0 0h3m-3 0v-3m0 3v3M10 4h4c2.8 0 4.2 0 5.27.545a5 5 0 0 1 2.185 2.185c.157.308.269.643.348 1.032l-5.508 3.505c-1.557.99-2.335 1.486-3.171 1.678a5 5 0 0 1-2.248 0c-.836-.192-1.614-.688-3.171-1.678L2.197 7.762c.08-.389.191-.724.348-1.032A5 5 0 0 1 4.73 4.545C5.8 4 7.2 4 10 4Z" fill="none"/>
    </svg>
  );
}
