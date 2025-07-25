import React from 'react';

/**
 * PiTruckTrashDuoSolid icon from the duo-solid style in automotive category.
 */
interface PiTruckTrashDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiTruckTrashDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'truck-trash icon',
  ...props
}: PiTruckTrashDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M16 6a1 1 0 0 0-1.294-.956l-13 4A1 1 0 0 0 1 10v5.339c0 .527 0 .982.03 1.356.033.396.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.462.235.946.302 1.335.324.257.014.553.01.784.006l.24-.003A1 1 0 0 0 6 18.5a1 1 0 1 1 2 0 1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-3.31q.002-3.345 0-6.69z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 18.5a2 2 0 1 0 4 0m-4 0a2 2 0 1 1 4 0m-4 0H9m6 0q.002-5 0-10h2.834c.782 0 1.173 0 1.511.126a2 2 0 0 1 .781.529c.243.267.388.63.679 1.357L22 13.5v1.8c0 1.12 0 1.68-.218 2.108a2 2 0 0 1-.874.874c-.564.287-1.298.216-1.908.218m-10 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>
    </svg>
  );
}
