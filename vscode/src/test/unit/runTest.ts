/*
  Copyright (c) 2023-2024, Oracle and/or its affiliates.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

     https://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import * as Mocha from 'mocha';
import { glob } from 'glob';
import * as path from 'path';
import { initMocks } from './mocks/init';

const mocha = new Mocha({
    ui: 'tdd',
    color: true,
    timeout: 600 * 1000
});


const testRunner = async (modules: string[] = []) => {
    return new Promise<void>(async (c, e) => {
        try {
            const unitTestFilePaths = await glob('**/**.unit.test.js', { cwd: __dirname })
            
            unitTestFilePaths.forEach(f => {
                if (!modules.length) {
                    mocha.addFile(path.resolve(__dirname, f));
                } else if (modules.includes(f.split('.')[0])) {
                    mocha.addFile(path.resolve(__dirname, f));
                }
            });
            mocha.run(failures => {
                if (failures > 0) {
                    e(new Error(`${failures} tests failed.`));
                } else {
                    c();
                }
            });
        } catch (error) {
            console.error(error);
            e(error);
        }
    });
}

try {
    const args = process.argv.slice(2);
    if (args.length) {
        console.log(`Running unit tests for following speicified modules: ${args.map(el => el)}`);
    }
    initMocks();
    testRunner(args);
} catch (err: any) {
    console.error("Exception occurred while running tests");
    console.error(err?.message || "");
}