import { ExtensionInfo } from "./extensionInfo"
import { ClientPromise } from "./lsp/clientPromise"

export type globalVarsDictType = {
    extensionInfo: ExtensionInfo | undefined,
    clientPromise: ClientPromise | undefined,
    debugPort: number,
    debugHash: string | undefined,
    deactivated: boolean
}
