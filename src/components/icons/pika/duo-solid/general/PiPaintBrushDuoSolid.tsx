import React from 'react';

/**
 * PiPaintBrushDuoSolid icon from the duo-solid style in general category.
 */
interface PiPaintBrushDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPaintBrushDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'paint-brush icon',
  ...props
}: PiPaintBrushDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M21.92 4.169c.68-1.285-.71-2.675-1.996-1.995l-7.27 3.849a8.83 8.83 0 0 0-4.102 4.616 1 1 0 0 0 .563 1.29c1.37.545 2.417 1.661 2.95 3.07a1 1 0 0 0 1.284.583 8.83 8.83 0 0 0 4.722-4.143z" opacity=".28"/><path fill={color || "currentColor"} d="M9.558 14.458c-1.61-1.61-4.132-1.549-5.554.178-.496.602-.635 1.233-.713 1.715l-.048.317v.003c-.047.32-.075.512-.168.725a1.05 1.05 0 0 1-1.008.615 1 1 0 0 0-.934 1.497c1.78 3.092 6.244 3.339 8.382.556.552-.72.996-1.647 1.093-2.635.1-1.02-.176-2.096-1.05-2.971Z"/>
    </svg>
  );
}
