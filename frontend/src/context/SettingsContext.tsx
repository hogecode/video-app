
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const defaultSettings = {
  font: 'Arial',  // デフォルトのフォント
  ngPatterns: [], // NGパターンなし
};

type Settings = typeof defaultSettings;

// 設定のコンテキストを作成
const SettingsContext = createContext<{
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
}>({
  settings: defaultSettings,
  updateSettings: () => {},
});

// ローカルストレージから設定を取得する関数
const getStoredSettings = (): Settings => {
  const stored = localStorage.getItem('settings');
  return stored ? JSON.parse(stored) : defaultSettings;
};


// 設定のコンテキストを提供するコンポーネント
interface SettingsProviderProps {
  children: ReactNode; // childrenプロパティをReactNode型で指定
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }:{children: React.ReactNode}) => {
  const [settings, setSettings] = useState<Settings>(getStoredSettings);

  // 設定が変更された場合、localStorageに保存
  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
    document.body.style.fontFamily = settings.font; // フォントを設定
  }, [settings]);

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// 設定のコンテキストを利用するカスタムフック
export const useSettings = () => useContext(SettingsContext);