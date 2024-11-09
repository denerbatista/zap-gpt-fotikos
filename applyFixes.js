import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Caminho correto para o arquivo dentro de node_modules
const BROWSER_JS_PATH = path.join(__dirname, 'node_modules/@wppconnect-team/wppconnect/dist/controllers/browser.js');

async function applyFixes() {
  try {
    // Função ensurePageConnected
    const ensurePageConnectedCode = `
    async function ensurePageConnected(page) {
      if (page.isClosed()) {
        console.log("A página foi fechada. Tentando reconectar...");
        // Lógica para reabrir ou reconectar a página
      } else {
        console.log("A página ainda está ativa.");
      }
    }\n`;

    // Função addScriptWithRetry
    const addScriptWithRetryCode = `
    async function addScriptWithRetry(page, url, retries = 3) {
      for (let i = 0; i < retries; i++) {
        try {
          await page.addScriptTag({ url });
          console.log("Script adicionado com sucesso.");
          break;
        } catch (error) {
          console.log(\`Tentativa \${i + 1} falhou: \${error.message}\`);
          if (i === retries - 1) {
            throw new Error("Falha ao adicionar script após múltiplas tentativas.");
          }
          await page.reload();
        }
      }
    }\n`;

    // Configurações do Puppeteer
    const puppeteerLaunchConfig = `
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--no-zygote',
        '--single-process',
        '--disable-web-security',
      ],
    });\n`;

    // Carrega o conteúdo do arquivo browser.js
    let browserFileContent = await fs.readFile(BROWSER_JS_PATH, 'utf8');

    // Adiciona as funções ensurePageConnected e addScriptWithRetry, se não estiverem presentes
    if (!browserFileContent.includes('async function ensurePageConnected')) {
      browserFileContent = ensurePageConnectedCode + browserFileContent;
    }
    if (!browserFileContent.includes('async function addScriptWithRetry')) {
      browserFileContent = addScriptWithRetryCode + browserFileContent;
    }

    // Atualiza a configuração de lançamento do Puppeteer
    const launchPattern = /puppeteer\.launch\({([\s\S]*?)\}\);/g;
    if (launchPattern.test(browserFileContent)) {
      browserFileContent = browserFileContent.replace(launchPattern, puppeteerLaunchConfig);
    }

    // Salva as alterações de volta ao arquivo browser.js
    await fs.writeFile(BROWSER_JS_PATH, browserFileContent, 'utf8');
    console.log('Modificações aplicadas com sucesso em browser.js');

  } catch (error) {
    console.error('Erro ao aplicar modificações:', error);
  }
}

// Executa as alterações
applyFixes();
