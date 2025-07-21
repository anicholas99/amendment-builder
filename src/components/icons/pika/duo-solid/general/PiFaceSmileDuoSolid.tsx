import React from 'react';

/**
 * PiFaceSmileDuoSolid icon from the duo-solid style in general category.
 */
interface PiFaceSmileDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFaceSmileDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'face-smile icon',
  ...props
}: PiFaceSmileDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12S6.394 22.15 12 22.15 22.15 17.606 22.15 12 17.606 1.85 12 1.85Z" opacity=".28"/><path fill={color || "currentColor"} d="M15 8.9a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z"/><path fill={color || "currentColor"} d="M9 8.901a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1Z"/><path fill={color || "currentColor"} d="M9.143 13.9a1 1 0 0 0-1.428 1.4A6 6 0 0 0 12 17.1c1.678 0 3.197-.69 4.285-1.8a1 1 0 1 0-1.428-1.4A4 4 0 0 1 12 15.1c-1.12 0-2.13-.457-2.857-1.2Z"/>
    </svg>
  );
}
