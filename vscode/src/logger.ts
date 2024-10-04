import { OutputChannel, window } from "vscode";

export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

export class ExtensionLogger {
    private outChannel: OutputChannel;

    constructor(channelName: string) {
        this.outChannel = window.createOutputChannel(channelName);
    }

    public log(message: string, level: LogLevel = LogLevel.INFO): void {
        this.outChannel.appendLine(`[${level}]: ${message}`);
    }

    public warn(message: string): void {
        this.log(message, LogLevel.WARN);
    }

    public error(message: string): void {
        this.log(message, LogLevel.ERROR);
    }

    public logNoNL(message: string): void {
        this.outChannel.append(message);
    }

    public showOutputChannelUI(show: boolean): void {
        this.outChannel.show(show);
    }
    
    public getOutputChannel(): OutputChannel {
        return this.outChannel;
    }

    public dispose(): void {
        this.outChannel.dispose();
    }
}