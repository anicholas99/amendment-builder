import React from 'react';

/**
 * PiHomeAISolid icon from the solid style in ai category.
 */
interface PiHomeAISolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiHomeAISolid({
  size = 24,
  color,
  className,
  ariaLabel = 'home-ai icon',
  ...props
}: PiHomeAISolidProps): JSX.Element {
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
      <path d="M11.593 13.435a5 5 0 0 0-.496-.435 4.8 4.8 0 0 0 .903-.902 4.8 4.8 0 0 0 .903.902 4.8 4.8 0 0 0-.903.902 5 5 0 0 0-.407-.467Z" fill="currentColor"/><path d="M10.51 2.23a5 5 0 0 1 2.98 0c.61.19 1.136.525 1.681.963.528.425 1.132.996 1.88 1.702l2.716 2.565c.657.62 1.111 1.049 1.443 1.567.293.458.51.96.642 1.488.148.598.148 1.222.148 2.125v2.003c0 1.084 0 1.958-.058 2.666-.06.729-.185 1.369-.487 1.96a5 5 0 0 1-2.185 2.186c-.592.302-1.232.428-1.961.487C16.6 22 15.727 22 14.643 22H9.357c-1.084 0-1.958 0-2.666-.058-.728-.06-1.369-.185-1.96-.487a5 5 0 0 1-2.186-2.185c-.302-.592-.428-1.232-.487-1.961C2 16.6 2 15.727 2 14.643V12.64c0-.903 0-1.527.148-2.125a5 5 0 0 1 .642-1.488c.332-.518.786-.947 1.443-1.567l2.716-2.565c.748-.706 1.352-1.277 1.88-1.702.545-.438 1.071-.773 1.68-.964Zm2.42 7.403a1 1 0 0 0-1.86 0c-.293.743-.566 1.19-.896 1.523s-.781.614-1.54.914a1 1 0 0 0 0 1.86c.759.3 1.21.582 1.54.914s.603.78.896 1.523a1 1 0 0 0 1.86 0c.293-.743.566-1.19.896-1.523s.781-.614 1.54-.914a1 1 0 0 0 0-1.86c-.759-.3-1.21-.582-1.54-.914s-.603-.78-.896-1.523ZM8 16a1 1 0 1 0 0 2h.001a1 1 0 1 0 0-2z" fill="currentColor"/>
    </svg>
  );
}
