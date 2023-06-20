import "@testing-library/jest-dom/extend-expect";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Login from "./Login";
import { act } from "react-dom/test-utils";
import server from "../../mocks/server";

jest.mock("next-auth/react", () => {
  const originalModule = jest.requireActual("next-auth/react");
  const mockSession = {
    expires: new Date(Date.now() + 2 * 86400).toISOString(),
    user: { role: "ADMIN" },
  };
  return {
    __esModule: true,
    ...originalModule,
    signIn: jest.fn(),
    useSession: jest.fn(() => {
      return { data: mockSession, status: "authenticated" }; // return type is [] in v3 but changed to {} in v4
    }),
  };
});
jest.mock("next/router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("login init", async () => {
  render(<Login />);

  expect(screen.getByTestId("email").value).toBe("");
  expect(screen.getByTestId("password").value).toBe("");
  expect(screen.getByRole("button")).toBeDisabled();
  expect(screen.queryByTestId("report")).not.toBeInTheDocument();
});

test("login only password is empty", async () => {
  render(<Login />);

  const emailField = screen.getByTestId("email");
  const email = "user@gmail.com";

  await act(() => {
    fireEvent.change(emailField, { target: { value: email } });
  });

  expect(emailField.value).toBe(email);
  expect(screen.getByTestId("password").value).toBe("");
  expect(screen.getByRole("button")).toBeDisabled();
  expect(screen.queryByTestId("report")).not.toBeInTheDocument();
});

test("login only email is empty", async () => {
  render(<Login />);

  const passwordField = screen.getByTestId("password");
  const password = "*********";

  await act(() => {
    fireEvent.change(passwordField, { target: { value: password } });
  });

  expect(screen.getByTestId("email").value).toBe("");
  expect(passwordField.value).toBe(password);
  expect(screen.getByRole("button")).toBeDisabled();
  expect(screen.queryByTestId("report")).not.toBeInTheDocument();
});

describe("Login...", () => {
  it("login email and password are not empty", async () => {
    render(<Login />);
    const emailField = screen.getByTestId("email");
    const passwordField = screen.getByTestId("password");
    const submit = screen.getByRole("button");

    const email = "user@gmail.com";
    const password = "*********";

    act(() => {
      fireEvent.change(emailField, { target: { value: email } });
      fireEvent.change(passwordField, { target: { value: password } });
    });

    expect(emailField.value).toBe(email);
    expect(passwordField.value).toBe(password);
    expect(submit).not.toBeDisabled();

    fireEvent.click(submit);

    waitFor(() => {
      expect(screen.getByTestId("report")).toBeInTheDocument();
    });
  });
});

describe("Login function", () => {
  it("should display a success message for a successful login", () => {
    render(<Login />);

    // Simulate user input and submit the form
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "user@gmail.com" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "password" },
    });

    expect(screen.getByRole("button")).not.toBeDisabled();

    fireEvent.click(screen.getByRole("button"));

    // Wait for the success message to appear
    waitFor(() => {
      expect(screen.getByTestId("report")).toBeInTheDocument();
    });
  });

  it("should display an unauthorized message for an incorrect password", () => {
    render(<Login />);

    // Simulate user input and submit the form
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "user@gmail.com" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "incorrect" },
    });
    expect(screen.getByRole("button")).not.toBeDisabled();
    fireEvent.click(screen.getByRole("button"));

    // Wait for the unauthorized message to appear
    waitFor(() => {
      expect(screen.queryByTestId("report")).toBeInTheDocument();
    });
  });

  it("should display a server error message for a server error", () => {
    render(<Login />);

    // Simulate user input and submit the form
    fireEvent.change(screen.getByTestId("email"), {
      target: { value: "user@gmail.com" },
    });
    fireEvent.change(screen.getByTestId("password"), {
      target: { value: "error" },
    });
    expect(screen.getByRole("button")).not.toBeDisabled();
    fireEvent.click(screen.getByRole("button"));

    // // Wait for the server error message to appear
    waitFor(() => {
      expect(screen.queryByTestId("report")).toBeInTheDocument();
    });
  });
});
