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
import { Ceremony } from "@/scenes/05-ceremony/Ceremony";
import { Celebration } from "@/scenes/06-celebration/Celebration";
import { Details } from "@/scenes/07-details/Details";
import { Closing } from "@/scenes/08-closing/Closing";

/**
 * The invitation: nine chapters over one continuous world (Sky + WebGL Stage).
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
        <Ceremony />
        <Celebration />
        <Details />
        <Closing />
      </main>
    </ScrollProvider>
  );
}
