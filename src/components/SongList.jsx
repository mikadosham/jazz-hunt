import React from "react";

function SongList({ songs, onSelectSong }) {
  return (
    <div className="list-wrapper">
      {songs.length > 0 && (
        <ul className="song-list">
          {songs.map((song) => (
            <li
              key={song.title}
              style={{
                cursor: "pointer",
                padding: "5px 0",
                borderBottom: "1px solid #ccc",
              }}
              onClick={() => onSelectSong(song)}
            >
              {song.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SongList;
