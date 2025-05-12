// 백엔드로 점수 POST
  async submitScore(userId, score) {
    const token = 'WIDJ*U@wojqdi@EJE@12+EII-Aw9deiaw9ied0qJ@OIEJaoiwja9d';

    const payload = {
      gameName: "pikachu-volley",
      userId: userId,
      score: score
    };
    try {
      const res = await fetch('https://0by7j8suf2.execute-api.ap-northeast-2.amazonaws.com/proxy/api/result', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': Bearer ${token}
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(HTTP ${res.status});
      console.log('점수 전송 성공');
    } catch (e) {
      console.error('전송 오류:', e);
    }
  }