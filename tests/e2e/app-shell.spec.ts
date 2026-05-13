import { expect, test } from "@playwright/test";

test("opens the Carta Clara shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Radar de significado" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Que carta salio?" })).toBeVisible();
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
  await expect(page.getByTestId("camera-guide-frame")).toBeVisible();
  await expect(page.getByRole("link", { name: "Buscar manualmente" })).toBeVisible();
  await expect(page.getByText("Matching local MVP")).toBeVisible();
  await page.getByLabel("Subir foto").setInputFiles("public/cards/thumbnails/the_moon.svg");
  await expect(page.getByTestId("photo-best-match")).toContainText("La Luna");
  await page.getByRole("button", { name: "Agregar a tirada" }).click();
  await expect(page.getByText("Coincidencia fuerte")).toBeVisible();
});

test("card grid exposes premium gallery landmark", async ({ page }) => {
  await page.goto("/cartas");
  await expect(page.getByRole("heading", { name: "Las 78 cartas" })).toBeVisible();
  await expect(page.getByTestId("mock-card-grid")).toBeVisible();
  await page.getByRole("button", { name: "Mayores" }).click();
  await expect(page.getByRole("link", { name: /La Luna/ })).toBeVisible();
});
