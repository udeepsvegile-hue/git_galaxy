import { Component, Suspense, lazy, useCallback } from "react";
import { useAppStore, selectGalaxyConfig, selectPhase } from "@/hooks/useAppStore";
import LoadingScreen from "@/components/ui/LoadingScreen";
import LandingScreen from "@/components/ui/LandingScreen";
import ErrorOverlay from "@/components/overlays/ErrorOverlay";

const GalaxyScene = lazy(() => import("@/scenes/GalaxyScene"));

class SceneErrorBoundary extends Component<
  { onError: (error: Error) => void; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { onError: (error: Error) => void; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function SafeGalaxyScene() {
  const setPhase = useAppStore((s) => s.setPhase);
  const setError = useAppStore((s) => s.setError);

  const handleSceneError = useCallback(
    (error: Error) => {
      console.error("Galaxy scene render error:", error);
      setError({
        type: "unknown",
        message: `Galaxy render failed: ${error.message}`,
      });
      setPhase("error");
    },
    [setError, setPhase]
  );

  return (
    <SceneErrorBoundary onError={handleSceneError}>
      <Suspense fallback={<LoadingScreen />}>
        <GalaxyScene />
      </Suspense>
    </SceneErrorBoundary>
  );
}

export default function App() {
  const phase = useAppStore(selectPhase);
  const galaxyConfig = useAppStore(selectGalaxyConfig);

  return (
    <div className="app-root">
      {phase === "landing" && <LandingScreen />}
      {phase === "loading" && <LoadingScreen />}
      {(phase === "galaxy" || phase === "scanning") && (
        galaxyConfig ? <SafeGalaxyScene /> : <LoadingScreen />
      )}
      {phase === "error" && <ErrorOverlay />}

      {!["landing", "loading", "galaxy", "scanning", "error"].includes(phase) && (
        <LandingScreen />
      )}
    </div>
  );
}
