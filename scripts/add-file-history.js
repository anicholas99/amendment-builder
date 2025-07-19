const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addFileHistory() {
  try {
    console.log('📁 Adding mock file history...\n');

    // Find the existing amendment project
    const amendmentProject = await prisma.amendmentProject.findFirst({
      include: {
        project: true,
        user: true,
        tenant: true,
      },
    });

    if (!amendmentProject) {
      console.error('❌ No amendment project found');
      return;
    }

    console.log(`Found amendment project: ${amendmentProject.name}`);

    // Create mock file history records
    const mockFiles = [
      {
        fileType: 'office_action',
        fileName: 'Final-Office-Action-Dec-2024.pdf',
        originalName: 'Final Office Action - December 3, 2024.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 245760,
        version: 1,
        status: 'ACTIVE',
        description: 'Final Office Action dated December 3, 2024 with 102/103 rejections',
        tags: '["final-oa", "rejections", "anderson-reference"]',
        createdAt: new Date('2024-12-03T10:00:00Z')
      },
      {
        fileType: 'prior_art',
        fileName: 'Anderson-US6789012-Prior-Art.pdf',
        originalName: 'Anderson et al. - US 6,789,012 - Machine Learning System.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 156743,
        version: 1,
        status: 'ACTIVE',
        description: 'Anderson reference (US 6,789,012) cited in rejection - machine learning patent',
        tags: '["prior-art", "anderson", "cited-reference"]',
        createdAt: new Date('2024-12-04T14:30:00Z')
      },
      {
        fileType: 'draft_response',
        fileName: 'Amendment-Response-Draft-v1.docx',
        originalName: 'Amendment Response to Final OA - Draft Version 1.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        sizeBytes: 89432,
        version: 1,
        status: 'SUPERSEDED',
        description: 'Initial draft of amendment response - claims amendments and arguments',
        tags: '["draft", "v1", "claims-amendments"]',
        createdAt: new Date('2024-12-05T09:15:00Z')
      },
      {
        fileType: 'reference_doc',
        fileName: 'Williams-Analysis-Notes.pdf',
        originalName: 'Williams Patent Analysis and Distinguishing Arguments.pdf',
        mimeType: 'application/pdf',
        sizeBytes: 67234,
        version: 1,
        status: 'ACTIVE',
        description: 'Internal analysis of Williams reference and distinguishing arguments',
        tags: '["analysis", "williams", "distinguishing-art"]',
        createdAt: new Date('2024-12-06T16:45:00Z')
      },
      {
        fileType: 'draft_response',
        fileName: 'Amendment-Response-Draft-v2.docx',
        originalName: 'Amendment Response to Final OA - Draft Version 2 REVISED.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        sizeBytes: 94567,
        version: 2,
        status: 'ACTIVE',
        description: 'Revised draft with strengthened arguments and refined claim amendments',
        tags: '["draft", "v2", "revised", "ready-for-review"]',
        createdAt: new Date('2024-12-07T11:20:00Z')
      },
      {
        fileType: 'export_version',
        fileName: 'Amendment-Response-Export-v2.docx',
        originalName: 'Amendment Response - Export for USPTO Filing.docx',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        sizeBytes: 94567,
        version: 1,
        status: 'ACTIVE',
        description: 'USPTO-formatted export of amendment response ready for filing',
        tags: '["export", "uspto-format", "ready-to-file"]',
        exportedAt: new Date('2024-12-07T15:30:00Z'),
        createdAt: new Date('2024-12-07T15:30:00Z')
      }
    ];

    // Create the files (no blob storage, just database records)
    for (const fileData of mockFiles) {
      const result = await prisma.amendmentProjectFile.create({
        data: {
          amendmentProjectId: amendmentProject.id,
          tenantId: amendmentProject.tenantId,
          fileType: fileData.fileType,
          fileName: fileData.fileName,
          originalName: fileData.originalName,
          mimeType: fileData.mimeType,
          sizeBytes: fileData.sizeBytes,
          version: fileData.version,
          status: fileData.status,
          description: fileData.description,
          tags: fileData.tags,
          uploadedBy: amendmentProject.userId,
          exportedAt: fileData.exportedAt || null,
          createdAt: fileData.createdAt,
          updatedAt: fileData.createdAt,
        },
      });

      console.log(`✅ Created: ${fileData.fileName} (${fileData.fileType})`);
    }

    console.log(`\n🎉 Successfully created ${mockFiles.length} mock file records!`);
    console.log('\nMock file history includes:');
    console.log('- Office action PDF');
    console.log('- Prior art references');
    console.log('- Draft response versions (v1 → v2)');
    console.log('- Analysis documents');
    console.log('- Export for USPTO filing');
    console.log('\n💡 These are mock records (no actual files), but will show in the UI!');

  } catch (error) {
    console.error('❌ Error adding file history:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addFileHistory(); 