import React from 'react';

/**
 * PiEyeScanDuoSolid icon from the duo-solid style in security category.
 */
interface PiEyeScanDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiEyeScanDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'eye-scan icon',
  ...props
}: PiEyeScanDuoSolidProps): JSX.Element {
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
      <g opacity=".28"><path fill={color || "currentColor"} d="M15 2a1 1 0 1 0 0 2c.998 0 1.702.008 2.253.06.54.052.862.141 1.11.267a3 3 0 0 1 1.31 1.311c.126.247.215.569.266 1.109.053.55.06 1.255.061 2.254a1 1 0 0 0 2-.002c0-.978-.007-1.78-.07-2.442-.064-.673-.191-1.27-.475-1.827a5 5 0 0 0-2.185-2.185c-.556-.283-1.154-.411-1.827-.475C16.78 2.007 15.979 2 15 2Z"/><path fill={color || "currentColor"} d="M9 4a1 1 0 0 0 0-2c-.98 0-1.781.007-2.443.07-.674.064-1.271.191-1.828.475A5 5 0 0 0 2.544 4.73c-.283.557-.411 1.154-.475 1.828-.063.661-.068 1.463-.069 2.441a1 1 0 1 0 2 .002c0-.999.008-1.703.06-2.255.051-.54.14-.861.266-1.108a3 3 0 0 1 1.311-1.311c.247-.126.57-.215 1.109-.266C7.297 4.008 8.002 4 9 4Z"/><path fill={color || "currentColor"} d="M4 15a1 1 0 1 0-2 0c0 .979.007 1.78.07 2.443.064.673.191 1.27.475 1.827a5 5 0 0 0 2.185 2.185c.556.284 1.154.411 1.827.475.662.063 1.464.07 2.442.07a1 1 0 1 0 .002-2c-.999 0-1.703-.008-2.255-.06-.54-.052-.861-.141-1.108-.267a3 3 0 0 1-1.311-1.311c-.126-.247-.215-.569-.266-1.108-.053-.552-.06-1.256-.061-2.255Z"/><path fill={color || "currentColor"} d="M22 15a1 1 0 1 0-2 0c0 .998-.008 1.702-.06 2.253-.052.54-.141.862-.267 1.109a3 3 0 0 1-1.31 1.311c-.248.126-.57.215-1.11.266-.55.053-1.255.06-2.254.061a1 1 0 1 0 .002 2c.978 0 1.78-.007 2.442-.07.673-.064 1.27-.192 1.827-.475a5 5 0 0 0 2.185-2.185c.284-.556.412-1.154.476-1.827.062-.662.068-1.464.069-2.442Z"/></g><path fill={color || "currentColor"} fillRule="evenodd" d="M12 7c-2.102 0-3.82.82-5.01 1.8a6.9 6.9 0 0 0-1.41 1.55C5.265 10.841 5 11.431 5 12c0 .57.265 1.158.581 1.649A6.9 6.9 0 0 0 6.99 15.2a7.87 7.87 0 0 0 10.02 0 6.9 6.9 0 0 0 1.409-1.552c.316-.49.581-1.08.581-1.649 0-.57-.265-1.158-.581-1.649A6.9 6.9 0 0 0 17.01 8.8 7.87 7.87 0 0 0 12 7Zm-2.1 5a2.1 2.1 0 1 1 4.2 0 2.1 2.1 0 0 1-4.2 0Z" clipRule="evenodd"/>
    </svg>
  );
}
