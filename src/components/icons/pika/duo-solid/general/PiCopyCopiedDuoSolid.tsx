import React from 'react';

/**
 * PiCopyCopiedDuoSolid icon from the duo-solid style in general category.
 */
interface PiCopyCopiedDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCopyCopiedDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'copy-copied icon',
  ...props
}: PiCopyCopiedDuoSolidProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      
       style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.902 16.902a4 4 0 0 0 .643-.147 5 5 0 0 0 3.21-3.21C21 12.792 21 11.861 21 10s0-2.792-.245-3.545a5 5 0 0 0-3.21-3.21C16.792 3 15.861 3 14 3s-2.792 0-3.545.245a5 5 0 0 0-3.21 3.21 4 4 0 0 0-.147.643" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M9.8 6h.4c1.669 0 2.748 0 3.654.294a6 6 0 0 1 3.852 3.852c.295.906.294 1.986.294 3.654v.4c0 1.669 0 2.748-.294 3.654a6 6 0 0 1-3.852 3.852c-.906.295-1.985.294-3.654.294h-.4c-1.669 0-2.748 0-3.654-.294a6 6 0 0 1-3.852-3.852C1.999 16.948 2 15.87 2 14.2v-.4c0-1.668 0-2.748.294-3.654a6 6 0 0 1 3.852-3.852C7.052 5.999 8.132 6 9.8 6Zm3.764 6.826a1 1 0 1 0-1.128-1.652 14 14 0 0 0-3.575 3.53l-1.154-1.153a1 1 0 1 0-1.414 1.415L8.33 17a1 1 0 0 0 1.575-.21 12 12 0 0 1 3.66-3.964Z" clipRule="evenodd"/>
    </svg>
  );
}
