import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import {signupInput, signinInput} from "@devansh-rai/medium-zod/dist";

export const userRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    }
}>();

userRouter.post('/signup', async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const body = await c.req.json();

    const answer = signupInput.safeParse(body);
    // console.log(c.req);
    if (!answer.success) {
        c.status(400);
        // console.log(answer.error);
        return c.json({ error: "invalid input" });
    }
    
    const userExist = await prisma.user.findUnique({
        where: {
            email: body.email
        }
    });

    if(userExist) {
        return c.json({status:403, error: "user already exists" });
    }

    try{
        const user = await prisma.user.create({
          data: {
            email: body.email,
            password: body.password,
            name: body.name
          },
        });
        const jwt = await sign({ id: user.id }, c.env.JWT_SECRET)
        return c.json({status:200,token:jwt})
    }
    catch(e){
        console.log(e);
        return c.json({ error: "error creating user" });
    }
})

userRouter.post('/signin', async (c) => {
    const prisma = new PrismaClient({
    //@ts-ignore
        datasourceUrl: c.env?.DATABASE_URL	,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const {success} = signinInput.safeParse(body);

    if (!success) {
        c.status(400);
        return c.json({ error: "invalid input" });
    }

    const user = await prisma.user.findUnique({
        where: {
            email: body.email,
            password: body.password
        }
    });

    if (!user) {
        c.status(403);
        return c.json({ error: "user not found" });
    }

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({status:200,token: jwt });
})