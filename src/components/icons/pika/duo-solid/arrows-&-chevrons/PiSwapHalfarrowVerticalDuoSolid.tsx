import React from 'react';

/**
 * PiSwapHalfarrowVerticalDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiSwapHalfarrowVerticalDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSwapHalfarrowVerticalDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'swap-halfarrow-vertical icon',
  ...props
}: PiSwapHalfarrowVerticalDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 17.344V6m-4 .656V18" opacity=".28"/><path fill={color || "currentColor"} d="M5.124 7.37a1 1 0 0 1 .072-1.078A21.2 21.2 0 0 1 8.979 2.36C9.276 2.121 9.638 2 10 2a1 1 0 0 1 1 1v4.656h-1q-.852 0-1.703.063l-2.223.165a1 1 0 0 1-.95-.514Z"/><path fill={color || "currentColor"} d="M18.876 16.63a1 1 0 0 1-.072 1.078 21.2 21.2 0 0 1-3.783 3.933c-.297.238-.659.36-1.021.36a1 1 0 0 1-1-1v-4.657h1q.852 0 1.703-.063l2.223-.165a1 1 0 0 1 .95.514Z"/>
    </svg>
  );
}
