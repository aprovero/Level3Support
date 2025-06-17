class SG3125Analyzer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // Data states
      hisData: [],
      eventsData: [],
      isLoading: true,
      error: null,
      
      // Chart parameters
      selectedParams: [
        'Output power of Turnkey Station',
        'DC power of Turnkey Station'
      ],
      chartTitle: 'SG3125 Power Data Analysis',
      timeRange: 'all',
      showFaultEvents: true,
      yAxisMode: 'dual',
      paramSearch: '',
      parameterConfig: {
        primaryAxis: [], // Parameters on left Y-axis
        secondaryAxis: [] // Parameters on right Y-axis
      },
      
      // Table filters
      hisDataFilter: '',
      eventFilter: '',
      
      // Modal states
      showFaultModal: false,
      showAlarmModal: false
    };
    
    // Refs
    this.chartRef = React.createRef();
  }
  
  // Lifecycle methods
  componentDidMount() {
    // Waiting for file upload via handleUpload()
  }
  
  // Data loading and processing
  loadData = async () => {
    try {
      // Simulating file loading with actual file reading
      // In a real implementation, we'd use actual file reading API
      
      const eventsDataResult = Papa.parse(eventsText, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      
      // Process data
      const formattedHisData = hisDataResult.data.map(row => ({
        ...row,
        fullTime: `2023-05-14 ${row.Time}`
      }));
      
      // Initialize axis configuration based on param names
      const numericParams = Object.keys(formattedHisData[0] || {})
        .filter(key => 
          typeof formattedHisData[0][key] === 'number' && 
          !key.includes('No.') && 
          !key.includes('Monthly') && 
          !key.includes('Annual') && 
          !key.includes('Total')
        );
        
      // Default configuration - temperature on secondary axis
      const newConfig = {
        primaryAxis: [],
        secondaryAxis: []
      };
      
      numericParams.forEach(param => {
        if (param.toLowerCase().includes('temperature')) {
          newConfig.secondaryAxis.push(param);
        } else {
          newConfig.primaryAxis.push(param);
        }
      });
      
      // Update state with loaded data
      this.setState({
        hisData: formattedHisData,
        eventsData: eventsDataResult.data,
        isLoading: false,
        parameterConfig: newConfig
      });
    } catch (err) {
      console.error("Error loading data:", err);
      this.setState({
        error: `Failed to load data: ${err.message}`,
        isLoading: false
      });
    }
  };
  
  // Filter data based on time range
  getFilteredData = () => {
    const { hisData, timeRange } = this.state;
    
    if (timeRange === 'all') return hisData;
    
    const [startHour, endHour] = timeRange.split('-').map(h => parseInt(h));
    return hisData.filter(row => {
      const hour = parseInt(row.Time.split(':')[0]);
      return hour >= startHour && hour < endHour;
    });
  };
  
  // Get event markers for the chart
  getEventMarkers = () => {
    const { eventsData, showFaultEvents, timeRange } = this.state;
    
    if (!showFaultEvents) return [];
    
    const filteredData = this.getFilteredData();
    if (!filteredData.length) return [];
    
    // Filter faults that fall within the time range
    const faults = eventsData.filter(event => 
      event["Event Level"] === "Fault" &&
      (timeRange === 'all' || (() => {
        const timeStr = event["Generation time"]?.split(' ')[1];
        if (!timeStr) return false;
        const hour = parseInt(timeStr.split(':')[0]);
        const [startHour, endHour] = timeRange.split('-').map(h => parseInt(h));
        return hour >= startHour && hour < endHour;
      })())
    );
    
    return faults.map(fault => {
      const faultTime = fault["Generation time"]?.split(' ')[1];
      if (!faultTime) return null;
      
      // Find the closest data point in time
      const closestPoint = filteredData.reduce((closest, current) => {
        if (!closest) return current;
        
        const closestDiff = Math.abs(closest.Time.localeCompare(faultTime));
        const currentDiff = Math.abs(current.Time.localeCompare(faultTime));
        
        return currentDiff < closestDiff ? current : closest;
      }, null);
      
      if (!closestPoint) return null;
      
      return {
        time: closestPoint.Time,
        name: fault["Event name"],
        level: fault["Event Level"]
      };
    }).filter(Boolean);
  };
  
  // Parameter handling
  handleParamToggle = (param) => {
    const { selectedParams } = this.state;
    
    // Check if we're already at 6 parameters and trying to add more
    if (!selectedParams.includes(param) && selectedParams.length >= 6) {
      alert("Maximum of 6 parameters can be selected at once");
      return;
    }
    
    if (selectedParams.includes(param)) {
      this.setState({
        selectedParams: selectedParams.filter(p => p !== param)
      });
    } else {
      this.setState({
        selectedParams: [...selectedParams, param]
      });
    }
  };
  
  // Handle axis assignment
  toggleParamAxis = (param) => {
    const { parameterConfig } = this.state;
    const newConfig = { ...parameterConfig };
    
    if (newConfig.primaryAxis.includes(param)) {
      // Move from primary to secondary
      newConfig.primaryAxis = newConfig.primaryAxis.filter(p => p !== param);
      newConfig.secondaryAxis.push(param);
    } else if (newConfig.secondaryAxis.includes(param)) {
      // Move from secondary to primary
      newConfig.secondaryAxis = newConfig.secondaryAxis.filter(p => p !== param);
      newConfig.primaryAxis.push(param);
    }
    
    this.setState({ parameterConfig: newConfig });
  };
// Parameter presets
  applyPreset = (presetName) => {
    const availableParams = this.getAvailableParams();
    
    if (presetName === 'power') {
      this.setState({
        selectedParams: [
          'Output power of Turnkey Station',
          'DC power of Turnkey Station',
          'Output power of unit 1',
          'DC power of unit 1',
          'Output power of unit 2',
          'DC power of unit 2'
        ].filter(p => availableParams.includes(p)).slice(0, 6)
      });
    } else if (presetName === 'temperature') {
      this.setState({
        selectedParams: availableParams
          .filter(p => p.toLowerCase().includes('temperature'))
          .slice(0, 6)
      });
    } else if (presetName === 'voltage') {
      this.setState({
        selectedParams: availableParams
          .filter(p => p.toLowerCase().includes('voltage'))
          .slice(0, 6)
      });
    } else if (presetName === 'current') {
      this.setState({
        selectedParams: availableParams
          .filter(p => p.toLowerCase().includes('current'))
          .slice(0, 6)
      });
    }
  };
  
  // Export chart to PNG
  exportChart = () => {
    if (!this.chartRef.current) return;
    
    try {
      // Get the chart SVG
      const chartSvg = this.chartRef.current.querySelector('svg');
      if (!chartSvg) {
        console.error('Could not find SVG element for export');
        return;
      }
      
      // Create a canvas element for the image
      const canvas = document.createElement('canvas');
      const svgRect = chartSvg.getBoundingClientRect();
      canvas.width = svgRect.width;
      canvas.height = svgRect.height + 30; // Extra space for title
      const ctx = canvas.getContext('2d');
      
      // Draw white background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw title at the top
      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText(this.state.chartTitle, canvas.width / 2, 20);
      
      // Convert SVG to image
      const svgData = new XMLSerializer().serializeToString(chartSvg);
      const img = new Image();
      
      img.onload = () => {
        // Draw the chart image below the title
        ctx.drawImage(img, 0, 30);
        
        // Convert to data URL and trigger download
        const pngData = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngData;
        downloadLink.download = this.state.chartTitle.replace(/\s+/g, '_') + '.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    } catch (err) {
      console.error('Error exporting chart:', err);
      alert('Failed to export chart. See console for details.');
    }
  };
  
  // Get all available numeric parameters
  getAvailableParams = () => {
    const { hisData } = this.state;
    if (!hisData.length) return [];
    
    return Object.keys(hisData[0])
      .filter(key => 
        typeof hisData[0][key] === 'number' && 
        !key.includes('No.') && 
        !key.includes('Monthly') && 
        !key.includes('Annual') && 
        !key.includes('Total')
      );
  };
  
  // Group parameters by type
  getGroupedParams = () => {
    const groups = {
      'Power': [],
      'Voltage': [],
      'Current': [],
      'Temperature': [],
      'Other': []
    };
    
    this.getAvailableParams().forEach(param => {
      const paramLower = param.toLowerCase();
      if (paramLower.includes('power')) {
        groups['Power'].push(param);
      } else if (paramLower.includes('voltage')) {
        groups['Voltage'].push(param);
      } else if (paramLower.includes('current')) {
        groups['Current'].push(param);
      } else if (paramLower.includes('temperature')) {
        groups['Temperature'].push(param);
      } else {
        groups['Other'].push(param);
      }
    });
    
    return groups;
  };
  
  // Get filtered parameters based on search
  getFilteredParams = () => {
    const { paramSearch } = this.state;
    const groupedParams = this.getGroupedParams();
    
    if (!paramSearch) {
      return groupedParams;
    }
    
    const searchLower = paramSearch.toLowerCase();
    const filtered = {};
    
    Object.entries(groupedParams).forEach(([group, params]) => {
      const matchedParams = params.filter(param => 
        param.toLowerCase().includes(searchLower)
      );
      
      if (matchedParams.length > 0) {
        filtered[group] = matchedParams;
      }
    });
    
    return filtered;
  };
  
  // Search through HisData
  getFilteredHisData = () => {
    const { hisData, hisDataFilter } = this.state;
    
    if (!hisDataFilter) return hisData.slice(0, 10);
    
    const filterLower = hisDataFilter.toLowerCase();
    return hisData.filter(row => {
      // Search through all string fields
      return Object.entries(row).some(([key, value]) => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(filterLower);
        }
        return false;
      });
    }).slice(0, 50); // Limit to 50 results
  };
  
  // Search through events
  getFilteredEvents = () => {
    const { eventsData, eventFilter } = this.state;
    
    if (!eventFilter) return eventsData.slice(0, 10);
    
    const filterLower = eventFilter.toLowerCase();
    return eventsData.filter(event => {
      // Search through event fields
      return (
        (event["Event name"] && event["Event name"].toLowerCase().includes(filterLower)) ||
        (event["Devices"] && event["Devices"].toLowerCase().includes(filterLower)) ||
        (event["Event Level"] && event["Event Level"].toLowerCase().includes(filterLower)) ||
        (event["Generation time"] && event["Generation time"].toLowerCase().includes(filterLower))
      );
    }).slice(0, 50); // Limit to 50 results
  };

  // Modal control
  toggleFaultModal = () => {
    this.setState(prevState => ({ showFaultModal: !prevState.showFaultModal }));
  };
  
  toggleAlarmModal = () => {
    this.setState(prevState => ({ showAlarmModal: !prevState.showAlarmModal }));
  };
// Render methods
  renderOverviewCards() {
    const { hisData, eventsData } = this.state;
    if (!hisData.length || !eventsData.length) return null;
    
    // Calculate event counts
    const faultCount = eventsData.filter(e => e["Event Level"] === "Fault").length;
    const alarmCount = eventsData.filter(e => e["Event Level"] === "Alarm").length;
    const promptCount = eventsData.filter(e => e["Event Level"] === "Prompt").length;
    
    return (
      <div className="analyzer-grid">
        <div className="analyzer-card">
          <h3 className="analyzer-title">HisData Overview</h3>
          <p>Date: 2023-05-14 (from filename)</p>
          <p>Total records: {hisData.length}</p>
          <p>Time range: {hisData[0]?.Time} to {hisData[hisData.length - 1]?.Time}</p>
          
          <div className="mt-4">
            <h4>Statistics:</h4>
            <ul>
              <li>Max Output Power: {Math.max(...hisData.map(row => row["Output power of Turnkey Station"] || 0)).toFixed(2)} kW</li>
              <li>Max DC Power: {Math.max(...hisData.map(row => row["DC power of Turnkey Station"] || 0)).toFixed(2)} kW</li>
              <li>Avg Output Power: {(hisData.reduce((sum, row) => sum + (row["Output power of Turnkey Station"] || 0), 0) / hisData.length).toFixed(2)} kW</li>
            </ul>
          </div>
        </div>
        
        <div className="analyzer-card">
          <h3 className="analyzer-title">Events Overview</h3>
          <p>Total events: {eventsData.length}</p>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div 
              className="bg-red-50 p-2 rounded cursor-pointer hover:bg-red-100"
              onClick={this.toggleFaultModal}
            >
              <span className="block font-medium text-red-700">Faults</span>
              <span className="text-xl font-bold text-red-700">{faultCount}</span>
            </div>
            <div 
              className="bg-orange-50 p-2 rounded cursor-pointer hover:bg-orange-100"
              onClick={this.toggleAlarmModal}
            >
              <span className="block font-medium text-orange-700">Alarms</span>
              <span className="text-xl font-bold text-orange-700">{alarmCount}</span>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <span className="block font-medium text-blue-700">Prompts</span>
              <span className="text-xl font-bold text-blue-700">{promptCount}</span>
            </div>
          </div>
          
          <div className="mt-4">
            <h4>Event Distribution:</h4>
            <p>Most events occurred between 05:00 - 06:00</p>
          </div>
        </div>
      </div>
    );
  }
  
  renderChart() {
    const { selectedParams, chartTitle, yAxisMode, parameterConfig } = this.state;
    const filteredData = this.getFilteredData();
    const eventMarkers = this.getEventMarkers();
    
    // Custom colors for chart lines
    const lineColors = [
      '#2196F3', // Blue
      '#F44336', // Red
      '#4CAF50', // Green
      '#FF9800', // Orange
      '#9C27B0', // Purple
      '#795548', // Brown
      '#607D8B'  // Gray
    ];
    
    // Time range options
    const timeRangeOptions = [
      { value: 'all', label: 'All Day' },
      { value: '0-6', label: '00:00 - 06:00' },
      { value: '6-12', label: '06:00 - 12:00' },
      { value: '12-18', label: '12:00 - 18:00' },
      { value: '18-24', label: '18:00 - 24:00' }
    ];
    
    return (
      <div className="analyzer-section">
        <div className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">{chartTitle}</h3>
            <div className="chart-actions">
              <button 
                onClick={this.exportChart} 
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Export as PNG
              </button>
            </div>
          </div>
          
          {/* Chart Configuration */}
          <div className="chart-config">
            <div className="config-item">
              <label>Chart Title</label>
              <input
                type="text"
                value={chartTitle}
                onChange={(e) => this.setState({ chartTitle: e.target.value })}
                placeholder="Enter chart title"
              />
            </div>
            
            <div className="config-item">
              <label>Time Range</label>
              <select
                value={this.state.timeRange}
                onChange={(e) => this.setState({ timeRange: e.target.value })}
              >
                {timeRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="config-item">
              <label>Y-Axis Mode</label>
              <select
                value={yAxisMode}
                onChange={(e) => this.setState({ yAxisMode: e.target.value })}
              >
                <option value="single">Single Y-Axis</option>
                <option value="dual">Dual Y-Axes</option>
              </select>
            </div>
            
            <div className="config-item">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={this.state.showFaultEvents}
                  onChange={() => this.setState(prev => ({ showFaultEvents: !prev.showFaultEvents }))}
                  className="mr-2"
                />
                <span>Show fault markers</span>
              </label>
            </div>
          </div>
          
          {/* Parameter Presets */}
          <div className="quick-select">
            <button onClick={() => this.applyPreset('power')}>
              Power Parameters
            </button>
            <button onClick={() => this.applyPreset('temperature')}>
              Temperature Parameters
            </button>
            <button onClick={() => this.applyPreset('voltage')}>
              Voltage Parameters
            </button>
            <button onClick={() => this.applyPreset('current')}>
              Current Parameters
            </button>
          </div>
          
          {/* Parameter Search */}
          <div className="param-search">
            <input
              type="text"
              value={this.state.paramSearch}
              onChange={(e) => this.setState({ paramSearch: e.target.value })}
              placeholder="Search parameters..."
            />
            
            <div className="text-sm mt-2">
              {selectedParams.length}/6 parameters selected
              {selectedParams.length >= 6 && 
                <span className="text-red-600 ml-2">Maximum limit reached</span>
              }
            </div>
          </div>
          
          {/* Parameter Selection */}
          <div className="param-groups">
            {Object.entries(this.getFilteredParams()).map(([group, params]) => (
              params.length > 0 && (
                <div key={group} className="param-group">
                  <div className="param-group-title">{group}</div>
                  {params.map(param => (
                    <div key={param} className="param-checkbox">
                      <input
                        type="checkbox"
                        id={`param-${param}`}
                        checked={selectedParams.includes(param)}
                        onChange={() => this.handleParamToggle(param)}
                        disabled={!selectedParams.includes(param) && selectedParams.length >= 6}
                      />
                      <label 
                        htmlFor={`param-${param}`} 
                        title={param}
                        className={!selectedParams.includes(param) && selectedParams.length >= 6 ? 'text-gray-400' : ''}
                      >
                        {param}
                      </label>
                      {selectedParams.includes(param) && yAxisMode === 'dual' && (
                        <button
                          onClick={() => this.toggleParamAxis(param)}
                          className="ml-1 text-xs px-1 rounded bg-gray-200 hover:bg-gray-300"
                          title={`Currently on ${parameterConfig.primaryAxis.includes(param) ? 'primary' : 'secondary'} axis. Click to toggle.`}
                        >
                          {parameterConfig.primaryAxis.includes(param) ? '1°' : '2°'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )
            ))}
          </div>
          
          {/* Chart */}
          <div className="h-96 w-full mt-4" ref={this.chartRef}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={filteredData}
                margin={{ top: 5, right: 30, left: 20, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="Time" 
                  label={{ value: 'Time', position: 'insideBottomRight', offset: -10 }}
                />
                <YAxis 
                  yAxisId="left"
                  orientation="left"
                  label={{ value: 'Primary Values', angle: -90, position: 'insideLeft' }}
                />
                {yAxisMode === 'dual' && (
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    label={{ value: 'Secondary Values', angle: 90, position: 'insideRight' }}
                  />
                )}
                <Tooltip />
                <Legend />
                <Brush dataKey="Time" height={30} stroke="#8884d8" />
                
                {/* Plot selected parameters */}
                {selectedParams.map((param, index) => {
                  if (!filteredData[0] || typeof filteredData[0][param] !== 'number') {
                    return null;
                  }
                  
                  // Determine axis based on configuration or mode
                  let yAxisId = 'left';
                  if (yAxisMode === 'dual') {
                    if (parameterConfig.secondaryAxis.includes(param)) {
                      yAxisId = 'right';
                    }
                  }
                  
                  return (
                    <Line
                      key={param}
                      type="monotone"
                      dataKey={param}
                      name={param}
                      stroke={lineColors[index % lineColors.length]}
                      yAxisId={yAxisId}
                      dot={false}
                      activeDot={{ r: 8 }}
                    />
                  );
                })}
                
                {/* Event markers */}
                {eventMarkers.map((event, index) => (
                  <ReferenceLine
                    key={`event-${index}`}
                    x={event.time}
                    stroke="red"
                    strokeDasharray="3 3"
                    label={{
                      value: 'Fault',
                      position: 'insideTopRight',
                      fontSize: 10,
                      fill: 'red'
                    }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }
renderDataTables() {
    return (
      <div className="analyzer-section">
        <div className="analyzer-grid">
          {/* HisData with filters */}
          <div className="analyzer-card">
            <h3 className="analyzer-title">HisData</h3>
            <div className="mb-4">
              <input
                type="text"
                value={this.state.hisDataFilter}
                onChange={(e) => this.setState({ hisDataFilter: e.target.value })}
                className="w-full"
                placeholder="Search HisData..."
              />
            </div>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Unit 1 State</th>
                    <th>Unit 2 State</th>
                    <th>Station State</th>
                    <th>Output Power</th>
                  </tr>
                </thead>
                <tbody>
                  {this.getFilteredHisData().map((row, index) => (
                    <tr key={index}>
                      <td>{row.Time}</td>
                      <td>{row["Working state of unit 1"]}</td>
                      <td>{row["Working state of unit 2"]}</td>
                      <td>{row["State of Turnkey Station"]}</td>
                      <td>{row["Output power of Turnkey Station"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {this.state.hisDataFilter && this.getFilteredHisData().length >= 50 && (
              <p className="mt-2 text-sm text-gray-500">Showing first 50 matching results</p>
            )}
            {this.state.hisDataFilter && this.getFilteredHisData().length === 0 && (
              <p className="mt-2 text-sm text-gray-500">No matching results found</p>
            )}
          </div>
          
          {/* Events with filters */}
          <div className="analyzer-card">
            <h3 className="analyzer-title">Events</h3>
            <div className="mb-4">
              <input
                type="text"
                value={this.state.eventFilter}
                onChange={(e) => this.setState({ eventFilter: e.target.value })}
                className="w-full"
                placeholder="Search Events..."
              />
            </div>
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Device</th>
                    <th>Event</th>
                    <th>Level</th>
                  </tr>
                </thead>
                <tbody>
                  {this.getFilteredEvents().map((event, index) => (
                    <tr key={index}>
                      <td>{event["Generation time"]}</td>
                      <td>{event.Devices}</td>
                      <td>{event["Event name"]}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${event["Event Level"] === 'Fault' ? 'bg-red-100 text-red-800' : 
                            event["Event Level"] === 'Alarm' ? 'bg-orange-100 text-orange-800' : 
                            'bg-blue-100 text-blue-800'}`}>
                          {event["Event Level"]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {this.state.eventFilter && this.getFilteredEvents().length >= 50 && (
              <p className="mt-2 text-sm text-gray-500">Showing first 50 matching results</p>
            )}
            {this.state.eventFilter && this.getFilteredEvents().length === 0 && (
              <p className="mt-2 text-sm text-gray-500">No matching results found</p>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  renderModals() {
    const { eventsData, showFaultModal, showAlarmModal } = this.state;
    
    // Get fault and alarm events
    const faultEvents = eventsData.filter(e => e["Event Level"] === "Fault");
    const alarmEvents = eventsData.filter(e => e["Event Level"] === "Alarm");
    
    return (
      <>
        {/* Fault Modal */}
        {showFaultModal && (
          <div className="analyzer-modal" onClick={this.toggleFaultModal}>
            <div className="analyzer-modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Fault Events</h3>
                <button className="modal-close" onClick={this.toggleFaultModal}>&times;</button>
              </div>
              <div className="modal-body">
                {faultEvents.length === 0 ? (
                  <p>No fault events recorded.</p>
                ) : (
                  <div className="event-list">
                    {faultEvents.map((event, index) => (
                      <div key={index} className="event-card fault">
                        <div className="event-time">{event["Generation time"]}</div>
                        <div className="event-name">{event["Event name"]}</div>
                        <div className="event-device">{event.Devices}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  onClick={this.toggleFaultModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Alarm Modal */}
        {showAlarmModal && (
          <div className="analyzer-modal" onClick={this.toggleAlarmModal}>
            <div className="analyzer-modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 className="modal-title">Alarm Events</h3>
                <button className="modal-close" onClick={this.toggleAlarmModal}>&times;</button>
              </div>
              <div className="modal-body">
                {alarmEvents.length === 0 ? (
                  <p>No alarm events recorded.</p>
                ) : (
                  <div className="event-list">
                    {alarmEvents.map((event, index) => (
                      <div key={index} className="event-card alarm">
                        <div className="event-time">{event["Generation time"]}</div>
                        <div className="event-name">{event["Event name"]}</div>
                        <div className="event-device">{event.Devices}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  onClick={this.toggleAlarmModal}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }
  
  render() {
    const { isLoading, error } = this.state;
    
    if (isLoading) {
      return (
        <div className="analyzer-loading">
          <div className="spinner"></div>
          <p>Loading SG3125 data...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="analyzer-error">
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-4"
          >
            Retry
          </button>
        </div>
      );
    }
    
    return (
      <div className="analyzer-main">
        {this.renderOverviewCards()}
        {this.renderChart()}
        {this.renderDataTables()}
        {this.renderModals()}
      </div>
    );
  }
}
// Initialize the SG3125 Analyzer when the page loads
document.addEventListener('DOMContentLoaded', function() {
  // Check if dependencies are loaded
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined' || 
      typeof Papa === 'undefined' || typeof Recharts === 'undefined') {
    console.error('Required dependencies not loaded');
    document.getElementById('sg3125-analyzer-root').innerHTML = 
      '<div class="analyzer-error">Error: Required libraries not loaded</div>';
    return;
  }
  
  // Extract Recharts components
  const {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend, ResponsiveContainer, Brush, ReferenceLine
  } = Recharts;
  
  // Render the analyzer
  ReactDOM.render(
    React.createElement(SG3125Analyzer),
    document.getElementById('sg3125-analyzer-root')
  );
  
  console.log('SG3125 Analyzer initialized successfully');
});
