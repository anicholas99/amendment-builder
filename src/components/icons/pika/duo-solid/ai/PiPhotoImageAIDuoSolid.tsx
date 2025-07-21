import React from 'react';

/**
 * PiPhotoImageAIDuoSolid icon from the duo-solid style in ai category.
 */
interface PiPhotoImageAIDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPhotoImageAIDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'photo-image-ai icon',
  ...props
}: PiPhotoImageAIDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M9.956 2h4.088c1.363 0 2.447 0 3.321.071.896.074 1.66.227 2.359.583a6 6 0 0 1 2.622 2.622c.605 1.187.645 2.634.653 4.72L23 11v2.374a6 6 0 0 1-.21-.475 3 3 0 0 0-5.58 0c-.242.612-.391.784-.455.848-.063.063-.237.218-.856.462a3 3 0 0 0-1.514 4.262A3 3 0 0 0 13.171 22H9.993c-.75 0-1.412 0-1.995-.01-1.544-.03-2.714-.13-3.722-.644a6 6 0 0 1-2.622-2.622c-.356-.7-.51-1.463-.583-2.359C1 15.491 1 14.407 1 13.044v-2.088c0-1.363 0-2.447.071-3.321.074-.896.227-1.66.583-2.359a6 6 0 0 1 2.622-2.622c.7-.356 1.463-.51 2.359-.583C7.509 2 8.593 2 9.956 2Z" opacity=".28"/><path fill={color || "currentColor"} d="M20.993 9.25h-.054c-1.335 0-2.067 0-2.692.064A12.25 12.25 0 0 0 7.346 19.97c.694.029 1.548.03 2.654.03h3.17a3 3 0 0 1 1.215-1.529A3 3 0 0 1 15.9 14.21c.62-.244.793-.4.856-.462.064-.064.213-.236.454-.848A3 3 0 0 1 21 11.171V11c0-.669 0-1.245-.007-1.75Z"/><path fill={color || "currentColor"} d="M7.5 6.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/><path fill={color || "currentColor"} d="M20 13a1 1 0 0 1 .93.633c.293.743.566 1.19.896 1.523s.781.614 1.54.914a1 1 0 0 1 0 1.86c-.759.3-1.21.582-1.54.914s-.603.78-.896 1.523a1 1 0 0 1-1.86 0c-.293-.743-.566-1.19-.896-1.523s-.781-.614-1.54-.914a1 1 0 0 1 0-1.86c.759-.3 1.21-.582 1.54-.914s.603-.78.896-1.523A1 1 0 0 1 20 13Z"/><path fill={color || "currentColor"} d="M15 21a1 1 0 0 1 1-1h.001a1 1 0 1 1 0 2H16a1 1 0 0 1-1-1Z"/>
    </svg>
  );
}
