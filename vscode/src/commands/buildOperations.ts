import { LOGGER } from "../extension";
import { l10n } from "../localiser";
import { extCommands, nbCommands } from "./commands";
import { ICommand } from "./types";
import { wrapCommandWithProgress, wrapProjectActionWithProgress } from "./utils";

const compileWorkspaceCHandler = () => {
    wrapCommandWithProgress(nbCommands.buildWorkspace, l10n.value('jdk.extension.command.progress.compilingWorkSpace'), LOGGER.getOutputChannel(), true);
}
const cleanWorkspaceHandler = () => {
    wrapCommandWithProgress(nbCommands.cleanWorkspace,l10n.value('jdk.extension.command.progress.cleaningWorkSpace'), LOGGER.getOutputChannel(), true)
}

const compileProjectHandler = (args: any) => {
    wrapProjectActionWithProgress('build', undefined, l10n.value('jdk.extension.command.progress.compilingProject'), LOGGER.getOutputChannel(), true, args);
}

const cleanProjectHandler = (args: any) => {
    wrapProjectActionWithProgress('clean', undefined, l10n.value('jdk.extension.command.progress.cleaningProject'), LOGGER.getOutputChannel(), true, args);
}


export const registerBuildOperationCommands: ICommand[] = [
    {
        command: extCommands.compileWorkspace,
        handler: compileWorkspaceCHandler
    }, {
        command: extCommands.cleanWorkspace,
        handler: cleanWorkspaceHandler
    },{
        command: extCommands.compileProject,
        handler: compileProjectHandler
    },{
        command: extCommands.cleanProject,
        handler: cleanProjectHandler
    }
];