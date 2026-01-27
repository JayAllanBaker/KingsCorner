import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { hapticSelection } from '@/lib/haptics';

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNewGame: () => void;
  difficulty: 'easy' | 'standard' | 'hard';
  onDifficultyChange: (difficulty: 'easy' | 'standard' | 'hard') => void;
  playerName: string;
  onPlayerNameChange: (name: string) => void;
  soundEnabled: boolean;
  onSoundToggle: () => void;
  hapticsEnabled: boolean;
  onHapticsToggle: () => void;
}

export const SettingsMenu = ({
  isOpen,
  onClose,
  onNewGame,
  difficulty,
  onDifficultyChange,
  playerName,
  onPlayerNameChange,
  soundEnabled,
  onSoundToggle,
  hapticsEnabled,
  onHapticsToggle,
}: SettingsMenuProps) => {
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(playerName);
  const menuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setEditingName(false);
    }
  }, [isOpen]);

  const handleDifficultySelect = (diff: 'easy' | 'standard' | 'hard') => {
    hapticSelection();
    onDifficultyChange(diff);
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      onPlayerNameChange(tempName.trim());
    }
    setEditingName(false);
  };

  const handleNewGame = () => {
    hapticSelection();
    onNewGame();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            data-testid="settings-backdrop"
          />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-b from-[#1a3c34] to-[#0f2620] rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Game Settings"
            data-testid="settings-menu"
          >
            <div className="p-4 pb-[env(safe-area-inset-bottom)]">
              <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-4" />
              
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">Settings</h2>
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60 hover:bg-white/20 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                  aria-label="Close settings"
                  data-testid="close-settings"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>

              <div className="space-y-4">
                <button
                  onClick={handleNewGame}
                  className="w-full py-4 px-5 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-between text-black font-bold shadow-lg active:scale-[0.98] transition-transform focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                  data-testid="new-game-button"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden="true">🎮</span>
                    <span>New Game</span>
                  </div>
                  <span aria-hidden="true">→</span>
                </button>

                <div className="bg-white/5 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide">Game Settings</h3>
                  </div>
                  
                  <div className="p-4 border-b border-white/10">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-white font-medium">AI Difficulty</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(['easy', 'standard', 'hard'] as const).map((diff) => (
                        <button
                          key={diff}
                          onClick={() => handleDifficultySelect(diff)}
                          className={cn(
                            "py-2.5 px-3 rounded-xl font-medium text-sm transition-all focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
                            difficulty === diff
                              ? "bg-emerald-500 text-white shadow-md"
                              : "bg-white/10 text-white/70 hover:bg-white/20"
                          )}
                          aria-pressed={difficulty === diff}
                          data-testid={`difficulty-${diff}`}
                        >
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 flex justify-between items-center border-b border-white/10">
                    <div className="flex items-center gap-3">
                      <span className="text-xl" aria-hidden="true">🔊</span>
                      <span className="text-white font-medium">Sound Effects</span>
                    </div>
                    <button
                      onClick={onSoundToggle}
                      className={cn(
                        "w-14 h-8 rounded-full transition-colors relative focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
                        soundEnabled ? "bg-emerald-500" : "bg-white/20"
                      )}
                      role="switch"
                      aria-checked={soundEnabled}
                      data-testid="sound-toggle"
                    >
                      <motion.div
                        animate={{ x: soundEnabled ? 24 : 4 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>

                  <div className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-xl" aria-hidden="true">📳</span>
                      <span className="text-white font-medium">Haptic Feedback</span>
                    </div>
                    <button
                      onClick={onHapticsToggle}
                      className={cn(
                        "w-14 h-8 rounded-full transition-colors relative focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none",
                        hapticsEnabled ? "bg-emerald-500" : "bg-white/20"
                      )}
                      role="switch"
                      aria-checked={hapticsEnabled}
                      data-testid="haptics-toggle"
                    >
                      <motion.div
                        animate={{ x: hapticsEnabled ? 24 : 4 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide">Profile</h3>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xl font-bold text-black">
                          {playerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          {editingName ? (
                            <input
                              type="text"
                              value={tempName}
                              onChange={(e) => setTempName(e.target.value)}
                              onBlur={handleSaveName}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                              autoFocus
                              aria-label="Your player name"
                              className="bg-white/10 text-white px-3 py-1.5 rounded-lg border border-white/20 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50 w-32"
                              maxLength={20}
                              data-testid="name-input"
                            />
                          ) : (
                            <>
                              <p className="text-white font-semibold">{playerName}</p>
                              <p className="text-white/50 text-sm">Tap to edit</p>
                            </>
                          )}
                        </div>
                      </div>
                      {!editingName && (
                        <button
                          onClick={() => {
                            setTempName(playerName);
                            setEditingName(true);
                          }}
                          className="px-4 py-2 bg-white/10 rounded-xl text-white/70 text-sm hover:bg-white/20 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
                          aria-label="Edit your player name"
                          data-testid="edit-name-button"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-2 pb-4">
                  <p className="text-center text-white/40 text-xs">
                    Kings Corner Arena v1.0
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const SettingsButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={() => {
        hapticSelection();
        onClick();
      }}
      className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      aria-label="Open game settings"
      data-testid="settings-button"
    >
      <svg 
        className="w-5 h-5 text-white" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" 
        />
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
        />
      </svg>
    </button>
  );
};
