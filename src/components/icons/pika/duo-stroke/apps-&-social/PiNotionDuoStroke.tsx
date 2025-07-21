import React from 'react';

/**
 * PiNotionDuoStroke icon from the duo-stroke style in apps-&-social category.
 */
interface PiNotionDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiNotionDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'notion icon',
  ...props
}: PiNotionDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.261 8.015a3.6 3.6 0 0 0-1.227-1.023c-.77-.392-1.778-.392-3.794-.392h-2.88c-2.016 0-3.024 0-3.794.392a3.6 3.6 0 0 0-1.574 1.574c-.392.77-.392 1.778-.392 3.794v2.88c0 2.016 0 3.024.392 3.794A3.6 3.6 0 0 0 7.82 20.1M20.26 8.015l.034.044m-.034-.044-2.578-3.43a3.6 3.6 0 0 0-1.349-1.193C15.564 3 14.556 3 12.54 3H8.76c-2.016 0-3.024 0-3.794.392a3.6 3.6 0 0 0-1.574 1.574C3 5.736 3 6.744 3 8.76v3.78c0 2.016 0 3.024.392 3.794a3.6 3.6 0 0 0 1.109 1.29L7.819 20.1M20.26 8.015l.034.044m0 0q.176.24.313.507c.392.77.392 1.778.392 3.794v2.88c0 2.016 0 3.024-.392 3.794a3.6 3.6 0 0 1-1.574 1.574c-.77.392-1.778.392-3.794.392h-2.88c-2.016 0-3.024 0-3.794-.392a3.6 3.6 0 0 1-.747-.508" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.885 17.4v-6.794c0-.125 0-.187.023-.213a.09.09 0 0 1 .08-.029c.035.006.074.054.153.15l5.338 6.571c.079.097.118.145.152.15a.09.09 0 0 0 .08-.028c.024-.026.024-.088.024-.213V10.2" fill="none"/>
    </svg>
  );
}
