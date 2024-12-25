import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Download } from 'lucide-react';
import Header from '../../components/Header';

interface SubmissionResult {
  id: string;
  user: {
    name: string;
    email: string;
  };
  timeSpent: number;
  questionsAttempted: number;
  questionsSubmitted: number;
  testcasesPassed: number;
  language: string;
  submittedAt: string;
  grade: number;
}

export default function AssignmentResults() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { assignmentId } = router.query;
  const [results, setResults] = useState<SubmissionResult[]>([]);
  const [assignment, setAssignment] = useState<any>(null);

  useEffect(() => {
    if (assignmentId) {
      fetchResults();
      fetchAssignment();
    }
  }, [assignmentId]);

  const fetchResults = async () => {
    const response = await fetch(`/api/assignments/${assignmentId}/results`);
    const data = await response.json();
    setResults(data);
  };

  const fetchAssignment = async () => {
    const response = await fetch(`/api/assignments/${assignmentId}`);
    const data = await response.json();
    setAssignment(data);
  };

  const exportData = async () => {
    const response = await fetch(`/api/assignments/${assignmentId}/export`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `assignment-${assignmentId}-results.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== 'FACULTY') {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        assignmentName={assignment?.title}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Assignment Results</h1>
            <button
              onClick={exportData}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Results
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Questions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Testcases
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.map((result) => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">{result.user.name}</div>
                        <div className="text-sm text-gray-500">{result.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {Math.floor(result.timeSpent / 60)}m {result.timeSpent % 60}s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.questionsSubmitted}/{result.questionsAttempted}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.testcasesPassed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {result.language}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        result.grade >= 70 ? 'bg-green-100 text-green-800' : 
                        result.grade >= 40 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.grade}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

