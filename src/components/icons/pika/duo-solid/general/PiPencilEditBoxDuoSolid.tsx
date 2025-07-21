import React from 'react';

/**
 * PiPencilEditBoxDuoSolid icon from the duo-solid style in general category.
 */
interface PiPencilEditBoxDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiPencilEditBoxDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'pencil-edit-box icon',
  ...props
}: PiPencilEditBoxDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M6.797 5.065c-.771.063-1.243.182-1.613.371a4 4 0 0 0-1.748 1.748c-.189.37-.308.842-.371 1.613C3 9.581 3 10.583 3 12v2c0 1.417 0 2.419.065 3.203.063.771.182 1.243.371 1.613a4 4 0 0 0 1.748 1.748c.37.189.842.308 1.613.371C7.581 21 8.583 21 10 21h2c1.417 0 2.419 0 3.203-.065.772-.063 1.243-.182 1.613-.371a4 4 0 0 0 1.748-1.748c.189-.37.308-.841.371-1.613C19 16.419 19 15.417 19 14a1 1 0 1 1 2 0v.044c0 1.363 0 2.447-.071 3.322-.074.895-.227 1.659-.583 2.358a6 6 0 0 1-2.622 2.622c-.7.356-1.463.51-2.359.583-.874.071-1.958.071-3.321.071H9.956c-1.363 0-2.447 0-3.321-.071-.896-.074-1.66-.227-2.359-.583a6 6 0 0 1-2.622-2.622c-.356-.7-.51-1.463-.583-2.358C1 16.49 1 15.406 1 14.044v-2.088c0-1.363 0-2.447.071-3.321.074-.896.227-1.66.583-2.359a6 6 0 0 1 2.622-2.622c.7-.356 1.463-.51 2.359-.583C7.509 3 8.593 3 9.956 3H10a1 1 0 1 1 0 2z" opacity=".28"/><path fill={color || "currentColor"} d="M20.52 1.394a6.9 6.9 0 0 1 2.017 2.004l.011.017c.019.028.052.078.078.12.64 1.032.41 2.304-.381 3.1l-9.323 9.375-.049.05c-.206.207-.415.418-.67.574a2.5 2.5 0 0 1-.718.298c-.29.07-.588.069-.881.068h-.068l-2.538-.004A1 1 0 0 1 7 15.97l.063-2.56c.007-.284.014-.57.086-.85a2.5 2.5 0 0 1 .295-.691c.152-.245.354-.448.554-.648l.047-.047 9.396-9.45a2.46 2.46 0 0 1 3.08-.331Z"/>
    </svg>
  );
}
