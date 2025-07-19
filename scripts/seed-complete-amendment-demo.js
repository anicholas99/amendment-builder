/**
 * Complete Amendment Workflow Seeding Script
 * 
 * Creates a realistic, complete amendment workflow for demonstration purposes including:
 * - Patent project with invention data
 * - Patent application record
 * - Office action with realistic rejections
 * - Amendment project with linked draft documents
 * - File history with version tracking
 * - Prior art references
 * - Strategy recommendations and analysis
 * 
 * Usage: node scripts/seed-complete-amendment-demo.js
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Sample data for the complete amendment workflow
const DEMO_DATA = {
  project: {
    name: "AI-Powered Learning Assistant - Amendment Demo",
    textInput: "An intelligent learning assistant that uses machine learning algorithms to personalize educational content and adapt to student learning patterns in real-time.",
    status: "ACTIVE"
  },
  
  patentApplication: {
    applicationNumber: "16/789,123",
    filingDate: new Date("2023-02-15T10:00:00Z"),
    title: "Machine Learning-Based Adaptive Educational System",
    inventors: ["Dr. Sarah Chen", "Prof. Michael Rodriguez", "Dr. Emily Watson"],
    assignee: "EduTech Innovations, LLC",
    artUnit: "3623",
    examinerName: "SMITH, JOHN K",
    examinerId: "96847",
    status: "UNDER_EXAMINATION"
  },

  officeAction: {
    oaNumber: "Final Office Action",
    dateIssued: new Date("2024-09-15T09:00:00Z"),
    examinerId: "96847",
    artUnit: "3623",
    status: "COMPLETED"
  },

  rejections: [
    {
      type: "102 - Anticipation",
      claimNumbers: ["1", "3", "5"],
      citedPriorArt: ["US 6,789,012 (Anderson et al.)", "US 7,234,567 (Williams)"],
      examinerText: "Claims 1, 3, and 5 are rejected under 35 U.S.C. 102(a)(1) as being anticipated by Anderson (US 6,789,012). Anderson discloses a machine learning system that personalizes educational content based on student performance data, including all elements of the claimed invention.",
      displayOrder: 1
    },
    {
      type: "103 - Obviousness",
      claimNumbers: ["2", "4", "6", "7"],
      citedPriorArt: ["US 6,789,012 (Anderson et al.)", "US 7,234,567 (Williams)", "US 8,456,789 (Johnson)"],
      examinerText: "Claims 2, 4, 6, and 7 are rejected under 35 U.S.C. 103 as being unpatentable over Anderson in view of Williams and Johnson. Anderson teaches the basic machine learning framework, Williams discloses real-time adaptation techniques, and Johnson shows personalization algorithms. A person of ordinary skill would be motivated to combine these references to achieve the claimed invention.",
      displayOrder: 2
    }
  ],

  amendmentResponse: {
    name: "Response to Final Office Action - September 15, 2024",
    dueDate: new Date("2025-01-15T17:00:00Z"),
    responseType: "AMENDMENT",
    
    claimAmendments: [
      {
        id: "claim-1",
        claimNumber: "1",
        status: "CURRENTLY_AMENDED",
        originalText: "A machine learning system for personalizing educational content, comprising: a processor configured to analyze student performance data and generate personalized learning recommendations.",
        amendedText: "A machine learning system for personalizing educational content, comprising: a processor configured to analyze student performance data using deep neural networks with at least three hidden layers and generate personalized learning recommendations based on real-time cognitive load assessment and learning style classification.",
        reasoning: "The amendment adds specific technical details about deep neural networks with multiple hidden layers and real-time cognitive load assessment, which are not disclosed in Anderson and distinguish over the cited prior art."
      },
      {
        id: "claim-3", 
        claimNumber: "3",
        status: "CURRENTLY_AMENDED",
        originalText: "The system of claim 1, wherein the processor adapts content difficulty based on student responses.",
        amendedText: "The system of claim 1, wherein the processor dynamically adapts content difficulty in real-time based on biometric feedback including eye-tracking data, response time analysis, and accuracy patterns to maintain optimal cognitive load.",
        reasoning: "The amendment specifies biometric feedback and eye-tracking data, which are not taught by Anderson or Williams, providing a clear point of novelty."
      },
      {
        id: "claim-5",
        claimNumber: "5", 
        status: "CURRENTLY_AMENDED",
        originalText: "The system of claim 1, further comprising a feedback mechanism for continuous learning optimization.",
        amendedText: "The system of claim 1, further comprising a multi-modal feedback mechanism that integrates voice recognition, gesture detection, and physiological monitoring for continuous learning optimization and emotional state assessment.",
        reasoning: "The multi-modal approach with physiological monitoring and emotional state assessment provides specific technical advantages not disclosed in the prior art."
      }
    ],

    argumentSections: [
      {
        id: "arg-102-rejection",
        title: "Response to 102 Anticipation Rejection",
        content: "Applicant respectfully traverses the 102 rejection and submits that claims 1, 3, and 5 are patentable over Anderson for at least the following reasons:\n\nAnderson fails to disclose the specific deep neural network architecture with multiple hidden layers as now claimed. While Anderson teaches general machine learning, it specifically uses rule-based decision trees (col. 4, lines 20-35), which is fundamentally different from the claimed neural network approach.\n\nFurthermore, Anderson does not teach real-time cognitive load assessment or biometric feedback integration. Anderson's system relies solely on quiz scores and completion times (col. 6, lines 45-52), whereas the claimed invention uses sophisticated biometric monitoring including eye-tracking and physiological sensors.\n\nThe claimed emotional state assessment feature is entirely absent from Anderson, which focuses purely on academic performance metrics without considering student emotional engagement or stress levels.",
        type: "RESPONSE_TO_REJECTION",
        rejectionId: "rejection-102"
      },
      {
        id: "arg-103-rejection", 
        title: "Response to 103 Obviousness Rejection",
        content: "Applicant respectfully traverses the 103 rejection and submits that claims 2, 4, 6, and 7 are patentable over the cited combination for at least the following reasons:\n\nLack of Motivation to Combine: The cited references teach away from the claimed combination. Anderson explicitly criticizes biometric monitoring as 'intrusive and unnecessary' (col. 8, lines 10-15), while Williams focuses on text-based learning without any biometric component. A skilled artisan would not be motivated to combine these conflicting approaches.\n\nUnexpected Results: The claimed combination of neural networks with biometric feedback produces synergistic effects not predictable from the individual references. The real-time cognitive load assessment enables dynamic difficulty adjustment that significantly improves learning outcomes (30% improvement in retention) compared to static rule-based systems.\n\nMissing Elements: Johnson's personalization algorithms are designed for e-commerce recommendation systems, not educational content. The cognitive science principles required for educational adaptation are fundamentally different from commercial product recommendations, and Johnson provides no teaching that would guide a skilled artisan toward educational applications.",
        type: "RESPONSE_TO_REJECTION", 
        rejectionId: "rejection-103"
      }
    ]
  },

  savedPriorArt: [
    {
      patentNumber: "US6789012",
      title: "Rule-Based Educational Content Management System",
      abstract: "A computer-implemented system for managing educational content using rule-based decision trees. The system analyzes student quiz scores and completion times to categorize students into predetermined learning groups and assigns standardized content modules accordingly.",
      authors: "Anderson, James R.; Smith, Mary L.",
      publicationDate: new Date("2018-05-15"),
      claim1: "A computer system for educational content management, comprising: a database storing educational modules; a processor configured to analyze quiz scores and assign students to predetermined categories; and a user interface for displaying assigned content modules.",
      summary: "Anderson teaches a rule-based system that is fundamentally different from the claimed neural network approach. Key distinctions include the use of static rules vs. dynamic learning, no biometric monitoring, and no real-time adaptation.",
      notes: "Primary prior art reference cited in 102 rejection. Focus on distinguishing the rule-based approach from our neural network claims."
    },
    {
      patentNumber: "US7234567", 
      title: "Real-Time Text Processing for Online Learning",
      abstract: "Methods and systems for processing text-based educational content in real-time, including natural language processing and automated content difficulty assessment for written materials.",
      authors: "Williams, Robert P.; Davis, Lisa K.",
      publicationDate: new Date("2019-11-22"),
      claim1: "A method for real-time text processing comprising: receiving text input from a student; analyzing text complexity using natural language processing; and adjusting reading level based on comprehension metrics.",
      summary: "Williams focuses exclusively on text processing and natural language analysis. Does not teach biometric monitoring, neural networks, or multi-modal feedback systems.",
      notes: "Secondary reference in 103 rejection. Limited to text-based learning - no biometric or physiological monitoring components."
    }
  ],

  fileHistory: [
    {
      fileType: 'office_action',
      fileName: 'Final-Office-Action-Sept-2024.pdf',
      originalName: 'Final Office Action - September 15, 2024.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 285432,
      version: 1,
      status: 'ACTIVE',
      description: 'Final Office Action with 102/103 rejections citing Anderson and Williams references',
      tags: '["final-oa", "102-rejection", "103-rejection", "anderson", "williams"]',
      createdAt: new Date('2024-09-15T10:00:00Z')
    },
    {
      fileType: 'prior_art',
      fileName: 'Anderson-US6789012-Analysis.pdf',
      originalName: 'Anderson et al. US 6,789,012 - Detailed Prior Art Analysis.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 167234,
      version: 1,
      status: 'ACTIVE',
      description: 'Comprehensive analysis of Anderson reference highlighting key differences from our invention',
      tags: '["prior-art", "anderson", "analysis", "rule-based-system"]',
      createdAt: new Date('2024-09-16T14:30:00Z')
    },
    {
      fileType: 'prior_art',
      fileName: 'Williams-US7234567-Analysis.pdf', 
      originalName: 'Williams US 7,234,567 - Text Processing Patent Analysis.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 134567,
      version: 1,
      status: 'ACTIVE',
      description: 'Analysis of Williams reference focusing on text-only limitations vs. our biometric approach',
      tags: '["prior-art", "williams", "text-processing", "limitations"]',
      createdAt: new Date('2024-09-17T11:15:00Z')
    },
    {
      fileType: 'reference_doc',
      fileName: 'Cognitive-Load-Research-Summary.pdf',
      originalName: 'Cognitive Load Theory Research - Supporting Technical Evidence.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 456789,
      version: 1,
      status: 'ACTIVE',
      description: 'Academic research supporting the technical advantages of real-time cognitive load assessment',
      tags: '["research", "cognitive-load", "technical-evidence", "unexpected-results"]',
      createdAt: new Date('2024-09-18T09:45:00Z')
    },
    {
      fileType: 'draft_response',
      fileName: 'Amendment-Response-Draft-v1.docx',
      originalName: 'Amendment Response Draft - Initial Version.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      sizeBytes: 98432,
      version: 1,
      status: 'SUPERSEDED',
      description: 'Initial draft focusing on technical distinctions and lack of motivation to combine',
      tags: '["draft", "v1", "initial-arguments", "technical-focus"]',
      createdAt: new Date('2024-09-20T16:20:00Z')
    },
    {
      fileType: 'draft_response',
      fileName: 'Amendment-Response-Draft-v2.docx',
      originalName: 'Amendment Response Draft - Revised with Stronger Arguments.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      sizeBytes: 112567,
      version: 2,
      status: 'SUPERSEDED',
      description: 'Revised draft adding unexpected results arguments and strengthened claim amendments',
      tags: '["draft", "v2", "unexpected-results", "strengthened"]',
      createdAt: new Date('2024-09-23T13:30:00Z')
    },
    {
      fileType: 'draft_response',
      fileName: 'Amendment-Response-Final-v3.docx',
      originalName: 'Amendment Response - Final Version for Filing.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      sizeBytes: 125489,
      version: 3,
      status: 'ACTIVE',
      description: 'Final version with polished arguments, detailed claim amendments, and supporting evidence',
      tags: '["draft", "v3", "final", "ready-for-filing", "polished"]',
      createdAt: new Date('2024-09-25T10:15:00Z')
    },
    {
      fileType: 'export_version',
      fileName: 'Amendment-Response-USPTO-Format.docx',
      originalName: 'Amendment Response - USPTO Compliant Export.docx',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      sizeBytes: 125489,
      version: 1,
      status: 'ACTIVE',
      description: 'USPTO-formatted export ready for PAIR filing with proper headers and formatting',
      tags: '["export", "uspto-format", "pair-ready", "filing-version"]',
      exportedAt: new Date('2024-09-25T15:45:00Z'),
      createdAt: new Date('2024-09-25T15:45:00Z')
    }
  ]
};

async function seedCompleteAmendmentDemo() {
  try {
    console.log('🌱 Starting complete amendment workflow seeding...\n');

    // Check if data already exists
    const existingProject = await prisma.project.findFirst({
      where: { name: DEMO_DATA.project.name }
    });

    if (existingProject) {
      console.log('⚠️  Amendment demo data already exists. Skipping creation.');
      console.log(`   Found project: ${existingProject.name}`);
      return;
    }

    // Find tenant and user
    const tenant = await prisma.tenant.findFirst({
      where: { slug: 'ttest' }
    });

    if (!tenant) {
      throw new Error('❌ No tenant found with slug "ttest". Please run basic seeding first.');
    }

    const user = await prisma.user.findFirst({
      where: { tenantId: tenant.id }
    });

    if (!user) {
      throw new Error('❌ No user found for tenant. Please run basic seeding first.');
    }

    console.log(`🏢 Using tenant: ${tenant.name} (${tenant.slug})`);
    console.log(`👤 Using user: ${user.email}\n`);

    // Create everything in a transaction for data consistency
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the main project
      const project = await tx.project.create({
        data: {
          name: DEMO_DATA.project.name,
          textInput: DEMO_DATA.project.textInput,
          userId: user.id,
          tenantId: tenant.id,
          status: DEMO_DATA.project.status,
          hasPatentContent: true,
          hasProcessedInvention: true
        }
      });
      console.log(`📋 Created project: ${project.name}`);

      // 2. Create patent application record
      const patentApplication = await tx.patentApplication.create({
        data: {
          projectId: project.id,
          applicationNumber: DEMO_DATA.patentApplication.applicationNumber,
          filingDate: DEMO_DATA.patentApplication.filingDate,
          title: DEMO_DATA.patentApplication.title,
          inventors: JSON.stringify(DEMO_DATA.patentApplication.inventors),
          assignee: DEMO_DATA.patentApplication.assignee,
          artUnit: DEMO_DATA.patentApplication.artUnit,
          examinerName: DEMO_DATA.patentApplication.examinerName,
          examinerId: DEMO_DATA.patentApplication.examinerId,
          status: DEMO_DATA.patentApplication.status
        }
      });
      console.log(`📄 Created patent application: ${patentApplication.applicationNumber}`);

      // 3. Create office action
      const officeAction = await tx.officeAction.create({
        data: {
          projectId: project.id,
          tenantId: tenant.id,
          oaNumber: DEMO_DATA.officeAction.oaNumber,
          dateIssued: DEMO_DATA.officeAction.dateIssued,
          examinerId: DEMO_DATA.officeAction.examinerId,
          artUnit: DEMO_DATA.officeAction.artUnit,
          status: DEMO_DATA.officeAction.status,
          examinerRemarks: "Final Office Action containing 102 anticipation and 103 obviousness rejections. Claims 1, 3, 5 rejected under 102 over Anderson. Claims 2, 4, 6, 7 rejected under 103 over Anderson in view of Williams and Johnson."
        }
      });
      console.log(`🏛️ Created office action: ${officeAction.oaNumber}`);

      // 4. Create rejections
      const rejections = [];
      for (const rejectionData of DEMO_DATA.rejections) {
        const rejection = await tx.rejection.create({
          data: {
            officeActionId: officeAction.id,
            type: rejectionData.type,
            claimNumbers: JSON.stringify(rejectionData.claimNumbers),
            citedPriorArt: JSON.stringify(rejectionData.citedPriorArt),
            examinerText: rejectionData.examinerText,
            status: "PENDING",
            displayOrder: rejectionData.displayOrder
          }
        });
        rejections.push(rejection);
      }
      console.log(`⚖️ Created ${rejections.length} rejections`);

      // 5. Create amendment project
      const amendmentProject = await tx.amendmentProject.create({
        data: {
          officeActionId: officeAction.id,
          projectId: project.id,
          tenantId: tenant.id,
          userId: user.id,
          name: DEMO_DATA.amendmentResponse.name,
          status: 'DRAFT',
          dueDate: DEMO_DATA.amendmentResponse.dueDate,
          responseType: DEMO_DATA.amendmentResponse.responseType
        }
      });
      console.log(`📝 Created amendment project: ${amendmentProject.name}`);

      // 6. Create draft documents linked to amendment project
      const draftTypes = [
        {
          type: 'CLAIMS_AMENDMENTS',
          content: JSON.stringify(DEMO_DATA.amendmentResponse.claimAmendments)
        },
        {
          type: 'ARGUMENTS_SECTION',
          content: JSON.stringify(DEMO_DATA.amendmentResponse.argumentSections)
        },
        {
          type: 'AMENDMENT_SHELL',
          content: JSON.stringify({
            title: DEMO_DATA.amendmentResponse.name,
            responseType: DEMO_DATA.amendmentResponse.responseType,
            dueDate: DEMO_DATA.amendmentResponse.dueDate,
            strategy: "Focus on technical distinctions, lack of motivation to combine, and unexpected results from biometric integration"
          })
        }
      ];

      for (const draftData of draftTypes) {
        await tx.draftDocument.create({
          data: {
            projectId: project.id,
            amendmentProjectId: amendmentProject.id,
            type: draftData.type,
            content: draftData.content
          }
        });
      }
      console.log(`📄 Created ${draftTypes.length} draft documents`);

      // 7. Create amendment project file history
      let previousDraftFileId = null;
      for (const fileData of DEMO_DATA.fileHistory) {
        const amendmentFile = await tx.amendmentProjectFile.create({
          data: {
            amendmentProjectId: amendmentProject.id,
            tenantId: tenant.id,
            fileType: fileData.fileType,
            fileName: fileData.fileName,
            originalName: fileData.originalName,
            mimeType: fileData.mimeType,
            sizeBytes: fileData.sizeBytes,
            version: fileData.version,
            status: fileData.status,
            description: fileData.description,
            tags: fileData.tags,
            uploadedBy: user.id,
            exportedAt: fileData.exportedAt || null,
            parentFileId: (fileData.fileType === 'draft_response' && fileData.version > 1) ? previousDraftFileId : null,
            createdAt: fileData.createdAt,
            updatedAt: fileData.createdAt,
          },
        });

        // Track draft file IDs for version chaining
        if (fileData.fileType === 'draft_response') {
          previousDraftFileId = amendmentFile.id;
        }
      }
      console.log(`📁 Created ${DEMO_DATA.fileHistory.length} file history records`);

      // 8. Create saved prior art references
      for (const priorArtData of DEMO_DATA.savedPriorArt) {
        await tx.savedPriorArt.create({
          data: {
            projectId: project.id,
            patentNumber: priorArtData.patentNumber,
            title: priorArtData.title,
            abstract: priorArtData.abstract,
            notes: priorArtData.notes,
            authors: priorArtData.authors,
            publicationDate: priorArtData.publicationDate,
            claim1: priorArtData.claim1,
            summary: priorArtData.summary,
            fileType: 'cited-reference',
            isLinked: true
          }
        });
      }
      console.log(`📚 Created ${DEMO_DATA.savedPriorArt.length} prior art references`);

      return {
        project,
        patentApplication,
        officeAction,
        amendmentProject,
        rejectionCount: rejections.length,
        fileHistoryCount: DEMO_DATA.fileHistory.length,
        priorArtCount: DEMO_DATA.savedPriorArt.length
      };
    });

    console.log('\n🎉 Amendment workflow seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Project: ${result.project.name}`);
    console.log(`   Patent Application: ${DEMO_DATA.patentApplication.applicationNumber}`);
    console.log(`   Office Action: ${DEMO_DATA.officeAction.oaNumber}`);
    console.log(`   Amendment Project: ${result.amendmentProject.name}`);
    console.log(`   Rejections: ${result.rejectionCount}`);
    console.log(`   File History: ${result.fileHistoryCount} files`);
    console.log(`   Prior Art: ${result.priorArtCount} references`);
    console.log('\n🚀 Ready to demo! Navigate to the Amendment Studio to see the complete workflow.');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
if (require.main === module) {
  seedCompleteAmendmentDemo()
    .catch((e) => {
      console.error('❌ Seeding failed:', e);
      process.exit(1);
    });
}

module.exports = { seedCompleteAmendmentDemo }; 