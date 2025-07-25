import React from 'react';

/**
 * PiKeyboardChevronDownDuoSolid icon from the duo-solid style in devices category.
 */
interface PiKeyboardChevronDownDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiKeyboardChevronDownDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'keyboard-chevron-down icon',
  ...props
}: PiKeyboardChevronDownDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M8.357 2C7.273 2 6.4 2 5.691 2.058c-.728.06-1.369.185-1.961.487A5 5 0 0 0 1.545 4.73c-.302.592-.428 1.233-.487 1.961C1 7.4 1 8.273 1 9.357v1.286c0 1.084 0 1.958.058 2.666.06.729.185 1.369.487 1.961a5 5 0 0 0 2.185 2.185c.592.302 1.233.428 1.961.487C6.4 18 7.273 18 8.357 18h7.286c1.084 0 1.958 0 2.666-.058.729-.06 1.369-.185 1.961-.487a5 5 0 0 0 2.185-2.185c.302-.592.428-1.232.487-1.961C23 12.6 23 11.727 23 10.643V9.357c0-1.084 0-1.958-.058-2.666-.06-.728-.185-1.369-.487-1.96a5 5 0 0 0-2.185-2.186c-.592-.302-1.232-.428-1.961-.487C17.6 2 16.727 2 15.643 2z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 13H8M6 7h.01M10 7h.01M14 7h.01M18 7h.01M6 10h.01M10 10h.01M14 10h.01M18 10h.01"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m7 20.166 5 2 5-2"/>
    </svg>
  );
}
