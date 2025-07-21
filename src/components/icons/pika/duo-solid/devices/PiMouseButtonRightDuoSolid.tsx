import React from 'react';

/**
 * PiMouseButtonRightDuoSolid icon from the duo-solid style in devices category.
 */
interface PiMouseButtonRightDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMouseButtonRightDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'mouse-button-right icon',
  ...props
}: PiMouseButtonRightDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M20 12v2a8 8 0 1 1-16 0v-4a8 8 0 0 1 7-7.938v5.777c0 .527 0 .982.03 1.356.033.395.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.379.193.772.264 1.167.297.375.03.83.03 1.356.03z" opacity=".28"/><path fill={color || "currentColor"} d="M13 2.062c3.946.492 7 3.859 7 7.938h-4.8c-.577 0-.949 0-1.232-.024-.272-.022-.373-.06-.422-.085a1 1 0 0 1-.437-.437c-.025-.05-.063-.15-.085-.422C13 8.75 13 8.377 13 7.8z"/>
    </svg>
  );
}
