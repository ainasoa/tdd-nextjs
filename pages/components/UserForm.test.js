import {
  fireEvent,
  render,
  screen,
  act,
  waitFor,
} from "@testing-library/react";
import UserForm from "./UserForm";
import { setupServer } from "msw/node";
import { rest } from "msw";

jest.mock("next/router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

const server = setupServer(
  rest.post("/api/user/new", async (req, res, ctx) => {
    const data = await req.json();
    return res(ctx.status(200), ctx.json(data));
  }),
  rest.put("/api/user/edit/:id", async (req, res, ctx) => {
    const data = await req.json();
    return res(ctx.status(201), ctx.json(data));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("new user...", async () => {
  render(<UserForm />);

  await act(() => {
    fireEvent.change(screen.getByTestId("fullName"), {
      target: { value: "new user" },
    });
    fireEvent.change(screen.getByTestId("age"), {
      target: { value: 50 },
    });
    fireEvent.change(screen.getByTestId("address"), {
      target: { value: "St Etienne" },
    });
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "new_user@gmail.com" },
    });
    fireEvent.click(screen.getByTestId("submit"));
  });

  expect(screen.getByTestId("form-title")).toHaveTextContent(/ajouter/i);

  await waitFor(() => {
    expect(screen.queryByTestId("report")).toBeInTheDocument();
    expect(screen.queryByTestId("report")).toHaveTextContent(/success/i);
  });
});

test("update user...", async () => {
  render(
    <UserForm
      user={{
        id: 1,
        fullName: "user1",
        age: 30,
        address: "address",
        email: "user1@gmail.com",
      }}
    />
  );

  await act(() => {
    fireEvent.change(screen.getByTestId("fullName"), {
      target: { value: "fullName1" },
    });
    fireEvent.change(screen.getByTestId("age"), {
      target: { value: 30 },
    });
    fireEvent.change(screen.getByTestId("address"), {
      target: { value: "Lyon 2" },
    });
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "user@gmail.com" },
    });
    fireEvent.click(screen.getByTestId("submit"));
  });

  expect(screen.getByTestId("form-title")).toHaveTextContent(/modifier/i);

  await waitFor(() => {
    expect(screen.queryByTestId("report")).toBeInTheDocument();
    expect(screen.queryByTestId("report")).toHaveTextContent(/success/i);
  });
});
