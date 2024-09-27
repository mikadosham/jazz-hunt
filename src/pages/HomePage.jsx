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
import { auth } from "../firebase"; // Import the auth instance

console.log("PDF.js version:", pdfjsLib.version);

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function HomePage() {
  const [songData, setSongData] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [selectedKey, setSelectedKey] = useState("c"); // Default to 'c'
  const [result, setResult] = useState(null);
  const [pages, setPages] = useState([]); // Holds the images for all pages
  const [isFullScreen, setIsFullScreen] = useState(false); // State to handle fullscreen mode
  const pdfSectionRef = useRef(null); // Reference for the PDF section

  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        console.log("User signed out successfully.");
        // You can redirect the user to the login page or perform other actions here
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

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

  const handleClear = () => {
    setQuery("");
    setResult(null);
    setFilteredSongs([]);
  };

  const handleKeyChange = (key) => {
    setSelectedKey(key);
    if (result) {
      renderPages(result.page, result[key], result.num_pages);
    }
  };

  const handleSelectSong = (song) => {
    setResult(song);
    setFilteredSongs([]);
    setQuery(song.title); // Update the search input with the selected song's title

    const availableKeys = ["C", "Bb", "Eb", "BASS"];
    const firstAvailableKey = availableKeys.find((key) => song[key] !== "null");

    if (firstAvailableKey) {
      setSelectedKey(firstAvailableKey);
      renderPages(song.page, song[firstAvailableKey], song.num_pages);
    }
  };

  const renderPages = (startPage, pdfUrl, numPages) => {
    console.log("Attempting to load PDF from URL:", pdfUrl);
    if (!pdfUrl) {
      console.error("Invalid PDF URL:", pdfUrl);
      alert("The PDF file could not be found.");
      return;
    }
    pdfjsLib
      .getDocument(pdfUrl)
      .promise.then((pdf) => {
        if (startPage < 1 || startPage + numPages > pdf.numPages) {
          throw new Error(
            `Page range is out of bounds. Start page: ${startPage}, Number of pages: ${numPages}, Total pages in PDF: ${pdf.numPages}`
          );
        }
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
        pdfSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      })
      .catch((error) => {
        console.error("Error rendering pages:", error);
        console.error("Stack trace:", error.stack); // Logs stack trace for more context
        console.error("Failed PDF URL:", pdfUrl);
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

      {result && (
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
            className={`carousel-container ${isFullScreen ? "fullscreen" : ""}`}
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
