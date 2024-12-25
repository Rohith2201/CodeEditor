import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useAppContext } from '../../contexts/AppContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const LANGUAGES = ['python', 'java', 'c', 'cpp', 'javascript', 'sql'];

export default function FacultyDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { subjects, setSubjects, assignments, setAssignments } = useAppContext();
  const [newSubject, setNewSubject] = useState('');
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    description: '',
    subject: '',
    startTime: new Date(),
    duration: 60,
    languages: [],
  });

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== 'FACULTY') {
    router.push('/login');
    return null;
  }

  const addSubject = async () => {
    if (newSubject) {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSubject }),
      });
      const subject = await response.json();
      setSubjects([...subjects, subject]);
      setNewSubject('');
    }
  };

  const addAssignment = async () => {
    if (newAssignment.title && newAssignment.subject) {
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssignment),
      });
      const assignment = await response.json();
      setAssignments([...assignments, assignment]);
      setNewAssignment({
        title: '',
        description: '',
        subject: '',
        startTime: new Date(),
        duration: 60,
        languages: [],
      });
    }
  };

  const toggleLanguage = (language) => {
    setNewAssignment(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(lang => lang !== language)
        : [...prev.languages, language]
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Faculty Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Add Subject</h2>
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          className="border p-2 mr-2"
          placeholder="Subject Name"
        />
        <button onClick={addSubject} className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Subject
        </button>
      </div>
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Add Assignment</h2>
        <input
          type="text"
          value={newAssignment.title}
          onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
          className="border p-2 mr-2 mb-2"
          placeholder="Assignment Title"
        />
        <select
          value={newAssignment.subject}
          onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
          className="border p-2 mr-2 mb-2"
        >
          <option value="">Select Subject</option>
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>
        <textarea
          value={newAssignment.description}
          onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
          className="border p-2 mr-2 mb-2 w-full"
          placeholder="Assignment Description"
          rows={4}
        />
        <div className="mb-2">
          <label className="block mb-1">Start Time:</label>
          <DatePicker
            selected={newAssignment.startTime}
            onChange={(date) => setNewAssignment({ ...newAssignment, startTime: date })}
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
            className="border p-2"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Duration (minutes):</label>
          <input
            type="number"
            value={newAssignment.duration}
            onChange={(e) => setNewAssignment({ ...newAssignment, duration: parseInt(e.target.value) })}
            className="border p-2"
            min="1"
          />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Languages:</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className={`px-2 py-1 rounded ${
                  newAssignment.languages.includes(lang)
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
        <button onClick={addAssignment} className="bg-green-500 text-white px-4 py-2 rounded mt-2">
          Add Assignment
        </button>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Assignments</h2>
        {assignments.map((assignment) => (
          <div key={assignment.id} className="mb-4 p-4 border rounded">
            <h3 className="font-semibold">{assignment.title}</h3>
            <p>Subject: {subjects.find(s => s.id === assignment.subjectId)?.name}</p>
            <p>Start Time: {new Date(assignment.startTime).toLocaleString()}</p>
            <p>Duration: {assignment.duration} minutes</p>
            <p>Languages: {assignment.languages.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

