import React from 'react';

interface StreamingCursorProps {
  color: string;
}

export const StreamingCursor: React.FC<StreamingCursorProps> = ({ color }) => (
  <span
    className="inline-block text-lg leading-none align-middle ml-1 animate-streaming-pulse"
    style={{
      color,
      willChange: 'opacity',
    }}
  >
    ▎
  </span>
);
