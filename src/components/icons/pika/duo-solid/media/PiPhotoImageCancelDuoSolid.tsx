import React from 'react';

/**
 * PiPhotoImageCancelDuoSolid icon from the duo-solid style in media category.
 */
interface PiPhotoImageCancelDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPhotoImageCancelDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'photo-image-cancel icon',
  ...props
}: PiPhotoImageCancelDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M9.956 2h4.088c1.363 0 2.447 0 3.321.071.896.074 1.66.227 2.359.583a6 6 0 0 1 2.622 2.622c.605 1.187.645 2.634.653 4.72L23 11v2.371a3 3 0 0 0-3.121.708l-.279.279-.279-.28a3 3 0 0 0-4.242 4.244l.278.278-.278.279A3 3 0 0 0 14.37 22H9.993c-.75 0-1.412 0-1.995-.01-1.544-.03-2.714-.13-3.722-.644a6 6 0 0 1-2.622-2.622c-.356-.7-.51-1.463-.583-2.359C1 15.491 1 14.407 1 13.044v-2.088c0-1.363 0-2.447.071-3.321.074-.896.227-1.66.583-2.359a6 6 0 0 1 2.622-2.622c.7-.356 1.463-.51 2.359-.583C7.509 2 8.593 2 9.956 2Z" opacity=".28"/><path fill={color || "currentColor"} d="M7.5 6.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/><path fill={color || "currentColor"} d="M20.993 9.25h-.054c-1.335 0-2.067 0-2.692.064A12.25 12.25 0 0 0 7.346 19.97c.694.029 1.548.03 2.654.03h4.37c.145-.41.381-.794.709-1.121l.278-.279-.278-.279a3 3 0 0 1 4.242-4.242l.279.279.279-.28a3 3 0 0 1 1.12-.707L21 11c0-.669 0-1.245-.007-1.75Z"/><path fill={color || "currentColor"} d="M17.907 15.493a1 1 0 0 0-1.414 1.414l1.693 1.693-1.693 1.693a1 1 0 0 0 1.414 1.414l1.693-1.693 1.693 1.693a1 1 0 0 0 1.414-1.414L21.014 18.6l1.693-1.693a1 1 0 0 0-1.414-1.414L19.6 17.186z"/>
    </svg>
  );
}
