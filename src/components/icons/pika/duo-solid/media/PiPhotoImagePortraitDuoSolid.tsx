import React from 'react';

/**
 * PiPhotoImagePortraitDuoSolid icon from the duo-solid style in media category.
 */
interface PiPhotoImagePortraitDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPhotoImagePortraitDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'photo-image-portrait icon',
  ...props
}: PiPhotoImagePortraitDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M12.044 1c1.363 0 2.447 0 3.321.071.896.074 1.66.227 2.359.583a6 6 0 0 1 2.622 2.622c.356.7.51 1.463.583 2.359C21 7.509 21 8.593 21 9.956v4.088c0 1.363 0 2.447-.071 3.321-.074.896-.227 1.66-.583 2.359a6 6 0 0 1-2.622 2.622c-.7.356-1.463.51-2.359.583-.874.071-1.958.071-3.321.071h-.088c-1.363 0-2.447 0-3.321-.071-.896-.074-1.66-.227-2.359-.583a6 6 0 0 1-2.622-2.622c-.356-.7-.51-1.463-.583-2.359C3 16.491 3 15.407 3 14.044V9.956c0-1.363 0-2.447.071-3.321.074-.896.227-1.66.583-2.359a6 6 0 0 1 2.622-2.622c.7-.356 1.463-.51 2.359-.583C9.509 1 10.593 1 11.956 1z" opacity=".28"/><path fill={color || "currentColor"} d="M8.797 20.935a9 9 0 0 1-.504-.055c.053-1.305.171-2.299.433-3.19a11.75 11.75 0 0 1 7.964-7.964c.68-.2 1.418-.316 2.31-.383V14c0 1.417 0 2.419-.065 3.203-.063.771-.182 1.243-.371 1.613a4 4 0 0 1-1.748 1.748c-.37.189-.841.308-1.613.371C14.419 21 13.417 21 12 21s-2.419 0-3.203-.065Z"/><path fill={color || "currentColor"} d="M7.5 7.5a2 2 0 1 1 4 0 2 2 0 0 1-4 0Z"/>
    </svg>
  );
}
