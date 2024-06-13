import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css'; // Import the CSS file

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [retrying, setRetrying] = useState(false);
  const [newMovie, setNewMovie] = useState({ title: '', openingText: '', releaseDate: '' });
  const intervalRef = useRef(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('https://swapi.dev/api/films/');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      const transformedData = result.results.map((ele) => ({
        id: ele.episode_id,
        title: ele.title,
        opening_text: ele.opening_crawl,
        releaseDate: ele.release_date,
      }));

      setData(transformedData);

      if (transformedData.length === 0) {
        clearInterval(intervalRef.current);
        setRetrying(false);
      } else {
        setRetrying(false);
        clearInterval(intervalRef.current);
      }
    } catch (error) {
      setError('Something went wrong... Retrying');
      setRetrying(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (retrying) {
      intervalRef.current = setInterval(fetchData, 5000);
    }

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [retrying, fetchData]);

  const cancelRetry = useCallback(() => {
    clearInterval(intervalRef.current);
    setRetrying(false);
    setError('');
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewMovie((prev) => ({ ...prev, [name]: value }));
  }, []);

  const addMovie = useCallback((e) => {
    e.preventDefault();
    console.log(newMovie);
    setNewMovie({ title: '', openingText: '', releaseDate: '' });
  }, [newMovie]);

  const formatText = (text) => {
    return { __html: text.replace(/(?:\r\n|\r|\n)/g, '<br />') };
  };

  return (
    <div className="app">
      <form className="form" onSubmit={addMovie}>
        <div className="form-group">
          <label>Title: </label>
          <input type="text" name="title" value={newMovie.title} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Opening Text: </label>
          <textarea name="openingText" value={newMovie.openingText} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Release Date: </label>
          <input type="date" name="releaseDate" value={newMovie.releaseDate} onChange={handleChange} />
        </div>
        <button className="button" type="submit">Add Movie</button>
      </form>

      <button className="button" onClick={fetchData}>Fetch Data</button>
      {retrying && <button className="button" onClick={cancelRetry}>Cancel Retry</button>}

      {isLoading && <div className="loader">Loading...</div>}

      {error && <div className="error">{error}</div>}

      {!isLoading && data && data.length === 0 && (
        <div className="no-movies">No movies found</div>
      )}

      {data && data.length > 0 && (
        <div>
          <h3>Fetched Data:</h3>
          {data.map((movie) => (
            <div key={movie.id}>
              <h4>{movie.title}</h4>
              <p>{movie.releaseDate}</p>
              <p dangerouslySetInnerHTML={formatText(movie.opening_text)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
