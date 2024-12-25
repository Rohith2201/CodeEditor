import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/AppContext';
import CodeEditor from '../../components/CodeEditor';

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { assignments } = useAppContext();
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== 'STUDENT') {
    router.push('/login');
    return null;
  }

  const handleAssignmentSelect = (assignment) => {
    setSelectedAssignment(assignment);
    setSelectedLanguage('');
    setSubmissionResult(null);
  };

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language);
  };

  const handleSubmission = async (code) => {
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
          assignmentId: selectedAssignment.id,
        }),
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      const result = await response.json();
      setSubmissionResult(result);
    } catch (error) {
      console.error('Error submitting assignment:', error);
      setSubmissionResult({ error: 'Submission failed. Please try again.' });
    }
  };

  const isAssignmentActive = (assignment) => {
    const now = new Date();
    const startTime = new Date(assignment.startTime);
    const endTime = new Date(startTime.getTime() + assignment.duration * 60000);
    return now >= startTime && now <= endTime;
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Dashboard</h1>
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-1/3 pr-4 mb-4 md:mb-0">
          <h2 className="text-xl font-semibold mb-2">Assignments</h2>
          <ul className="space-y-2">
            {assignments.map((assignment) => (
              <li
                key={assignment.id}
                className={`cursor-pointer hover:bg-gray-100 p-2 rounded transition duration-200 ${
                  isAssignmentActive(assignment) ? 'border-l-4 border-green-500' : ''
                }`}
                onClick={() => handleAssignmentSelect(assignment)}
              >
                <h3 className="font-medium">{assignment.title}</h3>
                <p className="text-sm text-gray-600">{assignment.subject.name}</p>
                <p className="text-sm text-gray-600">
                  Start: {new Date(assignment.startTime).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Duration: {assignment.duration} minutes</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="w-full md:w-2/3">
          {selectedAssignment ? (
            <div>
              <h2 className="text-xl font-semibold mb-2">{selectedAssignment.title}</h2>
              <p className="mb-4">{selectedAssignment.description}</p>
              {isAssignmentActive(selectedAssignment) ? (
                <>
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Select Language:</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAssignment.languages.map(lang => (
                        <button
                          key={lang}
                          onClick={() => handleLanguageSelect(lang)}
                          className={`px-2 py-1 rounded ${
                            selectedLanguage === lang
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>
                  {selectedLanguage && (
                    <CodeEditor
                      language={selectedLanguage}
                      onSubmit={handleSubmission}
                    />
                  )}
                </>
              ) : (
                <p className="text-red-500">This assignment is not currently active.</p>
              )}
              {submissionResult && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <h3 className="font-semibold mb-2">Submission Result</h3>
                  {submissionResult.error ? (
                    <p className="text-red-500">{submissionResult.error}</p>
                  ) : (
                    <>
                      <p>Passed Tests: {submissionResult.passedTests}/{submissionResult.totalTests}</p>
                      <p>Grade: {submissionResult.grade}%</p>
                    </>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p>Select an assignment to start coding.</p>
          )}
        </div>
      </div>
    </div>
  );
}

