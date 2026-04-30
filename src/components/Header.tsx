import { Scissors, LogOut } from 'lucide-react';

interface Props {
  username: string;
  onSignOut: () => void;
}

export function Header({ username, onSignOut }: Props) {
  return (
    <header className="border-b border-gray-800 bg-black sticky top-0 z-40">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scissors size={18} className="text-yellow-500" />
          <span className="text-white font-bold text-sm tracking-tight">LevelzCut</span>
          <span className="text-gray-600 text-xs ml-1">Barbeiro</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xs">{username}</span>
          <button
            onClick={onSignOut}
            className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
            title="Sair"
          >
            <LogOut size={15} className="text-gray-500 hover:text-gray-300" />
          </button>
        </div>
      </div>
    </header>
  );
}
