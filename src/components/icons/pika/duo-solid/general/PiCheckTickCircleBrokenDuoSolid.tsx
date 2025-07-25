import React from 'react';

/**
 * PiCheckTickCircleBrokenDuoSolid icon from the duo-solid style in general category.
 */
interface PiCheckTickCircleBrokenDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCheckTickCircleBrokenDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'check-tick-circle-broken icon',
  ...props
}: PiCheckTickCircleBrokenDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21.035 5.403-.793.541a25.64 25.64 0 0 0-7.799 8.447l-.359.629L8.61 11"/>
    </svg>
  );
}
