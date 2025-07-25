import React from 'react';

/**
 * PiSendPlaneSlantDuoSolid icon from the duo-solid style in communication category.
 */
interface PiSendPlaneSlantDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSendPlaneSlantDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'send-plane-slant icon',
  ...props
}: PiSendPlaneSlantDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M18.526 2.01c.83-.054 1.773.105 2.566.898s.952 1.736.898 2.566c-.036.566-.188 1.187-.308 1.675q-.057.234-.099.418a52.4 52.4 0 0 1-4.594 12.802c-1.114 2.167-4.185 2.166-5.342.046L9.66 16.77a1 1 0 0 1 .171-1.186l3.725-3.725a1 1 0 0 0-1.414-1.414L8.416 14.17a1 1 0 0 1-1.186.17l-3.645-1.988c-2.12-1.156-2.121-4.227.046-5.34a52.4 52.4 0 0 1 12.802-4.595q.184-.042.418-.1c.488-.119 1.11-.27 1.675-.308Z" opacity=".28"/><path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.034 13a52 52 0 0 0 1.572-5.646c.274-1.254.83-2.687-.221-3.739-1.052-1.052-2.485-.495-3.74-.221A52 52 0 0 0 11 4.966"/>
    </svg>
  );
}
