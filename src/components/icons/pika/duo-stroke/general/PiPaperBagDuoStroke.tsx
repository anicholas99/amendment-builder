import React from 'react';

/**
 * PiPaperBagDuoStroke icon from the duo-stroke style in general category.
 */
interface PiPaperBagDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPaperBagDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'paper-bag icon',
  ...props
}: PiPaperBagDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.372 21H9.628c-2.621 0-3.932 0-4.86-.536a4 4 0 0 1-1.76-2.096c-.366-1.008-.138-2.298.318-4.88l.858-4.861c.29-1.645.435-2.468.851-3.084a3.5 3.5 0 0 1 1.478-1.24C7.193 4 8.028 4 9.698 4h4.604c1.67 0 2.506 0 3.185.303a3.5 3.5 0 0 1 1.478 1.24c.416.616.561 1.439.852 3.084l.857 4.86c.456 2.583.684 3.873.317 4.88a4 4 0 0 1-1.758 2.097c-.929.536-2.24.536-4.861.536Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 8a3 3 0 1 1-6 0" fill="none"/>
    </svg>
  );
}
