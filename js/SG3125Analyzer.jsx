// File: SG3125Analyzer.jsx
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Papa from 'papaparse';
import html2canvas from 'html2canvas';

const SG3125Analyzer = () => {
  const [hisData, setHisData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [selectedParams, setSelectedParams] = useState([
    'Output power of Turnkey Station',
    'DC power of Turnkey Station'
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileNames, setFileNames] = useState({ his: '', events: '' });

  const chartRef = useRef();

  const handleFileUpload = (type, file) => {
    if (!file) return;
    setLoading(true);
    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (type === 'his') {
          setHisData(results.data);
          setFileNames((f) => ({ ...f, his: file.name }));
        } else {
          setEventsData(results.data);
          setFileNames((f) => ({ ...f, events: file.name }));
        }
        setLoading(false);
      },
      error: (err) => {
        setError(`Failed to parse ${type} file: ${err.message}`);
        setLoading(false);
      }
    });
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(type, e.dataTransfer.files[0]);
    }
  };

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const exportChartAsImage = () => {
    const node = chartRef.current;
    if (!node) return;
    html2canvas(node).then((canvas) => {
      const link = document.createElement('a');
      link.download = 'SG3125_Chart.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  };

  const handleParamToggle = (param) => {
    setSelectedParams((prev) =>
      prev.includes(param) ? prev.filter((p) => p !== param) : [...prev, param]
    );
  };

  const availableParams = hisData.length > 0
    ? Object.keys(hisData[0]).filter(key =>
        typeof hisData[0][key] === 'number' &&
        !key.includes('No.') &&
        !key.includes('Monthly') &&
        !key.includes('Annual') &&
        !key.includes('Total')
      )
    : [];

  const lineColors = ['#2196F3', '#F44336', '#4CAF50', '#FF9800', '#9C27B0', '#795548', '#607D8B'];

  const faultCount = eventsData.filter(e => e['Event Level'] === 'Fault').length;
  const alarmCount = eventsData.filter(e => e['Event Level'] === 'Alarm').length;
  const promptCount = eventsData.filter(e => e['Event Level'] === 'Prompt').length;

  return (
    <div className="space-y-6">
      <div className="form-section">
        <h2 className="form-section-title">Upload CSV Files</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div
            className="file-upload"
            onDrop={(e) => handleDrop(e, 'his')}
            onDragOver={preventDefaults}
            onDragEnter={preventDefaults}
            onDragLeave={preventDefaults}
          >
            <input type="file" accept=".csv" onChange={(e) => handleFileUpload('his', e.target.files[0])} />
            <p className="text-sm">Drop or select HisData CSV</p>
          </div>
          <div
            className="file-upload"
            onDrop={(e) => handleDrop(e, 'events')}
            onDragOver={preventDefaults}
            onDragEnter={preventDefaults}
            onDragLeave={preventDefaults}
          >
            <input type="file" accept=".csv" onChange={(e) => handleFileUpload('events', e.target.files[0])} />
            <p className="text-sm">Drop or select Events CSV</p>
          </div>
        </div>
        {fileNames.his && <p>HisData file: {fileNames.his}</p>}
        {fileNames.events && <p>Events file: {fileNames.events}</p>}
      </div>

      {loading && <div className="message info">Loading data...</div>}
      {error && <div className="message error">{error}</div>}

      {!loading && hisData.length > 0 && (
        <>
          <div className="form-section">
            <h2 className="form-section-title">Event Summary</h2>
            <p>Total events: {eventsData.length}</p>
            <p>Faults: {faultCount}, Alarms: {alarmCount}, Prompts: {promptCount}</p>
          </div>

          <div className="form-section">
            <h2 className="form-section-title">Select Parameters</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {availableParams.slice(0, 12).map((param) => (
                <label key={param} className="param-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedParams.includes(param)}
                    onChange={() => handleParamToggle(param)}
                  />
                  {param}
                </label>
              ))}
            </div>
          </div>

          <div className="form-section">
            <div className="flex justify-between items-center mb-4">
              <h2 className="form-section-title">Chart</h2>
              <button onClick={exportChartAsImage} className="btn-success">Export Chart</button>
            </div>
            <div className="chart-container" ref={chartRef}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hisData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {selectedParams.map((param, index) => (
                    <Line
                      key={param}
                      type="monotone"
                      dataKey={param}
                      stroke={lineColors[index % lineColors.length]}
                      activeDot={{ r: 8 }}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SG3125Analyzer;
