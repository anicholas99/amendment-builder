import React from 'react';

/**
 * PiStickerCornerFoldedDuoSolid icon from the duo-solid style in media category.
 */
interface PiStickerCornerFoldedDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiStickerCornerFoldedDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'sticker-corner-folded icon',
  ...props
}: PiStickerCornerFoldedDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M2 7a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v1.2c0 .857 0 1.439-.038 1.889-.035.438-.1.663-.18.819a2 2 0 0 1-.874.874c-.156.08-.38.145-.819.18-.45.037-1.032.038-1.889.038h-2.038c-.528 0-.982 0-1.357.03-.395.033-.789.104-1.167.297a3 3 0 0 0-1.311 1.311c-.193.378-.264.772-.296 1.167-.031.375-.031.83-.031 1.356V18.2c0 .857 0 1.439-.038 1.889-.035.438-.1.663-.18.819a2 2 0 0 1-.874.874c-.156.08-.38.145-.819.18C9.639 22 9.057 22 8.2 22H7a5 5 0 0 1-5-5z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} d="M21.988 13.47a9 9 0 0 1-8.517 8.518q.049-.085.093-.172c.247-.486.346-1.002.392-1.565.044-.54.044-1.205.044-2.01V16.2c0-.577 0-.95.024-1.233.022-.271.06-.372.085-.421a1 1 0 0 1 .437-.437c.05-.026.15-.063.422-.085C15.25 14 15.624 14 16.2 14h2.041c.805 0 1.47 0 2.01-.045.563-.046 1.08-.144 1.565-.391q.087-.045.172-.093Z"/>
    </svg>
  );
}
