import { useQuery } from "@tanstack/react-query";
import { usePayload } from "./payload";

// export function useSingle(name: string) {
//   const { payload: strapi, locale } = usePayload();

//   return useQuery({
//     queryKey: ["strapi", "single", name, locale],
//     queryFn: async () => {
//       return await strapi.single(name).find({
//         locale,
//       });
//     },
//   });
// }

export function useCollectionList(name: string) {
  const { payload, locale } = usePayload();

  return useQuery({
    queryKey: ["payload", "collection", name, locale],
    queryFn: async () => {
      return await payload.find({
        collection: name,
        limit: 100, // TODO: implement pagination if needed
        locale,
      });
    },
  });
}

export function useCollectionSingle(name: string, id: string) {
  const { payload, locale } = usePayload();

  return useQuery({
    queryKey: ["payload", "collection", name, id, locale],
    queryFn: async () => {
      return await payload.findByID({
        collection: name,
        id,
      });
    },
  });
}
