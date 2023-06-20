import {
  fireEvent,
  render,
  renderHook,
  screen,
  waitFor,
} from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { rest } from "msw";
import { setupServer } from "msw/node";
import UserListPage from "./UserListPage";
import { useSession } from "next-auth/react";

const server = setupServer(
  rest.get("/api/users", (req, res, ctx) => {
    return res(
      ctx.json([
        {
          id: 2,
          fullName: "user2",
          age: 3555555,
          address: "address",
          email: "user2@gmail.com",
        },
        {
          id: 1,
          fullName: "user1",
          age: 30,
          address: "address",
          email: "user1@gmail.com",
        },
      ])
    );
  }),
  rest.delete("/api/user/delete/:id", (req, res, ctx) => {
    // headers, Authorisation(JWT   QDSFSQDFQ)
    // si existe et valide et ADMIN => 204
    // existe et valide et USER 403
    // existe et invalide 401
    // inexiste : 401

    const auth = req.headers?.get("Authorization");

    if (auth) {
      switch (auth) {
        case "JWT ADMIN":
          return res(ctx.status(204));
        case "JWT USER":
          return res(ctx.status(403));
        case "JWT INVALID":
          return res(ctx.status(401));
        default:
          return;
      }
    }

    return res(ctx.status(401));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

jest.mock("next/link", () => {
  return ({ children, ...props }) => {
    const { href } = props;
    const onClick = (e) => {
      e.preventDefault();
      if (props.onClick) {
        props.onClick();
      }
    };

    return (
      <a href={href} data-testid={props["data-testid"]} onClick={onClick}>
        {children}
      </a>
    );
  };
});
jest.mock("next-auth/react", () => ({
  useSession: jest.fn(),
}));

test("user list", async () => {
  const session = {
    data: {
      accessToken: "JWT ADMIN",
      refreshToken: "",
      expires_at: new Date(Date.now() + 2 * 86400).toISOString(),
      user_id: 2,
      is_owner: true,
      user: { role: "ADMIN" },
    },
    status: "authenticated",
  };

  useSession.mockReturnValue(session);

  const { result } = renderHook(() => useSession());

  expect(result.current).toEqual(session);

  render(<UserListPage />);

  await waitFor(() => {
    expect(screen.queryByTestId("goto-edituser-1")).toBeInTheDocument();
    expect(screen.queryByTestId("goto-edituser-2")).toBeInTheDocument();
    expect(screen.getByText("user2")).toBeInTheDocument();
    expect(screen.getByText(/user1@gmail.com/i)).toBeInTheDocument();
  });

  act(() => {
    fireEvent.click(screen.getByTestId("goto-edituser-1"));
  });
});

test("if user is ADMIN then user should be deleted successfully", async () => {
  const session = {
    data: {
      accessToken: "JWT ADMIN",
      refreshToken: "",
      expires_at: new Date(Date.now() + 2 * 86400).toISOString(),
      user_id: 2,
      is_owner: true,
      user: { role: "ADMIN" },
    },
    status: "authenticated",
  };
  useSession.mockReturnValue(session);

  const { result } = renderHook(() => useSession());

  expect(result.current).toEqual(session);

  render(<UserListPage />);

  await waitFor(() => {
    expect(screen.queryByTestId("delete-user-1")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByTestId("delete-user-1"));
    });
  });

  await waitFor(() => {
    expect(screen.queryByTestId("report")).toBeInTheDocument();
    expect(screen.getByTestId("report")).toHaveTextContent(/deleted/i);
  });
});

test("if user is not ADMIN, it should be unauthorized", async () => {
  const session = {
    data: {
      accessToken: "JWT USER",
      refreshToken: "JWT ",
      expires_at: new Date(Date.now() + 2 * 86400).toISOString(),
      user_id: 2,
      is_owner: true,
      user: { role: "USER" },
    },
    status: "authenticated",
  };
  // Set the return value for the mocked useSession hook
  useSession.mockReturnValue(session);

  render(<UserListPage />);

  await waitFor(() => {
    expect(screen.queryByTestId("delete-user-1")).not.toBeInTheDocument();
  });
});

test("if token is INVALID", async () => {
  const session = {
    data: {
      accessToken: "JWT INVALID",
      refreshToken: "JWT ",
      expires_at: new Date(Date.now() + 2 * 86400).toISOString(),
      user_id: 2,
      is_owner: true,
      user: { role: "ADMIN" },
    },
    status: "authenticated",
  };
  // Set the return value for the mocked useSession hook
  useSession.mockReturnValue(session);

  render(<UserListPage />);

  await waitFor(() => {
    expect(screen.queryByTestId("delete-user-1")).toBeInTheDocument();
    act(() => {
      fireEvent.click(screen.queryByTestId("delete-user-1"));
    });
  });

  await waitFor(() => {
    expect(screen.queryByTestId("report")).toBeInTheDocument();
    expect(screen.queryByTestId("report")).toHaveTextContent(
      /token undefined/i
    );
  });
});

test("if header is undefined", async () => {
  const session = {
    data: {
      accessToken: "",
      refreshToken: "",
      expires_at: new Date(Date.now() + 2 * 86400).toISOString(),
      user_id: 2,
      is_owner: true,
      user: { role: "ADMIN" },
    },
    status: "authenticated",
  };
  // Set the return value for the mocked useSession hook
  useSession.mockReturnValue(session);

  render(<UserListPage />);

  await waitFor(() => {
    expect(screen.queryByTestId("delete-user-1")).toBeInTheDocument();

    act(() => {
      fireEvent.click(screen.getByTestId("delete-user-1"));
    });
  });

  await waitFor(() => {
    const reportElement = screen.getByTestId("report");
    expect(reportElement).toHaveTextContent(/token undefined/i);
  });
});
