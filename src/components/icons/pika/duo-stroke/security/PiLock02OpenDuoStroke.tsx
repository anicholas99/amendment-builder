import React from 'react';

/**
 * PiLock02OpenDuoStroke icon from the duo-stroke style in security category.
 */
interface PiLock02OpenDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLock02OpenDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'lock-02-open icon',
  ...props
}: PiLock02OpenDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 14.8c0-1.68 0-2.52.327-3.162a3 3 0 0 1 1.311-1.311C5.28 10 6.12 10 7.8 10h3.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311C16 12.28 16 13.12 16 14.8v1.4c0 1.68 0 2.52-.327 3.162a3 3 0 0 1-1.311 1.311C13.72 21 12.88 21 11.2 21H7.8c-1.68 0-2.52 0-3.162-.327a3 3 0 0 1-1.311-1.311C3 18.72 3 17.88 3 16.2z" opacity=".28" fill="none"/><path fill="none" d="M17.5 2A5.5 5.5 0 0 0 12 7.5v1.502c.476.003.891.013 1.252.042q.387.03.748.106V7.5a3.5 3.5 0 1 1 7 0V10a1 1 0 1 0 2 0V7.5A5.5 5.5 0 0 0 17.5 2Z"/>
    </svg>
  );
}
