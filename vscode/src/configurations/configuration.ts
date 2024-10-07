import { appendPrefixToCommand } from "../utils"

export const configKeys = {
    jdkHome: 'jdkhome',
    projectJdkHome: 'project.jdkhome',
    lspVmOptions: 'serverVmOptions',
    disableNbJavac: 'advanced.disable.nbjavac',
    disableProjSearchLimit: 'advanced.disable.projectSearchLimit',
    formatPrefs: 'format',
    hintPrefs: 'hints',
    importPrefs: 'java.imports',
    runConfigVmOptions: 'runConfig.vmOptions',
    runConfigCwd: 'runConfig.cwd',
    verbose: 'verbose',
    userdir: 'userdir',
};

export const builtInConfigKeys = {
    vscodeTheme: 'workbench.colorTheme'
}

export const userConfigsListened: string[] = [
    appendPrefixToCommand(configKeys.jdkHome),
    appendPrefixToCommand(configKeys.userdir),
    appendPrefixToCommand(configKeys.lspVmOptions),
    appendPrefixToCommand(configKeys.disableNbJavac),
    appendPrefixToCommand(configKeys.disableProjSearchLimit),
    builtInConfigKeys.vscodeTheme,
];


export const userConfigsListenedByServer = [
    appendPrefixToCommand(configKeys.hintPrefs),
    appendPrefixToCommand(configKeys.formatPrefs),
    appendPrefixToCommand(configKeys.importPrefs),
    appendPrefixToCommand(configKeys.projectJdkHome),
    appendPrefixToCommand(configKeys.runConfigVmOptions),
    appendPrefixToCommand(configKeys.runConfigCwd)
];

