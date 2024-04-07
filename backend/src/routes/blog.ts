import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import {createBlogInput,updateBlogInput} from "@devansh-rai/medium-zod/dist";

export const blogRouter = new Hono<{
    Bindings: {
        DATABASE_URL: string;
        JWT_SECRET: string;
    },
    Variables: {
        userId: string
    }
}>();

blogRouter.use(async (c, next) => {
    const authHeader = c.req.header("authorization") || "";
	console.log("hello");
    try {
        const user = await verify(authHeader, c.env.JWT_SECRET);
        if (user) {
            c.set("userId", user.id);
            await next();
        } else {
            return c.json({
				status: 403,
                message: "You are not logged in"
            })
        }
    } catch(e) {
        c.status(403);
        return c.json({
			status: 403,
			message: "You are not logged in"
		})
    }
});

blogRouter.post('/', async (c) => {
	const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	const body = await c.req.json();
	const {success} = createBlogInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({status:400, error: "invalid input" });
	}
	const post = await prisma.post.create({
		data: {
			title: body.title,
			content: body.content,
			authorId: userId
		}
	});
	return c.json({
		status : 200,
		id: post.id
	});
})

blogRouter.put('/', async (c) => {
	const userId = c.get('userId');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());

	const body = await c.req.json();
	const {success} = updateBlogInput.safeParse(body);
	if (!success) {
		c.status(400);
		return c.json({status:400, error: "invalid input" });
	}
	prisma.post.update({
		where: {
			id: body.id,
			authorId: userId
		},
		data: {
			title: body.title,
			content: body.content
		}
	});

	return c.text('updated post');
});

blogRouter.get('/bulk', async (c) => {
	// console.log("hello");
    const prisma = new PrismaClient({
        datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate())
    const blogs = await prisma.post.findMany({
        select: {
            content: true,
            title: true,
            id: true,
            author: {
                select: {
                    name: true
                }
            }
        }
    });
    return c.json({
		status:200,
        blogs: blogs
    })
})

blogRouter.get('/:id', async (c) => {
	const id = c.req.param('id');
	const prisma = new PrismaClient({
		datasourceUrl: c.env?.DATABASE_URL	,
	}).$extends(withAccelerate());
	// console.log("ehllo");
	try{
		const blog = await prisma.post.findUnique({
			where: {
				id:id
			},
			select: {
				id: true,
				title: true,
				content: true,
				author: {
					select: {
						name: true
					}
				}
			}
		});
		return c.json({
			status:200,
			blog:blog
		});
	}
	catch(e){
		console.log(e);
	}
})