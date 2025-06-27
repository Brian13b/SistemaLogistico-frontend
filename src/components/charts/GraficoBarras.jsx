import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement,Title, Tooltip, Legend } from 'chart.js';
import { useEffect, useRef } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export const GraficoBarras = ({ data, options, className = "" }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    return () => {
      if (chartRef.current) chartRef.current.destroy();
    };
  }, []);

  return (
    <div className={className}>
      <Bar ref={chartRef} data={data} options={options} />
    </div>
  );
};