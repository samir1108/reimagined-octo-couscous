import type { LineForm } from "./types";

export const LINE_CONCEPTS = [
  "observation",
  "self_inquiry",
  "neti_neti",
  "witness",
  "breath",
  "body",
  "bhakti",
  "jnana",
  "karma",
  "raja",
] as const;

export const LINE_FORMS: LineForm[] = [
  "teaching",
  "instruction",
  "question",
  "carry",
  "myth",
  "warning",
];

export const LINE_LEVELS = [1, 2, 3] as const;

export const PHRASINGS = [
  "In plain words: {text}",
  "For today: {text}",
  "The practice is simple: {text}",
  "If you remember one thing: {text}",
  "Test it yourself: {text}",
  "The instruction: {text}",
  "A quieter way to say it: {text}",
  "Keep this in front of you: {text}",
  "What actually matters: {text}",
  "One honest sentence: {text}",
  "Try this, nothing more: {text}",
  "The whole sitting can be this: {text}",
  "When in doubt, return to this: {text}",
  "A note for the next sit: {text}",
  "Say it without decoration: {text}",
  "The non-negotiable: {text}",
  "What to do when you forget: {text}",
  "The smallest version: {text}",
  "Before you add anything: {text}",
  "The door is here: {text}",
];

export const DOSE_PREFIX = ["", "For a short sit: ", "For a longer sit: "];

export const AUDIENCE_PREFIX = ["", "If today is heavy: "];

export const LINE_TAILS = [
  "",
  " Start with one breath.",
  " Keep it small.",
  " Do not add anything.",
  " Return once today.",
];

export const PHRASINGS_HI = [
  "आसान शब्दों में: {text}",
  "आज के लिए: {text}",
  "यह अभ्यास है: {text}",
  "एक बात याद रखो: {text}",
  "खुद जाँचो: {text}",
  "निर्देश: {text}",
  "धीरे से कहो: {text}",
  "सबसे छोटा रूप: {text}",
  "जब भूल जाओ: {text}",
  "पहले कुछ मत जोड़ो: {text}",
];

export const DOSE_PREFIX_HI = ["", "छोटे सत्र के लिए: ", "लंबे सत्र के लिए: "];

export const AUDIENCE_PREFIX_HI = ["", "अगर आज भारी है: "];

export const LINE_TAILS_HI = [
  "",
  " एक साँस से शुरू करो।",
  " छोटा रखो।",
  " कुछ मत जोड़ो।",
  " आज एक बार लौटो।",
];

export const HINDI_BASE: Record<
  string,
  { teaching: string; practice: string; question: string; carry: string }
> = {
  observation: {
    teaching: "अवलोकन का अर्थ है जो हो रहा है उसे देखना — बदलने या जज किए बिना।",
    practice: "एक मिनट के लिए तीन चीज़ें देखो: कुर्सी पर वज़न, त्वचा पर हवा, एक साँस।",
    question: "तीनों चीज़ें कौन देख रहा था?",
    carry: "आज एक बार: 'सोच रहा हूँ' — फिर एक साँस।",
  },
  self_inquiry: {
    teaching: "आत्म-जिज्ञासा जवाब से नहीं, पूछने वाले की ओर मुड़ती है। 'मैं कौन हूँ?' एक दिशा है।",
    practice: "एक बार धीरे से पूछो: 'मैं कौन हूँ?' जवाब मत दो। देखो ध्यान कहाँ मुड़ता है।",
    question: "जब जवाब नहीं दिया, क्या हुआ?",
    carry: "आज एक बार किसी प्रतिक्रिया पर पूछो: 'यह किसके लिए आया?'",
  },
  neti_neti: {
    teaching: "नेति-नेति इनकार नहीं, विवेक है: शरीर, भाव, विचार — जो जाना जा सकता है, वह मैं नहीं।",
    practice: "धीरे से कहो: 'यह शरीर जाना जाता है; मैं केवल यह शरीर नहीं हूँ।'",
    question: "जो बचा, उसका नाम क्या है?",
    carry: "आज एक बार 'मैं थक गया हूँ' के बाद जोड़ो: 'यह जाना जा रहा है'।",
  },
  witness: {
    teaching: "साक्षी का अर्थ है उस जागरूकता में टिकना जो सब कुछ देख रही है, उसमें बदले बिना।",
    practice: "एक मिनट बैठो। विचार आए तो धीरे से नाम दो: 'सोच'। उसके पीछे मत जाओ।",
    question: "विचारों को कौन देख रहा था?",
    carry: "आज तीन बार एक साँस के लिए पूछो: 'अभी क्या जाग रहा है?'",
  },
  breath: {
    teaching: "श्वास-अवलोकन का अर्थ है साँस को जैसी है वैसी देखना, बदलने की कोशिश नहीं।",
    practice: "एक मिनट के लिए नाक पर साँस महसूस करो। लंबी हो या छोटी — सब स्वीकार है।",
    question: "साँस सबसे ज़्यादा कहाँ महसूस हुई?",
    carry: "आज एक बार बिना बदले तीन साँस लो और एक चीज़ नोट करो।",
  },
  body: {
    teaching: "शरीर-संवेदन का अर्थ है शरीर को शरीर की तरह महसूस करना — वज़न, गर्मी, संपर्क — सोचने के बजाय।",
    practice: "सिर से पैर तक धीरे स्कैन करो। केवल वही नाम दो जो सचमुच महसूस हो रहा है।",
    question: "शरीर का कौन-सा हिस्सा सबसे जागता हुआ लगा?",
    carry: "आज एक बार दोनों पैर ज़मीन पर रखो और दस सेकंड संपर्क महसूस करो।",
  },
};

/** 10 × 6 × 20 × 3 × 3 × 2 × 5 */
export const LINE_CAPACITY =
  LINE_CONCEPTS.length *
  LINE_FORMS.length *
  PHRASINGS.length *
  LINE_LEVELS.length *
  DOSE_PREFIX.length *
  AUDIENCE_PREFIX.length *
  LINE_TAILS.length;
