import React from 'react';

/**
 * PiEraserLineDuoSolid icon from the duo-solid style in editing category.
 */
interface PiEraserLineDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEraserLineDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'eraser-line icon',
  ...props
}: PiEraserLineDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M15.569 2.706a4.2 4.2 0 0 0-2.6 0c-.543.176-1 .486-1.456.873-.44.374-.941.875-1.551 1.485L7.415 7.61a1 1 0 0 0 0 1.414l7.56 7.56a1 1 0 0 0 1.415 0l2.546-2.546c.61-.61 1.111-1.111 1.485-1.552.387-.456.697-.913.873-1.455a4.2 4.2 0 0 0 0-2.6c-.176-.542-.486-1-.873-1.456-.374-.44-.874-.94-1.485-1.55l-.361-.362c-.61-.61-1.11-1.11-1.551-1.485-.456-.387-.914-.697-1.455-.873Z" opacity=".28"/><path fill={color || "currentColor"} d="M5.093 9.932c.11-.11.29-.11.4 0L13.563 18H21a1 1 0 1 1 0 2H6.91a1 1 0 0 1-.697-.283q-.366-.358-.814-.807l-.335-.335c-.61-.61-1.11-1.11-1.485-1.551-.387-.457-.697-.914-.873-1.456a4.2 4.2 0 0 1 0-2.6c.176-.542.486-.999.873-1.455.374-.44.875-.941 1.485-1.552z"/>
    </svg>
  );
}
