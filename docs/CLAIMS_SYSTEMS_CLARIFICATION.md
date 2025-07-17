# Claims Systems Clarification Guide

## Overview

The patent drafter application has **two separate systems** for handling claims, which can be confusing. This document clarifies the distinction and proper usage of each system.

## The Two Systems

### 1. Claim Refinement System (Database)

**Purpose**: Interactive claim drafting, editing, and refinement workspace

**Storage**: Database tables (`Claim` table)

**Location in UI**: Claim Refinement page

**Tools**:
- `addClaims` - Add new claims to the refinement workspace
- `editClaim` - Edit existing claims
- `deleteClaims` - Delete claims
- `reorderClaims` - Change claim order
- `mirrorClaims` - Create mirrored claims (method → system, etc.)
- `getClaims` - Retrieve all claims

**Key Characteristics**:
- Dynamic, database-driven
- Supports iterative editing
- Tracks claim history
- Supports claim dependencies
- Used for brainstorming and refining claims

### 2. Patent Document CLAIMS Section

**Purpose**: The formal CLAIMS section in the patent application document

**Storage**: `DraftDocument` table with `type='CLAIMS'`

**Location in UI**: Patent Application page

**Tools**:
- `updatePatentClaims` - Sync claims FROM the refinement system TO the patent document
- `setPatentClaimsDirectly` - Set the CLAIMS section content directly
- `enhancePatentSection` (with `sectionName='claims'`) - AI-enhance the claims section

**Key Characteristics**:
- Static document section
- Part of the formal patent application
- What gets filed with the patent office
- Formatted as a complete section with "What is claimed is:" header

## Common Confusion Points

### User Says: "Add claims to my patent application"

❌ **WRONG**: Using `addClaims` tool
- This adds claims to the refinement system, NOT the patent document

✅ **CORRECT**: 
- Use `updatePatentClaims` to sync from refinement system
- Use `setPatentClaimsDirectly` if they provide the complete claims text

### User Says: "Edit claim 3"

**Context Matters**:
- On Claim Refinement page → Use `editClaim`
- On Patent Application page → They likely mean edit the CLAIMS section → Use `enhancePatentSection` or `setPatentClaimsDirectly`

### User Says: "My claims section is empty"

**Check Both Systems**:
1. Are there claims in the refinement system? (`getClaims`)
2. Is the CLAIMS section in the patent document empty? (Check draft documents)
3. If claims exist in refinement but not in document → Use `updatePatentClaims`

## Data Flow

```
Claim Refinement System          Patent Document System
        (Database)                    (Draft Documents)
            |                                |
   [addClaims, editClaim]                    |
            |                                |
            v                                |
      Claim Table                            |
            |                                |
            |-----> updatePatentClaims ----->|
            |                                |
                                             v
                                      CLAIMS Section
                                   (in patent document)
```

## Implementation Details

### Claim Refinement System
- Stored in `Claim` table with fields: id, inventionId, number, text, type, etc.
- Linked to invention via `inventionId`
- Supports versioning and history tracking

### Patent Document System
- Stored in `DraftDocument` table with `type='CLAIMS'`
- Content is a formatted string with standard patent claims format
- Part of the complete patent application document

### Syncing Process (`updatePatentClaims`)
1. Fetches all claims from `ClaimRepository.findByInventionId()`
2. Formats them in standard patent format: "What is claimed is:\n\n1. First claim...\n\n2. Second claim..."
3. Saves to `DraftDocument` with `type='CLAIMS'`

## Best Practices

1. **For Chat Agents**: Always clarify which system the user wants to interact with
2. **For Developers**: Keep the systems clearly separated - don't mix their APIs
3. **For UI**: Make it clear which page controls which system

## Future Improvements

Consider:
- Renaming tools to be more explicit (e.g., `addClaimsToRefinement` vs `updatePatentDocumentClaims`)
- Adding visual indicators in the UI showing sync status
- Automatic sync warnings when refinement claims differ from document claims
- One-way data flow enforcement (refinement → document, never reverse) 