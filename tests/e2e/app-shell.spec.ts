import { expect, test } from "@playwright/test";

test("opens the Carta Clara shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Radar de significado" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Principal" })).toBeVisible();
});

test("searches Luna and opens detail", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("searchbox", { name: "Buscar carta, numero o keyword" }).fill("luna");
  await expect(page.getByRole("heading", { name: "La Luna" }).first()).toBeVisible();
  await page.getByRole("link", { name: "Ver" }).first().click();
  await expect(page.getByRole("heading", { name: "La Luna" })).toBeVisible();
  await page.getByRole("button", { name: "Invertida" }).click();
  await page.getByRole("button", { name: "Guardar" }).click();
});

test("photo fallback states are available", async ({ page }) => {
  await page.goto("/foto");
  await expect(page.getByRole("link", { name: "Buscar manualmente" })).toBeVisible();
  await expect(page.getByText("Matching local MVP")).toBeVisible();
});
