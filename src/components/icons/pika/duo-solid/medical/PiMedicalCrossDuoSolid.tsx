import React from 'react';

/**
 * PiMedicalCrossDuoSolid icon from the duo-solid style in medical category.
 */
interface PiMedicalCrossDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiMedicalCrossDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'medical-cross icon',
  ...props
}: PiMedicalCrossDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M2.228 9.852a3 3 0 0 0-.207.986C2 11.15 2 11.529 2 11.968v.064c0 .439 0 .817.021 1.13.023.33.072.66.207.986a3 3 0 0 0 1.624 1.624c.326.135.656.184.986.207.313.021.691.021 1.13.021H8v2.032c0 .439 0 .817.021 1.13.023.33.072.66.207.986a3 3 0 0 0 1.624 1.624c.326.135.656.184.986.207.313.021.691.021 1.13.021h.064c.439 0 .817 0 1.13-.021.33-.023.66-.072.986-.207a3 3 0 0 0 1.624-1.624c.135-.326.184-.656.207-.986.021-.313.021-.691.021-1.13V16h2.032c.439 0 .817 0 1.13-.021.33-.023.66-.072.986-.207a3 3 0 0 0 1.624-1.624c.135-.326.184-.656.207-.986.021-.313.021-.691.021-1.13v-.064c0-.439 0-.817-.021-1.13a3.1 3.1 0 0 0-.207-.986 3 3 0 0 0-1.624-1.624 3 3 0 0 0-.986-.207C18.85 8 18.471 8 18.032 8H16V5.968c0-.439 0-.817-.021-1.13a3.1 3.1 0 0 0-.207-.986 3 3 0 0 0-1.624-1.624 3 3 0 0 0-.986-.207C12.85 2 12.471 2 12.032 2h-.064c-.439 0-.817 0-1.13.021a3 3 0 0 0-.986.207 3 3 0 0 0-1.624 1.624 3 3 0 0 0-.207.986C8 5.15 8 5.529 8 5.968V8H5.968c-.439 0-.817 0-1.13.021a3 3 0 0 0-.986.207 3 3 0 0 0-1.624 1.624Z" opacity=".28"/><path fill={color || "currentColor"} d="M10.617 4.076c.042-.017.129-.044.357-.06C11.21 4.002 11.52 4 12 4s.79 0 1.026.017c.228.015.315.042.357.06a1 1 0 0 1 .54.54 1 1 0 1 0 1.849-.765 3 3 0 0 0-1.624-1.624 3 3 0 0 0-.986-.207C12.85 2 12.471 2 12.032 2h-.064c-.439 0-.817 0-1.13.021a3 3 0 0 0-.986.207 3 3 0 0 0-1.624 1.624 1 1 0 0 0 1.848.765 1 1 0 0 1 .541-.54Z"/><path fill={color || "currentColor"} d="M4.617 10.076a1 1 0 1 0-.765-1.848 3 3 0 0 0-1.624 1.624 3 3 0 0 0-.207.986C2 11.15 2 11.529 2 11.968v.064c0 .439 0 .817.021 1.13.023.33.072.66.207.986a3 3 0 0 0 1.624 1.624 1 1 0 1 0 .765-1.848 1 1 0 0 1-.54-.541c-.018-.042-.045-.129-.06-.357A17 17 0 0 1 4 12c0-.48 0-.79.017-1.026.015-.228.042-.315.06-.357a1 1 0 0 1 .54-.54Z"/><path fill={color || "currentColor"} d="M20.148 8.228a1 1 0 1 0-.765 1.848 1 1 0 0 1 .54.541c.018.042.045.129.06.357C20 11.21 20 11.52 20 12s0 .79-.017 1.026c-.015.228-.042.315-.06.357a1 1 0 0 1-.54.54 1 1 0 1 0 .765 1.849 3 3 0 0 0 1.624-1.624c.135-.326.184-.656.207-.986.021-.313.021-.691.021-1.13v-.064c0-.439 0-.817-.021-1.13a3.1 3.1 0 0 0-.207-.986 3 3 0 0 0-1.624-1.624Z"/><path fill={color || "currentColor"} d="M15.772 20.148a1 1 0 1 0-1.848-.765 1 1 0 0 1-.541.54c-.042.018-.129.045-.357.06C12.79 20 12.48 20 12 20s-.79 0-1.026-.017c-.228-.015-.315-.042-.357-.06a1 1 0 0 1-.54-.54 1 1 0 1 0-1.849.765 3 3 0 0 0 1.624 1.624c.326.135.656.184.986.207.313.021.691.021 1.13.021h.064c.439 0 .817 0 1.13-.021.33-.023.66-.072.986-.207a3 3 0 0 0 1.624-1.624Z"/>
    </svg>
  );
}
