import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import { MockedProvider } from "@apollo/client/testing";
import LoginCard from "../../header/LoginCard";
import LOGIN_MUTATION from "../../../graphql/loginMutation";

const mockLoginSuccess = jest.fn();
const mockClose = jest.fn();

const renderLogin = (mocks = []) => {
  return render(
    <MockedProvider mocks={mocks} addTypename={false}>
      <LoginCard onClose={mockClose} onLoginSuccess={mockLoginSuccess} />
    </MockedProvider>
  );
};

describe("LoginCard", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form inputs and button", () => {
    renderLogin();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Log In/i })).toBeInTheDocument();
  });

  it("shows error for empty credentials", async () => {
    const mocks = [
      {
        request: {
          query: LOGIN_MUTATION,
          variables: { username: "", password: "" },
        },
        error: new Error("Invalid credentials"),
      },
    ];

    renderLogin(mocks);
    fireEvent.click(screen.getByRole("button", { name: /Log In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  it("calls login mutation and succeeds", async () => {
    const mocks = [
      {
        request: {
          query: LOGIN_MUTATION,
          variables: { username: "testuser", password: "correctpassword" },
        },
        result: {
          data: {
            loginUser: {
              success: true,
              user: {
                id: "1",
                username: "testuser",
                email: "testuser@example.com", 
              },
            },
          },
        },
      },
    ];

    renderLogin(mocks);

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "correctpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Log In/i }));

    await waitFor(() => {
      expect(mockLoginSuccess).toHaveBeenCalled();
      expect(mockClose).toHaveBeenCalled();
    });
  });

  it("shows error on incorrect credentials", async () => {
    const mocks = [
      {
        request: {
          query: LOGIN_MUTATION,
          variables: { username: "testuser", password: "wrongpassword" },
        },
        error: new Error("Invalid credentials"),
      },
    ];

    renderLogin(mocks);

    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Log In/i }));

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
      expect(mockLoginSuccess).not.toHaveBeenCalled();
    });
  });

  it("disables submit button while loading", async () => {
    const mocks = [
      {
        request: {
          query: LOGIN_MUTATION,
          variables: { username: "testuser", password: "correctpassword" },
        },
        result: {
          data: {
            loginUser: {
              success: true,
              user: {
                id: "1",
                username: "testuser",
                email: "testuser@example.com",
              },
            },
          },
        },
      },
    ];

    renderLogin(mocks);
    fireEvent.change(screen.getByLabelText(/Username/i), {
      target: { value: "testuser" },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: "correctpassword" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Log In/i }));

    expect(screen.getByRole("button", { name: /Logging In/i })).toBeDisabled();
  });
});
