import React from 'react';

/**
 * PiHomeAIDuoSolid icon from the duo-solid style in ai category.
 */
interface PiHomeAIDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiHomeAIDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'home-ai icon',
  ...props
}: PiHomeAIDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M13.49 2.23a5 5 0 0 0-2.98 0c-.61.19-1.136.525-1.68.963-.529.425-1.133.996-1.88 1.702L4.232 7.46c-.657.62-1.111 1.049-1.443 1.567a5 5 0 0 0-.642 1.488C2 11.113 2 11.737 2 12.64v2.003c0 1.084 0 1.958.058 2.666.06.729.185 1.369.487 1.96a5 5 0 0 0 2.185 2.186c.592.302 1.233.428 1.961.487C7.4 22 8.273 22 9.357 22h5.286c1.084 0 1.958 0 2.666-.058.729-.06 1.369-.185 1.961-.487a5 5 0 0 0 2.185-2.185c.302-.592.428-1.232.487-1.961C22 16.6 22 15.727 22 14.643V12.64c0-.903 0-1.527-.148-2.125a5 5 0 0 0-.642-1.488c-.332-.518-.786-.947-1.443-1.567l-2.716-2.565c-.748-.706-1.352-1.277-1.88-1.702-.545-.438-1.071-.773-1.68-.964Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 17zm4-7c-.637 1.617-1.34 2.345-3 3 1.66.655 2.363 1.383 3 3 .637-1.617 1.34-2.345 3-3-1.66-.655-2.363-1.383-3-3Z"/>
    </svg>
  );
}
