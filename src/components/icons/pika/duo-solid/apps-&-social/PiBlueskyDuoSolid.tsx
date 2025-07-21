import React from 'react';

/**
 * PiBlueskyDuoSolid icon from the duo-solid style in apps-&-social category.
 */
interface PiBlueskyDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBlueskyDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'bluesky icon',
  ...props
}: PiBlueskyDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M8.015 12.764a1 1 0 0 1 .169-.014h7.63a1 1 0 0 1 .168.014c2.119.362 3.792 1.19 4.497 2.563.766 1.491.16 3.093-1.096 4.385-1.137 1.17-2.248 1.826-3.35 1.94-1.144.117-2.06-.367-2.729-1-.561-.53-.988-1.195-1.305-1.807-.318.612-.744 1.278-1.306 1.808-.67.632-1.585 1.116-2.728.998-1.102-.113-2.213-.768-3.35-1.939-1.256-1.292-1.863-2.894-1.097-4.385.706-1.373 2.379-2.201 4.497-2.563Z" opacity=".28"/><path fill={color || "currentColor"} d="M3.562 2c1.2.019 2.496.729 3.375 1.39 1.25.941 2.503 2.328 3.545 3.688A29 29 0 0 1 12 9.26a28 28 0 0 1 1.518-2.182c1.042-1.36 2.296-2.747 3.545-3.688.879-.661 2.175-1.371 3.375-1.39.647-.01 1.354.186 1.875.79.495.576.687 1.366.687 2.257 0 .36-.093 1.695-.204 2.982a72 72 0 0 1-.185 1.872c-.059.514-.126 1.022-.203 1.298-.4 1.431-1.292 2.412-2.408 2.99-1.351.701-2.804.81-4.15.774a35 35 0 0 1-1.79-.108l-.204-.015c-.65-.05-1.264-.092-1.856-.092s-1.206.042-1.856.092l-.203.015a37 37 0 0 1-1.79.108c-1.347.036-2.8-.073-4.15-.773-1.117-.579-2.01-1.56-2.409-2.99-.077-.277-.144-.785-.203-1.3a72 72 0 0 1-.185-1.871C1.093 6.742 1 5.406 1 5.047c0-.89.192-1.681.687-2.257.521-.604 1.228-.8 1.875-.79Z"/>
    </svg>
  );
}
