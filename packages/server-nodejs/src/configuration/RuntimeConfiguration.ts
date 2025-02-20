
import { z } from 'zod';

import GatewayConfiguration, { gatewaySchema } from './GatewayConfiguration.js';
import NodeConfiguration, { nodeSchema } from './NodeConfiguration.js';
import ProxyConfiguration, { proxySchema } from './ProxyConfiguration.js';
import RepositoryConfiguration, { repositorySchema } from './RepositoryConfiguration.js';
import StandaloneConfiguration, { standaloneSchema } from './StandaloneConfiguration.js';

export const runtimeSchema = z
    .object({
        url: z.string().optional(),
        setUp: z.array(z.string()).optional(),
        tearDown: z.array(z.string()).optional(),
        healthChecks: z.array(z.string()).optional(),
        standalone: standaloneSchema.optional(),
        repository: repositorySchema.optional(),
        gateway: gatewaySchema.optional(),
        node: nodeSchema.optional(),
        proxy: proxySchema.optional()
    })
    .strict()
    .transform((value) => new RuntimeConfiguration(value.url, value.setUp, value.tearDown, value.healthChecks, value.standalone, value.repository, value.gateway, value.node, value.proxy));

export default class RuntimeConfiguration
{
    #url?: string;
    #setUp?: string[];
    #tearDown?: string[];
    #healthChecks?: string[];
    #standalone?: StandaloneConfiguration;
    #repository?: RepositoryConfiguration;
    #gateway?: GatewayConfiguration;
    #node?: NodeConfiguration;
    #proxy?: ProxyConfiguration;

    constructor(url?: string, setUp?: string[], tearDown?: string[], healthChecks?: string[], standalone?: StandaloneConfiguration, repository?: RepositoryConfiguration, gateway?: GatewayConfiguration, node?: NodeConfiguration, proxy?: ProxyConfiguration)
    {
        this.#url = url;
        this.#setUp = setUp;
        this.#tearDown = tearDown;
        this.#healthChecks = healthChecks;
        this.#standalone = standalone;
        this.#repository = repository;
        this.#gateway = gateway;
        this.#node = node;
        this.#proxy = proxy;
    }

    get url() { return this.#url; }

    get setUp() { return this.#setUp; }

    get tearDown() { return this.#tearDown; }

    get healthChecks() { return this.#healthChecks; }

    get standalone() { return this.#standalone; }

    get repository() { return this.#repository; }

    get gateway() { return this.#gateway; }

    get node() { return this.#node; }

    get proxy() { return this.#proxy; }
}
