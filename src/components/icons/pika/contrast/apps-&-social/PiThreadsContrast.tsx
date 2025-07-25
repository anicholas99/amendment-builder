import React from 'react';

/**
 * PiThreadsContrast icon from the contrast style in apps-&-social category.
 */
interface PiThreadsContrastProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  color?: string;
  className?: string;
  ariaLabel?: string;
}

export default function PiThreadsContrast({
  size = 24,
  color,
  className,
  ariaLabel = 'threads icon',
  ...props
}: PiThreadsContrastProps): JSX.Element {
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
      <g opacity=".28"><path fill="currentColor" d="M18.5 6.502c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437c-.214-.109-.494-.109-1.054-.109h-.8c-.56 0-.84 0-1.054.11a1 1 0 0 0-.437.436c-.109.214-.109.494-.109 1.054v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437c.214.11.494.11 1.054.11h.8c.56 0 .84 0 1.054-.11a1 1 0 0 0 .437-.437c.109-.214.109-.494.109-1.054z" stroke="currentColor"/><path fill="currentColor" d="M9.5 6.502c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437c-.214-.109-.494-.109-1.054-.109h-.8c-.56 0-.84 0-1.054.11a1 1 0 0 0-.437.436c-.109.214-.109.494-.109 1.054v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437c.214.11.494.11 1.054.11h.8c.56 0 .84 0 1.054-.11a1 1 0 0 0 .437-.437c.109-.214.109-.494.109-1.054z" stroke="currentColor"/><path fill="currentColor" d="M18.5 16.698c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437c-.214-.11-.494-.11-1.054-.11h-.8c-.56 0-.84 0-1.054.11a1 1 0 0 0-.437.437c-.109.214-.109.494-.109 1.054v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437c.214.109.494.109 1.054.109h.8c.56 0 .84 0 1.054-.11a1 1 0 0 0 .437-.436c.109-.214.109-.494.109-1.054z" stroke="currentColor"/><path fill="currentColor" d="M9.5 16.698c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437c-.214-.11-.494-.11-1.054-.11h-.8c-.56 0-.84 0-1.054.11a1 1 0 0 0-.437.437c-.109.214-.109.494-.109 1.054v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437c.214.109.494.109 1.054.109h.8c.56 0 .84 0 1.054-.11a1 1 0 0 0 .437-.436c.109-.214.109-.494.109-1.054z" stroke="currentColor"/><path fill="currentColor" d="M23 11.6c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C22.24 10 21.96 10 21.4 10h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C19 10.76 19 11.04 19 11.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C19.76 14 20.04 14 20.6 14h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C23 13.24 23 12.96 23 12.4z" stroke="currentColor"/><path fill="currentColor" d="M14 11.6c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C13.24 10 12.96 10 12.4 10h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C10 10.76 10 11.04 10 11.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C10.76 14 11.04 14 11.6 14h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C14 13.24 14 12.96 14 12.4z" stroke="currentColor"/><path fill="currentColor" d="M5 11.6c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C4.24 10 3.96 10 3.4 10h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C1 10.76 1 11.04 1 11.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C1.76 14 2.04 14 2.6 14h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C5 13.24 5 12.96 5 12.4z" stroke="currentColor"/></g><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.5 6.502c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437c-.214-.109-.494-.109-1.054-.109h-.8c-.56 0-.84 0-1.054.11a1 1 0 0 0-.437.436c-.109.214-.109.494-.109 1.054v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437c.214.11.494.11 1.054.11h.8c.56 0 .84 0 1.054-.11a1 1 0 0 0 .437-.437c.109-.214.109-.494.109-1.054z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 6.502c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437c-.214-.109-.494-.109-1.054-.109h-.8c-.56 0-.84 0-1.054.11a1 1 0 0 0-.437.436c-.109.214-.109.494-.109 1.054v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437c.214.11.494.11 1.054.11h.8c.56 0 .84 0 1.054-.11a1 1 0 0 0 .437-.437c.109-.214.109-.494.109-1.054z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.5 16.698c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437c-.214-.11-.494-.11-1.054-.11h-.8c-.56 0-.84 0-1.054.11a1 1 0 0 0-.437.437c-.109.214-.109.494-.109 1.054v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437c.214.109.494.109 1.054.109h.8c.56 0 .84 0 1.054-.11a1 1 0 0 0 .437-.436c.109-.214.109-.494.109-1.054z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.5 16.698c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437c-.214-.11-.494-.11-1.054-.11h-.8c-.56 0-.84 0-1.054.11a1 1 0 0 0-.437.437c-.109.214-.109.494-.109 1.054v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437c.214.109.494.109 1.054.109h.8c.56 0 .84 0 1.054-.11a1 1 0 0 0 .437-.436c.109-.214.109-.494.109-1.054z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M23 11.6c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C22.24 10 21.96 10 21.4 10h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C19 10.76 19 11.04 19 11.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C19.76 14 20.04 14 20.6 14h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C23 13.24 23 12.96 23 12.4z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 11.6c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C13.24 10 12.96 10 12.4 10h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C10 10.76 10 11.04 10 11.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C10.76 14 11.04 14 11.6 14h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C14 13.24 14 12.96 14 12.4z" fill="none"/><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 11.6c0-.56 0-.84-.109-1.054a1 1 0 0 0-.437-.437C4.24 10 3.96 10 3.4 10h-.8c-.56 0-.84 0-1.054.109a1 1 0 0 0-.437.437C1 10.76 1 11.04 1 11.6v.8c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C1.76 14 2.04 14 2.6 14h.8c.56 0 .84 0 1.054-.109a1 1 0 0 0 .437-.437C5 13.24 5 12.96 5 12.4z" fill="none"/>
    </svg>
  );
}
