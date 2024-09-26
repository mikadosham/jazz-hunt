import React, { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import SearchBar from "../components/SearchBar";
import SongList from "../components/SongList";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function HomePage() {
  const [songData, setSongData] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [selectedKey, setSelectedKey] = useState("c"); // Default to 'c'
  const [result, setResult] = useState(null);
  const [pages, setPages] = useState([]); // Holds the images for all pages
  const [isFullScreen, setIsFullScreen] = useState(false); // State to handle full screen mode

  useEffect(() => {
    fetch("/real_book_contents.json")
      .then((response) => response.json())
      .then((data) => {
        setSongData(data.standards || []); // Ensure it's always an array
      });
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setQuery(query);
    if (query && songData.length > 0) {
      const filtered = songData.filter((song) =>
        song.title.toLowerCase().includes(query)
      );
      setFilteredSongs(filtered);
    } else {
      setFilteredSongs([]);
    }
  };

  const handleKeyChange = (e) => {
    setSelectedKey(e.target.value);
    if (result) {
      renderPages(result.page, result[e.target.value], result.num_pages);
    }
  };

  const handleSelectSong = (song) => {
    setResult(song);
    setFilteredSongs([]);

    const availableKeys = ["c", "bass", "bb", "eb"];
    const firstAvailableKey = availableKeys.find((key) => song[key] !== "null");

    if (firstAvailableKey) {
      setSelectedKey(firstAvailableKey);
      renderPages(song.page, song[firstAvailableKey], song.num_pages);
    }
  };

  const renderPages = async (startPage, pdfUrl, numPages) => {
    const url = pdfUrl || "/real_books/default.pdf"; // Use default or a fallback if URL is missing
    const loadingTask = pdfjsLib.getDocument(url);

    loadingTask.promise.then((pdf) => {
      const pagesArray = [];
      for (let i = 0; i < numPages; i++) {
        pdf.getPage(startPage + i).then((page) => {
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          page.render(renderContext).promise.then(() => {
            pagesArray.push(canvas.toDataURL());
            if (pagesArray.length === numPages) {
              setPages(pagesArray); // Only set the pages state once all pages are rendered
            }
          });
        });
      }
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Search for a Song</h1>
      <SearchBar
        query={query}
        onSearchChange={handleSearchChange}
        selectedKey={selectedKey}
        onKeyChange={handleKeyChange}
      />

      <SongList songs={filteredSongs} onSelectSong={handleSelectSong} />

      {result && pages.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <p>
            Found "{result.title}" on page {result.page} ({pages.length}{" "}
            {pages.length > 1 ? "pages" : "page"})
          </p>
          <button onClick={() => setIsFullScreen(true)}>View Fullscreen</button>
          <div
            className={
              isFullScreen
                ? "fullscreen-carousel carousel-wrapper"
                : "carousel-wrapper"
            }
          >
            <Carousel showThumbs={false} infiniteLoop>
              {pages.map((page, index) => (
                <div key={index}>
                  <img src={page} alt={`Page ${index + 1}`} />
                </div>
              ))}
            </Carousel>
            {isFullScreen && (
              <button
                style={{
                  marginTop: "10px",
                  padding: "10px",
                  zIndex: 1100,
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                }}
                onClick={() => setIsFullScreen(false)}
              >
                Exit Fullscreen
              </button>
            )}
          </div>
        </div>
      )}

      {!result && query && filteredSongs.length === 0 && (
        <p>No results found for "{query}". Please try another song title.</p>
      )}
    </div>
  );
}

export default HomePage;
