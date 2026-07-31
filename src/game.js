export const STORAGE_KEY = "tiny-being-save-v1";
export const MAX_OFFLINE_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_STATE = {
  petName: "小不点",
  createdAt: 0,
  lastUpdatedAt: 0,
  hunger: 72,
  mood: 68,
  cleanliness: 76,
  energy: 70,
  sleeping: false,
  action: "idle",
  message: "它正安静地观察这个新世界。",
  counts: { feed: 0, play: 0, clean: 0, touch: 0 },
};

const clamp = (value) => Math.max(0, Math.min(100, value));

export function createState(now = Date.now(), name = DEFAULT_STATE.petName) {
  return { ...structuredClone(DEFAULT_STATE), petName: name, createdAt: now, lastUpdatedAt: now };
}

export function settleState(saved, now = Date.now()) {
  const state = { ...createState(now), ...saved, counts: { ...DEFAULT_STATE.counts, ...saved.counts } };
  const elapsed = Math.max(0, Math.min(now - state.lastUpdatedAt, MAX_OFFLINE_MS));
  const hours = elapsed / 3_600_000;

  state.hunger = clamp(state.hunger - hours * 4);
  state.cleanliness = clamp(state.cleanliness - hours * 2.2);
  state.mood = clamp(state.mood - hours * (state.hunger < 25 || state.cleanliness < 25 ? 3 : 1.2));
  state.energy = clamp(state.energy + hours * (state.sleeping ? 14 : -2.5));
  state.lastUpdatedAt = now;

  if (elapsed > 60_000) {
    const away = hours < 1 ? `${Math.max(1, Math.round(elapsed / 60_000))} 分钟` : `${hours.toFixed(1)} 小时`;
    state.message = state.sleeping ? `你离开的 ${away} 里，它睡得很安稳。` : `你离开了 ${away}，它一直在等你。`;
  }
  return state;
}

export function applyAction(state, action, now = Date.now()) {
  const next = { ...state, counts: { ...state.counts }, lastUpdatedAt: now, action };
  const act = {
    feed() {
      if (next.sleeping) return "它睡着了，晚点再喂吧。";
      if (next.hunger >= 95) return "它拍拍肚子，表示已经吃不下了。";
      next.hunger = clamp(next.hunger + 24);
      next.mood = clamp(next.mood + 5);
      next.cleanliness = clamp(next.cleanliness - 3);
      next.counts.feed += 1;
      return "它认真吃完了，满足地舔舔嘴角。";
    },
    play() {
      if (next.sleeping) return "它缩在被窝里，没有听见小球。";
      if (next.energy < 15) return "它很想玩，但已经困得睁不开眼。";
      next.mood = clamp(next.mood + 18);
      next.energy = clamp(next.energy - 14);
      next.cleanliness = clamp(next.cleanliness - 6);
      next.counts.play += 1;
      return "它追着小球跑了好几圈，开心得停不下来。";
    },
    clean() {
      if (next.sleeping) return "还是别吵醒它了。";
      next.cleanliness = clamp(next.cleanliness + 32);
      next.mood = clamp(next.mood + 4);
      next.counts.clean += 1;
      return "房间重新变得干净，它满意地转了一圈。";
    },
    sleep() {
      next.sleeping = !next.sleeping;
      next.action = next.sleeping ? "sleep" : "happy";
      return next.sleeping ? "灯暗了下来。它蜷成一团，慢慢睡着了。" : "灯亮了。它揉揉眼睛，朝你看过来。";
    },
    touch() {
      if (next.sleeping) return "它在睡梦里轻轻蹭了蹭你的手。";
      next.mood = clamp(next.mood + 3);
      next.counts.touch += 1;
      next.action = "happy";
      return "它眯起眼睛，主动贴近了你的手。";
    },
  };
  next.message = act[action]?.() ?? next.message;
  return next;
}

export function dominantNeed(state) {
  if (state.sleeping) return { label: "睡梦中", tone: "sleep" };
  const values = [
    [state.hunger, "有点饿", "hungry"],
    [state.cleanliness, "需要清洁", "dirty"],
    [state.energy, "困倦", "tired"],
    [state.mood, "想要陪伴", "sad"],
  ].sort((a, b) => a[0] - b[0]);
  if (values[0][0] < 30) return { label: values[0][1], tone: values[0][2] };
  if (state.mood > 78) return { label: "很开心", tone: "happy" };
  return { label: "安稳", tone: "calm" };
}
