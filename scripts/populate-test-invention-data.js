// Script to populate test invention data for an existing project
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function populateInventionData(projectId) {
  console.log(`Populating invention data for project: ${projectId}`);

  try {
    // Create invention data using normalized structure
    const invention = await prisma.invention.create({
      data: {
        projectId: projectId,
        title: 'AI-Powered Smart Home Security System',
        shortDescription:
          'An intelligent security system that uses computer vision and machine learning to distinguish between authorized persons and potential threats',
        abstract:
          'The present invention relates to a smart home security system that employs artificial intelligence, specifically computer vision and machine learning algorithms, to provide enhanced security monitoring. The system uses multiple high-resolution cameras with night vision capabilities to capture video footage, which is then processed by advanced AI algorithms including YOLO v8 for object detection and FaceNet for facial recognition. The system can distinguish between authorized persons, visitors, and potential intruders, reducing false alarms by up to 90% compared to traditional motion-based systems.',
        technicalField: 'Computer Software',
        subField: 'Artificial Intelligence / Computer Vision',
        problemStatement:
          'Traditional home security systems generate too many false alarms and cannot distinguish between family members, pets, and actual threats. This leads to user fatigue and reduced effectiveness of the security system.',
        solutionSummary:
          'Our system uses advanced AI algorithms to learn and recognize authorized individuals, reducing false alarms by 90% while improving threat detection accuracy. The system continuously learns and adapts to household patterns.',
        background:
          'Home security systems have evolved from simple motion detectors to more sophisticated surveillance systems. However, existing systems still suffer from high false alarm rates, inability to distinguish between different types of motion, and lack of intelligent threat assessment.',
        detailedDescription:
          'The smart home security system comprises multiple components working in concert to provide comprehensive security coverage. The system utilizes a distributed architecture with edge computing capabilities on local devices and cloud-based processing for more complex analysis. Video streams from multiple cameras are processed in real-time using state-of-the-art computer vision algorithms.',
        briefDescription:
          'FIG. 1 shows the overall system architecture; FIG. 2 illustrates the camera array configuration; FIG. 3 depicts the AI processing pipeline; FIG. 4 shows the user interface dashboard.',
        noveltyStatement:
          'This is the first system to combine facial recognition, behavior analysis, and contextual awareness in a unified home security platform with continuous learning capabilities.',
        inventiveStep:
          'The combination of multiple AI models with real-time learning capabilities and edge computing represents a non-obvious advancement over existing systems.',
        industrialApplication:
          'Applicable to residential security, commercial building access control, assisted living facilities, and smart city infrastructure.',
        inventionType: 'system',
        developmentStage: 'prototype',
      },
    });

    console.log('Created invention:', invention.title);

    // Create technical details
    await prisma.technicalDetails.create({
      data: {
        projectId: projectId,
        systemArchitecture:
          'The system employs a hybrid cloud-edge architecture. Edge devices (Raspberry Pi 4 or NVIDIA Jetson) handle real-time video processing and immediate threat detection. Cloud services (AWS) provide advanced analytics, long-term storage, and model training.',
        keyAlgorithms:
          'YOLO v8 for real-time object detection (persons, vehicles, packages); FaceNet for facial recognition and verification; LSTM neural networks for behavior pattern prediction; Kalman filters for object tracking; Background subtraction for motion detection',
        dataFlow:
          'Video streams → Edge preprocessing → AI inference → Decision engine → Alert system → Cloud sync → Analytics dashboard',
        performanceMetrics:
          'Detection accuracy: 98.5%, False positive rate: < 2%, Response time: < 100ms for edge detection, < 500ms for cloud verification, System uptime: 99.9%',
        systemRequirements:
          'Minimum 4GB RAM per edge device, NVIDIA GPU recommended for optimal performance, Gigabit ethernet or WiFi 6 connectivity, Cloud storage: 1TB per month per camera',
        constraints:
          'Limited by internet bandwidth for cloud features, Requires good lighting for optimal facial recognition, Privacy regulations may limit data retention',
        implementationNotes:
          'Use Docker containers for easy deployment, Implement redundant edge devices for high availability, Regular model retraining recommended (monthly)',
        technologyStack:
          'Python 3.9+, TensorFlow 2.x, OpenCV 4.x, React 18 (frontend), Node.js 18+ (backend), PostgreSQL 14+, Redis for caching, MQTT for IoT communication, AWS S3 for storage',
        dependencies:
          'tensorflow==2.11.0, opencv-python==4.7.0, face-recognition==1.3.0, numpy==1.24.0, fastapi==0.95.0',
      },
    });

    // Create components
    const components = await Promise.all([
      prisma.inventionComponent.create({
        data: {
          projectId: projectId,
          referenceNumber: '100',
          name: 'Central Processing Unit',
          description:
            'Main AI processing unit that runs the detection algorithms and coordinates all system components',
          function:
            'Processes video streams, runs AI models, makes security decisions, and manages system operations',
          componentType: 'hardware',
          isCritical: true,
          alternatives:
            'Can use Raspberry Pi 4, NVIDIA Jetson Nano, or Intel NUC depending on performance requirements',
          orderIndex: 0,
        },
      }),
      prisma.inventionComponent.create({
        data: {
          projectId: projectId,
          referenceNumber: '102',
          name: 'Camera Array',
          description:
            'Multiple high-resolution cameras with night vision capabilities strategically placed around the property',
          function:
            'Captures video footage for analysis, provides coverage of all entry points and critical areas',
          componentType: 'hardware',
          isCritical: true,
          alternatives:
            'Compatible with most IP cameras supporting RTSP protocol',
          orderIndex: 1,
        },
      }),
      prisma.inventionComponent.create({
        data: {
          projectId: projectId,
          referenceNumber: '200',
          name: 'AI Detection Module',
          description:
            'Software module implementing the core AI algorithms for object detection and classification',
          function:
            'Analyzes video streams to detect and classify objects, identifies persons, vehicles, and anomalies',
          componentType: 'software',
          isCritical: true,
          orderIndex: 2,
        },
      }),
      prisma.inventionComponent.create({
        data: {
          projectId: projectId,
          referenceNumber: '202',
          name: 'Facial Recognition Module',
          description:
            'Specialized AI module for identifying and verifying known individuals',
          function:
            'Matches detected faces against authorized user database, maintains privacy-compliant face encodings',
          componentType: 'software',
          isCritical: true,
          orderIndex: 3,
        },
      }),
      prisma.inventionComponent.create({
        data: {
          projectId: projectId,
          referenceNumber: '300',
          name: 'Alert System',
          description: 'Multi-channel notification system for security alerts',
          function:
            'Sends real-time alerts via mobile app, SMS, email, and optional integration with monitoring services',
          componentType: 'software',
          isCritical: true,
          orderIndex: 4,
        },
      }),
    ]);

    console.log(`Created ${components.length} components`);

    // Create advantages
    await Promise.all([
      prisma.inventionAdvantage.create({
        data: {
          projectId: projectId,
          title: 'Dramatically Reduced False Alarms',
          description:
            'System reduces false alarms by 90% compared to traditional motion-based systems through intelligent object classification and behavioral analysis',
          category: 'performance',
          comparedTo:
            'Traditional PIR motion sensors and basic video analytics',
          improvementMetric: '90% reduction in false positives',
          priority: 10,
          orderIndex: 0,
        },
      }),
      prisma.inventionAdvantage.create({
        data: {
          projectId: projectId,
          title: 'Self-Learning Capability',
          description:
            'System continuously learns and adapts to household patterns, improving accuracy over time without manual configuration',
          category: 'usability',
          priority: 9,
          orderIndex: 1,
        },
      }),
      prisma.inventionAdvantage.create({
        data: {
          projectId: projectId,
          title: 'Privacy-Preserving Design',
          description:
            'All facial recognition processing happens locally on edge devices, with only anonymized data sent to cloud',
          category: 'other',
          priority: 8,
          orderIndex: 2,
        },
      }),
      prisma.inventionAdvantage.create({
        data: {
          projectId: projectId,
          title: 'Cost-Effective Scaling',
          description:
            'Modular design allows starting with one camera and expanding as needed without replacing core system',
          category: 'cost',
          improvementMetric: '70% lower total cost of ownership over 5 years',
          priority: 7,
          orderIndex: 3,
        },
      }),
    ]);

    // Create examples
    await Promise.all([
      prisma.inventionExample.create({
        data: {
          projectId: projectId,
          title: 'Package Delivery Detection',
          description:
            'System recognizes delivery personnel and alerts homeowner of package arrival',
          exampleType: 'use_case',
          scenario:
            'A delivery person approaches the front door carrying a package during business hours',
          implementation:
            'AI detects person + package combination, recognizes delivery uniform patterns, checks time-of-day context',
          results:
            'Homeowner receives instant notification with video clip, package location logged, no false alarm triggered',
          orderIndex: 0,
        },
      }),
      prisma.inventionExample.create({
        data: {
          projectId: projectId,
          title: 'Pet Movement Filtering',
          description:
            'System learns to ignore pet movements while maintaining security',
          exampleType: 'use_case',
          scenario: 'Family dog walks through living room at night',
          implementation:
            'AI recognizes four-legged movement pattern, checks against learned pet profiles, applies size and behavior filters',
          results:
            'No alert generated, event logged as "pet activity", system remains armed for human intrusion',
          orderIndex: 1,
        },
      }),
      prisma.inventionExample.create({
        data: {
          projectId: projectId,
          title: 'Multi-Camera Person Tracking',
          description: 'System tracks individuals across multiple camera views',
          exampleType: 'implementation',
          scenario: 'Person walks from driveway through front yard to door',
          implementation:
            'Re-identification AI maintains person ID across cameras, Kalman filter predicts movement path',
          results:
            'Continuous tracking without duplicate alerts, complete path visualization in dashboard',
          codeSnippet: `
def track_person_across_cameras(detection, camera_id):
    # Extract person features
    features = extract_reid_features(detection.image)
    
    # Match against active tracks
    best_match = matcher.find_best_match(features, active_tracks)
    
    if best_match.confidence > 0.85:
        # Continue existing track
        best_match.track.add_detection(detection, camera_id)
    else:
        # Start new track
        new_track = Track(detection, camera_id, features)
        active_tracks.append(new_track)`,
          programmingLanguage: 'python',
          orderIndex: 2,
        },
      }),
    ]);

    // Create technical challenges
    await Promise.all([
      prisma.technicalChallenge.create({
        data: {
          projectId: projectId,
          challenge:
            'Handling varying lighting conditions affecting facial recognition accuracy',
          solution:
            'Implemented adaptive histogram equalization and infrared camera switching for low-light conditions',
          alternativeSolutions:
            'Could use thermal imaging as backup, or require additional lighting installation',
          challengeType: 'implementation',
          wasSolved: true,
          orderIndex: 0,
        },
      }),
      prisma.technicalChallenge.create({
        data: {
          projectId: projectId,
          challenge: 'Reducing latency for real-time threat detection',
          solution:
            'Deployed edge computing with model quantization, achieving sub-100ms inference times',
          alternativeSolutions:
            'Could use dedicated AI accelerators or reduce model complexity',
          challengeType: 'performance',
          wasSolved: true,
          orderIndex: 1,
        },
      }),
      prisma.technicalChallenge.create({
        data: {
          projectId: projectId,
          challenge:
            'Ensuring privacy compliance while maintaining functionality',
          solution:
            'Implemented on-device processing with encrypted feature vectors instead of storing actual images',
          challengeType: 'security',
          wasSolved: true,
          orderIndex: 2,
        },
      }),
    ]);

    console.log('Successfully populated all invention data!');

    // Update project status to show it's been processed
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'PROCESSED',
        textInput:
          'A smart home security system that uses AI and computer vision to intelligently detect and classify potential security threats while reducing false alarms. The system can recognize family members, pets, delivery personnel, and distinguish between normal activities and actual security concerns.',
      },
    });

    console.log('Project status updated to PROCESSED');
  } catch (error) {
    console.error('Error populating invention data:', error);
    throw error;
  }
}

async function main() {
  // Get the project ID from command line or use the most recent one
  const projectId = process.argv[2];

  if (!projectId) {
    console.error('Please provide a project ID as an argument');
    console.error('Usage: node populate-test-invention-data.js <PROJECT_ID>');

    // Show available projects
    const projects = await prisma.project.findMany({
      select: { id: true, name: true, status: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    console.log('\nAvailable projects:');
    projects.forEach(p => {
      console.log(`- ${p.id}: ${p.name} (${p.status})`);
    });

    process.exit(1);
  }

  await populateInventionData(projectId);
  await prisma.$disconnect();
}

main().catch(console.error);
