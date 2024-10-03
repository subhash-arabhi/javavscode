import * as net from 'net';
import * as vscode from 'vscode';
import { commands, ExtensionContext } from 'vscode';
import { LanguageClient } from 'vscode-languageclient/node';
import { extCommands, nbCommands } from '../commands/commands';
import { DebugConnector } from '../lsp/protocol';
import { COMMAND_PREFIX, contextUri, NbLanguageClient } from '../extension';
import { l10n } from '../views/localiser';
import { NbTestAdapter } from '../views/testAdapter';
import { StreamDebugAdapter } from './streamDebugAdapter';


interface DebugVar {
    port: number;
    hash: string | undefined;
}

export const debugVar: DebugVar = {
    port: -1,
    hash: undefined
}
let testAdapter: NbTestAdapter | undefined;
let client: Promise<NbLanguageClient>; // import from global

export function registerDebugger(context: ExtensionContext): void {
    let debugTrackerFactory = new NetBeansDebugAdapterTrackerFactory();
    context.subscriptions.push(vscode.debug.registerDebugAdapterTrackerFactory(COMMAND_PREFIX, debugTrackerFactory));
    let configInitialProvider = new NetBeansConfigurationInitialProvider();
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider(COMMAND_PREFIX, configInitialProvider, vscode.DebugConfigurationProviderTriggerKind.Initial));
    let configDynamicProvider = new NetBeansConfigurationDynamicProvider(context);
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider(COMMAND_PREFIX, configDynamicProvider, vscode.DebugConfigurationProviderTriggerKind.Dynamic));
    let configResolver = new NetBeansConfigurationResolver();
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider(COMMAND_PREFIX, configResolver));
    context.subscriptions.push(vscode.debug.onDidTerminateDebugSession(((session) => onDidTerminateSession(session))));
    let debugDescriptionFactory = new NetBeansDebugAdapterDescriptionFactory();
    context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory(COMMAND_PREFIX, debugDescriptionFactory));
}

export function registerDebugCommands(context: ExtensionContext) {
    context.subscriptions.push(commands.registerCommand(extCommands.runTest, async (uri, methodName?, launchConfiguration?) => {
        await runDebug(true, true, uri, methodName, launchConfiguration);
    }));
    context.subscriptions.push(commands.registerCommand(extCommands.debugTest, async (uri, methodName?, launchConfiguration?) => {
        await runDebug(false, true, uri, methodName, launchConfiguration);
    }));
    context.subscriptions.push(commands.registerCommand(extCommands.runSingle, async (uri, methodName?, launchConfiguration?) => {
        await runDebug(true, false, uri, methodName, launchConfiguration);
    }));
    context.subscriptions.push(commands.registerCommand(extCommands.debugSingle, async (uri, methodName?, launchConfiguration?) => {
        await runDebug(false, false, uri, methodName, launchConfiguration);
    }));
    context.subscriptions.push(commands.registerCommand(extCommands.projectRun, async (node, launchConfiguration?) => {
        return runDebug(true, false, contextUri(node)?.toString() || '', undefined, launchConfiguration, true);
    }));
    context.subscriptions.push(commands.registerCommand(extCommands.projectDebug, async (node, launchConfiguration?) => {
        return runDebug(false, false, contextUri(node)?.toString() || '', undefined, launchConfiguration, true);
    }));
    context.subscriptions.push(commands.registerCommand(extCommands.projectTest, async (node, launchConfiguration?) => {
        return runDebug(true, true, contextUri(node)?.toString() || '', undefined, launchConfiguration, true);
    }));
    context.subscriptions.push(commands.registerCommand(extCommands.packageTest, async (uri, launchConfiguration?) => {
        await runDebug(true, true, uri, undefined, launchConfiguration);
    }));
}

const runDebug = async (noDebug: boolean, testRun: boolean, uri: any, methodName?: string, launchConfiguration?: string, project: boolean = false,) => {
    const docUri = contextUri(uri);
    if (docUri) {
        // attempt to find the active configuration in the vsode launch settings; undefined if no config is there.
        let debugConfig: vscode.DebugConfiguration = await findRunConfiguration(docUri) || {
            type: COMMAND_PREFIX,
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
            debugConfig['mainClass'] = docUri.toString();
        }
        const debugOptions: vscode.DebugSessionOptions = {
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

async function findRunConfiguration(uri: vscode.Uri): Promise<vscode.DebugConfiguration | undefined> {
    // do not invoke debug start with no (jdk) configurations, as it would probably create an user prompt
    let cfg = vscode.workspace.getConfiguration("launch");
    let c = cfg.get('configurations');
    if (!Array.isArray(c)) {
        return undefined;
    }
    let f = c.filter((v) => v['type'] === COMMAND_PREFIX);
    if (!f.length) {
        return undefined;
    }
    class P implements vscode.DebugConfigurationProvider {
        config: vscode.DebugConfiguration | undefined;

        resolveDebugConfigurationWithSubstitutedVariables(folder: vscode.WorkspaceFolder | undefined, debugConfiguration: vscode.DebugConfiguration, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.DebugConfiguration> {
            this.config = debugConfiguration;
            return undefined;
        }
    }
    let provider = new P();
    let d = vscode.debug.registerDebugConfigurationProvider(COMMAND_PREFIX, provider);
    // let vscode to select a debug config
    return await vscode.commands.executeCommand(extCommands.startDebug, {
        config: {
            type: COMMAND_PREFIX,
            mainClass: uri.toString()
        }, noDebug: true
    }).then((v) => {
        d.dispose();
        return provider.config;
    }, (err) => {
        d.dispose();
        return undefined;
    });
}

class NetBeansDebugAdapterDescriptionFactory implements vscode.DebugAdapterDescriptorFactory {

    createDebugAdapterDescriptor(_session: vscode.DebugSession, _executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        return new Promise<vscode.DebugAdapterDescriptor>((resolve, reject) => {
            let cnt = 10;
            const fnc = () => {
                if (debugVar.port < 0) {
                    if (cnt-- > 0) {
                        setTimeout(fnc, 1000);
                    } else {
                        reject(new Error(l10n.value('jdk.extenstion.debugger.error_msg.debugAdapterNotInitialized')));
                    }
                } else {
                    // resolve(new vscode.DebugAdapterServer(debugVar.port));
                    const socket = net.connect(debugVar.port, "127.0.0.1", () => { });
                    socket.on("connect", () => {
                        const adapter = new StreamDebugAdapter();
                        socket.write(debugVar.hash ? debugVar.hash : "");
                        adapter.connect(socket, socket);
                        resolve(new vscode.DebugAdapterInlineImplementation(adapter));
                    });
                }
            }
            fnc();
        });
    }
}

class NetBeansConfigurationResolver implements vscode.DebugConfigurationProvider {

    resolveDebugConfiguration(_folder: vscode.WorkspaceFolder | undefined, config: vscode.DebugConfiguration, _token?: vscode.CancellationToken): vscode.ProviderResult<vscode.DebugConfiguration> {
        if (!config.type) {
            config.type = COMMAND_PREFIX;
        }
        if (!config.request) {
            config.request = 'launch';
        }
        if (vscode.window.activeTextEditor) {
            config.file = '${file}';
        }
        if (!config.classPaths) {
            config.classPaths = ['any'];
        }
        if (!config.console) {
            config.console = 'internalConsole';
        }

        return config;
    }
}
class NetBeansDebugAdapterTrackerFactory implements vscode.DebugAdapterTrackerFactory {

    createDebugAdapterTracker(_session: vscode.DebugSession): vscode.ProviderResult<vscode.DebugAdapterTracker> {
        return {
            onDidSendMessage(message: any): void {
                if (testAdapter && message.type === 'event' && message.event === 'output') {
                    testAdapter.testOutput(message.body.output);
                }
            }
        }
    }
}



class NetBeansConfigurationInitialProvider implements vscode.DebugConfigurationProvider {

    provideDebugConfigurations(folder: vscode.WorkspaceFolder | undefined, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.DebugConfiguration[]> {
        return this.doProvideDebugConfigurations(folder, token);
    }

    async doProvideDebugConfigurations(folder: vscode.WorkspaceFolder | undefined, _token?: vscode.CancellationToken): Promise<vscode.DebugConfiguration[]> {
        let c: LanguageClient = await client;
        if (!folder) {
            return [];
        }
        var u: vscode.Uri | undefined;
        if (folder && folder.uri) {
            u = folder.uri;
        } else {
            u = vscode.window.activeTextEditor?.document?.uri
        }
        let result: vscode.DebugConfiguration[] = [];
        const configNames: string[] | null | undefined = await vscode.commands.executeCommand(nbCommands.projectConfigurations, u?.toString());
        if (configNames) {
            let first: boolean = true;
            for (let cn of configNames) {
                let cname: string;

                if (first) {
                    // ignore the default config, comes first.
                    first = false;
                    continue;
                } else {
                    cname = "Launch Java: " + cn;
                }
                const debugConfig: vscode.DebugConfiguration = {
                    name: cname,
                    type: COMMAND_PREFIX,
                    request: "launch",
                    launchConfiguration: cn,
                };
                result.push(debugConfig);
            }
        }
        return result;
    }
}

class NetBeansConfigurationDynamicProvider implements vscode.DebugConfigurationProvider {

    context: ExtensionContext;
    commandValues = new Map<string, string>();

    constructor(context: ExtensionContext) {
        this.context = context;
    }

    provideDebugConfigurations(folder: vscode.WorkspaceFolder | undefined, token?: vscode.CancellationToken): vscode.ProviderResult<vscode.DebugConfiguration[]> {
        return this.doProvideDebugConfigurations(folder, this.context, this.commandValues, token);
    }

    async doProvideDebugConfigurations(folder: vscode.WorkspaceFolder | undefined, context: ExtensionContext, commandValues: Map<string, string>, _token?: vscode.CancellationToken): Promise<vscode.DebugConfiguration[]> {
        let c: LanguageClient = await client;
        if (!folder) {
            return [];
        }
        let result: vscode.DebugConfiguration[] = [];
        const attachConnectors: DebugConnector[] | null | undefined = await vscode.commands.executeCommand(nbCommands.debuggerConfigurations);
        if (attachConnectors) {
            for (let ac of attachConnectors) {
                const debugConfig: vscode.DebugConfiguration = {
                    name: ac.name,
                    type: ac.type,
                    request: "attach",
                };
                for (let i = 0; i < ac.arguments.length; i++) {
                    let defaultValue: string = ac.defaultValues[i];
                    if (!defaultValue.startsWith("${command:")) {
                        // Create a command that asks for the argument value:
                        let cmd: string = `${extCommands.attachDebugger}.${ac.id}.${ac.arguments[i]}`;
                        debugConfig[ac.arguments[i]] = "${command:" + cmd + "}";
                        if (!commandValues.has(cmd)) {
                            commandValues.set(cmd, ac.defaultValues[i]);
                            let description: string = ac.descriptions[i];
                            context.subscriptions.push(commands.registerCommand(cmd, async (ctx) => {
                                return vscode.window.showInputBox({
                                    prompt: description,
                                    value: commandValues.get(cmd),
                                }).then((value) => {
                                    if (value) {
                                        commandValues.set(cmd, value);
                                    }
                                    return value;
                                });
                            }));
                        }
                    } else {
                        debugConfig[ac.arguments[i]] = defaultValue;
                    }
                }
                result.push(debugConfig);
            }
        }
        return result;
    }
}

function onDidTerminateSession(session: vscode.DebugSession): any {
    const config = session.configuration;
    if (config.env) {
        const file = config.env["MICRONAUT_CONFIG_FILES"];
        if (file) {
            vscode.workspace.fs.delete(vscode.Uri.file(file));
        }
    }
}