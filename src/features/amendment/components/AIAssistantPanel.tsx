/**
 * AI Assistant Panel - Right panel component for AmendmentStudio
 * 
 * Provides AI-powered tools for rejection analysis, amendment suggestions,
 * and argument generation with clean, intuitive interface
 */

import React, { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { 
  Brain, 
  History, 
  Target, 
  Sparkles, 
  FileText, 
  Lightbulb,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import the existing enhanced chat interface
import EnhancedChatInterface from '@/features/chat/components/EnhancedChatInterface';

// Import existing types
import type { ProjectData } from '@/features/chat/types';

interface AIAssistantPanelProps {
  projectId: string;
  projectData?: ProjectData;
  officeAction?: {
    id: string;
    rejections: Array<{
      id: string;
      type: string;
      claims: string[];
      reasoning: string;
    }>;
    priorArt: Array<{
      id: string;
      title: string;
      patentNumber: string;
      relevance: string;
    }>;
  };
  onAnalysisComplete?: (analysis: any) => void;
}

// Quick action buttons for common AI tasks
const QuickActions = ({ onAction }: { onAction: (action: string) => void }) => {
  const actions = [
    {
      id: 'summarize',
      label: 'Summarize Office Action',
      icon: FileText,
      description: 'Get a concise summary of all rejections and prior art',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      id: 'suggest-amendments',
      label: 'Suggest Amendments',
      icon: Lightbulb,
      description: 'AI recommendations for claim modifications',
      bgColor: 'bg-green-50 hover:bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      id: 'draft-arguments',
      label: 'Draft Arguments',
      icon: Sparkles,
      description: 'Generate initial response arguments',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      id: 'analyze-prior-art',
      label: 'Analyze Prior Art',
      icon: Brain,
      description: 'Deep analysis of cited references',
      bgColor: 'bg-orange-50 hover:bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-2">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.id}
            variant="ghost"
            className={cn(
              "h-auto p-3 justify-start text-left",
              action.bgColor
            )}
            onClick={() => onAction(action.id)}
          >
            <div className="flex items-start gap-3 w-full">
              <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", action.iconColor)} />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{action.label}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {action.description}
                </div>
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
};

// Analysis history component
const AnalysisHistory = () => {
  const historyItems = [
    {
      id: '1',
      timestamp: '2 minutes ago',
      action: 'Summarized Office Action',
      result: 'Found 3 § 103 rejections affecting claims 1-5',
      confidence: 95,
      status: 'completed' as const,
    },
    {
      id: '2',
      timestamp: '5 minutes ago',
      action: 'Prior Art Analysis',
      result: 'Analyzed US Patent 8,123,456 - Low relevance to claim 3',
      confidence: 87,
      status: 'completed' as const,
    },
    {
      id: '3',
      timestamp: '10 minutes ago',
      action: 'Claim Amendment Suggestions',
      result: 'Suggested 4 potential amendments for claims 1-2',
      confidence: 92,
      status: 'completed' as const,
    },
  ];

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3">
        {historyItems.map((item) => (
          <Card key={item.id} className="p-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                {item.status === 'completed' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-blue-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{item.action}</span>
                  <Badge variant="secondary" className="text-xs">
                    {item.confidence}% confidence
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {item.result}
                </p>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {item.timestamp}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

// Strategy recommendations component
const StrategyRecommendations = () => {
  const strategies = [
    {
      id: '1',
      title: 'Focus on Method Claims',
      description: 'Claims 6-8 have stronger arguments against the cited prior art',
      priority: 'high' as const,
      effort: 'Medium',
      success: '85%',
    },
    {
      id: '2',
      title: 'Amend Independent Claims',
      description: 'Add limitations from dependent claims to overcome rejections',
      priority: 'high' as const,
      effort: 'High',
      success: '75%',
    },
    {
      id: '3',
      title: 'Interview Strategy',
      description: 'Consider examiner interview for claims 1-3',
      priority: 'medium' as const,
      effort: 'Low',
      success: '60%',
    },
  ];

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3">
        {strategies.map((strategy) => (
          <Card key={strategy.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {strategy.priority === 'high' ? (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">{strategy.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {strategy.description}
                </p>
                <div className="flex items-center gap-4">
                                     <div className="flex items-center gap-1">
                     <span className="text-xs text-muted-foreground">Effort:</span>
                     <Badge variant="outline">{strategy.effort}</Badge>
                   </div>
                   <div className="flex items-center gap-1">
                     <span className="text-xs text-muted-foreground">Success:</span>
                     <Badge variant="secondary">{strategy.success}</Badge>
                   </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  projectId,
  projectData,
  officeAction,
  onAnalysisComplete,
}) => {
  const [activeTab, setActiveTab] = useState('analyze');
  
  // Quick Actions expanded state with localStorage persistence
  const [quickActionsExpanded, setQuickActionsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aiAssistant-quickActionsExpanded');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });

  // Persist quick actions expanded state
  const handleQuickActionsToggle = (expanded: boolean) => {
    setQuickActionsExpanded(expanded);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aiAssistant-quickActionsExpanded', JSON.stringify(expanded));
    }
  };

  // Use provided project data or null
  const chatProjectData = useMemo((): ProjectData | null => {
    return projectData || null;
  }, [projectData]);

  // Handle quick action clicks - these will send messages to the chat
  const handleQuickAction = (action: string) => {
    // The chat interface will handle sending these messages
    // They'll be processed by your existing chat system with tool invocations
    const actionMessages = {
      'summarize': 'Please summarize this Office Action, highlighting the key rejections and prior art references.',
      'suggest-amendments': 'Analyze the rejections and suggest specific claim amendments that would overcome the examiner\'s objections.',
      'draft-arguments': 'Draft persuasive arguments for responding to the rejections in this Office Action.',
      'analyze-prior-art': 'Perform a detailed analysis of the cited prior art references and their relevance to our claims.',
    };

    // The EnhancedChatInterface will handle this through its input system
    // You might need to add a ref or callback to programmatically send messages
    console.log('Quick action:', action, actionMessages[action as keyof typeof actionMessages]);
  };

  // Handle content updates from chat
  const handleContentUpdate = (content: any) => {
    onAnalysisComplete?.(content);
  };

  return (
    <div className="h-full flex flex-col bg-background border-l ai-assistant-panel">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <Brain className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">AI Assistant</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Get AI-powered insights and suggestions for your Office Action response
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex-shrink-0 px-4 pt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analyze" className="text-xs">
              <Brain className="h-4 w-4 mr-1" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <History className="h-4 w-4 mr-1" />
              History
            </TabsTrigger>
            <TabsTrigger value="strategy" className="text-xs">
              <Target className="h-4 w-4 mr-1" />
              Strategy
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="analyze" className="h-full m-0 p-0">
            <div className="h-full flex flex-col">
              {/* Quick Actions - Collapsible */}
              <Collapsible
                open={quickActionsExpanded}
                onOpenChange={handleQuickActionsToggle}
                className="flex-shrink-0"
              >
                <div className="border-b bg-muted/30">
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 h-auto hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">Quick Actions</h3>
                        {!quickActionsExpanded && (
                          <Badge variant="secondary" className="text-xs">
                            4 actions
                          </Badge>
                        )}
                      </div>
                      {quickActionsExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="px-4 pb-4">
                    <QuickActions onAction={handleQuickAction} />
                  </CollapsibleContent>
                </div>
              </Collapsible>

              {/* Chat Interface */}
              <div className="flex-1 overflow-hidden min-h-0">
                <div className="h-full w-full overflow-hidden chat-interface-container">
                  <div className="enhanced-chat-interface">
                    <EnhancedChatInterface
                      projectId={projectId}
                      projectData={chatProjectData}
                      onContentUpdate={handleContentUpdate}
                      pageContext="patent" // Use patent context for amendment workflow
                      setPreviousContent={() => {}} // Not used in this context
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="h-full m-0 p-4">
            <div className="mb-4">
              <h3 className="font-medium text-sm mb-2">Analysis History</h3>
              <p className="text-xs text-muted-foreground">
                Recent AI analysis results and insights
              </p>
            </div>
            <AnalysisHistory />
          </TabsContent>

          <TabsContent value="strategy" className="h-full m-0 p-4">
            <div className="mb-4">
              <h3 className="font-medium text-sm mb-2">Strategy Recommendations</h3>
              <p className="text-xs text-muted-foreground">
                AI-generated strategic approaches for your response
              </p>
            </div>
            <StrategyRecommendations />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}; 