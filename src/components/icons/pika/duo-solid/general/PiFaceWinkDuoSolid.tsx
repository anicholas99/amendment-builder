import React from 'react';

/**
 * PiFaceWinkDuoSolid icon from the duo-solid style in general category.
 */
interface PiFaceWinkDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFaceWinkDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'face-wink icon',
  ...props
}: PiFaceWinkDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 2.046c-5.606 0-10.15 4.544-10.15 10.15S6.394 22.346 12 22.346s10.15-4.544 10.15-10.15S17.606 2.046 12 2.046Z" opacity=".28"/><path fill={color || "currentColor"} d="M13.45 10.69a1 1 0 0 1 .293-.708l.707-.707a1 1 0 0 1 1.414 1.415 1 1 0 0 1-1.414 1.414l-.707-.707a1 1 0 0 1-.293-.708Z"/><path fill={color || "currentColor"} d="M9 9.197a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z"/><path fill={color || "currentColor"} d="M9.143 14.097a1 1 0 1 0-1.428 1.4 6 6 0 0 0 4.285 1.8c1.678 0 3.197-.69 4.285-1.8a1 1 0 1 0-1.428-1.4 4 4 0 0 1-2.857 1.2c-1.12 0-2.13-.459-2.857-1.2Z"/>
    </svg>
  );
}
