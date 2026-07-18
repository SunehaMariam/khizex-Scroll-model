import { forwardRef } from "react";

const BAR_COUNT = 24;

const HEIGHTS = Array.from({ length: BAR_COUNT }, (_, i) => {
  const wave = Math.sin(i * 0.85) * 0.5 + Math.sin(i * 0.37) * 0.3;
  return 0.35 + Math.abs(wave) * 0.65;
});

export const WaveformProgress = forwardRef<HTMLDivElement>(function WaveformProgress(_props, fillRef) {
  return (
    <div className="waveform" aria-hidden="true">
      <div className="waveform__track">
        {HEIGHTS.map((h, i) => (
          <span key={i} className="waveform__bar" style={{ height: `${h * 100}%` }} />
        ))}
      </div>
      <div ref={fillRef} className="waveform__fill">
        <div className="waveform__track">
          {HEIGHTS.map((h, i) => (
            <span key={i} className="waveform__bar waveform__bar--active" style={{ height: `${h * 100}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
});
