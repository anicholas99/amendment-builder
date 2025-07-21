import React from 'react';

/**
 * PiPlaylistPlayDuoSolid icon from the duo-solid style in media category.
 */
interface PiPlaylistPlayDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPlaylistPlayDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'playlist-play icon',
  ...props
}: PiPlaylistPlayDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M7 3.001 17 3a1 1 0 1 0 0-2L7 1.001a1 1 0 0 0 0 2ZM5 5a1 1 0 0 0 0 2h14a1 1 0 1 0 0-2z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M6.96 9h10.08c.666 0 1.226 0 1.683.037.48.04.934.124 1.366.345a3.5 3.5 0 0 1 1.53 1.529c.22.432.305.887.344 1.366.037.457.037 1.017.037 1.683v4.08c0 .666 0 1.226-.037 1.683-.04.48-.124.934-.345 1.366a3.5 3.5 0 0 1-1.529 1.53c-.432.22-.887.305-1.366.344-.457.037-1.017.037-1.683.037H6.96c-.666 0-1.226 0-1.683-.037-.48-.04-.934-.124-1.366-.345a3.5 3.5 0 0 1-1.53-1.529c-.22-.432-.305-.887-.344-1.366C2 19.266 2 18.706 2 18.041V13.96c0-.666 0-1.226.037-1.683.04-.48.124-.934.344-1.366a3.5 3.5 0 0 1 1.53-1.53c.432-.22.887-.305 1.366-.344C5.734 9 6.295 9 6.96 9Zm6.673 4.04.036.023.162.104.035.023c.493.317.914.587 1.23.834.325.253.646.56.826.985a2.4 2.4 0 0 1 0 1.868c-.18.427-.502.733-.826.986-.316.246-.737.517-1.23.834l-.035.022-.162.104-.036.024c-.571.367-1.052.676-1.452.884-.402.21-.862.395-1.367.359a2.4 2.4 0 0 1-1.75-.956c-.304-.405-.397-.893-.438-1.344-.041-.449-.041-1.02-.041-1.7v-.294c0-.679 0-1.25.041-1.7s.134-.938.438-1.344a2.4 2.4 0 0 1 1.75-.955c.505-.036.965.15 1.367.358.4.209.88.518 1.452.885Z" clipRule="evenodd"/>
    </svg>
  );
}
