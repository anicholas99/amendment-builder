# Amendment Workflow Seeding Scripts

This directory contains high-quality seeding scripts for creating realistic amendment workflow demo data.

## Scripts Overview

### 🚀 `seed-complete-amendment-demo.js` (Recommended)
**The main comprehensive seeding script** - Creates a complete, realistic amendment workflow including:

- ✅ Patent project with invention data
- ✅ Patent application record with examiner details
- ✅ Office action with realistic 102/103 rejections
- ✅ Amendment project with professional draft documents
- ✅ Complete file history with version tracking (8 files)
- ✅ Prior art references with detailed analysis
- ✅ Claim amendments with technical distinctions
- ✅ Professional argument sections

**Usage:**
```bash
node scripts/seed-complete-amendment-demo.js
```

**What it creates:**
- Project: "AI-Powered Learning Assistant - Amendment Demo"
- Patent App: 16/789,123 (Machine Learning Educational System)
- Office Action: Final OA with Anderson/Williams rejections
- Amendment Project: Response with 3 claim amendments
- File History: Office action → Analysis → Drafts v1-v3 → Export
- Prior Art: Anderson (US6789012) + Williams (US7234567)

### 📁 `add-file-history.js` (Standalone)
**Adds mock file history** to existing amendment projects.

**Usage:**
```bash
node scripts/add-file-history.js
```

**What it adds:**
- Office action PDF
- Prior art analysis documents  
- Draft response versions (v1 → v2)
- Reference documents
- USPTO export versions

### 📋 `seed-complete-amendment-workflow.ts` (Legacy)
**TypeScript version** with Prisma type issues. Use the JS version instead.

## Quick Start

1. **Ensure basic data exists:**
   ```bash
   # Make sure you have a tenant and user
   npm run db:seed  # or your basic seeding command
   ```

2. **Run the comprehensive demo:**
   ```bash
   node scripts/seed-complete-amendment-demo.js
   ```

3. **Navigate to Amendment Studio:**
   - Go to your project list
   - Find "AI-Powered Learning Assistant - Amendment Demo"
   - Click "Amendment Studio"
   - Explore the Claims, Arguments, and Files tabs

## Features Created

### 📝 **Realistic Claim Amendments**
- Claim 1: Deep neural networks with cognitive load assessment
- Claim 3: Biometric feedback and eye-tracking
- Claim 5: Multi-modal feedback with emotional state assessment

### 💬 **Professional Arguments**
- **102 Response:** Technical distinctions from Anderson's rule-based system
- **103 Response:** Lack of motivation to combine + unexpected results

### 📁 **Complete File History**
- **Office Action:** Final OA PDF (Sept 15, 2024)
- **Prior Art:** Anderson + Williams analysis documents
- **Research:** Cognitive load theory supporting evidence
- **Drafts:** Version progression (v1 → v2 → v3)
- **Export:** USPTO-compliant filing version

### 🔍 **Prior Art References**
- **Anderson US6789012:** Rule-based educational system (primary rejection)
- **Williams US7234567:** Text processing system (secondary rejection)

## Data Quality

✅ **Realistic Content:** Professional legal language and technical details  
✅ **Proper Relationships:** All database foreign keys properly linked  
✅ **Version Tracking:** File history shows realistic workflow progression  
✅ **Date Consistency:** Chronological progression over realistic timeframes  
✅ **Error Handling:** Checks for existing data and dependencies  
✅ **Transaction Safety:** All operations wrapped in database transactions  

## Troubleshooting

**"No tenant found"**
- Run basic seeding first to create tenant/user data

**"Amendment demo data already exists"**
- Script detects existing data and skips creation
- Delete existing project manually if you want to recreate

**Prisma connection issues**
- Ensure your database is running
- Check `.env` file has correct DATABASE_URL

## Customization

To modify the demo data:

1. Edit the `DEMO_DATA` object in `seed-complete-amendment-demo.js`
2. Adjust project names, patent numbers, dates, etc.
3. Modify claim amendments and argument content
4. Add/remove file history entries

## File Structure

```
scripts/
├── seed-complete-amendment-demo.js     # 🚀 Main comprehensive script
├── add-file-history.js                 # 📁 Standalone file history
├── seed-complete-amendment-workflow.ts # 📋 Legacy TypeScript (has issues)
├── add-file-history.sql               # 📊 Direct SQL approach
└── README-seeding.md                  # 📖 This documentation
```

## Production Notes

- All mock files are database records only (no actual blob storage)
- File download buttons will show "No download URL" (expected behavior)
- Perfect for demos, UI testing, and development
- Safe to run multiple times (checks for existing data)

---

**Created by:** AI Assistant  
**Last Updated:** December 2024  
**Status:** Production Ready ✅ 