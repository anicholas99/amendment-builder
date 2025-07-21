import React from 'react';

/**
 * PiKeyBottomLeft02DuoStroke icon from the duo-stroke style in security category.
 */
interface PiKeyBottomLeft02DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiKeyBottomLeft02DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'key-bottom-left-02 icon',
  ...props
}: PiKeyBottomLeft02DuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.293 9.879 4.93 16.243v2.828h2.829l2.12-2.121v-1.622a.5.5 0 0 1 .5-.5h1.62l2.122-2.12" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m11.293 9.88.33-.332a4.5 4.5 0 1 1 2.83 2.828l-.332.331" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.304 8.11 15.89 6.696a1.25 1.25 0 0 1 1.414 1.414Z" fill="none"/>
    </svg>
  );
}
