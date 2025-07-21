import React from 'react';

/**
 * PiEraserDefaultDuoSolid icon from the duo-solid style in editing category.
 */
interface PiEraserDefaultDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEraserDefaultDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'eraser-default icon',
  ...props
}: PiEraserDefaultDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12.968 2.706a4.2 4.2 0 0 1 2.6 0c.542.176 1 .486 1.456.873.44.374.941.875 1.551 1.485l.361.361c.61.61 1.111 1.11 1.485 1.551.387.457.697.914.873 1.456a4.2 4.2 0 0 1 0 2.6c-.176.542-.486.999-.873 1.455-.374.44-.874.941-1.485 1.552l-2.546 2.546a1 1 0 0 1-1.415 0l-7.56-7.56a1 1 0 0 1 0-1.414l2.547-2.547c.61-.61 1.11-1.11 1.55-1.485.457-.387.914-.697 1.456-.873Z" opacity=".28"/><path fill={color || "currentColor"} d="M5.494 9.932a.283.283 0 0 0-.4 0l-.03.03c-.61.61-1.11 1.11-1.485 1.55-.387.457-.697.914-.873 1.456a4.2 4.2 0 0 0 0 2.6c.176.542.486 1 .873 1.456.374.44.875.94 1.485 1.55l.361.362c.61.61 1.11 1.11 1.551 1.485.457.387.914.697 1.456.873a4.2 4.2 0 0 0 2.6 0c.542-.176.999-.486 1.455-.873.44-.374.941-.875 1.551-1.485l.03-.03c.11-.11.11-.29 0-.4z"/>
    </svg>
  );
}
