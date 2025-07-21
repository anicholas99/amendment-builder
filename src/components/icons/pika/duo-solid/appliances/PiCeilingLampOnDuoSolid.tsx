import React from 'react';

/**
 * PiCeilingLampOnDuoSolid icon from the duo-solid style in appliances category.
 */
interface PiCeilingLampOnDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCeilingLampOnDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'ceiling-lamp-on icon',
  ...props
}: PiCeilingLampOnDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M3 15a1 1 0 0 1-1-1C2 8.477 6.477 4 12 4s10 4.477 10 10a1 1 0 0 1-1 1z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M13 2a1 1 0 1 0-2 0v2.05a10 10 0 0 1 2 0z"/><path fill={color || "currentColor"} d="M8.126 15a4.002 4.002 0 0 0 7.748 0h-2.141a2 2 0 0 1-3.465 0z"/><path fill={color || "currentColor"} d="M8.866 19.5a1 1 0 1 0-1.732-1l-.5.866a1 1 0 0 0 1.732 1z"/><path fill={color || "currentColor"} d="M16.866 18.5a1 1 0 1 0-1.732 1l.5.866a1 1 0 0 0 1.732-1z"/><path fill={color || "currentColor"} d="M13 20a1 1 0 1 0-2 0v1a1 1 0 1 0 2 0z"/>
    </svg>
  );
}
