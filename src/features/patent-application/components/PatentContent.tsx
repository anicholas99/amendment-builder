import styled from '@emotion/styled';

// Create a styled component that will render the content with bold headers
const PatentContent = styled.div`
  font-family: var(--fonts-patent);
  font-size: var(--fontSizes-md);
  line-height: var(--lineHeights-patent);
  white-space: pre-wrap;
  padding-bottom: 1.5rem;

  /* Style for the headers - this will make them bold */
  .patent-header {
    font-weight: var(--fontWeights-bold);
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
  }
`;

export default PatentContent;
