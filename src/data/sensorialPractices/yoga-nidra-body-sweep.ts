import type { SensorialManifest } from "./types";
import nidraImg from "@/assets/masters/nidra.jpg";
import arrive from "@/assets/sensorial/buddha-bodyscan/01-rest.jpg";
import sweep from "@/assets/sensorial/buddha-bodyscan/02-crown.jpg";
import torso from "@/assets/sensorial/buddha-bodyscan/03-torso.jpg";
import feet from "@/assets/sensorial/buddha-bodyscan/04-feet.jpg";
import whole from "@/assets/sensorial/buddha-bodyscan/05-whole.jpg";

/**
 * Yoga Nidra — 61-Point Body Sweep (Satyananda lineage, compressed).
 * Lying down. The single most relaxing practice in the entire library —
 * given last for evening wind-down. Voice only, no sensors. ~22 min.
 */
export const yogaNidraBodySweep: SensorialManifest = {
  key: "yoga-nidra:body-sweep",
  guruId: "yoga-nidra",
  practiceMatch: "nidra",
  title: "Yoga Nidra — Body Sweep",
  voiceId: "onwK4e9ZLuTAKqWW03F9",
  backdropImage: nidraImg,
  sensors: { mic: false, camera: false },
  totalMinutes: 22,
  steps: [
    { id: "arrive", modality: "narrate",
      narration: "Lie flat on your back, arms slightly away from the body, palms up. A pillow under the head if comfortable, a blanket if it's cool. Close the eyes. Do not try to sleep, do not try to stay awake. Yoga nidra is the doorway between the two.",
      caption: "Lie flat. Eyes closed. Doorway between.", imageUrl: arrive, holdMs: 30000 },
    { id: "sankalpa", modality: "narrate",
      narration: "First, plant a sankalpa — a short, positive resolution in the present tense. Something like, I am whole. I am at peace. I am exactly where I am meant to be. Repeat your chosen sentence three times, silently, as if writing it on the screen of the mind.",
      caption: "Plant your sankalpa. Three times.", imageUrl: arrive, holdMs: 40000 },
    { id: "right-side", modality: "silence",
      narration: "Bring awareness to the right side of the body. Right thumb. Right index finger. Middle. Ring. Little. Palm of the right hand. Back of the hand. Wrist. Forearm. Elbow. Upper arm. Right shoulder. Right armpit. Right side of the chest. Right side of the waist. Right hip. Right thigh. Right knee. Right calf. Right ankle. Right heel. Right sole. Right big toe. Each toe in turn. Whole right leg. Whole right side of the body.",
      caption: "Right side. Point by point.", imageUrl: sweep, holdMs: 180000 },
    { id: "left-side", modality: "silence",
      narration: "Now the left side. Left thumb. Index. Middle. Ring. Little. Palm. Back of the hand. Wrist. Forearm. Elbow. Upper arm. Left shoulder. Armpit. Left side of the chest. Left waist. Hip. Thigh. Knee. Calf. Ankle. Heel. Sole. Toes — each in turn. Whole left leg. Whole left side of the body.",
      caption: "Left side. Point by point.", imageUrl: sweep, holdMs: 180000 },
    { id: "back", modality: "silence",
      narration: "Awareness moves to the back of the body. Heels touching the floor. Backs of the calves. Backs of the knees. Backs of the thighs. Buttocks. Lower back. Middle back. Shoulder blades. Back of the neck. Back of the head. The whole back, lying heavy on the floor.",
      caption: "Whole back, heavy on the floor.", imageUrl: torso, holdMs: 120000 },
    { id: "front", modality: "silence",
      narration: "Now the front. Toes. Tops of the feet. Shins. Front of the thighs. Lower belly. Upper belly. Chest. Throat. Chin. Lips. Nose. Right cheek. Left cheek. Right eye. Left eye. Right eyebrow. Left eyebrow. Forehead. Crown of the head. Whole front of the body.",
      caption: "Whole front of the body.", imageUrl: feet, holdMs: 120000 },
    { id: "whole-body", modality: "silence",
      narration: "Now feel the whole body at once. From the crown to the soles. From fingertip to fingertip. The body is one single field of awareness. Heavy, warm, completely still. Floating on the breath like a leaf on calm water.",
      caption: "Whole body, one field of awareness.", imageUrl: whole, holdMs: 180000 },
    { id: "sankalpa-again", modality: "narrate",
      narration: "Now, in this very receptive state, plant the sankalpa again. The same sentence as the beginning, repeated three times, silently. The mind is open. The seed will be received.",
      caption: "Sankalpa again. Three times.", imageUrl: whole, holdMs: 40000 },
    { id: "return", modality: "narrate",
      narration: "Slowly bring back small movements. Wiggle the fingers. The toes. Take a deeper breath. Roll gently to the right side and rest there a moment before sitting up. Use the hands to push yourself up. Open the eyes only at the very end.",
      caption: "Return slowly. Roll right. Sit.", imageUrl: arrive, holdMs: 35000 },
  ],
  closing: "Twenty minutes of yoga nidra rests the body the way two hours of sleep would. But more importantly, the sankalpa you planted has now been written below the surface of the conscious mind. Repeat the same sankalpa for forty days, and you will watch your life rearrange itself around it.",
};
