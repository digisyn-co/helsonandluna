import { ScrollProvider } from "@/animation/ScrollProvider";
import { Sky } from "@/components/cinematic/Sky";
import { StageClient } from "@/components/cinematic/StageClient";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { Invitation } from "@/scenes/00-invitation/Invitation";
import { Beginning } from "@/scenes/01-beginning/Beginning";
import { TwoOfUs } from "@/scenes/02-two-of-us/TwoOfUs";
import { ThePromise } from "@/scenes/03-promise/Promise";
import { Family } from "@/scenes/04-family/Family";
import { Entourage } from "@/scenes/05-entourage/Entourage";
import { Ceremony } from "@/scenes/06-ceremony/Ceremony";
import { Celebration } from "@/scenes/07-celebration/Celebration";
import { Details } from "@/scenes/08-details/Details";
import { Closing } from "@/scenes/09-closing/Closing";

/**
 * The invitation: ten chapters over one continuous world (Sky + WebGL Stage).
 * Every fact is real DOM, so the page stays complete if WebGL or motion is unavailable.
 */
export default function Home() {
  return (
    <ScrollProvider>
      <LoadingScreen />
      <Sky />
      <StageClient />
      <ProgressIndicator />
      <main className="story">
        <Invitation />
        <Beginning />
        <TwoOfUs />
        <ThePromise />
        <Family />
        <Entourage />
        <Ceremony />
        <Celebration />
        <Details />
        <Closing />
      </main>
    </ScrollProvider>
  );
}
