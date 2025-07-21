import React from 'react';

/**
 * PiFile02LockDuoStroke icon from the duo-stroke style in files-&-folders category.
 */
interface PiFile02LockDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02LockDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-lock icon',
  ...props
}: PiFile02LockDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 22H8a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4h4a8 8 0 0 1 8 8v8a4 4 0 0 1-4 4Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.92 14.041C13.712 14 13.43 14 12.938 14h-1.877c-.49 0-.774 0-.981.041m3.84 0c.64.128 1.12.73 1.156 1.373.03.529-.167 1.283-.407 1.76a1.5 1.5 0 0 1-1.011.79c-.163.036-.348.036-.72.036h-1.877c-.37 0-.556 0-.719-.037a1.5 1.5 0 0 1-1.011-.79c-.24-.476-.438-1.23-.407-1.76.037-.642.515-1.244 1.156-1.372m3.84 0c-.051-.616-.03-1.29-.176-1.894a1.5 1.5 0 0 0-1.227-1.13c-.323-.05-.71-.05-1.034 0a1.5 1.5 0 0 0-1.228 1.13c-.146.604-.124 1.278-.175 1.894M20 10a8 8 0 0 0-8-8h-1a3 3 0 0 1 3 3v.6c0 .372 0 .557.025.713a2 2 0 0 0 1.662 1.662c.156.025.341.025.713.025h.6a3 3 0 0 1 3 3z" fill="none"/>
    </svg>
  );
}
