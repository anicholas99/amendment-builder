import React from 'react';

/**
 * PiFile02HeartDuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiFile02HeartDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02HeartDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-heart icon',
  ...props
}: PiFile02HeartDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M8 1a5 5 0 0 0-5 5v12a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5v-5.2c0-.857 0-1.439-.038-1.889-.035-.438-.1-.663-.18-.819a2 2 0 0 0-.874-.874c-.156-.08-.38-.145-.819-.18C18.639 9 18.057 9 17.2 9h-.038c-.528 0-.982 0-1.357-.03-.395-.033-.789-.104-1.167-.297a3 3 0 0 1-1.311-1.311c-.193-.378-.264-.772-.296-1.167C13 5.82 13 5.365 13 4.839V4.8c0-.857 0-1.439-.038-1.889-.035-.438-.1-.663-.18-.819a2 2 0 0 0-.874-.874c-.156-.08-.38-.145-.819-.18C10.639 1 10.057 1 9.2 1z" opacity=".28"/><path fill={color || "currentColor"} d="M14.956 2.748c-.04-.479-.117-.925-.292-1.347A9.02 9.02 0 0 1 20.6 7.336c-.422-.175-.868-.253-1.347-.292C18.71 7 18.046 7 17.242 7H17.2c-.576 0-.949 0-1.232-.024-.272-.022-.373-.06-.422-.085a1 1 0 0 1-.437-.437c-.025-.05-.063-.15-.085-.422C15.001 5.75 15 5.377 15 4.8v-.04c0-.805 0-1.47-.044-2.01Z"/><path fill={color || "currentColor"} fillRule="evenodd" d="M13.414 10.5a2.77 2.77 0 0 0-1.417.35 2.84 2.84 0 0 0-1.397-.35c-1.52 0-3.1 1.22-3.1 3.042 0 1.631 1.061 2.905 1.962 3.69.47.408.952.733 1.348.958.197.113.383.207.546.277a3 3 0 0 0 .252.094c.062.019.213.064.392.064.178 0 .33-.045.392-.064a3 3 0 0 0 .252-.094c.163-.07.35-.164.546-.277a8.5 8.5 0 0 0 1.348-.959c.9-.784 1.962-2.058 1.962-3.69 0-1.832-1.59-3.02-3.086-3.04Zm-.59 2.246a.5.5 0 0 1 .217-.186.8.8 0 0 1 .345-.06c.604.009 1.114.493 1.114 1.042 0 .75-.514 1.518-1.275 2.18a6.6 6.6 0 0 1-1.225.839 6.6 6.6 0 0 1-1.225-.839c-.761-.662-1.275-1.43-1.275-2.18 0-.56.52-1.042 1.1-1.042.152 0 .271.026.36.065a.5.5 0 0 1 .215.181 1 1 0 0 0 1.65 0Z" clipRule="evenodd"/>
    </svg>
  );
}
