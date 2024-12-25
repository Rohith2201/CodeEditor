import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withApiMiddleware } from '../../../lib/api-middleware';
import { z } from 'zod';

const prisma = new PrismaClient();

const assignmentSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  subjectId: z.string().cuid(),
  initialCode: z.string(),
  language: z.string(),
  testCases: z.array(z.object({
    input: z.string(),
    expectedOutput: z.string(),
    isHidden: z.boolean(),
  })),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const assignments = await prisma.assignment.findMany({
      include: { subject: true, testCases: true },
    });
    res.status(200).json(assignments);
  } else if (req.method === 'POST') {
    const data = assignmentSchema.parse(req.body);
    const assignment = await prisma.assignment.create({
      data: {
        ...data,
        testCases: {
          create: data.testCases,
        },
      },
      include: { subject: true, testCases: true },
    });
    res.status(201).json(assignment);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withApiMiddleware(handler, assignmentSchema);

