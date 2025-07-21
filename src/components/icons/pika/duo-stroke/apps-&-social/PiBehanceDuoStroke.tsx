import React from 'react';

/**
 * PiBehanceDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiBehanceDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiBehanceDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'behance icon',
  ...props
}: PiBehanceDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7h4" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2 12h5a3 3 0 1 0 0-6H3.846c-.321 0-.482 0-.616.025A1.5 1.5 0 0 0 2.025 7.23C2 7.364 2 7.525 2 7.846zm0 0h6a3 3 0 1 1 0 6H4.077c-.537 0-.805 0-1.023-.068a1.5 1.5 0 0 1-.986-.986C2 16.728 2 16.46 2 15.923zm12.1 2a4 4 0 0 0 6.646 3M14.1 14a4 4 0 0 1 1.93-3.422 4 4 0 0 1 5.946 2.432c.136.536-.324.99-.876.99z" fill="none"/>
    </svg>
  );
}
