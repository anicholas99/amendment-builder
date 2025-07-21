import React from 'react';

/**
 * PiFile02AISolid icon from the solid style in ai category.
 */
interface PiFile02AISolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02AISolid({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-ai icon',
  ...props
}: PiFile02AISolidProps): JSX.Element {
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
      <path d="M11.593 13.435a5 5 0 0 0-.496-.435 4.8 4.8 0 0 0 .903-.902 4.8 4.8 0 0 0 .903.902 4.8 4.8 0 0 0-.903.902 5 5 0 0 0-.407-.467Z" fill="currentColor"/><path d="M8 1h1.2c.857 0 1.439 0 1.889.038.438.035.663.1.819.18a2 2 0 0 1 .874.874c.08.156.145.38.18.819C13 3.361 13 3.943 13 4.8v.039c0 .527 0 .981.03 1.356.033.395.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.378.193.772.264 1.167.296.375.031.83.031 1.356.031h.039c.857 0 1.439 0 1.889.038.438.035.663.1.819.18a2 2 0 0 1 .874.874c.08.156.145.38.18.819.037.45.038 1.032.038 1.889V18a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V6a5 5 0 0 1 5-5Zm4.93 8.633a1 1 0 0 0-1.86 0c-.293.743-.566 1.19-.896 1.523s-.781.614-1.54.914a1 1 0 0 0 0 1.86c.759.3 1.21.582 1.54.914s.603.78.896 1.523a1 1 0 0 0 1.86 0c.293-.743.566-1.19.896-1.523s.781-.614 1.54-.914a1 1 0 0 0 0-1.86c-.759-.3-1.21-.582-1.54-.914s-.603-.78-.896-1.523ZM8 16a1 1 0 1 0 0 2h.001a1 1 0 1 0 0-2z" fill="currentColor"/><path d="M14.956 2.748c-.04-.48-.117-.925-.292-1.347a9.02 9.02 0 0 1 5.935 5.935c-.422-.175-.868-.253-1.347-.292C18.71 7 18.046 7 17.242 7H17.2c-.577 0-.949 0-1.232-.024-.272-.022-.373-.06-.422-.085a1 1 0 0 1-.437-.437c-.025-.05-.063-.15-.085-.422C15 5.75 15 5.377 15 4.8v-.041c0-.805 0-1.47-.044-2.01Z" fill="currentColor"/>
    </svg>
  );
}
