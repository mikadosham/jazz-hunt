import React, { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import SearchBar from "../components/SearchBar";
import SongList from "../components/SongList";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import KeySelector from "../components/KeySelector";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExpand, faCompress } from "@fortawesome/free-solid-svg-icons";
import { auth } from "../firebase";
import pdfMapping from "../pdfMapping";
import loadingGif from "../assets/loading.gif";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function HomePage() {
  const [songData, setSongData] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [selectedKey, setSelectedKey] = useState("c");
  const [result, setResult] = useState(null);
  const [pages, setPages] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const pdfSectionRef = useRef(null);

  const handleLogout = () => {
    auth.signOut().catch((error) => {
      console.error("Error signing out:", error);
    });
  };

  useEffect(() => {
    fetch("/real_book_contents.json")
      .then((response) => response.json())
      .then((data) => {
        setSongData(data.standards || []);
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

  const handleClear = () => {
    setQuery("");
    setResult(null);
    setFilteredSongs([]);
  };

  const handleKeyChange = (key) => {
    setSelectedKey(key);

    if (result) {
      const volume = `vol${result.volume}-5th`;
      const pdfUrl = pdfMapping[volume]?.[key.toLowerCase()];

      if (pdfUrl) {
        renderPages(result.page, pdfUrl, result.num_pages);
      } else {
        console.error(`PDF URL not found for ${volume}-${key}`);
      }
    }
  };

  const handleSelectSong = (song) => {
    setResult(song);
    setFilteredSongs([]);
    setQuery(song.title); // Update the search input with the selected song's title

    const availableKeys = ["c", "bass", "bb", "eb"];
    const firstAvailableKey = availableKeys.find(
      (key) => song[key.toUpperCase()] !== "null"
    );

    if (firstAvailableKey) {
      setSelectedKey(firstAvailableKey);
      const volume = `vol${song.volume}-5th`; // Assuming 'volume' holds the number like '1', '2', etc.
      const pdfUrl = pdfMapping[volume]?.[firstAvailableKey];

      if (pdfUrl) {
        renderPages(song.page, pdfUrl, song.num_pages);
      } else {
        console.error(`PDF URL not found for ${volume}-${firstAvailableKey}`);
      }
    }
  };

  const renderPage = (pdf, pageNumber) => {
    return pdf.getPage(pageNumber).then((page) => {
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      return page
        .render({ canvasContext: context, viewport })
        .promise.then(() => {
          return canvas.toDataURL();
        });
    });
  };

  const renderPages = (startPage, pdfUrl, numPages) => {
    if (!pdfUrl) {
      console.error("Invalid PDF URL:", pdfUrl);
      alert("The PDF file could not be found.");
      return;
    }

    setLoading(true); // Start loading animation

    pdfjsLib
      .getDocument({ url: pdfUrl })
      .promise.then((pdf) => {
        // Lazy load the first page immediately
        return renderPage(pdf, startPage).then((firstPageImage) => {
          setPages([firstPageImage]);
          pdfSectionRef.current?.scrollIntoView({ behavior: "smooth" });

          // Load remaining pages in the background
          const remainingPagePromises = [];
          for (let i = 1; i < numPages; i++) {
            remainingPagePromises.push(renderPage(pdf, startPage + i));
          }

          return Promise.all(remainingPagePromises).then((remainingPages) => {
            setPages((prevPages) => [...prevPages, ...remainingPages]);
          });
        });
      })
      .finally(() => {
        setLoading(false); // End loading animation
      })
      .catch((error) => {
        console.error("Error rendering pages:", error);
        alert("Sorry, we encountered an issue while loading the document.");
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
      <button className="logout-button" onClick={handleLogout}>
        Logout
      </button>

      <SearchBar
        query={query}
        onSearchChange={handleSearchChange}
        onClear={handleClear}
      />
      <SongList songs={filteredSongs} onSelectSong={handleSelectSong} />

      {loading ? (
        <div className="loading-container">
          <img
            src={loadingGif}
            alt="Loading..."
            className="loading-animation"
          />
        </div>
      ) : (
        result && (
          <div className="results" ref={pdfSectionRef}>
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
                availableKeys={["C", "Bb", "Eb", "BASS"].filter(
                  (key) => result[key] !== "null"
                )}
                selectedKey={selectedKey}
                onKeyChange={handleKeyChange}
              />
            </div>
            <div
              className={`carousel-container ${
                isFullScreen ? "fullscreen" : ""
              }`}
            >
              <Carousel
                showArrows={true}
                emulateTouch={true}
                renderIndicator={() => null}
                dynamicHeight={false}
              >
                {pages.map((page, index) => (
                  <div key={index}>
                    <img src={page} alt={`Page ${index + 1}`} />
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        )
      )}

      {!result && query && filteredSongs.length === 0 && (
        <p className="no-results">
          No results found for "{query}". Please try another song title.
        </p>
      )}
    </div>
  );
}

export default HomePage;
