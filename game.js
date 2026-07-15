const player = document.querySelector("#player");
const map = document.querySelector("#villageMap");
const farmBoard = document.querySelector("#farmBoard");
const placeName = document.querySelector("#placeName");
const placeText = document.querySelector("#placeText");
const dateLabel = document.querySelector("#dateLabel");
const timeLabel = document.querySelector("#timeLabel");
const goldLabel = document.querySelector("#goldLabel");
const seedLabel = document.querySelector("#seedLabel");
const cropLabel = document.querySelector("#cropLabel");
const heartLabel = document.querySelector("#heartLabel");
const inventoryList = document.querySelector("#inventoryList");
const insectBook = document.querySelector("#insectBook");
const insectBookText = document.querySelector("#insectBookText");
const questTitle = document.querySelector("#questTitle");
const questText = document.querySelector("#questText");
const questProgress = document.querySelector("#questProgress");
const miniGame = document.querySelector("#miniGame");
const miniTitle = document.querySelector("#miniTitle");
const miniText = document.querySelector("#miniText");
const fishMiniScene = document.querySelector("#fishMiniScene");
const farmMiniScene = document.querySelector("#farmMiniScene");
const successZone = document.querySelector("#successZone");
const timingCursor = document.querySelector("#timingCursor");
const stopMiniBtn = document.querySelector("#stopMiniBtn");
const cancelMiniBtn = document.querySelector("#cancelMiniBtn");
const tutorial = document.querySelector("#tutorial");
const tutorialStepLabel = document.querySelector("#tutorialStep");
const tutorialTitle = document.querySelector("#tutorialTitle");
const tutorialText = document.querySelector("#tutorialText");
const tutorialProgress = document.querySelector("#tutorialProgress");
const tutorialNextBtn = document.querySelector("#tutorialNextBtn");
const tutorialSkipBtn = document.querySelector("#tutorialSkipBtn");
const bigTownGate = document.querySelector("#bigTownGate");
const townReturnBtn = document.querySelector("#townReturnBtn");
const townFishingBtn = document.querySelector("#townFishingBtn");
const townExitBtn = document.querySelector("#townExitBtn");

const seasons = ["봄", "여름", "가을", "겨울"];
const placeInfo = {
  home: ["나무집", "작은 집입니다. 잠자기와 요리를 할 수 있는 편안한 공간이에요.", 19, 22],
  shop: ["씨앗 상점", "씨앗은 20G입니다. 작물은 상점에서 35G에 팔 수 있어요.", 74, 28],
  toolShop: ["도구 상점", "도구를 업그레이드합니다. 물뿌리개, 낚싯대, 채집가방을 순서대로 살 수 있어요.", 83, 28],
  plaza: ["마을 광장", "계절마다 색이 바뀌는 광장입니다. 주민들이 쉬어 가는 곳이에요.", 52, 46],
  npc: ["주민 소라", "소라는 농장 이야기를 좋아합니다. 대화하면 호감도가 오르고 퀘스트 힌트를 줍니다.", 58, 30],
};


const forageNames = {
  herb: "허브",
  berry: "열매",
  mushroom: "버섯",
};

const insectNames = {
  butterfly: "나비",
  beetle: "딱정벌레",
  firefly: "반딧불이",
};

const tutorialSteps = [
  ["마을을 둘러보세요", "WASD 또는 방향키로 이동하세요. 건물이나 주민을 누르면 그곳으로 바로 이동할 수도 있습니다."],
  ["작물을 키워보세요", "밭을 누른 뒤 밭 갈기, 씨앗 심기, 물주기를 차례로 사용하세요. 잠자고 나면 물을 준 작물이 자랍니다."],
  ["랜덤 몹을 채집하세요", "맵 위의 곤충 몹은 잡을 때마다 종류와 레벨이 바뀝니다. 몹을 잡으면 채집 레벨도 무작위로 올라가요."],
  ["상점을 이용하세요", "씨앗 상점에서 씨앗을 사고, 도구 상점에서 전체 파종·물주기·수확 기능을 구매해 보세요."],
];

const saveKey = "healing-farm-save-v1";

const state = {
  pos: { x: 50, y: 70 },
  velocity: { x: 0, y: 0 },
  selectedPlot: 0,
  day: 1,
  hour: 8,
  gold: 120,
  seeds: 4,
  crops: 0,
  fish: 0,
  bugs: 0,
  level: 1,
  insects: {
    butterfly: 0,
    beetle: 0,
    firefly: 0,
  },
  forage: 0,
  meals: 0,
  hearts: 0,
  harvested: 0,
  harvestRewardClaimed: false,
  tutorialCompleted: false,
  area: "farm",
  soraQuest: {
    accepted: false,
    progress: 0,
    completed: false,
  },
  tools: {
    wateringCan: 1,
    fishingRod: 1,
    forageBag: 1,
    autoPlanter: 0,
    sprinkler: 0,
    harvestBasket: 0,
  },
  activeAction: "till",
  plots: Array.from({ length: 12 }, () => ({ stage: "empty", age: 0, watered: false })),
};

const keys = new Set();
let activeMiniGame = null;
let tutorialStep = 0;
const movementCodes = {
  KeyW: "w",
  KeyA: "a",
  KeyS: "s",
  KeyD: "d",
  ArrowUp: "arrowup",
  ArrowDown: "arrowdown",
  ArrowLeft: "arrowleft",
  ArrowRight: "arrowright",
  ShiftLeft: "shift",
  ShiftRight: "shift",
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomInsectType(previousType) {
  const types = Object.keys(insectNames).filter((type) => type !== previousType);
  return types[randomInt(0, types.length - 1)];
}

function randomizeInsect(button) {
  const previousType = button.dataset.insect;
  const type = randomInsectType(previousType);
  const mobLevel = randomInt(1, Math.min(20, state.level + 2));
  button.classList.remove(...Object.keys(insectNames));
  button.classList.add(type);
  button.dataset.insect = type;
  button.dataset.level = mobLevel;
  button.setAttribute("aria-label", `Lv.${mobLevel} ${insectNames[type]} 몹 잡기`);
  button.title = `Lv.${mobLevel} ${insectNames[type]} 몹`;
}

function respawnInsect(button) {
  randomizeInsect(button);
  button.classList.remove("caught");
}

function setMessage(name, text) {
  placeName.textContent = name;
  placeText.textContent = text;
}

function renderTutorialStep() {
  const [title, text] = tutorialSteps[tutorialStep];
  tutorialStepLabel.textContent = `튜토리얼 ${tutorialStep + 1} / ${tutorialSteps.length}`;
  tutorialTitle.textContent = title;
  tutorialText.textContent = text;
  tutorialProgress.style.width = `${((tutorialStep + 1) / tutorialSteps.length) * 100}%`;
  tutorialNextBtn.textContent = tutorialStep === tutorialSteps.length - 1 ? "시작하기" : "다음";
}

function openTutorial() {
  tutorialStep = 0;
  renderTutorialStep();
  tutorial.classList.remove("hidden");
}

function closeTutorial(message) {
  state.tutorialCompleted = true;
  tutorial.classList.add("hidden");
  if (message) setMessage("튜토리얼", message);
}

function nextTutorialStep() {
  if (tutorialStep < tutorialSteps.length - 1) {
    tutorialStep += 1;
    renderTutorialStep();
    return;
  }
  closeTutorial("튜토리얼을 마쳤습니다. 천천히 나만의 농장을 가꿔 보세요.");
}

function renderPlayer() {
  player.style.left = `${state.pos.x}%`;
  player.style.top = `${state.pos.y}%`;
}

function renderFarm() {
  farmBoard.innerHTML = "";
  state.plots.forEach((plot, index) => {
    const button = document.createElement("button");
    button.className = `plot ${plot.stage}${plot.watered ? " watered" : ""}${state.selectedPlot === index ? " selected" : ""}`;
    button.type = "button";
    button.ariaLabel = `${index + 1}번 밭`;
    button.dataset.plot = index;
    button.addEventListener("click", () => {
      state.selectedPlot = index;
      renderFarm();
      setMessage("밭 선택", `${index + 1}번 밭을 골랐습니다. 지금 도구는 ${toolName(state.activeAction)}입니다.`);
    });
    farmBoard.append(button);
  });
}

function renderStats() {
  const season = seasons[Math.floor((state.day - 1) / 7) % seasons.length];
  dateLabel.textContent = `${season} ${((state.day - 1) % 7) + 1}일`;
  goldLabel.textContent = `${state.gold}G`;
  seedLabel.textContent = state.seeds;
  cropLabel.textContent = state.crops;
  heartLabel.textContent = state.hearts;
  timeLabel.textContent = timeName();
  map.className = `map ${seasonClass(season)} ${timeClass()}${state.area === "bigTown" ? " big-town" : ""}`;
  inventoryList.innerHTML = `
    <span>물고기 ${state.fish}</span>
    <span>곤충 ${state.bugs}</span>
    <span>채집 레벨 Lv.${state.level}</span>
    <span>채집 ${state.forage}</span>
    <span>요리 ${state.meals}</span>
    <span>물뿌리개 Lv.${state.tools.wateringCan}</span>
    <span>낚싯대 Lv.${state.tools.fishingRod}</span>
    <span>전체 파종 ${state.tools.autoPlanter ? "보유" : "미보유"}</span>
    <span>전체 물주기 ${state.tools.sprinkler ? "보유" : "미보유"}</span>
    <span>전체 수확 ${state.tools.harvestBasket ? "보유" : "미보유"}</span>
  `;
  const discoveredInsects = Object.keys(insectNames).filter((key) => state.insects[key] > 0).length;
  insectBookText.textContent = `발견한 곤충 ${discoveredInsects} / ${Object.keys(insectNames).length}`;
  insectBook.innerHTML = Object.entries(insectNames).map(([key, name]) => {
    const count = state.insects[key];
    return `<span class="insect-entry${count ? " discovered" : ""}">${count ? `${name} ${count}마리` : "미발견"}</span>`;
  }).join("");
  renderSoraQuest();
}

function renderSoraQuest() {
  const quest = state.soraQuest;
  if (!quest.accepted) {
    questTitle.textContent = "소라의 부탁";
    questText.textContent = "소라에게 대화해 퀘스트를 받아 보세요.";
    questProgress.style.width = "0%";
    return;
  }
  if (!quest.completed) {
    questTitle.textContent = "소라의 채집 부탁";
    questText.textContent = `곤충 몹 ${quest.progress} / 3마리 잡기`;
    questProgress.style.width = `${clamp((quest.progress / 3) * 100, 0, 100)}%`;
    return;
  }
  questTitle.textContent = "소라의 부탁 완료";
  questText.textContent = "보상 90G와 호감도를 받았습니다.";
  questProgress.style.width = "100%";
}

function seasonClass(season) {
  if (season === "여름") return "summer";
  if (season === "가을") return "autumn";
  if (season === "겨울") return "winter";
  return "spring";
}

function timeClass() {
  if (state.hour < 11) return "morning";
  if (state.hour < 17) return "day";
  if (state.hour < 20) return "evening";
  return "night";
}

function timeName() {
  if (state.hour < 11) return "아침";
  if (state.hour < 17) return "낮";
  if (state.hour < 20) return "저녁";
  return "밤";
}

function toolName(action) {
  return {
    till: "밭 갈기",
    tillAll: "전체 갈기",
    plant: "씨앗 심기",
    plantAll: "전체 씨앗 뿌리기",
    water: "물주기",
    waterAll: "전체 물주기",
    harvest: "수확",
    harvestAll: "전체 수확",
  }[action];
}

function requireFarmTool(key, label) {
  if (state.tools[key]) return true;
  setMessage("도구 상점", `${label} 기능은 도구 상점에서 구매한 뒤 사용할 수 있습니다.`);
  return false;
}

function useTool(action) {
  state.activeAction = action;
  const plot = state.plots[state.selectedPlot];

  if (action === "till") {
    if (plot.stage !== "empty") return setMessage("괭이", "이미 손질된 밭입니다.");
    plot.stage = "tilled";
    return finishAction("밭 갈기", "흙이 폭신해졌습니다. 이제 씨앗을 심을 수 있어요.");
  }

  if (action === "tillAll") {
    const emptyPlots = state.plots.filter((item) => item.stage === "empty");
    if (emptyPlots.length === 0) return setMessage("전체 갈기", "갈 수 있는 빈 밭이 없습니다.");
    emptyPlots.forEach((item) => {
      item.stage = "tilled";
    });
    state.hour = (state.hour + Math.min(1.2, emptyPlots.length * 0.16)) % 24;
    setMessage("전체 갈기", `빈 밭 ${emptyPlots.length}칸을 한 번에 갈았습니다.`);
    renderFarm();
    renderStats();
    return;
  }

  if (action === "plant") {
    if (plot.stage !== "tilled") return setMessage("씨앗", "먼저 밭을 갈아야 씨앗을 심을 수 있습니다.");
    if (state.seeds <= 0) return setMessage("씨앗", "씨앗이 부족합니다. 상점에서 구매하세요.");
    state.seeds -= 1;
    plot.stage = "seed";
    plot.age = 0;
    return finishAction("씨앗 심기", "작은 씨앗을 흙 속에 심었습니다.");
  }

  if (action === "plantAll") {
    if (!requireFarmTool("autoPlanter", "전체 씨앗 뿌리기")) return;
    const plots = state.plots.filter((item) => item.stage === "tilled");
    const count = Math.min(state.seeds, plots.length);
    if (count === 0) return setMessage("전체 씨앗 뿌리기", plots.length ? "씨앗이 부족합니다. 상점에서 구매하세요." : "씨앗을 심을 밭이 없습니다.");
    plots.slice(0, count).forEach((item) => {
      item.stage = "seed";
      item.age = 0;
      item.watered = false;
    });
    state.seeds -= count;
    state.hour = (state.hour + Math.min(1.2, count * 0.12)) % 24;
    setMessage("전체 씨앗 뿌리기", `${count}칸에 씨앗을 한 번에 심었습니다.`);
    renderFarm();
    renderStats();
    return;
  }

  if (action === "water") {
    if (!["seed", "sprout", "grown"].includes(plot.stage)) return setMessage("물뿌리개", "물을 줄 작물이 없습니다.");
    plot.watered = true;
    if (state.tools.wateringCan > 1) {
      const nextPlot = state.plots[state.selectedPlot + 1];
      if (nextPlot && ["seed", "sprout", "grown"].includes(nextPlot.stage)) nextPlot.watered = true;
    }
    return finishAction("물주기", "흙이 촉촉해졌습니다. 내일 더 자랄 거예요.");
  }

  if (action === "waterAll") {
    if (!requireFarmTool("sprinkler", "전체 물주기")) return;
    const plots = state.plots.filter((item) => ["seed", "sprout", "grown"].includes(item.stage) && !item.watered);
    if (plots.length === 0) return setMessage("전체 물주기", "물을 줄 작물이 없습니다.");
    plots.forEach((item) => {
      item.watered = true;
    });
    state.hour = (state.hour + Math.min(1.2, plots.length * 0.1)) % 24;
    setMessage("전체 물주기", `${plots.length}칸의 작물에 물을 주었습니다.`);
    renderFarm();
    renderStats();
    return;
  }

  if (action === "harvest") {
    if (plot.stage !== "ripe") return setMessage("수확", "아직 수확하기엔 이릅니다.");
    return startHarvestMiniGame();
  }

  if (action === "harvestAll") {
    if (!requireFarmTool("harvestBasket", "전체 수확")) return;
    const plots = state.plots.filter((item) => item.stage === "ripe");
    if (plots.length === 0) return setMessage("전체 수확", "수확할 작물이 없습니다.");
    plots.forEach((item) => {
      item.stage = "tilled";
      item.age = 0;
      item.watered = false;
    });
    state.crops += plots.length;
    state.harvested += plots.length;
    state.hour = (state.hour + Math.min(1.2, plots.length * 0.14)) % 24;
    const rewarded = claimHarvestReward();
    setMessage(rewarded ? "퀘스트 완료" : "전체 수확", rewarded ? `작물 ${plots.length}개를 수확했습니다. 첫 수확의 날 보상으로 60G를 받았습니다.` : `익은 작물 ${plots.length}개를 한 번에 수확했습니다.`);
    renderFarm();
    renderStats();
  }
}

function claimHarvestReward() {
  if (state.harvested < 2 || state.harvestRewardClaimed) return false;
  state.harvestRewardClaimed = true;
  state.gold += 60;
  return true;
}

function completeHarvest() {
  const plot = state.plots[state.selectedPlot];
  plot.stage = "tilled";
  plot.age = 0;
  plot.watered = false;
  state.crops += 1;
  state.harvested += 1;
  const rewarded = claimHarvestReward();
  finishAction(rewarded ? "퀘스트 완료" : "수확 성공", rewarded ? "첫 수확의 날 완료! 보상으로 60G를 받았습니다." : "작물을 상하지 않게 잘 뽑았습니다.");
}

function finishAction(name, text) {
  state.hour = (state.hour + 0.35) % 24;
  setMessage(name, text);
  renderFarm();
  renderStats();
}

function saveGame() {
  const saveData = {
    ...state,
    velocity: { x: 0, y: 0 },
  };
  localStorage.setItem(saveKey, JSON.stringify(saveData));
  setMessage("저장 완료", "현재 농장 상태를 저장했습니다. 다음에 불러오기로 이어서 할 수 있어요.");
}

function loadGame() {
  const rawSave = localStorage.getItem(saveKey);
  if (!rawSave) return setMessage("저장 없음", "아직 저장된 농장이 없습니다.");

  applySave(rawSave, "불러오기 완료", "저장된 농장으로 돌아왔습니다.");
}

function applySave(rawSave, title, message) {
  try {
    const savedState = JSON.parse(rawSave);
    Object.assign(state, savedState, { velocity: { x: 0, y: 0 } });
    state.bugs = state.bugs || 0;
    state.level = Math.max(1, Number(state.level) || 1);
    state.insects = {
      butterfly: 0,
      beetle: 0,
      firefly: 0,
      ...state.insects,
    };
    if (Object.values(state.insects).every((count) => count === 0) && state.bugs > 0) {
      state.insects.butterfly = state.bugs;
    }
    state.tutorialCompleted = Boolean(state.tutorialCompleted);
    state.area = state.area === "bigTown" ? "bigTown" : "farm";
    state.soraQuest = {
      accepted: false,
      progress: 0,
      completed: false,
      ...state.soraQuest,
    };
    state.tools = {
      wateringCan: 1,
      fishingRod: 1,
      forageBag: 1,
      autoPlanter: 0,
      sprinkler: 0,
      harvestBasket: 0,
      ...state.tools,
    };
    renderFarm();
    renderStats();
    renderPlayer();
    setMessage(title, message);
  } catch (error) {
    setMessage("불러오기 실패", "저장 데이터를 읽지 못했습니다. 다시 저장해 주세요.");
  }
}

function loadSavedGameOnStart() {
  const rawSave = localStorage.getItem(saveKey);
  if (rawSave) applySave(rawSave, "이어 하기", "저장된 농장 상태를 불러왔습니다.");
}

function nextDay() {
  state.day += 1;
  state.hour = 8;
  state.plots.forEach((plot) => {
    if (plot.watered && ["seed", "sprout", "grown"].includes(plot.stage)) {
      plot.age += 1;
      if (plot.age === 1) plot.stage = "sprout";
      if (plot.age === 2) plot.stage = "grown";
      if (plot.age >= 3) plot.stage = "ripe";
    }
    plot.watered = false;
  });
  document.querySelectorAll(".collectable").forEach((item) => item.classList.remove("picked"));
  document.querySelectorAll(".insect").forEach((item) => respawnInsect(item));
  setMessage("새 아침", "작물들이 밤새 자랐습니다. 채집 재료도 다시 돋아났어요.");
  renderFarm();
  renderStats();
}

function buySeed() {
  if (state.gold < 20) return setMessage("상점", "씨앗을 사기엔 골드가 부족합니다.");
  state.gold -= 20;
  state.seeds += 1;
  setMessage("상점", "씨앗 1개를 샀습니다.");
  renderStats();
}

function buyTool() {
  if (distanceTo(83, 28) > 18) return setMessage("도구 상점", "도구는 도구 상점 근처에서 구매할 수 있습니다.");

  const upgrades = [
    ["wateringCan", "물뿌리개", 90, "이제 물주기 한 번으로 옆 밭까지 촉촉해집니다."],
    ["fishingRod", "낚싯대", 120, "이제 낚시할 때 물고기를 2마리씩 잡습니다."],
    ["forageBag", "채집가방", 100, "이제 채집할 때 재료를 2개씩 얻습니다."],
  ];
  const nextUpgrade = upgrades.find(([key]) => state.tools[key] < 2);
  if (!nextUpgrade) return setMessage("도구 상점", "모든 도구가 이미 좋아졌습니다.");

  const [key, label, cost, effect] = nextUpgrade;
  if (state.gold < cost) return setMessage("도구 상점", `${label} 업그레이드에는 ${cost}G가 필요합니다.`);

  state.gold -= cost;
  state.tools[key] += 1;
  setMessage("도구 상점", `${label}을 업그레이드했습니다. ${effect}`);
  renderStats();
}

const farmToolUpgrades = {
  autoPlanter: ["전체 파종기", 140, "이제 갈아둔 밭 전체에 씨앗을 한 번에 심을 수 있습니다."],
  sprinkler: ["전체 물주기 장치", 160, "이제 자라고 있는 작물 전체에 한 번에 물을 줄 수 있습니다."],
  harvestBasket: ["전체 수확함", 180, "이제 익은 작물을 한 번에 수확할 수 있습니다."],
};

function buyFarmTool(key) {
  if (distanceTo(83, 28) > 18) return setMessage("도구 상점", "이 기능은 도구 상점 근처에서 구매할 수 있습니다.");
  const [label, cost, effect] = farmToolUpgrades[key];
  if (state.tools[key]) return setMessage("도구 상점", `${label}은 이미 구매했습니다.`);
  if (state.gold < cost) return setMessage("도구 상점", `${label} 구매에는 ${cost}G가 필요합니다.`);
  state.gold -= cost;
  state.tools[key] = 1;
  setMessage("도구 상점", `${label}을 구매했습니다. ${effect}`);
  renderStats();
}

function sellCrop() {
  if (state.crops <= 0) return setMessage("상점", "판매할 작물이 없습니다.");
  state.crops -= 1;
  state.gold += 35;
  setMessage("상점", "작물 1개를 35G에 판매했습니다.");
  renderStats();
}

function sellFish() {
  if (state.fish <= 0) return setMessage("상점", "판매할 물고기가 없습니다.");
  state.fish -= 1;
  state.gold += 25;
  setMessage("상점", "물고기 1마리를 25G에 판매했습니다.");
  renderStats();
}

function sellBug() {
  if (state.bugs <= 0) return setMessage("상점", "판매할 곤충이 없습니다.");
  const insectKey = Object.keys(insectNames).find((key) => state.insects[key] > 0);
  if (!insectKey) return setMessage("상점", "판매할 곤충이 없습니다.");
  state.bugs -= 1;
  state.insects[insectKey] -= 1;
  state.gold += 18;
  setMessage("상점", `${insectNames[insectKey]} 1마리를 18G에 판매했습니다.`);
  renderStats();
}

function fish() {
  if (state.area !== "bigTown" && distanceTo(82, 69) > 22) return setMessage("낚시", "농장 호수 또는 큰마을 낚시터 근처에서 낚시할 수 있습니다.");
  startFishingMiniGame();
}

function completeFishing() {
  state.fish += state.tools.fishingRod;
  state.hour = (state.hour + 0.5) % 24;
  setMessage("낚시 성공", state.tools.fishingRod > 1 ? "좋은 낚싯대 덕분에 물고기 2마리를 낚았습니다." : "잔잔한 물결 사이에서 작은 물고기를 낚았습니다.");
  renderStats();
}

function startFishingMiniGame() {
  startMiniGame({
    type: "fish",
    title: "물고기 잡기",
    text: "찌가 초록 구간에 들어왔을 때 멈추세요.",
    successLeft: 58,
    successWidth: 18,
    duration: 1350,
    onSuccess: completeFishing,
    failTitle: "낚시 실패",
    failText: "물고기가 미끼만 톡 건드리고 도망갔습니다.",
  });
}

function startHarvestMiniGame() {
  startMiniGame({
    type: "harvest",
    title: "작물 뽑기",
    text: "뿌리가 느슨해지는 초록 구간에 맞춰 뽑으세요.",
    successLeft: 36,
    successWidth: 22,
    duration: 1150,
    onSuccess: completeHarvest,
    failTitle: "수확 실패",
    failText: "너무 세게 잡아당겼습니다. 작물은 아직 밭에 남아 있어요.",
  });
}

function startMiniGame(config) {
  activeMiniGame = {
    ...config,
    startedAt: performance.now(),
  };
  miniTitle.textContent = config.title;
  miniText.textContent = config.text;
  fishMiniScene.classList.toggle("visible", config.type === "fish");
  farmMiniScene.classList.toggle("visible", config.type === "harvest");
  successZone.style.left = `${config.successLeft}%`;
  successZone.style.width = `${config.successWidth}%`;
  timingCursor.style.animationDuration = `${config.duration}ms`;
  timingCursor.classList.remove("running");
  miniGame.classList.remove("hidden");
  requestAnimationFrame(() => timingCursor.classList.add("running"));
}

function stopMiniGame() {
  if (!activeMiniGame) return;

  const elapsed = (performance.now() - activeMiniGame.startedAt) % activeMiniGame.duration;
  const progress = (elapsed / activeMiniGame.duration) * 100;
  const left = activeMiniGame.successLeft;
  const right = activeMiniGame.successLeft + activeMiniGame.successWidth;
  const success = progress >= left && progress <= right;
  const result = activeMiniGame;
  closeMiniGame();

  if (success) {
    result.onSuccess();
    return;
  }

  setMessage(result.failTitle, result.failText);
}

function closeMiniGame() {
  activeMiniGame = null;
  timingCursor.classList.remove("running");
  fishMiniScene.classList.remove("visible");
  farmMiniScene.classList.remove("visible");
  miniGame.classList.add("hidden");
}

function cook() {
  if (distanceTo(19, 22) > 16) return setMessage("요리", "요리는 집 안에서 할 수 있습니다. 집 근처로 이동해 주세요.");
  if (state.crops <= 0 || state.forage <= 0) return setMessage("요리", "작물 1개와 채집 재료 1개가 필요합니다.");
  state.crops -= 1;
  state.forage -= 1;
  state.meals += 1;
  state.hearts += 1;
  setMessage("요리", "따뜻한 계절 스튜를 만들었습니다. 주민에게 나눠주기 좋겠어요.");
  renderStats();
}

function talk() {
  if (distanceTo(58, 30) > 18) return setMessage("대화", "주민 소라 근처에서 대화할 수 있습니다.");
  if (!state.soraQuest.accepted) {
    state.soraQuest.accepted = true;
    setMessage("소라의 부탁", "큰마을 가는 길에서 곤충 몹이 늘었대요. 곤충 몹 3마리를 잡아 도감에 기록해 줄래요?");
    renderStats();
    return;
  }
  if (!state.soraQuest.completed && state.soraQuest.progress >= 3) {
    state.soraQuest.completed = true;
    state.gold += 90;
    state.hearts += 2;
    setMessage("소라의 보상", "도감 기록을 확인했어요! 90G와 호감도 2를 받았습니다.");
    renderStats();
    return;
  }
  if (!state.soraQuest.completed) {
    setMessage("소라", `곤충 몹을 ${3 - state.soraQuest.progress}마리 더 잡아 주세요. 큰마을 가는 길도 열어 둘게요.`);
    return;
  }
  state.hearts += state.meals > 0 ? 2 : 1;
  if (state.meals > 0) state.meals -= 1;
  setMessage("소라", state.hearts >= 5 ? "소라가 농장에 놀러 오겠다고 합니다. 이제 마을이 조금 더 가까워졌어요." : "소라가 웃으며 말합니다. '첫 수확 작물은 꼭 보여줘요.'");
  renderStats();
}

function distanceTo(x, y) {
  return Math.hypot(state.pos.x - x, state.pos.y - y);
}

function describeNearbyPlace() {
  let closest = null;
  let closestDistance = Infinity;
  Object.values(placeInfo).forEach(([name, text, x, y]) => {
    const distance = distanceTo(x, y);
    if (distance < closestDistance) {
      closest = [name, text];
      closestDistance = distance;
    }
  });
  if (closest && closestDistance < 10) setMessage(closest[0], closest[1]);
}

function moveToPlace(placeKey) {
  const place = placeInfo[placeKey];
  state.pos = { x: place[2], y: place[3] };
  state.velocity = { x: 0, y: 0 };
  setMessage(place[0], place[1]);
  renderPlayer();
}

function enterBigTown() {
  if (state.area === "bigTown") return;
  state.area = "bigTown";
  state.velocity = { x: 0, y: 0 };
  setMessage("햇살 큰마을", "길을 따라 아래로 내려와 큰마을에 도착했습니다. 장터를 천천히 둘러보세요.");
  renderStats();
}

function returnToFarm() {
  state.area = "farm";
  state.pos = { x: 51, y: 88 };
  state.velocity = { x: 0, y: 0 };
  setMessage("농장 길목", "큰마을에서 농장으로 돌아왔습니다.");
  renderStats();
  renderPlayer();
}

function walk() {
  const speed = keys.has("shift") ? 0.42 : 0.28;
  const acceleration = 0.18;
  const friction = 0.84;
  let inputX = 0;
  let inputY = 0;

  if (keys.has("arrowup") || keys.has("w")) inputY -= 1;
  if (keys.has("arrowdown") || keys.has("s")) inputY += 1;
  if (keys.has("arrowleft") || keys.has("a")) inputX -= 1;
  if (keys.has("arrowright") || keys.has("d")) inputX += 1;

  if (inputX !== 0 && inputY !== 0) {
    inputX *= Math.SQRT1_2;
    inputY *= Math.SQRT1_2;
  }

  state.velocity.x = state.velocity.x * friction + inputX * speed * acceleration;
  state.velocity.y = state.velocity.y * friction + inputY * speed * acceleration;
  if (Math.abs(state.velocity.x) < 0.003) state.velocity.x = 0;
  if (Math.abs(state.velocity.y) < 0.003) state.velocity.y = 0;

  state.pos.x = clamp(state.pos.x + state.velocity.x, 4, 96);
  state.pos.y = clamp(state.pos.y + state.velocity.y, 7, 95);

  if (state.area === "farm" && state.pos.y >= 92 && state.pos.x >= 43 && state.pos.x <= 62) {
    enterBigTown();
    requestAnimationFrame(walk);
    return;
  }

  const moved = Math.hypot(state.velocity.x, state.velocity.y) > 0.015;
  if (moved) {
    state.hour = (state.hour + 0.004) % 24;
    describeNearbyPlace();
    renderStats();
  }

  player.classList.toggle("walking", moved);
  if (state.velocity.x < -0.01) {
    player.classList.add("facing-left");
    player.classList.remove("facing-right");
  } else if (state.velocity.x > 0.01) {
    player.classList.add("facing-right");
    player.classList.remove("facing-left");
  }

  renderPlayer();
  requestAnimationFrame(walk);
}

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => useTool(button.dataset.action));
});

document.querySelectorAll("[data-place]").forEach((button) => {
  button.addEventListener("click", () => moveToPlace(button.dataset.place));
});

document.querySelectorAll("[data-forage]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("picked")) return setMessage("채집", "오늘은 이미 채집한 곳입니다.");
    button.classList.add("picked");
    state.forage += state.tools.forageBag;
    setMessage("채집", state.tools.forageBag > 1 ? `${forageNames[button.dataset.forage]}을 넉넉히 챙겼습니다.` : `${forageNames[button.dataset.forage]}을 가방에 넣었습니다.`);
    renderStats();
  });
});

document.querySelectorAll("[data-insect]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.classList.contains("caught")) return setMessage("곤충 몹", "새 몹이 나타나는 중입니다.");
    const insectType = button.dataset.insect;
    const mobLevel = Number(button.dataset.level) || 1;
    const levelGain = randomInt(1, Math.min(3, Math.max(1, mobLevel)));
    button.classList.add("caught");
    state.bugs += 1;
    state.insects[insectType] += 1;
    if (state.soraQuest.accepted && !state.soraQuest.completed) state.soraQuest.progress = Math.min(3, state.soraQuest.progress + 1);
    state.level += levelGain;
    setMessage("몹 채집", `Lv.${mobLevel} ${insectNames[insectType]} 몹을 잡았습니다! 채집 레벨 Lv.${state.level} (+${levelGain})`);
    renderStats();
    window.setTimeout(() => respawnInsect(button), 700);
  });
});

document.querySelector("#buySeedBtn").addEventListener("click", buySeed);
document.querySelector("#buyToolBtn").addEventListener("click", buyTool);
document.querySelector("#buyPlantAllBtn").addEventListener("click", () => buyFarmTool("autoPlanter"));
document.querySelector("#buyWaterAllBtn").addEventListener("click", () => buyFarmTool("sprinkler"));
document.querySelector("#buyHarvestAllBtn").addEventListener("click", () => buyFarmTool("harvestBasket"));
document.querySelector("#sellCropBtn").addEventListener("click", sellCrop);
document.querySelector("#sellFishBtn").addEventListener("click", sellFish);
document.querySelector("#sellBugBtn").addEventListener("click", sellBug);
document.querySelector("#fishBtn").addEventListener("click", fish);
document.querySelector("#cookBtn").addEventListener("click", cook);
document.querySelector("#talkBtn").addEventListener("click", talk);
document.querySelector("#nextDayBtn").addEventListener("click", nextDay);
document.querySelector("#saveBtn").addEventListener("click", saveGame);
document.querySelector("#loadBtn").addEventListener("click", loadGame);
document.querySelector("#tutorialBtn").addEventListener("click", openTutorial);
bigTownGate.addEventListener("click", enterBigTown);
townReturnBtn.addEventListener("click", returnToFarm);
townFishingBtn.addEventListener("click", fish);
townExitBtn.addEventListener("click", returnToFarm);
stopMiniBtn.addEventListener("click", stopMiniGame);
tutorialNextBtn.addEventListener("click", nextTutorialStep);
tutorialSkipBtn.addEventListener("click", () => closeTutorial("튜토리얼을 건너뛰었습니다. 언제든 튜토리얼 버튼으로 다시 볼 수 있어요."));
cancelMiniBtn.addEventListener("click", () => {
  closeMiniGame();
  setMessage("미니게임", "잠시 숨을 고르고 다시 시도할 수 있습니다.");
});

window.addEventListener("keydown", (event) => {
  const key = movementCodes[event.code] || event.key.toLowerCase();
  if (activeMiniGame && (event.code === "Space" || event.code === "Enter")) {
    event.preventDefault();
    stopMiniGame();
    return;
  }
  if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", "shift"].includes(key)) {
    event.preventDefault();
  }
  keys.add(key);
});

window.addEventListener("keyup", (event) => {
  const key = movementCodes[event.code] || event.key.toLowerCase();
  keys.delete(key);
});

renderFarm();
renderStats();
renderPlayer();
loadSavedGameOnStart();
document.querySelectorAll(".insect").forEach((item) => randomizeInsect(item));
if (!state.tutorialCompleted) openTutorial();
walk();
