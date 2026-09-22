"use client";

import dynamic from "next/dynamic";

/** The whole WebGL layer is code-split and never rendered on the server. */
export const StageClient = dynamic(() => import("./Stage"), { ssr: false });
