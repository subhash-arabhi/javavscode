import { ConfigurationChangeEvent, workspace } from "vscode";
import { userConfigsListened } from "./configuration";
import { globalVars } from "../extension";

let timeout: NodeJS.Timeout | undefined = undefined;
export const configChangeListener = (params: ConfigurationChangeEvent) => {
        if (timeout) {
            return;
        }
        timeout = setTimeout(() => {
            timeout = undefined;
            userConfigsListened.forEach((config: string) => {
                const doesAffect = params.affectsConfiguration(config);
                if(doesAffect){
                    globalVars.clientPromise.restartExtension(globalVars.nbProcessManager, true);
                }
            })
        }, 0);
}