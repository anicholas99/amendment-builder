import React from 'react';

/**
 * PiEnvelopeDefaultDuoSolid icon from the duo-solid style in communication category.
 */
interface PiEnvelopeDefaultDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEnvelopeDefaultDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'envelope-default icon',
  ...props
}: PiEnvelopeDefaultDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M22.948 8.905a.392.392 0 0 0-.608-.3l-5.668 3.607c-1.402.893-2.317 1.476-3.324 1.708a6 6 0 0 1-2.697 0c-1.006-.232-1.921-.815-3.323-1.708L1.66 8.605a.392.392 0 0 0-.608.3C1 9.73 1 10.702 1 11.872v.172c0 1.363 0 2.447.071 3.322.074.895.227 1.659.583 2.358a6 6 0 0 0 2.622 2.622c.7.356 1.463.51 2.359.583C7.509 21 8.593 21 9.956 21h4.088c1.363 0 2.447 0 3.321-.071.896-.074 1.66-.227 2.359-.583a6 6 0 0 0 2.622-2.622c.356-.7.51-1.463.583-2.358.071-.875.071-1.96.071-3.322v-.172c0-1.17 0-2.143-.052-2.967Z" opacity=".28"/><path fill={color || "currentColor"} d="M14.044 3H9.956c-1.363 0-2.447 0-3.321.071-.896.074-1.66.227-2.359.583a6 6 0 0 0-2.379 2.19.47.47 0 0 0 .16.644l6.185 3.935c1.62 1.03 2.23 1.403 2.86 1.548a4 4 0 0 0 1.797 0c.63-.145 1.24-.517 2.86-1.548l6.184-3.936a.47.47 0 0 0 .16-.643 6 6 0 0 0-2.379-2.19c-.7-.356-1.463-.51-2.358-.583C16.49 3 15.406 3 14.044 3Z"/>
    </svg>
  );
}
