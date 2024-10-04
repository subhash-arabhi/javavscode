import { Disposable, ExtensionContext } from "vscode";

export class ExtensionInfo {
    constructor(private context: ExtensionContext){}

    getGlobalStorage = () => this.context.globalStorageUri;
    getWorkspaceStorage = () => this.context.storageUri;
    getExtensionStorageUri = () => this.context.extensionUri;
    pushSubscription = (listener: Disposable) => this.context.subscriptions.push(listener);
}