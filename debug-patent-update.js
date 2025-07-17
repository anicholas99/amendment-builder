// Debug script to test patent section updates
// Run this in the browser console to simulate an agent update

function simulatePatentSectionUpdate(sectionType = 'FIELD') {
  const projectId = window.location.pathname.match(/projects\/([^\/]+)/)?.[1];
  
  if (!projectId) {
    console.error('No project ID found in URL');
    return;
  }
  
  console.log('Simulating patent section update:', {
    projectId,
    sectionType,
    timestamp: Date.now()
  });
  
  // Dispatch the event that the agent would send
  const event = new CustomEvent('patentSectionUpdated', {
    detail: {
      projectId,
      sectionType,
      timestamp: Date.now()
    }
  });
  
  window.dispatchEvent(event);
  
  console.log('Event dispatched. Watch the logs to see if content updates.');
}

// Example usage:
// simulatePatentSectionUpdate('FIELD');
// simulatePatentSectionUpdate('BACKGROUND');

console.log('Debug script loaded. Use simulatePatentSectionUpdate() to test.');
