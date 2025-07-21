import React from 'react';

/**
 * PiSpreadsheetSwapDuoSolid icon from the duo-solid style in general category.
 */
interface PiSpreadsheetSwapDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiSpreadsheetSwapDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'spreadsheet-swap icon',
  ...props
}: PiSpreadsheetSwapDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M2 11.22v-.42c0-.28 0-.42.054-.527a.5.5 0 0 1 .219-.218C2.38 10 2.52 10 2.8 10h5.4c.28 0 .42 0 .527.055a.5.5 0 0 1 .218.218C9 10.38 9 10.52 9 10.8v3.4c0 .28 0 .42-.055.527a.5.5 0 0 1-.218.218C8.62 15 8.48 15 8.2 15H2.8c-.28 0-.42 0-.527-.055a.5.5 0 0 1-.219-.218C2 14.62 2 14.48 2 14.201zm7 9.98v-3.4c0-.28 0-.42-.055-.527a.5.5 0 0 0-.218-.218C8.62 17 8.48 17 8.2 17H2.48a.41.41 0 0 0-.41.443c.064.673.191 1.27.475 1.827a5 5 0 0 0 2.185 2.185c.556.284 1.154.411 1.827.475q.82.067 1.642.067c.277.002.417.003.524-.05a.5.5 0 0 0 .221-.22C9 21.62 9 21.48 9 21.2Z" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="M9.357 2C8.273 2 7.4 2 6.691 2.058c-.729.06-1.369.185-1.96.487A5 5 0 0 0 2.544 4.73c-.302.592-.428 1.233-.487 1.961q-.02.25-.03.499c-.013.274-.02.411.033.523a.5.5 0 0 0 .22.23C2.39 8 2.531 8 2.815 8h18.368c.284 0 .426 0 .535-.058a.5.5 0 0 0 .22-.229c.052-.112.046-.248.034-.522v-.002q-.012-.261-.03-.498c-.06-.728-.186-1.369-.488-1.96a5 5 0 0 0-2.185-2.186c-.592-.302-1.233-.428-1.96-.487C16.6 2 15.726 2 14.642 2zm9.867 10.274c.226-.182.5-.273.773-.274h.006c.274 0 .547.092.773.274.767.617 1.45 1.336 2.033 2.138A1 1 0 0 1 22 16h-1v2a3 3 0 0 1-3 3h-1.6v1a1 1 0 0 1-1.518.855 12.6 12.6 0 0 1-2.538-2.011 1.206 1.206 0 0 1 0-1.688 12.6 12.6 0 0 1 2.538-2.011A1 1 0 0 1 16.4 18v1H18a1 1 0 0 0 1-1v-2h-1a1 1 0 0 1-.809-1.588c.58-.8 1.264-1.518 2.033-2.138Z" clipRule="evenodd"/>
    </svg>
  );
}
