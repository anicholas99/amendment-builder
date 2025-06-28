#!/bin/bash

# Script to clean up unused files in the codebase
echo "Starting codebase cleanup..."

# Create a backup directory
echo "Creating backup directory..."
mkdir -p ./backups/$(date +%Y%m%d)

# 1. Handle duplicate type files
echo "Backing up and removing duplicate type files..."
cp ./src/types/common-types.ts ./backups/$(date +%Y%m%d)/common-types.ts.bak

# 2. Handle duplicate util files
echo "Backing up and removing duplicate utility files..."
cp ./src/utils/reactHelpers.ts ./backups/$(date +%Y%m%d)/reactHelpers.ts.bak
cp ./src/utils/reactHelpers.tsx ./backups/$(date +%Y%m%d)/reactHelpers.tsx.bak

# Backup the ProjectStorage.ts.bak file (old backup file)
if [ -f ./src/contexts/project/ProjectStorage.ts.bak ]; then
  cp ./src/contexts/project/ProjectStorage.ts.bak ./backups/$(date +%Y%m%d)/ProjectStorage.ts.bak.bak
  rm ./src/contexts/project/ProjectStorage.ts.bak
fi

# Remove any .swp files (editor temp files)
find ./src -name "*.swp" -exec cp {} ./backups/$(date +%Y%m%d)/ \; -exec rm {} \;

# 3. Remove unused type files after backing them up
echo "Removing unused or duplicate files..."
rm ./src/types/common-types.ts
rm ./src/utils/reactHelpers.ts

# 4. Check for git .swp files and remove them
echo "Cleaning up temporary files..."
find ./src -name "*.swp" -exec rm {} \;

# 5. Run the type-check to make sure everything still works
echo "Running TypeScript type-check to verify nothing broke..."
npm run type-check

# Show a summary of what was done
echo "===== Cleanup Summary ====="
echo "1. Removed redundant file: src/types/common-types.ts"
echo "2. Removed redundant file: src/utils/reactHelpers.ts"
echo "3. Removed temporary files (*.swp, *.bak)"
echo "4. All removed files have been backed up to ./backups/$(date +%Y%m%d)/"
echo "============================="

echo "Cleanup complete! All removed files have been backed up to ./backups/$(date +%Y%m%d)/"
echo "Before deleting more files, please review the unused-files-report.md and verify that the files are indeed unused."
echo "Please commit these changes after verifying that everything still works." 