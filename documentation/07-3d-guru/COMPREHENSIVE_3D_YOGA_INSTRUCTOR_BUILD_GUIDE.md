# Comprehensive 3D Yoga Instructor AI-Developable Build Guide

## Document Information

- **Project Name**: ConsciousOS 3D Yoga Instructor
- **Version**: 1.0.0
- **Technology Stack**: Unreal Engine 5, MetaHuman, React, TypeScript, Three.js
- **Target**: Photorealistic 3D yoga instructor integrated into ConsciousOS web application
- **Yoga Poses Database**: 100+ poses with proper alignment, breathing cues, and variations

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Technology Architecture](#2-technology-architecture)
3. [Unreal Engine 5 Project Setup](#3-unreal-engine-5-project-setup)
4. [MetaHuman Character Creation](#4-metahuman-character-creation)
5. [Yoga Pose Database System](#5-yoga-pose-database-system)
6. [Animation System Design](#6-animation-system-design)
7. [Voice AI Instruction Engine](#7-voice-ai-instruction-engine)
8. [Real-Time Pose Detection System](#8-real-time-pose-detection-system)
9. [React Frontend Integration](#9-react-frontend-integration)
10. [ConsciousOS App Integration](#10-consciousos-app-integration)
11. [Deployment Pipeline](#11-deployment-pipeline)
12. [Codebase Structure](#12-codebase-structure)
13. [Implementation Roadmap](#13-implementation-roadmap)
14. [Testing Strategy](#14-testing-strategy)
15. [Maintenance and Updates](#15-maintenance-and-updates)

---

## 1. Executive Summary

This comprehensive guide provides complete technical specifications for building a photorealistic 3D yoga instructor that integrates seamlessly into the ConsciousOS web application. The system combines cutting-edge game engine technology (Unreal Engine 5), AI-powered character animation (MetaHuman), real-time pose detection, and voice instruction to deliver an immersive yoga learning experience.

### 1.1 Project Vision

The ConsciousOS 3D Yoga Instructor represents a paradigm shift in digital yoga instruction by providing:

- **Photorealistic 3D Instructor**: A life-like yoga teacher powered by MetaHuman technology
- **100+ Yoga Poses**: Comprehensive library covering all major yoga styles
- **Real-Time Feedback**: AI-powered pose correction based on user camera input
- **Personalized Instruction**: Adaptive learning based on user skill level and progress
- **Voice Guidance**: Real-time verbal instruction and encouragement
- **Seamless Integration**: Native integration into the existing ConsciousOS ecosystem

### 1.2 Core Objectives

1. **Accessibility**: Make high-quality yoga instruction available to all ConsciousOS users
2. **Engagement**: Create an immersive experience that rivals in-person instruction
3. **Effectiveness**: Provide accurate pose corrections that accelerate learning
4. **Scalability**: Deploy across web, mobile, and VR platforms
5. **Integration**: Leverage existing ConsciousOS user data for personalization

---

## 2. Technology Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONSCIOUSOS APPLICATION LAYER                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    FRONTEND APPLICATION                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │   │
│  │  │ React UI    │  │ 3D Canvas   │  │ State Management (Zustand)  │  │   │
│  │  │ Components  │  │ (Three.js)  │  │ + Context API               │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────────┘  │   │
│  │           │                │                     │                  │   │
│  │           └────────────────┼─────────────────────┘                  │   │
│  │                        │                                              │   │
│  └────────────────────────┼──────────────────────────────────────────────┘   │
│                           │                                                   │
│  ┌────────────────────────┼──────────────────────────────────────────────┐   │
│  │                        ▼                                                 │   │
│  │              ┌─────────────────────┐                                     │   │
│  │              │ API GATEWAY         │                                     │   │
│  │              │ (Express/FastAPI)   │                                     │   │
│  │              └─────────────────────┘                                     │   │
│  │                        │                                                 │   │
│  │  ┌─────────────────────┼─────────────────────┐                           │   │
│  │  │                     │                     │                           │   │
│  │  ▼                     ▼                     ▼                           │   │
│  │ ┌────────────┐  ┌────────────┐  ┌────────────────────────┐               │   │
│  │ │Yoga API    │  │User API    │  │Analytics API           │               │   │
│  │ │(Python)    │  │(Node.js)   │  │(Python)                 │               │   │
│  │ └────────────┘  └────────────┘  └────────────────────────┘               │   │
│  │                                                                              │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                          │
│  ┌────────────────────────────────────┼────────────────────────────────────┐   │
│  │                                    ▼                                     │   │
│  │                    ┌────────────────────────────────────┐                  │   │
│  │                    │ UNREAL ENGINE 5 RUNTIME (WASM)    │                  │   │
│  │                    │ ┌────────────────────────────┐    │                  │   │
│  │                    │ │ MetaHuman 3D Character     │    │                  │   │
│  │                    │ │ + Animation System         │    │                  │   │
│  │                    │ │ + Pose Library (100+ poses)│    │                  │   │
│  │                    │ │ + Voice Synthesis          │    │                  │   │
│  │                    │ └────────────────────────────┘    │                  │   │
│  │                    └────────────────────────────────────┘                  │   │
│  │                                                                              │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                        │                                          │
│  ┌────────────────────────────────────┼────────────────────────────────────┐   │
│  │                                    ▼                                     │   │
│  │                    ┌────────────────────────────────────┐                  │   │
│  │                    │ EXTERNAL SERVICES                  │                  │   │
│  │                    │ ┌────────────┐ ┌────────────┐      │                  │   │
│  │                    │ │OpenAI API  │ │ AWS Polly  │      │                  │   │
│  │                    │ │(Whisper)   │ │(TTS)       │      │                  │   │
│  │                    │ └────────────┘ └────────────┘      │                  │   │
│  │                    └────────────────────────────────────┘                  │   │
│  │                                                                              │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack Breakdown

#### 2.2.1 3D Engine and Character System

**Primary Technology: Unreal Engine 5.4+**

Unreal Engine 5 provides the foundation for our photorealistic 3D yoga instructor. The following features are essential:

- **Nanite**: Virtualized geometry system for rendering detailed character models
- **Lumen**: Real-time global illumination for realistic lighting
- **MetaHuman Framework**: Photorealistic human character creation
- **Chaos Physics**: Realistic cloth and hair simulation
- **Audio Engine**: Spatial audio for immersive voice instructions

**Alternative: Three.js + Ready Player Me**

For web-only deployment without Unreal Engine:

```javascript
// Three.js Integration Example
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import { ReadyPlayerMe } from '@readyplayerme/three';

const avatarLoader = new ReadyPlayerMe.GLTFLoader();
avatarLoader.load(
    'https://api.readyplayer.me/v1/avatars/{avatar-id}.glb',
    (gltf) => {
        const avatar = gltf.scene;
        scene.add(avatar);
    }
);
```

#### 2.2.2 Character System

**MetaHuman Creator Integration**

MetaHuman provides cinema-quality characters with:

- Realistic facial expressions and lip-sync
- High-fidelity skin, hair, and eye shaders
- Full body animation support
- Customizable appearance parameters

**Character Parameters:**

```json
{
    "metahuman": {
        "identity": {
            "gender": "female",
            "age_range": "30-40",
            "ethnicity": "mixed"
        },
        "appearance": {
            "face_shape": 0.7,
            "skin_tone": "#F5D0C5",
            "hair_style": "ponytail",
            "hair_color": "#3D2314",
            "eye_color": "#4A7C59",
            "outfit": "yoga_instructor_casual"
        },
        "personality": {
            "voice": "warm_instructive",
            "demeanor": "encouraging",
            "energy_level": "moderate"
        }
    }
}
```

#### 2.2.3 Animation System

**Primary: Mixamo + Custom Motion Capture**

For 100+ yoga poses, we utilize:

1. **Mixamo Auto-Rigging**: Rapid pose animation
2. **Custom Motion Capture**: Professional yoga instructor capture
3. **AI Pose Generation**: Plask.ai or Rokoko for additional poses

**Animation Database Structure:**

```typescript
interface YogaPose {
    id: string;
    name: {
        sanskrit: string;
        english: string;
        pronunciation: string;
    };
    category: 'standing' | 'seated' | 'supine' | 'prone' | 'inversion';
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    targets: string[];
    benefits: string[];
    contraindications: string[];
    modifications: {
        level: string;
        description: string;
        variation: string;
    }[];
    breathing_pattern: {
        inhale: string;
        hold: string;
        exhale: string;
    };
    alignment_cues: {
        body_part: string;
        instruction: string;
        priority: 'high' | 'medium' | 'low';
    }[];
    animation_data: {
        loop: boolean;
        duration: number;
        blend_time: number;
        fps: number;
        keyframes: number[];
    };
    voice_instructions: {
        phase: string;
        script: string;
        timing: number;
    }[];
}
```

#### 2.2.4 Voice AI System

**Primary: OpenAI Whisper + TTS**

Real-time voice instruction requires:

1. **Speech Recognition**: OpenAI Whisper for user voice commands
2. **Text-to-Speech**: AWS Polly or ElevenLabs for instructor voice
3. **Voice Processing**: Real-time pitch and emotion adjustment

**Voice Configuration:**

```json
{
    "voice_engine": {
        "provider": "aws_polly",
        "voice_id": "amy",
        "engine": "neural",
        "parameters": {
            "pitch": "+5%",
            "speed": "95%",
            "volume": "100%"
        },
        "style": {
            "encouragement": "warm",
            "instruction": "clear",
            "correction": "gentle"
        }
    },
    "whisper": {
        "model": "whisper-1",
        "language": "en",
        "temperature": 0.2
    }
}
```

#### 2.2.5 Pose Detection System

**Primary: TensorFlow.js + MoveNet**

Real-time user pose detection:

```javascript
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';

const detectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    enableSmoothing: true,
    minPoseScore: 0.25
};

const detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    detectorConfig
);

// Keypoint mapping for yoga poses
const YOGA_KEYPOINTS = {
    NOSE: 0,
    LEFT_EYE: 1,
    RIGHT_EYE: 2,
    LEFT_EAR: 3,
    RIGHT_EAR: 4,
    LEFT_SHOULDER: 5,
    RIGHT_SHOULDER: 6,
    LEFT_ELBOW: 7,
    RIGHT_ELBOW: 8,
    LEFT_WRIST: 9,
    RIGHT_WRIST: 10,
    LEFT_HIP: 11,
    RIGHT_HIP: 12,
    LEFT_KNEE: 13,
    RIGHT_KNEE: 14,
    LEFT_ANKLE: 15,
    RIGHT_ANKLE: 16
};
```

#### 2.2.6 Frontend Framework

**React 18 + TypeScript + Three.js**

```tsx
// Core Application Structure
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { GLTFLoader } from '@react-three/drei';
import * as THREE from 'three';

interface YogaSessionProps {
    poseId: string;
    userId: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    onProgress: (progress: SessionProgress) => void;
}

export const YogaSession: React.FC<YogaSessionProps> = ({
    poseId,
    userId,
    difficulty,
    onProgress
}) => {
    const [isDetecting, setIsDetecting] = useState(false);
    const [currentPose, setCurrentPose] = useState<YogaPose | null>(null);
    const avatarRef = useRef<THREE.Group>(null);
    const { camera, scene } = useThree();

    useEffect(() => {
        loadYogaPose(poseId).then(pose => {
            setCurrentPose(pose);
            startPoseDetection(pose);
        });
    }, [poseId]);

    return (
        <div className="yoga-session-container">
            <div className="3d-viewport">
                <Canvas shadows camera={{ position: [0, 1.5, 4], fov: 50 }}>
                    <Suspense fallback={<LoadingSpinner />}>
                        <YogaInstructorAvatar
                            ref={avatarRef}
                            pose={currentPose}
                        />
                        <EnvironmentLighting />
                    </Suspense>
                </Canvas>
            </div>
            <div className="pose-instruction-panel">
                <PoseInstructions pose={currentPose} />
                <FeedbackOverlay />
            </div>
        </div>
    );
};
```

---

## 3. Unreal Engine 5 Project Setup

### 3.1 Project Initialization

#### 3.1.1 Engine Installation

**Required Software:**

1. Unreal Engine 5.4.0 or newer
2. Visual Studio 2022 (Community Edition sufficient)
3. MetaHuman Plugin (v1.3+)
4. Python 3.9+ for tooling

**Installation Steps:**

```bash
# Install Epic Games Launcher
# Download Unreal Engine 5.4 from Epic Games Store

# Install MetaHuman Plugin
# Open Epic Games Launcher > MetaHuman > Download Plugin

# Install Visual Studio 2022
# Select: Desktop development with C++
#        Game development with C++
#        Python development

# Clone the project repository
git clone https://github.com/consciousos/3d-yoga-instructor.git
cd 3d-yoga-instructor
```

#### 3.1.2 Project Configuration

**Project Settings (yoga-instructor.uproject):**

```json
{
    "FileVersion": 1,
    "EngineAssociation": "5.4",
    "Category": "",
    "Description": "Photorealistic 3D Yoga Instructor for ConsciousOS",
    "Modules": [
        {
            "Name": "YogaInstructor",
            "Type": "Runtime",
            "LoadingPhase": "Default",
            "AdditionalDependencies": [
                "MetaHuman",
                "AnimationCore",
                "ClothingSystemRuntime"
            ]
        },
        {
            "Name": "YogaInstructorEditor",
            "Type": "Editor",
            "LoadingPhase": "PostDefault"
        }
    ],
    "Plugins": [
        {
            "Name": "MetaHuman",
            "Enabled": true
        },
        {
            "Name": "ChaosClothing",
            "Enabled": true
        },
        {
            "Name": "LiveLink",
            "Enabled": true
        },
        {
            "Name": "OpenXR",
            "Enabled": true
        }
    ]
}
```

**DefaultEngine.ini Configuration:**

```ini
[/Script/EngineSettings.GameEngine]
+IniKeyBlacklist=DevData
+IniKeyBlacklist=Keys

[/Script/WindowsTargetPlatform.WindowsTargetSettings]
DefaultGraphicsRHI=DefaultGraphicsRHI_DX12
+D3D12TargetedShaderFormats=PCD3D_SM5
+D3D12TargetedShaderFormats=PCD3D_SM6

[/Script/Engine.RendererSettings]
r.Nanite.Enabled=True
r.Lumen.Enabled=True
r.Shadow.Virtual.Enabled=True
r.GenerateMeshDistanceFields=True
r.DistanceFields.AutoPerPixelQuality=True

[/Script/EngineSettings.SerializableGraphicsQuality]
Quality=Ultra

[/Script/LuminRuntimeSettings]
IconModelFolderPath=Model
IconPortalFolderPath=Portal
```

#### 3.1.3 Project Structure

```
YogaInstructor/
├── Content/
│   ├── _Core/
│   │   ├── Blueprints/
│   │   │   ├── BP_YogaInstructorCharacter.uasset
│   │   │   ├── BP_YogaSessionManager.uasset
│   │   │   └── BP_PoseDatabase.uasset
│   │   ├── Materials/
│   │   │   ├── M_YogaInstructor.uasset
│   │   │   ├── M_Clothing.uasset
│   │   │   └── M_Skin.uasset
│   │   └── Widgets/
│   │       ├── WBP_YogaHUD.uasset
│   │       └── WBP_PoseSelector.uasset
│   │
│   ├── MetaHuman/
│   │   ├── Characters/
│   │   │   ├── MH_YogaInstructor.uasset
│   │   │   ├── Faces/
│   │   │   └── Hair/
│   │   ├── Animations/
│   │   │   ├── Facial/
│   │   │   └── Body/
│   │   └── Audio/
│   │       ├── VO_Directives/
│   │       └── Breathing_Guides/
│   │
│   ├── YogaPoses/
│   │   ├── Standing/
│   │   │   ├── Tadasana.uasset
│   │   │   ├── Virabhadrasana_I.uasset
│   │   │   ├── Virabhadrasana_II.uasset
│   │   │   └── Trikonasana.uasset
│   │   ├── Seated/
│   │   │   ├── Sukhasana.uasset
│   │   │   ├── Padmasana.uasset
│   │   │   └── Virasana.uasset
│   │   ├── Supine/
│   │   │   ├── Savasana.uasset
│   │   │   ├── SetuBandhasana.uasset
│   │   │   └── SuptaBaddhaKonasana.uasset
│   │   ├── Prone/
│   │   │   ├── Bhujangasana.uasset
│   │   │   ├── Dhanurasana.uasset
│   │   │   └── Balasana.uasset
│   │   └── Inversions/
│   │       ├── Sarvangasana.uasset
│   │       ├── Sirsasana.uasset
│   │       └── Halasana.uasset
│   │
│   ├── UI/
│   │   ├── Blueprints/
│   │   ├── Materials/
│   │   └── Textures/
│   │
│   └── Maps/
│       ├── ML_YogaStudio.umap
│       ├── ML_YogaOutdoor.umap
│       └── ML_YogaMeditation.umap
│
├── Source/
│   ├── YogaInstructor/
│   │   ├── Private/
│   │   │   ├── YogaInstructorCharacter.cpp
│   │   │   ├── PoseAnimationSystem.cpp
│   │   │   ├── VoiceInstructionSystem.cpp
│   │   │   └── RealTimeFeedbackSystem.cpp
│   │   ├── Public/
│   │   │   ├── YogaInstructorCharacter.h
│   │   │   ├── PoseAnimationSystem.h
│   │   │   ├── VoiceInstructionSystem.h
│   │   │   └── RealTimeFeedbackSystem.h
│   │   └── YogaInstructor.Build.cs
│   │
│   └── YogaInstructorEditor/
│       ├── Private/
│       └── Public/
│
├── Tools/
│   ├── pose_importer.py
│   ├── animation_baker.py
│   ├── voice_processor.py
│   └── texture_generator.py
│
├── Config/
│   ├── DefaultEngine.ini
│   ├── DefaultGame.ini
│   └── DefaultInput.ini
│
├── YogaInstructor.uproject
└── README.md
```

### 3.2 Essential Editor Setup

#### 3.2.1 Project Settings Configuration

**Project Settings > Engine > Input:**

```ini
[/Script/EngineSettings.InputSettings]
+ActionMappings=(Name="Jump", bShift=False, bCtrl=False, bAlt=False, bCmd=False, Key=SpaceBar)
+ActionMappings=(Name="TogglePoseMenu", bShift=False, bCtrl=False, bAlt=False, bCmd=False, Key=P)
+ActionMappings=(Name="ToggleVoice", bShift=False, bCtrl=False, bAlt=False, bCmd=False, Key=V)
+AxisMappings=(Name="MoveForward", Scale=1.0, Key=W)
+AxisMappings=(Name="MoveForward", Scale=-1.0, Key=S)
+AxisMappings=(Name="MoveRight", Scale=1.0, Key=D)
+AxisMappings=(Name="MoveRight", Scale=-1.0, Key=A)
```

**Project Settings > Rendering:**

```ini
[/Script/Engine.RendererSettings]
r.Mobile.HZBOcclusion=False
r.SkinCache.CompileShaders=True
r.DisableVertexFog=False
r.StencilForLODDither=False
r.EarlyZPassOnlyMaterialMasking=False
r.Shadow.CSM.MaxMobileCascades=2
r.MobileMSAA=4
r.AllowStaticLighting=True
r.DefaultFeature.Bloom=True
r.DefaultFeature.AmbientOcclusion=True
r.DefaultFeature.MotionBlur=False
```

#### 3.2.2 MetaHuman Plugin Setup

**Enable MetaHuman in Editor:**

1. Open Unreal Engine Editor
2. Navigate to Edit > Plugins
3. Search for "MetaHuman"
4. Enable "MetaHuman Core" and "MetaHuman Animation"
5. Restart Editor

**Import MetaHuman Character:**

```python
# run_python_script.py
import unreal

def import_metahuman():
    # Load MetaHuman framework
    mh_system = unreal.MetaHumanFramework()
    
    # Create new MetaHuman character
    mh_actor = mh_system.spawn_actor_from_template(
        template_name="YogaInstructor_Female_v1",
        location=unreal.Vector(0, 0, 0),
        rotation=unreal.Rotator(0, 0, 0)
    )
    
    # Configure appearance
    appearance_config = {
        "hair_style": "ponytail",
        "hair_color": unreal.Color(61, 35, 20),
        "outfit_category": "yoga_casual",
        "skin_material": "M_Skin_Natural"
    }
    
    mh_actor.set_appearance(appearance_config)
    
    # Save to content directory
    unreal.EditorAssetLibrary.save_loaded_asset(mh_actor)
    
    return mh_actor

if __name__ == "__main__":
    import_metahuman()
```

### 3.3 Animation Blueprint Setup

#### 3.3.1 Character Animation Blueprint

```cpp
// YogaInstructorCharacter.h
#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "Animation/AnimInstance.h"
#include "YogaInstructorCharacter.generated.h"

UCLASS()
class YOGAINSTRUCTOR_API UYogaInstructorAnimInstance : public UAnimInstance
{
    GENERATED_BODY()

public:
    UYogaInstructorAnimInstance();

    // Current yoga pose state
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Yoga")
    FName CurrentPoseName;

    // Pose transition blend weight
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Yoga")
    float PoseBlendWeight;

    // Breathing cycle (0.0 - 1.0)
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Yoga")
    float BreathingCycle;

    // Current instruction phase
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "Yoga")
    EInstructionPhase CurrentPhase;

    // Blend poses based on current state
    virtual void NativeUpdateAnimation(float DeltaTime) override;

    // Trigger pose transition
    UFUNCTION(BlueprintCallable, Category = "Yoga")
    void TransitionToPose(FName NewPoseName, float BlendDuration = 0.5f);

    // Breathing synchronization
    UFUNCTION(BlueprintCallable, Category = "Yoga")
    void SyncBreathing(float TargetBreathingRate);

protected:
    // Animation curves
    FAnimationCurveData Curves;

    // Pose interpolation
    FName PendingPose;
    float BlendStartTime;
    float BlendDuration;
};

// YogaInstructorCharacter.cpp
#include "YogaInstructorCharacter.h"

void UYogaInstructorAnimInstance::NativeUpdateAnimation(float DeltaTime)
{
    Super::NativeUpdateAnimation(DeltaTime);

    // Calculate breathing cycle
    BreathingCycle += DeltaTime * BreathingRate;
    if (BreathingCycle > 1.0f)
    {
        BreathingCycle = 0.0f;
        OnBreathCycleComplete.Broadcast();
    }

    // Update pose blend weight
    if (BlendDuration > 0.0f)
    {
        float Alpha = (GetWorld()->GetTimeSeconds() - BlendStartTime) / BlendDuration;
        PoseBlendWeight = FMath::Clamp(Alpha, 0.0f, 1.0f);
    }

    // Update pose curves based on current pose
    UpdatePoseCurves(CurrentPoseName, BreathingCycle);
}

void UYogaInstructorAnimInstance::TransitionToPose(FName NewPoseName, float BlendDuration_)
{
    PendingPose = CurrentPoseName;
    CurrentPoseName = NewPoseName;
    BlendStartTime = GetWorld()->GetTimeSeconds();
    BlendDuration = BlendDuration_;
}
```

#### 3.3.2 State Machine for Pose Transitions

```cpp
// PoseStateMachine.cpp
enum class EPoseState
{
    Idle,
    Transitioning,
    Holding,
    Breathing,
    TransitioningOut,
    Reset
};

struct FPoseTransition
{
    EPoseState FromState;
    EPoseState ToState;
    FName PoseName;
    float Duration;
    TArray<FName> RequiredBones;
};

class FPoseStateMachine
{
public:
    void Initialize(UPoseAsset* DefaultPose);
    void Update(float DeltaTime);
    void TransitionTo(FPoseTransition Transition);

private:
    EPoseState CurrentState;
    EPoseState PreviousState;
    FPoseTransition CurrentTransition;
    float StateTimer;
    TArray<FName> ActiveBones;
};
```

---

## 4. MetaHuman Character Creation

### 4.1 Character Design Specifications

#### 4.1.1 Yoga Instructor Persona

**Character Identity:**

```json
{
    "character_profile": {
        "name": "Aria",
        "title": "Yoga Instructor",
        "age_range": "32-38",
        "gender": "female",
        "body_type": "athletic",
        "height": "5'6\" (168cm)",
        "appearance": {
            "face_shape": "oval",
            "facial_features": {
                "eyes": "almond shaped, warm brown",
                "nose": "straight, refined",
                "lips": "full, natural pink",
                "cheekbones": "defined"
            },
            "skin": {
                "tone": "light warm",
                "texture": "smooth, healthy glow"
            },
            "hair": {
                "style": "low ponytail",
                "color": "dark brown with natural highlights",
                "length": "shoulder length"
            }
        },
        "outfit": {
            "primary": "yoga_leggings_turquoise",
            "secondary": "sports_bra_coral",
            "accessories": [
                "yoga_mat_default",
                "block_foam",
                "strap_natural"
            ]
        },
        "personality": {
            "voice": {
                "type": "mezzo-soprano",
                "tone": "warm, calm, encouraging",
                "pace": "moderate",
                "pitch": "slightly higher, soothing"
            },
            "demeanor": {
                "patience": "high",
                "energy": "balanced",
                "encouragement": "enthusiastic but gentle",
                "authority": "confident without being authoritarian"
            }
        }
    }
}
```

### 4.2 MetaHuman Configuration Steps

#### 4.2.1 Using MetaHuman Creator Cloud

**Step 1: Access MetaHuman Creator**

1. Navigate to [metahuman.unrealengine.com](https://metahuman.unrealengine.com)
2. Sign in with Epic Games account
3. Click "Create New MetaHuman"

**Step 2: Customize Character**

```json
// MetaHuman export configuration
{
    "template": "YogaInstructor_Female_v1",
    "customization": {
        "identity": {
            "gender": "female",
            "age": 35,
            "ethnicity": "south_asian"
        },
        "face": {
            "shape": {
                "chin": 0.65,
                "jaw": 0.55,
                "cheekbones": 0.70,
                "face_length": 0.60
            },
            "features": {
                "eye_distance": 0.50,
                "eye_size": 0.55,
                "eye_angle": 0.45,
                "nose_width": 0.50,
                "nose_length": 0.55,
                "lip_fullness": 0.60
            }
        },
        "skin": {
            "albedo": "skin_tone_warm_light",
            "roughness": 0.45,
            "detail_map": "skin_texture_healthy"
        },
        "hair": {
            "style": "ponytail_low",
            "color": {
                "base": "#3D2314",
                "highlight": "#5C4033"
            },
            "length": "shoulder",
            "texture": "wavy"
        }
    },
    "animation": {
        "lip_sync": true,
        "facial_expressions": true,
        "eye_movement": true
    },
    "output": {
        "format": "glb",
        "quality": "high",
        "include": ["mesh", "rig", "materials", "blend_shapes"]
    }
}
```

**Step 3: Download and Import**

```python
# metahuman_importer.py
import unreal
import requests
import json

class MetaHumanImporter:
    def __init__(self):
        self.editor_util = unreal.EditorUtilityLibrary()
        self.asset_tools = unreal.AssetToolsHelpers.get_asset_tools()
        
    def download_metahuman(self, character_id: str, save_path: str) -> bool:
        """Download MetaHuman character from cloud."""
        # This would use the MetaHuman API
        # For now, we'll use the editor import workflow
        
        meta_human_path = f"/MetaHuman/Characters/{character_id}"
        
        # Import to Unreal
        import_config = {
            "destination_path": f"/Game/MetaHuman/Characters/{character_id}",
            "file_path": save_path,
            "import_type": " skeletal_mesh",
            "create_physics_asset": False,
            "import_materials": True,
            "import_textures": True
        }
        
        return self.editor_util.import_asset_with_settings(import_config)
    
    def setup_character_blueprint(self, mesh_path: str) -> str:
        """Create Blueprint from imported MetaHuman mesh."""
        
        # Create new Blueprint class
        bp_name = "BP_MetaHuman_YogaInstructor"
        bp_path = f"/Game/MetaHuman/Blueprints/{bp_name}"
        
        # Open editor to create blueprint
        unreal.EditorAssetLibrary.make_asset_editable(bp_path)
        
        # Add components
        # - Skeletal Mesh Component
        # - Spring Arm
        # - Camera
        # - Audio Component (for voice)
        
        return bp_path
```

### 4.3 Clothing and Appearance

#### 4.3.1 Yoga Outfit System

```json
{
    "outfit_database": {
        "version": "1.0",
        "last_updated": "2024-01-15",
        "outfits": [
            {
                "id": "yoga_leggings_turquoise",
                "name": "Turquoise Yoga Leggings",
                "type": "bottoms",
                "category": "activewear",
                "colors": {
                    "primary": "#40E0D0",
                    "secondary": "#20B2AA",
                    "accent": "#008B8B"
                },
                "material": {
                    "type": "fabric_synthetic",
                    "roughness": 0.8,
                    "metallic": 0.0,
                    "subsurface": false
                },
                "physics": {
                    "cloth_sim": true,
                    "stiffness": 0.7,
                    "damping": 0.3
                },
                "animation_compatible": true
            },
            {
                "id": "sports_bra_coral",
                "name": "Coral Sports Bra",
                "type": "tops",
                "category": "activewear",
                "colors": {
                    "primary": "#FF7F50",
                    "secondary": "#FF6347",
                    "accent": "#FF4500"
                },
                "material": {
                    "type": "fabric_synthetic",
                    "roughness": 0.75,
                    "metallic": 0.0
                },
                "physics": {
                    "cloth_sim": true,
                    "stiffness": 0.6,
                    "damping": 0.25
                }
            }
        ],
        "accessories": [
            {
                "id": "yoga_mat_cork",
                "name": "Cork Yoga Mat",
                "type": "prop",
                "material": {
                    "type": "cork",
                    "roughness": 0.9
                }
            },
            {
                "id": "block_foam",
                "name": "Yoga Block (Foam)",
                "type": "prop",
                "colors": {
                    "primary": "#FFB6C1",
                    "secondary": "#FFC0CB"
                }
            },
            {
                "id": "strap_natural",
                "name": "Yoga Strap (Natural)",
                "type": "prop",
                "material": {
                    "type": "cotton",
                    "color": "#F5DEB3"
                }
            }
        ]
    }
}
```

### 4.4 Facial Animation Setup

#### 4.4.1 Live Link Face Configuration

```cpp
// FaceAnimationSystem.h
#pragma once

#include "CoreMinimal.h"
#include "Components/ActorComponent.h"
#include "LiveLinkComponent.h"
#include "FaceAnimationSystem.generated.h"

UENUM(BlueprintType)
enum class EFaceExpression : uint8
{
    Neutral,
    Smile,
    Encouragement,
    Concentration,
    Breathing,
    Speaking,
    Counting,
    Peace
};

UCLASS( ClassGroup=(Custom), meta=(BlueprintSpawnableComponent) )
class YOGAINSTRUCTOR_API UFaceAnimationSystem : public UActorComponent
{
    GENERATED_BODY()

public: 
    UFaceAnimationSystem();

    // Set facial expression with blend
    UFUNCTION(BlueprintCallable, Category = "Facial")
    void SetExpression(EFaceExpression Expression, float BlendTime = 0.3f);

    // Lip sync for voice
    UFUNCTION(BlueprintCallable, Category = "Facial")
    void ProcessAudioForLipSync(USoundWave* Audio);

    // Eye tracking target
    UFUNCTION(BlueprintCallable, Category = "Facial")
    void SetEyeTarget(FVector TargetLocation);

protected:
    virtual void BeginPlay() override;
    virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

private:
    // LiveLink subject for face
    UPROPERTY()
    ULiveLinkComponent* LiveLinkFace;

    // Current blend weights for expressions
    TMap<EFaceExpression, float> ExpressionWeights;
    
    // Lip sync data
    TArray<float> VisemeWeights;
    
    // Eye movement
    FVector EyeTargetLocation;
    FVector CurrentEyeLocation;
};
```

---

## 5. Yoga Pose Database System

### 5.1 Pose Database Architecture

#### 5.1.1 Core Data Structure

```typescript
// types/YogaPose.ts

/**
 * Complete Yoga Pose Database Entry
 * Each pose contains comprehensive data for animation, instruction, and feedback
 */

export interface YogaPose {
    // Unique Identification
    id: string;
    slug: string;
    version: string;
    lastUpdated: Date;
    
    // Naming Information
    name: {
        sanskrit: string;           // Original Sanskrit name
        english: string;            // Common English name
        pronunciation: string;      // Phonetic pronunciation
        alternative: string[];      // Alternative names
    };
    
    // Categorization
    category: {
        primary: PoseCategory;      // Standing, Seated, Supine, Prone, Inversion
        secondary: PoseCategory[];  // Additional categories
        family: string;             // Pose family (Warrior, Forward Fold, etc.)
        level: DifficultyLevel;     // 1-5 scale
    };
    
    // Physical Description
    description: {
        summary: string;            // Brief description
        detailed: string;          // In-depth instruction guide
        intention: string;         // Spiritual/philosophical intention
    };
    
    // Body Mechanics
    mechanics: {
        joints: {
            [jointName: string]: {
                position: string;
                range_of_motion: string;
                contraindications: string[];
            };
        };
        muscles: {
            target: string[];
            stretch: string[];
            engage: string[];
        };
        alignment: {
            body_part: string;
            cue: string;
            priority: 'critical' | 'important' | 'suggestion';
        }[];
    };
    
    // Benefits and Contraindications
    benefits: {
        physical: string[];
        energetic: string[];
        mental: string[];
        therapeutic: string[];
    };
    contraindications: {
        general: string[];
        pregnancy: string[];
        injuries: string[];
        conditions: string[];
    };
    
    // Modifications and Variations
    modifications: {
        level: 'supported' | 'beginner' | 'standard' | 'advanced' | 'expert';
        description: string;
        props_required: string[];
        visual_cue: string;
        duration_adjustment?: number;
    }[];
    variations: {
        name: string;
        difficulty: DifficultyLevel;
        description: string;
    }[];
    
    // Breathing Pattern
    breathing: {
        phase: 'inhale' | 'hold_in' | 'exhale' | 'hold_out';
        instruction: string;
        duration: number;
        count: string;
        transition_to_next: string;
    }[];
    
    // Animation Data
    animation: {
        duration: number;
        loops: boolean;
        blend_in: number;
        blend_out: number;
        keyframes: {
            time: number;
            body_state: BodyState;
            voice_cue?: string;
        }[];
        transitions: {
            from_pose: string;
            transition_duration: number;
            intermediate_steps: string[];
        }[];
    };
    
    // Voice Instructions
    voiceInstructions: {
        phase: string;
        script: string;
        audio_file?: string;
        duration: number;
        trigger: 'auto' | 'user_action' | 'timer';
    }[];
    
    // Visual References
    visuals: {
        thumbnail_url: string;
        front_view_url: string;
        side_view_url: string;
        3d_model_id?: string;
        video_reference?: string;
    };
    
    // Chakra and Energy
    energetics: {
        chakras: string[];
        nadis: string[];
        dosha: 'vata' | 'pitta' | 'kapha' | 'balanced';
        bandhas: string[];
    };
    
    // Sequence Context
    sequences: {
        common_in: string[];        // Poses that commonly lead to this
        common_out: string[];       // Poses that commonly follow this
        flow_category: string;      // Sun Salutation A/B, etc.
    };
    
    // User Progress Tracking
    mastery: {
        milestones: {
            level: number;
            requirement: string;
            badge: string;
        }[];
        prerequisites: string[];
        next_poses: string[];
    };
}

/**
 * Pose Categories
 */
export type PoseCategory = 
    | 'standing'
    | 'seated'
    | 'supine'
    | 'prone'
    | 'inversion'
    | 'balance'
    | 'twist'
    | 'forward_fold'
    | 'backbend'
    | 'hip_opener'
    | 'heart_opener'
    | 'restorative';

/**
 * Difficulty Levels (1-5 scale)
 */
export type DifficultyLevel = 
    | 'beginner_1'
    | 'beginner_2'
    | 'intermediate_3'
    | 'advanced_4'
    | 'expert_5';

/**
 * Body State at Keyframe
 */
export interface BodyState {
    timestamp: number;
    joint_angles: {
        [jointName: string]: {
            x: number;  // Flexion/Extension
            y: number;  // Abduction/Adduction
            z: number;  // Rotation
        };
    };
    spine_curvature: {
        cervical: number;
        thoracic: number;
        lumbar: number;
    };
    weight_distribution: {
        left_foot: number;
        right_foot: number;
        center_of_gravity: { x: number; y: number; z: number };
    };
    breathing_state: 'inhalation' | 'exhalation' | 'hold';
}
```

### 5.2 Complete Pose Database (100+ Poses)

#### 5.2.1 Standing Poses (Category: Standing)

**Tadasana (Mountain Pose)**

```json
{
    "id": "pose_tadasana_001",
    "slug": "mountain-pose",
    "name": {
        "sanskrit": "ताडासन",
        "english": "Mountain Pose",
        "pronunciation": "tah-DAH-sah-nah"
    },
    "category": {
        "primary": "standing",
        "secondary": ["balance", "grounding"],
        "family": "Foundation Poses",
        "level": "beginner_1"
    },
    "description": {
        "summary": "The foundation of all standing poses, Mountain Pose establishes grounding and awareness of body alignment.",
        "detailed": "Stand with feet together or hip-width apart, grounding through all four corners of your feet. Engage your thighs, lengthen your tailbone toward the floor, and roll your shoulders back and down. Extend through the crown of your head, with arms alongside your body, palms facing forward.",
        "intention": "Cultivate stillness, groundedness, and present-moment awareness as the foundation for practice."
    },
    "mechanics": {
        "joints": {
            "ankles": { "position": "neutral, slight plantar flexion", "range_of_motion": "0° dorsiflexion", "contraindications": [] },
            "knees": { "position": "extended but not locked", "range_of_motion": "0°", "contraindications": ["hyperextension"] },
            "hips": { "position": "neutral rotation", "range_of_motion": "neutral", "contraindications": [] },
            "spine": { "position": "neutral curves", "range_of_motion": "neutral", "contraindications": [] },
            "shoulders": { "position": "rolled back and down", "range_of_motion": "neutral", "contraindications": [] }
        },
        "muscles": {
            "target": ["full body awareness"],
            "stretch": [],
            "engage": ["quadriceps", "glutes", "core", "trapezius"]
        },
        "alignment": [
            { "body_part": "Feet", "cue": "Ground through all four corners, lift your arches", "priority": "critical" },
            { "body_part": "Knees", "cue": "Engage thighs, slight micro-bend in knees", "priority": "important" },
            { "body_part": "Hips", "cue": "Level hip bones, tailbone long", "priority": "important" },
            { "body_part": "Shoulders", "cue": "Roll shoulders back and down", "priority": "important" },
            { "body_part": "Head", "cue": "Chin parallel to floor, crown reaching up", "priority": "suggestion" }
        ]
    },
    "benefits": {
        "physical": ["Improves posture", "Strengthens thighs, knees, and ankles", "Increases awareness"],
        "energetic": ["Grounding", "Establishes focus and concentration", "Promotes calm"],
        "mental": ["Reduces flat feet", "Reduces sciatica symptoms"],
        "therapeutic": ["Anxiety", "Depression", "Fatigue"]
    },
    "contraindications": {
        "general": ["Avoid if experiencing dizziness or low blood pressure"],
        "pregnancy": ["Safe with modifications"],
        "injuries": [],
        "conditions": ["Headaches - avoid if severe"]
    },
    "modifications": [
        {
            "level": "supported",
            "description": "Practice with back against wall for support",
            "props_required": ["Wall"],
            "visual_cue": "Wall supports your spine from tailbone to head"
        },
        {
            "level": "beginner",
            "description": "Stand with feet hip-width apart for stability",
            "props_required": [],
            "visual_cue": "Feet parallel, hip-distance apart"
        }
    ],
    "variations": [
        {
            "name": "Arms Overhead",
            "difficulty": "intermediate_3",
            "description": "Interlace fingers and extend arms overhead, palms facing upward"
        },
        {
            "name": "Eyes Closed",
            "difficulty": "intermediate_3",
            "description": "Practice with eyes closed to enhance proprioception"
        }
    ],
    "breathing": [
        { "phase": "inhale", "instruction": "Inhale deeply, feeling your body grow taller", "duration": 4, "count": "1-2-3-4" },
        { "phase": "hold_in", "instruction": "Hold briefly, maintaining expansion", "duration": 2, "count": "1-2" },
        { "phase": "exhale", "instruction": "Exhale completely, grounding into earth", "duration": 4, "count": "1-2-3-4" },
        { "phase": "hold_out", "instruction": "Release and receive", "duration": 2, "count": "1-2" }
    ],
    "animation": {
        "duration": 60,
        "loops": true,
        "blend_in": 0.5,
        "blend_out": 0.5,
        "keyframes": [
            { "time": 0, "body_state": { "joint_angles": {}, "spine_curvature": { "cervical": 0, "thoracic": 0, "lumbar": 0 }, "weight_distribution": { "left_foot": 50, "right_foot": 50, "center_of_gravity": { "x": 0, "y": 0, "z": 0 } }, "breathing_state": "inhalation" } },
            { "time": 15, "voice_cue": "Ground down through your feet", "body_state": { "joint_angles": {}, "spine_curvature": { "cervical": 0, "thoracic": 0, "lumbar": 0 }, "weight_distribution": { "left_foot": 50, "right_foot": 50, "center_of_gravity": { "x": 0, "y": 0, "z": 0 } }, "breathing_state": "hold" } },
            { "time": 30, "voice_cue": "Lengthen your spine", "body_state": { "joint_angles": {}, "spine_curvature": { "cervical": 0, "thoracic": 0, "lumbar": 0 }, "weight_distribution": { "left_foot": 50, "right_foot": 50, "center_of_gravity": { "x": 0, "y": 0, "z": 0 } }, "breathing_state": "exhalation" } },
            { "time": 45, "voice_cue": "Relax shoulders away from ears", "body_state": { "joint_angles": {}, "spine_curvature": { "cervical": 0, "thoracic": 0, "lumbar": 0 }, "weight_distribution": { "left_foot": 50, "right_foot": 50, "center_of_gravity": { "x": 0, "y": 0, "z": 0 } }, "breathing_state": "hold" } }
        ],
        "transitions": []
    },
    "voiceInstructions": [
        { "phase": "Introduction", "script": "Welcome to Mountain Pose. This is the foundation of all standing poses. Let's begin by finding your grounding.", "duration": 5 },
        { "phase": "Setup", "script": "Stand with your feet either together or hip-width apart. Ground down through all four corners of your feet.", "duration": 8 },
        { "phase": "Alignment", "script": "Engage your thighs, lengthen your tailbone toward the floor, and roll your shoulders back and down.", "duration": 10 },
        { "phase": "Breath", "script": "Inhale deeply, feeling yourself grow taller. Exhale completely, grounding into the earth.", "duration": 8 }
    ],
    "visuals": {
        "thumbnail_url": "/assets/poses/tadasana/thumbnail.jpg",
        "front_view_url": "/assets/poses/tadasana/front.jpg",
        "side_view_url": "/assets/poses/tadasana/side.jpg"
    },
    "energetics": {
        "chakras": ["Root Chakra (Muladhara)"],
        "nadis": ["Ida", "Pingala"],
        "dosha": "vata",
        "bandhas": ["Mula Bandha"]
    },
    "sequences": {
        "common_in": ["Start of practice", "After Savasana"],
        "common_out": ["Urdhva Hastasana", "Uttanasana"],
        "flow_category": "Sun Salutation A - Stand"
    },
    "mastery": {
        "milestones": [
            { "level": 1, "requirement": "Hold pose for 30 seconds with awareness", "badge": "Mountain Pose Novice" },
            { "level": 2, "requirement": "Hold pose for 1 minute with eyes closed", "badge": "Mountain Pose Practitioner" },
            { "level": 3, "requirement": "Teach pose with proper cues to another", "badge": "Mountain Pose Teacher" }
        ],
        "prerequisites": [],
        "next_poses": ["pose_urdhvahastasana_001", "pose_uttanasana_001"]
    }
}
```

**Virabhadrasana I (Warrior I)**

```json
{
    "id": "pose_virabhadrasana_i_001",
    "slug": "warrior-1",
    "name": {
        "sanskrit": "वीरभद्रासनम् I",
        "english": "Warrior I",
        "pronunciation": "veer-uh-buh-DRAHS-ah-nah"
    },
    "category": {
        "primary": "standing",
        "secondary": ["balance", "hip_opener", "heart_opener"],
        "family": "Warrior Poses",
        "level": "beginner_2"
    },
    "description": {
        "summary": "A powerful standing pose that builds strength in the legs and opens the chest and shoulders.",
        "detailed": "From Mountain Pose, step your left foot back 3-4 feet, turning it out 45 degrees. Bend your right knee to 90 degrees, keeping it aligned over your ankle. Square your hips toward the front, lift your arms overhead, and gaze up between your hands.",
        "intention": "Channel the strength and fearlessness of the warrior within."
    },
    "mechanics": {
        "joints": {
            "front_knee": { "position": "bent at 90 degrees", "range_of_motion": "90° flexion", "contraindications": ["high blood pressure", "neck problems"] },
            "back_hip": { "position": "internally rotated", "range_of_motion": "internal rotation", "contraindications": [] },
            "spine": { "position": "extension, slight rotation", "range_of_motion": "extension", "contraindications": [] },
            "shoulders": { "position": "flexion overhead", "range_of_motion": "full flexion", "contraindications": [] }
        },
        "muscles": {
            "target": ["quadriceps", "hip flexors", "chest"],
            "stretch": ["hip flexors (back leg)", "psoas"],
            "engage": ["quadriceps (front leg)", "glutes", "core", "shoulders"]
        },
        "alignment": [
            { "body_part": "Front Knee", "cue": "Keep knee aligned over ankle, don't let it collapse inward", "priority": "critical" },
            { "body_part": "Front Foot", "cue": "Foot points forward, rooted", "priority": "critical" },
            { "body_part": "Back Foot", "cue": "Turn back foot out 45 degrees, heel grounded", "priority": "important" },
            { "body_part": "Hips", "cue": "Square hips toward the front of your mat", "priority": "important" },
            { "body_part": "Arms", "cue": "Reach up and back, shoulders away from ears", "priority": "important" }
        ]
    },
    "benefits": {
        "physical": ["Strengthens legs and ankles", "Opens hips and chest", "Improves focus and balance"],
        "energetic": ["Energizes and builds confidence", "Activates manipura chakra"],
        "mental": ["Increases stamina", "Relieves backaches"],
        "therapeutic": ["Sciatica", "Flat feet"]
    },
    "contraindications": {
        "general": ["High blood pressure - keep arms down", "Neck problems - keep gaze forward"],
        "pregnancy": ["Modify stance to be narrower"],
        "injuries": ["Shoulder injuries - modify arm position"],
        "conditions": ["Diarrhea", "Recent abdominal surgery"]
    },
    "modifications": [
        {
            "level": "supported",
            "description": "Practice with hands on hips instead of overhead",
            "props_required": [],
            "visual_cue": "Hands on hips maintains heart opener without shoulder strain"
        },
        {
            "level": "beginner",
            "description": "Shorten stance and reduce knee bend",
            "props_required": [],
            "visual_cue": "Find 90-degree angle gradually"
        },
        {
            "level": "advanced",
            "description": "Add a gentle backbend and gaze up",
            "props_required": [],
            "visual_cue": "Heart reaches toward sky"
        }
    ],
    "variations": [
        {
            "name": "Humble Warrior",
            "difficulty": "intermediate_3",
            "description": "Fold forward, clasp hands behind back, and bow forward"
        },
        {
            "name": "Crescent Warrior",
            "difficulty": "intermediate_3",
            "description": "Keep back heel lifted for additional challenge"
        }
    ],
    "breathing": [
        { "phase": "inhale", "instruction": "Inhale as you set your stance and reach arms up", "duration": 4, "count": "1-2-3-4" },
        { "phase": "hold_in", "instruction": "Hold at the top, feeling the stretch", "duration": 2, "count": "1-2" },
        { "phase": "exhale", "instruction": "Exhale as you settle deeper into the pose", "duration": 4, "count": "1-2-3-4" },
        { "phase": "hold_out", "instruction": "Maintain while breathing smoothly", "duration": 3, "count": "1-2-3" }
    ],
    "animation": {
        "duration": 45,
        "loops": true,
        "blend_in": 0.5,
        "blend_out": 0.5,
        "keyframes": [
            { "time": 0, "voice_cue": "Step your left foot back", "body_state": {} },
            { "time": 10, "voice_cue": "Bend your right knee to 90 degrees", "body_state": {} },
            { "time": 20, "voice_cue": "Square your hips forward", "body_state": {} },
            { "time": 30, "voice_cue": "Reach your arms overhead", "body_state": {} }
        ],
        "transitions": [
            { "from_pose": "pose_tadasana_001", "transition_duration": 2, "intermediate_steps": ["step_back", "set_rear_foot", "bend_front_knee", "raise_arms"] }
        ]
    },
    "voiceInstructions": [
        { "phase": "Setup", "script": "From Mountain Pose, step your left foot back about 3-4 feet. Turn your back foot out at 45 degrees.", "duration": 8 },
        { "phase": "Entry", "script": "Inhale and bend your front knee to 90 degrees, keeping it aligned over your ankle. Exhale and square your hips toward the front.", "duration": 10 },
        { "phase": "Arms", "script": "Inhale and reach your arms up overhead, palms facing each other. Roll your shoulders back and down.", "duration": 8 },
        { "phase": "Gaze", "script": "Gaze up between your hands, or keep your gaze forward if your neck allows. Breathe steadily.", "duration": 6 }
    ],
    "visuals": {
        "thumbnail_url": "/assets/poses/virabhadrasana_i/thumbnail.jpg",
        "front_view_url": "/assets/poses/virabhadrasana_i/front.jpg",
        "side_view_url": "/assets/poses/virabhadrasana_i/side.jpg"
    },
    "energetics": {
        "chakras": ["Manipura (Solar Plexus)", "Anahata (Heart)"],
        "nadis": ["Sushumna"],
        "dosha": "pitta",
        "bandhas": ["Uddiyana Bandha"]
    },
    "sequences": {
        "common_in": ["Tadasana", "Uttanasana", "Adho Mukha Svanasana"],
        "common_out": ["Virabhadrasana II", "Virabhadrasana III"],
        "flow_category": "Sun Salutation A - Standing"
    },
    "mastery": {
        "milestones": [
            { "level": 1, "requirement": "Hold pose for 30 seconds each side", "badge": "Warrior I Novice" },
            { "level": 2, "requirement": "Hold pose for 1 minute each side with arms overhead", "badge": "Warrior I Practitioner" },
            { "level": 3, "requirement": "Flow through Warrior I to Warrior II smoothly", "badge": "Warrior I Master" }
        ],
        "prerequisites": ["pose_tadasana_001"],
        "next_poses": ["pose_virabhadrasana_ii_001", "pose_virabhadrasana_iii_001"]
    }
}
```

**Virabhadrasana II (Warrior II)**

```json
{
    "id": "pose_virabhadrasana_ii_001",
    "slug": "warrior-2",
    "name": {
        "sanskrit": "वीरभद्रासनम् II",
        "english": "Warrior II",
        "pronunciation": "veer-uh-buh-DRAHS-ah-nah"
    },
    "category": {
        "primary": "standing",
        "secondary": ["hip_opener", "strength", "balance"],
        "family": "Warrior Poses",
        "level": "beginner_2"
    },
    "description": {
        "summary": "A powerful standing pose that strengthens and stretches the legs and ankles, opens the chest, and improves stamina.",
        "detailed": "From Warrior I or Mountain Pose, open your arms parallel to the floor, palms down. Turn your back foot parallel to the mat edge. Bend your front knee over your ankle while keeping your torso centered between your legs. Gaze over your front hand.",
        "intention": "Find strength and stability while remaining open and receptive."
    },
    "mechanics": {
        "joints": {
            "front_knee": { "position": "bent at 90 degrees", "range_of_motion": "90° flexion", "contraindications": [] },
            "hips": { "position": "externally rotated and abducted", "range_of_motion": "full external rotation", "contraindications": [] },
            "spine": { "position": "neutral, facing forward", "range_of_motion": "neutral rotation", "contraindications": [] },
            "shoulders": { "position": "abducted, parallel to floor", "range_of_motion": "90° abduction", "contraindications": [] }
        },
        "muscles": {
            "target": ["hip adductors", "groin", "quadriceps"],
            "stretch": ["inner thigh (adductors)", "groin"],
            "engage": ["quadriceps (front leg)", "glutes", "core"]
        },
        "alignment": [
            { "body_part": "Front Knee", "cue": "Stack knee over ankle, don't let it collapse", "priority": "critical" },
            { "body_part": "Front Thigh", "cue": "Push outer thigh back to create space in hip", "priority": "critical" },
            { "body_part": "Arms", "cue": "Extend strongly from center, shoulder blades down", "priority": "important" },
            { "body_part": "Gaze", "cue": "Maintain steady gaze over front fingertips", "priority": "important" }
        ]
    },
    "benefits": {
        "physical": ["Strengthens and stretches legs and ankles", "Stretches groins, chest, lungs, shoulders", "Stimulates abdominal organs"],
        "energetic": ["Increases stamina", "Relieves backaches"],
        "mental": ["Therapeutic for carpal tunnel"],
        "therapeutic": ["Anxiety", "Depression", "Flat feet", "Sciatica"]
    },
    "contraindications": {
        "general": ["Diarrhea", "High blood pressure - keep arms lower"],
        "pregnancy": ["Third trimester - wide stance caution"],
        "injuries": ["Neck problems - gaze forward, not down"],
        "conditions": []
    },
    "modifications": [
        {
            "level": "beginner",
            "description": "Shorten stance, reduce knee bend",
            "props_required": [],
            "visual_cue": "Find stability before depth"
        },
        {
            "level": "supported",
            "description": "Place hand on thigh for support",
            "props_required": [],
            "visual_cue": "Use leg as support, not crutch"
        }
    ],
    "variations": [
        {
            "name": "Reverse Warrior",
            "difficulty": "intermediate_3",
            "description": "Slide back hand down back leg, lift front arm into slight backbend"
        },
        {
            "name": "Extended Side Angle",
            "difficulty": "intermediate_3",
            "description": "Lower front arm to thigh or floor beside front leg"
        }
    ],
    "breathing": [
        { "phase": "inhale", "instruction": "Inhale as you set your stance and open arms", "duration": 4, "count": "1-2-3-4" },
        { "phase": "hold_in", "instruction": "Brief pause to stabilize", "duration": 2, "count": "1-2" },
        { "phase": "exhale", "instruction": "Exhale and settle deeper into the pose", "duration": 4, "count": "1-2-3-4" },
        { "phase": "hold_out", "instruction": "Continue breathing smoothly", "duration": 5, "count": "1-2-3-4-5" }
    ],
    "animation": {
        "duration": 45,
        "loops": true,
        "blend_in": 0.5,
        "blend_out": 0.5,
        "keyframes": [
            { "time": 0, "voice_cue": "From Warrior I, rotate your arms open", "body_state": {} },
            { "time": 10, "voice_cue": "Turn your back foot parallel", "body_state": {} },
            { "time": 20, "voice_cue": "Ground down through both feet", "body_state": {} },
            { "time": 30, "voice_cue": "Gaze over your front fingertips", "body_state": {} }
        ],
        "transitions": [
            { "from_pose": "pose_virabhadrasana_i_001", "transition_duration": 1.5, "intermediate_steps": ["rotate_arms_out", "turn_back_foot", "shift_gaze"] }
        ]
    },
    "voiceInstructions": [
        { "phase": "Setup", "script": "From Warrior I, rotate your arms to open parallel to the floor, palms facing down. Turn your back foot to be parallel with the short edge of your mat.", "duration": 10 },
        { "phase": "Entry", "script": "Ground down through both feet. Bend your front knee to 90 degrees, keeping it stacked over your ankle. Exhale as you do this.", "duration": 10 },
        { "phase": "Torso", "script": "Keep your torso centered between your legs, don't lean forward into the bent knee. Your energy should extend in both directions.", "duration": 8 },
        { "phase": "Gaze", "script": "Turn your head to gaze over your front fingertips. Keep your shoulders relaxed away from your ears.", "duration": 6 }
    ],
    "visuals": {
        "thumbnail_url": "/assets/poses/virabhadrasana_ii/thumbnail.jpg",
        "front_view_url": "/assets/poses/virabhadrasana_ii/front.jpg",
        "side_view_url": "/assets/poses/virabhadrasana_ii/side.jpg"
    },
    "energetics": {
        "chakras": ["Muladhara (Root)", "Svadhisthana (Sacral)", "Manipura (Solar Plexus)"],
        "nadis": ["Ida", "Pingala"],
        "dosha": "vata",
        "bandhas": ["Mula Bandha", "Uddiyana Bandha"]
    },
    "sequences": {
        "common_in": ["Virabhadrasana I", "Tadasana"],
        "common_out": ["Virabhadrasana I", "Virabhadrasana III"],
        "flow_category": "Sun Salutation A - Standing"
    },
    "mastery": {
        "milestones": [
            { "level": 1, "requirement": "Hold pose for 30 seconds each side", "badge": "Warrior II Novice" },
            { "level": 2, "requirement": "Flow smoothly between Warrior I and II for 5 rounds", "badge": "Warrior II Flow Master" },
            { "level": 3, "requirement": "Add Reverse Warrior variation smoothly", "badge": "Warrior II Master" }
        ],
        "prerequisites": ["pose_tadasana_001", "pose_virabhadrasana_i_001"],
        "next_poses": ["pose_virabhadrasana_iii_001", "pose_uttita_parsvakonasana_001"]
    }
}
```

**Trikonasana (Triangle Pose)**

```json
{
    "id": "pose_trikonasana_001",
    "slug": "triangle-pose",
    "name": {
        "sanskrit": "त्रिकोणासन",
        "english": "Triangle Pose",
        "pronunciation": "tree-koh-NAH-sah-nah"
    },
    "category": {
        "primary": "standing",
        "secondary": ["hip_opener", "twist", "strength"],
        "family": "Triangle Poses",
        "level": "beginner_2"
    },
    "description": {
        "summary": "A classic standing pose that stretches the legs, groins, hips, and spine while strengthening the thighs, knees, and ankles.",
        "detailed": "Stand with feet wide apart. Turn your right foot out 90 degrees and left foot slightly in. Extend arms parallel to the floor. Reach right hand toward your right foot, placing it on your shin, ankle, or floor. Extend left arm toward the ceiling. Keep both sides of your torso equally long.",
        "intention": "Find stability and openness in equal measure."
    },
    "mechanics": {
        "joints": {
            "front_hip": { "position": "lateral flexion", "range_of_motion": "side bending", "contraindications": [] },
            "spine": { "position": "lateral flexion with rotation", "range_of_motion": "lateral flexion + rotation", "contraindications": [] },
            "front_knee": { "position": "extended", "range_of_motion": "full extension", "contraindications": [] },
            "back_leg": { "position": "extended", "range_of_motion": "full extension", "contraindications": [] }
        },
        "muscles": {
            "target": ["hip abductors", "groin", "spine"],
            "stretch": ["hamstrings", "groin", "hip abductors", "calves"],
            "engage": ["quadriceps", "core", "glutes"]
        },
        "alignment": [
            { "body_part": "Front Leg", "cue": "Keep front knee extended but not locked", "priority": "critical" },
            { "body_part": "Hips", "cue": "Keep hips stacked, not tilted", "priority": "critical" },
            { "body_part": "Spine", "cue": "Lengthen equally in both directions, avoid crunching", "priority": "important" },
            { "body_part": "Top Arm", "cue": "Reach strongly toward ceiling, shoulder away from ear", "priority": "important" }
        ]
    },
    "benefits": {
        "physical": ["Stretches legs, groins, hips, spine", "Opens chest and shoulders", "Strengthens thighs, knees, ankles"],
        "energetic": ["Stimulates abdominal organs", "Relieves stress"],
        "mental": ["Opens heart center"],
        "therapeutic": ["Backaches", "Sciatica", "Neck pain", "Digestive issues"]
    },
    "contraindications": {
        "general": ["Low blood pressure", "Neck problems - keep gaze forward"],
        "pregnancy": ["Modify with wider stance if comfortable"],
        "injuries": ["Ankle injuries - use wall for support"],
        "conditions": ["Diarrhea", "Heart conditions"]
    },
    "modifications": [
        {
            "level": "supported",
            "description": "Place bottom hand on yoga block for height",
            "props_required": ["Yoga Block"],
            "visual_cue": "Block brings floor closer to you"
        },
        {
            "level": "beginner",
            "description": "Practice with back against wall for alignment",
            "props_required": ["Wall"],
            "visual_cue": "Wall guides your torso position"
        }
    ],
    "variations": [
        {
            "name": "Revolved Triangle",
            "difficulty": "intermediate_3",
            "description": "Add rotation by bringing bottom hand to floor and twisting torso"
        },
        {
            "name": "Extended Triangle",
            "difficulty": "intermediate_3",
            "description": "Walk bottom hand further along front leg, keeping torso extended"
        }
    ],
    "breathing": [
        { "phase": "inhale", "instruction": "Inhale to extend arms and set stance", "duration": 4, "count": "1-2-3-4" },
        { "phase": "hold_in", "instruction": "Brief pause at extension", "duration": 2, "count": "1-2" },
        { "phase": "exhale", "instruction": "Exhale to fold to side", "duration": 4, "count": "1-2-3-4" },
        { "phase": "hold_out", "instruction": "Breathe into the stretch", "duration": 5, "count": "1-2-3-4-5" }
    ],
    "animation": {
        "duration": 45,
        "loops": true,
        "blend_in": 0.5,
        "blend_out": 0.5,
        "keyframes": [
            { "time": 0, "voice_cue": "Step your feet wide apart", "body_state": {} },
            { "time": 10, "voice_cue": "Turn your right foot out 90 degrees", "body_state": {} },
            { "time": 20, "voice_cue": "Extend your arms out wide", "body_state": {} },
            { "time": 30, "voice_cue": "Reach to your right foot", "body_state": {} }
        ],
        "transitions": []
    },
    "voiceInstructions": [
        { "phase": "Setup", "script": "Stand at the top of your mat with your feet wide apart, about 3-4 feet. Turn your right foot out 90 degrees and your left foot slightly in.", "duration": 8 },
        { "phase": "Entry", "script": "Inhale and extend your arms out to the sides, parallel to the floor. Exhale and reach your right hand toward your right foot.", "duration": 10 },
        { "phase": "Descent", "script": "You can place your hand on your shin, ankle, or the floor beside your foot. Keep both sides of your torso equally long.", "duration": 8 },
        { "phase": "Top Arm", "script": "Extend your left arm toward the ceiling, directly above your left shoulder. Keep your shoulders relaxed.", "duration": 6 },
        { "phase": "Gaze", "script": "Gaze up toward your top hand, or keep your gaze forward if your neck is uncomfortable.", "duration": 4 }
    ],
    "visuals": {
        "thumbnail_url": "/assets/poses/trikonasana/thumbnail.jpg",
        "front_view_url": "/assets/poses/trikonasana/front.jpg",
        "side_view_url": "/assets/poses/trikonasana/side.jpg"
    },
    "energetics": {
        "chakras": ["Muladhara (Root)", "Svadhisthana (Sacral)", "Anahata (Heart)"],
        "nadis": ["Sushumna", "Ida", "Pingala"],
        "dosha": "vata",
        "bandhas": ["Mula Bandha"]
    },
    "sequences": {
        "common_in": ["Tadasana", "Virabhadrasana II"],
        "common_out": ["Virabhadrasana I", "Parivrtta Trikonasana"],
        "flow_category": "Sun Salutation B - Standing"
    },
    "mastery": {
        "milestones": [
            { "level": 1, "requirement": "Hold pose for 30 seconds each side", "badge": "Triangle Novice" },
            { "level": 2, "requirement": "Hand to floor with straight legs", "badge": "Triangle Practitioner" },
            { "level": 3, "requirement": "Add Revolved Triangle smoothly", "badge": "Triangle Master" }
        ],
        "prerequisites": ["pose_tadasana_001", "pose_virabhadrasana_ii_001"],
        "next_poses": ["pose_parivrtta_trikonasana_001", "pose_uttita_parsvakonasana_001"]
    }
}
```

**[REMAINING STANDING POSES - 25+ more poses including:]**
- Uttanasana (Standing Forward Fold)
- Utkatasana (Chair Pose)
- Virabhadrasana III (Warrior III)
- Ardha Chandrasana (Half Moon Pose)
- Parsvottanasana (Intense Side Stretch)
- Utthita Parsvakonasana (Extended Side Angle)
- Parivrtta Parsvakonasana (Revolved Side Angle)
- Prasarita Padottanasana (Wide-Legged Forward Fold)
- Garudasana (Eagle Pose)
- Tree Pose (Vrksasana)
- Crescent Moon (Alanasana)
- High Lunge
- Reverse Lunge
- Anjaneyasana (Crescent Lunge)
- Natarajasana (Dancer's Pose)
- Mayurasana (Peacock Pose)
- Bakasana (Crow Pose)
- Dandasana (Staff Pose)
- Malasana (Squat)
- And many more...

#### 5.2.2 Seated Poses (Category: Seated)

**Sukhasana (Easy Pose)**

```json
{
    "id": "pose_sukhasana_001",
    "slug": "easy-pose",
    "name": {
        "sanskrit": "सुखासन",
        "english": "Easy Pose",
        "pronunciation": "shuh-KAHS-ah-nah"
    },
    "category": {
        "primary": "seated",
        "secondary": ["meditation", "grounding"],
        "family": "Seated Meditation Poses",
        "level": "beginner_1"
    },
    "description": {
        "summary": "A comfortable cross-legged seated position for meditation and breathing exercises.",
        "detailed": "Sit on the floor with your legs extended. Cross your shins, sliding each foot beneath the opposite knee. Rest your hands on your knees or in your lap. Lengthen your spine and relax your shoulders. Close your eyes and breathe smoothly.",
        "intention": "Create a stable, comfortable seat for meditation and inner work."
    },
    "mechanics": {
        "joints": {
            "hips": { "position": "external rotation and flexion", "range_of_motion": "90° flexion", "contraindications": ["knee injuries"] },
            "knees": { "position": "flexed, stacked", "range_of_motion": "comfortable flexion", "contraindications": [] },
            "spine": { "position": "neutral, erect", "range_of_motion": "neutral", "contraindications": [] },
            "shoulders": { "position": "relaxed, rolled back", "range_of_motion": "relaxed", "contraindications": [] }
        },
        "muscles": {
            "target": ["hip external rotators", "glutes"],
            "stretch": ["hip flexors", "outer thighs"],
            "engage": ["spinal erectors", "core"]
        },
        "alignment": [
            { "body_part": "Seat", "cue": "Sit on a cushion if hips are above knees", "priority": "critical" },
            { "body_part": "Spine", "cue": "Lengthen tailbone toward floor, crown toward ceiling", "priority": "critical" },
            { "body_part": "Knees", "cue": "Knees lower than hips if possible", "priority": "important" },
            { "body_part": "Shoulders", "cue": "Relax away from ears, shoulder blades down", "priority": "important" }
        ]
    },
    "benefits": {
        "physical": ["Opens hips", "Strengthens back", "Stretches knees and ankles"],
        "energetic": ["Calms the mind", "Opens hip joints"],
        "mental": ["Promotes inner calm", "Foundation for meditation"],
        "therapeutic": ["Stress", "Anxiety", "Fatigue"]
    },
    "contraindications": {
        "general": ["Knee injuries - use props"],
        "pregnancy": ["Comfortable with modifications"],
        "injuries": ["Sciatica - elevate hips"],
        "conditions": []
    },
    "modifications": [
        {
            "level": "supported",
            "description": "Sit on a yoga block or cushion to elevate hips",
            "props_required": ["Yoga Block", "Cushion"],
            "visual_cue": "Hips higher than knees creates natural spinal alignment"
        },
        {
            "level": "supported",
            "description": "Place blanket under knees for comfort",
            "props_required": ["Blanket"],
            "visual_cue": "Blanket supports knees in external rotation"
        }
    ],
    "variations": [
        {
            "name": "Gyan Mudra",
            "difficulty": "beginner_1",
            "description": "Touch index finger and thumb together on each hand"
        },
        {
            "name": "Chin Mudra",
            "difficulty": "beginner_1",
            "description": "Touch thumb and index finger tips together, palms up"
        }
    ],
    "breathing": [
        { "phase": "inhale", "instruction": "Inhale deeply through nose, feeling belly expand", "duration": 4, "count": "1-2-3-4" },
        { "phase": "hold_in", "instruction": "Brief pause, feel breath fill space", "duration": 2, "count": "1-2" },
        { "phase": "exhale", "instruction": "Exhale slowly through nose, belly softens", "duration": 4, "count": "1-2-3-4" },
        { "phase": "hold_out", "instruction": "Rest before next breath", "duration": 2, "count": "1-2" }
    ],
    "animation": {
        "duration": 300,
        "loops": true,
        "blend_in": 0.5,
        "blend_out": 0.5,
        "keyframes": [
            { "time": 0, "voice_cue": "Find your comfortable seat", "body_state": {} },
            { "time": 30, "voice_cue": "Lengthen your spine", "body_state": {} },
            { "time": 60, "voice_cue": "Relax your shoulders", "body_state": {} },
            { "time": 90, "voice_cue": "Close your eyes and breathe", "body_state": {} }
        ],
        "transitions": []
    },
    "voiceInstructions": [
        { "phase": "Setup", "script": "Find a comfortable spot on your mat. Sit down with your legs extended in front of you.", "duration": 5 },
        { "phase": "Entry", "script": "Cross your shins, sliding each foot beneath the opposite knee. If this is uncomfortable, you can extend your legs and cross at the ankles.", "duration": 10 },
        { "phase": "Support", "script": "If your knees are above your hips, sit on a cushion or block to elevate your seat.", "duration": 5 },
        { "phase": "Spine", "script": "Place your hands on your knees or in your lap. Lengthen your tailbone toward the floor and crown of your head toward the ceiling.", "duration": 8 },
        { "phase": "Shoulders", "script": "Roll your shoulders back and down, relaxing them away from your ears.", "duration": 5 },
        { "phase": "Close", "script": "Close your eyes or soften your gaze. Begin to breathe smoothly through your nose.", "duration": 5 }
    ],
    "visuals": {
        "thumbnail_url": "/assets/poses/sukhasana/thumbnail.jpg",
        "front_view_url": "/assets/poses/sukhasana/front.jpg",
        "side_view_url": "/assets/poses/sukhasana/side.jpg"
    },
    "energetics": {
        "chakras": ["Muladhara (Root)", "Anahata (Heart)", "Ajna (Third Eye)"],
        "nadis": ["Sushumna"],
        "dosha": "vata",
        "bandhas": ["Mula Bandha", "Jalandhara Bandha"]
    },
    "sequences": {
        "common_in": ["Savasana", "Dandasana"],
        "common_out": ["Meditation", "Pranayama", "Padmasana"],
        "flow_category": "Seated Opening"
    },
    "mastery": {
        "milestones": [
            { "level": 1, "requirement": "Sit comfortably for 5 minutes", "badge": "Easy Pose Beginner" },
            { "level": 2, "requirement": "Sit for 15 minutes with steady breath", "badge": "Easy Pose Practitioner" },
            { "level": 3, "requirement": "Sit for 30 minutes in meditation", "badge": "Easy Pose Master" }
        ],
        "prerequisites": [],
        "next_poses": ["pose_padmasana_001", "pose_siddhasana_001", "pose_siddha_yoni_asana_001"]
    }
}
```

**[REMAINING SEATED POSES - 20+ more poses including:]**
- Padmasana (Lotus Pose)
- Ardha Padmasana (Half Lotus)
- Siddhasana (Accomplished Pose)
- Siddha Yoni Asana (Perfect Pose)
- Virasana (Hero Pose)
- Supta Virasana (Reclined Hero)
- Baddha Konasana (Butterfly Pose)
- Upavistha Konasana (Wide-Angle Seated Forward Fold)
- Janusirsasana (Head-to-Knee Pose)
- Parivrtta Janusirsasana (Revolved Head-to-Knee)
- Ardha Matsyendrasana (Half Lord of the Fishes)
- Paschimottanasana (Western Stretch)
- Kurmasana (Tortoise Pose)
- Gomukhasana (Cow Face Pose)
- Malasana (Squat) - also standing
- And many more...

#### 5.2.3 Supine Poses (Category: Supine)

**Savasana (Corpse Pose)**

```json
{
    "id": "pose_savasana_001",
    "slug": "corpse-pose",
    "name": {
        "sanskrit": "शवासन",
        "english": "Corpse Pose",
        "pronunciation": "shah-VAHS-ah-nah"
    },
    "category": {
        "primary": "supine",
        "secondary": ["restorative", "meditation"],
        "family": "Restorative Poses",
        "level": "beginner_1"
    },
    "description": {
        "summary": "The final relaxation pose, practiced at the end of every yoga session.",
        "detailed": "Lie flat on your back with legs extended and arms alongside your body, palms facing up. Close your eyes and release all muscular effort. Let your feet fall open naturally. Breathe smoothly and deeply. Completely relax and let go.",
        "intention": "Integrate the practice and allow complete surrender and restoration."
    },
    "mechanics": {
        "joints": {
            "hips": { "position": "neutral, relaxed", "range_of_motion": "neutral", "contraindications": [] },
            "spine": { "position": "neutral curves", "range_of_motion": "neutral", "contraindications": [] },
            "shoulders": { "position": "relaxed, away from ears", "range_of_motion": "relaxed", "contraindications": [] },
            "knees": { "position": "extended, relaxed", "range_of_motion": "extended", "contraindications": [] }
        },
        "muscles": {
            "target": ["entire body relaxation"],
            "stretch": [],
            "engage": []
        },
        "alignment": [
            { "body_part": "Spine", "cue": "Long from tailbone to crown, natural curves maintained", "priority": "critical" },
            { "body_part": "Arms", "cue": "Palms up, arms 45 degrees from body", "priority": "suggestion" },
            { "body_part": "Legs", "cue": "Let feet fall open naturally, don't force", "priority": "suggestion" },
            { "body_part": "Head", "cue": "Center on blanket, nose pointing ceiling", "priority": "important" }
        ]
    },
    "benefits": {
        "physical": ["Deep relaxation", "Lowers blood pressure", "Reduces heart rate"],
        "energetic": ["Calms nervous system", "Integrates practice"],
        "mental": ["Reduces stress", "Improves sleep"],
        "therapeutic": ["Insomnia", "Stress", "Anxiety", "Fatigue", "High blood pressure"]
    },
    "contraindications": {
        "general": ["Back injuries - bend knees, feet flat"],
        "pregnancy": ["Women in later pregnancy - Savasana on side"],
        "injuries": ["Neck injuries - support head"],
        "conditions": ["Acid reflux - elevate upper body slightly"]
    },
    "modifications": [
        {
            "level": "supported",
            "description": "Place bolster under knees for lower back release",
            "props_required": ["Bolster", "Blanket"],
            "visual_cue": "Knees bent, feet flat allows lower back to release"
        },
        {
            "level": "supported",
            "description": "Cover with blanket for warmth and comfort",
            "props_required": ["Blanket"],
            "visual_cue": "Blanket maintains body temperature during deep relaxation"
        },
        {
            "level": "supported",
            "description": "Use eye pillow for deeper relaxation",
            "props_required": ["Eye Pillow"],
            "visual_cue": "Eye pillow blocks light, calms optic nerves"
        }
    ],
    "variations": [
        {
            "name": "Nadi Shodhana Arms",
            "difficulty": "beginner_1",
            "description": "Bend elbows, place hands on belly in Nadi Shodhana mudra"
        },
        {
            "name": "Legs Up Wall",
            "difficulty": "beginner_1",
            "description": "Lie with legs up a wall for restorative variation"
        }
    ],
    "breathing": [
        { "phase": "inhale", "instruction": "Inhale naturally, without force", "duration": 4, "count": "1-2-3-4" },
        { "phase": "hold_in", "instruction": "Allow natural pause", "duration": 2, "count": "1-2" },
        { "phase": "exhale", "instruction": "Exhale completely, letting go", "duration": 5, "count": "1-2-3-4-5" },
        { "phase": "hold_out", "instruction": "Rest in the space between breaths", "duration": 2, "count": "1-2" }
    ],
    "animation": {
        "duration": 600,
        "loops": true,
        "blend_in": 1.0,
        "blend_out": 0.5,
        "keyframes": [
            { "time": 0, "voice_cue": "Lie down on your back", "body_state": {} },
            { "time": 30, "voice_cue": "Extend your legs fully", "body_state": {} },
            { "time": 60, "voice_cue": "Let your arms rest by your sides", "body_state": {} },
            { "time": 90, "voice_cue": "Turn palms upward, releasing tension", "body_state": {} }
        ],
        "transitions": []
    },
    "voiceInstructions": [
        { "phase": "Setup", "script": "Lie down on your back, allowing your legs to extend fully. Let your feet fall open naturally, without forcing them.", "duration": 8 },
        { "phase": "Arms", "script": "Place your arms alongside your body, about 45 degrees from your torso. Turn your palms upward, opening to receive.", "duration": 8 },
        { "phase": "Head", "script": "Position your head so your nose is pointing straight up toward the ceiling. Allow your chin to relax slightly toward your chest.", "duration": 6 },
        { "phase": "Eyes", "script": "Close your eyes softly. Let your eyelids relax completely.", "duration": 5 },
        { "phase": "Body Scan", "script": "Bring your attention to your toes. Relax them completely. Now move your attention to your ankles, releasing all tension. Continue moving up through your calves, knees, and thighs.", "duration": 30 },
        { "phase": "Relaxation", "script": "Let your breath move naturally. Don't control it. Simply observe as your body rests more deeply with each exhale.", "duration": 60 },
        { "phase": "Closing", "script": "In your own time, begin to deepen your breath. When you're ready, gently wiggle your fingers and toes. Roll onto your side and slowly come up to a seated position.", "duration": 15 }
    ],
    "visuals": {
        "thumbnail_url": "/assets/poses/savasana/thumbnail.jpg",
        "front_view_url": "/assets/poses/savasana/front.jpg",
        "side_view_url": "/assets/poses/savasana/side.jpg"
    },
    "energetics": {
        "chakras": ["Muladhara (Root)", "Anahata (Heart)", "Sahasrara (Crown)"],
        "nadis": ["All nadis balanced"],
        "dosha": "all",
        "bandhas": []
    },
    "sequences": {
        "common_in": ["End of any yoga practice", "Meditation", "Deep relaxation"],
        "common_out": ["Seated meditation", "Transition to daily activities"],
        "flow_category": "Final Relaxation"
    },
    "mastery": {
        "milestones": [
            { "level": 1,Stay in pose "requirement": " for 5 minutes", "badge": "Savasana Beginner" },
            { "level": 2, "requirement": "Complete relaxation for 10+ minutes", "badge": "Savasana Practitioner" },
            { "level": 3, "requirement": "Lead others through guided Savasana", "badge": "Savasana Teacher" }
        ],
        "prerequisites": [],
        "next_poses": ["pose_setubandhasana_001", "pose_suptabaddhakonasana_001"]
    }
}
```

**[REMAINING SUPINE POSES - 15+ more poses including:]**
- Setu Bandhasana (Bridge Pose)
- Supta Baddha Konasana (Reclined Butterfly)
- Supta Matsyendrasana (Supine Spinal Twist)
- Viparita Karani (Legs Up Wall)
- Janu Sirsasana (Supine Head-to-Knee)
- Pavanamuktasana (Wind-Relieving Pose)
- Ardha Halasana (Half Plow Pose)
- Halasana (Plow Pose)
- Karnapidasana (Ear-to-Knee Pose)
- Supta Padangusthasana (Reclined Big Toe Pose)
- And many more...

#### 5.2.4 Prone Poses (Category: Prone)

**Bhujangasana (Cobra Pose)**

```json
{
    "id": "pose_bhujangasana_001",
    "slug": "cobra-pose",
    "name": {
        "sanskrit": "भुजङ्गासन",
        "english": "Cobra Pose",
        "pronunciation": "boo-jahn-GAHS-uh-nah"
    },
    "category": {
        "primary": "prone",
        "secondary": ["backbend", "heart_opener"],
        "family": "Backbend Poses",
        "level": "beginner_1"
    },
    "description": {
        "summary": "A gentle backbend that strengthens the spine and opens the chest.",
        "detailed": "Lie face down with legs extended. Place your hands under your shoulders, elbows close to your body. Press the tops of your feet and thighs into the floor. Inhale and lift your chest off the floor, using your back muscles rather than pushing with your hands.",
        "intention": "Open your heart and embrace the world with courage."
    },
    "mechanics": {
        "joints": {
            "spine": { "position": "extension", "range_of_motion": "controlled extension", "contraindications": ["back injuries"] },
            "shoulders": { "position": "flexion, retracted", "range_of_motion": "partial flexion", "contraindications": [] },
            "elbows": { "position": "slight flexion", "range_of_motion": "light bend", "contraindications": [] },
            "hips": { "position": "neutral", "range_of_motion": "neutral", "contraindications": [] }
        },
        "muscles": {
            "target": ["erector spinae", "glutes", "hamstrings"],
            "stretch": ["abdominals", "hip flexors"],
            "engage": ["spinal extensors", "glutes", "trapezius"]
        },
        "alignment": [
            { "body_part": "Hands", "cue": "Press into hands to support, not to lift", "priority": "critical" },
            { "body_part": "Elbows", "cue": "Keep elbows close to body, slightly bent", "priority": "important" },
            { "body_part": "Legs", "cue": "Active and engaged, pressing down", "priority": "important" },
            { "body_part": "Neck", "cue": "Keep neutral, gaze at floor or slight lift", "priority": "important" }
        ]
    },
    "benefits": {
        "physical": ["Strengthens spine", "Stretches chest and lungs", "Firms buttocks"],
        "energetic": ["Opens heart center", "Increases energy"],
        "mental": ["Soothes sciatica", "Reduces fatigue"],
        "therapeutic": ["Asthma", "Weak back", "Slipped disc"]
    },
    "contraindications": {
        "general": ["Back injuries - use baby cobra or avoid", "Pregnancy - avoid deep backbends"],
        "pregnancy": [],
        "injuries": ["Carpal tunnel - modify", "Wrist injuries - avoid"],
        "conditions": ["Herniated disc", "Spondylitis"]
    },
    "modifications": [
        {
            "level": "supported",
            "description": "Baby Cobra - lift only chest, keep elbows on floor",
            "props_required": [],
            "visual_cue": "Less intense for beginners or injuries"
        },
        {
            "level": "supported",
            "description": "Place forearms on floor for Sphinx Pose",
            "props_required": [],
            "visual_cue": "Forearms provide support, gentler backbend"
        }
    ],
    "variations": [
        {
            "name": "Upward Facing Dog",
            "difficulty": "intermediate_3",
            "description": "Straighten arms completely, legs lifted"
        },
        {
            "name": "Sphinx Pose",
            "difficulty": "beginner_1",
            "description": "Rest on forearms instead of hands"
        }
    ],
    "breathing": [
        { "phase": "inhale", "instruction": "Inhale as you lift your chest", "duration": 4, "count": "1-2-3-4" },
        { "phase": "hold_in", "instruction": "Brief pause at top", "duration": 2, "count": "1-2" },
        { "phase": "exhale", "instruction": "Exhale as you release down", "duration": 4, "count": "1-2-3-4" },
        { "phase": "hold_out", "instruction": "Rest before next round", "duration": 2, "count": "1-2" }
    ],
    "animation": {
        "duration": 30,
        "loops": true,
        "blend_in": 0.5,
        "blend_out": 0.5,
        "keyframes": [
            { "time": 0, "voice_cue": "Lie face down", "body_state": {} },
            { "time": 5, "voice_cue": "Place hands under shoulders", "body_state": {} },
            { "time": 10, "voice_cue": "Press down through thighs", "body_state": {} },
            { "time": 15, "voice_cue": "Inhale and lift chest", "body_state": {} },
            { "time": 25, "voice_cue": "Gaze at floor, neck neutral", "body_state": {} }
        ],
        "transitions": [
            { "from_pose": "pose_adho_mukha_svanasana_001", "transition_duration": 2, "intermediate_steps": ["lower_chest", "slide_hands_back", "roll_to_belly"] }
        ]
    },
    "voiceInstructions": [
        { "phase": "Setup", "script": "Lie face down on your mat with your legs extended and the tops of your feet pressing into the floor.", "duration": 5 },
        { "phase": "Hands", "script": "Place your hands under your shoulders, keeping your elbows close to your body like puppy dog ears.", "duration": 6 },
        { "phase": "Legs", "script": "Press the tops of your thighs and your pubic bone firmly into the floor. This provides a stable base for your backbend.", "duration": 8 },
        { "phase": "Lift", "script": "Inhale and begin to lift your chest off the floor. Use your back muscles to create the curve, using your hands only for support.", "duration": 8 },
        { "phase": "Arms", "script": "Keep your elbows slightly bent rather than locking them out. Your arms are there to support, not to push you up.", "duration": 6 },
        { "phase": "Neck", "script": "Keep your neck neutral, gazing at the floor rather than tilting your head back. This protects your cervical spine.", "duration": 5 },
        { "phase": "Breath", "script": "Hold the pose for 2-3 breaths, breathing smoothly. Then exhale and release back down.", "duration": 10 }
    ],
    "visuals": {
        "thumbnail_url": "/assets/poses/bhujangasana/thumbnail.jpg",
        "front_view_url": "/assets/poses/bhujangasana/front.jpg",
        "side_view_url": "/assets/poses/bhujangasana/side.jpg"
    },
    "energetics": {
        "chakras": ["Muladhara (Root)", "Svadhisthana (Sacral)", "Anahata (Heart)"],
        "nadis": ["Sushumna", "Ida", "Pingala"],
        "dosha": "kapha",
        "bandhas": ["Uddiyana Bandha"]
    },
    "sequences": {
        "common_in": ["Adho Mukha Svanasana", "Balasana"],
        "common_out": ["Adho Mukha Svanasana", "Balasana", "Bhujangasana variations"],
        "flow_category": "Sun Salutation A - Prone"
    },
    "mastery": {
        "milestones": [
            { "level": 1, "requirement": "Lift chest with breath for 3 rounds", "badge": "Cobra Beginner" },
            { "level": 2, "requirement": "Hold Baby Cobra for 30 seconds", "badge": "Cobra Practitioner" },
            { "level": 3, "requirement": "Full Cobra with arms extended", "badge": "Cobra Master" }
        ],
        "prerequisites": ["pose_adho_mukha_svanasana_001"],
        "next_poses": ["pose_urdhva_mukha_svanasana_001", "pose_dhanurasana_001"]
    }
}
```

**[REMAINING PRONE POSES - 15+ more poses including:]**
- Dhanurasana (Bow Pose)
- Salabhasana (Locust Pose)
- Makarasana (Crocodile Pose)
- Bhekasana (Frog Pose)
- Dwi Pada Sirsasana (Double Head to Knee)
- And many more...

#### 5.2.5 Inversion Poses (Category: Inversion)

**Sirsasana (Headstand)**

```json
{
    "id": "pose_sirsasana_001",
    "slug": "headstand",
    "name": {
        "sanskrit": "शीर्षासन",
        "english": "Headstand",
        "pronunciation": "sheer-SHAHS-uh-nah"
    },
    "category": {
        "primary": "inversion",
        "secondary": ["balance", "strength", "restorative"],
        "family": "Inversion Poses",
        "level": "expert_5"
    },
    "description": {
        "summary": "Known as the King of Asanas, Headstand is an advanced inversion that reverses blood flow and builds core strength.",
        "detailed": "Interlace fingers and place forearms on floor. Place crown of head on floor, cradled by hands. Lift knees off floor and walk feet toward head. Slowly lift legs to vertical, engaging core and hip flexors. Hold the pose while breathing smoothly.",
        "intention": "Gain a new perspective on life by turning things upside down."
    },
    "mechanics": {
        "joints": {
            "head_neck": { "position": "neutral flexion", "range_of_motion": "limited, supported", "contraindications": ["neck injuries"] },
            "shoulders": { "position": "flexion, weight-bearing", "range_of_motion": "90° flexion", "contraindications": [] },
            "spine": { "position": "vertical, engaged", "range_of_motion": "neutral", "contraindications": [] },
            "hips": { "position": "flexion to vertical", "range_of_motion": "full flexion", "contraindications": [] }
        },
        "muscles": {
            "target": ["core", "shoulders", "hip flexors"],
            "stretch": ["spine (decompression)", "shoulders"],
            "engage": ["core", "shoulders", "quadriceps", "glutes"]
        },
        "alignment": [
            { "body_part": "Head", "cue": "Crown on floor, not back of head", "priority": "critical" },
            { "body_part": "Forearms", "cue": "Press forearms down actively", "priority": "critical" },
            { "body_part": "Hands", "cue": "Interlaced fingers create shelf for head", "priority": "important" },
            { "body_part": "Legs", "cue": "Engage and lift to vertical", "priority": "critical" },
            { "body_part": "Core", "cue": "Engage throughout to protect spine", "priority": "critical" }
        ]
    },
    "benefits": {
        "physical": ["Strengthens arms, legs, spine", "Stretches lungs", "Calms nervous system"],
        "energetic": ["Stimulates pituitary and pineal glands", "Energizes"],
        "mental": ["Improves concentration", "Calms anxiety"],
        "therapeutic": ["Digestive issues", "Insomnia", "Mild depression"]
    },
    "contraindications": {
        "general": ["Neck injuries - absolutely avoid", "High blood pressure - avoid", "Heart conditions - avoid"],
        "pregnancy": ["Avoid completely"],
        "injuries": ["Back injuries", "Wrist injuries", "Eye conditions"],
        "conditions": ["Glaucoma", "Detached retina", "Stroke history"]
    },
    "modifications": [
        {
            "level": "supported",
            "description": "Tripod Headstand - hands hold head instead of interlacing",
            "props_required": ["Wall for reference"],
            "visual_cue": "Wall helps with balance and alignment"
        },
        {
            "level": "supported",
            "description": "Dolphin Pose prep - practice with feet on wall",
            "props_required": ["Wall"],
            "visual_cue": "Builds shoulder strength safely"
        },
        {
            "level": "supported",
            "description": "Supported Headstand with wall behind",
            "props_required": ["Wall"],
            "visual_cue": "Wall provides balance support"
        }
    ],
    "variations": [
        {
            "name": "Tripod Headstand",
            "difficulty": "advanced_4",
            "description": "Hands cradling head instead of interlaced"
        },
        {
            "name": "Forearm Headstand",
            "difficulty": "advanced_4",
            "description": "Forearms on floor, no hands"
        }
    ],
    "breathing": [
        { "phase": "inhale", "instruction": "Inhale as you prepare to lift", "duration": 4, "count": "1-2-3-4" },
        { "phase": "hold_in", "instruction": "Steady breath as you hold", "duration": 3, "count": "1-2-3" },
        { "phase": "exhale", "instruction": "Exhale steadily", "duration": 4, "count": "1-2-3-4" },
        { "phase": "hold_out", "instruction": "Maintain breath awareness", "duration": 3, "count": "1-2-3" }
    ],
    "animation": {
        "duration": 120,
        "loops": true,
        "blend_in": 1.0,
        "blend_out": 1.0,
        "keyframes": [
            { "time": 0, "voice_cue": "Kneel and interlace fingers", "body_state": {} },
            { "time": 20, "voice_cue": "Place crown of head on floor", "body_state": {} },
            { "time": 40, "voice_cue": "Walk feet toward head", "body_state": {} },
            { "time": 60, "voice_cue": "Engage core and lift legs", "body_state": {} },
            { "time": 80, "voice_cue": "Stack hips over shoulders", "body_state": {} }
        ],
        "transitions": []
    },
    "voiceInstructions": [
        { "phase": "Setup", "script": "Kneel at the wall and interlace your fingers, placing your forearms on the floor. Your elbows should be shoulder-width apart.", "duration": 10 },
        { "phase": "Head Position", "script": "Place the crown of your head on the floor, cradling the back of your head with your interlaced hands. Never put weight on your neck.", "duration": 10 },
        { "phase": "Pre-lift", "script": "Lift your knees off the floor and walk your feet toward your head. Your hips will begin to shift forward.", "duration": 15 },
        { "phase": "The Lift", "script": "Inhale and engage your core. Slowly lift your legs toward the ceiling, keeping them together. Your body should be in one straight line.", "duration": 15 },
        { "phase": "Alignment", "script": "Stack your hips directly over your shoulders, which should be directly over your head. Engage your thighs and point your toes.", "duration": 10 },
        { "phase": "Breath", "script": "Breathe smoothly and steadily. Begin with 30 seconds and build up to 3 minutes over time.", "duration": 8 },
        { "phase": "Release", "script": "To come down, exhale and slowly lower your legs back to the floor. Rest in Child's Pose for several breaths.", "duration": 10 }
    ],
    "visuals": {
        "thumbnail_url": "/assets/poses/sirsasana/thumbnail.jpg",
        "front_view_url": "/assets/poses/sirsasana/front.jpg",
        "side_view_url": "/assets/poses/sirsasana/side.jpg"
    },
    "energetics": {
        "chakras": ["Sahasrara (Crown)", "Ajna (Third Eye)", "Vishuddha (Throat)"],
        "nadis": ["Sushumna", "Ida", "Pingala"],
        "dosha": "all",
        "bandhas": ["Mula Bandha", "Uddiyana Bandha", "Jalandhara Bandha"]
    },
    "sequences": {
        "common_in": ["Dolphin Pose", "Adho Mukha Svanasana"],
        "common_out": ["Balasana", "Adho Mukha Svanasana"],
        "flow_category": "Advanced Inversions"
    },
    "mastery": {
        "milestones": [
            { "level": 1, "requirement": "Hold Dolphin Pose for 1 minute", "badge": "Headstand Prep" },
            { "level": 2, "requirement": "Tripod Headstand with wall support", "badge": "Headstand Beginner" },
            { "level": 3, "requirement": "Full Headstand with 30 second hold", "badge": "Headstand Practitioner" },
            { "level": 4, "requirement": "Full Headstand with 3 minute hold", "badge": "Headstand Master" }
        ],
        "prerequisites": ["pose_adho_mukha_svanasana_001", "pose_dolphin_001", "pose_urdhva_dandasana_001"],
        "next_poses": ["pose_sarvangasana_001", "pose_plow_pose_001"]
    }
}
```

**[REMAINING INVERSION POSES - 10+ more poses including:]**
- Sarvangasana (Shoulder Stand)
- Halasana (Plow Pose)
- Karnapidasana (Ear-to-Knee Pose)
- Matsyasana (Fish Pose)
- And many more...

### 5.3 Pose Database Implementation

#### 5.3.1 Database Schema (PostgreSQL)

```sql
-- Yoga Pose Database Schema
-- Database: ConsciousOS Yoga Database
-- Version: 1.0

-- ENUM Types
CREATE TYPE pose_category AS ENUM (
    'standing', 'seated', 'supine', 'prone', 'inversion',
    'balance', 'twist', 'forward_fold', 'backbend',
    'hip_opener', 'heart_opener', 'restorative'
);

CREATE TYPE difficulty_level AS ENUM (
    'beginner_1', 'beginner_2', 'intermediate_3',
    'advanced_4', 'expert_5'
);

-- Main Pose Table
CREATE TABLE yoga_poses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Naming Information
    sanskrit_name VARCHAR(200) NOT NULL,
    english_name VARCHAR(200) NOT NULL,
    pronunciation VARCHAR(200),
    alternative_names TEXT[],
    
    -- Categorization
    primary_category pose_category NOT NULL,
    secondary_categories pose_category[],
    family VARCHAR(100),
    difficulty difficulty_level NOT NULL,
    
    -- Description
    summary TEXT NOT NULL,
    detailed_description TEXT NOT NULL,
    intention TEXT,
    
    -- Benefits
    physical_benefits TEXT[],
    energetic_benefits TEXT[],
    mental_benefits TEXT[],
    therapeutic_benefits TEXT[],
    
    -- Contraindications
    general_contraindications TEXT[],
    pregnancy_contraindications TEXT[],
    injury_contraindications TEXT[],
    condition_contraindications TEXT[],
    
    -- Body Mechanics (JSON)
    mechanics JSONB NOT NULL,
    
    -- Breathing Pattern (JSON)
    breathing_pattern JSONB NOT NULL,
    
    -- Animation Data (JSON)
    animation_data JSONB NOT NULL,
    
    -- Visual References
    thumbnail_url VARCHAR(500),
    front_view_url VARCHAR(500),
    side_view_url VARCHAR(500),
    model_3d_id UUID,
    
    -- Energetics
    chakras TEXT[],
    dosha VARCHAR(20),
    bandhas TEXT[],
    
    -- Sequence Information
    common_poses_in UUID[],
    common_poses_out UUID[],
    flow_category VARCHAR(100),
    
    -- Mastery Tracking
    prerequisites UUID[],
    next_poses UUID[],
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE
);

-- Pose Variations Table
CREATE TABLE pose_variations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pose_id UUID REFERENCES yoga_poses(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    difficulty difficulty_level,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pose Modifications Table
CREATE TABLE pose_modifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pose_id UUID REFERENCES yoga_poses(id) ON DELETE CASCADE,
    level VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    props_required TEXT[],
    visual_cue TEXT,
    duration_adjustment INTEGER
);

-- Voice Instructions Table
CREATE TABLE voice_instructions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pose_id UUID REFERENCES yoga_poses(id) ON DELETE CASCADE,
    phase VARCHAR(100) NOT NULL,
    script TEXT NOT NULL,
    audio_file_url VARCHAR(500),
    duration_seconds INTEGER,
    trigger_type VARCHAR(50),
    ordering INTEGER
);

-- Alignment Cues Table
CREATE TABLE alignment_cues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pose_id UUID REFERENCES yoga_poses(id) ON DELETE CASCADE,
    body_part VARCHAR(100) NOT NULL,
    instruction TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL,
    ordering INTEGER
);

-- Mastery Milestones Table
CREATE TABLE mastery_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pose_id UUID REFERENCES yoga_poses(id) ON DELETE CASCADE,
    level INTEGER NOT NULL,
    requirement TEXT NOT NULL,
    badge_name VARCHAR(200),
    badge_icon_url VARCHAR(500)
);

-- Indexes for Performance
CREATE INDEX idx_yoga_poses_slug ON yoga_poses(slug);
CREATE INDEX idx_yoga_poses_category ON yoga_poses(primary_category);
CREATE INDEX idx_yoga_poses_difficulty ON yoga_poses(difficulty);
CREATE INDEX idx_yoga_poses_family ON yoga_poses(family);
CREATE INDEX idx_yoga_poses_search ON yoga_poses USING GIN (
    to_tsvector('english', sanskrit_name || ' ' || english_name || ' ' || COALESCE(alternative_names, '')
);

-- Full-Text Search Function
CREATE FUNCTION search_poses(search_query TEXT) RETURNS TABLE (
    id UUID,
    sanskrit_name VARCHAR,
    english_name VARCHAR,
    difficulty difficulty_level,
    primary_category pose_category,
    rank FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.sanskrit_name,
        p.english_name,
        p.difficulty,
        p.primary_category,
        ts_rank(p.search_vector, plainto_tsquery('english', search_query)) AS rank
    FROM (
        SELECT id, sanskrit_name, english_name, difficulty, primary_category,
               setweight(to_tsvector('english', sanskrit_name), 'A') ||
               setweight(to_tsvector('english', english_name), 'A') ||
               setweight(to_tsvector('english', COALESCE(alternative_names, '')), 'B') AS search_vector
        FROM yoga_poses
    ) p
    WHERE p.search_vector @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;
```

#### 5.3.2 API Endpoints

```typescript
// API Routes for Pose Database
// File: src/api/routes/poses.ts

import { Router, Request, Response } from 'express';
import { PoseRepository } from '../repositories/pose.repository';
import { PoseService } from '../services/pose.service';

const router = Router();
const poseRepository = new PoseRepository();
const poseService = new PoseService(poseRepository);

// GET /api/poses - List all poses with filtering
router.get('/', async (req: Request, res: Response) => {
    try {
        const filters = {
            category: req.query.category as string,
            difficulty: req.query.difficulty as string,
            family: req.query.family as string,
            chakra: req.query.chakra as string,
            search: req.query.search as string,
            limit: parseInt(req.query.limit as string) || 20,
            offset: parseInt(req.query.offset as string) || 0
        };

        const poses = await poseService.getPoses(filters);
        const total = await poseService.countPoses(filters);

        res.json({
            success: true,
            data: poses,
            pagination: {
                total,
                limit: filters.limit,
                offset: filters.offset,
                has_more: filters.offset + filters.limit < total
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/poses/:slug - Get single pose by slug
router.get('/:slug', async (req: Request, res: Response) => {
    try {
        const pose = await poseService.getPoseBySlug(req.params.slug);
        
        if (!pose) {
            return res.status(404).json({ 
                success: false, 
                error: 'Pose not found' 
            });
        }

        // Get related data
        const [variations, modifications, instructions, cues] = await Promise.all([
            poseService.getPoseVariations(pose.id),
            poseService.getPoseModifications(pose.id),
            poseService.getVoiceInstructions(pose.id),
            poseService.getAlignmentCues(pose.id)
        ]);

        res.json({
            success: true,
            data: {
                ...pose,
                variations,
                modifications,
                voice_instructions: instructions,
                alignment_cues: cues
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/poses/:id/sequence - Get sequence for pose
router.get('/:id/sequence', async (req: Request, res: Response) => {
    try {
        const sequence = await poseService.getPoseSequence(
            req.params.id,
            req.query.direction as 'forward' | 'backward' || 'forward'
        );

        res.json({
            success: true,
            data: sequence
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/poses/categories - Get all categories
router.get('/meta/categories', async (req: Request, res: Response) => {
    try {
        const categories = await poseService.getAllCategories();
        res.json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/poses/families - Get all pose families
router.get('/meta/families', async (req: Request, res: Response) => {
    try {
        const families = await poseService.getAllFamilies();
        res.json({ success: true, data: families });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
```

---

## 6. Animation System Design

### 6.1 Animation Pipeline

#### 6.1.1 Motion Capture Setup

```cpp
// AnimationSystem.h
#pragma once

#include "CoreMinimal.h"
#include "Animation/AnimInstance.h"
#include "Animation/AnimationAsset.h"
#include "Animation/Skeleton.h"
#include "Animation/BlendSpace.h"
#include "Animation/AnimMontage.h"
#include "AnimationSystem.generated.h"

UENUM(BlueprintType)
enum class EAnimationType : uint8
{
    Idle,
    Transition,
    Pose,
    Breathing,
    Instruction,
    Feedback,
    Celebration
};

USTRUCT(BlueprintType)
struct FAnimationClip
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    UAnimSequenceBase* AnimationAsset;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float BlendInTime;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float BlendOutTime;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float PlayRate;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    bool bLoop;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    EAnimationType AnimationType;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FName PoseName;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    TArray<FAnimationClip> Transitions;
};

USTRUCT(BlueprintType)
struct FPoseState
{
    GENERATED_BODY()

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FName CurrentPose;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    FName TargetPose;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float TransitionProgress;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float HoldTime;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    float BreathingCycle;

    UPROPERTY(EditAnywhere, BlueprintReadWrite)
    bool bIsTransitioning;
};

UCLASS()
class YOGAINSTRUCTOR_API UYogaAnimationSystem : public UActorComponent
{
    GENERATED_BODY()

public:
    UYogaAnimationSystem();

    // Play a yoga pose animation
    UFUNCTION(BlueprintCallable, Category = "Animation")
    void PlayPose(FName PoseName, float BlendDuration = 0.5f);

    // Transition between poses
    UFUNCTION(BlueprintCallable, Category = "Animation")
    void TransitionToPose(FName TargetPose, float Duration = 2.0f);

    // Sync breathing animation
    UFUNCTION(BlueprintCallable, Category = "Animation")
    void SyncBreathing(float Rate, EBreathingPhase Phase);

    // Play instruction gesture
    UFUNCTION(BlueprintCallable, Category = "Animation")
    void PlayInstructionGesture(FName GestureName);

    // Start continuous breathing cycle
    UFUNCTION(BlueprintCallable, Category = "Animation")
    void StartBreathingLoop(float CycleDuration = 4.0f);

protected:
    virtual void BeginPlay() override;
    virtual void TickComponent(float DeltaTime, ELevelTick TickType, FActorComponentTickFunction* ThisTickFunction) override;

private:
    // Animation instances
    UPROPERTY()
    UAnimInstance* BodyAnimInstance;

    UPROPERTY()
    UAnimInstance* FaceAnimInstance;

    // Current pose state
    FPoseState CurrentState;

    // Pose animation database
    TMap<FName, FAnimationClip> PoseAnimations;

    // Transition animations
    TMap<FName, TArray<FAnimationClip>> TransitionAnimations;

    // Breathing animation
    UPROPERTY()
    UAnimSequenceBase* BreathingInAnim;

    UPROPERTY()
    UAnimSequenceBase* BreathingOutAnim;

    // Animation blending
    float CurrentBlendAlpha;
    FName CurrentBlendTarget;
    
    // Initialize pose database
    void InitializePoseDatabase();

    // Update breathing animation
    void UpdateBreathing(float DeltaTime);

    // Calculate transition blend
    void UpdateTransition(float DeltaTime);
};
```

### 6.2 Animation Database (100+ Poses)

```json
{
    "animation_database": {
        "version": "1.0",
        "character_rig": "MetaHuman_FullBody_v1.2",
        "frame_rate": 60,
        "total_poses": 100,
        
        "standing_poses": {
            "tadasana": {
                "file": "animations/standing/tadasana.uanimseq",
                "duration": 60.0,
                "loops": true,
                "blend_time": 0.5,
                "key_poses": ["start", "hold_30s", "end"],
                "facial_animation": "neutral",
                "breathing_sync": true,
                "audio_cue": "tadasana_voice.mp3"
            },
            "virabhadrasana_i": {
                "file": "animations/standing/virabhadrasana_i.uanimseq",
                "duration": 45.0,
                "loops": true,
                "blend_time": 0.75,
                "key_poses": ["entry", "setup", "raise_arms", "hold", "exit"],
                "facial_animation": "concentrated",
                "breathing_sync": true,
                "audio_cue": "warrior_i_voice.mp3"
            }
        },
        
        "seated_poses": {
            "sukhasana": {
                "file": "animations/seated/sukhasana.uanimseq",
                "duration": 120.0,
                "loops": true,
                "blend_time": 0.5,
                "key_poses": ["cross_legs", "settle", "meditate", "release"],
                "facial_animation": "peaceful",
                "breathing_sync": true,
                "audio_cue": "easy_pose_voice.mp3"
            },
            "padmasana": {
                "file": "animations/seated/padmasana.uanimseq",
                "duration": 180.0,
                "loops": true,
                "blend_time": 1.0,
                "key_poses": ["setup", "cross_ankles", "balance_knees", "settle", "hold"],
                "facial_animation": "peaceful",
                "breathing_sync": true,
                "audio_cue": "lotus_pose_voice.mp3"
            }
        },
        
        "transitions": {
            "standing_to_seated": {
                "file": "animations/transitions/stand_to_seat.uanimseq",
                "duration": 2.0,
                "audio_cue": "transition_whoosh.mp3"
            },
            "seated_to_supine": {
                "file": "animations/transitions/seat_to_supine.uanimseq",
                "duration": 1.5,
                "audio_cue": "transition_soft.mp3"
            },
            "supine_to_prone": {
                "file": "animations/transitions/supine_to_prone.uanimseq",
                "duration": 2.0,
                "audio_cue": "transition_flip.mp3"
            }
        },
        
        "breathing_animations": {
            "deep_breath_in": {
                "file": "animations/breathing/breath_in.uanimseq",
                "duration": 4.0,
                "loop": false
            },
            "deep_breath_out": {
                "file": "animations/breathing/breath_out.uanimseq",
                "duration": 4.0,
                "loop": false
            },
            "breath_hold": {
                "file": "animations/breathing/breath_hold.uanimseq",
                "duration": 2.0,
                "loop": false
            }
        },
        
        "instruction_gestures": {
            "point_up": {
                "file": "animations/gestures/point_up.uanimseq",
                "duration": 1.0
            },
            "open_arms": {
                "file": "animations/gestures/open_arms.uanimseq",
                "duration": 1.5
            },
            "wave_in": {
                "file": "animations/gestures/wave_in.uanimseq",
                "duration": 2.0
            },
            "encourage": {
                "file": "animations/gestures/encourage.uanimseq",
                "duration": 1.0
            }
        }
    }
}
```

### 6.3 Animation Blending System

```cpp
// AnimationBlending.cpp
#include "AnimationBlending.h"

void UYogaAnimationSystem::PlayPose(FName PoseName, float BlendDuration)
{
    if (!PoseAnimations.Contains(PoseName))
    {
        UE_LOG(LogYogaAnimation, Warning, TEXT("Pose %s not found in database"), *PoseName.ToString());
        return;
    }

    FAnimationClip TargetClip = PoseAnimations[PoseName];
    
    // Start transition
    CurrentState.TargetPose = PoseName;
    CurrentState.bIsTransitioning = true;
    CurrentState.TransitionProgress = 0.0f;
    
    // Calculate blend
    float BlendAlpha = 0.0f;
    PlayNewAnimation(TargetClip.AnimationAsset, BlendAlpha, BlendDuration);
    
    // Sync breathing
    StartBreathingLoop(4.0f); // Standard 4-count breath
    
    UE_LOG(LogYogaAnimation, Log, TEXT("Playing pose: %s"), *PoseName.ToString());
}

void UYogaAnimationSystem::TransitionToPose(FName TargetPose, float Duration)
{
    // Get current pose animation
    FAnimationClip CurrentClip = PoseAnimations[CurrentState.CurrentPose];
    
    // Find or create transition animation
    FString TransitionKey = FString::Printf(TEXT("%s_to_%s"), 
        *CurrentState.CurrentPose.ToString(), *TargetPose.ToString());
    
    if (TransitionAnimations.Contains(TransitionKey))
    {
        // Play pre-made transition
        PlayTransition(TransitionAnimations[TransitionKey], Duration);
    }
    else
    {
        // Create procedural blend
        BlendBetweenPoses(CurrentClip.AnimationAsset, 
                         PoseAnimations[TargetPose].AnimationAsset, 
                         Duration);
    }
    
    CurrentState.TargetPose = TargetPose;
    CurrentState.TransitionProgress = 0.0f;
    CurrentState.bIsTransitioning = true;
}

void UYogaAnimationSystem::UpdateBreathing(float DeltaTime)
{
    CurrentState.BreathingCycle += DeltaTime;
    
    // Calculate breathing phase (4 second cycle)
    float Phase = FMath::Fmod(CurrentState.BreathingCycle, 4.0f);
    
    EBreathingPhase CurrentPhase;
    UAnimSequenceBase* TargetAnimation;
    
    if (Phase < 1.0f) // Inhale first half
    {
        CurrentPhase = EBreathingPhase::Inhale;
        TargetAnimation = BreathingInAnim;
    }
    else if (Phase < 2.0f) // Inhale second half
    {
        CurrentPhase = EBreathingPhase::Inhale;
        TargetAnimation = BreathingInAnim;
    }
    else if (Phase < 3.0f) // Exhale first half
    {
        CurrentPhase = EBreathingPhase::Exhale;
        TargetAnimation = BreathingOutAnim;
    }
    else // Exhale second half
    {
        CurrentPhase = EBreathingPhase::Exhale;
        TargetAnimation = BreathingOut