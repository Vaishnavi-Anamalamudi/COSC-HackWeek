export const FALLBACK_MODELS = ["llama3", "mistral", "gemma", "phi3", "deepseek-r1", "codellama"];

export const PROMPT_TEMPLATES = [
  {
    title: "Debug code",
    prompt: "Act as a senior engineer. Find the likely bug, explain it briefly, and propose a clean fix.",
  },
  {
    title: "Summarize",
    prompt: "Summarize this into the key ideas, action items, and open questions.",
  },
  {
    title: "Plan project",
    prompt: "Create a practical implementation plan with milestones, risks, and validation steps.",
  },
];
