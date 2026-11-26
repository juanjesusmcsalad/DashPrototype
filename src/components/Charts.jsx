import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
)

const BASE_FONT = {
  family: "'Inter', system-ui, sans-serif",
  size: 11,
}

export function GradeTrendLineChart({ gradeHistory }) {
  const data = {
    labels: gradeHistory.labels,
    datasets: [
      {
        label: 'Grade Average',
        data: gradeHistory.values,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(139, 92, 246, 0.14)',
        pointBackgroundColor: '#7c3aed',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        tension: 0.35,
        fill: true,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f1b2e',
        padding: 10,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: BASE_FONT },
      },
      y: {
        min: 80,
        max: 100,
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
        ticks: { color: '#64748b', font: BASE_FONT },
      },
    },
  }

  return (
    <div className="h-56 w-full">
      <Line data={data} options={options} />
    </div>
  )
}

export function SubjectBarChart({ subjects }) {
  const data = {
    labels: subjects.map((s) => s.shortName),
    datasets: [
      {
        label: 'Current Grade',
        data: subjects.map((s) => s.grade),
        backgroundColor: subjects.map((s) =>
          s.grade >= 90 ? '#8b5cf6' : '#c4b5fd'
        ),
        borderRadius: 8,
        barThickness: 28,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: BASE_FONT },
      },
      y: {
        min: 70,
        max: 100,
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
        ticks: { color: '#64748b', font: BASE_FONT },
      },
    },
  }

  return (
    <div className="h-64 w-full">
      <Bar data={data} options={options} />
    </div>
  )
}

export function WeeklyEngagementBarChart({ weeklyEngagement }) {
  const data = {
    labels: weeklyEngagement.labels,
    datasets: [
      {
        label: 'Study Hours',
        data: weeklyEngagement.studyHours,
        backgroundColor: '#8b5cf6',
        borderRadius: 8,
      },
      {
        label: 'Weekly Target',
        data: weeklyEngagement.targetHours,
        backgroundColor: '#ddd6fe',
        borderRadius: 8,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: { boxWidth: 10, usePointStyle: true, font: BASE_FONT },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: BASE_FONT },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.15)' },
        ticks: { color: '#64748b', font: BASE_FONT },
      },
    },
  }

  return (
    <div className="h-64 w-full">
      <Bar data={data} options={options} />
    </div>
  )
}

export function TaskCompletionDoughnut({ completedCount, pendingCount }) {
  const data = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [completedCount, pendingCount],
        backgroundColor: ['#8b5cf6', '#ede9fe'],
        borderColor: ['#7c3aed', '#ddd6fe'],
        borderWidth: 1,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, usePointStyle: true, font: BASE_FONT },
      },
    },
  }

  return (
    <div className="h-56 w-full">
      <Doughnut data={data} options={options} />
    </div>
  )
}
