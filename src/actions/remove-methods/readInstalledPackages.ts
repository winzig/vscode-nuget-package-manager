'use strict';
import * as fs from 'fs';
import { parseString } from 'xml2js';

import { handleError } from '../../utils';
import { emptyObject, emptyArray } from '../../constants';

export default function readInstalledPackages(csprojFullPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
        fs.readFile(csprojFullPath, 'utf8', (err, data) => {
            if (err) {
                return handleError(
                    err,
                    `Could not read your project's .csproj file (checked ${csprojFullPath}). Please try again.`,
                    reject
                );
            }

            parseString(data, (err, parsed: any = emptyObject) => {
                if (err) {
                    return handleError(
                        err,
                        `Could not parse the csproj file at ${csprojFullPath}. Please try again.`,
                        reject
                    );
                }

                const project = parsed.Project || emptyObject;
                const itemGroup = project.ItemGroup || emptyArray;
                const packageRefSection = itemGroup.find((group) => group.PackageReference);

                if (!packageRefSection || !packageRefSection.PackageReference.length) {
                    return reject(`Could not locate package references in ${csprojFullPath}. Please try again.`);
                }
            
                const installedPackages = packageRefSection.PackageReference.map((ref) => `${ref.$.Include} ${ref.$.Version}`);

                return resolve({ installedPackages, packageRefSection, parsed });
            });
        });
    });
}