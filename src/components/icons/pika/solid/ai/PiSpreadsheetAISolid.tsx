import React from 'react';

/**
 * PiSpreadsheetAISolid icon from the solid style in ai category.
 */
interface PiSpreadsheetAISolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSpreadsheetAISolid({
  size = 24,
  color,
  className,
  ariaLabel = 'spreadsheet-ai icon',
  ...props
}: PiSpreadsheetAISolidProps): JSX.Element {
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
      <path fillRule="evenodd" d="M9.357 2c-1.084 0-1.958 0-2.666.058-.729.06-1.369.185-1.961.487A5 5 0 0 0 2.545 4.73c-.302.592-.428 1.233-.487 1.961q-.02.25-.03.499c-.013.274-.02.411.033.523a.5.5 0 0 0 .22.23C2.39 8 2.532 8 2.816 8h18.368c.284 0 .426 0 .535-.058a.5.5 0 0 0 .22-.229c.052-.112.046-.248.034-.522v-.002q-.012-.261-.03-.498c-.06-.728-.186-1.369-.488-1.96a5 5 0 0 0-2.185-2.186c-.592-.302-1.233-.428-1.961-.487C16.6 2 15.727 2 14.643 2zM2 11.22v-.42c0-.28 0-.42.054-.527a.5.5 0 0 1 .219-.218C2.38 10 2.52 10 2.8 10h5.4c.28 0 .42 0 .527.055a.5.5 0 0 1 .218.218C9 10.38 9 10.52 9 10.8v3.4c0 .28 0 .42-.055.527a.5.5 0 0 1-.218.218C8.62 15 8.48 15 8.2 15H2.8c-.28 0-.42 0-.527-.055a.5.5 0 0 1-.219-.218C2 14.62 2 14.48 2 14.201zm7 9.98v-3.4c0-.28 0-.42-.055-.527a.5.5 0 0 0-.218-.218C8.62 17 8.48 17 8.2 17H2.48a.41.41 0 0 0-.41.443c.064.673.191 1.27.475 1.827a5 5 0 0 0 2.185 2.185c.556.284 1.154.411 1.827.475q.82.067 1.642.067c.277.002.417.003.524-.05a.5.5 0 0 0 .221-.22C9 21.62 9 21.48 9 21.2Zm9-8.2a1 1 0 0 1 .93.633c.293.743.566 1.19.896 1.523s.781.614 1.54.914a1 1 0 0 1 0 1.86c-.759.3-1.21.582-1.54.914s-.603.78-.896 1.523a1 1 0 0 1-1.86 0c-.293-.743-.566-1.19-.896-1.523s-.781-.614-1.54-.914a1 1 0 0 1 0-1.86c.759-.3 1.21-.582 1.54-.914s.603-.78.896-1.523A1 1 0 0 1 18 13Zm-5 8a1 1 0 0 1 1-1h.001a1 1 0 0 1 0 2H14a1 1 0 0 1-1-1Z" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}
