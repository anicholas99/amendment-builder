import React from 'react';

/**
 * PiScaleDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiScaleDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiScaleDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'scale icon',
  ...props
}: PiScaleDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.344 6.202 17.8 3.656c-.792-.792-1.188-1.188-1.645-1.336a2 2 0 0 0-1.236 0c-.457.148-.853.544-1.645 1.336l-9.617 9.617c-.792.792-1.188 1.188-1.336 1.644a2 2 0 0 0 0 1.236c.148.457.544.853 1.336 1.645l2.546 2.546c.792.792 1.188 1.188 1.645 1.336.401.13.834.13 1.236 0 .457-.148.853-.544 1.645-1.336l9.616-9.617c.792-.792 1.188-1.188 1.337-1.645a2 2 0 0 0 0-1.236c-.149-.456-.545-.852-1.337-1.644Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m3.722 12.707 3.535 3.536M9.38 7.05l3.536 3.536m-.708-6.364 2.121 2.121M6.55 9.88 8.67 12" fill="none"/>
    </svg>
  );
}
