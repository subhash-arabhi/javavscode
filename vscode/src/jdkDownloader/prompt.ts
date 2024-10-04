import { commands, window } from "vscode";
import { l10n } from "../localiser";

export const jdkDownloaderPrompt = () => {
    const downloadAndSetupActionLabel = l10n.value("jdk.extension.lspServer.label.downloadAndSetup")
    window.showInformationMessage(
        l10n.value("jdk.extension.lspServer.message.noJdkFound"),
        downloadAndSetupActionLabel
    ).then(selection => {
        if (selection === downloadAndSetupActionLabel) {
            commands.executeCommand("jdk.download.jdk");
        }
    });
}
