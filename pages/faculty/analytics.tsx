import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function FacultyAnalytics() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const response = await fetch('/api/analytics');
      const data = await response.json();
      setAnalyticsData(data);
    };

    if (session?.user.role === 'FACULTY') {
      fetchAnalytics();
    }
  }, [session]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session || session.user.role !== 'FACULTY') {
    router.push('/login');
    return null;
  }

  if (!analyticsData) {
    return <div>Loading analytics...</div>;
  }

  const chartData = {
    labels: analyticsData.assignments.map((a) => a.title),
    datasets: [
      {
        label: 'Average Grade',
        data: analyticsData.assignments.map((a) => a.averageGrade),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'Submission Count',
        data: analyticsData.assignments.map((a) => a.submissionCount),
        backgroundColor: 'rgba(153, 102, 255, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Assignment Analytics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Faculty Analytics</h1>
      <div className="mb-8">
        <Bar data={chartData} options={options} />
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-2">Assignment Details</h2>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Assignment</th>
              <th className="border p-2">Average Grade</th>
              <th className="border p-2">Submission Count</th>
              <th className="border p-2">Languages Used</th>
            </tr>
          </thead>
          <tbody>
            {analyticsData.assignments.map((assignment) => (
              <tr key={assignment.id}>
                <td className="border p-2">{assignment.title}</td>
                <td className="border p-2">{assignment.averageGrade.toFixed(2)}%</td>
                <td className="border p-2">{assignment.submissionCount}</td>
                <td className="border p-2">
                  {Object.entries(assignment.languageUsage).map(([lang, count]) => (
                    <div key={lang}>{lang}: {count}</div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

