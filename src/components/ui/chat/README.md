# Chat UI Components

Enhanced chat components inspired by [shadcn-chatbot-kit](https://github.com/Blazity/shadcn-chatbot-kit) for building modern chat interfaces.

## Components

### ChatBubble

Message bubble component with variants and animations.

```tsx
import { ChatBubble, ChatBubbleAvatar, ChatBubbleMessage, ChatBubbleTimestamp } from '@/components/ui/chat';

<ChatBubble variant="user" side="right">
  <ChatBubbleAvatar>
    <Avatar>
      <AvatarFallback>U</AvatarFallback>
    </Avatar>
  </ChatBubbleAvatar>
  <ChatBubbleMessage>
    Hello, how can I help you?
  </ChatBubbleMessage>
  <ChatBubbleTimestamp>
    12:34 PM
  </ChatBubbleTimestamp>
</ChatBubble>
```

#### Props

- `variant`: 'default' | 'user' | 'assistant' - Style variant
- `side`: 'left' | 'right' - Bubble alignment
- `isTyping`: boolean - Show typing indicator

### ChatInput

Enhanced input component with file upload and voice recording support.

```tsx
import { ChatInput } from '@/components/ui/chat';

<ChatInput
  placeholder="Type a message..."
  onSendMessage={(message) => console.log(message)}
  disabled={isLoading}
  showFileUpload={true}
  showVoiceInput={true}
  maxLength={1000}
/>
```

#### Props

- `value`: string - Controlled value
- `onValueChange`: (value: string) => void - Value change handler
- `onSendMessage`: (value: string) => void - Send message handler
- `placeholder`: string - Input placeholder
- `disabled`: boolean - Disable input
- `isLoading`: boolean - Loading state
- `onFileSelect`: (file: File) => void - File selection handler
- `showFileUpload`: boolean - Show file upload button
- `showVoiceInput`: boolean - Show voice input button
- `maxLength`: number - Maximum character length

### ChatMessageList

Scrollable message list with auto-scroll behavior.

```tsx
import { ChatMessageList, ChatMessageListItem } from '@/components/ui/chat';

<ChatMessageList isLoading={false}>
  {messages.map((message, index) => (
    <ChatMessageListItem key={index}>
      <ChatBubble>
        {/* Message content */}
      </ChatBubble>
    </ChatMessageListItem>
  ))}
</ChatMessageList>
```

#### Props

- `isLoading`: boolean - Show loading state
- `loadingText`: string - Loading message
- `onScroll`: (event) => void - Scroll event handler
- `messagesEndRef`: RefObject - Reference to scroll anchor

### ExpandableChat

Responsive chat container with expand/collapse functionality.

```tsx
import { 
  ExpandableChat, 
  ExpandableChatHeader, 
  ExpandableChatBody, 
  ExpandableChatFooter 
} from '@/components/ui/chat';

<ExpandableChat size="md" position="bottom-right">
  <ExpandableChatHeader>
    <h2>Chat Assistant</h2>
  </ExpandableChatHeader>
  <ExpandableChatBody>
    {/* Message list */}
  </ExpandableChatBody>
  <ExpandableChatFooter>
    {/* Input */}
  </ExpandableChatFooter>
</ExpandableChat>
```

#### Props

- `size`: 'sm' | 'md' | 'lg' | 'full' - Container size
- `position`: 'bottom-right' | 'bottom-left' | 'center' | 'floating' - Position
- `open`: boolean - Controlled open state
- `onOpenChange`: (open: boolean) => void - Open state handler
- `expanded`: boolean - Controlled expanded state
- `onExpandChange`: (expanded: boolean) => void - Expand state handler

## Usage Examples

### Basic Chat Interface

```tsx
import { EnhancedChatInterface } from '@/features/chat/components/EnhancedChatInterface';

<EnhancedChatInterface
  projectData={projectData}
  onContentUpdate={handleContentUpdate}
  pageContext="technology"
  projectId={projectId}
/>
```

### Floating Chat Assistant

```tsx
import { FloatingChatAssistant } from '@/features/chat/components/FloatingChatAssistant';

<FloatingChatAssistant
  projectData={projectData}
  onContentUpdate={handleContentUpdate}
  pageContext="technology"
  projectId={projectId}
  position="bottom-right"
  size="md"
  defaultOpen={false}
/>
```

### Custom Chat Implementation

```tsx
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatMessageList,
  ChatInput,
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
  ExpandableChatFooter,
} from '@/components/ui/chat';

function CustomChat() {
  const [messages, setMessages] = useState([]);
  
  const handleSendMessage = (content) => {
    setMessages([...messages, { 
      role: 'user', 
      content, 
      timestamp: new Date() 
    }]);
  };

  return (
    <ExpandableChat size="lg" position="center">
      <ExpandableChatHeader>
        <h2>Custom Chat</h2>
      </ExpandableChatHeader>
      
      <ExpandableChatBody>
        <ChatMessageList>
          {messages.map((message, index) => (
            <ChatBubble
              key={index}
              variant={message.role}
              side={message.role === 'user' ? 'right' : 'left'}
            >
              <ChatBubbleAvatar>
                <Avatar>
                  <AvatarFallback>
                    {message.role === 'user' ? 'U' : 'A'}
                  </AvatarFallback>
                </Avatar>
              </ChatBubbleAvatar>
              <ChatBubbleMessage>
                {message.content}
              </ChatBubbleMessage>
            </ChatBubble>
          ))}
        </ChatMessageList>
      </ExpandableChatBody>
      
      <ExpandableChatFooter>
        <ChatInput
          onSendMessage={handleSendMessage}
          placeholder="Type your message..."
        />
      </ExpandableChatFooter>
    </ExpandableChat>
  );
}
```

## Features

- 🎨 **Modern Design**: Clean, modern UI with smooth animations
- 📱 **Responsive**: Works great on mobile and desktop
- 🎯 **Accessible**: Full keyboard navigation and screen reader support
- 🌗 **Dark Mode**: Automatic dark mode support
- ⚡ **Performance**: Optimized rendering and virtual scrolling
- 🔧 **Customizable**: Easily customize colors, sizes, and behavior
- 🧩 **Composable**: Build complex chat UIs with simple components

## Migration from Original Chat

To migrate from the original chat interface to the enhanced version:

1. Replace `ChatInterface` with `EnhancedChatInterface`
2. Update imports to use the new chat components
3. Adjust any custom styling to use the new component props

```tsx
// Before
import ChatInterface from '@/features/chat/components/ChatInterface';

// After
import EnhancedChatInterface from '@/features/chat/components/EnhancedChatInterface';
```

The enhanced interface maintains full compatibility with existing props and functionality. 