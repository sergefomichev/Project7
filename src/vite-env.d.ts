/// <reference types="vite/client" />

declare module "shaders/react" {
  import type { ComponentType, ReactNode } from "react";

  export const Shader: ComponentType<{ children?: ReactNode; className?: string }>;
  export const Swirl: ComponentType<Record<string, unknown>>;
  export const ChromaFlow: ComponentType<Record<string, unknown>>;
  export const FilmGrain: ComponentType<Record<string, unknown>>;
  export const FlutedGlass: ComponentType<Record<string, unknown>>;
}
