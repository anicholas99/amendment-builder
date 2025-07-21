import React from 'react';

/**
 * PiEggBoiledDuoStroke icon from the duo-stroke style in food category.
 */
interface PiEggBoiledDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEggBoiledDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'egg-boiled icon',
  ...props
}: PiEggBoiledDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21.5a7.39 7.39 0 0 0 7.39-7.389C19.39 10.031 16.08 2.5 12 2.5s-7.389 7.53-7.389 11.611a7.39 7.39 0 0 0 7.39 7.389Z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.5 14a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z" fill="none"/>
    </svg>
  );
}
