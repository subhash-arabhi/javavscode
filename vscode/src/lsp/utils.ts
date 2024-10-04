import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { globalVars, LOGGER } from '../extension';
import { TextDocumentFilter } from 'vscode-languageclient';
import { extensions } from 'vscode';
import { extConstants } from '../constants';

export const enableDisableModules = (
    extensionPath: string,
    userDir: string,
    modules: string[],
    enable: boolean) => {
    for (var i = 0; i < modules.length; i++) {
        const module = modules[i];
        const moduleXml: string = module.replace(/\./g, "-") + ".xml";
        var xmlContent: string = "";
        const clusters: string[] = fs.readdirSync(path.join(extensionPath, "nbcode"));
        for (var c = 0; c < clusters.length; c++) {
            const sourceXmlPath: string = path.join(extensionPath, "nbcode", clusters[c], "config", "Modules", moduleXml);
            if (fs.existsSync(sourceXmlPath)) {
                xmlContent = fs.readFileSync(sourceXmlPath).toString();
            }
        }
        xmlContent = xmlContent.replace(`<param name="enabled">${!enable}</param>`, `<param name="enabled">${enable}</param>`);
        fs.mkdirSync(path.join(userDir, "config", "Modules"), { recursive: true });
        fs.writeFileSync(path.join(userDir, "config", "Modules", moduleXml), xmlContent);
    }
}

export const findNbcode = (extensionPath: string): string => {
    let nbcode = os.platform() === 'win32' ?
        os.arch() === 'x64' ? 'nbcode64.exe' : 'nbcode.exe'
        : 'nbcode.sh';
    let nbcodePath = path.join(extensionPath, "nbcode", "bin", nbcode);

    let nbcodePerm = fs.statSync(nbcodePath);
    if (!nbcodePerm.isFile()) {
        throw `Cannot execute ${nbcodePath}`;
    }
    if (os.platform() !== 'win32') {
        fs.chmodSync(path.join(extensionPath, "nbcode", "bin", nbcode), "744");
        fs.chmodSync(path.join(extensionPath, "nbcode", "platform", "lib", "nbexec.sh"), "744");
        fs.chmodSync(path.join(extensionPath, "nbcode", "java", "maven", "bin", "mvn.sh"), "744");
    }
    return nbcodePath;
}

export function collectDocumentSelectors(): TextDocumentFilter[] {
    const selectors = [];
    for (const extension of extensions.all) {
        const contributesSection = extension.packageJSON['contributes'];
        if (contributesSection) {
            const documentSelectors = contributesSection['netbeans.documentSelectors'];
            if (Array.isArray(documentSelectors) && documentSelectors.length) {
                selectors.push(...documentSelectors);
            }
        }
    }
    return selectors;
}


export const restartWithJDKLater = (time: number, notifyKill: boolean): void => {
    LOGGER.log(`Restart of ${extConstants.SERVER_NAME} requested in ${time / 1000} s.`);
    const nbProcessManager = globalVars.nbProcessManager;
    
    setTimeout(() =>  globalVars.clientPromise.restartExtension(nbProcessManager, notifyKill), time);
};