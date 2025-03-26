import React, { createContext, useContext } from 'react';
import { useLocalStorage } from 'react-use';

// HlsModeの型を定義
interface HlsModeContextType {
  hlsMode: boolean;
}

// Contextを作成
const HlsModeContext = createContext<HlsModeContextType | undefined>(undefined);

// コンテキストプロバイダーを作成
export const HlsModeProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  // ローカルストレージからhls_modeの状態を取得、初期値はfalse
  const [hlsMode,] = useLocalStorage<boolean>('hls_mode', false);

  return (
    <HlsModeContext.Provider value={{ hlsMode }}>
      {children}
    </HlsModeContext.Provider>
  );
};

// useContextで利用できるカスタムフックを作成
export const useHlsMode = (): HlsModeContextType => {
  const context = useContext(HlsModeContext);
  if (!context) {
    throw new Error('useHlsMode must be used within a HlsModeProvider');
  }
  return context;
};
