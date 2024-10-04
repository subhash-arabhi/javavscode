import { StreamInfo } from "vscode-languageclient/node";
import { prepareNbcodeLaunchOptions, userConfigLaunchOptionsDefaults } from "./launchOptions";
import { globalVars, LOGGER } from "../extension";
import { configKeys } from "../configurations/configuration";
import { NbProcessManager } from "./nbProcessManager";
import { enableDisableModules, findNbcode } from "./utils";
import * as net from 'net';
import { extConstants, NODE_WINDOWS_LABEL } from "../constants";
import { l10n } from "../localiser";
import { window } from "vscode";
import { ChildProcess } from "child_process";
import { jdkDownloaderPrompt } from "../jdkDownloader/prompt";
import * as os from 'os';
import { LogLevel } from "../logger";

const launchNbcode = (): void => {
    const ideLaunchOptions = prepareNbcodeLaunchOptions();
    const userdir = userConfigLaunchOptionsDefaults[configKeys.userdir].value;
    const specifiedJDK = userConfigLaunchOptionsDefaults[configKeys.jdkHome].value;
    const extensionPath = globalVars.extensionInfo.getExtensionStorageUri().fsPath;
    const nbcodePath = findNbcode(extensionPath);

    const requiredJdk = specifiedJDK ? specifiedJDK : 'default system JDK';
    let launchMsg = l10n.value("jdk.extension.lspServer.statusBar.message.launching", {
        SERVER_NAME: extConstants.SERVER_NAME,
        requiredJdk: requiredJdk,
        userdir: userdir
    });
    LOGGER.log(launchMsg);
    window.setStatusBarMessage(launchMsg, 2000);

    globalVars.nbProcessManager = new NbProcessManager(userdir, nbcodePath, ideLaunchOptions);
    globalVars.nbProcessManager.startProcess();
}

const establishConnection = () => new Promise<StreamInfo>((resolve, reject) => {
    const nbProcess = globalVars.nbProcessManager?.getProcess();
    const nbProcessManager = globalVars.nbProcessManager;

    if (!nbProcessManager || !nbProcess) {
        reject();
        return;
    } else {
        try {
            const server = connectToServer(nbProcess);
            if (server) {
                resolve({
                    reader: server,
                    writer: server
                });
            }
        } catch (err) {
            reject(err);
            globalVars.nbProcessManager?.disconnect();
            return;
        }
    }

    LOGGER.log(`LSP server launching: ${nbProcessManager.getProcessId()}`);
    LOGGER.log(`LSP server user directory: ${userConfigLaunchOptionsDefaults[configKeys.userdir].value}`);
    
    nbProcess.on('data', function (d: any) {
        const status = processOnDataHandler(nbProcessManager, d.toString(), true);
        if (status) {
            resolve(d.toString());
        }
    });
    nbProcess.stderr?.on('data', function (d: any) {
        processOnDataHandler(nbProcessManager, d.toString(), false);
    });
    nbProcess.on('close', (code: number) => {
        const status = processOnCloseHandler(nbProcessManager, code)
        if(status != null){
            reject(status);
        }
    });
});

const connectToServer = (nbProcess: ChildProcess): net.Socket | void => {
    if (!nbProcess.stdout) {
        throw new Error('No stdout to parse!');
    }
    globalVars.debugPort = -1;
    let lspServerStarted = false;
    nbProcess.stdout.on("data", (chunk) => {
        if (globalVars.debugPort < 0) {
            const info = chunk.toString().match(/Debug Server Adapter listening at port (\d*) with hash (.*)\n/);
            if (info) {
                globalVars.debugPort = info[1];
                globalVars.debugHash = info[2];
            }
        }
        if (!lspServerStarted) {
            const info = chunk.toString().match(/Java Language Server listening at port (\d*) with hash (.*)\n/);
            if (info) {
                const port: number = info[1];
                const server = net.connect(port, "127.0.0.1", () => {
                    server.write(info[2]);
                });
                lspServerStarted = true;
                return server;
            }
        }
    });
    nbProcess.once("error", (err) => {
        throw err;
    });
}

const processOnDataHandler = (nbProcessManager: NbProcessManager, text: string, isOut: boolean) => {
    if (nbProcessManager) {
        globalVars.clientPromise.activationPending = false;
    }
    LOGGER.logNoNL(text);
    isOut ? nbProcessManager.appendStdOut(text) : nbProcessManager.appendStdErr(text);

    if (nbProcessManager.getStdOut()?.match(/org.netbeans.modules.java.lsp.server/)) {
        return true;
    }
    return false;
}


const processOnCloseHandler = (nbProcessManager: NbProcessManager, code: number): string | null=> {
    const globalnbProcessManager = globalVars.nbProcessManager;
    if (globalnbProcessManager == nbProcessManager) {
        globalVars.nbProcessManager = null;
        if(code!=0){
            window.showWarningMessage(l10n.value("jdk.extension.lspServer.warning_message.serverExited", { SERVER_NAME: extConstants.SERVER_NAME, code: code }));
        }
    }
    if (nbProcessManager.getStdOut()?.match(/Cannot find java/) || (os.type() === NODE_WINDOWS_LABEL && !globalVars.deactivated)) {
        jdkDownloaderPrompt();
    }
    if (nbProcessManager.getStdOut() != null) {
        let match = nbProcessManager.getStdOut()!.match(/org.netbeans.modules.java.lsp.server[^\n]*/)
        if (match?.length == 1) {
            LOGGER.log(match[0]);
        } else {
            LOGGER.log("Cannot find org.netbeans.modules.java.lsp.server in the log!", LogLevel.ERROR);
        }
        LOGGER.log(`Please refer to troubleshooting section for more info: https://github.com/oracle/javavscode/blob/main/README.md#troubleshooting`);
        LOGGER.showOutputChannelUI(false);
        
        nbProcessManager.killProcess(false);
        return l10n.value("jdk.extension.error_msg.notEnabled", { SERVER_NAME: extConstants.SERVER_NAME });
    } else {
        LOGGER.log(`LSP server ${nbProcessManager.getProcessId()} terminated with ${code}`);
        LOGGER.log(`Exit code ${code}`);
    }
    return null;
}

const enableDisableNbjavacModule = () => {
    const userdirPath = userConfigLaunchOptionsDefaults[configKeys.userdir].value;
    const nbjavacValue = userConfigLaunchOptionsDefaults[configKeys.disableNbJavac].value;
    const extensionPath = globalVars.extensionInfo.getExtensionStorageUri().fsPath;
    enableDisableModules(extensionPath, userdirPath, ['org.netbeans.libs.nbjavacapi'], nbjavacValue);
}

export const initializeServer = () => {
    enableDisableNbjavacModule();
    launchNbcode();
    return establishConnection();
}