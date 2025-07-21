import React from 'react';

/**
 * PiPencilEditSwooshDuoSolid icon from the duo-solid style in general category.
 */
interface PiPencilEditSwooshDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPencilEditSwooshDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'pencil-edit-swoosh icon',
  ...props
}: PiPencilEditSwooshDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M21.676 18.263a1 1 0 0 1 .061 1.413c-1.276 1.392-2.367 2.156-3.416 2.409-1.11.267-1.973-.088-2.61-.413-.704-.36-1.002-.57-1.419-.62-.295-.035-.79.014-1.66.723a1 1 0 1 1-1.264-1.55c1.14-.928 2.16-1.278 3.162-1.158.88.105 1.66.604 2.09.823.497.254.824.348 1.233.25.472-.114 1.23-.529 2.41-1.816a1 1 0 0 1 1.413-.061Z" opacity=".28"/><path fill={color || "currentColor"} d="M19.37 2.411a2.57 2.57 0 0 0-3.216.346L3.1 15.867c-.233.235-.465.459-.635.734a2.6 2.6 0 0 0-.309.722c-.075.292-.082.59-.089.898Q2.035 19.595 2 20.97a1.01 1.01 0 0 0 .998 1.024l2.8.005c.316.001.627.002.93-.07.264-.064.518-.17.75-.312.285-.176.517-.417.759-.66L21.213 7.924l.075-.076a2.6 2.6 0 0 0 .322-3.159 7.3 7.3 0 0 0-2.24-2.278Z"/>
    </svg>
  );
}
