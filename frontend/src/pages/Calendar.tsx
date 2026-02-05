import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

interface CalendarData {
  [date: string]: number;
}

export default function Calendar() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    try {
      const response = await fetch(`${API_BASE_URL}/calendar/${year}/${month}/`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCalendarData(data);
      }
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    }
  };

  const handlePreviousMonth = () => {
    setDirection(-1);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setDirection(1);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: string) => {
    if (calendarData[date]) {
        if (selectedDate === date) {
            // If already selected, navigate to dashboard with filter
            navigate('/dashboard'); 
        } else {
            setSelectedDate(date);
        }
    } else {
        setSelectedDate(null);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const formatDateKey = (day: number) => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth();

  const variants = {
      enter: (direction: number) => ({
          x: direction > 0 ? 50 : -50,
          opacity: 0
      }),
      center: {
          x: 0,
          opacity: 1
      },
      exit: (direction: number) => ({
          x: direction > 0 ? -50 : 50,
          opacity: 0
      })
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
         <div>
          <h1 className="text-3xl font-serif font-bold text-sage-900">Archive</h1>
          <p className="text-sage-600 mt-1">View your journaling consistency over time</p>
        </div>
      </div>

      {/* Calendar Card */}
      <div className="card bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-sage-100">
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handlePreviousMonth}
            className="p-2 text-sage-600 hover:bg-sage-50 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          
          <h2 className="text-2xl font-serif font-semibold text-sage-900 w-64 text-center">
            {monthName}
          </h2>

          <button
            onClick={handleNextMonth}
            className="p-2 text-sage-600 hover:bg-sage-50 rounded-full transition-colors"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="relative overflow-hidden min-h-[400px]">
             <AnimatePresence custom={direction} mode='wait'>
                <motion.div 
                    key={monthName}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "tween", duration: 0.3 }}
                >
                    <div className="grid grid-cols-7 gap-4 mb-2">
                        {weekDays.map((day) => (
                        <div key={day} className="text-center text-xs font-semibold text-sage-400 uppercase tracking-wider py-2">
                            {day}
                        </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-4">
                        {days.map((day, index) => {
                        if (day === null) {
                            return <div key={`empty-${index}`} className="aspect-square" />;
                        }

                        const dateKey = formatDateKey(day);
                        const entryCount = calendarData[dateKey] || 0;
                        const hasEntries = entryCount > 0;
                        const isToday =
                            day === new Date().getDate() &&
                            currentDate.getMonth() === new Date().getMonth() &&
                            currentDate.getFullYear() === new Date().getFullYear();
                        
                        const isSelected = selectedDate === dateKey;

                        return (
                            <button
                            key={day}
                            onClick={() => handleDateClick(dateKey)}
                            disabled={!hasEntries}
                            className={`
                                aspect-square rounded-xl relative group transition-all duration-300
                                flex flex-col items-center justify-center
                                ${isToday ? 'ring-2 ring-sage-400 ring-offset-2' : ''}
                                ${isSelected ? 'bg-sage-800 text-white shadow-lg scale-105' : ''}
                                ${!isSelected && hasEntries ? 'bg-sage-100/50 hover:bg-sage-100 text-sage-900 cursor-pointer' : ''}
                                ${!isSelected && !hasEntries ? 'text-sage-300 cursor-default' : ''}
                            `}
                            >
                            <span className={`text-sm font-medium ${isSelected ? 'text-white' : ''}`}>
                                {day}
                            </span>
                            
                            {hasEntries && !isSelected && (
                                <div className="flex gap-0.5 mt-1.5 h-1">
                                {Array.from({ length: Math.min(entryCount, 3) }).map((_, i) => (
                                    <div
                                    key={i}
                                    className="w-1 h-1 bg-sage-400 rounded-full"
                                    />
                                ))}
                                </div>
                            )}
                            
                            {isSelected && (
                                <div className="text-[10px] mt-1 text-sage-200">
                                    {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
                                </div>
                            )}
                            </button>
                        );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
      </div>
      
      {/* Legend / Tip */}
      <div className="flex justify-center gap-8 text-sm text-sage-500">
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-sage-100 border border-sage-200" />
            <span>Has Entry</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border-2 border-sage-400" />
            <span>Today</span>
        </div>
      </div>
    </div>
  );
}
