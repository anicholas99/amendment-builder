import { PageContext, ProjectData } from '../types';

// Helper function to detect and format patent claims properly
export const formatPatentClaim = (content: string): string => {
  // Quick check to avoid regex if not needed
  if (!content.includes('Claim') || !content.includes(':')) {
    return content;
  }
  
  // Check if this looks like a patent claim
  const claimPattern = /Claim\s+\d+:\s*A\s+[^:]+:\s*([\s\S]*?)(?=\n\n|$)/gi;

  return content.replace(claimPattern, (match, claimBody) => {
    // Convert the claim back to proper prose format
    const cleanedClaim = claimBody
      .replace(/^\s*-\s*/gm, '') // Remove bullet points
      .replace(/^\s*\d+\.\s*/gm, '') // Remove numbered lists
      .replace(/^\s*[•·]\s*/gm, '') // Remove bullet characters
      .replace(/:\s*\n/g, ': ') // Convert colons+newlines to colons+space
      .replace(/;\s*\n/g, '; ') // Convert semicolons+newlines to semicolons+space
      .replace(/\n\s+/g, ' ') // Replace newlines with spaces
      .replace(/\s+/g, ' ') // Collapse multiple spaces
      .trim();

    // Reconstruct the full claim
    const claimStart = match.match(/^(Claim\s+\d+:\s*A\s+[^:]+:)/i)?.[0] || '';
    return `${claimStart} ${cleanedClaim}`;
  });
};

// Get initial message based on page context
export const getInitialMessage = (
  pageContext: PageContext,
  projectData: ProjectData | null
): string => {
  // For technology page, create a more proactive greeting if we have project data
  if (pageContext === 'technology' && projectData?.invention) {
    const title =
      projectData.name || projectData.invention?.title || 'your invention';
    
    // Clean up technical field - remove underscores, capitalize properly
    let techField = projectData.invention?.technicalField ||
      (typeof projectData.invention?.background === 'object' &&
      projectData.invention.background !== null &&
      'technical_field' in projectData.invention.background
        ? (projectData.invention.background as any).technical_field
        : undefined);
    
    // Clean up the technical field if it exists
    if (techField) {
      techField = techField
        .replace(/_/g, ' ') // Replace underscores with spaces
        .replace(/\b\w/g, (l: string) => l.toUpperCase()) // Capitalize first letter of each word
        .trim();
    }

    return `Hi! 👋 I can help enhance "${title}". Just tell me what to add and I'll categorize it for you!`;
  }

  switch (pageContext) {
    case 'technology':
      return 'Hi! 👋 I can help you add technology details and figures. Just tell me what to add!';
    case 'claim-refinement':
      return 'Hi! 👋 I can help you understand and refine your claims.';
    case 'patent':
      return 'Hi! 👋 I can help you edit and improve your patent application.';
    default:
      return "Hi! 👋 I'm your project assistant. How can I help you today?";
  }
};

// Get assistant info based on page context
export const getAssistantInfo = (pageContext: PageContext) => {
  switch (pageContext) {
    case 'technology':
      return {
        title: 'Technology Expert',
        description: 'Specializing in technical details & implementation',
        color: 'green.500',
      };
    case 'claim-refinement':
      return {
        title: 'Claims Specialist',
        description: 'Expert in patent claim structure & refinement',
        color: 'purple.500',
      };
    case 'patent':
      return {
        title: 'Patent Drafting Assistant',
        description: 'Expert in patent document creation',
        color: 'blue.500',
      };
    default:
      return {
        title: 'AI Assistant',
        description: 'Your project helper',
        color: 'blue.500',
      };
  }
};
