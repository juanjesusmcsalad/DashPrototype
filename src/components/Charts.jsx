import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { useEffect, useState } from 'react'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
)

const BASE_FONT = {
  family: "'Inter', system-ui, sans-serif",
  size: 11,
}

function useIsDarkTheme() {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  )

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      setIsDark(root.classList.contains('dark'))
    })
    observer.observe(root, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return isDark
}

export function SubjectBarChart({ subjects }) {
  const isDark = useIsDarkTheme()
  const tickColor = isDark ? '#cbd5e1' : '#64748b'
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(148, 163, 184, 0.18)'

  const data = {
    labels: subjects.map((s) => s.shortName),
    datasets: [
      {
        label: 'Current Grade',
        data: subjects.map((s) => s.grade),
        backgroundColor: subjects.map((s) =>
          s.grade >= 90 ? (isDark ? '#6070d4' : '#35408e') : '#ffd41c'
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
        ticks: { color: tickColor, font: BASE_FONT },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: gridColor },
        ticks: { color: tickColor, font: BASE_FONT },
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
  const isDark = useIsDarkTheme()
  const tickColor = isDark ? '#cbd5e1' : '#64748b'
  const gridColor = isDark ? 'rgba(148, 163, 184, 0.14)' : 'rgba(148, 163, 184, 0.18)'

  const data = {
    labels: weeklyEngagement.labels,
    datasets: [
      {
        label: 'Study Hours',
        data: weeklyEngagement.studyHours,
        backgroundColor: isDark ? '#6070d4' : '#35408e',
        borderRadius: 8,
      },
      {
        label: 'Weekly Target',
        data: weeklyEngagement.targetHours,
        backgroundColor: '#ffd41c',
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
        labels: { boxWidth: 10, usePointStyle: true, color: tickColor, font: BASE_FONT },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: tickColor, font: BASE_FONT },
      },
      y: {
        beginAtZero: true,
        grid: { color: gridColor },
        ticks: { color: tickColor, font: BASE_FONT },
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
  const isDark = useIsDarkTheme()
  const tickColor = isDark ? '#cbd5e1' : '#64748b'

  const data = {
    labels: ['Completed', 'Pending'],
    datasets: [
      {
        data: [completedCount, pendingCount],
        backgroundColor: [isDark ? '#6070d4' : '#35408e', '#ffd41c'],
        borderColor: [isDark ? '#424fa6' : '#242c66', '#e6bd0e'],
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
        labels: { boxWidth: 12, usePointStyle: true, color: tickColor, font: BASE_FONT },
      },
    },
  }

  if (completedCount + pendingCount === 0) {
    return (
      <div className="flex h-56 w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 text-center dark:border-slate-700">
        <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">0%</span>
        <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">No tasks assigned yet</span>
      </div>
    )
  }

  return (
    <div className="h-56 w-full">
      <Doughnut data={data} options={options} />
    </div>
  )
}
