import type { ComfortMode, ComfortResult, EmotionFamilyId, Profile } from "../types";

const HIGH_RISK = [
  "自杀",
  "不想活",
  "去死",
  "结束生命",
  "割腕",
  "跳楼",
  "安眠药",
  "活不下去",
  "杀了自己",
  "伤害自己",
  "一了百了",
  "永别",
];

const MEDIUM_RISK = [
  "想消失",
  "活着没意思",
  "没有意义",
  "撑不住",
  "消失了就好",
  "不想醒来",
  "没人在乎",
];

interface Theme {
  id: string;
  words: string[];
  opening: string;
  normalize: string;
  emotion: EmotionFamilyId;
}

const THEMES: Theme[] = [
  {
    id: "grief",
    words: [
      "去世",
      "离世",
      "走了",
      "葬礼",
      "头七",
      "忌日",
      "爸爸",
      "妈妈",
      "爷爷",
      "奶奶",
      "外公",
      "外婆",
      "亲人",
      "临终",
      "火化",
    ],
    opening:
      "失去一个重要的人，世界不会立刻恢复原样。你现在的恍惚和难受，都是因为这份关系真的很重。",
    normalize: "在这样的日子里，反复想起、突然崩溃、觉得不真实，都是很自然的。",
    emotion: "sadness",
  },
  {
    id: "breakup",
    words: ["分手", "失恋", "前任", "复合", "不爱我", "离开我", "劈腿", "出轨", "拉黑", "异地"],
    opening:
      "那段关系在你心里占过很重的位置，所以现在路过一家店、听到一首歌都会疼。",
    normalize: "结束一段重要的关系，本来就会像失去一部分生活；难受不代表你不够洒脱。",
    emotion: "sadness",
  },
  {
    id: "work",
    words: ["工作", "领导", "老板", "同事", "汇报", "加班", "绩效", "裁员", "面试", "当众", "被批评"],
    opening:
      "被这样对待，心里一定又难堪又委屈。你为这件事认真过，结果却被一句话盖过去。",
    normalize: "在这种处境里，冒出“我是不是不行”的念头，太正常了。",
    emotion: "anxiety",
  },
  {
    id: "family",
    words: ["爸妈", "父母", "家里", "结婚", "催婚", "亲戚", "弟弟", "妹妹", "哥哥", "姐姐", "孩子"],
    opening:
      "被最亲近的人这样说，疼的不只是那句话，还有“原来我在你心里是这样”的失落。",
    normalize: "越是在意的人，越容易一句话就扎到最深的地方。",
    emotion: "sadness",
  },
  {
    id: "self",
    words: ["没用", "失败", "不够好", "讨厌自己", "废物", "自卑", "配不上", "很差劲"],
    opening:
      "你对自己的那几句话，比事情本身还重。听起来，你已经对自己很苛刻了。",
    normalize: "在难受的时候，人很容易把一次失败，解释成“我整个人都不行”。",
    emotion: "sadness",
  },
  {
    id: "anxiety",
    words: ["焦虑", "紧张", "担心", "慌", "睡不着", "失眠", "心跳", "害怕", "不安"],
    opening: "那种紧绷像是一根弦一直拉着，想停也停不下来。",
    normalize: "身体先于语言进入警戒，不代表你脆弱，也不代表一定会发生坏事。",
    emotion: "anxiety",
  },
  {
    id: "tired",
    words: ["累", "疲惫", "没力气", "不想动", "麻木", "撑不住", "耗尽", "提不起劲"],
    opening: "听起来是一种连“为什么”都说不清的累。没有具体的大事，也不代表这种累是假的。",
    normalize: "累到不想解释，是身体在说：我已经撑了很久。",
    emotion: "fatigue",
  },
  {
    id: "lonely",
    words: ["孤独", "没人", "一个人", "空落", "格格不入", "被忽略", "无人理解", "想念"],
    opening: "不是身边没人，而是没有一个真正能说话的人。那种空落，很难被别人看见。",
    normalize: "想被理解、又怕打扰别人，这种拉扯本身就很消耗。",
    emotion: "lonely",
  },
  {
    id: "angry",
    words: ["生气", "愤怒", "恼火", "烦躁", "不公平", "被冒犯", "越界", "怨恨"],
    opening: "这件事越过了你的边界，生气是很自然的反应。",
    normalize: "愤怒常常在替你说：有些东西不该被这样对待。",
    emotion: "anger",
  },
];

const GENERAL: Theme = {
  id: "general",
  words: [],
  opening: "听你说这些，能感觉到这件事压在你心里有一阵子了。",
  normalize: "被这样对待，难受是很自然的。",
  emotion: "complex",
};

function detectTheme(text: string): Theme {
  let best = GENERAL;
  let bestScore = 0;
  for (const theme of THEMES) {
    const score = theme.words.reduce((sum, word) => (text.includes(word) ? sum + 1 : sum), 0);
    if (score > bestScore) {
      best = theme;
      bestScore = score;
    }
  }
  return best;
}

function safetyResponse(level: "medium" | "high"): ComfortResult {
  if (level === "high") {
    return {
      safety: "high",
      theme: "crisis",
      emotion: "sadness",
      text:
        "我很在意你现在的安全。你愿意告诉我，你现在身边有没有可以马上联系的人吗？\n\n你不用一个人扛。",
    };
  }
  return {
    safety: "medium",
    theme: "crisis",
    emotion: "sadness",
    text:
      "听起来你已经撑了很久，甚至想过“消失”会不会轻松一点。我很在意你现在的安全。\n\n你愿意告诉我，你现在身边有没有可以马上联系的人吗？",
  };
}

function comfortLine(profile: Profile): string {
  if (!profile.completed) {
    return "我不急着让你好起来，也不会催你放下。你想说，我就听；不想说，我们就这样待一会儿。";
  }
  switch (profile.comfort) {
    case "listen":
      return "我不急着给建议。你想说，我就听。";
    case "affirm":
      return "你已经撑了很久，这一点值得被看见。";
    case "quiet":
      return "不想说也没关系，我们就这样安静待一会儿。";
    case "company":
    default:
      return "我不急着让你好起来，也不会催你放下。我在这儿。";
  }
}

function toneLine(profile: Profile): string {
  if (!profile.completed) return "";
  switch (profile.tone) {
    case "light":
      return "今晚先不跟自己较劲，好不好？";
    case "steady":
      return "这件事很重，你不用一个人把它扛完。";
    case "direct":
      return "这确实很难。难受是正常的，不需要马上好起来。";
    case "gentle":
    default:
      return "";
  }
}

export function buildComfort(text: string, mode: ComfortMode, profile: Profile): ComfortResult {
  const trimmed = text.trim();
  const high = HIGH_RISK.some((word) => trimmed.includes(word));
  if (high) return safetyResponse("high");
  const medium = MEDIUM_RISK.some((word) => trimmed.includes(word));
  if (medium) return safetyResponse("medium");

  const theme = detectTheme(trimmed);
  if (mode === "listen") {
    return { text: "", safety: "none", theme: theme.id, emotion: theme.emotion };
  }

  const parts: string[] = [];
  const prefix =
    profile.completed && profile.name.trim() ? `${profile.name.trim()}，` : "";
  parts.push(prefix + theme.opening);
  parts.push(theme.normalize);

  if (profile.completed && profile.interests.length > 0) {
    const interest = profile.interests[0];
    parts.push(
      `你之前说，${interest}会让你安静一点。今晚不用急着回到那个状态，先让自己停在这里也可以。`,
    );
  }

  parts.push(comfortLine(profile));
  const tone = toneLine(profile);
  if (tone) parts.push(tone);

  return {
    text: parts.join(""),
    safety: "none",
    theme: theme.id,
    emotion: theme.emotion,
  };
}

export function suggestedEmotion(text: string): EmotionFamilyId {
  return detectTheme(text).emotion;
}
