import React, { useState } from 'react';
import { NextPage } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  FileText, 
  Download, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Info,
  MessageSquare,
  FileSearch,
  BookOpen,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/useToastWrapper';
import { USPTOService, ProsecutionDocument } from '@/client/services/uspto.client-service';
import { format } from 'date-fns';
import { MinimalSpinner } from '@/components/common/MinimalSpinner';
import { cn } from '@/lib/utils';

/**
 * USPTO Integration Test Page
 * Test page to verify USPTO API integration and view prosecution history
 */
const USPTOTestPage: NextPage = () => {
  const toast = useToast();
  const [applicationNumber, setApplicationNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [prosecutionHistory, setProsecutionHistory] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<ProsecutionDocument | null>(null);
  const [showCoreOnly, setShowCoreOnly] = useState(false);
  const [configStatus, setConfigStatus] = useState<any>(null);

  // Format application number for display
  const formatApplicationNumber = (appNum: string) => {
    const clean = appNum.replace(/[^\d]/g, '');
    if (clean.length >= 8) {
      return `${clean.slice(0, 2)}/${clean.slice(2, 5)},${clean.slice(5)}`;
    }
    return appNum;
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  // Get icon for document category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'office-action':
        return <FileText className="h-4 w-4" />;
      case 'response':
        return <MessageSquare className="h-4 w-4" />;
      case 'claims':
        return <BookOpen className="h-4 w-4" />;
      case 'citations':
        return <FileSearch className="h-4 w-4" />;
      case 'examiner-notes':
        return <Info className="h-4 w-4" />;
      case 'interview':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get badge variant for importance
  const getImportanceBadgeVariant = (importance: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (importance) {
      case 'core':
        return 'default';
      case 'optional':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Fetch prosecution history
  const handleSearch = async () => {
    if (!applicationNumber.trim()) {
      toast.error('Please enter an application number');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProsecutionHistory(null);
    setSelectedDoc(null);

    try {
      const history = await USPTOService.fetchProsecutionHistory(
        applicationNumber,
        true // Include timeline
      );
      
      setProsecutionHistory(history);
      
      toast.success(`Found ${history.statistics.totalDocuments} documents (${history.statistics.coreDocuments} core)`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch prosecution history';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Download document
  const handleDownload = async (doc: ProsecutionDocument) => {
    try {
      const result = await USPTOService.downloadOfficeAction(doc);
      
      // Open download URL in new tab
      if (result.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }
      
      toast.success(`Downloading ${doc.description}`);
    } catch (err) {
      toast.error('Failed to download document');
    }
  };

  // Check configuration
  const handleCheckConfig = async () => {
    try {
      const response = await fetch('/api/uspto/test-config');
      const data = await response.json();
      
      if (data.success) {
        setConfigStatus(data.data);
      } else {
        toast.error('Failed to check configuration');
      }
    } catch (err) {
      toast.error('Error checking configuration');
    }
  };

  // Filter documents based on view mode
  const displayedDocuments = prosecutionHistory?.documents.filter((doc: ProsecutionDocument) => 
    !showCoreOnly || doc.importance === 'core'
  ) || [];

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">USPTO Integration Test</h1>
        <p className="text-muted-foreground">
          Test the USPTO Open Data Portal integration by searching for patent prosecution histories.
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Patent Application</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="Enter application number (e.g., 13/937,148)"
              value={applicationNumber}
              onChange={(e) => setApplicationNumber(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search
            </Button>
          </div>
          
          {/* Config check button */}
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCheckConfig}
            >
              Check API Configuration
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={async () => {
                try {
                  const response = await fetch(`/api/uspto/test-direct?applicationNumber=${applicationNumber || '13937148'}`);
                  const data = await response.json();
                  console.log('Direct test result:', data);
                  if (data.success) {
                    toast.success('Direct API call succeeded!');
                  } else {
                    toast.error(`Direct API call failed: ${data.status}`);
                  }
                } catch (error) {
                  toast.error('Direct test failed');
                }
              }}
            >
              Test Direct API
            </Button>
            {configStatus && (
              <div className="text-sm">
                {configStatus.hasApiKey ? (
                  <span className="text-green-600">✓ API Key configured ({configStatus.apiKeyLength} chars)</span>
                ) : (
                  <span className="text-red-600">✗ API Key not found</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error state */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {prosecutionHistory && (
        <div className="space-y-6">
          {/* Application Info */}
          <Card>
            <CardHeader>
              <CardTitle>
                Application {formatApplicationNumber(prosecutionHistory.applicationNumber)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {prosecutionHistory.applicationData && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Title</p>
                    <p className="text-sm">{prosecutionHistory.applicationData.title}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Status</p>
                    <p className="text-sm">{prosecutionHistory.applicationData.status}</p>
                  </div>
                  {prosecutionHistory.applicationData.examinerName && (
                    <div>
                      <p className="font-semibold">Examiner</p>
                      <p className="text-sm">{prosecutionHistory.applicationData.examinerName}</p>
                    </div>
                  )}
                  {prosecutionHistory.applicationData.artUnit && (
                    <div>
                      <p className="font-semibold">Art Unit</p>
                      <p className="text-sm">{prosecutionHistory.applicationData.artUnit}</p>
                    </div>
                  )}
                  {prosecutionHistory.applicationData.filingDate && (
                    <div>
                      <p className="font-semibold">Filing Date</p>
                      <p className="text-sm">{formatDate(prosecutionHistory.applicationData.filingDate)}</p>
                    </div>
                  )}
                  {prosecutionHistory.applicationData.patentNumber && (
                    <div>
                      <p className="font-semibold">Patent Number</p>
                      <p className="text-sm">{prosecutionHistory.applicationData.patentNumber}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Document Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{prosecutionHistory.statistics.totalDocuments}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{prosecutionHistory.statistics.coreDocuments}</p>
                  <p className="text-sm text-muted-foreground">Core</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{prosecutionHistory.statistics.officeActions}</p>
                  <p className="text-sm text-muted-foreground">Office Actions</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{prosecutionHistory.statistics.responses}</p>
                  <p className="text-sm text-muted-foreground">Responses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{prosecutionHistory.statistics.claims}</p>
                  <p className="text-sm text-muted-foreground">Claims</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Document List and Timeline */}
          <Tabs defaultValue="documents">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="documents" className="space-y-4">
              {/* Filter */}
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">
                  Prosecution Documents ({displayedDocuments.length})
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCoreOnly(!showCoreOnly)}
                >
                  {showCoreOnly ? 'Show All' : 'Core Only'}
                </Button>
              </div>

              {/* Document list */}
              <div className="space-y-2">
                {displayedDocuments.map((doc: ProsecutionDocument) => (
                  <Card
                    key={doc.documentId}
                    className={cn(
                      "cursor-pointer hover:bg-accent/50 transition-colors",
                      selectedDoc?.documentId === doc.documentId && "ring-2 ring-primary"
                    )}
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getCategoryIcon(doc.category)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{doc.description}</span>
                              <Badge variant={getImportanceBadgeVariant(doc.importance)}>
                                {doc.importance}
                              </Badge>
                              <Badge variant="outline">{doc.documentCode}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {formatDate(doc.mailDate)}
                              {doc.pageCount && ` • ${doc.pageCount} pages`}
                            </div>
                            {doc.purpose && (
                              <p className="text-sm text-muted-foreground mt-2 italic">
                                {doc.purpose}
                              </p>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(doc);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="timeline">
              {prosecutionHistory.timeline && (
                <div className="space-y-4">
                  {prosecutionHistory.timeline.map((event: any, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-32 text-right text-sm text-muted-foreground">
                        {formatDate(event.date)}
                      </div>
                      <div className="relative">
                        <div className="absolute top-2 -left-2 w-4 h-4 rounded-full bg-primary" />
                        {index < prosecutionHistory.timeline.length - 1 && (
                          <div className="absolute top-6 left-0 w-0.5 h-full bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(event.type)}
                          <span className="font-medium">{event.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {event.documentCode}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default USPTOTestPage;