import createClient from "openapi-fetch";
import type { paths } from "../generated/notification-api";

export const client = createClient<paths>({ baseUrl: "/notifications" });
