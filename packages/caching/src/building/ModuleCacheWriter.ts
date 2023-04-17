
import { FileManager, convertToLocalFilename, convertToRemoteFilename } from '@jitar/runtime';

import ModuleCache from './models/ModuleCache.js';
import Module from './models/Module.js';
import SegmentModule from './models/SegmentModule.js';

import ImportRewriter from './utils/ImportRewriter.js';
import RemoteBuilder from './utils/RemoteBuilder.js';

const importRewriter = new ImportRewriter();
const remoteBuilder = new RemoteBuilder();

export default class ModuleCacheWriter
{
    #fileManager: FileManager;

    constructor(fileManager: FileManager)
    {
        this.#fileManager = fileManager;
    }

    async write(cache: ModuleCache): Promise<void>
    {
        return Promise.all([
            this.#writeOriginal(cache),
            this.#writeLocal(cache),
            this.#writeRemote(cache)
        ]).then(() => undefined);
    }

    async #writeOriginal(cache: ModuleCache): Promise<void>
    {
        // The original module files will be loaded in standalone mode.
        // These require the rewrite of application imports (assure they end with .js)
        // and the addition of the source locations.

        const importCode = this.#rewriteApplicationImports(cache.module);
        const sourceCode = this.#createSourceCode(cache.module);

        const filename = cache.module.filename;
        const code = `${importCode}\n${sourceCode}`;

        return this.#fileManager.write(filename, code.trim());
    }

    async #writeLocal(cache: ModuleCache): Promise<void>
    {
        // The local module files will be loaded in distributed mode.
        // These require both the rewrite of imports and the addition of the source locations.

        const importCode = this.#rewriteAllImports(cache.module);
        const sourceCode = this.#createSourceCode(cache.module);

        const filename = convertToLocalFilename(cache.module.filename);
        const code = `${importCode}\n${sourceCode}`;

        return this.#fileManager.write(filename, code.trim());
    }

    #rewriteApplicationImports(module: Module): string
    {
        return importRewriter.rewrite(module.code, false);
    }

    #rewriteAllImports(module: Module): string
    {
        return importRewriter.rewrite(module.code, true);
    }

    #createSourceCode(module: Module): string
    {
        const filename = module.filename;
        const classes = module.content.exportedClasses;
        const classNames = classes.map(clazz => clazz.name);
        const sourceCode = classNames.map(className => `${className}.source = "${filename}";`);

        return sourceCode.join('\n');
    }

    async #writeRemote(cache: ModuleCache): Promise<void>
    {
        // The remote module files will be loaded in distributed mode.
        // These only have to call the global runProcedure(...) function.

        if (cache.segment === undefined)
        {
            return;
        }

        const filename = convertToRemoteFilename(cache.module.filename);
        const code = this.#createRemoteCode(cache.segment);

        return this.#fileManager.write(filename, code.trim());
    }

    #createRemoteCode(module: SegmentModule): string
    {
        return remoteBuilder.build(module);
    }
}
