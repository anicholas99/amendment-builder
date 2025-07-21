import React from 'react';

/**
 * PiAI01DuoStroke icon from the duo-stroke style in ai category.
 */
interface PiAI01DuoStrokeProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAI01DuoStroke({
  size = 24,
  color,
  className,
  ariaLabel = 'ai-01 icon',
  ...props
}: PiAI01DuoStrokeProps): JSX.Element {
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
      <g stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" opacity=".28"><path d="M17.46 19.406c-.254-.317-.381-.476-.429-.659a1 1 0 0 1 0-.494c.048-.183.175-.342.428-.66l.816-1.019c.254-.317.38-.475.527-.535a.52.52 0 0 1 .396 0c.146.06.273.218.527.535l.816 1.02c.253.317.38.476.428.659a1 1 0 0 1 0 .494c-.048.183-.175.342-.428.66l-.816 1.019c-.254.317-.38.475-.527.535a.52.52 0 0 1-.396 0c-.146-.06-.273-.218-.527-.535z" fill="none"/><path d="M18.23 4.362c-.127-.126-.19-.19-.214-.263a.32.32 0 0 1 0-.198c.023-.073.087-.137.214-.263l.407-.408c.127-.127.19-.19.264-.214a.32.32 0 0 1 .198 0c.073.023.137.087.264.214l.407.408c.127.126.19.19.214.263a.32.32 0 0 1 0 .198c-.023.073-.087.137-.214.263l-.407.408c-.127.127-.19.19-.264.214a.32.32 0 0 1-.198 0c-.073-.023-.137-.087-.264-.214z" fill="none"/></g><path stroke={color || "currentColor"} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.577 5.764c.46-.893.69-1.34.999-1.485a1 1 0 0 1 .848 0c.309.145.539.592.999 1.485l1.191 2.315c.08.155.12.232.171.3a1 1 0 0 0 .157.165c.065.055.14.098.29.186l2.387 1.387c.782.454 1.173.681 1.305.977a1 1 0 0 1 0 .812c-.132.296-.523.523-1.305.977l-2.386 1.387c-.15.088-.226.131-.291.186a1 1 0 0 0-.157.165 2 2 0 0 0-.17.3l-1.193 2.315c-.46.893-.689 1.34-.998 1.485a1 1 0 0 1-.848 0c-.31-.145-.539-.592-.999-1.485l-1.191-2.315a2 2 0 0 0-.171-.3 1 1 0 0 0-.157-.165c-.065-.055-.14-.098-.291-.186L4.38 12.883c-.782-.454-1.173-.681-1.305-.977a1 1 0 0 1 0-.812c.132-.296.523-.523 1.305-.977L6.767 8.73c.15-.088.226-.131.291-.186a1 1 0 0 0 .157-.165c.051-.068.091-.145.17-.3z" fill="none"/>
    </svg>
  );
}
