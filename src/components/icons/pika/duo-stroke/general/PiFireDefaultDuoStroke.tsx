import React from 'react';

/**
 * PiFireDefaultDuoStroke icon from the duo-stroke style in general category.
 */
interface PiFireDefaultDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFireDefaultDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'fire-default icon',
  ...props
}: PiFireDefaultDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.6 2.125C12.663 4.512 10.003 8 8 8c0 0-.712-.905-1.306-1.985C5.2 7.925 4 10.365 4 13c0 4 2.667 8 8 8s8-4 8-8c0-5.445-5.123-10.066-7.4-10.875Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.405 20.15c-1.632 1.382-4.426 1.055-5.46-.817-1.647-2.985 2.858-6.044 4.464-6.847 1.617.81 3.889 5.215.996 7.665Z" fill="none"/>
    </svg>
  );
}
