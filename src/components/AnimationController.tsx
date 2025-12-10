import { useAnimationStore, type AnimationType } from '../stores/animation-store';

const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 3];

export function AnimationController() {
  const { isPlaying, speed, animationType, toggle, setSpeed, setType } = useAnimationStore();

  return (
    <div className="flex items-center gap-4 px-4 py-3 bg-slate-800 border-t border-slate-700">
      {/* Play/Pause Button */}
      <button
        onClick={toggle}
        className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
      >
        {isPlaying ? (
          <>
            <PauseIcon />
            <span>Pause</span>
          </>
        ) : (
          <>
            <PlayIcon />
            <span>Play</span>
          </>
        )}
      </button>

      {/* Speed Control */}
      <div className="flex items-center gap-2">
        <span className="text-slate-400 text-sm">Speed:</span>
        <select
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          {SPEED_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}x
            </option>
          ))}
        </select>
      </div>

      {/* Animation Type Toggle */}
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-slate-400 text-sm">Style:</span>
        <div className="flex bg-slate-700 rounded-lg p-1">
          <AnimationTypeButton
            type="dash"
            label="Dash"
            current={animationType}
            onClick={setType}
          />
          <AnimationTypeButton
            type="particle"
            label="Particle"
            current={animationType}
            onClick={setType}
          />
          <AnimationTypeButton
            type="both"
            label="Both"
            current={animationType}
            onClick={setType}
          />
        </div>
      </div>
    </div>
  );
}

interface AnimationTypeButtonProps {
  type: AnimationType;
  label: string;
  current: AnimationType;
  onClick: (type: AnimationType) => void;
}

function AnimationTypeButton({ type, label, current, onClick }: AnimationTypeButtonProps) {
  const isActive = current === type;
  return (
    <button
      onClick={() => onClick(type)}
      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
        isActive
          ? 'bg-sky-600 text-white'
          : 'text-slate-400 hover:text-white hover:bg-slate-600'
      }`}
    >
      {label}
    </button>
  );
}

function PlayIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path
        fillRule="evenodd"
        d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5"
    >
      <path
        fillRule="evenodd"
        d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
        clipRule="evenodd"
      />
    </svg>
  );
}
