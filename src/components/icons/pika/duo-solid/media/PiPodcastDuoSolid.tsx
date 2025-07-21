import React from 'react';

/**
 * PiPodcastDuoSolid icon from the duo-solid style in media category.
 */
interface PiPodcastDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPodcastDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'podcast icon',
  ...props
}: PiPodcastDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M6.043 2.968a10 10 0 1 1 11.513 16.347 1 1 0 0 1-1.112-1.663 8 8 0 1 0-8.888 0 1 1 0 0 1-1.112 1.663 10 10 0 0 1-.401-16.347ZM12 7a4 4 0 0 0-3.2 6.4 1 1 0 0 1-1.6 1.2 6 6 0 1 1 9.6 0 1 1 0 0 1-1.6-1.2A4 4 0 0 0 12 7Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M12 9a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/><path fill={color || "currentColor"} d="M12 15a2.442 2.442 0 0 0-2.316 3.214l1.367 4.102a1 1 0 0 0 1.898 0l1.367-4.102A2.442 2.442 0 0 0 12 15Z"/>
    </svg>
  );
}
