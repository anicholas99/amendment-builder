import React from 'react';

/**
 * PiYoutubeDuoSolid icon from the duo-solid style in apps-&-social category.
 */
interface PiYoutubeDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiYoutubeDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'youtube icon',
  ...props
}: PiYoutubeDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M9.956 3c-1.363 0-2.447 0-3.321.071-.896.074-1.66.227-2.359.583a6 6 0 0 0-2.622 2.622c-.356.7-.51 1.463-.583 2.359C1 9.509 1 10.593 1 11.956v.088c0 1.363 0 2.447.071 3.321.074.896.227 1.66.583 2.359a6 6 0 0 0 2.622 2.622c.7.356 1.463.51 2.359.583C7.509 21 8.593 21 9.956 21h4.088c1.363 0 2.447 0 3.321-.071.896-.074 1.66-.227 2.359-.583a6 6 0 0 0 2.622-2.622c.356-.7.51-1.463.583-2.359.071-.874.071-1.958.071-3.321v-.088c0-1.363 0-2.447-.071-3.321-.074-.896-.227-1.66-.583-2.359a6 6 0 0 0-2.622-2.622c-.7-.356-1.463-.51-2.359-.583C16.491 3 15.407 3 14.044 3z" opacity=".28"/><path fill={color || "currentColor"} d="M11.443 8.073C10.176 7.35 8.6 8.264 8.6 9.723v4.554c0 1.459 1.576 2.373 2.843 1.65l3.984-2.277c1.277-.73 1.277-2.57 0-3.3z"/>
    </svg>
  );
}
