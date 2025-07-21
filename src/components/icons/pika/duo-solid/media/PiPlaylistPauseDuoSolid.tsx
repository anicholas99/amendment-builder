import React from 'react';

/**
 * PiPlaylistPauseDuoSolid icon from the duo-solid style in media category.
 */
interface PiPlaylistPauseDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPlaylistPauseDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'playlist-pause icon',
  ...props
}: PiPlaylistPauseDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M7 3.001 17 3a1 1 0 1 0 0-2L7 1.001a1 1 0 0 0 0 2ZM5 5a1 1 0 0 0 0 2h14a1 1 0 1 0 0-2z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M17.04 9H6.96c-.666 0-1.226 0-1.683.037-.48.04-.934.124-1.366.345a3.5 3.5 0 0 0-1.53 1.529c-.22.432-.305.887-.344 1.366C2 12.734 2 13.294 2 13.959v4.081c0 .666 0 1.226.037 1.683.04.48.124.934.344 1.366a3.5 3.5 0 0 0 1.53 1.53c.432.22.887.305 1.366.344C5.734 23 6.294 23 6.96 23h10.08c.666 0 1.226 0 1.683-.037.48-.04.934-.125 1.366-.345a3.5 3.5 0 0 0 1.53-1.529c.22-.432.305-.887.344-1.366.037-.457.037-1.017.037-1.683v-4.08c0-.666 0-1.226-.037-1.683-.04-.48-.125-.934-.345-1.366a3.5 3.5 0 0 0-1.529-1.53c-.432-.22-.887-.305-1.366-.344C18.266 9 17.705 9 17.04 9ZM10 12.5a1 1 0 0 1 1 1v5a1 1 0 0 1-2 0v-5a1 1 0 0 1 1-1Zm5 1a1 1 0 0 0-2 0v5a1 1 0 0 0 2 0z" clipRule="evenodd"/>
    </svg>
  );
}
