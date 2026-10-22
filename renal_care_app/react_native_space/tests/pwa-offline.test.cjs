/** Ejecutar tras build:pwa. Chromium: yarn playwright install chromium.
 * En CI puede usarse PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH para un navegador instalado.
 */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const { readFile, stat, mkdir } = require("node:fs/promises");
const { resolve, extname, sep } = require("node:path");
const { chromium } = require("playwright");

const root = resolve(__dirname, "../dist-pwa");
const types = {
  ".js": "text/javascript",
  ".html": "text/html",
  ".css": "text/css",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
};
async function serve(req, res) {
  try {
    let path = resolve(
      root,
      "." + decodeURIComponent(new URL(req.url, "http://localhost").pathname),
    );
    if (path !== root && !path.startsWith(root + sep)) {
      res.writeHead(403).end();
      return;
    }
    // Simular un despliegue manual que excluye carpetas node_modules.
    if (
      path.split(sep).includes("node_modules") ||
      /\.(ttf|woff2?)$/.test(path)
    )
      path = resolve(root, "index.html");
    if (path === root) path = resolve(root, "index.html");
    try {
      if (!(await stat(path)).isFile()) throw new Error("directory");
    } catch {
      if (extname(path)) {
        res.writeHead(404).end();
        return;
      }
      path = resolve(root, "index.html");
    }
    res.writeHead(200, {
      "Content-Type": types[extname(path)] ?? "application/octet-stream",
      "Cache-Control": "no-cache",
    });
    res.end(await readFile(path));
  } catch (e) {
    res.writeHead(500).end(String(e));
  }
}

test(
  "PWA precarga, abre en frío sin red y permite tres perfiles y consultas locales",
  { timeout: 90000 },
  async () => {
    const server = createServer(serve);
    await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
    const base = `http://localhost:${server.address().port}`;
    let browser;
    try {
      browser = await chromium.launch({
        ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
          ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
          : {}),
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
      });
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      });
      const apiRequests = [],
        fontRequests = [],
        errors = [];
      context.on("request", (r) => {
        const path = new URL(r.url()).pathname;
        if (path.startsWith("/api/")) apiRequests.push(r.url());
        if (/\.(ttf|woff2?)$/.test(path)) fontRequests.push(r.url());
      });
      let page = await context.newPage();
      page.on("pageerror", (e) => errors.push(e.message));
      await page.goto(base);
      await page
        .getByText("Disponible sin conexión", { exact: false })
        .waitFor();
      await page.waitForFunction(() => !!navigator.serviceWorker.controller);
      await page.getByTestId("app-icon-chevron-up").waitFor();
      assert.equal(
        await page.locator('link[rel="manifest"]').getAttribute("href"),
        "/manifest.webmanifest",
      );
      const manifest = await page.evaluate(async () =>
        (await fetch("/manifest.webmanifest")).json(),
      );
      assert.equal(manifest.display, "standalone");
      await context.setOffline(true);
      await page.close();
      // Abrir otra pestaña reproduce un arranque en frío, sin memoria de React.
      page = await context.newPage();
      page.on("pageerror", (e) => errors.push(e.message));
      const response = await page.goto(base);
      assert.equal(response.fromServiceWorker(), true);
      await page.getByTestId("app-icon-chevron-up").waitFor();
      await page.getByText("Entrar", { exact: true }).click();
      const names = [
        "Herman (Hemodiálisis)",
        "María (Diálisis Peritoneal)",
        "Carlos (Trasplante Renal)",
      ];
      const greetings = ["Herman", "María", "Carlos"];
      for (let i = 0; i < names.length; i++) {
        await page
          .getByText(`Acceder como ${names[i]}`, { exact: true })
          .click();
        await page
          .getByText(`¡Hola, ${greetings[i]}!`, { exact: true })
          .waitFor();
        for (const name of [
          "medical-bag",
          "file-document-outline",
          "food-apple-outline",
          "phone-message",
          "home",
          "account-cog",
        ]) {
          const icon = page.getByTestId(`app-icon-${name}`).first();
          await icon.waitFor();
          assert.equal(
            await icon.evaluate((node) => node.tagName.toLowerCase()),
            "svg",
          );
          assert.ok((await icon.locator("path").getAttribute("d")).length > 10);
        }
        if (i > 0)
          assert.ok(
            !(await page.locator("body").innerText()).includes(
              `¡Hola, ${greetings[i - 1]}!`,
            ),
          );
        await page.goto(base + "/historia");
        await page.getByText("Última Analítica", { exact: true }).waitFor();
        assert.ok((await page.locator("body").innerText()).includes("Ejemplo"));
        await page.goto(base + "/tratamiento");
        await page
          .getByText(
            [
              "⚖️ Peso Seco Objetivo",
              "Esquema de Intercambios",
              "💊 Medicación Inmunosupresora",
            ][i],
            { exact: true },
          )
          .waitFor();
        await page.goto(base + "/dieta");
        await page
          .getByText("✅ Alimentos Recomendados", { exact: true })
          .waitFor();
        await page.goto(base + "/contacto");
        await page
          .getByText("Consulta ficticia · No escribas datos reales", {
            exact: true,
          })
          .waitFor();
        assert.equal(
          await page
            .getByText("Consulta ficticia de Herman", { exact: true })
            .count(),
          0,
        );
        if (i === 0) {
          await page
            .getByPlaceholder("Asunto", { exact: true })
            .fill("Consulta ficticia de Herman");
          await page
            .getByPlaceholder("Escribe tu consulta médica...", { exact: true })
            .fill("Este mensaje es una prueba sin datos reales.");
          await page.getByText("Guardar simulación", { exact: true }).click();
          await page
            .getByText("Simulación guardada", { exact: true })
            .waitFor();
          await page.getByText("Aceptar", { exact: true }).click();
          await page.reload();
          await page
            .getByText("Consulta ficticia de Herman", { exact: true })
            .waitFor();
          await page.goto(base + "/tabs");
          await page.getByText("Mi Ambulancia", { exact: true }).click();
          await page.getByTestId("transport-map").waitFor();
          await page.clock.install();
          await page.getByText("Simular recorrido", { exact: true }).click();
          await page.getByText("Pausar", { exact: true }).waitFor();
          await page.clock.fastForward(10000);
          await page
            .getByTestId("transport-status")
            .filter({ hasText: "En camino" })
            .waitFor();
          await page.getByText("Pausar", { exact: true }).click();
          await page
            .getByText("Simulación en pausa", { exact: true })
            .waitFor();
          await page.clock.fastForward(5000);
          await page.getByText("Continuar", { exact: true }).click();
          await page.clock.fastForward(40000);
          await page
            .getByText("Trayecto completado", { exact: true })
            .waitFor();
          await page.getByText("Repetir simulación", { exact: true }).click();
          await page.getByText("Pausar", { exact: true }).waitFor();
          await page
            .getByText("Volver al inicio del recorrido", { exact: true })
            .click();
          await page.getByText("Listo para salir", { exact: true }).waitFor();
          await page.getByText("Simular recorrido", { exact: true }).click();
          await page
            .getByRole("button", { name: "Volver", exact: true })
            .click();
          await page.waitForFunction(() => location.pathname !== "/ambulancia");
          await page
            .getByTestId("transport-map")
            .waitFor({ state: "detached" });
          await page.clock.resume();
          await page.getByText("Mi Ambulancia", { exact: true }).click();
          await page.getByText("Simular recorrido", { exact: true }).waitFor();
        }
        if (i > 0) {
          await page.goto(base + "/ambulancia");
          await page
            .getByText(
              "Este servicio solo está disponible para pacientes en Hemodiálisis",
              { exact: true },
            )
            .waitFor();
          assert.equal(
            await page.getByText("Simular recorrido", { exact: true }).count(),
            0,
          );
        }
        await page.goto(base + "/tabs/profile");
        await page.getByText("Cerrar Sesión", { exact: true }).click();
        await page
          .getByText("Seleccionar perfil ficticio", { exact: true })
          .first()
          .waitFor();
      }
      assert.deepEqual(
        apiRequests,
        [],
        "La demo no debe consultar ninguna API",
      );
      assert.deepEqual(
        fontRequests,
        [],
        "Los iconos deben funcionar sin descargar fuentes",
      );
      assert.deepEqual(errors, [], "Sin errores de ejecución en las pantallas");
      await mkdir(resolve(__dirname, "../test-results"), { recursive: true });
      await page.screenshot({
        path: resolve(__dirname, "../test-results/pwa-offline.png"),
      });
      await context.close();
    } finally {
      if (browser) await browser.close();
      await new Promise((resolve) => server.close(resolve));
    }
  },
);
