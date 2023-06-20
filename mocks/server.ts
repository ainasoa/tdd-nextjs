import { rest } from "msw";
import { setupServer } from "msw/node";
import jwt from "jsonwebtoken";

export let data = [
  {
    id: 1,
    fullName: "user1",
    age: 30,
    address: "address",
    email: "user1@gmail.com",
  },
  {
    id: 2,
    fullName: "user2",
    age: 35,
    address: "address",
    email: "user2@gmail.com",
  },
  {
    id: 3,
    fullName: "user3",
    age: 29,
    address: "address",
    email: "user3@gmail.com",
  },
  {
    id: 4,
    fullName: "user4",
    age: 24,
    address: "address",
    email: "user4@gmail.com",
  },
];

function generateToken() {
  const payload = {
    userId: 123,
    username: "exampleuser",
  };

  const secret = "your_signing_secret";
  const expiresIn = "1h";

  return jwt.sign(payload, secret, { expiresIn });
}

const server = setupServer(
  rest.get("/api/users/sddfsf", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(data));
  }),
  rest.post("/api/user/add", async (req, res, ctx) => {
    console.log("add user ok");

    return res(ctx.status(200));
  }),
  rest.put("/api/user/edit/:id", async (req, res, ctx) => {
    console.log("edit user ok");
    const editedUser = await req.json();

    data = await data.map((user) =>
      user.id === editedUser.id ? editedUser : user
    );

    return res(ctx.status(200), ctx.json(editedUser));
  }),
  // rest.delete("/api/user/delete/:id", async (req, res, ctx) => {
  //   console.log(req.headers);
  //   const userId = Number(await req.params.id);
  //   console.log("delete ok");

  //   return res(ctx.status(204));
  // }),
  rest.post("/api/login", (req, res, ctx) => {
    const { email, password } = req.body as any;

    // Simulate different response statuses and edge cases
    if (email === "user@gmail.com" && password === "password") {
      return res(ctx.status(200), ctx.json({ message: "Login successful" }));
    } else if (email === "user@gmail.com" && password === "incorrect") {
      return res(ctx.status(401));
    } else if (email === "user@gmail.com" && password === "error") {
      return res(ctx.status(500));
    }
  }),
  rest.post(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/jwt/create/`,
    async (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          access: generateToken(),
          refresh: "mock-refresh-token",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user_id: 123,
          is_owner: true,
        })
      );
    }
  ),
  rest.post(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/jwt/refresh/`,
    async (req, res, ctx) => {
      console.log("data mocke refresh", req.json());

      const user = await req.json();
      return res(
        ctx.status(200),
        ctx.json({
          access: "mock-create-token",
          refresh: generateToken(),
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          user_id: 123,
          is_owner: true,
        })
      );
    }
  )
);

export default server;
