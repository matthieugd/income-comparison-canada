import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, DollarSign, Users, MapPin, Filter } from 'lucide-react';

const IncomeDistributionViz = ({ apiUrl }) => {
  const [userIncome, setUserIncome] = useState(65000);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [distribution, setDistribution] = useState(null);
  const [geographies, setGeographies] = useState([]);
  const [selectedGeography, setSelectedGeography] = useState('CA');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  // Load available geographies on mount
  useEffect(() => {
    fetchGeographies();
    fetchDistribution('CA');
  }, []);

  const fetchGeographies = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/income/geographies`);
      const data = await response.json();
      setGeographies(data.geographies || []);
    } catch (err) {
      console.error('Failed to fetch geographies:', err);
    }
  };

  const fetchDistribution = async (geography = 'CA') => {
    try {
      const response = await fetch(`${apiUrl}/api/income/distribution?geography=${geography}`);
      const data = await response.json();
      setDistribution(data);
    } catch (err) {
      console.error('Failed to fetch distribution:', err);
    }
  };

  // Generate distribution curve points
  const generateCurve = (width, height) => {
    const points = [];
    const steps = 200;
    
    for (let i = 0; i <= steps; i++) {
      const percentile = (i / steps) * 100;
      const x = (percentile / 100) * width;
      
      let density;
      if (percentile < 50) {
        density = Math.pow(percentile / 50, 1.5);
      } else {
        density = Math.exp(-(percentile - 50) / 25);
      }
      
      const y = height - (density * height * 0.8);
      points.push({ x, y, percentile });
    }
    
    return points;
  };

  // Draw the visualization
  useEffect(() => {
    if (!distribution || !apiData) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;
    const graphWidth = width - padding * 2;
    const graphHeight = height - padding * 2;

    ctx.clearRect(0, 0, width, height);

    const curvePoints = generateCurve(graphWidth, graphHeight);
    const userPercentile = apiData.percentile;
    const userX = (userPercentile / 100) * graphWidth + padding;
    const userPointIndex = Math.floor((userPercentile / 100) * curvePoints.length);
    const userY = curvePoints[userPointIndex]?.y + padding || height / 2;

    // Draw filled area
    if (animationProgress > 0) {
      const fillToIndex = Math.floor((userPercentile / 100) * curvePoints.length * animationProgress);
      
      ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
      ctx.beginPath();
      ctx.moveTo(padding, height - padding);
      
      for (let i = 0; i <= fillToIndex && i < curvePoints.length; i++) {
        ctx.lineTo(curvePoints[i].x + padding, curvePoints[i].y + padding);
      }
      
      ctx.lineTo(curvePoints[fillToIndex]?.x + padding || padding, height - padding);
      ctx.closePath();
      ctx.fill();
    }

    // Draw curve
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(curvePoints[0].x + padding, curvePoints[0].y + padding);
    for (let i = 1; i < curvePoints.length; i++) {
      ctx.lineTo(curvePoints[i].x + padding, curvePoints[i].y + padding);
    }
    ctx.stroke();

    // Draw base line
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Draw percentile markers
    const markers = [0, 25, 50, 75, 90, 100];
    ctx.fillStyle = '#64748b';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';

    markers.forEach(p => {
      const x = (p / 100) * graphWidth + padding;
      ctx.beginPath();
      ctx.moveTo(x, height - padding);
      ctx.lineTo(x, height - padding + 5);
      ctx.stroke();
      ctx.fillText(`${p}%`, x, height - padding + 20);
    });

    // Draw median line
    const medianPercentile = 50;
    const medianX = (medianPercentile / 100) * graphWidth + padding;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(medianX, height - padding);
    ctx.lineTo(medianX, padding);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Median: $${distribution.median.toLocaleString()}`, medianX + 5, padding + 20);

    // Draw user line
    if (animationProgress >= 1) {
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(userX, height - padding);
      ctx.lineTo(userX, userY);
      ctx.stroke();

      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = userPercentile > 75 ? 'right' : 'left';
      const labelX = userPercentile > 75 ? userX - 10 : userX + 10;
      ctx.fillText(`YOU`, labelX, userY - 10);
      ctx.fillText(`$${userIncome.toLocaleString()}`, labelX, userY + 5);
      ctx.fillText(`${userPercentile.toFixed(0)}th percentile`, labelX, userY + 20);
    }

    // Draw animated character
    if (animationProgress > 0) {
      const currentPercentile = userPercentile * animationProgress;
      const charX = (currentPercentile / 100) * graphWidth + padding;
      const charPointIndex = Math.floor((currentPercentile / 100) * curvePoints.length);
      const charY = (curvePoints[charPointIndex]?.y || graphHeight / 2) + padding;

      ctx.fillStyle = '#22c55e';
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;

      // Head
      ctx.beginPath();
      ctx.arc(charX, charY - 25, 8, 0, Math.PI * 2);
      ctx.fill();

      // Body
      ctx.beginPath();
      ctx.moveTo(charX, charY - 17);
      ctx.lineTo(charX, charY - 5);
      ctx.stroke();

      // Arms
      const armSwing = Math.sin(animationProgress * Math.PI * 4) * 5;
      ctx.beginPath();
      ctx.moveTo(charX, charY - 13);
      ctx.lineTo(charX - 6, charY - 8 + armSwing);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(charX, charY - 13);
      ctx.lineTo(charX + 6, charY - 8 - armSwing);
      ctx.stroke();

      // Legs
      const legSwing = Math.sin(animationProgress * Math.PI * 4) * 6;
      ctx.beginPath();
      ctx.moveTo(charX, charY - 5);
      ctx.lineTo(charX - 4, charY + 3 + legSwing);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(charX, charY - 5);
      ctx.lineTo(charX + 4, charY + 3 - legSwing);
      ctx.stroke();
    }

    // Axis labels
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Income Percentile →', width / 2, height - 10);
    
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('← Population Density', 0, 0);
    ctx.restore();

  }, [userIncome, animationProgress, apiData, distribution]);

  // Animation effect
  useEffect(() => {
    if (isAnimating) {
      setAnimationProgress(0);
      const duration = 2000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        setAnimationProgress(eased);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [isAnimating]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${apiUrl}/api/income/percentile?income=${userIncome}&geography=${selectedGeography}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch data from API');
      }

      const data = await response.json();
      setApiData(data);
      setIsAnimating(true);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching percentile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Where Do You Stand?
        </h2>
        <p className="text-gray-600">Enter your income to see your position in the distribution</p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end justify-center">
          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Employment Income
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="number"
                value={userIncome}
                onChange={(e) => setUserIncome(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
                placeholder="65000"
                min="0"
                step="1000"
              />
            </div>
          </div>

          <div className="flex-1 max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="inline w-4 h-4 mr-1" />
              Geography
            </label>
            <select
              value={selectedGeography}
              onChange={(e) => {
                setSelectedGeography(e.target.value);
                fetchDistribution(e.target.value);
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-lg"
            >
              {geographies.map(geo => (
                <option key={geo.code} value={geo.code}>
                  {geo.name}
                </option>
              ))}
            </select>
          </div>
          
          <button
            type="submit"
            disabled={isAnimating || loading}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? 'Loading...' : isAnimating ? 'Calculating...' : 'Show My Position'}
          </button>
        </div>

        {error && (
          <div className="text-center text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            Error: {error}. Make sure the backend server is running.
          </div>
        )}
      </form>

      <div className="bg-white rounded-lg p-6 shadow-md mb-6">
        <canvas
          ref={canvasRef}
          width={900}
          height={400}
          className="w-full h-auto"
        />
      </div>

      {animationProgress >= 1 && apiData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fadeIn">
          <div className="bg-green-100 border-2 border-green-300 rounded-lg p-6 text-center">
            <Users className="mx-auto mb-2 text-green-600" size={32} />
            <div className="text-4xl font-bold text-green-700 mb-1">{apiData.belowYou}%</div>
            <div className="text-green-800 font-medium">Earn Less Than You</div>
            <div className="text-sm text-green-600 mt-2">
              About {apiData.estimatedPeopleBelowYou.toLocaleString()} people
            </div>
          </div>

          <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-6 text-center">
            <TrendingUp className="mx-auto mb-2 text-blue-600" size={32} />
            <div className="text-4xl font-bold text-blue-700 mb-1">
              {apiData.median.percentDifference >= 0 ? '+' : ''}{apiData.median.percentDifference}%
            </div>
            <div className="text-blue-800 font-medium">vs. Median Income</div>
            <div className="text-sm text-blue-600 mt-2">
              ${Math.abs(apiData.median.difference).toLocaleString()} {apiData.median.difference >= 0 ? 'above' : 'below'}
            </div>
          </div>

          <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-6 text-center">
            <DollarSign className="mx-auto mb-2 text-purple-600" size={32} />
            <div className="text-4xl font-bold text-purple-700 mb-1">
              {apiData.bracket}
            </div>
            <div className="text-purple-800 font-medium">Income Bracket</div>
            <div className="text-sm text-purple-600 mt-2">
              {apiData.percentile.toFixed(1)}th percentile
            </div>
          </div>
        </div>
      )}

      {distribution && (
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Showing data for: <strong>{distribution.geography}</strong></p>
          <p className="mt-1">Census 2021 • {distribution.year} employment income • {distribution.totalRecipients.toLocaleString()} recipients</p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default IncomeDistributionViz;
