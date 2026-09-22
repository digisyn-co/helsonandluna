"use client";

import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ease, dur } from "@/animation/tokens";

if (typeof window !== "undefined") {
  gsap.registerPlugin(DrawSVGPlugin, SplitText, useGSAP);
  gsap.defaults({ ease: ease.reveal, duration: dur.reveal });
}

export { gsap, DrawSVGPlugin, SplitText, useGSAP };
