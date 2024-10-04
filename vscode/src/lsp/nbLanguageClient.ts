// import { LanguageClient, LanguageClientOptions, ServerOptions } from "vscode-languageclient/node";
// import { createTreeViewService, TreeViewService } from "../explorer";
// import { NbTestAdapter } from "../testAdapter";

// export class NbLanguageClient extends LanguageClient {
//     // private _treeViewService: TreeViewService;
//     private _testAdapterView: NbTestAdapter | undefined;

//     constructor(id: string, name: string, s: ServerOptions, c: LanguageClientOptions) {
//         super(id, name, s, c);
//         // this._treeViewService = createTreeViewService(this);
//     }

//     findTreeViewService(): TreeViewService {
//         return this._treeViewService;
//     }

//     getTestAdapterView(): NbTestAdapter | undefined {
//         return this._testAdapterView
//     }

//     intialized(): void {
//         this._testAdapterView = new NbTestAdapter();
//     }

//     stop(): Promise<void> {
//         if (this._testAdapterView) {
//             this._testAdapterView.dispose();
//             this._testAdapterView = undefined;
//         }

//         // stop will be called even in case of external close & client restart, so OK.
//         const r: Promise<void> = super.stop();
//         this._treeViewService.dispose();
//         return r;
//     }

// }