import React from 'react';

/**
 * PiPencilEraserEditDuoSolid icon from the duo-solid style in general category.
 */
interface PiPencilEraserEditDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPencilEraserEditDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'pencil-eraser-edit icon',
  ...props
}: PiPencilEraserEditDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M13.717 5.63a.3.3 0 0 0-.425.001L3.052 15.917c-.216.216-.428.428-.586.684a2.6 2.6 0 0 0-.309.722c-.075.291-.082.59-.089.897L2 20.97a1 1 0 0 0 .998 1.025l2.8.005c.316 0 .627.002.93-.071.265-.064.518-.169.75-.312.265-.163.484-.383.707-.608l10.221-10.266a.3.3 0 0 0 0-.424z" opacity=".28"/><path fill={color || "currentColor"} d="M19.37 2.411a2.57 2.57 0 0 0-3.216.346L15.127 3.79a.3.3 0 0 0 0 .424l4.689 4.689a.3.3 0 0 0 .425 0l.975-.98.072-.074a2.6 2.6 0 0 0 .321-3.16l-.056-.086-.038-.059a7.3 7.3 0 0 0-2.146-2.132Z"/><path fill={color || "currentColor"} d="M4.066 18.34a1 1 0 0 0-2-.05L2 20.972a1 1 0 0 0 .998 1.025L5.725 22a1 1 0 1 0 .003-2l-1.703-.003z"/>
    </svg>
  );
}
