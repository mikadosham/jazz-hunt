import React from "react";

function SongList({ songs, onSelectSong }) {
  return (
    <div>
      {songs.length > 0 && (
        <ul style={{ marginTop: "10px", listStyleType: "none", padding: 0 }}>
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
