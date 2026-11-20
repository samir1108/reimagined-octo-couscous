import type { SensorialManifest } from "./types";
import { ramanaWhoAmI } from "./ramana-who-am-i";
import { buddhaAnapanasati } from "./buddha-anapanasati";
import { yoganandaHongSau } from "./yogananda-hong-sau";
import { krishnamurtiChoicelessAwareness } from "./krishnamurti-choiceless-awareness";
import { oshoDynamicMeditation } from "./osho-dynamic-meditation";
import { oshoGibberishSilence } from "./osho-gibberish-silence";
import { sadhguruIshaKriya } from "./sadhguru-isha-kriya";
import { sadhguruTrataka } from "./sadhguru-trataka";
import { buddhaBodyScan } from "./buddha-body-scan";
import { vivekanandaPratyahara } from "./vivekananda-pratyahara";
import { babajiKriyaRounds } from "./babaji-kriya-rounds";
import { rumiSemaTurn } from "./rumi-sema-turn";
import { franklMeaningLogbook } from "./frankl-meaning-logbook";
import { patanjaliYamasNiyamas } from "./patanjali-yamas-niyamas";
import { patanjaliPratyahara } from "./patanjali-pratyahara";
import { laoTzuWuWei } from "./lao-tzu-wu-wei";
import { dogenShikantaza } from "./dogen-shikantaza";
import { tilopaMahamudraRest } from "./tilopa-mahamudra-rest";
import { padmasambhavaTonglen } from "./padmasambhava-tonglen";
import { thichNhatHanhWalking } from "./thich-nhat-hanh-walking";
import { shankaraNetiNeti } from "./shankara-neti-neti";
import { krishnaKarmaYogaIntent } from "./krishna-karma-yoga-intent";
import { witnessSakshiEye } from "./witness-sakshi-eye";
import { heartCoherence } from "./heart-coherence";
import { yogaNidraBodySweep } from "./yoga-nidra-body-sweep";
import { nagarjunaEmptinessGazing } from "./nagarjuna-emptiness-gazing";
import { milarepaChodFeeding } from "./milarepa-chod-feeding";
import { meeraBhaktiSurrender } from "./meera-bhakti-surrender";
import { kabirSuratShabd } from "./kabir-surat-shabd";
import { mahaviraAnekantavada } from "./mahavira-anekantavada";
import { bodhidharmaWallGazing } from "./bodhidharma-wall-gazing";
import { marcusAureliusMorningExamen } from "./marcus-aurelius-morning-examen";
import { nisargadattaIAmThat } from "./nisargadatta-i-am-that";
import { nanakNaamSimran } from "./nanak-naam-simran";
import { aurobindoIntegralYoga } from "./aurobindo-integral-yoga";
import { hakuinKoanPractice } from "./hakuin-koan-practice";
import { socratesMidwifery } from "./socrates-midwifery";
import { plotinusHenosis } from "./plotinus-henosis";
import { sivanandaSynthesisFourPaths } from "./sivananda-four-paths-synthesis";
import { advaitaNetiNetiRecognition } from "./advaita-neti-neti-recognition";
import { akkamahadeviVachanaSangama } from "./akkamahadevi-vachana-sangama";
import { ramakrishnaKaliEmbracing } from "./ramakrishna-kali-embracing";
import { anandamayiMaSpontaneousYoga } from "./anandamayi-ma-spontaneous-yoga";
import { chaitanyaKirtanPath } from "./chaitanya-kirtan-path";
import { jnaneshwarPasayadan } from "./jnaneshwar-pasayadan";
import { tukaramAbhangSinging } from "./tukaram-abhang-singing";
import { lahiriKriyaHouseholder } from "./lahiri-kriya-householder";
import { abhinavaguptaTantricNonDual } from "./abhinavagupta-tantric-non-dual";
import { saradaDeviMotherWay } from "./sarada-devi-mother-way";

/**
 * Registry of fully-authored Sensorial manifests.
 * Add new practices here — the engine auto-picks them up.
 */
export const MANIFESTS: SensorialManifest[] = [
  ramanaWhoAmI,
  buddhaAnapanasati,
  yoganandaHongSau,
  krishnamurtiChoicelessAwareness,
  oshoDynamicMeditation,
  oshoGibberishSilence,
  sadhguruIshaKriya,
  sadhguruTrataka,
  buddhaBodyScan,
  vivekanandaPratyahara,
  babajiKriyaRounds,
  rumiSemaTurn,
  franklMeaningLogbook,
  patanjaliYamasNiyamas,
  patanjaliPratyahara,
  laoTzuWuWei,
  dogenShikantaza,
  tilopaMahamudraRest,
  padmasambhavaTonglen,
  thichNhatHanhWalking,
  shankaraNetiNeti,
  krishnaKarmaYogaIntent,
  witnessSakshiEye,
  heartCoherence,
  yogaNidraBodySweep,
  nagarjunaEmptinessGazing,
  milarepaChodFeeding,
  meeraBhaktiSurrender,
  kabirSuratShabd,
  mahaviraAnekantavada,
  bodhidharmaWallGazing,
  marcusAureliusMorningExamen,
  nisargadattaIAmThat,
  nanakNaamSimran,
  aurobindoIntegralYoga,
  hakuinKoanPractice,
  socratesMidwifery,
  plotinusHenosis,
  sivanandaSynthesisFourPaths,
  advaitaNetiNetiRecognition,
  akkamahadeviVachanaSangama,
  ramakrishnaKaliEmbracing,
  anandamayiMaSpontaneousYoga,
  chaitanyaKirtanPath,
  jnaneshwarPasayadan,
  tukaramAbhangSinging,
  lahiriKriyaHouseholder,
  abhinavaguptaTantricNonDual,
  saradaDeviMotherWay,
];

/** Look up a manifest by guruId + practice name (case-insensitive substring). */
export function findSensorialManifest(
  guruId: string | undefined,
  practiceName: string | undefined
) {
  if (!guruId || !practiceName) return null;
  const g = guruId.toLowerCase();
  const p = practiceName.toLowerCase();
  return (
    MANIFESTS.find(
      (m) => m.guruId.toLowerCase() === g && p.includes(m.practiceMatch.toLowerCase())
    ) ?? null
  );
}

/**
 * Registered sensorial practice keys. UI/admin tools can use this
 * to show "coming soon" badges on practices that don't have a manifest yet.
 */
export const PLANNED_SENSORIAL_KEYS = [
  "ramana:who-am-i",
  "buddha:anapanasati",
  "buddha:body-scan",
  "krishnamurti:choiceless-awareness",
  "osho:dynamic-meditation",
  "osho:gibberish-silence",
  "sadhguru:isha-kriya",
  "sadhguru:trataka",
  "vivekananda:pratyahara",
  "babaji:kriya-rounds",
  "rumi:sema-turn",
  "frankl:meaning-logbook",
  "patanjali:yamas-niyamas",
  "patanjali:pratyahara",
  "lao-tzu:wu-wei",
  "dogen:shikantaza",
  "tilopa:mahamudra-rest",
  "padmasambhava:tonglen",
  "thich-nhat-hanh:walking",
  "shankara:neti-neti",
  "krishna:karma-yoga-intent",
  "yogananda:hong-sau",
  "witness:sakshi-eye",
  "heart:coherence-5-5",
  "yoga-nidra:body-sweep",
  "nagarjuna:emptiness-gazing",
  "milarepa:chod-feeding",
  "meera:bhakti-surrender",
  "kabir:surat-shabd",
  "mahavira:anekantavada",
  "bodhidharma:wall-gazing",
  "marcus:aurelius-morning-examen",
  "nisargadatta:i-am-that",
  "nanak:naam-simran",
  "aurobindo:integral-yoga",
  "hakuin:koan-practice",
  "socrates:midwifery",
  "plotinus:henosis",
  "sivananda:four-paths-synthesis",
  "advaita:neti-neti-recognition",
  "akkamahadevi:vachana-sangama",
  "ramakrishna:kali-embracing",
  "anandamayi-ma:spontaneous-yoga",
  "chaitanya:kirtan-path",
  "jnaneshwar:pasayadan",
  "tukaram:abhang-singing",
  "lahiri:kriya-householder",
  "abhinavagupta:tantric-non-dual",
  "sarada-devi:mother-way",
] as const;

export type { SensorialManifest, SensorialStep, StepModality } from "./types";
