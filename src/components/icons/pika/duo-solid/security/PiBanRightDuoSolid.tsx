import React from 'react';

/**
 * PiBanRightDuoSolid icon from the duo-solid style in security category.
 */
interface PiBanRightDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBanRightDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'ban-right icon',
  ...props
}: PiBanRightDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12c0 5.605 4.544 10.15 10.15 10.15 5.605 0 10.15-4.544 10.15-10.15 0-5.605-4.545-10.15-10.15-10.15Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.53 18.47 18.47 5.53"/>
    </svg>
  );
}
