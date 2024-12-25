import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Header from '../../components/Header';
import CodeEditor from '../../components/CodeEditor';

export default function AssignmentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { assignmentId } = router.query;
  const [assignment, setAssignment] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId]);

  useEffect(() => {
    if (assignment) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endTime = new Date(assignment.startTime).getTime() + (assignment.duration * 60 * 1000);
        const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
        
        setTimeRemaining(remaining);

        if (remaining === 0) {
          clearInterval(timer);
          // Handle assignment completion
          router.push('/student/dashboard');
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [assignment]);

  const fetchAssignment = async () => {
    const response = await fetch(`/api/assignments/${assignmentId}`);
    const data = await response.json();
    setAssignment(data);
  };

  if (status === 'loading' || !assignment) {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== 'STUDENT') {
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        assignmentName={assignment.title}
        timeRemaining={timeRemaining}
      />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Rest of the assignment page content */}
      </main>
    </div>
  );
}

