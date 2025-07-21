import React from 'react';

/**
 * PiPluginAddonDefaultDuoStroke icon from the duo-stroke style in general category.
 */
interface PiPluginAddonDefaultDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPluginAddonDefaultDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'plugin-addon-default icon',
  ...props
}: PiPluginAddonDefaultDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 8V5.6c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C9.24 4 8.96 4 8.4 4H6.6c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C5 4.76 5 5.04 5 5.6v2.42M14 8V5.6c0-.56 0-.84.109-1.054a1 1 0 0 1 .437-.437C14.76 4 15.04 4 15.6 4h1.8c.56 0 .84 0 1.054.109a1 1 0 0 1 .437.437C19 4.76 19 5.04 19 5.6v2.42" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.6v-2.4c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C19.48 8 18.92 8 17.8 8H6.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C3 9.52 3 10.08 3 11.2v2.4c0 2.24 0 3.36.436 4.216a4 4 0 0 0 1.748 1.748C6.04 20 7.16 20 9.4 20h5.2c2.24 0 3.36 0 4.216-.436a4 4 0 0 0 1.748-1.748C21 16.96 21 15.84 21 13.6Z" fill="none"/>
    </svg>
  );
}
