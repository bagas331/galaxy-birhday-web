/**
 * Visual QA: analyze screenshots of the 3D birthday universe with the
 * vision model and report issues. Run: bun scripts/visual-check.ts
 */
import ZAI from "z-ai-web-dev-sdk";
import fs from "fs";

const SHOTS: { file: string; label: string; ask: string }[] = [
  {
    file: "/tmp/render/intro.png",
    label: "INTRO",
    ask: "This is the intro screen of a romantic 3D galaxy birthday website. Describe what you see: Is there a title, subtitle, an ENTER button, a SKIP button? Is the cosmic background visible (stars/nebula)? Is text readable? Any layout problems (overlap, cutoff, misalignment)?",
  },
  {
    file: "/tmp/render/universe-v2.png",
    label: "UNIVERSE",
    ask: "This is the main 3D galaxy view of a birthday website. Describe: Do you see a central glowing star, several planets (some with rings), a starfield, nebula clouds, and a spiral galaxy of particles? Are there floating labels near the planets (like Birthday Planet, Memory Planet)? Are the planets well-lit (not too dark, not blown out)? Any visual problems?",
  },
  {
    file: "/tmp/render/birthday-panel.png",
    label: "BIRTHDAY PANEL",
    ask: "This is a birthday message panel over a 3D galaxy. Describe: Is there a title 'Happy Birthday' with a gold placeholder name, a message, a sender line? Is the panel readable over the 3D background? Any layout issues?",
  },
  {
    file: "/tmp/render/mobile-universe.png",
    label: "MOBILE UNIVERSE",
    ask: "This is the 3D galaxy birthday website on a mobile viewport (390x844). Describe: Is the layout usable - navigation bar at bottom, music controls, planet labels visible? Anything cut off or overlapping?",
  },
  {
    file: "/tmp/render/closing.png",
    label: "CLOSING",
    ask: "This is the closing scene of a 3D galaxy birthday website. Describe: Is there a closing message and a replay button? Does the camera view show the galaxy from far away? Is text readable? Any issues?",
  },
];

async function main() {
  const zai = await ZAI.create();
  for (const shot of SHOTS) {
    if (!fs.existsSync(shot.file)) {
      console.log(`--- ${shot.label}: FILE MISSING ---`);
      continue;
    }
    const base64 = fs.readFileSync(shot.file).toString("base64");
    try {
      const res = await zai.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: shot.ask },
              { type: "image_url", image_url: { url: `data:image/png;base64,${base64}` } },
            ],
          },
        ],
      });
      const answer = res?.choices?.[0]?.message?.content ?? "(no answer)";
      console.log(`\n========== ${shot.label} ==========`);
      console.log(answer.slice(0, 1200));
    } catch (err) {
      console.log(`--- ${shot.label}: VLM ERROR: ${String(err).slice(0, 200)} ---`);
    }
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
