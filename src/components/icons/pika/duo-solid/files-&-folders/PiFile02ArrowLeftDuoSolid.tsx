import React from 'react';

/**
 * PiFile02ArrowLeftDuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiFile02ArrowLeftDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02ArrowLeftDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-arrow-left icon',
  ...props
}: PiFile02ArrowLeftDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M8 1a5 5 0 0 0-5 5v12a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5v-5.2c0-.857 0-1.439-.038-1.889-.035-.438-.1-.663-.18-.819a2 2 0 0 0-.874-.874c-.156-.08-.38-.145-.819-.18C18.639 9 18.057 9 17.2 9h-.038c-.528 0-.982 0-1.357-.03-.395-.033-.789-.104-1.167-.297a3 3 0 0 1-1.311-1.311c-.193-.378-.264-.772-.296-1.167C13 5.82 13 5.365 13 4.839V4.8c0-.857 0-1.439-.038-1.889-.035-.438-.1-.663-.18-.819a2 2 0 0 0-.874-.874c-.156-.08-.38-.145-.819-.18C10.639 1 10.057 1 9.2 1z" opacity=".28"/><path fill={color || "currentColor"} d="M14.956 2.748c-.04-.479-.117-.925-.292-1.347A9.02 9.02 0 0 1 20.6 7.336c-.422-.175-.868-.253-1.347-.292C18.71 7 18.046 7 17.242 7H17.2c-.576 0-.949 0-1.232-.024-.272-.022-.373-.06-.422-.085a1 1 0 0 1-.437-.437c-.025-.05-.063-.15-.085-.422C15.001 5.75 15 5.377 15 4.8v-.04c0-.805 0-1.47-.044-2.01Z"/><path fill={color || "currentColor"} d="M11.474 12.8a1 1 0 0 0-1.2-1.6 11 11 0 0 0-1.946 1.875 1.47 1.47 0 0 0 0 1.85 11 11 0 0 0 1.946 1.875 1 1 0 0 0 1.2-1.6 9 9 0 0 1-.257-.2H15a1 1 0 1 0 0-2h-3.783q.127-.102.257-.2Z"/>
    </svg>
  );
}
