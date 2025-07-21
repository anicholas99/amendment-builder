import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { projectId } = req.query;
  
  const docs = await prisma.projectDocument.findMany({
    where: { 
      projectId: projectId as string,
      fileType: 'uspto-document'
    },
    select: {
      id: true,
      fileName: true,
      storageUrl: true,
      extractedText: true,
    },
    take: 5
  });
  
  return res.json({
    documents: docs.map(d => ({
      id: d.id,
      fileName: d.fileName,
      storageUrl: d.storageUrl,
      hasBlob: d.extractedText?.startsWith('blob:') || false,
      blobName: d.extractedText?.startsWith('blob:') ? d.extractedText.substring(5) : null
    }))
  });
}