import React from 'react';

/**
 * PiPencilEraserEditDuoStroke icon from the duo-stroke style in general category.
 */
interface PiPencilEraserEditDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPencilEraserEditDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'pencil-eraser-edit icon',
  ...props
}: PiPencilEraserEditDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.616 9.117 7.528 20.253c-.275.276-.413.415-.574.514a1.6 1.6 0 0 1-.46.19c-.183.045-.378.044-.767.044L3 20.996l.066-2.68c.01-.377.014-.566.06-.742q.06-.237.19-.445c.096-.155.228-.289.494-.555L14.917 5.418" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.727 21 3 20.996l.066-2.68M16.863 3.462a1.57 1.57 0 0 1 1.964-.212 6.3 6.3 0 0 1 1.932 1.965c.404.65.273 1.473-.258 2.006l-1.885 1.894-3.699-3.699z" fill="none"/>
    </svg>
  );
}
