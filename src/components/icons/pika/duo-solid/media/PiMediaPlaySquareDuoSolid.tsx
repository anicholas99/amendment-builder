import React from 'react';

/**
 * PiMediaPlaySquareDuoSolid icon from the duo-solid style in media category.
 */
interface PiMediaPlaySquareDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMediaPlaySquareDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'media-play-square icon',
  ...props
}: PiMediaPlaySquareDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M10.4 2h-.043C9.273 2 8.4 2 7.691 2.058c-.728.06-1.369.185-1.96.487A5 5 0 0 0 3.544 4.73c-.302.592-.428 1.233-.487 1.961C3 7.4 3 8.273 3 9.357v5.286c0 1.084 0 1.958.058 2.666.06.729.185 1.369.487 1.961a5 5 0 0 0 2.185 2.185c.592.302 1.233.428 1.961.487C8.4 22 9.273 22 10.357 22h3.286c1.084 0 1.958 0 2.666-.058.729-.06 1.369-.185 1.961-.487a5 5 0 0 0 2.185-2.185c.302-.592.428-1.232.487-1.961C21 16.6 21 15.727 21 14.643V9.357c0-1.084 0-1.958-.058-2.666-.06-.728-.185-1.369-.487-1.96a5 5 0 0 0-2.185-2.186c-.592-.302-1.232-.428-1.961-.487C15.6 2 14.727 2 13.643 2z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="m13.357 8.876-.04-.023c-.565-.327-1.048-.606-1.452-.792-.408-.188-.883-.355-1.403-.3a2.52 2.52 0 0 0-1.778 1.026c-.307.423-.4.918-.44 1.365-.041.443-.041 1-.041 1.653v.39c0 .652 0 1.21.04 1.652.041.448.134.943.441 1.366a2.52 2.52 0 0 0 1.778 1.026c.52.055.995-.112 1.403-.3.404-.186.887-.465 1.452-.792l.04-.023.257-.148.04-.023c.565-.327 1.048-.605 1.411-.862.367-.26.75-.587.962-1.065a2.52 2.52 0 0 0 0-2.052c-.212-.478-.595-.806-.962-1.065-.363-.257-.846-.535-1.41-.862l-.041-.023z" clipRule="evenodd"/>
    </svg>
  );
}
