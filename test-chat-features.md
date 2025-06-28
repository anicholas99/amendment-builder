# Testing New Chat Agent Features

## Prerequisites
- Have a project with at least 3-5 claims
- Be in the Claim Refinement view for best results

## Feature 1: Context-Aware Follow-ups

1. **Revise a claim:**
   ```
   "shorten claim 1"
   ```
   - Click "Apply Revision" when the diff appears

2. **Test context awareness:**
   ```
   "what next?"
   ```
   - Agent should acknowledge the revision and suggest checking dependent claims

## Feature 2: Smart Claim Cross-References

1. **Trigger claim mentions:**
   ```
   "how do claims 2 and 3 relate?"
   ```
   - Look for blue underlined "claim X" text
   - Hover to see claim preview tooltip
   - Click to trigger action (currently logs to console)

## Feature 3: Batch Claim Operations

1. **Range of claims:**
   ```
   "shorten claims 2-5"
   ```
   - Should show 4 separate revision diffs
   - Each has individual Apply/Reject buttons

2. **All claims:**
   ```
   "fix grammar in all claims"
   ```
   - Processes every claim
   - Shows summary statistics

3. **Specific claims:**
   ```
   "clarify claims 1, 3, and 5"
   ```
   - Only processes the specified claims

## Feature 4: Claim Dependency Visualizer

1. **Basic visualization:**
   ```
   "show claim dependencies"
   ```
   - Displays Mermaid diagram
   - Blue = independent claims
   - Purple = dependent claims
   - Arrows show dependencies

2. **Alternative prompts:**
   ```
   "visualize claim structure"
   "how are my claims connected?"
   ```

## Combined Test Flow

For a comprehensive test, try this sequence:

1. "show my claims" - See current state
2. "visualize claim dependencies" - See structure
3. "shorten claims 1-3" - Test batch operations
4. Apply one revision
5. "what should I do next?" - Test context awareness
6. "check consistency" - Ensure everything still works

## Debugging

If features don't work as expected:

1. Check browser console for errors
2. Ensure you're in a project with claims
3. Try refreshing the page
4. Check that the dev server is running

## Expected Behaviors

- **Claim links**: Should be blue and underlined, show tooltip on hover
- **Revision diffs**: Green for additions, red strikethrough for deletions
- **Mermaid diagrams**: Should render with proper colors and arrows
- **Context memory**: Only remembers the last action, clears after use 