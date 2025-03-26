
// サーバーURLを環境変数から取得
export const SERVER_URL = 
`http://${window.location.hostname}:3002` || 'http://localhost:3002';

export const SCREENSHOT_URL = SERVER_URL + '/assets/screenshots'

export const MP4_STREAM_URL = SERVER_URL + '/folders'

export const HLS_STREAM_URL = SERVER_URL + '/assets/stream'

export const SCROLL_SPEED = 1.5;