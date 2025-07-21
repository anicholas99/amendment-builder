import React from 'react';

/**
 * PiShare01DuoStroke icon from the duo-stroke style in general category.
 */
interface PiShare01DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiShare01DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'share-01 icon',
  ...props
}: PiShare01DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.41 17.49c-2.583-.773-4.925-2.033-6.82-3.98m6.82-7c-2.583.773-4.924 2.032-6.82 3.98" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" fill="none"/>
    </svg>
  );
}
