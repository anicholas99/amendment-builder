import React from 'react';

/**
 * PiFileShieldDuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiFileShieldDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFileShieldDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'file-shield icon',
  ...props
}: PiFileShieldDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M13 3.241c0 .805 0 1.47.044 2.01.046.563.145 1.08.392 1.565a4 4 0 0 0 1.748 1.748c.485.247 1.002.346 1.564.392C17.29 9 17.954 9 18.758 9h2.24q.003.251.002.537v6.106c0 1.084 0 1.958-.058 2.666-.06.729-.185 1.369-.487 1.961a5 5 0 0 1-2.185 2.185c-.592.302-1.232.428-1.961.487C15.6 23 14.727 23 13.643 23h-3.286c-1.084 0-1.958 0-2.666-.058-.728-.06-1.369-.185-1.96-.487a5 5 0 0 1-2.186-2.185c-.302-.592-.428-1.232-.487-1.961C3 17.6 3 16.727 3 15.643V8.357c0-1.084 0-1.958.058-2.666.06-.728.185-1.369.487-1.96A5 5 0 0 1 5.73 1.544c.592-.302 1.233-.428 1.961-.487C8.4 1 9.273 1 10.357 1h2.106l.537.001z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M15 1.282V3.2c0 .856 0 1.439.038 1.889.035.438.1.662.18.819a2 2 0 0 0 .874.874c.156.08.38.144.819.18C17.361 7 17.943 7 18.8 7h1.918a5 5 0 0 0-.455-.956c-.31-.506-.735-.931-1.35-1.545L17.5 3.085c-.614-.614-1.038-1.038-1.544-1.348A5 5 0 0 0 15 1.282Z"/><path fill={color || "currentColor"} fillRule="evenodd" d="M12.66 10.121a2.04 2.04 0 0 0-1.388 0l-1.876.678a2.04 2.04 0 0 0-1.348 1.844l-.044 1.151a4.83 4.83 0 0 0 2.433 4.381l.53.302c.613.35 1.364.358 1.986.021l.518-.28a4.83 4.83 0 0 0 2.515-4.617l-.08-1.027a2.04 2.04 0 0 0-1.343-1.766zm-.709 1.881a.04.04 0 0 1 .03 0l1.902.687q.026.01.03.039l.079 1.027a2.83 2.83 0 0 1-1.474 2.704l-.518.28a.04.04 0 0 1-.043 0l-.53-.301a2.83 2.83 0 0 1-1.425-2.567l.044-1.151q.003-.03.03-.04z" clipRule="evenodd"/>
    </svg>
  );
}
