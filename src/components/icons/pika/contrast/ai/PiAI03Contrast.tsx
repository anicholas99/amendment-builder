import React from 'react';

/**
 * PiAI03Contrast icon from the contrast style in ai category.
 */
interface PiAI03ContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiAI03Contrast({
  size = 24,
  color,
  className,
  ariaLabel = 'ai-03 icon',
  ...props
}: PiAI03ContrastProps): JSX.Element {
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
      <g fill="currentColor" opacity=".28"><path d="M8.577 5.764c.46-.893.69-1.34.999-1.485a1 1 0 0 1 .848 0c.309.145.539.592.999 1.485l1.191 2.315c.08.154.12.232.171.3a1 1 0 0 0 .157.165c.065.055.14.098.29.186l2.387 1.387c.782.454 1.173.681 1.305.977a1 1 0 0 1 0 .812c-.132.296-.523.523-1.305.977l-2.386 1.387c-.15.088-.226.131-.291.186q-.088.073-.157.165a2 2 0 0 0-.17.3l-1.193 2.315c-.46.893-.689 1.34-.998 1.485a1 1 0 0 1-.848 0c-.31-.145-.539-.592-.999-1.485l-1.191-2.315c-.08-.154-.12-.232-.171-.3a1 1 0 0 0-.157-.165 2 2 0 0 0-.291-.186L4.38 12.883c-.782-.454-1.173-.681-1.305-.977a1 1 0 0 1 0-.812c.132-.296.523-.523 1.305-.977L6.767 8.73c.15-.088.226-.131.291-.186a1 1 0 0 0 .157-.165c.051-.068.091-.146.17-.3z" fill="none" stroke="currentColor"/><path d="M17.46 5.406c-.254-.317-.381-.476-.429-.659a1 1 0 0 1 0-.494c.048-.183.175-.342.428-.66l.816-1.019c.254-.317.38-.475.527-.535a.52.52 0 0 1 .396 0c.146.06.273.218.527.535l.815 1.02c.254.317.381.476.428.659a1 1 0 0 1 0 .494c-.047.183-.174.342-.428.66l-.815 1.019c-.254.317-.38.475-.527.535a.52.52 0 0 1-.396 0c-.146-.06-.273-.218-.527-.535z" fill="none" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m12.614 8.079-1.192-2.315c-.46-.893-.689-1.34-.998-1.485a1 1 0 0 0-.848 0c-.31.145-.539.592-.999 1.485L7.386 8.079c-.08.154-.12.232-.171.3a1 1 0 0 1-.157.165c-.065.055-.14.098-.291.186L4.38 10.117c-.782.454-1.173.681-1.305.977a1 1 0 0 0 0 .812c.132.296.523.523 1.305.977l2.386 1.387c.15.088.226.131.291.186q.087.073.157.165c.051.068.091.146.17.3l1.192 2.315c.46.893.69 1.34.999 1.485a1 1 0 0 0 .848 0c.309-.145.539-.592.999-1.485l1.191-2.315c.08-.154.12-.232.171-.3q.069-.09.157-.165c.065-.055.14-.098.29-.186l2.387-1.387c.782-.454 1.173-.681 1.305-.977a1 1 0 0 0 0-.812c-.132-.296-.523-.523-1.305-.977L13.233 8.73a2 2 0 0 1-.291-.186 1 1 0 0 1-.157-.165 2 2 0 0 1-.17-.3Z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m18.275 2.574-.816 1.02c-.253.317-.38.476-.428.659a1 1 0 0 0 0 .494c.048.183.175.342.428.66l.816 1.019c.254.317.38.475.527.535a.52.52 0 0 0 .396 0c.146-.06.273-.218.527-.535l.815-1.02c.254-.317.381-.476.428-.659a1 1 0 0 0 0-.494c-.047-.183-.174-.342-.428-.66l-.815-1.019c-.254-.317-.38-.475-.527-.535a.52.52 0 0 0-.396 0c-.146.06-.273.218-.527.535Z" fill="none"/>
    </svg>
  );
}
