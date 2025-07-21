import React from 'react';

/**
 * PiFile02ShieldDuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiFile02ShieldDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02ShieldDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-shield icon',
  ...props
}: PiFile02ShieldDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M8 1a5 5 0 0 0-5 5v12a5 5 0 0 0 5 5h8a5 5 0 0 0 5-5v-5.2c0-.857 0-1.439-.038-1.889-.035-.438-.1-.663-.18-.819a2 2 0 0 0-.874-.874c-.156-.08-.38-.145-.819-.18C18.639 9 18.057 9 17.2 9h-.038c-.528 0-.982 0-1.357-.03-.395-.033-.789-.104-1.167-.297a3 3 0 0 1-1.311-1.311c-.193-.378-.264-.772-.296-1.167C13 5.82 13 5.365 13 4.839V4.8c0-.857 0-1.439-.038-1.889-.035-.438-.1-.663-.18-.819a2 2 0 0 0-.874-.874c-.156-.08-.38-.145-.819-.18C10.639 1 10.057 1 9.2 1z" opacity=".28"/><path fill={color || "currentColor"} d="M14.956 2.748c-.04-.48-.117-.926-.292-1.348A9.02 9.02 0 0 1 20.6 7.336c-.422-.176-.868-.253-1.347-.292C18.71 7 18.046 7 17.242 7H17.2c-.576 0-.949-.001-1.232-.024-.272-.023-.373-.06-.422-.085a1 1 0 0 1-.437-.437c-.025-.05-.063-.15-.085-.422A17 17 0 0 1 15 4.8v-.042c0-.805 0-1.47-.044-2.01Z"/><path fill={color || "currentColor"} fillRule="evenodd" d="M12.66 10.121a2.05 2.05 0 0 0-1.388 0l-1.876.677a2.04 2.04 0 0 0-1.348 1.845l-.044 1.151a4.83 4.83 0 0 0 2.433 4.38l.53.303c.613.35 1.364.358 1.986.021l.518-.28a4.83 4.83 0 0 0 2.515-4.617l-.08-1.027a2.04 2.04 0 0 0-1.343-1.766zm-.709 1.881a.04.04 0 0 1 .03 0l1.902.687q.026.01.03.038l.079 1.027a2.83 2.83 0 0 1-1.474 2.705l-.518.28a.04.04 0 0 1-.043 0l-.53-.302a2.83 2.83 0 0 1-1.425-2.566l.044-1.152q.003-.029.03-.04z" clipRule="evenodd"/>
    </svg>
  );
}
