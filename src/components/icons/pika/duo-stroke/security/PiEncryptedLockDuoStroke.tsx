import React from 'react';

/**
 * PiEncryptedLockDuoStroke icon from the duo-stroke style in security category.
 */
interface PiEncryptedLockDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEncryptedLockDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'encrypted-lock icon',
  ...props
}: PiEncryptedLockDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 17h6m5-4h3m-7 8h7" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 9V7a4 4 0 0 0-8 0v2m-3 4h8m-8 8h4m5-4h5" fill="none"/>
    </svg>
  );
}
