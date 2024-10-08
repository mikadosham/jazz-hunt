"use client"; // Ensures client-side code

import React, { useState, useEffect, useRef } from "react";
import SearchBar from "../components/SearchBar";
import SongList from "../components/SongList";
import KeySelector from "../components/KeySelector";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import MySwiperComponent from "../components/MySwiper";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompress, faExpand } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import pdfMapping from "../pdfMapping"; // Your local mapping file
import { useRouter } from "next/navigation"; // For redirecting after logout

const HomePage = () => {
  const router = useRouter();
  const [songData, setSongData] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [selectedKey, setSelectedKey] = useState(null);
  const [result, setResult] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const pdfSectionRef = useRef(null);

  const handleLogout = async () => {
    try {
      await signOut(auth); // Signs the user out
      router.push("/login"); // Redirect to login after logout
    } catch (error) {
      console.error("Failed to logout", error);
    }
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
    setQuery(song.title);

    const availableKeys = ["c", "bass", "bb", "eb"];
    const firstAvailableKey = availableKeys.find(
      (key) => song[key.toUpperCase()] !== "null"
    );

    if (firstAvailableKey) {
      setSelectedKey(firstAvailableKey);
      const volume = `vol${song.volume}-5th`;
      const pdfUrl = pdfMapping[volume]?.[firstAvailableKey];

      if (pdfUrl) {
        renderPages(song.page, pdfUrl, song.num_pages);
      } else {
        console.error(`PDF URL not found for ${volume}-${firstAvailableKey}`);
      }
    }
  };

  const renderPages = async (startPage, pdfUrl, numPages) => {
    setLoading(true);
    setPages([]); // Clear the pages state before loading new ones
    const loadedPages = [];

    try {
      for (let page = startPage; page < startPage + numPages; page++) {
        const response = await fetch(
          `/api/render-pdf?pdfUrl=${encodeURIComponent(pdfUrl)}&page=${page}`
        );
        if (!response.ok) {
          throw new Error("Failed to load page");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        loadedPages.push(url);
      }

      setPages(loadedPages); // Set all pages at once to avoid re-renders
    } catch (error) {
      console.error("Error rendering pages:", error);
      alert("Sorry, we encountered an issue while loading the document.");
    } finally {
      setLoading(false);
    }
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
        hide={isFullScreen}
      />
      <SongList songs={filteredSongs} onSelectSong={handleSelectSong} />

      {loading ? (
        <div className="loading-container">
          <Image
            src="/images/loading.gif"
            alt="Loading..."
            width={50}
            height={50}
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
            <div className="swiper-thumps-wrapper">
              <MySwiperComponent pages={pages} />{" "}
            </div>
          </div>
        )
      )}

      {!result && query && filteredSongs.length === 0 && (
        <p className="no-results">{`No results found for ${query}. Please try another song title.`}</p>
      )}
    </div>
  );
};

export default HomePage;
