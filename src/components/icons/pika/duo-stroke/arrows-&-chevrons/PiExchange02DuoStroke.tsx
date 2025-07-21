import React from 'react';

/**
 * PiExchange02DuoStroke icon from the duo-stroke style in arrows-&-chevrons category.
 */
interface PiExchange02DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiExchange02DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'exchange-02 icon',
  ...props
}: PiExchange02DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9h8m-8 6H4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.031 5a20.6 20.6 0 0 0-3.886 3.604.62.62 0 0 0 0 .792A20.6 20.6 0 0 0 16.031 13m-8.062-2a20.6 20.6 0 0 1 3.886 3.604.62.62 0 0 1 0 .792A20.6 20.6 0 0 1 7.97 19" fill="none"/>
    </svg>
  );
}
