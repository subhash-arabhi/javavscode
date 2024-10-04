import { ExtensionContext } from "vscode";

export class ExtensionInfo {
    constructor(private context: ExtensionContext){}

    getGlobalStorage = () => this.context.globalStorageUri;
    getWorkspaceStorage = () => this.context.storageUri;
    getExtensionStoragePath = () => this.context.extensionPath;
}