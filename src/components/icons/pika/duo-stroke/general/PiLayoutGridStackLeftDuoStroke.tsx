import React from 'react';

/**
 * PiLayoutGridStackLeftDuoStroke icon from the duo-stroke style in general category.
 */
interface PiLayoutGridStackLeftDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiLayoutGridStackLeftDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'layout-grid-stack-left icon',
  ...props
}: PiLayoutGridStackLeftDuoStrokeProps): JSX.Element {
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
      <g stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity=".28"><path d="M14 5.5c0-.465 0-.697.038-.89a2 2 0 0 1 1.572-1.572C15.803 3 16.035 3 16.5 3h2c.465 0 .697 0 .89.038a2 2 0 0 1 1.572 1.572c.038.193.038.425.038.89s0 .697-.038.89a2 2 0 0 1-1.572 1.572C19.197 8 18.965 8 18.5 8h-2c-.465 0-.697 0-.89-.038a2 2 0 0 1-1.572-1.572C14 6.197 14 5.965 14 5.5Z" fill="none"/><path d="M14 15.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C15.52 12 16.08 12 17.2 12h.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C21 13.52 21 14.08 21 15.2v2.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C19.48 21 18.92 21 17.8 21h-.6c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C14 19.48 14 18.92 14 17.8z" fill="none"/></g><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C4.52 3 5.08 3 6.2 3h.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C10 4.52 10 5.08 10 6.2v11.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C8.48 21 7.92 21 6.8 21h-.6c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C3 19.48 3 18.92 3 17.8z" fill="none"/>
    </svg>
  );
}
