import type {
  DefaultNodeTypes,
  SerializedUploadNode,
} from "@payloadcms/richtext-lexical";
import {
  type JSXConvertersFunction,
  RichText,
} from "@payloadcms/richtext-lexical/react";
import { createFileRoute } from "@tanstack/react-router";
import { useSetAtom } from "jotai";
import { pageTitleAtom } from "../../pageState";
import { useCollectionSingle } from "../../strapi/hooks";

type NodeTypes = DefaultNodeTypes;

// Custom upload converter component that uses next/image
const CustomUploadComponent: React.FC<{
  node: SerializedUploadNode;
}> = ({ node }) => {
  console.log(node);
  if (node.relationTo === "media") {
    const uploadDoc = node.value;
    if (typeof uploadDoc !== "object") {
      return null;
    }
    const { alt, caption, height, url, width } = uploadDoc;
    return (
      <figure>
        <img
          alt={alt}
          width={width}
          height={height}
          src={url}
          className="test"
        />
        {caption.trim() && <figcaption>{caption.trim()}</figcaption>}
      </figure>
    );
  }

  return null;
};

const jsxConverters: JSXConvertersFunction<NodeTypes> = ({
  defaultConverters,
}) => ({
  ...defaultConverters,
  // Override the default upload converter
  upload: ({ node }) => {
    return <CustomUploadComponent node={node} />;
  },
});

export const Route = createFileRoute("/_app/info/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  const { data, isLoading } = useCollectionSingle("info-page", id);

  const setPageTitle = useSetAtom(pageTitleAtom);
  setPageTitle(data?.title);

  if (isLoading) {
    return "Loading...";
  }

  if (!data) {
    return "Something went wrong while loading the content";
  }

  return (
    <div className="h-full p-4 bg-white">
      <div className="prose prose-scoutblue pt-2">
        <h1>{data.title}</h1>
        {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
        <RichText data={data.content} converters={jsxConverters} />
      </div>
    </div>
  );
}
