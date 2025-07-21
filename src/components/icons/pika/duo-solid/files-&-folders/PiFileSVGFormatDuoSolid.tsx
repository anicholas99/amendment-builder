import React from 'react';

/**
 * PiFileSVGFormatDuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiFileSVGFormatDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFileSVGFormatDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'file-svg-format icon',
  ...props
}: PiFileSVGFormatDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M13 3.241v-2.24L12.463 1h-2.106C9.273 1 8.4 1 7.691 1.058c-.728.06-1.369.185-1.96.487A5 5 0 0 0 3.544 3.73c-.302.592-.428 1.233-.487 1.961C3 6.4 3 7.273 3 8.357V11h18V9.537L20.999 9h-2.24c-.805 0-1.47 0-2.01-.044-.563-.046-1.08-.145-1.565-.392a4 4 0 0 1-1.748-1.748c-.247-.485-.346-1.002-.392-1.564C13 4.71 13 4.046 13 3.242Z" opacity=".28"/><path fill={color || "currentColor"} d="M15 1.282V3.2c0 .856 0 1.439.038 1.889.035.438.1.662.18.819a2 2 0 0 0 .874.874c.156.08.38.144.819.18C17.361 7 17.943 7 18.8 7h1.918a5 5 0 0 0-.455-.956c-.31-.506-.735-.931-1.35-1.545L17.5 3.085c-.614-.614-1.038-1.038-1.544-1.348A5 5 0 0 0 15 1.282Z"/><path fill={color || "currentColor"} d="M10.976 13.784a1 1 0 1 0-1.952.432l1.55 7a1 1 0 0 0 .977.784h1.55a1 1 0 0 0 .977-.784l1.55-7a1 1 0 0 0-1.952-.432l-1.35 6.093z"/><path fill={color || "currentColor"} d="M4.75 13a2.75 2.75 0 1 0 0 5.5h1.5a.75.75 0 0 1 0 1.5H3a1 1 0 1 0 0 2h3.25a2.75 2.75 0 1 0 0-5.5h-1.5a.75.75 0 0 1 0-1.5H7a1 1 0 1 0 0-2z"/><path fill={color || "currentColor"} d="M18 17.5c0-.782.228-1.448.546-1.894.32-.447.67-.606.954-.606.28 0 .625.155.942.589a1 1 0 0 0 1.616-1.178C21.472 13.608 20.582 13 19.5 13c-1.097 0-1.996.624-2.581 1.444-.587.821-.919 1.905-.919 3.056 0 1.15.332 2.235.919 3.056.585.82 1.484 1.444 2.581 1.444 1.082 0 1.972-.608 2.558-1.411A1 1 0 0 0 22.25 20v-2a1 1 0 0 0-1-1h-.75a1 1 0 0 0-.25 1.968v.67c-.26.263-.526.362-.75.362-.284 0-.635-.16-.954-.606S18 18.282 18 17.5Z"/>
    </svg>
  );
}
