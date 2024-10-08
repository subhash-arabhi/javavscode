import * as vscode from 'vscode';
import { extCommands } from "./commands";
import { ICommand } from "./types";
import { extConstants } from '../constants';

const runTest = async (uri: any, methodName? : string, launchConfiguration?: string) => {
    await runDebug(true, true, uri, methodName, launchConfiguration);
}
const debugTest = async (uri: any, methodName? : string, launchConfiguration?: string) => {
    await runDebug(false, true, uri, methodName, launchConfiguration);
}
const runSingle = async (uri: any, methodName? : string, launchConfiguration?: string) => {
    await runDebug(true, false, uri, methodName, launchConfiguration);
}
const debugSingle = async (uri: any, methodName? : string, launchConfiguration?: string) => {
    await runDebug(false, false, uri, methodName, launchConfiguration);
}
const projectRun = async (node: any, launchConfiguration? : string) => {
    return runDebug(true, false, contextUri(node)?.toString() || '',  undefined, launchConfiguration, true);
}
const projectDebug = async (node: any, launchConfiguration? : string) => {
    return runDebug(false, false, contextUri(node)?.toString() || '',  undefined, launchConfiguration, true);
}
const projectTest = async (node: any, launchConfiguration? : string) => {
    return runDebug(true, true, contextUri(node)?.toString() || '',  undefined, launchConfiguration, true);
}
const packageTest = async (uri: any, launchConfiguration? : string) => {
    await runDebug(true, true, uri, undefined, launchConfiguration);
}

export const registerDebugCommands: ICommand[] = [
    {
        command: extCommands.runTest,
        handler: runTest
    }, {
        command: extCommands.debugTest,
        handler: debugTest
    }, {
        command: extCommands.runSingle,
        handler: runSingle
    }, {
        command: extCommands.debugSingle,
        handler: debugSingle
    }, {
        command: extCommands.projectRun,
        handler: projectRun
    }, {
        command: extCommands.projectDebug,
        handler: projectDebug
    }, {
        command: extCommands.projectTest,
        handler: projectTest
    }, {
        command: extCommands.packageTest,
        handler: packageTest
    }
];

const runDebug = async (noDebug: boolean, testRun: boolean, uri: any, methodName?: string, launchConfiguration?: string, project : boolean = false, ) => {
    const docUri = contextUri(uri);
    if (docUri) {
        // attempt to find the active configuration in the vsode launch settings; undefined if no config is there.
        let debugConfig : vscode.DebugConfiguration = await findRunConfiguration(docUri) || {
            type: extConstants.COMMAND_PREFIX,
            name: "Java Single Debug",
            request: "launch"
        };
        if (methodName) {
            debugConfig['methodName'] = methodName;
        }
        if (launchConfiguration == '') {
            if (debugConfig['launchConfiguration']) {
                delete debugConfig['launchConfiguration'];
            }
        } else {
            debugConfig['launchConfiguration'] = launchConfiguration;
        }
        debugConfig['testRun'] = testRun;
        const workspaceFolder = vscode.workspace.getWorkspaceFolder(docUri);
        if (project) {
            debugConfig['projectFile'] = docUri.toString();
            debugConfig['project'] = true;
        } else {
            debugConfig['mainClass'] =  docUri.toString();
        }
        const debugOptions : vscode.DebugSessionOptions = {
            noDebug: noDebug,
        }


        const ret = await vscode.debug.startDebugging(workspaceFolder, debugConfig, debugOptions);
        return ret ? new Promise((resolve) => {
            const listener = vscode.debug.onDidTerminateDebugSession(() => {
                listener.dispose();
                resolve(true);
            });
        }) : ret;
    }
};

function contextUri(ctx : any) : vscode.Uri | undefined {
    if (ctx?.fsPath) {
        return ctx as vscode.Uri;
    } else if (ctx?.resourceUri) {
        return ctx.resourceUri as vscode.Uri;
    } else if (typeof ctx == 'string') {
        try {
            return vscode.Uri.parse(ctx, true);
        } catch (err) {
            return vscode.Uri.file(ctx);
        }
    }
    return vscode.window.activeTextEditor?.document?.uri;
}

async function findRunConfiguration(uri : vscode.Uri) : Promise<vscode.DebugConfiguration|undefined> {
    // do not invoke debug start with no (jdk) configurations, as it would probably create an user prompt
    let cfg = vscode.workspace.getConfiguration("launch");
    let c = cfg.get('configurations');
    if (!Array.isArray(c)) {
        return undefined;
    }
    let f = c.filter((v) => v['type'] === extConstants.COMMAND_PREFIX);
    if (!f.length) {
        return undefined;
    }
    class P implements vscode.DebugConfigurationProvider {
        config : vscode.DebugConfiguration | undefined;

        resolveDebugConfigurationWithSubstitutedVariables(folder: vscode.WorkspaceFolder | undefined, debugConfiguration: vscode.DebugConfiguration, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.DebugConfiguration> {
            this.config = debugConfiguration;
            return undefined;
        }
    }
    let provider = new P();
    let d = vscode.debug.registerDebugConfigurationProvider(extConstants.COMMAND_PREFIX, provider);
    // let vscode to select a debug config
    return await vscode.commands.executeCommand('workbench.action.debug.start', { config: {
        type: extConstants.COMMAND_PREFIX,
        mainClass: uri.toString()
    }, noDebug: true}).then((v) => {
        d.dispose();
        return provider.config;
    }, (err) => {
        d.dispose();
        return undefined;
    });
}