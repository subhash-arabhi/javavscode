import { _electron as electron, Page, ElectronApplication} from 'playwright';
import * as path from 'path';
import * as vscodeTest from '@vscode/test-electron';
import * as fs from 'fs';

describe('Command Palette Multi-Step Feature', function() {
  let app: ElectronApplication;
  let window: Page;

  this.beforeAll(async () => {
    const vscodeExecutablePath = await vscodeTest.downloadAndUnzipVSCode('stable');
    const extensionDevelopmentPath = path.resolve(__dirname, '../../../');
    const extensionTestsPath = path.resolve(__dirname, './multiStep.test');
    try {
        app = await electron.launch({
        executablePath: vscodeExecutablePath,
        args: [
          '--extensionDevelopmentPath=' + extensionDevelopmentPath
        ]
      });
      window = await app.firstWindow();
    } catch {
        throw new Error('Application launch error');
    }
    if (!window) {
        throw new Error('Failed to get the first window of the application.');
    }

  }).timeout(50000);

  this.afterAll(async () => {
    if (app) {
        await app.close();
    } else {
        console.warn('App was not initialized properly, cannot close it.');
    }
  });

  it('Trigger multi-step command from palette', async () => {
    if(window) console.log('test 1 started');
    await window.waitForTimeout(5000);
    await window.keyboard.press('Meta+Shift+P');
    console.log('Waiting for command palette to appear...');
    await window.waitForTimeout(2000);
    // const htmlContent = await window.content();

    // fs.writeFileSync('vscode_ui.html', htmlContent);
    // await window.waitForSelector('.monaco-inputbox', { timeout: 5000 });
    console.log('Filling the command...');
    await window.fill('.monaco-inputbox', 'JAVA: New Project');
    console.log('Pressing Enter to execute the command...');
    await window.keyboard.press('Enter');


  }).timeout(50000);
});
