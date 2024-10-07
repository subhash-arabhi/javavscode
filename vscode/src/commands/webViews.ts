import { JdkDownloaderView } from "../jdkDownloader/view";
import { extCommands } from "./commands";
import { ICommand } from "./types";

const invokeDownloadJdkWebview = async () => {
    const jdkDownloaderView = new JdkDownloaderView();
    jdkDownloaderView.createView();
}


export const registerWebviewCommands: ICommand[] = [{
    command: extCommands.downloadJdk,
    handler: invokeDownloadJdkWebview
}];
