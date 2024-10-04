import { commands } from "vscode";
import { LOGGER, NbLanguageClient } from "../extension";
import { LogLevel } from "../logger";
import { NbProcessManager } from "./nbProcessManager";
import { initializeServer } from "./initializer";

export class ClientPromise {
    setClient!: [(c: NbLanguageClient) => void, (err: any) => void];
    client!: Promise<NbLanguageClient>;
    activationPending!: boolean;
    
    public clientPromiseInitialization = (): void => {
        this.client = new Promise<NbLanguageClient>((clientOK, clientErr) => {
            this.setClient = [
                (c: NbLanguageClient) => {
                    clientOK(c);
                },
                (err: any) => {
                    clientErr(err);
                }
            ];
        });

        this.activationPending = true;
        commands.executeCommand('setContext', 'nbJdkReady', false);
    }

    public stopClient = async (): Promise<void> => {
        if (!this.client) {
            return Promise.resolve();
        }

        return (await this.client).stop();
    }

    public restartExtension = async (nbProcessManager: NbProcessManager, notifyKill: boolean) => {
        if (this.activationPending) {
            LOGGER.log("Server activation requested repeatedly, ignoring...", LogLevel.WARN);
            return;
        }
        try {
            await this.stopClient();
            await nbProcessManager.killProcess(notifyKill);
            // commands.executeCommand('setContext', 'nbJdkReady', false);
            // this.activationPending = true;
            this.clientPromiseInitialization();
            initializeServer();
            // doActivateWithJDK(specifiedJDK, context, notifyKill, setClient);
        } catch (error) {
            LOGGER.log(`Error during activation: ${error}`, LogLevel.ERROR);
            throw error;
        } finally {
            this.activationPending = false;
        }
    }

}