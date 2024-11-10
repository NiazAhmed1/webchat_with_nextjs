import { ragChat } from "../lib/rag-chat";
import { redis } from "../lib/redis";
import { useRouter } from 'next/router';

interface PageProps {
    params: {
        url?: string | string[];
    };
}

function reconstructUrl({ url }: { url: string[] }) {
    const decodedComponents = url.map((component) => decodeURIComponent(component));
    return decodedComponents.join("//");
}

const Page = async ({ params }: PageProps) => {
    // Check if params and params.url are defined
    if (!params || !params.url) {
        return <p>Error: No URL provided</p>;
    }

    // Ensure `url` is an array; if it’s a single string, convert it to an array with one element
    const urlArray = Array.isArray(params.url) ? params.url : [params.url];
    const reconstructedUrl = reconstructUrl({ url: urlArray });
    
    // Check if the URL has been indexed in Redis
    const isAlreadyIndexed = await redis.sismember("indexed-urls", reconstructedUrl);
    
    if (!isAlreadyIndexed) {
        await ragChat.context.add({
            type: "html",
            source: reconstructedUrl,
            config: { chunkOverlap: 50, chunkSize: 200 }
        });

        await redis.sadd("indexed-urls", reconstructedUrl);
    }

    return <p>hello</p>;
};

export default Page;
