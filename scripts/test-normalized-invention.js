// Test script to demonstrate normalized invention data
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestProject() {
  console.log('Creating test project...');

  // Create a test user and tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Test Company',
      slug: 'test-company',
    },
  });

  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });

  await prisma.userTenant.create({
    data: {
      userId: user.id,
      tenantId: tenant.id,
      role: 'USER',
    },
  });

  // Create a project
  const project = await prisma.project.create({
    data: {
      name: 'Smart Home Security System',
      userId: user.id,
      tenantId: tenant.id,
      textInput:
        'A smart home security system that uses AI to detect intruders...',
      status: 'DRAFT',
    },
  });

  console.log('Created project:', project.id);

  // Create invention data using normalized structure
  const invention = await prisma.invention.create({
    data: {
      projectId: project.id,
      title: 'AI-Powered Smart Home Security System',
      shortDescription:
        'An intelligent security system that uses computer vision and machine learning',
      abstract:
        'The present invention relates to a smart home security system that employs artificial intelligence, specifically computer vision and machine learning algorithms, to provide enhanced security monitoring. The system can distinguish between authorized persons, visitors, and potential intruders.',
      technicalField: 'Computer Software',
      subField: 'Artificial Intelligence',
      problemStatement:
        'Traditional home security systems generate too many false alarms and cannot distinguish between family members, pets, and actual threats.',
      solutionSummary:
        'Our system uses advanced AI algorithms to learn and recognize authorized individuals, reducing false alarms by 90% while improving threat detection accuracy.',
      noveltyStatement:
        'First system to combine facial recognition, behavior analysis, and contextual awareness in a unified home security platform.',
      inventiveStep:
        'The combination of multiple AI models with real-time learning capabilities represents a non-obvious advancement over existing systems.',
      industrialApplication:
        'Applicable to residential security, commercial building access control, and assisted living facilities.',
      inventionType: 'system',
      developmentStage: 'prototype',
    },
  });

  // Create technical details
  await prisma.technicalDetails.create({
    data: {
      projectId: project.id,
      systemArchitecture:
        'Cloud-based microservices architecture with edge computing on local devices',
      keyAlgorithms:
        'YOLO v8 for object detection, FaceNet for facial recognition, LSTM for behavior prediction',
      performanceMetrics:
        'Detection accuracy: 98.5%, False positive rate: < 2%, Response time: < 100ms',
      technologyStack: 'Python, TensorFlow, React, Node.js, AWS',
    },
  });

  // Create components
  const components = await Promise.all([
    prisma.inventionComponent.create({
      data: {
        projectId: project.id,
        referenceNumber: '100',
        name: 'Central Processing Unit',
        description:
          'Main AI processing unit that runs the detection algorithms',
        function: 'Processes video streams and makes security decisions',
        componentType: 'hardware',
        isCritical: true,
        orderIndex: 0,
      },
    }),
    prisma.inventionComponent.create({
      data: {
        projectId: project.id,
        referenceNumber: '102',
        name: 'Camera Array',
        description: 'Multiple high-resolution cameras with night vision',
        function: 'Captures video footage for analysis',
        componentType: 'hardware',
        isCritical: true,
        orderIndex: 1,
      },
    }),
    prisma.inventionComponent.create({
      data: {
        projectId: project.id,
        referenceNumber: '200',
        name: 'AI Detection Module',
        description: 'Software module implementing the core AI algorithms',
        function: 'Analyzes video streams to detect and classify objects',
        componentType: 'software',
        isCritical: true,
        orderIndex: 2,
      },
    }),
  ]);

  // Create advantages
  await Promise.all([
    prisma.inventionAdvantage.create({
      data: {
        projectId: project.id,
        title: 'Reduced False Alarms',
        description:
          'System reduces false alarms by 90% compared to traditional motion-based systems',
        category: 'performance',
        comparedTo: 'Traditional PIR motion sensors',
        improvementMetric: '90% reduction',
        priority: 10,
        orderIndex: 0,
      },
    }),
    prisma.inventionAdvantage.create({
      data: {
        projectId: project.id,
        title: 'Self-Learning Capability',
        description: 'System learns and adapts to household patterns over time',
        category: 'usability',
        priority: 8,
        orderIndex: 1,
      },
    }),
  ]);

  // Create an example
  await prisma.inventionExample.create({
    data: {
      projectId: project.id,
      title: 'Package Delivery Detection',
      description: 'System recognizes delivery personnel and alerts homeowner',
      exampleType: 'use_case',
      scenario: 'A delivery person approaches the front door',
      implementation:
        'AI recognizes uniform, detects package, and sends notification',
      results: 'Homeowner receives real-time alert with video clip',
      orderIndex: 0,
    },
  });

  console.log('Successfully created all normalized invention data!');

  // Now retrieve and display the data
  const fullProject = await prisma.project.findUnique({
    where: { id: project.id },
    include: {
      invention: true,
      technicalDetails: true,
      inventionComponents: {
        orderBy: { orderIndex: 'asc' },
      },
      inventionAdvantages: {
        orderBy: { priority: 'desc' },
      },
      inventionExamples: true,
    },
  });

  console.log('\n=== Retrieved Project Data ===');
  console.log('Project:', fullProject.name);
  console.log('Invention Title:', fullProject.invention?.title);
  console.log('Technical Field:', fullProject.invention?.technicalField);
  console.log('Components:', fullProject.inventionComponents.length);
  console.log('Advantages:', fullProject.inventionAdvantages.length);

  return project.id;
}

async function main() {
  try {
    const projectId = await createTestProject();
    console.log('\n✅ Test completed successfully!');
    console.log('Project ID:', projectId);
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
