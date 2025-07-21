import React from 'react';

/**
 * PiEnvelopeAISolid icon from the solid style in ai category.
 */
interface PiEnvelopeAISolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEnvelopeAISolid({
  size = 24,
  color,
  className,
  ariaLabel = 'envelope-ai icon',
  ...props
}: PiEnvelopeAISolidProps): JSX.Element {
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
      <path d="M14.044 3H9.956c-1.363 0-2.447 0-3.321.071-.896.074-1.66.227-2.359.583a6 6 0 0 0-2.605 2.588l6.57 4.181c1.62 1.03 2.23 1.403 2.86 1.548a4 4 0 0 0 1.798 0c.63-.145 1.24-.517 2.86-1.548l6.57-4.181a6 6 0 0 0-2.605-2.588c-.7-.356-1.463-.51-2.359-.583C16.491 3 15.407 3 14.044 3Z" fill="currentColor"/><path d="M1 11.872c0-1.494 0-2.667.109-3.617l6.219 3.957c1.402.893 2.317 1.476 3.324 1.708a6 6 0 0 0 2.697 0c1.006-.232 1.921-.815 3.323-1.708l6.22-3.957c.108.95.108 2.123.108 3.617v.172c0 1.25 0 2.267-.055 3.102-.494-.208-.643-.342-.7-.4-.064-.063-.213-.235-.454-.847a3 3 0 0 0-5.582 0c-.241.612-.39.784-.454.848-.063.063-.237.218-.856.462a3 3 0 0 0-1.514 4.262c-.558.357-.99.894-1.214 1.529H9.956c-1.363 0-2.447 0-3.321-.071-.896-.074-1.66-.227-2.359-.583a6 6 0 0 1-2.622-2.622c-.356-.7-.51-1.463-.583-2.359C1 14.491 1 13.407 1 12.044z" fill="currentColor"/><path d="M19.93 14.633a1 1 0 0 0-1.86 0c-.293.743-.566 1.19-.896 1.523s-.781.614-1.54.914a1 1 0 0 0 0 1.86c.759.3 1.21.582 1.54.914s.603.78.896 1.523a1 1 0 0 0 1.86 0c.293-.743.566-1.19.896-1.523s.781-.614 1.54-.914a1 1 0 0 0 0-1.86c-.759-.3-1.21-.582-1.54-.914s-.603-.78-.896-1.523Zm-1.337 3.802a5 5 0 0 0-.496-.435 4.8 4.8 0 0 0 .903-.902 4.8 4.8 0 0 0 .903.902 4.8 4.8 0 0 0-.903.902 5 5 0 0 0-.407-.467Z" fill="currentColor"/><path d="M15 21a1 1 0 1 0 0 2h.001a1 1 0 1 0 0-2z" fill="currentColor"/>
    </svg>
  );
}
