import React from 'react';

/**
 * PiStaroflifeDuoStroke icon from the duo-stroke style in medical category.
 */
interface PiStaroflifeDuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiStaroflifeDuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'staroflife icon',
  ...props
}: PiStaroflifeDuoStrokeProps): JSX.Element {
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
      <path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 4.6c0-.56 0-.84.109-1.054a1 1 0 0 1 .437-.437C10.76 3 11.04 3 11.6 3h.8c.56 0 .84 0 1.054.109a1 1 0 0 1 .437.437C14 3.76 14 4.04 14 4.6v3.936l3.408-1.968c.485-.28.728-.42.967-.433a1 1 0 0 1 .597.16c.202.131.342.374.622.859l.4.692c.28.485.42.728.432.968a1 1 0 0 1-.16.597c-.13.201-.373.341-.858.621L16 12l3.408 1.968c.485.28.728.42.858.621a1 1 0 0 1 .16.597c-.012.24-.152.482-.432.968l-.4.692c-.28.485-.42.728-.622.859a1 1 0 0 1-.597.16c-.24-.013-.482-.153-.967-.433L14 15.464V19.4c0 .56 0 .84-.11 1.054a1 1 0 0 1-.436.437C13.24 21 12.96 21 12.4 21h-.8c-.56 0-.84 0-1.054-.109a1 1 0 0 1-.437-.437c-.11-.214-.11-.494-.11-1.054v-3.936l-3.408 1.968c-.485.28-.728.42-.967.433a1 1 0 0 1-.597-.16c-.202-.131-.342-.374-.622-.859l-.4-.692c-.28-.486-.42-.728-.432-.968a1 1 0 0 1 .16-.597c.13-.201.373-.341.858-.621L8 12l-3.41-1.968c-.485-.28-.727-.42-.858-.621a1 1 0 0 1-.16-.597c.012-.24.152-.483.432-.968l.4-.692c.28-.485.42-.728.622-.859a1 1 0 0 1 .597-.16c.24.013.482.153.967.433L10 8.536z" opacity=".28" fill="none"/><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.109 3.546a1 1 0 0 1 .437-.437C10.76 3 11.04 3 11.6 3h.8c.56 0 .84 0 1.054.109a1 1 0 0 1 .437.437m4.484 2.59a1 1 0 0 1 .597.16c.202.13.342.373.622.858l.4.692c.28.485.42.728.432.968a1 1 0 0 1-.16.597m0 5.178a1 1 0 0 1 .16.597c-.012.24-.152.482-.432.968l-.4.692c-.28.485-.42.728-.622.859a1 1 0 0 1-.597.16m-4.484 2.589a1 1 0 0 1-.437.437C13.24 21 12.96 21 12.4 21h-.8c-.56 0-.84 0-1.054-.109a1 1 0 0 1-.437-.437m-4.485-2.59a1 1 0 0 1-.597-.16c-.202-.13-.342-.373-.622-.858l-.4-.692c-.28-.486-.42-.728-.432-.968a1 1 0 0 1 .16-.597m0-5.178a1 1 0 0 1-.16-.597c.012-.24.152-.483.432-.968l.4-.692c.28-.485.42-.728.622-.859a1 1 0 0 1 .597-.16" fill="none"/>
    </svg>
  );
}
