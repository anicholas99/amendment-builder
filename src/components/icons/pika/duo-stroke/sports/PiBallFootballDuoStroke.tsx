import React from 'react';

/**
 * PiBallFootballDuoStroke icon from the duo-stroke style in sports category.
 */
interface PiBallFootballDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBallFootballDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'ball-football icon',
  ...props
}: PiBallFootballDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.12 19.88c1.114 1.113 2.324 1.41 3.884 1.347 1.2-.048 2.517-.187 3.832-.485 2.14-.485 4.276-1.391 5.897-3.012 1.622-1.622 2.528-3.758 3.012-5.898.299-1.316.438-2.633.486-3.832.063-1.56-.234-2.77-1.348-3.883C18.77 3.003 17.56 2.706 16 2.769c-1.2.048-2.516.187-3.832.486-2.14.484-4.276 1.39-5.898 3.012-1.621 1.621-2.527 3.757-3.012 5.896a21.4 21.4 0 0 0-.485 3.833c-.063 1.56.234 2.77 1.348 3.883Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m13.5 10.5-3 3m1.667-10.245a41.4 41.4 0 0 1 8.578 8.577m-17.487.331a41.4 41.4 0 0 0 8.578 8.579" fill="none"/>
    </svg>
  );
}
