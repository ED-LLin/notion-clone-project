export let options = {
    stages: [
        { duration: '30s', target: 20 }, // 在 30 秒內逐漸增加到 20 個虛擬使用者
        { duration: '1m', target: 20 },  // 保持 20 個虛擬使用者運行 1 分鐘
        { duration: '30s', target: 0 },  // 在 30 秒內逐漸減少到 0 個虛擬使用者
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% 的請求必須在 500ms 以內完成
    },
};
