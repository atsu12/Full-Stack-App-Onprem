/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from 'antd'
import './App.css'
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ArcElement,
  DoughnutController,
  PointElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { Book } from './models/Books';

const API_URL = import.meta.env.VITE_API_URL;

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  DoughnutController,
  PointElement
);

const barChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
    title: {
      display: true,
      text: 'Book Length (Lollipop Style)'
    },
  },
  barPercentage: 0.6,     // thicker stems
  categoryPercentage: 0.7,
  scales: {
    y: {
      beginAtZero: true,
      max: 700,
      ticks: {
        stepSize: 50
      },
      grid: {
        color: '#e5e7eb', // soft grid
      }
    },
    x: {
      grid: {
        display: false
      }
    }
  }
};


function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [booksBarChartData, setBooksBarChartData] = useState<ChartData<"bar">>();
  const [pieChartData, setPieChartData] = useState<ChartData<"doughnut">>();

  useEffect(() => {
    fetchBooks();
  }, [])

  useEffect(() => {
    if (books && books.length > 0) {
      const labels = books.map(book => book.title);
      const data = books.map(book => book.pages);

      setBooksBarChartData({
        labels,
        datasets: [
          {
            label: "Total Pages",
            data: data,
            backgroundColor: generateColors(data.length),
            borderColor: generateColors(data.length),
            borderWidth: 1,
            borderRadius: 100, 
            borderSkipped: false, 
          }
        ]
      })
    }
  }, [books]);

  useEffect(() => {
    if (books && books.length > 0) {
      const authorBookCount = new Map();

      for (const book of books) {
        const authorName = book.name;

        if (authorBookCount.has(authorName)) {
          authorBookCount.set(authorName, authorBookCount.get(authorName) + 1);
        } else {
          authorBookCount.set(authorName, 1);
        }
      }

      const chartData = {
        labels: Array.from(authorBookCount.keys()),
        datasets: [
          {
            label: 'Book Count',
            data: Array.from(authorBookCount.values()),
            backgroundColor: generateColors(authorBookCount.size),
            borderColor: generateColors(authorBookCount.size),
            borderWidth: 2,
            hoverOffset: 15,
          },
        ],
      };

      setPieChartData(chartData);
    }
  }, [books])

  function generateColors(numColors: number) {
    const colors = [];
    const colorPalette = ['#10b981', '#f43f5e', '#f59e0b', '#0ea5e9', '#8b5cf6'];
    for (let i = 0; i < numColors; i++) {
      colors.push(colorPalette[i % colorPalette.length]);
    }
    return colors;
  }

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${API_URL}/books`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch");
      }

      // Ensure we are setting the array correctly based on your API structure
      setBooks(data.books || []);
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  return (
    <div className='h-screen font-mono p-4 bg-white'>
      <header className='py-2 border-b'>
        <h1 className='text-left font-bold text-5xl tracking-tight'>Library Analytics</h1>
      </header>
      <main className='py-4 px-4 space-y-6'>
        
        {/* CHANGED: justify-end moves buttons to the right */}
        <div className='flex justify-end space-x-4'>
          <Button type='primary' size='large' className='rounded-none'>
            <Link to={`books`}>Books</Link>
          </Button>
          <Button type='primary' size='large' className='rounded-none'>
            <Link to={`authors`}>Authors</Link>
          </Button>
        </div>

        <div className='p-12 flex justify-between items-start' style={{ height: "100%"}}>
          
          {/* Lollipop (Bar) Chart on Left */}
          <div style={{ width: '900px' }}>
            {booksBarChartData && (
                <Bar 
                    style={{ display: "block", boxSizing: "border-box", height: "500px" }} 
                    options={barChartOptions} 
                    data={booksBarChartData} 
                />
            )}
          </div>

          {/* Donut Chart on Right */}
          <div style={{ width: '450px' }}>
            {pieChartData && (
                <Doughnut 
                    data={pieChartData} 
                    options={{ 
                        cutout: '50%', 
                        plugins: { legend: { position: 'bottom' } } 
                    }} 
                />
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

export default App