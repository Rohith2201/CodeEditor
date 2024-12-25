import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { withApiMiddleware } from '../../../../lib/api-middleware';
import * as XLSX from 'xlsx';

const prisma = new PrismaClient();

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { assignmentId } = req.query;

    const submissions = await prisma.submission.findMany({
      where: {
        assignmentId: assignmentId as string,
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const data = submissions.map(submission => ({
      'Student Name': submission.user.name,
      'Email': submission.user.email,
      'Time Spent (minutes)': Math.floor(submission.timeSpent / 60),
      'Questions Attempted': submission.questionsAttempted,
      'Questions Submitted': submission.questionsSubmitted,
      'Testcases Passed': submission.testcasesPassed,
      'Language': submission.language,
      'Grade (%)': submission.grade,
      'Submission Date': submission.createdAt.toLocaleString(),
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=assignment-${assignmentId}-results.xlsx`);

    // Send the buffer
    res.send(buffer);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export default withApiMiddleware(handler);

