import React from 'react';

/**
 * PiMarkdownDuoSolid icon from the duo-solid style in development category.
 */
interface PiMarkdownDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMarkdownDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'markdown icon',
  ...props
}: PiMarkdownDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M9.357 3C8.273 3 7.4 3 6.691 3.058c-.728.06-1.369.185-1.96.487A5 5 0 0 0 2.544 5.73c-.302.592-.428 1.233-.487 1.961C2 8.4 2 9.273 2 10.357v3.286c0 1.084 0 1.958.058 2.666.06.729.185 1.369.487 1.961a5 5 0 0 0 2.185 2.185c.592.302 1.233.428 1.961.487C7.4 21 8.273 21 9.357 21h5.286c1.084 0 1.958 0 2.666-.058.729-.06 1.369-.185 1.961-.487a5 5 0 0 0 2.185-2.185c.302-.592.428-1.232.487-1.961C22 15.6 22 14.727 22 13.643v-3.286c0-1.084 0-1.958-.058-2.666-.06-.728-.185-1.369-.487-1.96a5 5 0 0 0-2.185-2.186c-.592-.302-1.232-.428-1.961-.487C16.6 3 15.727 3 14.643 3z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 15V9l2.5 3L11 9v6m3-1.874a10 10 0 0 0 1.704 1.77A.48.48 0 0 0 16 15m2-1.874a10 10 0 0 1-1.704 1.77A.47.47 0 0 1 16 15m0 0V9"/>
    </svg>
  );
}
