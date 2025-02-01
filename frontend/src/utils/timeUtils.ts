//ToDo: ここに時間関係のユーティリティ関数を列挙してTS化

// タイムスタンプから現在時刻を取得する関数を定義してエクスポートする
export const getCurrentTimeFromTimestamp = (timestamp) => {
    const dateObj = new Date(timestamp * 1000); // Unixタイムスタンプをミリ秒に変換

    const year = dateObj.getFullYear();
    const month = ('0' + (dateObj.getMonth() + 1)).slice(-2); // 一桁の場合にゼロを追加して二桁にする
    const day = ('0' + dateObj.getDate()).slice(-2); // 一桁の場合にゼロを追加して二桁にする
    const hours = ('0' + dateObj.getHours()).slice(-2); // 一桁の場合にゼロを追加して二桁にする
    const minutes = ('0' + dateObj.getMinutes()).slice(-2); // 一桁の場合にゼロを追加して二桁にする
    const seconds = ('0' + dateObj.getSeconds()).slice(-2); // 一桁の場合にゼロを追加して二桁にする

    return {
        year: year,
        month: month,
        day: day,
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
};