import React from 'react';

/**
 * PiGridDashboard01Contrast icon from the contrast style in general category.
 */
interface PiGridDashboard01ContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiGridDashboard01Contrast({
  size = 24,
  color,
  className,
  ariaLabel = 'grid-dashboard-01 icon',
  ...props
}: PiGridDashboard01ContrastProps): JSX.Element {
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
      <g opacity=".28"><path fill="currentColor" d="M3 6.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C4.52 3 5.08 3 6.2 3h.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C10 4.52 10 5.08 10 6.2v.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C8.48 10 7.92 10 6.8 10h-.6c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C3 8.48 3 7.92 3 6.8z" stroke="currentColor"/><path fill="currentColor" d="M3.813 19.763c-.792-.792-1.188-1.188-1.336-1.645a2 2 0 0 1 0-1.236c.148-.457.544-.853 1.336-1.645l.424-.424c.793-.792 1.189-1.188 1.645-1.336a2 2 0 0 1 1.236 0c.457.148.853.544 1.645 1.336l.424.424c.792.792 1.188 1.188 1.337 1.645a2 2 0 0 1 0 1.236c-.149.457-.545.853-1.337 1.645l-.424.424c-.792.792-1.188 1.188-1.645 1.336a2 2 0 0 1-1.236 0c-.456-.148-.852-.544-1.645-1.336z" stroke="currentColor"/><path fill="currentColor" d="M14 6.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z" stroke="currentColor"/><path fill="currentColor" d="M14 17.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C15.52 14 16.08 14 17.2 14h.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C21 15.52 21 16.08 21 17.2v.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C19.48 21 18.92 21 17.8 21h-.6c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C14 19.48 14 18.92 14 17.8z" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C4.52 3 5.08 3 6.2 3h.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C10 4.52 10 5.08 10 6.2v.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C8.48 10 7.92 10 6.8 10h-.6c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C3 8.48 3 7.92 3 6.8z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.813 19.763c-.792-.792-1.188-1.188-1.336-1.645a2 2 0 0 1 0-1.236c.148-.457.544-.853 1.336-1.645l.424-.424c.793-.792 1.189-1.188 1.645-1.336a2 2 0 0 1 1.236 0c.457.148.853.544 1.645 1.336l.424.424c.792.792 1.188 1.188 1.337 1.645a2 2 0 0 1 0 1.236c-.149.457-.545.853-1.337 1.645l-.424.424c-.792.792-1.188 1.188-1.645 1.336a2 2 0 0 1-1.236 0c-.456-.148-.852-.544-1.645-1.336z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 6.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 17.2c0-1.12 0-1.68.218-2.108a2 2 0 0 1 .874-.874C15.52 14 16.08 14 17.2 14h.6c1.12 0 1.68 0 2.108.218a2 2 0 0 1 .874.874C21 15.52 21 16.08 21 17.2v.6c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874C19.48 21 18.92 21 17.8 21h-.6c-1.12 0-1.68 0-2.108-.218a2 2 0 0 1-.874-.874C14 19.48 14 18.92 14 17.8z" fill="none"/>
    </svg>
  );
}
