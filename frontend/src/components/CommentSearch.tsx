import React, { useState } from 'react';

import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';

import { Comment } from '../types';

interface CommentSearchProps {
  comments: Comment[];
}

// タブを変えても再レンダリングされないように React.memo を使用
// プロップスが変わらない限り再レンダリングされない
const CommentSearch: React.FC<CommentSearchProps> = React.memo(
  ({ comments }) => {
    // 検索キーワード
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filteredComments, setFilteredComments] = useState<Comment[]>([]);

    // vpos (100 vpos = 1 秒) を時間形式 (mm:ss) に変換
    const formatVposToTime = (vpos: number): string => {
      const seconds = vpos / 100;
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.floor(seconds % 60);
      return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
        .toString()
        .padStart(2, '0')}`;
    };

    // 検索処理
    const handleSearch = () => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      const filtered = comments.filter((comment) =>
        comment.message.toLowerCase().includes(lowerCaseSearchTerm)
      );
      setFilteredComments(filtered);
    };

    // エンターキーで検索をトリガーする処理
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleSearch(); // エンターキーが押されたら検索を実行
      }
    };

    return (
      <Box sx={{ marginTop: 2 }}>
        {/* 検索バーとボタン */}
        <Box sx={{ marginBottom: 2 }}>
          <TextField
            label="コメント検索"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
            variant="outlined"
            sx={{ height: '15px', width: '200px' }}
          />
          <Button
            sx={{ marginTop: 2, marginLeft: 1 }}
            variant="contained"
            color="primary"
            onClick={handleSearch}
          >
            検索
          </Button>
        </Box>

        <TableContainer
          sx={{ maxWidth: '400px', maxHeight: '250px', overflowY: 'auto' }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ padding: '8px', fontSize: '12px' }}>
                  時間
                </TableCell>
                <TableCell sx={{ padding: '8px', fontSize: '12px' }}>
                  コメント
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredComments.length > 0 ? (
                filteredComments.map((comment) => (
                  <TableRow key={comment.no}>
                    <TableCell sx={{ padding: '8px', fontSize: '12px' }}>
                      {formatVposToTime(comment.vpos)}
                    </TableCell>
                    <TableCell sx={{ padding: '8px', fontSize: '12px' }}>
                      {comment.message}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    align="center"
                    sx={{ padding: '8px', fontSize: '12px' }}
                  >
                    検索結果がありません
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }
);

export default CommentSearch;
