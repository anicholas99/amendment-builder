/**
 * AI Assistant Panel - Right panel component for AmendmentStudio
 * 
 * Provides AI-powered tools for rejection analysis, amendment suggestions,
 * and argument generation with clean, intuitive interface
 */

import React, { useState, useMemo } from 'react';
import { 
  Bot,
  Lightbulb,
  FileEdit,
  MessageSquare,
  Zap,
  Eye,
  Sparkles,
  Target,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  Download,
  Copy
} from 'lucide-react';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/useToastWrapper';

// Types
interface Rejection {
  id: string;
  type: '§102' | '§103' | '§101' | '§112' | 'OTHER';
  claims: string[];
  priorArtReferences: string[];
  examinerReasoning: string;
  rawText: string;
}

interface AIAnalysis {
  id: string;
  type: 'summary' | 'amendment' | 'argument';
  title: string;
  content: string;
  confidence: number;
  createdAt: Date;
  rejectionId?: string;
}

interface AIAssistantPanelProps {
  selectedRejection?: Rejection;
  onAnalysisGenerated?: (analysis: AIAnalysis) => void;
  onInsertText?: (text: string) => void;
  className?: string;
}

// Mock AI analysis results
const MOCK_ANALYSES: AIAnalysis[] = [
  {
    id: '1',
    type: 'summary',
    title: 'Rejection Summary',
    content: 'The examiner rejects claims 1-3 under § 103 as obvious over Smith in view of Johnson. Key issue: Smith discloses the base system but lacks real-time processing capability, which Johnson teaches.',
    confidence: 0.92,
    createdAt: new Date(),
    rejectionId: 'rej-1',
  },
  {
    id: '2',
    type: 'amendment',
    title: 'Claim Amendment Suggestion',
    content: 'Add limitation "wherein the real-time processing occurs with sub-100ms latency using dedicated hardware acceleration" to distinguish over Smith + Johnson combination.',
    confidence: 0.87,
    createdAt: new Date(),
    rejectionId: 'rej-1',
  },
  {
    id: '3',
    type: 'argument',
    title: 'Technical Argument',
    content: 'The cited prior art fails to teach or suggest the specific combination of real-time processing with sub-100ms latency constraints. While Johnson mentions real-time processing, it does not disclose the specific latency requirements that are critical to the claimed invention.',
    confidence: 0.89,
    createdAt: new Date(),
    rejectionId: 'rej-1',
  },
];

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  selectedRejection,
  onAnalysisGenerated,
  onInsertText,
  className,
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('analyze');
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<AIAnalysis[]>(MOCK_ANALYSES);
  const [expandedAnalyses, setExpandedAnalyses] = useState<Record<string, boolean>>({});
  const [customPrompt, setCustomPrompt] = useState('');

  // Filter analyses for selected rejection
  const relevantAnalyses = useMemo(() => {
    if (!selectedRejection) return analyses;
    return analyses.filter(analysis => analysis.rejectionId === selectedRejection.id);
  }, [analyses, selectedRejection]);

  // Handle AI generation
  const handleGenerate = async (type: 'summary' | 'amendment' | 'argument') => {
    if (!selectedRejection) return;

    setIsGenerating(type);
    
    // Simulate AI processing
    setTimeout(() => {
      const newAnalysis: AIAnalysis = {
        id: `${Date.now()}`,
        type,
        title: type === 'summary' ? 'AI Rejection Summary' :
               type === 'amendment' ? 'AI Amendment Suggestion' :
               'AI Argument Draft',
        content: `AI-generated ${type} content for rejection ${selectedRejection.id}. This would contain the actual AI analysis based on the rejection content.`,
        confidence: 0.85 + Math.random() * 0.1,
        createdAt: new Date(),
        rejectionId: selectedRejection.id,
      };

      setAnalyses(prev => [newAnalysis, ...prev]);
      onAnalysisGenerated?.(newAnalysis);
      setIsGenerating(null);

      toast.success({
        title: 'Analysis Generated',
        description: `AI ${type} has been generated successfully`,
      });
    }, 2000);
  };

  // Handle custom prompt
  const handleCustomPrompt = async () => {
    if (!customPrompt.trim() || !selectedRejection) return;

    setIsGenerating('custom');

    setTimeout(() => {
      const newAnalysis: AIAnalysis = {
        id: `${Date.now()}`,
        type: 'argument',
        title: 'Custom AI Analysis',
        content: `AI response to: "${customPrompt}"\n\nBased on the selected rejection, here's the AI analysis...`,
        confidence: 0.82,
        createdAt: new Date(),
        rejectionId: selectedRejection.id,
      };

      setAnalyses(prev => [newAnalysis, ...prev]);
      setCustomPrompt('');
      setIsGenerating(null);

      toast.success({
        title: 'Custom Analysis Generated',
        description: 'AI has responded to your custom prompt',
      });
    }, 2500);
  };

  // Toggle analysis expansion
  const toggleAnalysis = (id: string) => {
    setExpandedAnalyses(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Copy to clipboard
  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success({
      title: 'Copied',
      description: 'Text copied to clipboard',
    });
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-green-600 bg-green-50';
    if (confidence >= 0.8) return 'text-blue-600 bg-blue-50';
    if (confidence >= 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Get type icon and color
  const getTypeConfig = (type: AIAnalysis['type']) => {
    switch (type) {
      case 'summary':
        return { icon: Eye, color: 'bg-blue-100 text-blue-700', label: 'Summary' };
      case 'amendment':
        return { icon: FileEdit, color: 'bg-green-100 text-green-700', label: 'Amendment' };
      case 'argument':
        return { icon: MessageSquare, color: 'bg-purple-100 text-purple-700', label: 'Argument' };
    }
  };

  // Render analysis item
  const renderAnalysis = (analysis: AIAnalysis) => {
    const typeConfig = getTypeConfig(analysis.type);
    const isExpanded = expandedAnalyses[analysis.id];
    
    return (
      <Card key={analysis.id} className="border border-gray-200">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1">
              <typeConfig.icon className="h-5 w-5 text-gray-600" />
              <div>
                <h4 className="font-medium text-sm">{analysis.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={typeConfig.color} variant="secondary">
                    {typeConfig.label}
                  </Badge>
                  <Badge className={getConfidenceColor(analysis.confidence)} variant="outline">
                    {Math.round(analysis.confidence * 100)}% confident
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleCopy(analysis.content)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy to clipboard</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => toggleAnalysis(analysis.id)}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <Collapsible open={isExpanded} onOpenChange={() => toggleAnalysis(analysis.id)}>
          <CollapsibleContent>
            <CardContent className="p-4 pt-0">
              <div className="text-sm text-gray-700 whitespace-pre-wrap mb-4">
                {analysis.content}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Generated {analysis.createdAt.toLocaleTimeString()}
                </span>
                
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onInsertText?.(analysis.content)}
                >
                  Insert into Draft
                </Button>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  // Render quick actions
  const renderQuickActions = () => {
    if (!selectedRejection) {
      return (
        <div className="p-4 text-center text-gray-500 text-sm">
          Select a rejection to see AI suggestions
        </div>
      );
    }

    return (
      <div className="p-4 space-y-3">
        <h3 className="font-medium text-sm mb-3">Quick Actions</h3>
        
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="outline"
            className="justify-start h-auto p-3"
            onClick={() => handleGenerate('summary')}
            disabled={isGenerating === 'summary'}
          >
            <div className="flex items-center gap-3">
              {isGenerating === 'summary' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              <div className="text-left">
                <div className="font-medium text-sm">Summarize Rejection</div>
                <div className="text-xs text-gray-500">Get AI summary of key points</div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto p-3"
            onClick={() => handleGenerate('amendment')}
            disabled={isGenerating === 'amendment'}
          >
            <div className="flex items-center gap-3">
              {isGenerating === 'amendment' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FileEdit className="h-4 w-4" />
              )}
              <div className="text-left">
                <div className="font-medium text-sm">Suggest Amendment</div>
                <div className="text-xs text-gray-500">AI claim amendment ideas</div>
              </div>
            </div>
          </Button>

          <Button
            variant="outline"
            className="justify-start h-auto p-3"
            onClick={() => handleGenerate('argument')}
            disabled={isGenerating === 'argument'}
          >
            <div className="flex items-center gap-3">
              {isGenerating === 'argument' ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              <div className="text-left">
                <div className="font-medium text-sm">Draft Argument</div>
                <div className="text-xs text-gray-500">Generate rebuttal arguments</div>
              </div>
            </div>
          </Button>
        </div>

        <Separator />

        {/* Custom prompt */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Custom Analysis</h4>
          <Textarea
            placeholder="Ask AI anything about this rejection..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            className="min-h-[80px] text-sm"
          />
          <Button
            onClick={handleCustomPrompt}
            disabled={!customPrompt.trim() || isGenerating === 'custom'}
            className="w-full"
          >
            {isGenerating === 'custom' ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Ask AI
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // Render analysis history
  const renderAnalysisHistory = () => {
    if (relevantAnalyses.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500 text-sm">
          No AI analyses yet. Generate your first analysis using the actions above.
        </div>
      );
    }

    return (
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-sm">AI Analyses ({relevantAnalyses.length})</h3>
          <Button variant="ghost" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {relevantAnalyses.map(renderAnalysis)}
        </div>
      </div>
    );
  };

  // Render strategy recommendations
  const renderStrategy = () => {
    if (!selectedRejection) {
      return (
        <div className="p-4 text-center text-gray-500 text-sm">
          Select a rejection to see strategy recommendations
        </div>
      );
    }

    return (
      <div className="p-4 space-y-4">
        <h3 className="font-medium text-sm">Strategy Recommendations</h3>
        
        <Card className="border-l-4 border-l-blue-500 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-blue-900">Primary Strategy</h4>
                <p className="text-sm text-blue-800 mt-1">
                  Amend claims to add distinguishing features that clearly separate from prior art combination.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-green-900">Alternative Approach</h4>
                <p className="text-sm text-green-800 mt-1">
                  Argue lack of motivation to combine references and unexpected results.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 bg-orange-50/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-orange-900">Risk Assessment</h4>
                <p className="text-sm text-orange-800 mt-1">
                  Medium risk - Prior art combination is somewhat relevant but lacks key technical details.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={cn("h-full flex flex-col bg-gray-50", className)}>
      {/* Header */}
      <div className="p-4 bg-white border-b">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-sm">AI Assistant</h2>
            <p className="text-xs text-gray-500">
              {selectedRejection ? `Analyzing ${selectedRejection.type} rejection` : 'Ready to help'}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-3 rounded-none border-b">
            <TabsTrigger value="analyze" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              History
            </TabsTrigger>
            <TabsTrigger value="strategy" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Strategy
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="mt-0">
            {renderQuickActions()}
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            {renderAnalysisHistory()}
          </TabsContent>

          <TabsContent value="strategy" className="mt-0">
            {renderStrategy()}
          </TabsContent>
        </Tabs>
      </ScrollArea>
    </div>
  );
}; 