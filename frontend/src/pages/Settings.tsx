import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { Add, ArrowBack, Close, Delete } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  Input,
  InputAdornment,
  ListItem,
  TextField,
  Typography,
} from "@mui/material";

import { useSettings } from "../context/SettingsContext";
import TemplatePage from "./TemplatePage";
import UseFetch from "hooks/UseFetch";

const Settings: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [ngPattern, setNgPattern] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const navigate = useNavigate();

  const handleRedirect = () => {
    navigate(-1); // 前のページにリダイレクト
  };

  const fontOptions = [
    'Arial',
    'Roboto-Bold',
    'OpenSans-Medium',
    'OpenSans-Bold',
    'Times New Roman',
  ];

  const MAX_NG_LENGTH = 10;

  /*
  const handleClose = () => {
    setIsDialogOpen(false);
  };
*/

  // NGパターンを追加する関数
  const handleAddNgPattern = () => {
    if (ngPattern) {
      updateSettings({
        ...settings,
        ngPatterns: [...settings.ngPatterns, ngPattern],
      });
      setNgPattern('');
    }
  };

  // NGパターンを削除する関数
  const handleRemoveNgPattern = (pattern: string) => {
    updateSettings({
      ...settings,
      ngPatterns: settings.ngPatterns.filter((p) => p !== pattern),
    });
  };

  // フォントの変更を処理する関数
  const handleFontChange = (event: any, newValue: string | null) => {
    updateSettings({
      ...settings,
      font: newValue || settings.font, // 新しいフォントが選択されたら更新
    });
  };

  // インポート機能
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      // ファイルの読み込みを開始
      reader.readAsText(file); // これが非同期処理で開始されます

      // 読み込みが完了したら実行される
      reader.onload = () => {
        try {
          const importedSettings = JSON.parse(reader.result as string);
          updateSettings(importedSettings); // 読み込んだ内容で設定を更新
        } catch (error) {
          window.alert('Error parsing the JSON file:');
        }
      };

      // ファイル読み込み中にエラーが発生した場合
      reader.onerror = (error) => {
        console.error('File reading error:', error);
      };
    } else {
      window.alert('No file selected');
    }
  };

  // リセット機能
  const handleReset = () => {
    updateSettings({
      font: 'Arial',
      ngPatterns: [],
    });
  };

  // 証明書をダウンロードする関数
  const downloadCertificate = async () => {
    const data: any = await UseFetch<unknown>('/api/config/generate-cert');

    // レスポンスをBlobとしてダウンロード
    if (data && data?.certificate) {
      const certificateBlob = new Blob([data?.certificate], {
        type: 'application/x-pem-file',
      });
      const certificateUrl = URL.createObjectURL(certificateBlob);
      console.log('certificateUrlは: ', certificateUrl);
      // ダウンロードリンクをクリック
      const link = document.createElement('a');
      link.href = certificateUrl;
      link.download = 'certificate.crt'; // ファイル名
      link.click();

      // ダウンロードが完了したらURLを解放
      URL.revokeObjectURL(certificateUrl);
    }
  };

  return (
    <TemplatePage>
      <Dialog
        open={isDialogOpen}
        fullWidth
        maxWidth="xs"
        sx={{
          '& .MuiDialogContent-root': {
            // display: 'flex',
            // justifyContent: 'center', // 中央揃え
            paddingTop: '12px',
            borderRadius: '8px',
          },
          '& .MuiDialog-paper': {
            borderRadius: '8px',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
          }}
        >
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleRedirect}
            aria-label="home"
            sx={{
              position: 'absolute',
              left: 8,
              top: 8,
            }}
          >
            <ArrowBack />
          </IconButton>
          設定
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleRedirect}
            aria-label="close"
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <div>
            {/* フォント設定 */}
            <FormControl margin="normal" sx={{ width: '50%' }}>
              <Autocomplete
                value={settings.font}
                onChange={handleFontChange}
                options={fontOptions}
                renderInput={(params) => <TextField {...params} label="Font" />}
              />
            </FormControl>
            <br />
            <br />
            <Divider />

            <div>
              <br />
              <Typography variant="body1">NGワード</Typography>
              {/* NGパターン設定 */}
              <TextField
                label="NGワードを入力"
                value={ngPattern}
                onChange={(e) => setNgPattern(e.target.value)}
                margin="normal"
                helperText="文字列か正規表現(/xxx/形式)を入力してください"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        color="primary"
                        onClick={handleAddNgPattern}
                        disabled={!ngPattern}
                      >
                        <Add />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <ul>
                {settings.ngPatterns.map((pattern, index) => (
                  <ListItem
                    key={index}
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        overflow:
                          pattern.length > MAX_NG_LENGTH ? 'hidden' : 'visible',
                        textOverflow:
                          pattern.length > MAX_NG_LENGTH ? 'ellipsis' : 'unset',
                        whiteSpace:
                          pattern.length > MAX_NG_LENGTH ? 'nowrap' : 'unset',
                        maxWidth: '100%',
                      }}
                    >
                      {pattern}
                    </Typography>
                    <IconButton
                      color="primary"
                      onClick={() => handleRemoveNgPattern(pattern)}
                    >
                      <Delete />
                    </IconButton>
                  </ListItem>
                ))}
              </ul>
            </div>

            <Box >
              <Typography  variant="body1">証明書のダウンロード</Typography>

              {/* ダウンロードボタン */}
              <Button
                variant="contained"
                color="primary"
                onClick={downloadCertificate}
                sx={{ width: '200px', paddingTop: '10px' }}
              >
                証明書をダウンロード
              </Button>
            </Box>
            <br />
            <Divider />

            {/* 設定インポート/エクスポート/リセット */}
            <Box display="flex" flexDirection="column" gap={2}>
              <br/>
              {/* インポートボタン */}
              <Input
                type="file"
                inputProps={{ accept: '.json' }}
                onChange={handleImport}
                sx={{ display: 'none' }} // Inputを非表示にしてボタンを使用
                id="import-settings-file"
              />
              <label htmlFor="import-settings-file">
                <Button
                  variant="contained"
                  color="primary"
                  component="span"
                  sx={{ width: '200px' }}
                >
                  設定をインポート
                </Button>
              </label>
              {/* エクスポートボタン */}
              <Button
                variant="contained"
                color="primary"
                sx={{ width: '200px' }}
                onClick={() => {
                  const blob = new Blob([JSON.stringify(settings, null, 2)], {
                    type: 'application/json',
                  });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = 'settings.json';
                  link.click();
                }}
              >
                設定をエキスポート
              </Button>

              {/* リセットボタン */}
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleReset}
                sx={{ width: '200px' }}
              >
                設定をリセット
              </Button>
            </Box>
          </div>
        </DialogContent>
        <DialogActions>
          {/* 必要に応じてボタンを追加 */}
          <Button onClick={handleRedirect} color="primary">
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    </TemplatePage>
  );
};

export default Settings;
