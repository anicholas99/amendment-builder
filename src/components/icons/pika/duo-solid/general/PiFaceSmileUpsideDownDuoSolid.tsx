import React from 'react';

/**
 * PiFaceSmileUpsideDownDuoSolid icon from the duo-solid style in general category.
 */
interface PiFaceSmileUpsideDownDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFaceSmileUpsideDownDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'face-smile-upside-down icon',
  ...props
}: PiFaceSmileUpsideDownDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 2.046c-5.606 0-10.15 4.544-10.15 10.15S6.394 22.346 12 22.346s10.15-4.544 10.15-10.15S17.606 2.046 12 2.046Z" opacity=".28"/><path fill={color || "currentColor"} d="M14.857 10.597a1 1 0 0 0 1.428-1.4A6 6 0 0 0 12 7.396c-1.678 0-3.197.69-4.285 1.8a1 1 0 0 0 1.428 1.4A4 4 0 0 1 12 9.397c1.12 0 2.13.458 2.857 1.2Z"/><path fill={color || "currentColor"} d="M9 15.596a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Z"/><path fill={color || "currentColor"} d="M15 15.596a1 1 0 0 1-1-1v-1a1 1 0 1 1 2 0v1a1 1 0 0 1-1 1Z"/>
    </svg>
  );
}
