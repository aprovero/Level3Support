// Load required libraries for the SG3125 Analyzer
(function() {
  // Function to load script and resolve promise when loaded
  function loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
      
      document.head.appendChild(script);
    });
  }
  
  // Function to load CSS
  function loadCSS(url) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
      
      document.head.appendChild(link);
    });
  }
  
  // Define file system mock for development if needed
  if (!window.fs) {
    window.fs = {
      // Simple implementation for file reading
      readFile: async function(filename) {
        try {
          const response = await fetch(filename);
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }
          return await response.arrayBuffer();
        } catch (error) {
          console.error(`Error reading file ${filename}:`, error);
          throw error;
        }
      }
    };
  }
  
  // Start loading dependencies
  Promise.all([
    // Load React
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/react/17.0.2/umd/react.production.min.js'),
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/react-dom/17.0.2/umd/react-dom.production.min.js'),
    
    // Load PapaParse for CSV parsing
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js'),
    
    // Load Recharts for charts
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/recharts/2.1.15/Recharts.min.js'),
    
    // Load Lodash for utility functions
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js')
  ])
  .then(() => {
    console.log('All dependencies loaded successfully');
  })
  .catch(error => {
    console.error('Failed to load dependencies:', error);
    
    // Display error message in the app container
    document.getElementById('sg3125-analyzer-root').innerHTML = `
      <div class="analyzer-error">
        <h3>Error Loading Dependencies</h3>
        <p>${error.message}</p>
        <button onclick="window.location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mt-4">
          Retry
        </button>
      </div>
    `;
  });
})();
