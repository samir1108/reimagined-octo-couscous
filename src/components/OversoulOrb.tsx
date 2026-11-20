// Lazy-loaded Oversoul Orb components
// These wrap the original heavy WebGL implementation with React.lazy + Suspense
// The actual implementation is code-split into a separate chunk

export {
  OversoulOrbPageWrapper as OversoulOrbPage,
  OversoulOrbLauncherWrapper as OversoulOrbLauncher,
  OversoulOrbEmbedWrapper as OversoulOrbEmbed,
} from './LazyOrb';