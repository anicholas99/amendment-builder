import React from 'react';

/**
 * PiBulbOffDuoSolid icon from the duo-solid style in appliances category.
 */
interface PiBulbOffDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBulbOffDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'bulb-off icon',
  ...props
}: PiBulbOffDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12 3.994c-3.657 0-6.687 2.863-6.687 6.474 0 1.975.913 3.735 2.335 4.915q.646.537.787 1.075l.227.876a2.22 2.22 0 0 0 2.148 1.66h2.38a2.22 2.22 0 0 0 2.148-1.66l.227-.876c.093-.358.358-.718.787-1.075 1.422-1.18 2.335-2.94 2.335-4.915 0-3.611-3.03-6.474-6.687-6.474Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.379 21h3.242"/>
    </svg>
  );
}
