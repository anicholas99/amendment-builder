import React from 'react';

/**
 * PiExternalLinkSquareDuoSolid icon from the duo-solid style in arrows-&-chevrons category.
 */
interface PiExternalLinkSquareDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiExternalLinkSquareDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'external-link-square icon',
  ...props
}: PiExternalLinkSquareDuoSolidProps): JSX.Element {
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
      <path stroke={color || "currentColor"} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13.5c0 1.395 0 2.092-.138 2.667a5 5 0 0 1-3.695 3.695C15.592 20 14.894 20 13.5 20H12c-2.8 0-4.2 0-5.27-.545a5 5 0 0 1-2.185-2.185C4 16.2 4 14.8 4 12v-.5c0-2.33 0-3.495.38-4.413A5 5 0 0 1 7.088 4.38c.776-.322 1.73-.372 3.413-.38" opacity=".28"/><path fill={color || "currentColor"} d="M14.387 3.253a19.8 19.8 0 0 1 5.174-.15 1.496 1.496 0 0 1 1.336 1.336 19.8 19.8 0 0 1-.15 5.174 1 1 0 0 1-1.749.49l-1.146-1.347q-.275-.322-.56-.634l-6.585 6.585a1 1 0 0 1-1.414-1.414l6.585-6.585q-.312-.285-.634-.56l-1.347-1.146a1 1 0 0 1 .49-1.75Z"/>
    </svg>
  );
}
