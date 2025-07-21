import React from 'react';

/**
 * PiCodeAISolid icon from the solid style in ai category.
 */
interface PiCodeAISolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiCodeAISolid({
  size = 24,
  color,
  className,
  ariaLabel = 'code-ai icon',
  ...props
}: PiCodeAISolidProps): JSX.Element {
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
      <path fillRule="evenodd" d="M8.466 3.188c-2.095 0-4 1.535-4 3.667v2.667c0 .813-.78 1.666-2 1.666a1 1 0 1 0 0 2c1.22 0 2 .854 2 1.667v2.667c0 2.132 1.905 3.667 4 3.667a1 1 0 0 0 0-2c-1.218 0-2-.854-2-1.667v-2.667c0-1.085-.493-2.015-1.253-2.667.76-.651 1.253-1.581 1.253-2.666V6.855c0-.813.782-1.667 2-1.667a1 1 0 1 0 0-2Zm8 0a1 1 0 1 0 0 2c1.22 0 2 .854 2 1.667v2.667c0 1.085.493 2.015 1.253 2.666-.76.652-1.253 1.582-1.253 2.667v2.667c0 .813-.78 1.667-2 1.667a1 1 0 1 0 0 2c2.095 0 4-1.535 4-3.667v-2.667c0-.813.782-1.667 2-1.667a1 1 0 0 0 0-2c-1.218 0-2-.853-2-1.666V6.855c0-2.132-1.905-3.667-4-3.667ZM12.966 8a1 1 0 0 1 .93.633c.293.743.566 1.19.896 1.523s.781.614 1.541.914a1 1 0 0 1 0 1.86c-.76.3-1.21.582-1.54.914s-.603.78-.896 1.523a1 1 0 0 1-1.86 0c-.294-.743-.567-1.19-.897-1.523-.329-.332-.78-.614-1.54-.914a1 1 0 0 1 0-1.86c.76-.3 1.211-.582 1.54-.914.33-.332.603-.78.896-1.523a1 1 0 0 1 .93-.633Zm-5 8a1 1 0 0 1 1-1h.001a1 1 0 1 1-1 1Z" clipRule="evenodd" fill="currentColor"/>
    </svg>
  );
}
