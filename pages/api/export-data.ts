import { NextApiRequest, NextApiResponse } from 'next';
import * as XLSX from 'xlsx';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Fetch data from your database here
      const data = [
        { id: 1, name: 'John Doe', subject: 'Math', score: 85 },
        { id: 2, name: 'Jane Smith', subject: 'Science', score: 92 },
        // Add more data as needed
      ];

      // Create a new workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Add the worksheet to the workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Data');

      // Generate buffer
      constbuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      // Set headers for file download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=student_data.xlsx');

      // Send the buffer as the response
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ error: 'Error exporting data' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

