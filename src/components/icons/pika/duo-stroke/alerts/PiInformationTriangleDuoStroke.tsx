import React from 'react';

/**
 * PiInformationTriangleDuoStroke icon from the duo-stroke style in alerts category.
 */
interface PiInformationTriangleDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiInformationTriangleDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'information-triangle icon',
  ...props
}: PiInformationTriangleDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.39 3.284a3.55 3.55 0 0 0-2.78 0C7.96 4.412 1.695 14.422 1.88 17.097a3.63 3.63 0 0 0 1.424 2.645c2.212 1.677 15.182 1.677 17.394 0a3.63 3.63 0 0 0 1.424-2.645c.184-2.675-6.08-12.685-8.731-13.813Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 12.376v4m0-7.375z" fill="none"/>
    </svg>
  );
}
