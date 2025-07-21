import React from 'react';

/**
 * PiFile02QuestionMarkDuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiFile02QuestionMarkDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02QuestionMarkDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-question-mark icon',
  ...props
}: PiFile02QuestionMarkDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M8 1a5 5 0 0 0-5 5v12a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5v-5.2c0-.857 0-1.439-.038-1.889-.035-.438-.1-.663-.18-.819a2 2 0 0 0-.874-.874c-.156-.08-.38-.145-.819-.18C18.639 9 18.057 9 17.2 9h-.038c-.528 0-.982 0-1.357-.03-.395-.033-.789-.104-1.167-.297a3 3 0 0 1-1.311-1.311c-.193-.378-.264-.772-.296-1.167C13 5.82 13 5.365 13 4.839V4.8c0-.857 0-1.439-.038-1.889-.035-.438-.1-.663-.18-.819a2 2 0 0 0-.874-.874c-.156-.08-.38-.145-.819-.18C10.639 1 10.057 1 9.2 1z" opacity=".28"/><path fill={color || "currentColor"} d="M14.956 2.748c-.04-.48-.117-.926-.292-1.348a9.02 9.02 0 0 1 5.935 5.936c-.422-.176-.868-.253-1.347-.292C18.71 7 18.046 7 17.242 7H17.2c-.577 0-.949-.001-1.232-.024-.272-.023-.373-.06-.422-.085a1 1 0 0 1-.437-.437c-.025-.05-.063-.15-.085-.422C15 5.748 15 5.376 15 4.8v-.042c0-.805 0-1.47-.044-2.01Z"/><path fill={color || "currentColor"} d="M11.338 11.672a1.248 1.248 0 0 1 1.881 1.078v.001c0 .219-.177.52-.679.854a4.3 4.3 0 0 1-.887.446 1 1 0 0 0 .634 1.897q.225-.078.441-.175c.245-.11.58-.276.922-.503.622-.415 1.569-1.238 1.57-2.518a3.248 3.248 0 0 0-6.313-1.082 1 1 0 0 0 1.886.664c.098-.278.291-.513.545-.662Z"/><path fill={color || "currentColor"} d="M12 17a1 1 0 1 0 0 2h.01a1 1 0 1 0 0-2z"/>
    </svg>
  );
}
