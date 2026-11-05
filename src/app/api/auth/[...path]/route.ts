import { getAuth } from "@/lib/auth/server";

type Ctx = { params: Promise<{ path: string[] }> };

export const GET = (req: Request, ctx: Ctx) => getAuth().handler().GET(req, ctx);
export const POST = (req: Request, ctx: Ctx) => getAuth().handler().POST(req, ctx);
