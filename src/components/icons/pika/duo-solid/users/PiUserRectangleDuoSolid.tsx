import React from 'react';

/**
 * PiUserRectangleDuoSolid icon from the duo-solid style in users category.
 */
interface PiUserRectangleDuoSolidProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiUserRectangleDuoSolid({
  size = 24,
  color,
  className,
  ariaLabel = 'user-rectangle icon',
  ...props
}: PiUserRectangleDuoSolidProps): JSX.Element {
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
      <path fill={color || "currentColor"} fillRule="evenodd" d="M11.2 2h-.043c-1.224 0-2.203 0-2.994.065-.812.066-1.514.205-2.16.534a5.5 5.5 0 0 0-2.404 2.404c-.329.646-.468 1.348-.534 2.16C3 7.954 3 8.933 3 10.157v3.686c0 1.224 0 2.203.065 2.994.066.812.205 1.514.534 2.16A5.5 5.5 0 0 0 6.003 21.4c.646.329 1.348.468 2.16.534.791.065 1.77.065 2.994.065h1.686c1.224 0 2.203 0 2.994-.065.812-.066 1.514-.205 2.16-.534a5.5 5.5 0 0 0 2.404-2.404c.329-.646.468-1.348.534-2.16.065-.791.065-1.77.065-2.994v-3.685c0-1.224 0-2.203-.065-2.994-.066-.812-.205-1.514-.534-2.16a5.5 5.5 0 0 0-2.404-2.404c-.646-.329-1.348-.468-2.16-.534C15.046 2 14.067 2 12.843 2z" clipRule="evenodd" opacity=".28"/><path fill={color || "currentColor"} fillRule="evenodd" d="m5.05 16.576.008.098c.056.689.162 1.098.324 1.415a3.5 3.5 0 0 0 1.53 1.53c.316.161.725.267 1.414.323.7.057 1.598.058 2.874.058h1.6c1.277 0 2.174 0 2.874-.058.689-.056 1.098-.162 1.415-.323a3.5 3.5 0 0 0 1.53-1.53c.16-.317.267-.726.323-1.415l.01-.122A4.35 4.35 0 0 0 15.616 15H8.383a4.36 4.36 0 0 0-3.333 1.576ZM12 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" clipRule="evenodd"/>
    </svg>
  );
}
