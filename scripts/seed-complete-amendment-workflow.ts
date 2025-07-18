import { PrismaClient } from '@prisma/client';
import { ApplicationError, ErrorCode } from '../src/lib/error';
import { logger } from '../src/server/logger';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Test tenant slug to populate
const TEST_TENANT_SLUG = process.env.SEED_TENANT_SLUG || 'ttest';

// Comprehensive amendment workflow data
const AMENDMENT_WORKFLOW_DATA = {
  project: {
    name: 'AI-Powered Robotic Assembly System - Complete Amendment Workflow',
    textInput: 'Amendment project for responding to USPTO Office Actions regarding an AI-powered robotic assembly system with machine learning optimization and computer vision quality control.',
    status: 'in_progress'
  },
  patentApplication: {
    applicationNumber: '18/345,678',
    filingDate: new Date('2023-06-20'),
    title: 'AI-Powered Robotic Assembly System with Adaptive Control',
    inventors: ['Michael Johnson', 'Sarah Chen', 'David Rodriguez'],
    assignee: 'TechnoRobotics Corp.',
    artUnit: '3651',
    examinerName: 'John K. Smith',
    examinerId: 'SMITH, JOHN K',
    status: 'PENDING'
  },
  originalClaims: [
    {
      number: 1,
      text: 'A robotic assembly system comprising: a multi-axis robotic arm; an adaptive gripping mechanism configured to handle multiple component types; a machine learning controller configured to optimize assembly sequences based on production data; and a computer vision system for real-time quality inspection.'
    },
    {
      number: 2,
      text: 'The robotic assembly system of claim 1, wherein the adaptive gripping mechanism includes force sensors that provide feedback to prevent component damage during assembly operations.'
    },
    {
      number: 3,
      text: 'The robotic assembly system of claim 1, wherein the machine learning controller implements reinforcement learning algorithms to continuously improve assembly cycle times.'
    },
    {
      number: 4,
      text: 'The robotic assembly system of claim 1, wherein the computer vision system utilizes convolutional neural networks to detect assembly defects in real-time.'
    },
    {
      number: 5,
      text: 'The robotic assembly system of claim 1, further comprising a predictive maintenance module that monitors system components and schedules maintenance based on usage patterns.'
    }
  ],
  officeAction: {
    oaNumber: 'Non-Final Office Action',
    dateIssued: new Date('2024-09-15'),
    examinerId: 'SMITH, JOHN K',
    artUnit: '3651',
    originalFileName: 'Office Action - September 15, 2024.pdf',
    extractedText: `UNITED STATES PATENT AND TRADEMARK OFFICE

OFFICE ACTION

Application No.: 18/345,678
Filing Date: June 20, 2023
First Named Inventor: Michael Johnson
Art Unit: 3651
Examiner: John K. Smith

DETAILED ACTION

Claims 1-5 are pending in the application.

Claim Rejections - 35 U.S.C. § 102

Claims 1, 2, and 5 are rejected under 35 U.S.C. § 102(a)(1) as being anticipated by US Patent No. 10,567,890 B2 to Anderson et al. ("Anderson").

Anderson discloses a robotic assembly system (col. 3, lines 10-25) comprising a multi-axis robotic arm (col. 4, lines 5-15), an adaptive gripping mechanism (col. 5, lines 20-35) configured to handle multiple component types, and force sensors providing feedback (col. 6, lines 10-20) as claimed. Anderson further discloses predictive maintenance capabilities (col. 8, lines 5-15) as recited in claim 5.

Claim Rejections - 35 U.S.C. § 103

Claims 3 and 4 are rejected under 35 U.S.C. § 103 as being unpatentable over Anderson in view of US Patent Publication No. 2021/0123456 A1 to Williams ("Williams").

Anderson discloses the robotic assembly system as discussed above. Williams discloses machine learning controllers implementing reinforcement learning algorithms (para. [0045]-[0052]) and computer vision systems utilizing convolutional neural networks (para. [0063]-[0071]). It would have been obvious to combine the teachings to improve assembly efficiency as suggested by Williams.

Any inquiry concerning this communication should be directed to the undersigned.

/John K. Smith/
Primary Examiner, Art Unit 3651`,
    parsedJson: {
      metadata: {
        applicationNumber: '18/345,678',
        mailingDate: '2024-09-15',
        examinerName: 'John K. Smith',
        artUnit: '3651'
      },
      rejections: [
        {
          id: 'rej1',
          type: '102',
          claims: ['1', '2', '5'],
          priorArtReferences: ['US10567890B2'],
          examinerReasoning: 'Anderson discloses a robotic assembly system comprising a multi-axis robotic arm, adaptive gripping mechanism configured to handle multiple component types, and force sensors providing feedback as claimed. Anderson further discloses predictive maintenance capabilities as recited in claim 5.',
          rawText: 'Claims 1, 2, and 5 are rejected under 35 U.S.C. § 102(a)(1) as being anticipated by US Patent No. 10,567,890 B2 to Anderson et al.'
        },
        {
          id: 'rej2', 
          type: '103',
          claims: ['3', '4'],
          priorArtReferences: ['US10567890B2', 'US20210123456A1'],
          examinerReasoning: 'Anderson discloses the robotic assembly system as discussed above. Williams discloses machine learning controllers implementing reinforcement learning algorithms and computer vision systems utilizing convolutional neural networks. It would have been obvious to combine the teachings to improve assembly efficiency.',
          rawText: 'Claims 3 and 4 are rejected under 35 U.S.C. § 103 as being unpatentable over Anderson in view of US Patent Publication No. 2021/0123456 A1 to Williams.'
        }
      ],
      allPriorArtReferences: ['US10567890B2', 'US20210123456A1'],
      summary: {
        totalRejections: 2,
        rejectionTypes: ['102', '103'],
        totalClaimsRejected: 5,
        uniquePriorArtCount: 2
      }
    },
    examinerRemarks: 'The Office Action presents anticipation rejections under §102 for claims 1, 2, and 5 based on Anderson, and obviousness rejections under §103 for claims 3 and 4 based on Anderson combined with Williams. Key issues include distinguishing the ML-specific features from general robotic control and demonstrating unexpected advantages of the integrated approach.'
  },
  rejections: [
    {
      type: '102',
      claimNumbers: ['1', '2', '5'],
      citedPriorArt: ['US10567890B2'],
      examinerText: 'Anderson discloses a robotic assembly system (col. 3, lines 10-25) comprising a multi-axis robotic arm (col. 4, lines 5-15), an adaptive gripping mechanism (col. 5, lines 20-35) configured to handle multiple component types, and force sensors providing feedback (col. 6, lines 10-20) as claimed. Anderson further discloses predictive maintenance capabilities (col. 8, lines 5-15) as recited in claim 5.',
      displayOrder: 1,
      analysis: {
        strengthScore: 0.75,
        suggestedStrategy: 'AMEND',
        reasoning: 'Anderson shows similar hardware but lacks the specific machine learning optimization aspects. Consider amending to emphasize the learning algorithms and data-driven optimization that distinguish over Anderson\'s rule-based system.',
        confidenceScore: 0.8
      }
    },
    {
      type: '103',
      claimNumbers: ['3', '4'],
      citedPriorArt: ['US10567890B2', 'US20210123456A1'],
      examinerText: 'Anderson discloses the robotic assembly system as discussed above. Williams discloses machine learning controllers implementing reinforcement learning algorithms (para. [0045]-[0052]) and computer vision systems utilizing convolutional neural networks (para. [0063]-[0071]). It would have been obvious to combine the teachings to improve assembly efficiency as suggested by Williams.',
      displayOrder: 2,
      analysis: {
        strengthScore: 0.65,
        suggestedStrategy: 'ARGUE',
        reasoning: 'While Williams shows ML techniques, there\'s no motivation to combine with Anderson\'s specific assembly system. The synergistic effect of integrated ML with assembly-specific sensors creates unexpected advantages that should be argued.',
        confidenceScore: 0.7
      }
    }
  ],
  amendmentResponse: {
    name: 'Response to Non-Final Office Action - September 15, 2024',
    responseType: 'AMENDMENT',
    dueDate: new Date('2024-12-15'), // 3 months from OA date
    claimAmendments: [
      {
        claimNumber: '1',
        status: 'CURRENTLY_AMENDED',
        originalText: 'A robotic assembly system comprising: a multi-axis robotic arm; an adaptive gripping mechanism configured to handle multiple component types; a machine learning controller configured to optimize assembly sequences based on production data; and a computer vision system for real-time quality inspection.',
        amendedText: 'A robotic assembly system comprising: a multi-axis robotic arm; an adaptive gripping mechanism configured to handle multiple component types; [a machine learning controller configured to optimize assembly sequences based on production data using reinforcement learning algorithms that continuously learn from assembly performance metrics to achieve cycle time improvements of at least 15% over rule-based control systems]; and a computer vision system for real-time quality inspection.',
        reasoning: 'Amended to emphasize the specific reinforcement learning approach and quantifiable performance benefits that distinguish over Anderson\'s rule-based system.'
      },
      {
        claimNumber: '3',
        status: 'CURRENTLY_AMENDED', 
        originalText: 'The robotic assembly system of claim 1, wherein the machine learning controller implements reinforcement learning algorithms to continuously improve assembly cycle times.',
        amendedText: 'The robotic assembly system of claim 1, wherein the machine learning controller implements reinforcement learning algorithms [that process real-time sensor feedback from the adaptive gripping mechanism] to continuously improve assembly cycle times [based on component-specific optimization parameters].',
        reasoning: 'Amended to highlight the synergistic integration of ML with assembly-specific sensors, creating a technical effect not suggested by the combination of Anderson and Williams.'
      }
    ],
    argumentSections: [
      {
        rejectionId: 'rej1',
        title: 'Response to 35 U.S.C. § 102 Rejection',
        content: `Claims 1, 2, and 5 are patentable over Anderson for at least the following reasons:

While Anderson discloses a robotic assembly system with adaptive gripping, Anderson fails to disclose or suggest the specific machine learning controller that optimizes assembly sequences based on production data using reinforcement learning algorithms as now claimed.

Specifically, Anderson's system uses predetermined rule-based adaptation (col. 5, lines 10-15) which is fundamentally different from the claimed reinforcement learning approach that continuously learns from performance metrics. Anderson's system cannot achieve the claimed cycle time improvements of at least 15% because it lacks the learning capabilities that enable optimization based on accumulated production data.

Furthermore, the amended claims now recite the synergistic integration of reinforcement learning with assembly-specific sensor feedback, creating a technical effect not disclosed by Anderson.`
      },
      {
        rejectionId: 'rej2',
        title: 'Response to 35 U.S.C. § 103 Rejection', 
        content: `Claims 3 and 4 are patentable over the combination of Anderson and Williams for at least the following reasons:

1. Lack of Motivation to Combine: Anderson and Williams are from different technical fields with no suggestion in either reference that they should be combined. Anderson focuses on mechanical assembly systems while Williams addresses general robotic control without any reference to assembly-specific applications.

2. Synergistic Effect: The amended claims recite processing real-time sensor feedback from the adaptive gripping mechanism with reinforcement learning algorithms based on component-specific optimization parameters. This creates a synergistic effect not suggested by either reference alone.

The combination of Anderson's assembly hardware with Williams' general ML techniques would not render obvious the specific integration claimed, which achieves unexpected advantages in assembly precision and cycle time optimization.`
      }
    ]
  },
  savedPriorArt: [
    {
      patentNumber: 'US10567890B2',
      title: 'Adaptive Robotic Assembly System',
      abstract: 'A robotic assembly system comprising a multi-degree-of-freedom robotic arm, adaptive control algorithms for optimizing assembly operations, and sensors for monitoring assembly quality.',
      notes: 'Primary § 102 reference. Shows similar mechanical system but uses rule-based control, not ML. Key distinction: our RL algorithms vs. their predetermined rules.',
      authors: 'Anderson, Robert J.; Smith, Mary K.',
      publicationDate: '2019-03-26',
      claim1: '1. A robotic assembly system comprising: a multi-degree-of-freedom robotic arm; a control system configured to adapt assembly operations based on component characteristics; and sensors for monitoring assembly operations.',
      summary: 'Rule-based adaptive system without learning capabilities. Amendments should emphasize ML learning and performance optimization aspects.'
    },
    {
      patentNumber: 'US20210123456A1',
      title: 'Machine Learning Robot Controller',
      abstract: 'Methods and systems for controlling robotic operations using machine learning algorithms, including reinforcement learning for optimizing task performance.',
      notes: 'Secondary § 103 reference. Shows general ML for robotics but not assembly-specific integration. Focus on synergistic combination arguments.',
      authors: 'Williams, David L.; Jones, Sarah M.',
      publicationDate: '2021-04-29',
      claim1: '1. A method of controlling a robotic system comprising: implementing reinforcement learning algorithms to optimize robotic task performance; and utilizing neural networks for pattern recognition during robotic operations.',
      summary: 'General robotic ML without assembly integration. No motivation to combine with Anderson\'s specific mechanical system.'
    }
  ]
};

async function seedCompleteAmendmentWorkflow() {
  try {
    console.log('🌱 Starting complete amendment workflow seeding...');
    
    // Find the test tenant
    const tenant = await prisma.tenant.findUnique({
      where: { slug: TEST_TENANT_SLUG }
    });

    if (!tenant) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        `Test tenant with slug "${TEST_TENANT_SLUG}" not found.`
      );
    }

    console.log(`🏢 Found tenant: ${tenant.name} (${tenant.slug})`);

    // Find admin user for this tenant
    const userTenant = await prisma.userTenant.findFirst({
      where: { tenantId: tenant.id, role: 'ADMIN' },
      include: { user: true }
    });

    if (!userTenant) {
      throw new ApplicationError(
        ErrorCode.DB_RECORD_NOT_FOUND,
        `No admin user found for tenant "${TEST_TENANT_SLUG}"`
      );
    }

    const user = userTenant.user;
    console.log(`👤 Using admin user: ${user.email}`);

    // Check if workflow already exists
    const existingProject = await prisma.project.findFirst({
      where: {
        name: AMENDMENT_WORKFLOW_DATA.project.name,
        tenantId: tenant.id
      }
    });

    if (existingProject) {
      console.log(`📋 Amendment workflow already exists. Skipping creation.`);
      return;
    }

    // Create complete amendment workflow in transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the project
      const project = await tx.project.create({
        data: {
          name: AMENDMENT_WORKFLOW_DATA.project.name,
          textInput: AMENDMENT_WORKFLOW_DATA.project.textInput,
          userId: user.id,
          tenantId: tenant.id,
          status: AMENDMENT_WORKFLOW_DATA.project.status,
          hasPatentContent: true,
          hasProcessedInvention: false
        }
      });

      console.log(`📋 Created project: ${project.name}`);

      // 2. Create patent application entity
      const patentApplication = await tx.patentApplication.create({
        data: {
          projectId: project.id,
          applicationNumber: AMENDMENT_WORKFLOW_DATA.patentApplication.applicationNumber,
          filingDate: AMENDMENT_WORKFLOW_DATA.patentApplication.filingDate,
          title: AMENDMENT_WORKFLOW_DATA.patentApplication.title,
          inventors: JSON.stringify(AMENDMENT_WORKFLOW_DATA.patentApplication.inventors),
          assignee: AMENDMENT_WORKFLOW_DATA.patentApplication.assignee,
          artUnit: AMENDMENT_WORKFLOW_DATA.patentApplication.artUnit,
          examinerName: AMENDMENT_WORKFLOW_DATA.patentApplication.examinerName,
          examinerId: AMENDMENT_WORKFLOW_DATA.patentApplication.examinerId,
          status: AMENDMENT_WORKFLOW_DATA.patentApplication.status
        }
      });

      console.log(`📄 Created patent application: ${patentApplication.applicationNumber}`);

      // 3. Create original claim version
      const originalClaimVersion = await tx.patentClaimVersion.create({
        data: {
          applicationId: patentApplication.id,
          versionNumber: 1,
          status: 'ACTIVE',
          effectiveDate: AMENDMENT_WORKFLOW_DATA.patentApplication.filingDate,
          source: 'INITIAL_FILING',
          claimsJson: JSON.stringify(AMENDMENT_WORKFLOW_DATA.originalClaims),
          claim1Hash: 'initial-filing-hash-abc123'
        }
      });

      console.log(`📝 Created original claim version`);

      // 4. Create office action
      const officeAction = await tx.officeAction.create({
        data: {
          projectId: project.id,
          tenantId: tenant.id,
          oaNumber: AMENDMENT_WORKFLOW_DATA.officeAction.oaNumber,
          dateIssued: AMENDMENT_WORKFLOW_DATA.officeAction.dateIssued,
          examinerId: AMENDMENT_WORKFLOW_DATA.officeAction.examinerId,
          artUnit: AMENDMENT_WORKFLOW_DATA.officeAction.artUnit,
          originalFileName: AMENDMENT_WORKFLOW_DATA.officeAction.originalFileName,
          blobName: `oa-blob-${uuidv4()}`,
          mimeType: 'application/pdf',
          sizeBytes: 2048000,
          extractedText: AMENDMENT_WORKFLOW_DATA.officeAction.extractedText,
          parsedJson: JSON.stringify(AMENDMENT_WORKFLOW_DATA.officeAction.parsedJson),
          examinerRemarks: AMENDMENT_WORKFLOW_DATA.officeAction.examinerRemarks,
          status: 'COMPLETED'
        }
      });

      console.log(`📋 Created office action: ${officeAction.oaNumber}`);

      // 5. Create rejections with analysis
      const rejections = [];
      for (const rejectionData of AMENDMENT_WORKFLOW_DATA.rejections) {
        const rejection = await tx.rejection.create({
          data: {
            officeActionId: officeAction.id,
            type: rejectionData.type,
            claimNumbers: JSON.stringify(rejectionData.claimNumbers),
            citedPriorArt: JSON.stringify(rejectionData.citedPriorArt),
            examinerText: rejectionData.examinerText,
            displayOrder: rejectionData.displayOrder,
            status: 'PENDING'
          }
        });

        // Create analysis result for this rejection
        await tx.rejectionAnalysisResult.create({
          data: {
            rejectionId: rejection.id,
            officeActionId: officeAction.id,
            analysisType: 'STRENGTH_ASSESSMENT',
            strengthScore: rejectionData.analysis.strengthScore,
            suggestedStrategy: rejectionData.analysis.suggestedStrategy,
            reasoning: rejectionData.analysis.reasoning,
            confidenceScore: rejectionData.analysis.confidenceScore,
            modelVersion: 'gpt-4-1106-preview',
            agentVersion: 'v2.1',
            model: 'gpt-4'
          }
        });

        rejections.push(rejection);
      }

      console.log(`⚖️ Created ${rejections.length} rejections with AI analysis`);

      // 6. Create office action summary
      await tx.officeActionSummary.create({
        data: {
          officeActionId: officeAction.id,
          summaryText: AMENDMENT_WORKFLOW_DATA.officeAction.examinerRemarks,
          keyIssues: JSON.stringify(['§102 anticipation by Anderson', '§103 obviousness with Williams', 'ML vs rule-based distinction needed']),
          rejectionBreakdown: JSON.stringify({ '102': 1, '103': 1 }),
          totalClaimsRejected: 5,
          allowedClaims: JSON.stringify([]),
          strategyHint: 'Focus on ML learning capabilities vs rule-based systems; argue lack of motivation for §103 combination',
          examinerTone: 'NEUTRAL',
          responseComplexity: 'MEDIUM',
          num102Rejections: 1,
          num103Rejections: 1,
          num101Rejections: 0,
          num112Rejections: 0,
          numOtherRejections: 0
        }
      });

      console.log(`📊 Created office action summary`);

      // 7. Create strategy recommendation
      await tx.strategyRecommendation.create({
        data: {
          officeActionId: officeAction.id,
          applicationId: patentApplication.id,
          overallStrategy: 'MIXED_APPROACH',
          priorityActions: JSON.stringify([
            'Amend claim 1 to emphasize RL learning vs rule-based',
            'Argue lack of motivation for §103 combination',
            'Highlight synergistic effects of ML integration'
          ]),
          estimatedDifficulty: 'MEDIUM',
          successProbability: 0.75,
          reasoning: 'Strong position on distinguishing ML from rule-based systems. Good arguments available for lack of motivation to combine references.'
        }
      });

      console.log(`🎯 Created strategy recommendation`);

      // 8. Create amendment project
      const amendmentProject = await tx.amendmentProject.create({
        data: {
          officeActionId: officeAction.id,
          projectId: project.id,
          tenantId: tenant.id,
          userId: user.id,
          name: AMENDMENT_WORKFLOW_DATA.amendmentResponse.name,
          status: 'DRAFT',
          dueDate: AMENDMENT_WORKFLOW_DATA.amendmentResponse.dueDate,
          responseType: AMENDMENT_WORKFLOW_DATA.amendmentResponse.responseType
        }
      });

      console.log(`📝 Created amendment project: ${amendmentProject.name}`);

      // 9. Create amendment draft documents
      const amendmentDrafts = [
        {
          type: 'AMENDMENT_SHELL',
          content: `AMENDMENT

In response to the Office Action dated September 15, 2024, Applicant respectfully submits the following amendments and arguments.

CLAIMS

Please amend the claims as follows:

${AMENDMENT_WORKFLOW_DATA.amendmentResponse.claimAmendments.map(ca => 
  `${ca.claimNumber}. (${ca.status}) ${ca.amendedText}`
).join('\n\n')}

REMARKS

${AMENDMENT_WORKFLOW_DATA.amendmentResponse.argumentSections.map(arg => arg.content).join('\n\n')}`
        },
        {
          type: 'CLAIMS_AMENDMENTS',
          content: JSON.stringify(AMENDMENT_WORKFLOW_DATA.amendmentResponse.claimAmendments)
        },
        {
          type: 'ARGUMENTS_SECTION',
          content: JSON.stringify(AMENDMENT_WORKFLOW_DATA.amendmentResponse.argumentSections)
        },
        {
          type: 'STRATEGY_NOTES',
          content: 'Amendment strategy focuses on distinguishing ML learning capabilities from Anderson\'s rule-based system and arguing lack of motivation to combine Anderson with Williams.'
        }
      ];

      for (const draftData of amendmentDrafts) {
        await tx.draftDocument.create({
          data: {
            projectId: project.id,
            amendmentProjectId: amendmentProject.id, // Link to amendment project
            type: draftData.type,
            content: draftData.content
          }
        });
      }

      console.log(`📄 Created ${amendmentDrafts.length} amendment draft documents`);

      // 10. Create amended claim version
      const amendedClaimVersion = await tx.patentClaimVersion.create({
        data: {
          applicationId: patentApplication.id,
          officeActionId: officeAction.id,
          versionNumber: 2,
          status: 'ACTIVE',
          effectiveDate: new Date(),
          source: 'AMENDMENT',
          claimsJson: JSON.stringify(AMENDMENT_WORKFLOW_DATA.amendmentResponse.claimAmendments),
          claim1Hash: 'amended-hash-def456'
        }
      });

      console.log(`📝 Created amended claim version`);

      // 11. Create saved prior art
      for (const priorArtData of AMENDMENT_WORKFLOW_DATA.savedPriorArt) {
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

      console.log(`📚 Created ${AMENDMENT_WORKFLOW_DATA.savedPriorArt.length} prior art references`);

      return {
        project,
        patentApplication,
        officeAction,
        amendmentProject,
        rejectionCount: rejections.length,
        claimVersions: 2
      };
    });

    console.log('✅ Complete amendment workflow seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Project: ${result.project.name}`);
    console.log(`   - Patent Application: ${result.patentApplication.applicationNumber}`);
    console.log(`   - Office Action: ${result.officeAction.oaNumber}`);
    console.log(`   - Amendment Project: ${result.amendmentProject.name}`);
    console.log(`   - Rejections: ${result.rejectionCount} with AI analysis`);
    console.log(`   - Claim Versions: ${result.claimVersions} (original + amended)`);
    console.log(`   - Prior Art References: ${AMENDMENT_WORKFLOW_DATA.savedPriorArt.length}`);
    
    console.log('\n🎉 Your test tenant now has a complete amendment workflow!');
    console.log('✅ Includes: Office Action → Rejections → AI Analysis → Amendment Response → Claim Versions');
    console.log('🔧 You can now test the full amendment builder functionality!');

  } catch (error) {
    console.error('❌ Error seeding amendment workflow:', error);
    
    if (error instanceof ApplicationError) {
      console.error(`Application Error [${error.code}]: ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedCompleteAmendmentWorkflow(); 