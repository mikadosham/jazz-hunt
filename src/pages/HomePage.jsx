import React, { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/build/pdf";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.entry";
import SearchBar from "../components/SearchBar";
import SongList from "../components/SongList";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import KeySelector from "../components/KeySelector";
import { auth } from "../firebase";
//import pdfMapping from "../pdfMapping";
import loadingGif from "../assets/loading.gif";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

function HomePage() {
  const [songData, setSongData] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [selectedKey, setSelectedKey] = useState("c");
  const [result, setResult] = useState(null);
  const [pages, setPages] = useState([]);
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
      const selectedVersion = result.versions[key];
      if (
        selectedVersion &&
        selectedVersion.file &&
        selectedVersion.page !== null
      ) {
        renderPages(
          selectedVersion.page, // Starting page for the selected key
          selectedVersion.file, // PDF file URL for the selected key
          selectedVersion.num_pages // Number of pages for the selected key
        );
      } else {
        console.error(`Data missing for the ${key} version.`);
      }
    } else {
      console.error("No song selected to change key.");
    }
  };

  const handleSelectSong = (song) => {
    setResult(song);
    setFilteredSongs([]);
    setQuery(song.title);

    const availableKeys = ["C", "Bb", "Eb", "Bass"];
    const firstAvailableKey = availableKeys.find(
      (key) => song.versions[key]?.file
    );

    if (firstAvailableKey) {
      setSelectedKey(firstAvailableKey);
      const selectedVersion = song.versions[firstAvailableKey];
      if (selectedVersion?.file && selectedVersion.page !== null) {
        renderPages(
          selectedVersion.page,
          selectedVersion.file,
          selectedVersion.num_pages
        );
      } else {
        console.error(`Data missing for ${firstAvailableKey} version.`);
      }
    } else {
      console.error("No available keys found for this song.");
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

    const fullPdfUrl = "/real_books/" + pdfUrl;

    setLoading(true); // Start loading animation

    pdfjsLib
      .getDocument({ url: fullPdfUrl })
      .promise.then((pdf) => {
        // Load the first page
        return renderPage(pdf, startPage).then((firstPageImage) => {
          setPages([firstPageImage]); // Display the first page
          pdfSectionRef.current?.scrollIntoView({ behavior: "smooth" }); // Scroll to the PDF section

          // Load remaining pages in the background
          const remainingPagePromises = [];
          for (let i = 1; i < numPages; i++) {
            remainingPagePromises.push(renderPage(pdf, startPage + i));
          }

          // Add the remaining pages once all are loaded
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

  return (
    <div className="main">
      <button className="hidden logout-button" onClick={handleLogout}>
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
              <KeySelector
                availableKeys={["C", "Bb", "Eb", "Bass"].filter(
                  (key) => result.versions[key] && result.versions[key].file
                )}
                selectedKey={selectedKey}
                onKeyChange={handleKeyChange}
              />
            </div>
            <div className={"carousel-container"}>
              {pages.length > 1 ? (
                <Carousel
                  showArrows={true}
                  emulateTouch={true}
                  renderIndicator={() => null}
                  dynamicHeight={false}
                  showThumbs={true} // Enable thumbnails only for multiple slides
                >
                  {pages.map((page, index) => (
                    <div key={index}>
                      <img src={page} alt={`Page ${index + 1}`} />
                    </div>
                  ))}
                </Carousel>
              ) : (
                <div>
                  <img
                    className="single-image"
                    src={pages[0]}
                    alt="Single Page"
                  />
                </div>
              )}
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
