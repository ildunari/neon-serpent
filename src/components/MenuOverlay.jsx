// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import React from 'react';

/**
 * Menu overlay component
 * @param {{ menuIndex: number, setMenuIndex: Function, onSelect: Function, menuOptions: string[] }} props
 */
export default function MenuOverlay({ menuIndex, setMenuIndex, onSelect, menuOptions }) {
  console.log('*** Trying to render MenuOverlay component ***');
  try {
    return (
      <div className="menu-overlay">
        <h1>Neon Serpent</h1>
        <div className="menu-buttons">
          {menuOptions.map((opt, idx) => (
            <button
              key={opt}
              className={idx === menuIndex ? 'selected' : ''}
              onClick={() => onSelect(idx)} // Use the passed onSelect handler
              onMouseEnter={() => setMenuIndex(idx)} // Update index on hover
            >
              {opt}
            </button>
          ))}
        </div>
        <p className="hint">Use Arrows/WASD/Tap to navigate, Enter/Space/Click to select.</p>
      </div>
    );
  } catch (error) {
    console.error("!!! ERROR rendering MenuOverlay:", error);
    return <div className="menu-overlay error">Error rendering menu. Check console.</div>;
  }
}
