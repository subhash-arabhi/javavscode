export const COMMAND_PREFIX = 'jdk';

const appendPrefixToCommand = (command: string) => `${COMMAND_PREFIX}.${command}`;

export const extCommands = {
    configureRunSettings: appendPrefixToCommand('workspace.configureRunSettings'),
    newFromTemplate : appendPrefixToCommand('workspace.new'),
    newProject: appendPrefixToCommand('workspace.newproject'),
    openTest: appendPrefixToCommand('open.test'),
    deleteCache: appendPrefixToCommand('delete.cache'),
    downloadJdk: appendPrefixToCommand('download.jdk'),
    compileWorkspace: appendPrefixToCommand('workspace.compile'),
    cleanWorkspace: appendPrefixToCommand('workspace.clean'),
    compileProject: appendPrefixToCommand('project.compile'),
    cleanProject: appendPrefixToCommand('project.clean'),
    openType: appendPrefixToCommand('open.type'),
    goToSuperImpl: appendPrefixToCommand('java.goto.super.implementation'),
    renameElement: appendPrefixToCommand('rename.element.at'),
    surroundWith: appendPrefixToCommand('surround.with'),
    generateCode: appendPrefixToCommand('generate.code'),
    runTest: appendPrefixToCommand('run.test'),
    debugTest: appendPrefixToCommand('debug.test'),
    runSingle: appendPrefixToCommand('run.single'),
    debugSingle: appendPrefixToCommand('debug.single'),
    projectRun: appendPrefixToCommand('project.run'),
    projectDebug: appendPrefixToCommand('project.debug'),
    projectTest: appendPrefixToCommand('project.test'),
    packageTest: appendPrefixToCommand('package.test'),
    openStackTrace: appendPrefixToCommand('open.stacktrace'),
    workspaceSymbols: appendPrefixToCommand('workspace.symbols'),
    abstractMethodsComplete: appendPrefixToCommand('java.complete.abstract.methods'),
    startupCondition: appendPrefixToCommand('startup.condition'),
    nbEventListener: appendPrefixToCommand('addEventListener'),
    editNodeProps: appendPrefixToCommand('node.properties.edit'),
    selectEditorProjs: appendPrefixToCommand('select.editor.projects'),
    attachDebugger: appendPrefixToCommand("java.attachDebugger.connector"),
    startDebug: 'workbench.action.debug.start',
}

export const builtInCommands = {
    setCustomContext: 'setContext',
    openFolder: 'vscode.openFolder',
    reloadWindow: 'workbench.action.reloadWindow',
    focusActiveEditorGroup: 'workbench.action.focusActiveEditorGroup',
    goToEditorLocations: 'editor.action.goToLocations',
    renameSymbol: 'editor.action.rename',
    quickAccess: 'workbench.action.quickOpen',
    openSettings: 'workbench.action.openSettings'
}

export const nbCommands = {
    newFromTemplate: appendPrefixToCommand('new.from.template'),
    newProject: appendPrefixToCommand('new.project'),
    goToTest: appendPrefixToCommand('go.to.test'),
    quickOpen: appendPrefixToCommand('quick.open'),
    superImpl: appendPrefixToCommand('java.super.implementation'),
    resolveStackLocation: appendPrefixToCommand('resolve.stacktrace.location'),
    implementAbstractMethods: appendPrefixToCommand('java.implement.all.abstract.methods'),
    archiveFileContent: appendPrefixToCommand('get.archive.file.content'),
    htmlProcessCmd: appendPrefixToCommand('htmlui.process.command'),
    projectConfigurations: appendPrefixToCommand('project.configurations'),
    debuggerConfigurations: appendPrefixToCommand('java.attachDebugger.configurations'),
    runProject: appendPrefixToCommand('project.run.action'),
    buildWorkspace: appendPrefixToCommand('build.workspace'),
    cleanWorkspace: appendPrefixToCommand('clean.workspace')
}

export const configurations = {
    jdkHome: 'jdkhome',
    projectJdkHome: 'project.jdkhome',
    verbose: 'verbose',
    userDir: 'userdir',
    revealActiveInProjects: 'revealActiveInProjects',
    enableShortcutsTest: 'test.editor.enableShortcuts',
    javadocLoadTimeout: 'javadoc.load.timeout',
    formatPrefs: 'format.settingsPath',
    hintPrefs: 'hints.preferences',
    organizeImportsOnSave: 'java.onSave.organizeImports',
    importGroups: 'java.imports.groups',
    countForUsingStarImport: 'java.imports.countForUsingStarImport',
    countForUsingStaticStarImport: 'java.imports.countForUsingStaticStarImport',
    runConfigArgs: 'runConfig.arguments',
    runConfigVmOptions: 'runConfig.vmOptions',
    runConfigEnv: 'runConfig.env',
    runConfigCwd: 'runConfig.cwd',
    lspVmOptions: 'serverVmOptions',
    disableNbJavac: 'advanced.disable.nbjavac',
    disableProjSearchLimit: 'advanced.disable.projectSearchLimit'
}