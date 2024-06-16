import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    stages: [
        { duration: '30s', target: 100 }, // 在 30 秒內逐漸增加到 100 個虛擬使用者
        { duration: '1m', target: 100 },  // 保持 100 個虛擬使用者運行 1 分鐘
        { duration: '30s', target: 200 }, // 在 30 秒內逐漸增加到 200 個虛擬使用者
        { duration: '1m', target: 200 },  // 保持 200 個虛擬使用者運行 1 分鐘
        { duration: '30s', target: 0 },   // 在 30 秒內逐漸減少到 0 個虛擬使用者
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% 的請求必須在 500ms 以內完成
        'http_req_duration{expected_response:true}': ['p(95)<500'], // 95% 的成功請求必須在 500ms 以內完成
        'http_req_duration{expected_response:false}': ['p(95)<1000'], // 95% 的失敗請求必須在 1000ms 以內完成
    },
};

export default function () {
    // 測試 /google/callback 端點
    let res = http.get('http://localhost:3000/google/callback?code=mockCode&state=mockState');
    check(res, {
        'status is 302': (r) => r.status === 302,
    });

    // 測試 /login-failure 端點
    res = http.get('http://localhost:3000/login-failure');
    check(res, {
        'status is 401': (r) => r.status === 401,
    });

    // 測試 /logout 端點
    res = http.post('http://localhost:3000/logout');
    check(res, {
        'status is 302': (r) => r.status === 302,
    });

    sleep(1);
}

