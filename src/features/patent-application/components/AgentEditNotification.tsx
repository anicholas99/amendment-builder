import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface AgentEditNotification {
  id: string;
  sectionName: string;
  onUndo: () => void;
}

export const AgentEditNotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<AgentEditNotification[]>(
    []
  );

  useEffect(() => {
    // Listen for agent edit events
    const handleAgentEdit = (event: CustomEvent) => {
      const { sectionType, undoHandler } = event.detail;

      const notification: AgentEditNotification = {
        id: `agent-edit-${Date.now()}`,
        sectionName: sectionType.replace(/_/g, ' ').toLowerCase(),
        onUndo: undoHandler,
      };

      setNotifications(prev => [...prev, notification]);

      // Auto-remove after 10 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 10000);
    };

    window.addEventListener(
      'agentEditNotification',
      handleAgentEdit as EventListener
    );

    return () => {
      window.removeEventListener(
        'agentEditNotification',
        handleAgentEdit as EventListener
      );
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  if (notifications.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className="agent-edit-notification flex items-center gap-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 min-w-[350px] border border-gray-200 dark:border-gray-700 transition-all duration-200"
          style={{
            animation: 'slideIn 0.2s ease-out',
          }}
        >
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
              Patent section updated
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              The {notification.sectionName} section has been updated by the AI
              assistant.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                notification.onUndo();
                removeNotification(notification.id);
              }}
              className="text-xs font-medium"
            >
              Undo
            </Button>
            <button
              onClick={() => removeNotification(notification.id)}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-600 dark:hover:text-gray-400 p-1"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          
          .agent-edit-notification.removing {
            animation: slideOut 0.2s ease-out forwards;
          }
          
          @keyframes slideOut {
            from {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
            to {
              opacity: 0;
              transform: translateY(-10px) scale(0.95);
            }
          }
        `,
        }}
      />
    </div>,
    document.body
  );
};
