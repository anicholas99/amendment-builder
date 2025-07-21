import React from 'react';

/**
 * PiEraserLineDuoStroke icon from the duo-stroke style in editing category.
 */
interface PiEraserLineDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEraserLineDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'eraser-line icon',
  ...props
}: PiEraserLineDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m14.268 17.292-7.56-7.56M21 19h-8.446" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m17.897 5.8.303.303c1.27 1.27 1.905 1.905 2.143 2.638.21.644.21 1.338 0 1.982-.238.732-.873 1.368-2.143 2.638L13.36 18.2c-.3.301-.566.567-.806.8H6.91c-.24-.233-.506-.499-.807-.8l-.303-.303c-1.27-1.27-1.905-1.905-2.143-2.638a3.2 3.2 0 0 1 0-1.982c.238-.732.873-1.368 2.143-2.638L10.64 5.8c1.27-1.27 1.904-1.905 2.637-2.143a3.2 3.2 0 0 1 1.982 0c.733.238 1.368.873 2.638 2.143Z" fill="none"/>
    </svg>
  );
}
