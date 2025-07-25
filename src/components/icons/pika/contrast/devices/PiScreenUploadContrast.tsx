import React from 'react';

/**
 * PiScreenUploadContrast icon from the contrast style in devices category.
 */
interface PiScreenUploadContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiScreenUploadContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'screen-upload icon',
  ...props
}: PiScreenUploadContrastProps): JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: color || "currentColor"}}
      
      role="img"
      aria-label={ariaLabel}
      {...props}
    >
      <g clipPath="url(#icon-0j42styri-a)"><path fill="currentColor" fillRule="evenodd" d="M4.4 2h10.51v.652q-.14.178-.276.36a3 3 0 0 0-.283 3.142 3 3 0 0 0 2.683 1.658V9a3 3 0 0 0 1.513 2.606 3 3 0 0 0 3.013-.022H22V14.6c0 .84 0 1.26-.163 1.581a1.5 1.5 0 0 1-.656.655c-.32.164-.74.164-1.581.164H4.4c-.84 0-1.26 0-1.581-.163a1.5 1.5 0 0 1-.656-.656C2 15.861 2 15.441 2 14.6V4.4c0-.84 0-1.26.163-1.581a1.5 1.5 0 0 1 .656-.656C3.139 2 3.559 2 4.4 2Z" clipRule="evenodd" opacity=".28" stroke="currentColor"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.156 2H4.4c-.84 0-1.26 0-1.581.164a1.5 1.5 0 0 0-.655.655C2 3.14 2 3.56 2 4.4v10.2c0 .84 0 1.26.164 1.581a1.5 1.5 0 0 0 .655.656C3.14 17 3.56 17 4.4 17H12m10-4.52v2.12c0 .84 0 1.26-.163 1.581a1.5 1.5 0 0 1-.656.656c-.32.163-.74.163-1.581.163H12m0 3.875V17m0 3.875c-1.75 0-3.5.375-5 1.125m5-1.125c1.75 0 3.5.375 5 1.125" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M23.034 4.812a15 15 0 0 0-2.557-2.655.7.7 0 0 0-.443-.157m-3 2.812a15 15 0 0 1 2.556-2.655.7.7 0 0 1 .444-.157m0 0v7" fill="none"/></g><defs><clipPath id="icon-0j42styri-a"><path fill="currentColor" d="M0 0h24v24H0z" stroke="currentColor"/></clipPath></defs>
    </svg>
  );
}
