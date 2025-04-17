// extracted from NeonSerpentGame_backup.jsx on 2025-04-17
import React from 'react';

/**
 * Controls overlay component
 * @param {{ onBack: Function, controlsInfo: Array<{label: string, icons: string[], fallback?: string}> }} props
 */
export default function ControlsOverlay({ onBack, controlsInfo }) {
  return (
    <div className="controls-overlay">
      <h2>Controls</h2>
      <div className="controls-grid">
        {controlsInfo.map(control => (
          <div key={control.label} className="control-item">
            <span className="control-label">{control.label}:</span>
            <div className="control-icons">
              {control.icons.length > 0 ? (
                control.icons.map(icon => <img key={icon} src={icon} alt="" />)
              ) : (
                <span className="control-fallback">{control.fallback}</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <button onClick={onBack} className="back-button">Back (Esc)</button>
    </div>
  );
}
