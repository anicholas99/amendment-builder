import React from 'react';

/**
 * PiContactsBookDuoSolid icon from the duo-solid style in communication category.
 */
interface PiContactsBookDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiContactsBookDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'contacts-book icon',
  ...props
}: PiContactsBookDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M10.956 1c-1.363 0-2.447 0-3.321.071-.896.074-1.66.227-2.359.583a6 6 0 0 0-2.622 2.622c-.356.7-.51 1.463-.583 2.359q-.015.177-.025.365H2a1 1 0 0 0 0 2h.001L2 9.956v4.088l.001.956H2a1 1 0 1 0 0 2h.046q.011.189.025.365c.074.896.227 1.66.583 2.359a6 6 0 0 0 2.622 2.622c.7.356 1.463.51 2.359.583.874.071 1.958.071 3.321.071h2.088c1.363 0 2.447 0 3.321-.071.896-.074 1.66-.227 2.359-.583a6 6 0 0 0 2.622-2.622c.356-.7.51-1.463.583-2.359.071-.874.071-1.958.071-3.321V9.956c0-1.363 0-2.447-.071-3.321-.074-.896-.227-1.66-.583-2.359a6 6 0 0 0-2.622-2.622c-.7-.356-1.463-.51-2.359-.583C15.491 1 14.407 1 13.044 1z" opacity=".28"/><path fill={color || "currentColor"} d="M12 5.797a2.972 2.972 0 1 0 0 5.944 2.972 2.972 0 0 0 0-5.944Z"/><path fill={color || "currentColor"} d="M9.778 12.917a2.97 2.97 0 0 0-2.972 2.972 1.86 1.86 0 0 0 1.86 1.861h6.667a1.86 1.86 0 0 0 1.862-1.86 2.97 2.97 0 0 0-2.973-2.973z"/>
    </svg>
  );
}
