import React from "react";

function SongList({ songs, onSelectSong }) {
  return (
    <div className="song-list-wrapper">
      {songs.length > 0 && (
        <ul className="song-list">
          {songs.map((song) => (
            <li key={song.title} onClick={() => onSelectSong(song)}>
              {song.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SongList;
