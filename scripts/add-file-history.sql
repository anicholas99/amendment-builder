-- Add file history to the existing amendment project

-- First, get the amendment project ID (this should be run after checking what exists)
DECLARE @amendmentProjectId NVARCHAR(1000);
DECLARE @tenantId NVARCHAR(1000);
DECLARE @userId NVARCHAR(1000);

-- Get the existing amendment project details
SELECT TOP 1 
    @amendmentProjectId = id,
    @tenantId = tenantId,
    @userId = userId
FROM amendment_projects 
WHERE deletedAt IS NULL;

-- Only proceed if we found an amendment project
IF @amendmentProjectId IS NOT NULL
BEGIN
    PRINT 'Found amendment project: ' + @amendmentProjectId;

    -- Create the file history records
    INSERT INTO amendment_project_files (
        id, amendmentProjectId, tenantId, fileType, fileName, originalName,
        mimeType, sizeBytes, version, status, description, tags, uploadedBy,
        exportedAt, parentFileId, createdAt, updatedAt, deletedAt
    ) VALUES
    -- 1. Office Action PDF
    (
        NEWID(), @amendmentProjectId, @tenantId, 'office_action',
        'Final-Office-Action-Dec-2024.pdf',
        'Final Office Action - December 3, 2024.pdf',
        'application/pdf', 245760, 1, 'ACTIVE',
        'Final Office Action dated December 3, 2024 with 102/103 rejections',
        '["final-oa", "rejections", "anderson-reference"]',
        @userId, NULL, NULL,
        '2024-12-03T10:00:00.000Z', '2024-12-03T10:00:00.000Z', NULL
    ),
    -- 2. Anderson Prior Art
    (
        NEWID(), @amendmentProjectId, @tenantId, 'prior_art',
        'Anderson-US6789012-Prior-Art.pdf',
        'Anderson et al. - US 6,789,012 - Machine Learning System.pdf',
        'application/pdf', 156743, 1, 'ACTIVE',
        'Anderson reference (US 6,789,012) cited in rejection - machine learning patent',
        '["prior-art", "anderson", "cited-reference"]',
        @userId, NULL, NULL,
        '2024-12-04T14:30:00.000Z', '2024-12-04T14:30:00.000Z', NULL
    ),
    -- 3. Draft Response v1 (SUPERSEDED)
    (
        NEWID(), @amendmentProjectId, @tenantId, 'draft_response',
        'Amendment-Response-Draft-v1.docx',
        'Amendment Response to Final OA - Draft Version 1.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        89432, 1, 'SUPERSEDED',
        'Initial draft of amendment response - claims amendments and arguments',
        '["draft", "v1", "claims-amendments"]',
        @userId, NULL, NULL,
        '2024-12-05T09:15:00.000Z', '2024-12-05T09:15:00.000Z', NULL
    ),
    -- 4. Williams Analysis
    (
        NEWID(), @amendmentProjectId, @tenantId, 'reference_doc',
        'Williams-Analysis-Notes.pdf',
        'Williams Patent Analysis and Distinguishing Arguments.pdf',
        'application/pdf', 67234, 1, 'ACTIVE',
        'Internal analysis of Williams reference and distinguishing arguments',
        '["analysis", "williams", "distinguishing-art"]',
        @userId, NULL, NULL,
        '2024-12-06T16:45:00.000Z', '2024-12-06T16:45:00.000Z', NULL
    ),
    -- 5. Draft Response v2 (ACTIVE)
    (
        NEWID(), @amendmentProjectId, @tenantId, 'draft_response',
        'Amendment-Response-Draft-v2.docx',
        'Amendment Response to Final OA - Draft Version 2 REVISED.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        94567, 2, 'ACTIVE',
        'Revised draft with strengthened arguments and refined claim amendments',
        '["draft", "v2", "revised", "ready-for-review"]',
        @userId, NULL, NULL,
        '2024-12-07T11:20:00.000Z', '2024-12-07T11:20:00.000Z', NULL
    ),
    -- 6. Export Version
    (
        NEWID(), @amendmentProjectId, @tenantId, 'export_version',
        'Amendment-Response-Export-v2.docx',
        'Amendment Response - Export for USPTO Filing.docx',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        94567, 1, 'ACTIVE',
        'USPTO-formatted export of amendment response ready for filing',
        '["export", "uspto-format", "ready-to-file"]',
        @userId, '2024-12-07T15:30:00.000Z', NULL,
        '2024-12-07T15:30:00.000Z', '2024-12-07T15:30:00.000Z', NULL
    );

    PRINT 'Successfully added 6 amendment project files';
    
    -- Show what we created
    SELECT 
        fileType,
        fileName,
        version,
        status,
        description,
        createdAt
    FROM amendment_project_files 
    WHERE amendmentProjectId = @amendmentProjectId
    ORDER BY createdAt;
    
END
ELSE
BEGIN
    PRINT 'No amendment project found - please run the seed script first';
END 