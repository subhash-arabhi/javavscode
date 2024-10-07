import { commands, window } from "vscode";
import { globalVars } from "../extension";
import { builtInCommands, extCommands } from "./commands";
import { ICommand } from "./types";
import { l10n } from "../localiser";
import * as fs from 'fs';
import * as path from 'path';

const deleteCache = async () => {
    // TODO: Change workspace path to userdir path
    const storagePath = globalVars.extensionInfo.getWorkspaceStorage()?.fsPath;
    if (!storagePath) {
        window.showErrorMessage(l10n.value("jdk.extenstion.cache.error_msg.cannotFindWrkSpacePath"));
        return;
    }

    const userDir = path.join(storagePath, "userdir");
    if (userDir && fs.existsSync(userDir)) {
        const yes = l10n.value("jdk.extension.cache.label.confirmation.yes")
        const cancel = l10n.value("jdk.extension.cache.label.confirmation.cancel")
        const confirmation = await window.showInformationMessage('Are you sure you want to delete cache for this workspace  and reload the window ?',
            yes, cancel);
        if (confirmation === yes) {
            const reloadWindowActionLabel = l10n.value("jdk.extension.cache.label.reloadWindow");
            try {
                await globalVars.clientPromise.stopClient();
                globalVars.deactivated = true;
                await globalVars.nbProcessManager?.killProcess(false);
                await fs.promises.rmdir(userDir, { recursive: true });
                await window.showInformationMessage(l10n.value("jdk.extenstion.message.cacheDeleted"), reloadWindowActionLabel);
            } catch (err) {
                await window.showErrorMessage(l10n.value("jdk.extenstion.error_msg.cacheDeletionError"), reloadWindowActionLabel);
            } finally {
                commands.executeCommand(builtInCommands.reloadWindow);
            }
        }
    } else {
        window.showErrorMessage(l10n.value("jdk.extension.cache.message.noUserDir"));
    }
}

export const registerCacheCommands: ICommand[] = [{
    command: extCommands.deleteCache,
    handler: deleteCache
}];