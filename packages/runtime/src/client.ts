
import LocalNode from './services/LocalNode.js';
import RemoteGateway from './services/RemoteGateway.js';
import RemoteRepository from './services/RemoteRepository.js';

let client: LocalNode | undefined = undefined;
const resolvers: ((client: LocalNode) => void)[] = [];

export async function startClient(remoteUrl: string, segmentNames: string[] = [], middlewares: string[] = []): Promise<LocalNode>
{
    const repository = new RemoteRepository(remoteUrl);
    const gateway = new RemoteGateway(remoteUrl);

    const node = new LocalNode(repository, gateway);
    node.segmentNames = new Set(segmentNames);
    node.middlewareFiles = new Set(middlewares);
    
    await node.start();
    
    client = node;

    resolvers.forEach((resolve) => resolve(node));
    resolvers.length = 0;

    return node;
}

export async function getClient(): Promise<LocalNode>
{
    if (client === undefined)
    {
        return new Promise((resolve) =>
        {
            resolvers.push(resolve);
        });
    }

    return client;
}
