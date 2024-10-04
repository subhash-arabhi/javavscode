import { configKeys } from "../configurations/configuration"
import { getConfigurationValue, isDarkColorThemeHandler, jdkHomeValueHandler, lspServerVmOptionsHandler, projectSearchRootsValueHandler, userdirHandler } from "../configurations/handlers";
import { l10n } from "../localiser";
import { userDefinedLaunchOptionsType } from "./types"

export const userConfigLaunchOptionsDefaults: userDefinedLaunchOptionsType = {
    [configKeys.verbose]: {
        value: getConfigurationValue(configKeys.verbose, false),
        optionToPass: '-J-Dnetbeans.logger.console='
    },
    [configKeys.jdkHome]: {
        value: jdkHomeValueHandler(),
        optionToPass: ['--jdkhome']
    },
    [configKeys.disableProjSearchLimit]: {
        value: projectSearchRootsValueHandler(),
        optionToPass: '-J-Dproject.limitScanRoot='
    },
    [configKeys.vscodeTheme]: {
        value: isDarkColorThemeHandler() ? 'com.formdev.flatlaf.FlatDarkLaf' : null,
        optionToPass: ['--laf']
    },
    [configKeys.userdir]: {
        value: userdirHandler(),
        optionToPass: ['--userdir']
    },
    [configKeys.lspVmOptions]: {
        value: lspServerVmOptionsHandler()
    }
};

const extraLaunchOptions = ["--modules",
    "--list",
    "-J-XX:PerfMaxStringConstLength=10240",
    "--locale", l10n.nbLocaleCode(),
    "--start-java-language-server=listen-hash:0",
    "--start-java-debug-adapter-server=listen-hash:0"];

const prepareUserConfigLaunchOptions = (): string[] => {
    const launchOptions: string[] = [];

    Object.values(userConfigLaunchOptionsDefaults).forEach(userConfig => {
        const { value, optionToPass } = userConfig;
        if (value) {
            if (!optionToPass && Array.isArray(value)) {
                launchOptions.push(...value);
            }
            else if (typeof (optionToPass) === "string") {
                launchOptions.push(`${optionToPass}${value}`);
            } else if (Array.isArray(optionToPass)) {
                const arg: string[] = [optionToPass, value];
                launchOptions.push(...arg);
            }
        }
    });

    return launchOptions;
}

export const prepareNbcodeLaunchOptions = (): string[] => {
    const nbcodeLaunchOptions = [];

    const userConfigLaunchOptions = prepareUserConfigLaunchOptions();
    nbcodeLaunchOptions.push(...userConfigLaunchOptions, ...extraLaunchOptions);

    return nbcodeLaunchOptions;
}