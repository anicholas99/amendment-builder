import React from 'react';

/**
 * PiGridDashboardBentoDuoStroke icon from the duo-stroke style in general category.
 */
interface PiGridDashboardBentoDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGridDashboardBentoDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'grid-dashboard-bento icon',
  ...props
}: PiGridDashboardBentoDuoStrokeProps): JSX.Element {
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
      <g stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity=".28"><path d="M3 6.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C4.52 3 5.08 3 6.2 3h.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C10 4.52 10 5.08 10 6.2v2.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C8.48 12 7.92 12 6.8 12h-.6c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C3 10.48 3 9.92 3 8.8z" fill="none"/><path d="M14 15.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C15.52 12 16.08 12 17.2 12h.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C21 13.52 21 14.08 21 15.2v2.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C19.48 21 18.92 21 17.8 21h-.6c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C14 19.48 14 18.92 14 17.8z" fill="none"/></g><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 18.5c0-.465 0-.697.038-.89a2 2 0 0 1 1.572-1.572C4.803 16 5.035 16 5.5 16h2c.465 0 .697 0 .89.038a2 2 0 0 1 1.572 1.572c.038.193.038.425.038.89s0 .697-.038.89a2 2 0 0 1-1.572 1.572C8.197 21 7.965 21 7.5 21h-2c-.465 0-.697 0-.89-.038a2 2 0 0 1-1.572-1.572C3 19.197 3 18.965 3 18.5Z" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5.5c0-.465 0-.697.038-.89a2 2 0 0 1 1.572-1.572C15.803 3 16.035 3 16.5 3h2c.465 0 .697 0 .89.038a2 2 0 0 1 1.572 1.572c.038.193.038.425.038.89s0 .697-.038.89a2 2 0 0 1-1.572 1.572C19.197 8 18.965 8 18.5 8h-2c-.465 0-.697 0-.89-.038a2 2 0 0 1-1.572-1.572C14 6.197 14 5.965 14 5.5Z" fill="none"/>
    </svg>
  );
}
