import React from 'react';

/**
 * PiEnvelopeArrowRightDuoSolid icon from the duo-solid style in communication category.
 */
interface PiEnvelopeArrowRightDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEnvelopeArrowRightDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'envelope-arrow-right icon',
  ...props
}: PiEnvelopeArrowRightDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M22.34 8.605a.392.392 0 0 1 .608.3C23 9.73 23 10.702 23 11.872v.172c0 1.363 0 2.447-.071 3.322q-.037.458-.108.875-.68-.646-1.43-1.211a3 3 0 0 0-4.77 1.971H16A3 3 0 0 0 13.17 21H9.956c-1.363 0-2.447 0-3.321-.071-.896-.074-1.66-.227-2.359-.583a6 6 0 0 1-2.622-2.622c-.356-.7-.51-1.463-.583-2.358C1 14.49 1 13.406 1 12.044v-.172c0-1.17 0-2.143.052-2.967a.392.392 0 0 1 .608-.3l5.668 3.607c1.402.893 2.317 1.476 3.324 1.708a6 6 0 0 0 2.697 0c1.006-.232 1.921-.815 3.323-1.708z" opacity=".28"/><path fill={color || "currentColor"} d="M14.044 3H9.956c-1.363 0-2.447 0-3.321.071-.896.074-1.66.227-2.359.583a6 6 0 0 0-2.379 2.19.47.47 0 0 0 .16.644l6.185 3.935c1.62 1.03 2.23 1.403 2.86 1.548a4 4 0 0 0 1.797 0c.63-.145 1.24-.517 2.86-1.548l6.184-3.936a.47.47 0 0 0 .16-.643 6 6 0 0 0-2.379-2.19c-.7-.356-1.463-.51-2.358-.583C16.49 3 15.406 3 14.044 3Z"/><path fill={color || "currentColor"} d="M23 20.001c0-.357-.12-.716-.358-1.01a14 14 0 0 0-2.452-2.361 1 1 0 0 0-1.2 1.6q.484.362.927.771H16a1 1 0 1 0 0 2h3.917q-.444.41-.927.772a1 1 0 0 0 1.2 1.6 14 14 0 0 0 2.452-2.362c.238-.294.358-.652.358-1.01Z"/>
    </svg>
  );
}
