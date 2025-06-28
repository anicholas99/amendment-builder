import React from 'react';
import { Text } from '@chakra-ui/react';
import { streamingPulse } from '../styles/animations';

interface StreamingCursorProps {
  color: string;
}

export const StreamingCursor: React.FC<StreamingCursorProps> = ({ color }) => (
  <Text
    as="span"
    color={color}
    ml={1}
    animation={`${streamingPulse} 1.2s ease-in-out infinite`}
    display="inline-block"
    fontSize="lg"
    lineHeight="1"
    verticalAlign="middle"
    style={{
      willChange: 'opacity, transform',
      backfaceVisibility: 'hidden',
      transform: 'translateZ(0)',
    }}
  >
    ▎
  </Text>
);
