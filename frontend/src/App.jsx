import { useEffect, useState } from 'react'

function App() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  },[])

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/test");
      const data = await res.json();
      setMessage(data.message);
    } catch (err) { 
      setError(err);
      console.error("Error fetching data.. ", err);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      <p>{message}</p>
    </div>
  )
}

export default App
