import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withApiMiddleware } from '../../../lib/api-middleware';
import { z } from 'zod';
import { getToken } from 'next-auth/jwt';

const prisma = new PrismaClient();

const submissionSchema = z.object({
  code: z.string(),
  language: z.string(),
  assignmentId: z.string().cuid(),
});

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const token = await getToken({ req });
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { code, language, assignmentId } = submissionSchema.parse(req.body);

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { testCases: true },
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    if (!assignment.languages.includes(language)) {
      return res.status(400).json({ error: 'Invalid language for this assignment' });
    }

    // Execute code against test cases
    const testResults = await Promise.all(
      assignment.testCases.map(async (testCase) => {
        const result = await executeCode(code, language, testCase.input);
        return {
          passed: result.trim() === testCase.expectedOutput.trim(),
          isHidden: testCase.isHidden,
        };
      })
    );

    const passedTests = testResults.filter((result) => result.passed).length;
    const totalTests = testResults.length;
    const grade = (passedTests / totalTests) * 100;

    const submission = await prisma.submission.create({
      data: {
        code,
        language,
        result: testResults,
        grade,
        userId: token.sub!,
        assignmentId,
      },
    });

    res.status(201).json({
      id: submission.id,
      passedTests,
      totalTests,
      grade,
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

async function executeCode(code: string, language: string, input: string): Promise<string> {
  // Implement code execution logic here for different languages
  // This is a placeholder implementation
  return 'Executed code output';
}

export default withApiMiddleware(handler, submissionSchema);

