import React from 'react';

/**
 * PiPencilEraserEditSwooshDuoStroke icon from the duo-stroke style in general category.
 */
interface PiPencilEraserEditSwooshDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPencilEraserEditSwooshDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'pencil-eraser-edit-swoosh icon',
  ...props
}: PiPencilEraserEditSwooshDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 21c4.018-3.274 4.09 3.357 9-2" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.616 9.116 20.5 7.222c.53-.533.662-1.356.258-2.006a6.3 6.3 0 0 0-1.932-1.965 1.57 1.57 0 0 0-1.964.212l-1.946 1.954m3.699 3.699L7.528 20.252c-.275.277-.413.415-.574.514a1.6 1.6 0 0 1-.46.19c-.183.045-.378.044-.767.044L3 20.995l.066-2.68c.01-.377.014-.565.06-.742q.06-.237.19-.445c.096-.155.228-.288.494-.555L14.917 5.417m3.699 3.699-3.699-3.699" fill="none"/>
    </svg>
  );
}
