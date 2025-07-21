import React from 'react';

/**
 * PiKeyRightDuoStroke icon from the duo-stroke style in security category.
 */
interface PiKeyRightDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiKeyRightDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'key-right icon',
  ...props
}: PiKeyRightDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 12h4v3m-4-3h-8m8 0v2" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0Z" fill="none"/>
    </svg>
  );
}
