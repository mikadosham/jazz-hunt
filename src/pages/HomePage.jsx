import React, { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import SearchBar from "../components/SearchBar";
import SongList from "../components/SongList";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import KeySelector from "../components/KeySelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faCompress } from "@fortawesome/free-solid-svg-icons";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function HomePage() {
  const [songData, setSongData] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [selectedKey, setSelectedKey] = useState("c"); // Default to 'c'
  const [result, setResult] = useState(null);
  const [pages, setPages] = useState([]); // Holds the images for all pages
  const [isFullScreen, setIsFullScreen] = useState(false); // State to handle fullscreen mode

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
    setResult(null);

    if (query && songData.length > 0) {
      const filtered = songData.filter((song) =>
        song.title.toLowerCase().includes(query)
      );
      setFilteredSongs(filtered);
    } else {
      setFilteredSongs([]);
    }
  };

  const handleKeyChange = (key) => {
    setSelectedKey(key);
    if (result) {
      renderPages(result.page, result[key], result.num_pages);
    }
  };

  const handleSelectSong = (song) => {
    console.log("Selected song:", song);

    setResult(song);
    setFilteredSongs([]);
    setQuery(song.title); // Update the search input with the selected song's title

    const availableKeys = ["c", "bass", "bb", "eb"];
    const firstAvailableKey = availableKeys.find((key) => song[key] !== "null");

    console.log("Selected key:", firstAvailableKey);
    console.log("PDF URL for Bb:", song.bb);
    console.log("Starting page number:", song.page);

    if (firstAvailableKey) {
      setSelectedKey(firstAvailableKey);
      renderPages(song.page, song[firstAvailableKey], song.num_pages);
    }
  };

  const renderPages = (startPage, pdfUrl, numPages) => {
    pdfjsLib
      .getDocument(pdfUrl)
      .promise.then((pdf) => {
        const pagePromises = [];
        for (let i = 0; i < numPages; i++) {
          pagePromises.push(pdf.getPage(startPage + i));
        }
        return Promise.all(pagePromises);
      })
      .then((pages) => {
        const pageImages = pages.map((page) => {
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render the page onto the canvas and return a promise
          return page
            .render({ canvasContext: context, viewport })
            .promise.then(() => {
              return canvas.toDataURL();
            });
        });
        return Promise.all(pageImages);
      })
      .then((images) => {
        setPages(images);
      })
      .catch((error) => {
        console.error("Error rendering pages:", error);
      });
  };

  const toggleFullscreen = () => {
    if (!isFullScreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className="main">
      <SearchBar query={query} onSearchChange={handleSearchChange} />
      <SongList songs={filteredSongs} onSelectSong={handleSelectSong} />

      {result && (
        <div className="results">
          <div className="settings-wrapper">
            <button
              onClick={toggleFullscreen}
              className={
                isFullScreen
                  ? "fullscreen-icon compress"
                  : "fullscreen-icon expand"
              }
            >
              <FontAwesomeIcon icon={isFullScreen ? faCompress : faExpand} />
            </button>
            <KeySelector
              availableKeys={["c", "bass", "bb", "eb"].filter(
                (key) => result[key] !== "null"
              )}
              selectedKey={selectedKey}
              onKeyChange={handleKeyChange}
            />
          </div>
          <div
            className={`carousel-container ${isFullScreen ? "fullscreen" : ""}`}
          >
            <Carousel>
              {pages.map((page, index) => (
                <div key={index}>
                  <img src={page} alt={`Page ${index + 1}`} />
                </div>
              ))}
            </Carousel>
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
