import React from 'react';

/**
 * PiFile02DefaultDuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiFile02DefaultDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02DefaultDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-default icon',
  ...props
}: PiFile02DefaultDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M8 1a5 5 0 0 0-5 5v12a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5v-5.2c0-.857 0-1.439-.038-1.889-.035-.438-.1-.663-.18-.819a2 2 0 0 0-.874-.874c-.156-.08-.38-.145-.819-.18C18.639 9 18.057 9 17.2 9h-.038c-.528 0-.982 0-1.357-.03-.395-.033-.789-.104-1.167-.297a3 3 0 0 1-1.311-1.311c-.193-.378-.264-.772-.296-1.167C13 5.82 13 5.365 13 4.839V4.8c0-.857 0-1.439-.038-1.889-.035-.438-.1-.663-.18-.819a2 2 0 0 0-.874-.874c-.156-.08-.38-.145-.819-.18C10.639 1 10.057 1 9.2 1z" opacity=".28"/><path fill={color || "currentColor"} d="M14.664 1.4c.175.423.253.869.292 1.348C15 3.29 15 3.954 15 4.758V4.8c0 .577 0 .949.024 1.232.022.272.06.373.085.422a1 1 0 0 0 .437.437c.05.025.15.063.422.085C16.25 7 16.624 7 17.2 7h.041c.805 0 1.47 0 2.01.044.48.04.926.117 1.348.292a9.02 9.02 0 0 0-5.935-5.935Z"/>
    </svg>
  );
}
