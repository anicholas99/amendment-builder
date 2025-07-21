import React from 'react';

/**
 * PiFile02SVGFormatDuoSolid icon from the duo-solid style in files-&-folders category.
 */
interface PiFile02SVGFormatDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiFile02SVGFormatDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'file-02-svg-format icon',
  ...props
}: PiFile02SVGFormatDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} d="M3 6a5 5 0 0 1 5-5h1.2c.857 0 1.439 0 1.889.038.438.035.663.1.819.18a2 2 0 0 1 .874.874c.08.156.145.38.18.819C13 3.361 13 3.943 13 4.8v.039c0 .527 0 .981.03 1.356.033.395.104.789.297 1.167a3 3 0 0 0 1.311 1.311c.378.193.772.264 1.167.296.375.031.83.031 1.356.031h.039c.857 0 1.439 0 1.889.038.438.035.663.1.819.18a2 2 0 0 1 .874.874c.08.156.145.38.18.819l.007.089H3z" opacity=".28"/><path fill={color || "currentColor"} d="M14.664 1.4c.175.422.253.869.292 1.348.044.541.044 1.205.044 2.01V4.8c0 .576 0 .948.024 1.232.022.271.06.372.085.422a1 1 0 0 0 .437.437c.05.025.15.062.422.085.283.023.656.024 1.232.024h.041c.805 0 1.47 0 2.01.044.48.039.926.116 1.348.292A9.02 9.02 0 0 0 14.664 1.4Z"/><path fill={color || "currentColor"} fillRule="evenodd" d="M9.784 13.024a1 1 0 0 1 1.192.76l1.35 6.093 1.35-6.093a1 1 0 1 1 1.953.432l-1.551 7a1 1 0 0 1-.976.784H11.55a1 1 0 0 1-.976-.784l-1.551-7a1 1 0 0 1 .76-1.192ZM2 15.75A2.75 2.75 0 0 1 4.75 13H7a1 1 0 1 1 0 2H4.75a.75.75 0 0 0 0 1.5h1.5a2.75 2.75 0 1 1 0 5.5H3a1 1 0 1 1 0-2h3.25a.75.75 0 0 0 0-1.5h-1.5A2.75 2.75 0 0 1 2 15.75Zm16.546-.144c-.318.446-.546 1.112-.546 1.894s.228 1.448.546 1.894c.32.447.67.606.954.606.224 0 .49-.1.75-.362v-.67A1 1 0 0 1 20.5 17h.75a1 1 0 0 1 1 1v2a1 1 0 0 1-.192.589C21.472 21.392 20.582 22 19.5 22c-1.097 0-1.996-.624-2.581-1.444-.587-.821-.919-1.905-.919-3.056 0-1.15.332-2.235.919-3.056.585-.82 1.484-1.444 2.581-1.444 1.082 0 1.972.608 2.558 1.411a1 1 0 1 1-1.616 1.178c-.317-.434-.662-.589-.942-.589-.284 0-.635.16-.954.606Z" clipRule="evenodd"/>
    </svg>
  );
}
