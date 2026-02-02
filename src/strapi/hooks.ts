import { useQuery } from "@tanstack/react-query";
import { useStrapi } from "./strapi";

export function useSingle(name: string) {
  const { strapi, locale } = useStrapi();

  return useQuery({
    queryKey: ["strapi", "single", name, locale],
    queryFn: async () => {
      return await strapi.single(name).find({
        locale,
      });
    },
  });
}

export function useCollectionList(name: string) {
  const { strapi, locale } = useStrapi();

  return useQuery({
    queryKey: ["strapi", "collection", name, locale],
    queryFn: async () => {
      return await strapi.collection(name).find({
        locale,
      });
    },
  });
}

export function useCollectionSingle(name: string, id: string) {
  const { strapi, locale } = useStrapi();

  return useQuery({
    queryKey: ["strapi", "collection", name, id, locale],
    queryFn: async () => {
      return await strapi.collection(name).findOne(id);
    },
  });
}
