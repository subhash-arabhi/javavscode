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
    vscodeTheme: 'workbench.colorTheme'
};

export const userConfigsListened = [
    configKeys.jdkHome,
    configKeys.userdir,
    configKeys.lspVmOptions,
    configKeys.disableNbJavac,
    configKeys.disableProjSearchLimit,
    configKeys.vscodeTheme,
];


export const userConfigsListenedByServer = [
    appendPrefixToCommand(configKeys.projectJdkHome),
    appendPrefixToCommand(configKeys.formatPrefs),
    appendPrefixToCommand(configKeys.hintPrefs),
    appendPrefixToCommand(configKeys.importPrefs),
    appendPrefixToCommand(configKeys.runConfigVmOptions),
    appendPrefixToCommand(configKeys.runConfigCwd)
];

