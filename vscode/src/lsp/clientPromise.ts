import { commands } from "vscode";
import { globalVars, LOGGER } from "../extension";
import { LogLevel } from "../logger";
import { NbProcessManager } from "./nbProcessManager";
import { initializeServer } from "./initializer";
import { NbLanguageClient } from "./nbLanguageClient";

export class ClientPromise {
    setClient!: [(c: NbLanguageClient) => void, (err: any) => void];
    client!: Promise<NbLanguageClient>;
    activationPending!: boolean;
    initialPromiseResolved: boolean = false;

    public clientPromiseInitialization = (): void => {
        this.client = new Promise<NbLanguageClient>((clientOK, clientErr) => {
            this.setClient = [
                (c: NbLanguageClient) => {
                    this.initialPromiseResolved = true;
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
        if (globalVars.testAdapter) {
            globalVars.testAdapter.dispose();
            globalVars.testAdapter = undefined;
        }
        if (!this.client) {
            return Promise.resolve();
        }

        return (await this.client).stop();
    }

    public restartExtension = async (nbProcessManager: NbProcessManager | null, notifyKill: boolean) => {
        if (this.activationPending) {
            LOGGER.log("Server activation requested repeatedly, ignoring...", LogLevel.WARN);
            return;
        }
        if (!nbProcessManager) {
            LOGGER.log("Nbcode Process is null", LogLevel.ERROR);
            return;
        }
        try {
            await this.stopClient();
            await nbProcessManager.killProcess(notifyKill);
            this.clientPromiseInitialization();
            initializeServer();
        } catch (error) {
            LOGGER.log(`Error during activation: ${error}`, LogLevel.ERROR);
            throw error;
        } finally {
            this.activationPending = false;
        }
    }

}