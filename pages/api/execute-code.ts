import { NextApiRequest, NextApiResponse } from 'next';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { code, language, testCases } = req.body;

    try {
      // Save the code to a temporary file
      const fs = require('fs');
      const tempFile = `/tmp/code_${Date.now()}.${language}`;
      fs.writeFileSync(tempFile, code);

      let passedTests = 0;
      let totalTests = testCases.length;
      let output = '';

      for (const testCase of testCases) {
        const { stdout, stderr } = await execAsync(`python ${tempFile} ${testCase.input}`);
        
        if (stdout.trim() === testCase.expectedOutput.trim()) {
          passedTests++;
          output += `Test case passed: Input: ${testCase.input}, Output: ${stdout.trim()}\n`;
        } else {
          output += `Test case failed: Input: ${testCase.input}, Expected: ${testCase.expectedOutput}, Got: ${stdout.trim()}\n`;
        }

        if (stderr) {
          output += `Error: ${stderr}\n`;
        }
      }

      // Clean up the temporary file
      fs.unlinkSync(tempFile);

      res.status(200).json({ 
        output,
        passedTests,
        totalTests
      });
    } catch (error) {
      res.status(500).json({ error: 'Error executing code' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

