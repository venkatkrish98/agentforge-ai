import { test, expect } from "@playwright/test";

test.describe("AgentForge AI End-to-End User Journeys", () => {
  test("renders main workspace and loads sample demo projects", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=AgentForge")).toBeVisible();
    await expect(page.locator("text=Nebius × NVIDIA Global AI Hackathon")).toBeVisible();

    // Verify workspace tabs
    await expect(page.locator("button:has-text('Overview')")).toBeVisible();
    await expect(page.locator("button:has-text('Plan')")).toBeVisible();
    await expect(page.locator("button:has-text('Code Diff')")).toBeVisible();
    await expect(page.locator("button:has-text('Tests & Evidence')")).toBeVisible();
    await expect(page.locator("button:has-text('Timeline')")).toBeVisible();
  });

  test("navigates to Model Settings and displays Nebius configuration", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.locator("text=Model Provider & Token Factory Configuration")).toBeVisible();
    await expect(page.locator("text=Verified NVIDIA Models Catalog")).toBeVisible();
    await expect(page.locator("text=NVIDIA Nemotron 3.5 Lightning")).toBeVisible();
    await expect(page.locator("text=Security & Zero-Leakage Architecture")).toBeVisible();
  });

  test("navigates to Architecture & Threat Model page", async ({ page }) => {
    await page.goto("/architecture");
    await expect(page.locator("text=AgentForge AI Systems Architecture")).toBeVisible();
    await expect(page.locator("text=The 6-Stage Autonomous Engineering Loop")).toBeVisible();
    await expect(page.locator("text=Threat Model & Defenses")).toBeVisible();
  });
});
