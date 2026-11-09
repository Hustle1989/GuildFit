import { getAuth } from "@/lib/auth/server";

// Proxies every Better Auth call from the browser to this branch's Neon Auth.
type Ctx = { params: Promise<{ path: string[] }> };

export const GET = (req: Request, ctx: Ctx) => getAuth().handler().GET(req, ctx);
export const POST = (req: Request, ctx: Ctx) => getAuth().handler().POST(req, ctx);
export const PUT = (req: Request, ctx: Ctx) => getAuth().handler().PUT(req, ctx);
export const PATCH = (req: Request, ctx: Ctx) => getAuth().handler().PATCH(req, ctx);
export const DELETE = (req: Request, ctx: Ctx) => getAuth().handler().DELETE(req, ctx);
