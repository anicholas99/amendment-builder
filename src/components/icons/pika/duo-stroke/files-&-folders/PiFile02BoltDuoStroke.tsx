import React from 'react';

/**
 * PiFile02BoltDuoStroke icon from the duo-stroke style in files-&-folders category.
 */
interface PiFile02BoltDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02BoltDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-bolt icon',
  ...props
}: PiFile02BoltDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 22H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8v8a4 4 0 0 1-4 4Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m12 10.5-1.802 2.403c-.374.498-.561.748-.548.934a.5.5 0 0 0 .238.391c.16.098.467.046 1.082-.056l2.06-.344c.616-.102.923-.153 1.082-.056a.5.5 0 0 1 .238.391c.013.186-.174.436-.548.934L12 17.5m8-7.5a8 8 0 0 0-8-8h-1a3 3 0 0 1 3 3v.6c0 .372 0 .557.025.713a2 2 0 0 0 1.662 1.662c.156.025.341.025.713.025h.6a3 3 0 0 1 3 3z" fill="none"/>
    </svg>
  );
}
