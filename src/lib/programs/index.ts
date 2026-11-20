/**
 * Programs v3 — public entry point.
 *
 * ✦ Atom library: 30 categories, ~60 atoms seeded (expand per category over time).
 * ✦ Programs: session-based (NOT day-based) — user paces themselves.
 * ✦ Composer (next phase): picks/orders atoms per user state.
 */
import type { SessionProgramV3 } from "./types";
import { THREE_INNER_LLMS } from "./programs/three-inner-llms";
import { LOOP_LIBERATION } from "./programs/loop-liberation";
import { WITNESS_AWAKENING } from "./programs/witness-awakening";
import { HEART_OPENING } from "./programs/heart-opening";
import { SHADOW_INTEGRATION } from "./programs/shadow-integration";
import { ENERGY_AWAKENING } from "./programs/energy-awakening";
import { STILLNESS_FOUNDATION } from "./programs/stillness-foundation";
import { DIGITAL_DETOX } from "./programs/digital-detox";
import { SACRED_SPEECH } from "./programs/sacred-speech";
import { DEATH_CONTEMPLATION } from "./programs/death-contemplation";
import { SLEEP_SANCTUARY } from "./programs/sleep-sanctuary";
import { ANXIETY_RELIEF } from "./programs/anxiety-relief";
import { FOCUS_MASTERY } from "./programs/focus-mastery";
import { SINGLE_POINTED_MIND } from "./programs/single-pointed-mind";
import { YOGA_SUTRAS_SAMADHI_PADA } from "./programs/yoga-sutras-samadhi-pada";
import { YOGA_SUTRAS_SADHANA_PADA } from "./programs/yoga-sutras-sadhana-pada";
import { YOGA_SUTRAS_VIBHUTI_PADA } from "./programs/yoga-sutras-vibhuti-pada";
import { YOGA_SUTRAS_KAIVALYA_PADA } from "./programs/yoga-sutras-kaivalya-pada";
import { GITA_KARMA_YOGA } from "./programs/gita-karma-yoga";
import { GITA_BHAKTI_YOGA } from "./programs/gita-bhakti-yoga";
import { GITA_JNANA_YOGA } from "./programs/gita-jnana-yoga";
import { HATHA_PRADIPIKA } from "./programs/hatha-pradipika";
import { SHATKARMA_NETI } from "./programs/shatkarma-neti";
import { SHATKARMA_DHAUTI } from "./programs/shatkarma-dhauti";
import { SHATKARMA_NAULI } from "./programs/shatkarma-nauli";
import { SHATKARMA_BASTI } from "./programs/shatkarma-basti";
import { SHATKARMA_KAPALBHATI } from "./programs/shatkarma-kapalbhati";
import { SHATKARMA_TRATAKA } from "./programs/shatkarma-trataka";
import { BANDHA_MULA } from "./programs/bandha-mula";
import { BANDHA_UDDIYANA } from "./programs/bandha-uddiyana";
import { BANDHA_JALANDHARA } from "./programs/bandha-jalandhara";
import { BANDHA_MAHA } from "./programs/bandha-maha";
import { MUDRA_PRANA } from "./programs/mudra-prana";
import { MUDRA_APANA } from "./programs/mudra-apana";
import { MUDRA_VAYU } from "./programs/mudra-vayu";
import { MUDRA_AKASH } from "./programs/mudra-akash";
import { MUDRA_PRITHVI } from "./programs/mudra-prithvi";
import { MUDRA_SHUNYA } from "./programs/mudra-shunya";
import { MUDRA_JNANA } from "./programs/mudra-jnana";
import { MUDRA_CHIN } from "./programs/mudra-chin";
import { MUDRA_ANJALI } from "./programs/mudra-anjali";
import { MUDRA_DHYANA } from "./programs/mudra-dhyana";
import { PRANAYAMA_SURYA_BHEDANA } from "./programs/pranayama-surya-bhedana";
import { PRANAYAMA_CHANDRA_BHEDANA } from "./programs/pranayama-chandra-bhedana";
import { PRANAYAMA_BHRAMARI } from "./programs/pranayama-bhramari";
import { PRANAYAMA_PLAVINI } from "./programs/pranayama-plavini";
import { PRANAYAMA_MURCHA } from "./programs/pranayama-murcha";
import { PRANAYAMA_SITALI } from "./programs/pranayama-sitali";
import { PRANAYAMA_SITKARI } from "./programs/pranayama-sitkari";
import { PRANAYAMA_VILOMA } from "./programs/pranayama-viloma";
import { PRANAYAMA_PRATILOMA } from "./programs/pranayama-pratiloma";
import { PRANAYAMA_KEVALA_KUMBHAKA } from "./programs/pranayama-kevala-kumbhaka";
import { ASANA_SURYA_NAMASKAR } from "./programs/asana-surya-namaskar";
import { ASANA_STANDING } from "./programs/asana-standing";
import { ASANA_FORWARD_BEND } from "./programs/asana-forward-bend";
import { ASANA_BACK_BEND } from "./programs/asana-back-bend";
import { ASANA_TWIST } from "./programs/asana-twist";
import { ASANA_INVERSION } from "./programs/asana-inversion";
import { ASANA_BALANCING } from "./programs/asana-balancing";
import { ASANA_RESTORATIVE } from "./programs/asana-restorative";
import { NADA_YOGA } from "./programs/nada-yoga";
import { LAYA_YOGA } from "./programs/laya-yoga";
import { MANTRA_JAPA_DEEP } from "./programs/mantra-japa-deep";
import { OM_MEDITATION } from "./programs/om-meditation";
import { YANTRA_YOGA } from "./programs/yantra-yoga";
import { BIJA_MANTRA_ARC } from "./programs/bija-mantra-arc";
import { KOSHA_ANNAMAYA } from "./programs/kosha-annamaya";
import { KOSHA_PRANAMAYA } from "./programs/kosha-pranamaya";
import { KOSHA_MANOMAYA } from "./programs/kosha-manomaya";
import { KOSHA_VIJNANAMAYA } from "./programs/kosha-vijnanamaya";
import { KOSHA_ANANDAMAYA } from "./programs/kosha-anandamaya";
import { PRANA_VAYU_PRANA } from "./programs/prana-vayu-prana";
import { PRANA_VAYU_APANA } from "./programs/prana-vayu-apana";
import { PRANA_VAYU_SAMANA } from "./programs/prana-vayu-samana";
import { PRANA_VAYU_UDANA } from "./programs/prana-vayu-udana";
import { PRANA_VAYU_VYANA } from "./programs/prana-vayu-vyana";
import { SAMADHI_SAVIKALPA } from "./programs/samadhi-savikalpa";
import { SAMADHI_NIRVIKALPA } from "./programs/samadhi-nirvikalpa";
import { SAMADHI_SAHAJA } from "./programs/samadhi-sahaja";
import { SAMADHI_ASAMPRAJNATA } from "./programs/samadhi-asamprajnata";
import { DARSHANA_SAMKHYA } from "./programs/darshana-samkhya";
import { DARSHANA_YOGA } from "./programs/darshana-yoga";
import { DARSHANA_NYAYA } from "./programs/darshana-nyaya";
import { DARSHANA_VAISHESHIKA } from "./programs/darshana-vaisheshika";
import { DARSHANA_MIMAMSA } from "./programs/darshana-mimamsa";
import { DARSHANA_VEDANTA } from "./programs/darshana-vedanta";
import { BHUTA_PRITHVI } from "./programs/bhuta-prithvi";
import { BHUTA_APA } from "./programs/bhuta-apa";
import { BHUTA_TEJAS } from "./programs/bhuta-tejas";
import { BHUTA_VAYU } from "./programs/bhuta-vayu";
import { BHUTA_AKASHA } from "./programs/bhuta-akasha";
import { GRANTHI_BRAHMA } from "./programs/granthi-brahma";
import { GRANTHI_VISHNU } from "./programs/granthi-vishnu";
import { GRANTHI_RUDRA } from "./programs/granthi-rudra";
import { KRIYA_TAPAS } from "./programs/kriya-tapas";
import { KRIYA_SVADHYAYA } from "./programs/kriya-svadhyaya";
import { KRIYA_ISHTA_PRANADHAMA } from "./programs/kriya-ishvara-pranidhana";
import { GUNA_SATTVA } from "./programs/guna-sattva";
import { GUNA_RAJAS } from "./programs/guna-rajas";
import { GUNA_TAMAS } from "./programs/guna-tamas";
import { KLESHA_AVIDYA } from "./programs/klesha-avidya";
import { KLESHA_ASMITA } from "./programs/klesha-asmita";
import { KLESHA_RAGA } from "./programs/klesha-raga";
import { KLESHA_DVESHA } from "./programs/klesha-dvesha";
import { KLESHA_ABHINIVESHA } from "./programs/klesha-abhinivesha";
import { GHERANDA_SHATKARMA } from "./programs/gheranda-shatkarma";
import { GHERANDA_ASANA } from "./programs/gheranda-asana";
import { GHERANDA_MUDRA } from "./programs/gheranda-mudra";
import { GHERANDA_PRATYAHARA } from "./programs/gheranda-pratyahara";
import { GHERANDA_PRANAYAMA } from "./programs/gheranda-pranayama";
import { GHERANDA_DHYANA } from "./programs/gheranda-dhyana";
import { GHERANDA_SAMADHI } from "./programs/gheranda-samadhi";
import { SHIVA_SAMHITA_CH1 } from "./programs/shiva-samhita-ch1";
import { SHIVA_SAMHITA_CH2 } from "./programs/shiva-samhita-ch2";
import { SHIVA_SAMHITA_CH3 } from "./programs/shiva-samhita-ch3";
import { SHIVA_SAMHITA_CH4 } from "./programs/shiva-samhita-ch4";
import { SHIVA_SAMHITA_CH5 } from "./programs/shiva-samhita-ch5";
import { SHIVA_SUTRAS_RECOGNITION } from "./programs/shiva-sutras-recognition";
import { SPANDA_DIVINE_VIBRATION } from "./programs/spanda-divine-vibration";
import { VIJNANA_BHAIRAVA_112 } from "./programs/vijnana-bhairava-112";
import { PRATYABHIJNA_RECOGNITION } from "./programs/pratyabhijna-recognition";
import { SPANDA_KARIKA_DEEP } from "./programs/spanda-karika-deep";
import { AYURVEDA_VATA } from "./programs/ayurveda-vata";
import { AYURVEDA_PITTA } from "./programs/ayurveda-pitta";
import { AYURVEDA_KAPHA } from "./programs/ayurveda-kapha";
import { AYURVEDA_DINACHARYA } from "./programs/ayurveda-dinacharya";
import { AYURVEDA_RITUCHARYA } from "./programs/ayurveda-ritucharya";
import { AYURVEDA_AGNI } from "./programs/ayurveda-agni";
import { AYURVEDA_MARMA } from "./programs/ayurveda-marma";
import { AYURVEDA_PANCHAKARMA } from "./programs/ayurveda-panchakarma";
import { GRATITUDE_PRACTICE } from "./programs/gratitude-practice";
import { KARMA_YOGA } from "./programs/karma-yoga";
import { FORGIVENESS_ARC } from "./programs/forgiveness-arc";
import { RELATIONSHIP_MIRROR } from "./programs/relationship-mirror";
import { ABUNDANCE_RESET } from "./programs/abundance-reset";
import { INNER_CHILD } from "./programs/inner-child";
import { BHAKTI_FLOW } from "./programs/bhakti-flow";
import { JNANA_PATH } from "./programs/jnana-path";
import { TANTRA_SENSES } from "./programs/tantra-senses";
import { ZEN_MIND } from "./programs/zen-mind";
import { GRIEF_COMPANION } from "./programs/grief-companion";
import { CREATIVE_SOURCE } from "./programs/creative-source";
import { BOUNDARIES_PRACTICE } from "./programs/boundaries-practice";
import { PRESENCE_AT_WORK } from "./programs/presence-at-work";
import { SACRED_ANGER } from "./programs/sacred-anger";
import { SACRED_SEXUALITY } from "./programs/sacred-sexuality";
import { DHARMA_DISCOVERY } from "./programs/dharma-discovery";
import { TRAUMA_AWARE_FOUNDATION } from "./programs/trauma-aware-foundation";
import { LOVING_KINDNESS_PATH } from "./programs/loving-kindness-path";
import { TAO_FLOW } from "./programs/tao-flow";
import { MORNING_BECOMING } from "./programs/morning-becoming";
import { EVENING_DISSOLVE } from "./programs/evening-dissolve";
import { PRANAYAMA_FOUNDATION } from "./programs/pranayama-foundation";
import { THREE_BRAINS_LISTENING } from "./programs/three-brains-listening";
import { DREAM_WORK } from "./programs/dream-work";
import { COUNCIL_OF_YOGIS } from "./programs/council-of-yogis";
import { ATTENTION_TRAINING } from "./programs/attention-training";
import { EQUANIMITY_BUILD } from "./programs/equanimity-build";
import { SADHANA_RHYTHM } from "./programs/sadhana-rhythm";

import { RAJA_YOGA } from "./programs/raja-yoga";
import { SELF_INQUIRY_L1 } from "./programs/self-inquiry-l1-beginner";
import { SELF_INQUIRY_L2 } from "./programs/self-inquiry-l2-layered";
import { SELF_INQUIRY_L3 } from "./programs/self-inquiry-l3-ramana";
import { SELF_INQUIRY_L4 } from "./programs/self-inquiry-l4-nisargadatta";
import { SELF_INQUIRY_L5 } from "./programs/self-inquiry-l5-direct-pointing";
import { WITNESS_L1_BREATH } from "./programs/witness-l1-breath";
import { WITNESS_L2_BODY } from "./programs/witness-l2-body";
import { WITNESS_L3_THOUGHT } from "./programs/witness-l3-thought";
import { WITNESS_L4_EMOTION } from "./programs/witness-l4-emotion";
import { WITNESS_L5_PURE } from "./programs/witness-l5-pure";
import { VIPASSANA_PATH } from "./programs/vipassana-path";
import { ZAZEN_PATH } from "./programs/zazen-path";
import { TRATAKA_PATH } from "./programs/trataka-path";
import { YOGA_NIDRA_PATH } from "./programs/yoga-nidra-path";
import { MANTRA_JAPA_PATH } from "./programs/mantra-japa-path";
import { TONGLEN_PATH } from "./programs/tonglen-path";
import { NADI_SHODHANA_MASTERY } from "./programs/nadi-shodhana-mastery";
import { BHASTRIKA_PATH } from "./programs/bhastrika-path";
import { KAPALBHATI_CYCLE } from "./programs/kapalbhati-cycle";
import { UJJAYI_DEEP } from "./programs/ujjayi-deep";
import { CHAKRA_MULADHARA } from "./programs/chakra-muladhara";
import { CHAKRA_SVADHISTHANA } from "./programs/chakra-svadhisthana";
import { CHAKRA_MANIPURA } from "./programs/chakra-manipura";
import { CHAKRA_ANAHATA } from "./programs/chakra-anahata";
import { CHAKRA_VISHUDDHA } from "./programs/chakra-vishuddha";
import { CHAKRA_AJNA } from "./programs/chakra-ajna";
import { CHAKRA_SAHASRARA } from "./programs/chakra-sahasrara";
import { CONSCIOUS_DECISION_FRAMEWORK } from "./programs/conscious-decision-framework";
import { VALUES_BASED_CHOOSING } from "./programs/values-based-choosing";
import { INNER_COMPASS } from "./programs/inner-compass";
import { YOGA_SUTRAS_INTRO } from "./programs/yoga-sutras-intro";
import { GITA_INTRO } from "./programs/gita-intro";
import { UPANISHADS_INTRO } from "./programs/upanishads-intro";
import { UPANISHAD_ISHA } from "./programs/upanishad-isha";
import { UPANISHAD_KENA } from "./programs/upanishad-kena";
import { UPANISHAD_KATHA } from "./programs/upanishad-katha";
import { UPANISHAD_MUNDAKA } from "./programs/upanishad-mundaka";
import { UPANISHAD_MANDUKYA } from "./programs/upanishad-mandukya";
import { UPANISHAD_CHANDOGYA } from "./programs/upanishad-chandogya";
import { UPANISHAD_BRIHADARANYAKA } from "./programs/upanishad-brihadaranyaka";

import { LIMB_YAMA } from "./programs/limb-yama";
import { LIMB_NIYAMA } from "./programs/limb-niyama";
import { LIMB_ASANA } from "./programs/limb-asana";
import { LIMB_PRANAYAMA } from "./programs/limb-pranayama";
import { LIMB_PRATYAHARA } from "./programs/limb-pratyahara";
import { LIMB_DHARANA } from "./programs/limb-dharana";
import { LIMB_DHYANA } from "./programs/limb-dhyana";
import { LIMB_SAMADHI } from "./programs/limb-samadhi";
import { ANGER_ALCHEMY } from "./programs/anger-alchemy";
import { DEPRESSION_COMPANION } from "./programs/depression-companion";
import { BURNOUT_RECOVERY } from "./programs/burnout-recovery";
import { CODEPENDENCY_UNTANGLE } from "./programs/codependency-untangle";
import { PEOPLE_PLEASING_CURE } from "./programs/people-pleasing-cure";
import { PERFECTIONISM_RELEASE } from "./programs/perfectionism-release";
import { PROCRASTINATION_ROOT } from "./programs/procrastination-root";
import { IMPOSTER_SYNDROME } from "./programs/imposter-syndrome";
import { SELF_WORTH_REBUILD } from "./programs/self-worth-rebuild";
import { COUPLES_SADHANA } from "./programs/couples-sadhana";
import { CONFLICT_RESOLUTION } from "./programs/conflict-resolution";
import { LISTENING_MASTERY } from "./programs/listening-mastery";
import { APOLOGY_PRACTICE } from "./programs/apology-practice";
import { ATTACHMENT_STYLES } from "./programs/attachment-styles";
import { MONEY_WOUNDS } from "./programs/money-wounds";
import { CAREER_DHARMA } from "./programs/career-dharma";
import { LEADERSHIP_PRESENCE } from "./programs/leadership-presence";
import { WEALTH_MINDSET } from "./programs/wealth-mindset";
import { PHONE_FAST } from "./programs/phone-fast";
import { SOCIAL_MEDIA_SADHANA } from "./programs/social-media-sadhana";
import { NEWS_FAST } from "./programs/news-fast";
import { COMPARISON_CURE } from "./programs/comparison-cure";
import { KUNDALINI_AWAKENING } from "./programs/kundalini-awakening";
import { INNER_SMILE } from "./programs/inner-smile";
import { FASTING_SADHANA } from "./programs/fasting-sadhana";
import { EGO_DISSOLUTION } from "./programs/ego-dissolution";

import { ADVAITA_DIRECT } from "./programs/advaita-direct";
import { NETI_NETI_PATH } from "./programs/neti-neti-path";
import { RIBHU_GITA_ESSENCE } from "./programs/ribhu-gita-essence";
import { ASHTAVAKRA_GITA_PATH } from "./programs/ashtavakra-gita-path";
import { DZOGCHEN_RIGPA } from "./programs/dzogchen-rigpa";
import { MAHAMUDRA_ESSENCE } from "./programs/mahamudra-essence";
import { SIX_BARDOS } from "./programs/six-bardos";
import { SUFI_HEART_PATH } from "./programs/sufi-heart-path";
import { RUMI_IMMERSION } from "./programs/rumi-immersion";
import { CENTERING_PRAYER } from "./programs/centering-prayer";
import { DESERT_FATHERS } from "./programs/desert-fathers";
import { INTEGRATED_LIFE } from "./programs/integrated-life";
import { PARENTING_AS_PRACTICE } from "./programs/parenting-as-practice";
import { ELDER_WISDOM } from "./programs/elder-wisdom";
import { CAREGIVER_SADHANA } from "./programs/caregiver-sadhana";
import { SOMATIC_RELEASE } from "./programs/somatic-release";
import { TRE_FOUNDATION } from "./programs/tre-foundation";
import { QI_GONG_FLOW } from "./programs/qi-gong-flow";
import { TAI_CHI_ESSENCE } from "./programs/tai-chi-essence";
import { SOUND_CURRENT } from "./programs/sound-current";
import { KIRTAN_PRACTICE } from "./programs/kirtan-practice";
import { ADDICTION_RECOVERY_SOUL } from "./programs/addiction-recovery-soul";
import { CHRONIC_PAIN_COMPANION } from "./programs/chronic-pain-companion";
import { ILLNESS_AS_TEACHER } from "./programs/illness-as-teacher";
import { MENOPAUSE_RITE } from "./programs/menopause-rite";
import { MENS_CIRCLE_PATH } from "./programs/mens-circle-path";
import { AURA_CLEANSING } from "./programs/aura-cleansing";
import { KOSHA_JOURNEY } from "./programs/kosha-journey";
import { GUNAS_MASTERY } from "./programs/gunas-mastery";
import { SILENT_RETREAT_SELF } from "./programs/silent-retreat-self";
import { PILGRIMAGE_PATH } from "./programs/pilgrimage-path";
import { DARKNESS_RETREAT } from "./programs/darkness-retreat";
import { MENTAL_MODELS_CLARITY } from "./programs/mental-models-clarity";
import { DECISION_FATIGUE_CURE } from "./programs/decision-fatigue-cure";
import { CREATIVE_BLOCK_CLEAR } from "./programs/creative-block-clear";
import { ARTIST_AS_MONK } from "./programs/artist-as-monk";
import { SERVICE_VOW } from "./programs/service-vow";
import { GLOBAL_CITIZEN } from "./programs/global-citizen";
import { LIFELONG_SADHANA_DESIGN } from "./programs/lifelong-sadhana-design";


export * from "./types";
export { ALL_ATOMS, getAtomById, getAtomsByCategory, getAtomCountByCategory } from "./atoms";
export { composeProgramSession, type ComposerUserState } from "./composer";

export const ALL_PROGRAMS_V3: SessionProgramV3[] = [
  THREE_INNER_LLMS,
  LOOP_LIBERATION,
  WITNESS_AWAKENING,
  HEART_OPENING,
  SHADOW_INTEGRATION,
  ENERGY_AWAKENING,
  STILLNESS_FOUNDATION,
  DIGITAL_DETOX,
  SACRED_SPEECH,
  DEATH_CONTEMPLATION,
  SLEEP_SANCTUARY,
  ANXIETY_RELIEF,
  FOCUS_MASTERY,
  SINGLE_POINTED_MIND,
  YOGA_SUTRAS_SAMADHI_PADA,
  YOGA_SUTRAS_SADHANA_PADA,
  YOGA_SUTRAS_VIBHUTI_PADA,
  YOGA_SUTRAS_KAIVALYA_PADA,
  GITA_KARMA_YOGA,
  GITA_BHAKTI_YOGA,
  GITA_JNANA_YOGA,
  HATHA_PRADIPIKA,
  SHATKARMA_NETI,
  SHATKARMA_DHAUTI,
  SHATKARMA_NAULI,
  SHATKARMA_BASTI,
  SHATKARMA_KAPALBHATI,
  SHATKARMA_TRATAKA,
  BANDHA_MULA,
  BANDHA_UDDIYANA,
  BANDHA_JALANDHARA,
  BANDHA_MAHA,
  MUDRA_PRANA,
  MUDRA_APANA,
  MUDRA_VAYU,
  MUDRA_AKASH,
  MUDRA_PRITHVI,
  MUDRA_SHUNYA,
  MUDRA_JNANA,
  MUDRA_CHIN,
  MUDRA_ANJALI,
  MUDRA_DHYANA,
  PRANAYAMA_SURYA_BHEDANA,
  PRANAYAMA_CHANDRA_BHEDANA,
  PRANAYAMA_BHRAMARI,
  PRANAYAMA_PLAVINI,
  PRANAYAMA_MURCHA,
  PRANAYAMA_SITALI,
  PRANAYAMA_SITKARI,
  PRANAYAMA_VILOMA,
  PRANAYAMA_PRATILOMA,
  PRANAYAMA_KEVALA_KUMBHAKA,
  ASANA_SURYA_NAMASKAR,
  ASANA_STANDING,
  ASANA_FORWARD_BEND,
  ASANA_BACK_BEND,
  ASANA_TWIST,
  ASANA_INVERSION,
  ASANA_BALANCING,
  ASANA_RESTORATIVE,
  NADA_YOGA,
  LAYA_YOGA,
  MANTRA_JAPA_DEEP,
  OM_MEDITATION,
  YANTRA_YOGA,
  BIJA_MANTRA_ARC,
  KOSHA_ANNAMAYA,
  KOSHA_PRANAMAYA,
  KOSHA_MANOMAYA,
  KOSHA_VIJNANAMAYA,
  KOSHA_ANANDAMAYA,
  PRANA_VAYU_PRANA,
  PRANA_VAYU_APANA,
  PRANA_VAYU_SAMANA,
  PRANA_VAYU_UDANA,
  PRANA_VAYU_VYANA,
  SAMADHI_SAVIKALPA,
  SAMADHI_NIRVIKALPA,
  SAMADHI_SAHAJA,
  SAMADHI_ASAMPRAJNATA,
  DARSHANA_SAMKHYA,
  DARSHANA_YOGA,
  DARSHANA_NYAYA,
  DARSHANA_VAISHESHIKA,
  DARSHANA_MIMAMSA,
  DARSHANA_VEDANTA,
  BHUTA_PRITHVI,
  BHUTA_APA,
  BHUTA_TEJAS,
  BHUTA_VAYU,
  BHUTA_AKASHA,
  GRANTHI_BRAHMA,
  GRANTHI_VISHNU,
  GRANTHI_RUDRA,
  KRIYA_TAPAS,
  KRIYA_SVADHYAYA,
  KRIYA_ISHTA_PRANADHAMA,
  GUNA_SATTVA,
  GUNA_RAJAS,
  GUNA_TAMAS,
  KLESHA_AVIDYA,
  KLESHA_ASMITA,
  KLESHA_RAGA,
  KLESHA_DVESHA,
  KLESHA_ABHINIVESHA,
  GHERANDA_SHATKARMA,
  GHERANDA_ASANA,
  GHERANDA_MUDRA,
  GHERANDA_PRATYAHARA,
  GHERANDA_PRANAYAMA,
  GHERANDA_DHYANA,
  GHERANDA_SAMADHI,
  SHIVA_SAMHITA_CH1,
  SHIVA_SAMHITA_CH2,
  SHIVA_SAMHITA_CH3,
  SHIVA_SAMHITA_CH4,
  SHIVA_SAMHITA_CH5,
  SHIVA_SUTRAS_RECOGNITION,
  SPANDA_DIVINE_VIBRATION,
  VIJNANA_BHAIRAVA_112,
  PRATYABHIJNA_RECOGNITION,
  SPANDA_KARIKA_DEEP,
  AYURVEDA_VATA,
  AYURVEDA_PITTA,
  AYURVEDA_KAPHA,
  AYURVEDA_DINACHARYA,
  AYURVEDA_RITUCHARYA,
  AYURVEDA_AGNI,
  AYURVEDA_MARMA,
  AYURVEDA_PANCHAKARMA,
  UPANISHAD_ISHA,
  UPANISHAD_KENA,
  UPANISHAD_KATHA,
  UPANISHAD_MUNDAKA,
  UPANISHAD_MANDUKYA,
  UPANISHAD_CHANDOGYA,
  UPANISHAD_BRIHADARANYAKA,
  GRATITUDE_PRACTICE,
  KARMA_YOGA,
  FORGIVENESS_ARC,
  RELATIONSHIP_MIRROR,
  ABUNDANCE_RESET,
  INNER_CHILD,
  BHAKTI_FLOW,
  JNANA_PATH,
  TANTRA_SENSES,
  ZEN_MIND,
  GRIEF_COMPANION,
  CREATIVE_SOURCE,
  BOUNDARIES_PRACTICE,
  PRESENCE_AT_WORK,
  SACRED_ANGER,
  SACRED_SEXUALITY,
  DHARMA_DISCOVERY,
  TRAUMA_AWARE_FOUNDATION,
  LOVING_KINDNESS_PATH,
  TAO_FLOW,
  MORNING_BECOMING,
  EVENING_DISSOLVE,
  PRANAYAMA_FOUNDATION,
  THREE_BRAINS_LISTENING,
  DREAM_WORK,
  COUNCIL_OF_YOGIS,
  ATTENTION_TRAINING,
  EQUANIMITY_BUILD,
  SADHANA_RHYTHM,
  RAJA_YOGA,
  SELF_INQUIRY_L1,
  SELF_INQUIRY_L2,
  SELF_INQUIRY_L3,
  SELF_INQUIRY_L4,
  SELF_INQUIRY_L5,
  WITNESS_L1_BREATH,
  WITNESS_L2_BODY,
  WITNESS_L3_THOUGHT,
  WITNESS_L4_EMOTION,
  WITNESS_L5_PURE,
  VIPASSANA_PATH,
  ZAZEN_PATH,
  TRATAKA_PATH,
  YOGA_NIDRA_PATH,
  MANTRA_JAPA_PATH,
  TONGLEN_PATH,
  NADI_SHODHANA_MASTERY,
  BHASTRIKA_PATH,
  KAPALBHATI_CYCLE,
  UJJAYI_DEEP,
  CHAKRA_MULADHARA,
  CHAKRA_SVADHISTHANA,
  CHAKRA_MANIPURA,
  CHAKRA_ANAHATA,
  CHAKRA_VISHUDDHA,
  CHAKRA_AJNA,
  CHAKRA_SAHASRARA,
  CONSCIOUS_DECISION_FRAMEWORK,
  VALUES_BASED_CHOOSING,
  INNER_COMPASS,
  YOGA_SUTRAS_INTRO,
  GITA_INTRO,
  UPANISHADS_INTRO,
  LIMB_YAMA,
  LIMB_NIYAMA,
  LIMB_ASANA,
  LIMB_PRANAYAMA,
  LIMB_PRATYAHARA,
  LIMB_DHARANA,
  LIMB_DHYANA,
  LIMB_SAMADHI,
  ANGER_ALCHEMY,
  DEPRESSION_COMPANION,
  BURNOUT_RECOVERY,
  CODEPENDENCY_UNTANGLE,
  PEOPLE_PLEASING_CURE,
  PERFECTIONISM_RELEASE,
  PROCRASTINATION_ROOT,
  IMPOSTER_SYNDROME,
  SELF_WORTH_REBUILD,
  COUPLES_SADHANA,
  CONFLICT_RESOLUTION,
  LISTENING_MASTERY,
  APOLOGY_PRACTICE,
  ATTACHMENT_STYLES,
  MONEY_WOUNDS,
  CAREER_DHARMA,
  LEADERSHIP_PRESENCE,
  WEALTH_MINDSET,
  PHONE_FAST,
  SOCIAL_MEDIA_SADHANA,
  NEWS_FAST,
  COMPARISON_CURE,
  KUNDALINI_AWAKENING,
  INNER_SMILE,
  FASTING_SADHANA,
  EGO_DISSOLUTION,
  ADVAITA_DIRECT,
  NETI_NETI_PATH,
  RIBHU_GITA_ESSENCE,
  ASHTAVAKRA_GITA_PATH,
  DZOGCHEN_RIGPA,
  MAHAMUDRA_ESSENCE,
  SIX_BARDOS,
  SUFI_HEART_PATH,
  RUMI_IMMERSION,
  CENTERING_PRAYER,
  DESERT_FATHERS,
  INTEGRATED_LIFE,
  PARENTING_AS_PRACTICE,
  ELDER_WISDOM,
  CAREGIVER_SADHANA,
  SOMATIC_RELEASE,
  TRE_FOUNDATION,
  QI_GONG_FLOW,
  TAI_CHI_ESSENCE,
  SOUND_CURRENT,
  KIRTAN_PRACTICE,
  ADDICTION_RECOVERY_SOUL,
  CHRONIC_PAIN_COMPANION,
  ILLNESS_AS_TEACHER,
  MENOPAUSE_RITE,
  MENS_CIRCLE_PATH,
  AURA_CLEANSING,
  KOSHA_JOURNEY,
  GUNAS_MASTERY,
  SILENT_RETREAT_SELF,
  PILGRIMAGE_PATH,
  DARKNESS_RETREAT,
  MENTAL_MODELS_CLARITY,
  DECISION_FATIGUE_CURE,
  CREATIVE_BLOCK_CLEAR,
  ARTIST_AS_MONK,
  SERVICE_VOW,
  GLOBAL_CITIZEN,
  LIFELONG_SADHANA_DESIGN,
];


export function getProgramV3ById(id: string): SessionProgramV3 | undefined {
  return ALL_PROGRAMS_V3.find((p) => p.id === id);
}
