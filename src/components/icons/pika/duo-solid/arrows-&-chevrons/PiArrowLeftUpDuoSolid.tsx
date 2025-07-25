import React from 'react';

/**
 * PiArrowLeftUpDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiArrowLeftUpDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiArrowLeftUpDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'arrow-left-up icon',
  ...props
}: PiArrowLeftUpDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m6.363 6.363 12.728 12.728" opacity=".28"/><path fill={color || "currentColor"} d="M5.656 5.656a1.95 1.95 0 0 0-.559 1.166 31.2 31.2 0 0 0 .157 8.055 1 1 0 0 0 1.696.559l8.486-8.486a1 1 0 0 0-.56-1.696c-2.672-.4-5.38-.452-8.054-.157-.453.05-.86.253-1.166.56Z"/>
    </svg>
  );
}
