import React from 'react';

/**
 * PiDrawPencilDuoSolid icon from the duo-solid style in editing category.
 */
interface PiDrawPencilDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiDrawPencilDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'draw-pencil icon',
  ...props
}: PiDrawPencilDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M12 1.85C6.394 1.85 1.85 6.394 1.85 12a10.15 10.15 0 0 0 20.3 0c0-5.606-4.544-10.15-10.15-10.15Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M12.858 7.487a1 1 0 0 0-1.716 0l-2.989 5-1.01 1.693a1 1 0 0 0-.143.513v3.234a1 1 0 1 0 2 0V14.97l.87-1.456.307-.513h3.646l.307.513.87 1.456v2.958a1 1 0 1 0 2 0v-3.234a1 1 0 0 0-.142-.513l-1.01-1.693z" clipRule="evenodd"/>
    </svg>
  );
}
