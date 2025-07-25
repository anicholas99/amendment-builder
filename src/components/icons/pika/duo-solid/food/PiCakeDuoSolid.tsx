import React from 'react';

/**
 * PiCakeDuoSolid icon from the duo-solid style in food category.
 */
interface PiCakeDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCakeDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'cake icon',
  ...props
}: PiCakeDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 20H3m18 0h1m-1 0v-5M3 20H2m1 0v-5m9-10v3M7 5v3.002M17 5v3.002" opacity=".28"/><path fill={color || "currentColor"} d="M8 2a1 1 0 1 0-2 0v.01a1 1 0 0 0 2 0z"/><path fill={color || "currentColor"} d="M13 2a1 1 0 1 0-2 0v.01a1 1 0 1 0 2 0z"/><path fill={color || "currentColor"} d="M18 2a1 1 0 1 0-2 0v.01a1 1 0 1 0 2 0z"/><path fill={color || "currentColor"} d="M7.798 7h8.404q.435 0 .805.002c1.121.008 2.033.038 2.809.434a4 4 0 0 1 1.748 1.748c.247.485.346 1.002.392 1.564.044.541.044 1.206.044 2.01V15a1 1 0 0 1-.97.999 2.21 2.21 0 0 1-2.1-1.316.228.228 0 0 0-.416 0c-.786 1.756-3.279 1.756-4.065 0a.228.228 0 0 0-.416 0c-.787 1.756-3.28 1.756-4.066 0a.228.228 0 0 0-.416 0c-.786 1.756-3.279 1.756-4.065 0a.228.228 0 0 0-.416 0A2.21 2.21 0 0 1 2.97 16 1 1 0 0 1 2 15v-2.24c0-.805 0-1.47.044-2.01.046-.563.145-1.08.392-1.565a4 4 0 0 1 1.748-1.748c.776-.396 1.688-.426 2.809-.434Q7.364 7 7.798 7Z"/>
    </svg>
  );
}
