import React from 'react';

/**
 * PiSpreadsheetAIDuoSolid icon from the duo-solid style in ai category.
 */
interface PiSpreadsheetAIDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSpreadsheetAIDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'spreadsheet-ai icon',
  ...props
}: PiSpreadsheetAIDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M2 10.8v3.4c0 .28 0 .42.054.527a.5.5 0 0 0 .219.218c.107.055.247.055.526.055H8.2c.28 0 .42 0 .527-.055a.5.5 0 0 0 .218-.218C9 14.62 9 14.48 9 14.2v-3.4c0-.28 0-.42-.055-.527a.5.5 0 0 0-.218-.218C8.62 10 8.48 10 8.2 10H2.8c-.28 0-.42 0-.527.055a.5.5 0 0 0-.219.218C2 10.38 2 10.52 2 10.8Zm7 7v3.4c0 .28 0 .42-.056.528a.5.5 0 0 1-.22.218c-.108.054-.247.053-.525.05q-.823 0-1.642-.066c-.673-.064-1.27-.192-1.827-.475a5 5 0 0 1-2.185-2.185c-.284-.556-.411-1.154-.475-1.827A.41.41 0 0 1 2.48 17H8.2c.28 0 .42 0 .527.055a.5.5 0 0 1 .218.218C9 17.38 9 17.52 9 17.8Z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M9.357 2h5.286c1.084 0 1.958 0 2.666.058.728.06 1.369.185 1.96.487a5 5 0 0 1 2.186 2.185c.302.592.428 1.233.487 1.961q.02.237.03.498v.002c.013.274.019.41-.034.522a.5.5 0 0 1-.219.23C21.61 8 21.468 8 21.184 8H2.816c-.284 0-.426 0-.535-.058a.5.5 0 0 1-.22-.229c-.052-.112-.046-.249-.034-.523q.012-.262.03-.499c.06-.728.186-1.369.488-1.96A5 5 0 0 1 4.73 2.544c.592-.302 1.232-.428 1.961-.487C7.4 2 8.273 2 9.357 2ZM18 13a1 1 0 0 1 .93.633c.293.743.566 1.19.896 1.523s.781.614 1.54.914a1 1 0 0 1 0 1.86c-.759.3-1.21.582-1.54.914s-.603.78-.896 1.523a1 1 0 0 1-1.86 0c-.293-.743-.566-1.19-.896-1.523s-.781-.614-1.54-.914a1 1 0 0 1 0-1.86c.759-.3 1.21-.582 1.54-.914s.603-.78.896-1.523A1 1 0 0 1 18 13Zm-5 8a1 1 0 0 1 1-1h.001a1 1 0 0 1 0 2H14a1 1 0 0 1-1-1Z" clipRule="evenodd"/>
    </svg>
  );
}
