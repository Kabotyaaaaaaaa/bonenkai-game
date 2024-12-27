// グローバル変数
let totalTime = 0;
let playerHealth = 100;
let currentLocationIndex = 0;  // 現在地のインデックス
let totalDistance = 0;  // 総移動距離（km）

// 登山ルートの移動距離 (各ルート選択ごとの距離)
const routeDistances = {
  safe: 3,  // 安全ルートの距離 (km)
  risky: 5,  // 危険ルートの距離 (km)
  adventure: 6  // 冒険ルートの距離 (km)
};

// 登山ルートの地名リスト
const locations = [
  "室堂", "雷鳥沢キャンプ場", "剱沢キャンプ場", "剱岳", "雄山", 
  "五色ヶ原キャンプ場", "スゴ乗越小屋", "薬師岳", "薬師峠キャンプ場", 
  "黒部五郎岳", "黒部五郎小舎", "三俣山荘", "水晶岳", "雲ノ平山荘", 
  "三俣山荘", "槍ヶ岳山荘", "槍ヶ岳", "上高地"
];

// 現在地の更新条件
const distancePerLocation = 70 / locations.length;  // 次の地点に進むための距離

// 初期状態を更新
function updateStatus(message) {
  const currentLocation = locations[currentLocationIndex];  // 現在地を取得
  document.getElementById("status").innerHTML = `
    <p>現在地: ${currentLocation}</p>
    <p>所要時間: ${totalTime}分</p>
    <p>体力: ${playerHealth}</p>
    <p>移動距離: ${totalDistance} km</p>
    <p>${message}</p>
  `;

  // 移動距離が70kmに達したらゴール
  if (totalDistance >= 70) {
    const finalScore = calculateScore();
    document.getElementById("routes").innerHTML = `
      <p>すべての山行を終了することができました！</p>
      <p>最終スコア: ${finalScore}点</p>
      <button onclick="resetGame()">ゲーム開始画面に戻る</button>
    `;
    // ゲーム終了時にスコアをランキングに保存
    saveRanking(playerName, finalScore);
  }
  // 体力がゼロになった場合
  else if (playerHealth <= 0) {
    document.getElementById("routes").innerHTML = `
      <p>体力が尽きました。ゲームオーバー！</p>
      <button onclick="resetGame()">ゲーム開始画面に戻る</button>
    `;
  }
}

// スコア計算 (時間が長いほど減点、体力が多いほど加点)
function calculateScore() {
    const timePenalty = totalTime * 1;  // 所要時間のペナルティを軽減
    const healthBonus = playerHealth * 10;  // 体力のボーナスを増加
    const distancePenalty = totalDistance * 0.5;  // 移動距離のペナルティを軽減
    const baseScore = 3000;  // 基本スコアを引き上げ
  
    // 総スコア計算
    const score = baseScore + healthBonus - timePenalty - distancePenalty;
    return Math.max(score, 0);  // スコアが0未満にならないようにする
}

// ルート選択
function chooseRoute(route) {
  let result;
  switch (route) {
    case "safe":
      totalTime += 30;
      totalDistance += routeDistances.safe;  // 安全ルートの距離を加算
      result = "安全な道を選びました。";
      break;
    case "risky":
      totalTime += 15;
      totalDistance += routeDistances.risky;  // 危険ルートの距離を加算
      if (Math.random() > 0.5) {
        result = "危険な道を通り、滑落して体力が減りました。（体力 -20）";
        playerHealth -= 20;
      } else {
        result = "危険な道を通り、無事に通過しました。";
      }
      break;
    case "adventure":
      const outcome = Math.random();
      totalDistance += routeDistances.adventure;  // 冒険ルートの距離を加算
      if (outcome < 0.3) {
        result = "バリエーションルートで大きな成果を得ました！時間を短縮！";
        totalTime -= 10;
      } else if (outcome < 0.7) {
        result = "バリエーションルートを無事に通過しました。";
      } else {
        result = "バリエーションルートで怪我をして体力が減りました。（体力 -30）";
        playerHealth -= 30;
      }
      break;
    default:
      result = "不正な選択です。";
  }

  // 現在地の更新（移動距離が閾値を超えたら次の地点へ）
  if (totalDistance >= (currentLocationIndex + 1) * distancePerLocation) {
    currentLocationIndex = Math.min(currentLocationIndex + 1, locations.length - 1);
  }

  const eventMessage = triggerEvent();
  updateStatus(result + " " + eventMessage);
}

// ランダムイベント
function triggerEvent() {
  const random = Math.random();
  if (random < 0.1) {
    playerHealth += 15;
    return "温泉に立ち寄り、体力が少し回復しました！（体力 +15）";
  } else if (random < 0.3) {
    playerHealth -= 20;
    return "ヒルに噛まれて、体力が減った！（体力 -20）";
  } else if (random < 0.6) {
    totalTime -= 10;
    return "天気が良く、スムーズに進めた！（所要時間 -10分）";
  } else {
    totalTime += 20;
    return "雨が降り、足場が悪くなった。（所要時間 +20分）";
  }
}

// 状態を初期化する関数
function resetGame() {
    totalTime = 0;
    playerHealth = 100;
    currentLocationIndex = 0;
    totalDistance = 0;
  
    displayStartScreen();
}

// ゲーム開始画面の表示 (ランキングスタイルを調整)
function displayStartScreen() {
    const rankingData = getRankingData();
    const rankingHTML = rankingData
        .map((entry, index) => `<li>${index + 1}. ${entry.name}: ${entry.score}点</li>`)
        .join("");

    document.getElementById("ranking").innerHTML = `
      <h2>ランキング</h2>
      <ul id="rankingList">
        ${rankingHTML || "<li>まだ記録がありません。</li>"}
      </ul>
    `;

    document.getElementById("status").innerHTML = `
      <p>プレイヤー名を入力してください。</p>
      <input type="text" id="playerNameInput" placeholder="名前を入力">
      <button onclick="startGame()">ゲーム開始</button>
    `;

    document.getElementById("routes").innerHTML = "";
}

// ランキングデータの保存
function saveRanking(name, score) {
    let rankingData = getRankingData();
    
    // 同じ名前が存在する場合はスコアを更新
    const existingPlayer = rankingData.find(entry => entry.name === name);
    if (existingPlayer) {
        existingPlayer.score = Math.max(existingPlayer.score, score); // 高いスコアを保持
    } else {
        rankingData.push({ name, score });
    }

    rankingData.sort((a, b) => b.score - a.score);
    localStorage.setItem("ranking", JSON.stringify(rankingData.slice(0, 10))); // 上位10人のみ保存
}

// ランキングデータの取得
function getRankingData() {
    const ranking = localStorage.getItem("ranking");
    return ranking ? JSON.parse(ranking) : [];
}

// ゲーム開始
function startGame() {
    const nameInput = document.getElementById("playerNameInput");
    playerName = nameInput.value.trim();
    if (!playerName) {
      alert("名前を入力してください。");
      return;
    }

    document.getElementById("routes").innerHTML = `
        <button onclick="chooseRoute('safe')">安全ルート</button>
        <button onclick="chooseRoute('risky')">危険ルート</button>
        <button onclick="chooseRoute('adventure')">バリエーションルート</button>
    `;

  updateStatus("ゲームを開始します！");
}

resetGame();
