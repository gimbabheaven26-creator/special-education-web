'use client';

const INPUT_CLASS =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none';

const BTN_ICON_CLASS =
  'p-1.5 text-sm text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed';

interface OptionsEditorProps {
  options: string[];
  onUpdate: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}

export function OptionsEditor({ options, onUpdate, onAdd, onRemove, onMove }: OptionsEditorProps) {
  return (
    <>
      <div className="space-y-2">
        {options.map((opt, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 w-6 shrink-0">{i + 1}.</span>
            <input
              type="text"
              value={opt}
              onChange={(e) => onUpdate(i, e.target.value)}
              placeholder={`선택지 ${i + 1}`}
              className={`${INPUT_CLASS} flex-1`}
            />
            <button
              type="button"
              onClick={() => onMove(i, 'up')}
              disabled={i === 0}
              className={BTN_ICON_CLASS}
              title="위로"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => onMove(i, 'down')}
              disabled={i === options.length - 1}
              className={BTN_ICON_CLASS}
              title="아래로"
            >
              ↓
            </button>
            {options.length > 2 && (
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="p-1.5 text-sm text-red-500 hover:text-red-700"
                title="삭제"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="mt-2 text-sm text-blue-600 hover:text-blue-800"
      >
        + 선택지 추가
      </button>
    </>
  );
}
