import { spawn } from 'child_process';
import * as path from 'path';
import { Builder, By, Key, until, WebDriver } from 'selenium-webdriver';
import { Options, ServiceBuilder } from 'selenium-webdriver/chrome';


const vsixPath = path.join(__dirname, '../test-resource/extension/oracle-java-0.1.0.vsix');
const vscodeExecutablePath = path.join(__dirname, '../test-resource/Visual Studio Code.app/Contents/MacOS/Electron');
const chromeDriverBinaryPath = path.join(__dirname, '../test-resource/chromedriver-mac-arm64/chromedriver');

async function setup(): Promise<void> {

    // console.log('Installing VSIX...');
    // const installCmd = `${vscodeExecutablePath} --force --install-extension ${vsixPath}`;
    // const installProcess = spawn(installCmd, {
    //     stdio: 'inherit',
    //     shell: true
    // });
    // installProcess.on('close', async (code) => {
    //     console.log(`Extension installation exited with code ${code}`);
    // });
    
    const args = ['--no-sandbox', '--disable-dev-shm-usage', `--user-data-dir=${path.join(__dirname, 'settings')}`];
    let options = new Options().setChromeBinaryPath(vscodeExecutablePath).addArguments(...args) as any;
		options['options_'].windowTypes = ['webview'];
		options = options as Options;

    let driver = await new Builder()
    .setChromeService(new ServiceBuilder(chromeDriverBinaryPath))
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

    try {
        console.log('successfully created driver');
        await runTest(driver);
    } finally {
        await driver.quit();
    }
}

async function runTest(driver: WebDriver): Promise<void> {
    console.log('Running tests...');

    console.log('Opening command palette...');
    await driver.actions().keyDown(Key.COMMAND).keyDown(Key.SHIFT).sendKeys('p').perform();
    await sleep(2000);

    console.log('Executing New Project command');
    await driver.actions().sendKeys('JAVA: New Project', Key.ENTER).perform();
    await sleep(2000);

    console.log('Checking results...');
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

setup().catch(err => {
    console.error('Setup failed:', err);
    process.exit(1);
});
