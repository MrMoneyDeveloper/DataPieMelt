import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { gsap } from 'gsap';

function App() {
  const [number, setNumber] = useState(0);
  const [points, setPoints] = useState(0);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [plotUrl, setPlotUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const resultRef = useRef(null);
  const logRef = useRef(null);

  const runOp = async (op, param) => {
    setLogs([]);
    setResult(null);
    setPlotUrl(null);
    setError(null);
    setLoading(true);
    try {
      if (isNaN(param) || param === '') {
        throw new Error('Please provide a valid number');
      }
      const { data } = await axios.post('/api/run', { op, param });
      if (data.success) {
        setLogs(data.logs || []);
        setResult(data.result);
        if (data.plotUrl) setPlotUrl(data.plotUrl);
      } else {
        setLogs(data.logs || []);
        setError(data.error || 'Error');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resultRef.current) {
      gsap.fromTo(resultRef.current, { opacity: 0 }, { opacity: 1, duration: 0.5 });
    }
  }, [result, plotUrl]);

  useEffect(() => {
    if (logRef.current) {
      gsap.fromTo(logRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 });
    }
  }, [logs]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>DataPieMelt Demo</h1>
      <div>
        <input type="number" value={number} onChange={e => setNumber(e.target.value)} />
        <button onClick={() => runOp('factorial', number)}>Run Factorial</button>
      </div>
      <div>
        <input type="number" value={points} onChange={e => setPoints(e.target.value)} />
        <button onClick={() => runOp('plot', points)}>Generate Plot</button>
      </div>
      {loading && <p>Processing...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {result !== null && <p ref={resultRef}>Result: {result}</p>}
      {plotUrl && (
        <div ref={resultRef}>
          <img src={plotUrl} alt="plot" />
        </div>
      )}
      <pre ref={logRef}>{logs.join('\n')}</pre>
    </div>
  );
}

export default App;
