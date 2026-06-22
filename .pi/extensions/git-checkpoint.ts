/**
 * Git Checkpoint Extension
 * 
 * Automatically commits after each block is approved.
 * Creates rollback points so you can always revert.
 * 
 * Workflow:
 * - After agent finishes, checks if git repo is dirty
 * - Shows a UI confirmation to checkpoint
 * - Creates a commit with a timestamp and optional message
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

let lastCommitHash: string | null = null;

export default function (pi: ExtensionAPI) {
  // Track dirty state on startup
  pi.on("session_start", async (_event, ctx) => {
    try {
      const { execSync } = require("node:child_process");
      lastCommitHash = execSync("git rev-parse HEAD 2>/dev/null", { 
        cwd: ctx.cwd, encoding: "utf-8" 
      }).trim() || null;
    } catch {
      lastCommitHash = null;
    }
  });

  // After agent finishes a turn, check if we should suggest checkpoint
  pi.on("agent_end", async (_event, ctx) => {
    if (ctx.mode !== "tui") return;

    const { execSync } = require("node:child_process");
    
    // Check if git is available
    try {
      execSync("git rev-parse --git-dir 2>/dev/null", { 
        cwd: ctx.cwd, encoding: "utf-8" 
      });
    } catch {
      return; // Not a git repo
    }

    // Check if there are changes
    let dirty = false;
    try {
      const status = execSync("git status --porcelain", {
        cwd: ctx.cwd, encoding: "utf-8"
      });
      dirty = status.trim().length > 0;
    } catch {
      return;
    }

    if (!dirty) return;

    // Ask user if they want to checkpoint
    const shouldCheckpoint = await ctx.ui.confirm(
      "Checkpoint",
      `Create a git checkpoint? This saves your current work as a rollback point.`
    );

    if (!shouldCheckpoint) return;

    // Get a descriptive message from the user
    const message = await ctx.ui.input(
      "Checkpoint message (optional):",
      "Block checkpoint"
    );

    const finalMessage = message || "Block checkpoint";

    try {
      execSync("git add -A", { cwd: ctx.cwd, encoding: "utf-8" });
      const newHash = execSync(
        `git commit -m "${finalMessage} [pi-checkpoint]" 2>&1`,
        { cwd: ctx.cwd, encoding: "utf-8" }
      );

      ctx.ui.notify(`✓ Checkpoint created: ${finalMessage}`, "success");
      lastCommitHash = execSync("git rev-parse HEAD", { 
        cwd: ctx.cwd, encoding: "utf-8" 
      }).trim();
    } catch (e: any) {
      ctx.ui.notify(`Checkpoint failed: ${e.message}`, "error");
    }
  });

  // Register a manual checkpoint command
  pi.registerCommand("checkpoint", {
    description: "Create a git checkpoint (commit) manually",
    handler: async (args, ctx) => {
      const { execSync } = require("node:child_process");

      try {
        execSync("git rev-parse --git-dir 2>/dev/null", { 
          cwd: ctx.cwd, encoding: "utf-8" 
        });
      } catch {
        ctx.ui.notify("Not a git repository", "error");
        return;
      }

      const message = args || await ctx.ui.input("Checkpoint message:", "Manual checkpoint");
      const finalMessage = (message as string) || "Manual checkpoint";

      try {
        execSync("git add -A", { cwd: ctx.cwd, encoding: "utf-8" });
        execSync(`git commit -m "${finalMessage} [pi-checkpoint]"`, { 
          cwd: ctx.cwd, encoding: "utf-8" 
        });
        ctx.ui.notify(`✓ Checkpoint: ${finalMessage}`, "success");
      } catch (e: any) {
        if (e.message?.includes("nothing to commit")) {
          ctx.ui.notify("Nothing to commit — working tree clean", "info");
        } else {
          ctx.ui.notify(`Failed: ${e.message}`, "error");
        }
      }
    },
  });

  // Register rollback command
  pi.registerCommand("rollback", {
    description: "Rollback to the last pi-checkpoint commit",
    handler: async (_args, ctx) => {
      const { execSync } = require("node:child_process");

      try {
        execSync("git rev-parse --git-dir 2>/dev/null", { 
          cwd: ctx.cwd, encoding: "utf-8" 
        });
      } catch {
        ctx.ui.notify("Not a git repository", "error");
        return;
      }

      // Find last pi-checkpoint
      try {
        const lastCheckpoint = execSync(
          'git log --oneline --grep="[pi-checkpoint]" -n 5',
          { cwd: ctx.cwd, encoding: "utf-8" }
        ).trim();

        if (!lastCheckpoint) {
          ctx.ui.notify("No pi-checkpoint commits found", "warning");
          return;
        }

        const pick = await ctx.ui.select(
          "Pick a checkpoint to roll back to:",
          lastCheckpoint.split("\n")
        );

        if (!pick) {
          ctx.ui.notify("Rollback cancelled", "info");
          return;
        }

        const hash = pick.split(" ")[0];
        const ok = await ctx.ui.confirm(
          "Rollback",
          `Roll back to checkpoint: ${pick}?\n\nThis will undo all changes since this checkpoint.`
        );

        if (!ok) {
          ctx.ui.notify("Rollback cancelled", "info");
          return;
        }

        execSync(`git checkout ${hash} -- .`, { cwd: ctx.cwd, encoding: "utf-8" });
        ctx.ui.notify(`✓ Rolled back to checkpoint: ${hash}`, "success");
      } catch (e: any) {
        ctx.ui.notify(`Rollback failed: ${e.message}`, "error");
      }
    },
  });
}
