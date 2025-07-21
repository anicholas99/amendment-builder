import React from 'react';

/**
 * PiFoodMenuBookDuoSolid icon from the duo-solid style in food category.
 */
interface PiFoodMenuBookDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFoodMenuBookDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'food-menu-book icon',
  ...props
}: PiFoodMenuBookDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M10.956 1c-1.363 0-2.447 0-3.321.071-.896.074-1.66.227-2.359.583a6 6 0 0 0-2.622 2.622c-.356.7-.51 1.463-.583 2.359q-.015.177-.025.365H2a1 1 0 0 0 0 2h.001L2 9.956v4.088l.001.956H2a1 1 0 1 0 0 2h.046q.011.189.025.365c.074.896.227 1.66.583 2.359a6 6 0 0 0 2.622 2.622c.7.356 1.463.51 2.359.583.874.071 1.958.071 3.321.071h2.088c1.363 0 2.447 0 3.321-.071.896-.074 1.66-.227 2.359-.583a6 6 0 0 0 2.622-2.622c.356-.7.51-1.463.583-2.359.071-.874.071-1.958.071-3.321V9.956c0-1.363 0-2.447-.071-3.321-.074-.896-.227-1.66-.583-2.359a6 6 0 0 0-2.622-2.622c-.7-.356-1.463-.51-2.359-.583C15.491 1 14.407 1 13.044 1z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M12 5a1 1 0 0 1 1 1v.1c2.282.463 4 2.481 4 4.9a1 1 0 1 1 0 2H7a1 1 0 1 1 0-2 5 5 0 0 1 4-4.9V6a1 1 0 0 1 1-1Zm-3 6h6a3 3 0 1 0-6 0Z" clipRule="evenodd"/><path fill={color || "currentColor"} d="M8 16a1 1 0 0 1 1-1h6a1 1 0 1 1 0 2H9a1 1 0 0 1-1-1Z"/>
    </svg>
  );
}
