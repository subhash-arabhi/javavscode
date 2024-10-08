import { commands, Disposable, ExtensionContext } from "vscode";
import { ICommand } from "./types";
import { registerCreateCommands } from "./create";
import { registerCacheCommands } from "./cache";
import { registerNavigationCommands } from "./navigation";
import { registerWebviewCommands } from "./webViews";
import { registerBuildOperationCommands } from "./buildOperations";
import { registerRefactorCommands } from "./refactor";
import { registerDebugCommands } from "./debug";

type ICommandModules = Record<string, ICommand[]>;

const commandModules: ICommandModules = {
    create: registerCreateCommands,
    cache: registerCacheCommands,
    navigation: registerNavigationCommands,
    webview: registerWebviewCommands,
    buildOperations: registerBuildOperationCommands,
    refactor: registerRefactorCommands,
    debug: registerDebugCommands
}

export const subscribeCommands = (context: ExtensionContext) => {
    for (const cmds of Object.values(commandModules)) {
        for (const command of cmds) {
            const cmdRegistered = registerCommand(command);
            if (cmdRegistered) {
                context.subscriptions.push(cmdRegistered);
            }
        }
    }
}

const registerCommand = (commandInfo: ICommand): Disposable | null => {
    const { command, handler } = commandInfo;
    if (command.trim().length && handler) {
        return commands.registerCommand(command, handler);
    }
    return null;
}
